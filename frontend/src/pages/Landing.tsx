import { Link } from 'react-router-dom';
import { t, fmtMoney, fmtNum } from '../i18n/dict';
import { useStore } from '../lib/store';
import { ThemeLang, CountUp, DemoBadge } from '../components/ui';

const HERO_STATS = [
  { v: 82, s: '%', label: { uz: 'o‘rtacha tayyorlik (demo)', en: 'avg readiness (demo)', ru: 'средняя готовность (демо)' } },
  { v: 7, s: '', label: { uz: 'modul bitta ilovada', en: 'modules in one app', ru: 'модулей в одном приложении' } },
  { v: 3, s: '', label: { uz: 'til + 2 mavzu', en: 'languages + 2 themes', ru: 'языка + 2 темы' } },
];

export default function Landing() {
  const { lang, runDemo, setTour } = useStore();
  const go = () => { runDemo(); location.hash = '#/app/analyze'; };
  return (
    <div className="min-h-screen">
      <nav className="flex items-center gap-3 p-4 max-w-6xl mx-auto" aria-label="Main">
        <span className="font-display font-extrabold text-xl">🌉 BidBridge <span className="grad-text">AI</span></span>
        <span className="ml-2"><DemoBadge /></span>
        <div className="ml-auto flex items-center gap-2">
          <ThemeLang />
          <Link to="/auth" className="btn" style={{ border: '1px solid var(--line)' }}>{t(lang, 'nav_auth')}</Link>
          <Link to="/app/analyze" className="btn grad-btn" style={{ color: '#fff' }}>{t(lang, 'open_app')}</Link>
        </div>
      </nav>

      <header className="max-w-6xl mx-auto px-4 pt-10 pb-8 grid md:grid-cols-2 gap-8 items-center">
        <div className="page">
          <h1 className="font-display font-extrabold text-4xl md:text-5xl leading-tight">
            {lang === 'uz' ? <>Tender yutish uchun <span className="grad-text">ko‘prik</span></> :
             lang === 'ru' ? <>Мост к <span className="grad-text">победе в тендере</span></> :
             <>The <span className="grad-text">bridge</span> to winning tenders</>}
          </h1>
          <p className="mt-4 text-lg" style={{ color: 'var(--muted)' }}>{t(lang, 'tagline')}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={go} className="btn grad-btn text-base px-6 py-3" style={{ color: '#fff' }}>▶ {t(lang, 'start_demo')}</button>
            <button onClick={() => { runDemo(); setTour(0); location.hash = '#/app/analyze'; }} className="btn text-base px-6 py-3" style={{ border: '1px solid var(--line)' }}>🗺 {t(lang, 'landing_tour')}</button>
          </div>
          <div className="mt-6 glass card p-4 flex gap-6">
            {HERO_STATS.map((s, i) => (
              <div key={i}><div className="font-display font-extrabold text-2xl grad-text"><CountUp value={s.v} suffix={s.s} /></div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>{s.label[lang]}</div></div>
            ))}
          </div>
        </div>
        <div className="card p-5" aria-label="demo animation">
          <p className="text-xs font-bold mb-2" style={{ color: 'var(--muted)' }}>● LIVE DEMO</p>
          <div className="font-mono text-xs space-y-2" aria-hidden>
            {['📄 tender.pdf yuklandi…', '🔍 10 ta talab topildi (iqtibos+sahifa)', '✅ moslik: 82% — SHARTLI', '📝 kafolat xati tayyor'].map((s, i) => (
              <div key={i} className="rounded-lg px-3 py-2 page" style={{ background: 'var(--surface2)', animationDelay: `${i * 120}ms` }}>{s}</div>
            ))}
          </div>
          <div className="mt-4 h-3 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
            <div className="h-full rounded-full" style={{ width: '82%', background: 'linear-gradient(90deg,#4338CA,#10B981)' }} />
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-4">
        {[
          { ic: '🏭', t: { uz: 'Tender tayyorlayotgan kompaniyalar', en: 'Bidding companies', ru: 'Компании-участники' }, d: { uz: 'Tahlil → moslik → hujjat 1 soatda', en: 'Analysis → fit → docs in 1 hour', ru: 'Анализ → готовность → документы за час' } },
          { ic: '🌱', t: { uz: 'Kichik biznes', en: 'Small business', ru: 'Малый бизнес' }, d: { uz: 'Akademiya + birja + konsorsium', en: 'Academy + exchange + consortium', ru: 'Академия + биржа + консорциум' } },
          { ic: '🏦', t: { uz: 'Yirik biznes va buyurtmachilar', en: 'Enterprise & buyers', ru: 'Крупный бизнес и заказчики' }, d: { uz: 'Ishonchli kichik yetkazib beruvchilar', en: 'Trusted small suppliers', ru: 'Проверенные малые поставщики' } },
        ].map((c, i) => (
          <div key={i} className="card p-5 hover:shadow-soft"><div className="text-3xl">{c.ic}</div>
            <h3 className="font-display font-bold mt-2">{c.t[lang]}</h3><p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{c.d[lang]}</p></div>
        ))}
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="font-display font-extrabold text-2xl mb-4">{lang === 'uz' ? 'Qanday ishlaydi' : lang === 'ru' ? 'Как это работает' : 'How it works'}</h2>
        <ol className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(n => (
            <li key={n} className="card p-4"><span className="font-display font-extrabold grad-text text-2xl">{n}</span>
              <p className="text-sm mt-1">{[lang === 'uz' ? 'Hujjatni yuklang' : lang === 'ru' ? 'Загрузите документ' : 'Upload the document', lang === 'uz' ? 'Talablarni iqtibos bilan oling' : lang === 'ru' ? 'Получите требования с цитатами' : 'Get requirements with quotes', lang === 'uz' ? 'Moslik va GO qarori' : lang === 'ru' ? 'Готовность и решение GO' : 'Fit score and GO call', lang === 'uz' ? 'Hujjatlarni yuklab oling' : lang === 'ru' ? 'Скачайте документы' : 'Download the documents'][n - 1]}</p></li>
          ))}
        </ol>
        <div className="card p-5 mt-4 flex flex-wrap gap-6 items-center">
          <div><div className="text-xs" style={{ color: 'var(--muted)' }}>{lang === 'uz' ? 'Namuna tender summasi' : 'Sample tender'}</div>
            <div className="font-display font-bold">{fmtMoney(lang, 850_000_000)}</div></div>
          <div><div className="text-xs" style={{ color: 'var(--muted)' }}>T-101 / T-102 / T-103</div>
            <div className="font-display font-bold">{fmtNum(lang, 3)} {lang === 'uz' ? 'tender' : lang === 'ru' ? 'тендера' : 'tenders'}</div></div>
          <DemoBadge />
        </div>
      </section>
      <footer className="max-w-6xl mx-auto px-4 py-8 text-xs" style={{ color: 'var(--muted)' }}>
        BidBridge AI · {t(lang, 'legal_warn')} · /api/health · /api/diag
      </footer>
    </div>
  );
}
