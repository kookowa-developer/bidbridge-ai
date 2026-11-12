from fastapi.testclient import TestClient
from app.main import app

c = TestClient(app)

def test_health():
    assert c.get("/api/health").status_code == 200

def test_register_login_analyze():
    r = c.post("/api/auth/register", json={"name": "A", "email": "a@t.uz", "password": "secret123", "company": "Demo"})
    assert r.status_code == 200
    token = r.json()["token"]
    t = c.post("/api/analyze-text", json={"text": "Litsenziya talab qilinadi. Taklif ta'minoti 2%. Topshirish muddati 2026-12-01. STIR ko'rsating."})
    assert t.status_code == 200
    assert any(x["key"] == "license" for x in t.json()["requirements"])
    d = c.post("/api/decision", json={"weights": {"fit": .4, "margin": .2, "capacity": .2, "risk": .1, "effort": .1}, "blocked": False, "effort_days": 5})
    assert d.json()["verdict"] in ("GO", "CONDITIONAL", "NO-GO")
    # tenant isolation: no token -> 401
    assert c.post("/api/compliance", json={"passport": {}, "requirements": []}).status_code == 401
    me = c.post("/api/compliance", json={"passport": {"documents": []}, "requirements": []}, headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200

def test_tenders_demo_flag():
    assert c.get("/api/tenders").json()["demo"] is True
