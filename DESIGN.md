# BidBridge AI — Design System (DESIGN.md)

## Ranglar (design tokens, `src/styles/tokens.css`)
| Token | Light | Dark | Izoh |
|---|---|---|---|
| `--bg` | `#F7F8FC` | `#0B0F1E` | sahifa foni |
| `--surface` | `#FFFFFF` | `#121A30` | kartalar |
| `--ink` | `#141A2E` | `#EDF1FF` | asosiy matn (AA+) |
| `--muted` | `#5A6378` / `#4A5470` | `#A6B0C9` | ikkinchi matn (AA) |
| `--primary` | `#4338CA` | `#818CF8` | indigo asos |
| `--primary-2` | `#6D28D9` | `#A78BFA` | gradient ikkinchi uchi |
| `--accent` | `#047857` (light matnda) / `#10B981` (fonlarda) | `#34D399` | yagona aksent — zumrad |
| `--warn` | `#B45309`/`#F59E0B` | `#FBBF24` | ogohlantirish |
| `--danger` | `#B91C1C`/`#EF4444` | `#F87171` | nomuvofiq |
| `--line` | `#E4E8F2` | `#26314F` | chegaralar |

Faqat bitta aksent (zumrad) + indigo gradient. Qizil/sariq faqat holat uchun.

## Tipografiya
- Sarlavha: **Manrope** 700/800, matn: **Inter** 400/500/600. Ikkisi ham lotin+kirillni qo'llaydi.
- Shkala: 12 / 14 / 16 / 20 / 24 / 32 / 44 / 56. Qator balandligi 1.5 (matn), 1.15 (sarlavha).

## Komponentlar
- `btn-primary`: indigo→binafsha gradient, hover'da 4px ko'tarilish + soya; `btn-ghost`, `chip` (holat), `card` (12px radius, 1px line, yumshoq soya), `input` (fokusda 2px indigo halqa).
- Glassmorphism faqat hero statistika paneli va CmdK palitrasida (`backdrop-blur` + 60% shaffof surface).
- Skeleton yuklanishda, raqamlar `count-up`, sahifa o'tishlari `fade+slide 180ms`.

## Harakat va kirish
- `prefers-reduced-motion: reduce` bo'lsa barcha animatsiya o'chadi.
- Har interaktiv element klaviaturadan boriladi, ARIA label/role, fokus halqasi ko'rinadi. Kontrast ikkala mavzuda AA (matn ≥4.5:1).

## Nega "Bootstrap emas"
Maxsus token tizimi, o'ziga xos gradient+glass urg'usi, Manrope/Inter jufti, zich fintech kartochka tili va jonli mikro-animatsiyalar standart komponent kutubxonasi ko'rinishidan ataylab uzoqlashtirilgan.
