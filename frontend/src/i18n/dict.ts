export type Lang = 'uz' | 'en' | 'ru';
export const LANGS: Lang[] = ['uz', 'en', 'ru'];

const dict = {
  uz: {
    tagline: 'Tender hujjatini yuklang — talablar, moslik va tayyor hujjatlarni oling',
    start_demo: '1-bosishda demo', open_app: 'Ilovani ochish', landing_tour: '2 daqiqalik tur',
    nav_analyze: 'Tahlil', nav_passport: 'Pasport', nav_decision: 'Bid/No-Bid', nav_docs: 'Hujjatlar',
    nav_tenders: 'Tenderlar', nav_academy: 'Akademiya', nav_market: 'Birja', nav_team: 'Jamoa',
    nav_dash: 'Dashboard', nav_tg: 'Telegram', nav_auth: 'Kirish',
    demo_badge: 'DEMO MAʼLUMOT', legal_warn: 'Yordamchi vosita — mutaxassis (yurist) tekshiruvi shart.',
    readiness: 'Tayyorlik', go: 'GO', conditional: 'SHARTLI', nogo: 'NO-GO',
    upload_title: 'Tender hujjatini yuklang', upload_hint: 'PDF, DOCX, TXT yoki rasm — drag & drop. Limit 4.5 MB.',
    paste: 'yoki matnni qo‘ying', analyze_btn: 'Tahlil qilish',
    search_ph: 'Qidiruv… (Ctrl/⌘+K)', tour_title: '2 daqiqalik yo‘l xaritasi',
    empty: 'Hali maʼlumot yo‘q', dashboard: 'Boshqaruv paneli', timesaved: 'Tejalgan vaqt',
    cmd_title: 'Buyruqlar paneli', notif: 'Bildirishnomalar', profile: 'Profil',
    quiz_pass: 'Tabriklaymiz! Sertifikat tayyor.', need_login: 'Avval demo yoki loginni bosing.',
  },
  en: {
    tagline: 'Upload a tender file — get requirements, fit score and ready documents',
    start_demo: 'One-click demo', open_app: 'Open the app', landing_tour: '2-minute tour',
    nav_analyze: 'Analyze', nav_passport: 'Passport', nav_decision: 'Bid/No-Bid', nav_docs: 'Documents',
    nav_tenders: 'Tenders', nav_academy: 'Academy', nav_market: 'Exchange', nav_team: 'Team',
    nav_dash: 'Dashboard', nav_tg: 'Telegram', nav_auth: 'Sign in',
    demo_badge: 'DEMO DATA', legal_warn: 'Assistive tool — expert (lawyer) review required.',
    readiness: 'Readiness', go: 'GO', conditional: 'CONDITIONAL', nogo: 'NO-GO',
    upload_title: 'Upload a tender document', upload_hint: 'PDF, DOCX, TXT or image — drag & drop. Limit 4.5 MB.',
    paste: 'or paste text', analyze_btn: 'Analyze',
    search_ph: 'Search… (Ctrl/⌘+K)', tour_title: '2-minute roadmap',
    empty: 'Nothing here yet', dashboard: 'Dashboard', timesaved: 'Time saved',
    cmd_title: 'Command palette', notif: 'Notifications', profile: 'Profile',
    quiz_pass: 'Congrats! Certificate is ready.', need_login: 'Press demo or sign in first.',
  },
  ru: {
    tagline: 'Загрузите тендерный документ — получите требования, готовность и документы',
    start_demo: 'Демо в 1 клик', open_app: 'Открыть приложение', landing_tour: 'Тур за 2 минуты',
    nav_analyze: 'Анализ', nav_passport: 'Паспорт', nav_decision: 'Bid/No-Bid', nav_docs: 'Документы',
    nav_tenders: 'Тендеры', nav_academy: 'Академия', nav_market: 'Биржа', nav_team: 'Команда',
    nav_dash: 'Дашборд', nav_tg: 'Telegram', nav_auth: 'Войти',
    demo_badge: 'ДЕМО-ДАННЫЕ', legal_warn: 'Вспомогательный инструмент — требуется проверка специалиста (юриста).',
    readiness: 'Готовность', go: 'GO', conditional: 'УСЛОВНО', nogo: 'NO-GO',
    upload_title: 'Загрузите тендерный документ', upload_hint: 'PDF, DOCX, TXT или фото — drag & drop. Лимит 4.5 MB.',
    paste: 'или вставьте текст', analyze_btn: 'Анализировать',
    search_ph: 'Поиск… (Ctrl/⌘+K)', tour_title: 'Маршрут на 2 минуты',
    empty: 'Пока пусто', dashboard: 'Панель', timesaved: 'Экономия времени',
    cmd_title: 'Командная панель', notif: 'Уведомления', profile: 'Профиль',
    quiz_pass: 'Поздравляем! Сертификат готов.', need_login: 'Сначала нажмите демо или войдите.',
  },
} as const;

export type TKey = keyof typeof dict.uz;
export const t = (lang: Lang, key: TKey): string => (dict[lang][key] as string) ?? dict.uz[key];

export const fmtMoney = (lang: Lang, v: number) =>
  new Intl.NumberFormat(lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US',
    { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(v);
export const fmtDate = (lang: Lang, d: string | Date) =>
  new Intl.DateTimeFormat(lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US',
    { dateStyle: 'medium' }).format(new Date(d));
export const fmtNum = (lang: Lang, v: number) =>
  new Intl.NumberFormat(lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US').format(v);
