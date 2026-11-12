import type { Lang } from '../i18n/dict';
import type { Passport } from './analysis';

export const DEMO_TENDER_UZ = `TENDER № T-2026/118. Buyurtmachi: Toshkent shahar Xalq ta'limi boshqarmasi.
1. Litsenziya: ta'lim jihozlarini yetkazib berish litsenziyasi talab qilinadi.
2. Soliq qarzi yo'qligi haqida ma'lumotnoma (STIR ko'rsatilgan holda).
3. Yillik aylanma kamida 800 mln so'm bo'lishi shart.
4. So'nggi 3 yilda kamida 2 ta o'xshash shartnoma tajribasi (yiliga).
5. Taklif ta'minoti: boshlang'ich narxning 2% kafolat (kafolat xati).
6. Topshirish muddati: 2026-12-01 gacha. Muddatdan kechikkan takliflar qabul qilinmaydi.
7. Jarima: kechikkan har bir kun uchun 0,5% penya. Bir tomonlama shartnoma bekor qilish huquqi buyurtmachida qoladi.`;

export const DEMO_TENDER_RU = `ТЕНДЕР № T-2026/118. Заказчик: Управление народного образования г. Ташкента.
1. Требуется лицензия на поставку учебного оборудования.
2. Справка об отсутствии налоговой задолженности (СТИР).
3. Годовой оборот не менее 800 млн сум.
4. Опыт: минимум 2 аналогичных контракта за последние 3 года.
5. Обеспечение предложения 2% (гарантийное письмо).
6. Срок подачи: до 2026-12-01. Штраф 0,5% за каждый день просрочки. Одностороннее расторжение — за заказчиком.`;

export const DEMO_TENDER_EN = `TENDER No. T-2026/118. Buyer: Tashkent Department of Public Education.
1. License required for supply of educational equipment.
2. Tax clearance certificate (TIN stated).
3. Annual turnover at least UZS 800m.
4. Experience: at least 2 similar contracts in the last 3 years.
5. Bid guarantee 2% (guarantee letter). Submission deadline 2026-12-01.
6. Penalty 0.5% per day of delay. Unilateral termination right stays with the buyer.`;

export const demoTender = (l: Lang) => l === 'ru' ? DEMO_TENDER_RU : l === 'en' ? DEMO_TENDER_EN : DEMO_TENDER_UZ;

export const DEMO_PASSPORT: Passport = {
  name: 'Demo Stroy-Servis MChJ', stir: '301234567',
  documents: [
    { type: 'license', no: 'L-8821', valid: true, stir: '301234567', owner: 'Demo Stroy-Servis MChJ' },
    { type: 'tax_clearance', no: 'SQ-441', valid: true, stir: '301234567', owner: 'Demo Stroy-Servis MChJ' },
    { type: 'stir', no: '301234567', valid: true, stir: '301234567', owner: 'Demo Stroy-Servis MChJ' },
  ],
  metrics: { turnover: 950_000_000, experience_years: 4, staff: 18 },
  experience: ['Maktab jihozlari 2024', 'Bank ofislari 2025'],
};

export const DEMO_TENDERS = [
  { id: 'T-101', sector: 'IT', region: 'Toshkent', amount: 850_000_000, deadline: '2026-12-01', blocked: false, fit: 82 },
  { id: 'T-102', sector: 'Qurilish', region: 'Samarqand', amount: 4_200_000_000, deadline: '2026-11-25', blocked: true, fit: 18 },
  { id: 'T-103', sector: 'IT', region: 'Toshkent', amount: 1_100_000_000, deadline: '2026-12-20', blocked: false, fit: 74 },
];

export const COURSES = [
  { id: 'c1', lessons: 5, title: { uz: 'Tenderda qatnashish: 0 dan topshirishgacha', en: 'Bidding: from zero to submission', ru: 'Участие в тендере: от нуля до подачи' } },
  { id: 'c2', lessons: 4, title: { uz: 'Hujjatlar va kafolatlar', en: 'Documents & guarantees', ru: 'Документы и гарантии' } },
  { id: 'c3', lessons: 4, title: { uz: 'Xatolardan qochish va qonuniy asoslar', en: 'Avoiding mistakes & legal basis', ru: 'Ошибки и правовые основы' } },
];

export const MARKET = [
  { id: 'M-1', from: 'MegaBuild AJ', need: 'Kabel montaji subpudrati', budget: 420_000_000, match: 88, status: 'open' },
  { id: 'M-2', from: 'AloqaBank', need: 'Kiberxavfsizlik auditi', budget: 600_000_000, match: 76, status: 'negotiating' },
  { id: 'M-3', from: 'Beeline partner', need: 'Hududiy yetkazib berish', budget: 1_300_000_000, match: 64, status: 'open' },
];

export const TOUR_STEPS = [
  { route: '/app/analyze', text: { uz: '1/7 Tahlil: demo tenderni tahlil qiling, iqtibos+sahifani bosing', en: '1/7 Analyze: run the demo tender, click a quote+page', ru: '1/7 Анализ: запустите демо-тендер, нажмите на цитату' } },
  { route: '/app/passport', text: { uz: '2/7 Pasport: tayyorlik % va STIR nomuvofiqligini ko‘ring', en: '2/7 Passport: see readiness % and STIR mismatch', ru: '2/7 Паспорт: готовность % иMismatch СТИР' } },
  { route: '/app/decision', text: { uz: '3/7 Bid/No-Bid: slayderlarni suring — GO jonli o‘zgaradi', en: '3/7 Bid/No-Bid: drag sliders — GO updates live', ru: '3/7 Bid/No-Bid: двигайте слайдеры — GO обновляется' } },
  { route: '/app/docs', text: { uz: '4/7 Hujjatlar: kafolat xatini oldindan ko‘rib yuklab oling', en: '4/7 Docs: preview and download the guarantee letter', ru: '4/7 Документы: предпросмотр и скачивание' } },
  { route: '/app/tenders', text: { uz: '5/7 Tenderlar: DEMO belgisi, filtr, taqvim', en: '5/7 Tenders: DEMO badge, filters, calendar', ru: '5/7 Тендеры: метка ДЕМО, фильтры, календарь' } },
  { route: '/app/academy', text: { uz: '6/7 Akademiya: quiz topshiring, sertifikat oling', en: '6/7 Academy: pass the quiz, get the certificate', ru: '6/7 Академия: пройдите квиз, получите сертификат' } },
  { route: '/app/dash', text: { uz: '7/7 Dashboard: KPI, grafiklar, vaqt tejash (n≥10)', en: '7/7 Dashboard: KPIs, charts, time saved (n≥10)', ru: '7/7 Дашборд: KPI, графики, экономия времени (n≥10)' } },
];
