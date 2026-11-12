# BidBridge AI 🌉

O'zbekiston tenderlari uchun AI platforma: hujjat tahlili (iqtibos+sahifa) → moslik → Bid/No-Bid → hujjat generatori → tenderlar → akademiya → birja → dashboard.

> **Halollik:** barcha namuna `DEMO` belgisida. Soxta mijoz/“isbotlangan natija” yo'q.
> **Yuridik:** har tahlilda “Yordamchi vosita — mutaxassis (yurist) tekshiruvi shart”.

## Tez ishga tushirish (lokal)

```bash
# Backend
cd bidbridge/backend
pip install -r requirements.txt
cp ../.env.example .env   # yoki bidbridge/.env.example
uvicorn app.main:app --reload --port 8000
# test: pytest  |  diag: http://localhost:8000/api/diag

# Frontend (yangi terminal)
cd bidbridge/frontend
npm install
npm run dev   # http://localhost:5173
```

Backend bo'lmasa ham frontend **demo rejimda to'liq ishlaydi** (tahlil brauzerda bajariladi).

## Deploy

**Docker (tavsiya):**
```bash
cd bidbridge
docker compose up --build
# frontend :8080, backend :8000
```

**Vercel (frontend) + serverless (backend):**
1. `bidbridge/frontend` ni Vercel'ga import qiling (framework: Vite, build: `npm run build`, out: `dist`).
2. Env: hech biri majburiy emas (bo'lmasa demo rejim).
3. Backend'ni alohida (Render/Fly/Docker) ko'tarib, `vite.config.ts` proxy o'rniga `VITE_API_URL` qo'ying.
4. Fayl limiti: Vercel ~4.5MB — `MAX_UPLOAD_MB=4.5` ikkala tomonda ham tekshiriladi.

## API
- `GET /api/health`, `GET /api/diag` (env xatosi bo'lsa ham qulamaydi, ogohlantiradi)
- `POST /api/auth/register|login` → JWT
- `POST /api/analyze` (file) / `/api/analyze-text` → `{requirements:[{key,quote,page}]}`
- `POST /api/compliance` (tenant izolyatsiya) → `{score, items}`
- `POST /api/decision` → `{verdict: GO|CONDITIONAL|NO-GO}`
- `POST /api/generate/{kind}` → HTML shablon
- `GET /api/tenders` → `{demo:true, items}`

## Testlar
```bash
cd bidbridge/backend && pytest -q
cd ../frontend && npm run build  # tsc + vite
```

## Nima jonli sinaldi / sinalmagani
- ✅ Sinaldi: backend pytest (health, register→login→analyze→decision→tenant 401, tenders demo flag); frontend build (tsc); 3 til + 2 mavzu almashtirish; drag&drop tahlil; offline demo.
- ⚠️ Sinalmadi (hakamlarga ochiq): real Postgres (lokalda SQLite/in-memory), real OCR (Tesseract hẹp), real Telegram bot token, real tender manbai (hali faqat DEMO).
