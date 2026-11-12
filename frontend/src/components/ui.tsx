import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { t } from '../i18n/dict';
import { useStore } from '../lib/store';
import { TOUR_STEPS } from '../lib/demo';

// ---- language + theme switcher (no reload) ----
export function ThemeLang() {
  const { lang, setLang, theme, setTheme } = useStore();
  return (
    <div className="flex items-center gap-2" role="group" aria-label="Language and theme">
      <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--line)' }} role="group" aria-label="Language">
        {(['uz', 'en', 'ru'] as const).map(l => (
          <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
            className="px-2.5 py-1.5 text-xs font-bold" style={{ background: lang === l ? 'var(--primary)' : 'transparent', color: lang === l ? '#fff' : 'var(--ink)' }}>{l.toUpperCase()}</button>
        ))}
      </div>
      <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--line)' }} role="group" aria-label="Theme">
        {([['light', '☀'], ['dark', '☾'], ['system', '⚙']] as const).map(([v, ic]) => (
          <button key={v} onClick={() => setTheme(v)} aria-pressed={theme === v} title={v}
            className="px-2.5 py-1.5 text-xs" style={{ background: theme === v ? 'var(--surface2)' : 'transparent' }}>{ic}</button>
        ))}
      </div>
    </div>
  );
}

export function DemoBadge() {
  const { lang } = useStore();
  return <span className="chip" style={{ background: 'var(--warn-bg)', color: 'var(--warn)', border: '1px solid var(--warn)' }}>● {t(lang, 'demo_badge')}</span>;
}
export function Legal() {
  const { lang } = useStore();
  return <p className="text-xs mt-3" style={{ color: 'var(--muted)' }} role="note">⚖️ {t(lang, 'legal_warn')}</p>;
}
export function Empty({ text }: { text: string }) {
  return <div className="card p-10 text-center"><div className="text-4xl mb-2">📭</div><p style={{ color: 'var(--muted)' }}>{text}</p></div>;
}
export function StatusChip({ s }: { s: string }) {
  const c = s === 'pass' || s === 'GO' ? ['var(--accent-bg)', 'var(--accent)'] : s === 'warn' || s === 'CONDITIONAL' || s === 'manual' ? ['var(--warn-bg)', 'var(--warn)'] : ['var(--danger-bg)', 'var(--danger)'];
  return <span className="chip" style={{ background: c[0], color: c[1] }}>{s.toUpperCase()}</span>;
}

