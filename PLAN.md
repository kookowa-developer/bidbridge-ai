# BidBridge AI — reja va arxitektura

## 1. Maqsad
Hakam 30 soniyada "bu oddiy sayt emas" deydi, 2 daqiqada demo-tur orqali barcha modulni ko'radi, o'zi real tender yuklab natija oladi.

## 2. Arxitektura

```
┌──────────────── FRONTEND (React+TS+Vite+Tailwind) ────────────────┐
│ Landing + App shell (sidebar, CmdK, notifications, breadcrumb)     │
│ lib/analysis.ts — real tahlil (regex+quote+page), compliance,      │
│   decision (weighted), generator, i18n, theme, demo-data           │
│ Backend bo'lmasa ham DEMO rejimda to'liq ishlaydi (localStorage)   │
└─────────────────────────── ↕ REST /api ───────────────────────────┘
┌──────────────── BACKEND (FastAPI, SQLite→Postgres) ────────────────┐
│ /api/health /api/diag /api/auth/* /api/analyze /api/compliance    │
│ /api/decision /api/generate /api/tenders /api/academy /api/market │
│ JWT + tenant izolyatsiya (company_id) + rate-limit + 4.5MB limit  │
└────────────────────────────────────────────────────────────────────┘
```

Tahlil mantig'i ikkala tomonda bir xil (frontend TS + backend Python) — offline demo va real API bir xil natija beradi.

## 3. Dizayn tizimi (qisqacha, to'liq DESIGN.md da)
- Ranglar: chuqur indigo `#4338CA`→`#6D28D9` gradient asos, yagona aksent zumrad `#10B981`, xavf `#F59E0B`, xato `#EF4444`. Dark fon `#0B0F1E`, light fon `#F7F8FC`.
- Shriftlar: Manrope (sarlavha) + Inter (matn) — lotin+kirill.
- Tokenlar CSS o'zgaruvchilarda, glassmorphism faqat karta/hero'da, skeleton/count-up/page-transition animatsiyalari, `prefers-reduced-motion` hurmati.
- WCAG AA: ikkala mavzuda matn kontrast ≥ 4.5:1.

## 4. Qurilish bosqichlari
1. Dizayn tokenlar + i18n + theme (bajarildi — shu buildda)
2. Auth + Demo rejim + Tour
3. Tender tahlili (upload/drag&drop, quote+page, yonma-yon)
4. Pasport + moslik + tayyorlik %
5. Bid/No-Bid (slayderlar, jonli)
6. Generator (preview + DOCX/PDF)
7. Tenderlar lentasi + kalendar (DEMO badge)
8. Akademiya (quiz, sertifikat) + Birja (kanban, konsorsium)
9. Dashboard (KPI, grafiklar, vaqt tejash n≥10) + Telegram + Jamoa
10. Testlar + README + deploy

## 5. Halollik
- Barcha namuna `DEMO` belgisida. Soxta mijoz/“isbotlangan natija” yo'q.
- Yuridik ogohlantirish har tahlil/generator sahifasida.
- Aniqlik raqamlari faqat o'lchanganidan (vaqt tejash n≥10).
