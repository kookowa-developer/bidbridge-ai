# DEMO yo'riqnoma (hakamlar uchun, 2 daqiqa)

## 1-bosishda demo
Landing'da **“1-bosishda demo”** tugmasini bosing → kompaniya, hujjatlar, 3 tender (T-102 to'siqli), kurslar, birja yuklanadi.

## 2 daqiqalik tur (7 qadam)
**“2 daqiqalik tur”** tugmasi pastdagi yo'naltirgichni ochadi:
1. **Tahlil** — demo tender tahlil qilingan; istalgan talabni bosing → o'ngda iqtibos+sahifa, chapda highlight.
2. **Pasport** — tayyorlik ~82%, STIR nomuvofiqlik testi (moliyaviy hisobot STIR'ini o'zgartiring → `cross_mismatch` FAIL).
3. **Bid/No-Bid** — slayderlarni suring → GO/SHARTLI/NO-GO jonli; “to'siq” checkbox → darhol NO-GO.
4. **Hujjatlar** — 4 shablon, preview, TXT/DOC yuklash, PDF (print).
5. **Tenderlar** — DEMO badge, filtr, ☆ saqlash, taqvim ko'rinishi.
6. **Akademiya** — quiz (2 savol) → sertifikat TXT.
7. **Dashboard** — KPI, grafik, “o'lchov qo'shish” (n≥10 da 50% tasdiqlanadi).

## O'zingiz sinang
- Tahlil sahifasiga **real tender matni** qo'ying yoki PDF/DOCX yuklang → talablar topilmasa, uydirilmaydi — **“qo'lda tekshirish”** chiqadi.
- Til (UZ/EN/RU) va mavzu (☀/☾/⚙) — sahifa yangilanmasdan almashadi.
- `/api/health` va `/api/diag` ni brauzerda oching.