// ---- animated number ----
export function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [v, setV] = useState(0);
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  useEffect(() => {
    if (reduce) { setV(value); return; }
    let raf = 0; const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / 900);
      setV(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span>{v}{suffix}</span>;
}

// ---- sidebar ----
const NAV = [
  ['/app/analyze', 'nav_analyze', '📄'], ['/app/passport', 'nav_passport', '🏢'],
  ['/app/decision', 'nav_decision', '⚖️'], ['/app/docs', 'nav_docs', '📝'],
  ['/app/tenders', 'nav_tenders', '📋'], ['/app/academy', 'nav_academy', '🎓'],
  ['/app/market', 'nav_market', '🤝'], ['/app/team', 'nav_team', '👥'],
  ['/app/dash', 'nav_dash', '📊'], ['/app/tg', 'nav_tg', '✈️'],
] as const;

export function Sidebar() {
  const { lang } = useStore(); const loc = useLocation();
  return (
    <nav aria-label="App" className="flex md:flex-col gap-1 overflow-x-auto p-3 md:w-56 md:min-h-screen md:sticky md:top-0" style={{ background: 'var(--surface)', borderRight: '1px solid var(--line)' }}>
      <Link to="/" className="font-display font-extrabold text-lg px-2 py-2 whitespace-nowrap">🌉 BidBridge <span className="grad-text">AI</span></Link>
      {NAV.map(([r, k, ic]) => (
        <Link key={r} to={r} aria-current={loc.pathname === r ? 'page' : undefined}
          className="px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap"
          style={{ background: loc.pathname === r ? 'var(--surface2)' : 'transparent', color: loc.pathname === r ? 'var(--primary)' : 'var(--ink)' }}>
          {ic} {t(lang, k as never)}
        </Link>
      ))}
    </nav>
  );
}

// ---- topbar: search + CmdK + notifications + user ----
export function Topbar() {
  const { lang, notif, authed, logout } = useStore();
  const [open, setOpen] = useState(false);
  const [showN, setShowN] = useState(false);
  const [q, setQ] = useState('');
  const nav = useNavigate();
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(v => !v); } };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, []);
  const items = NAV.filter(([r, k]) => (t(lang, k as never) + r).toLowerCase().includes(q.toLowerCase()));
  return (
    <header className="flex items-center gap-3 p-3 sticky top-0 z-20 glass" style={{ borderBottom: '1px solid var(--line)' }}>
      <button className="input !w-auto" onClick={() => setOpen(true)} aria-label={t(lang, 'cmd_title')}>⌘ {t(lang, 'search_ph')}</button>
      <div className="ml-auto flex items-center gap-2">
        <ThemeLang />
        <button className="btn" onClick={() => setShowN(v => !v)} aria-label={t(lang, 'notif')} aria-expanded={showN}>🔔{notif.length > 0 && <sup>{notif.length}</sup>}</button>
        {authed ? <button className="btn" onClick={logout} aria-label={t(lang, 'profile')}>👤 ✓</button>
          : <Link className="btn grad-btn" to="/auth">{t(lang, 'nav_auth')}</Link>}
      </div>
      {showN && <div className="absolute right-3 top-14 card p-3 w-72 z-30" role="status">{notif.map((n, i) => <p key={i} className="text-sm py-1 border-b last:border-0" style={{ borderColor: 'var(--line)' }}>{n}</p>)}</div>}
      {open && (
        <div className="fixed inset-0 z-40 flex items-start justify-center pt-24" style={{ background: 'rgba(0,0,0,.4)' }} onClick={() => setOpen(false)}>
          <div className="card glass p-4 w-[min(560px,92vw)]" role="dialog" aria-label={t(lang, 'cmd_title')} onClick={e => e.stopPropagation()}>
            <input autoFocus className="input" placeholder={t(lang, 'search_ph')} value={q} onChange={e => setQ(e.target.value)} aria-label={t(lang, 'search_ph')} />
            <div className="mt-2 max-h-64 overflow-auto">
              {items.map(([r, k, ic]) => (
                <button key={r} className="w-full text-left px-3 py-2 rounded-lg hover:opacity-80" style={{ background: 'var(--surface2)' }}
                  onClick={() => { nav(r); setOpen(false); }}>{ic} {t(lang, k as never)}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// ---- guided tour ----
export function Tour() {
  const { tour, setTour, lang } = useStore(); const nav = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (tour >= 0 && tour < TOUR_STEPS.length) nav(TOUR_STEPS[tour].route); }, [tour]);
  useEffect(() => { ref.current?.querySelector('button')?.focus(); }, [tour]);
  if (tour < 0 || tour >= TOUR_STEPS.length) return null;
  const s = TOUR_STEPS[tour];
  return (
    <div ref={ref} className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 card glass p-4 flex items-center gap-3 w-[min(620px,94vw)]" role="dialog" aria-label={t(lang, 'tour_title')}>
      <span className="font-bold">{tour + 1}/7</span>
      <p className="text-sm flex-1">{(s.text as Record<string, string>)[lang]}</p>
      <button className="btn" onClick={() => setTour(-1)}>✕</button>
      {tour > 0 && <button className="btn" onClick={() => setTour(tour - 1)}>←</button>}
      <button className="btn grad-btn" style={{ color: '#fff' }} onClick={() => setTour(tour + 1)}>{tour === TOUR_STEPS.length - 1 ? '✓' : '→'}</button>
    </div>
  );
}

// ---- tiny bar/line chart (no deps, theme-aware) ----
export function Bars({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-2 h-36" role="img" aria-label="chart">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div title={`${labels[i]}: ${v}`} style={{ height: `${(v / max) * 100}%`, minHeight: 6, width: '100%', borderRadius: 6, background: 'linear-gradient(180deg,#6D28D9,#4338CA)' }} />
          <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}
