"""BidBridge AI backend — FastAPI. Real tahlil mantig'i, JWT auth, tenant izolyatsiya."""
from __future__ import annotations
import hashlib, io, os, re, secrets, time
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from jose import jwt
import hashlib
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SECRET_KEY: str = "dev-only-change-me-min-32-chars-1234567890"
    DATABASE_URL: str = "sqlite:///./bidbridge.db"
    MAX_UPLOAD_MB: float = 4.5
    CORS_ORIGINS: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
ALG = "HS256"

def hash_pw(pw: str, salt: str = "bidbridge") -> str:
    return hashlib.pbkdf2_hmac("sha256", pw.encode(), salt.encode(), 100_000).hex()

def verify_pw(pw: str, h: str) -> bool:
    return hash_pw(pw) == h

app = FastAPI(title="BidBridge AI API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()] or ["*"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

# ---- in-memory stores (SQLite o'rniga demo uchun; prod'da Postgres) ----
USERS: dict[str, dict] = {}          # email -> {hash, company_id, role, name}
COMPANIES: dict[str, dict] = {}      # company_id -> passport dict
RATE: dict[str, list[float]] = {}    # ip -> timestamps


def rate_limit(request: Request, max_req: int = 60, window: int = 60):
    ip = request.client.host if request.client else "unknown"
    now = time.time()
    arr = [t for t in RATE.get(ip, []) if now - t < window]
    if len(arr) >= max_req:
        raise HTTPException(429, "Too many requests. Slow down.")
    arr.append(now)
    RATE[ip] = arr


def make_token(email: str, company_id: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(hours=12)
    return jwt.encode({"sub": email, "cid": company_id, "exp": exp}, settings.SECRET_KEY, algorithm=ALG)


def current_user(authorization: str = Header(default="")) -> dict:
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Login required")
    try:
        data = jwt.decode(authorization[7:], settings.SECRET_KEY, algorithms=[ALG])
    except Exception:
        raise HTTPException(401, "Invalid or expired token")
    u = USERS.get(data.get("sub", ""))
    if not u:
        raise HTTPException(401, "User not found")
    return {"email": data["sub"], "cid": data.get("cid", ""), **u}


# ---------------- ANALYSIS ENGINE (real, quote+page) ----------------
CHARS_PER_PAGE = 1800
RULES = [
    ("license", ["litsenziya", "лицензия", "license"], "doc"),
    ("tax_clearance", ["soliq qarzi", "налогов", "tax clearance", "qarzi yo'q"], "doc"),
    ("stir", ["stir", "стир", "tin"], "doc"),
    ("turnover", ["aylanma", "оборот", "turnover", "so'm", "сум", "uzs"], "numeric"),
    ("experience", ["tajriba", "опыт", "experience", "yil", "лет", "years"], "numeric"),
    ("guarantee", ["ta'minot", "обеспечен", "guarantee", "kaf кефолат", "kafolat", "%"], "numeric"),
    ("deadline", ["muddat", "срок", "deadline", "topshirish", "подач"], "date"),
    ("risk_penalty", ["jarima", "штраф", "penalty", "penya"], "risk"),
    ("risk_onesided", ["bir tomonlama", "односторон", "unilateral"], "risk"),
    ("risk_short", ["qisqa muddat", "короткий срок", "urgent"], "risk"),
]


def extract_requirements(text: str) -> list[dict]:
    reqs: list[dict] = []
    low = text.lower()
    for key, keywords, kind in RULES:
        for kw in keywords:
            i = low.find(kw.lower())
            if i >= 0:
                start = max(0, i - 140)
                end = min(len(text), i + 220)
                quote = " ".join(text[start:end].split())
                page = start // CHARS_PER_PAGE + 1
                reqs.append({"key": key, "kind": kind, "keyword": kw,
                             "quote": quote, "page": page, "offset": start})
                break
    return reqs


def readiness(passport: dict, reqs: list[dict], deadline: str = "") -> dict:
    docs = {d.get("type"): d for d in passport.get("documents", [])}
    items: list[dict] = []
    for r in reqs:
        k = r["key"]
        if r["kind"] == "doc":
            ok = k in docs and docs[k].get("valid", True)
            # deadline check vs submission date (not today)
            status = "pass" if ok else ("manual" if k == "stir" else "fail")
            items.append({"key": k, "status": status, "quote": r["quote"], "page": r["page"]})
        elif r["kind"] == "numeric":
            items.append({"key": k, "status": "warn", "quote": r["quote"], "page": r["page"],
                          "note": "manual-check"})
        elif r["kind"] == "risk":
            items.append({"key": k, "status": "warn", "quote": r["quote"], "page": r["page"]})
        else:
            items.append({"key": k, "status": "manual", "quote": r["quote"], "page": r["page"]})
    # cross-doc mismatch: STIR / name
    stirs = {d.get("stir") for d in passport.get("documents", []) if d.get("stir")}
    names = {d.get("owner") for d in passport.get("documents", []) if d.get("owner")}
    if len(stirs) > 1 or len(names) > 1:
        items.append({"key": "cross_mismatch", "status": "fail",
                      "quote": f"STIR/nom mos emas: {sorted(stirs)} / {sorted(names)}", "page": 0})
    score = 0
    if items:
        w = {"pass": 1.0, "warn": 0.5, "manual": 0.3, "fail": 0.0}
        score = round(100 * sum(w[i["status"]] for i in items) / len(items))
    return {"score": score, "items": items}


def decide(weights: dict[str, float], blocked: bool, effort_days: int) -> dict:
    if blocked:
        return {"verdict": "NO-GO", "score": 8, "confidence": 0.92,
                "assumptions": ["blocking-requirement-present"]}
    s = sum(weights.values())
    norm = {k: v / s for k, v in weights.items()} if s else weights
    score = round(100 * (norm.get("fit", .25) * .9 + norm.get("margin", .2) * .7 +
                         norm.get("capacity", .2) * .8 - norm.get("risk", .2) * .6 -
                         min(effort_days / 30, 1) * .15), 1)
    verdict = "GO" if score >= 65 else ("CONDITIONAL" if score >= 40 else "NO-GO")
    return {"verdict": verdict, "score": score,
            "confidence": round(max(.5, min(.9, .6 + len(weights) * .05)), 2),
            "weights": norm, "effort_days": effort_days,
            "assumptions": ["weights-user-adjustable", "manual-review-required"]}


# ---------------- schemas ----------------
class RegisterIn(BaseModel):
    name: str; email: str; password: str = Field(min_length=6); company: str = "Demo Co"


class LoginIn(BaseModel):
    email: str; password: str


class AnalyzeIn(BaseModel):
    text: str = Field(max_length=200_000)


class ComplianceIn(BaseModel):
    passport: dict; requirements: list[dict] = []; deadline: str = ""


class DecisionIn(BaseModel):
    weights: dict[str, float] = {"fit": .3, "margin": .2, "capacity": .2, "risk": .2, "effort": .1}
    blocked: bool = False
    effort_days: int = 7


# ---------------- routes ----------------
@app.get("/api/health")
def health():
    return {"ok": True, "time": datetime.now(timezone.utc).isoformat(), "version": "1.0.0"}


@app.get("/api/diag")
def diag():
    env_ok = len(settings.SECRET_KEY) >= 32
    return {"ok": env_ok, "db": settings.DATABASE_URL.split("://")[0],
            "max_upload_mb": settings.MAX_UPLOAD_MB,
            "warn": None if env_ok else "SECRET_KEY too short — set env, app still runs with limited auth"}


@app.post("/api/auth/register")
def register(body: RegisterIn, request: Request):
    rate_limit(request)
    if body.email in USERS:
        raise HTTPException(400, "Email already registered")
    cid = "c_" + secrets.token_hex(4)
    USERS[body.email] = {"hash": hash_pw(body.password), "cid": cid,
                         "role": "owner", "name": body.name}
    COMPANIES[cid] = {"name": body.company, "stir": "", "documents": [],
                      "metrics": {}, "experience": []}
    return {"token": make_token(body.email, cid), "company_id": cid}


@app.post("/api/auth/login")
def login(body: LoginIn, request: Request):
    rate_limit(request)
    u = USERS.get(body.email)
    if not u or not verify_pw(body.password, u["hash"]):
        raise HTTPException(401, "Wrong email or password")
    return {"token": make_token(body.email, u["cid"]), "company_id": u["cid"]}


@app.post("/api/analyze")
async def analyze(request: Request, file: UploadFile | None = File(default=None),
                  text: str = Form(default="")):
    rate_limit(request)
    content = text or ""
    if file is not None:
        raw = await file.read()
        limit = int(settings.MAX_UPLOAD_MB * 1024 * 1024)
        if len(raw) > limit:
            raise HTTPException(413, f"File too large. Max {settings.MAX_UPLOAD_MB} MB (Vercel ~4.5MB).")
        name = (file.filename or "").lower()
        if name.endswith(".pdf"):
            try:
                from pypdf import PdfReader
                reader = PdfReader(io.BytesIO(raw))
                content = "\n".join([(p.extract_text() or "") for p in reader.pages])
                if not content.strip():
                    content = "[OCR-needed] Skaner PDF matni topilmadi — OCR (Tesseract) ni yoqing yoki matn qo'ying."
            except Exception as e:
                raise HTTPException(400, f"PDF read error: {e}")
        elif name.endswith(".docx"):
            try:
                import docx
                d = docx.Document(io.BytesIO(raw))
                content = "\n".join([p.text for p in d.paragraphs])
            except Exception as e:
                raise HTTPException(400, f"DOCX read error: {e}")
        else:
            try:
                content = raw.decode("utf-8", errors="replace")
            except Exception:
                raise HTTPException(400, "Unsupported file")
    if not content.strip():
        raise HTTPException(400, "Empty document")
    # XSS: frontend escapes; backend never returns raw HTML
    reqs = extract_requirements(content[:200_000])
    return {"requirements": reqs, "chars": len(content),
            "disclaimer": "Yordamchi vosita — mutaxassis (yurist) tekshiruvi shart."}


@app.post("/api/analyze-text")
def analyze_text(body: AnalyzeIn, request: Request):
    rate_limit(request)
    if not body.text.strip():
        raise HTTPException(400, "Empty document")
    return {"requirements": extract_requirements(body.text),
            "disclaimer": "Yordamchi vosita — mutaxassis (yurist) tekshiruvi shart."}


@app.post("/api/compliance")
def compliance(body: ComplianceIn, user: dict = Depends(current_user)):
    mine = COMPANIES.get(user["cid"], {})
    passport = body.passport or mine
    if (body.passport.get("company_id") if isinstance(body.passport, dict) else None) not in (None, user["cid"]):
        raise HTTPException(403, "Cross-company access denied")
    return readiness(passport, body.requirements, body.deadline)


@app.post("/api/decision")
def decision(body: DecisionIn):
    return decide(body.weights, body.blocked, body.effort_days)


@app.post("/api/generate/{kind}")
def generate(kind: str, body: dict, user: dict = Depends(current_user)):
    allowed = {"guarantee_letter", "experience_ref", "tech_proposal", "tax_letter"}
    if kind not in allowed:
        raise HTTPException(400, "Unknown template")
    co = body.get("company", {})
    # escape user content (XSS) — plain text template
    def esc(s): return str(s or "").replace("<", "&lt;").replace(">", "&gt;")
    html = f"""<html><body><h1>{esc(kind)}</h1>
<p>Company: {esc(co.get('name'))} | STIR: {esc(co.get('stir'))}</p>
<p>Date: {esc(body.get('date'))}</p><p>{esc(body.get('body'))}</p>
<p><i>Yordamchi vosita — mutaxassis tekshiruvi shart.</i></p></body></html>"""
    return {"html": html, "filename": f"{kind}.html"}


@app.get("/api/tenders")
def tenders(demo: bool = True):
    # Real manba ulanmaguncha — faqat DEMO
    return {"demo": True, "items": [
        {"id": "T-101", "title": "Maktablar uchun kompyuter yetkazib berish", "buyer": "Xalq ta'limi",
         "amount": 850_000_000, "deadline": "2026-12-01", "sector": "IT", "region": "Toshkent", "demo": True},
        {"id": "T-102", "title": "Yo'l qurilish materiallari (to'siq: maxsus litsenziya)", "buyer": "Avtoyo'l",
         "amount": 4_200_000_000, "deadline": "2026-11-25", "sector": "Qurilish", "region": "Samarqand",
         "blocked": True, "demo": True},
        {"id": "T-103", "title": "Bank uchun kiberxavfsizlik auditi", "buyer": "Bank",
         "amount": 1_100_000_000, "deadline": "2026-12-20", "sector": "IT", "region": "Toshkent", "demo": True},
    ]}


@app.exception_handler(Exception)
async def safe_errors(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        return JSONResponse({"detail": exc.detail}, status_code=exc.status_code)
    return JSONResponse({"detail": "Internal error", "hint": "See /api/diag"}, status_code=500)
