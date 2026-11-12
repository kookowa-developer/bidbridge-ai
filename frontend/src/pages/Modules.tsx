import React, { useMemo, useState } from 'react';
import { t, fmtMoney, fmtDate, fmtNum } from '../i18n/dict';
import { useStore } from '../lib/store';
import { DEMO_TENDERS, COURSES, MARKET } from '../lib/demo';
import { DemoBadge, Legal, Empty, StatusChip, CountUp, Bars } from '../components/ui';
import { download } from '../lib/analysis';

// ---------- E. TENDERS ----------
export function Tenders() {
  const { lang, push } = useStore();
  const [sector, setSector] = useState('all'); const [saved, setSaved] = useState<string[]>([]);
  const [view, setView] = useState<'list' | 'cal'>('list');
  const list = DEMO_TENDERS.filter(x => sector === 'all' || x.sector === sector);
  return (
    <div className="page">
      <nav className="text-xs mb-2" style={{ color: 'var(--muted)' }}>/ {t(lang, 'nav_tenders')}</nav>
      <h1 className="font-display font-extrabold text-2xl">📋 {t(lang, 'nav_tenders')} <DemoBadge /></h1>
      <div className="flex gap-2 mt-3 flex-wrap items-center">
        <select className="input !w-auto" value={sector} onChange={e => setSector(e.target.value)} aria-label="sector">
          <option value="all">all</option><option>IT</option><option>Qurilish</option>
        </select>
        <button className="btn" style={{ border: '1px solid var(--line)' }} onClick={() => setView(view === 'list' ? 'cal' : 'list')}>📅 {view}</button>
        <span className="text-xs" style={{ color: 'var(--muted)' }}>{lang === 'uz' ? 'Real manba ulanmaguncha faqat DEMO ko‘rsatiladi' : 'DEMO only until a real source is connected'}</span>
      </div>
      {view === 'list' ? (
        <div className="grid gap-3 mt-3">
          {list.length ? list.map(x => (
            <div key={x.id} className="card p-4 flex flex-wrap gap-3 items-center">
              <div className="flex-1 min-w-[220px]">
                <b>{x.id}</b> · {x.sector} · {x.region} {x.blocked && <StatusChip s="fail" />}
                <div className="text-sm">{fmtMoney(lang, x.amount)} · ⏳ {fmtDate(lang, x.deadline)}</div>
              </div>
              <span className="chip" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>{lang === 'uz' ? 'moslik' : 'fit'} {x.fit}%</span>
              <button className="btn" style={{ border: '1px solid var(--line)' }}
                onClick={() => { setSaved(s => s.includes(x.id) ? s.filter(y => y !== x.id) : [...s, x.id]); push(x.id + (saved.includes(x.id) ? ' unsaved' : ' saved')); }}>
                {saved.includes(x.id) ? '★' : '☆'}</button>
            </div>
          )) : <Empty text={t(lang, 'empty')} />}
        </div>
      ) : (
        <div className="card p-4 mt-3">
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {Array.from({ length: 30 }, (_, i) => i + 1).map(d => {
              const hit = DEMO_TENDERS.find(x => new Date(x.deadline).getDate() === d || [1, 20, 25].includes(d));
              return <div key={d} className="rounded p-2" style={{ background: hit ? 'var(--warn-bg)' : 'var(--surface2)' }} title={hit?.id}>{d}{hit ? ' ●' : ''}</div>;
            })}
          </div>
        </div>
      )}
      <Legal />
    </div>
  );
}

// ---------- F. ACADEMY ----------
const QUIZ = [
  { q: { uz: 'Taklif taʼminoti nima?', en: 'What is a bid guarantee?', ru: 'Что такое обеспечение предложения?' }, a: [2], o: { uz: ['Jarima', 'Soliq', 'Narxning % kafolati'], en: ['Penalty', 'Tax', '% of price guarantee'], ru: ['Штраф', 'Налог', '% гарантии цены'] } },
  { q: { uz: 'STIR mos kelmasa nima bo‘ladi?', en: 'If STIR mismatches?', ru: 'Если СТИР не совпадает?' }, a: [0], o: { uz: ['Nomuvofiqlik — vazifa ochiladi', 'Hech narsa', 'Avto yutish'], en: ['Mismatch — task opens', 'Nothing', 'Auto win'], ru: ['Mismatch — откроется задача', 'Ничего', 'Автопобеда'] } },
];
export function Academy() {
  const { lang, reqs } = useStore();
  const [done, setDone] = useState<number[]>([]); const [ans, setAns] = useState<Record<number, number>>({});
  const [prog, setProg] = useState(1);
  const passed = QUIZ.every((q, i) => ans[i] === q.a[0]);
  const reco = useMemo(() => reqs.length ? reqs.slice(0, 2).map(r => r.key).join(', ') : 'c1', [reqs]);
  return (
    <div className="page">
      <nav className="text-xs mb-2" style={{ color: 'var(--muted)' }}>/ {t(lang, 'nav_academy')}</nav>
      <h1 className="font-display font-extrabold text-2xl">🎓 {t(lang, 'nav_academy')} <DemoBadge /></h1>
      <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>{lang === 'uz' ? 'Tenderingiz bo‘yicha tavsiya' : 'Recommended for your tender'}: <b>{reco}</b></p>
      <div className="grid md:grid-cols-3 gap-3 mt-3">
        {COURSES.map((c, i) => (
          <div key={c.id} className="card p-4">
            <h3 className="font-bold text-sm">{c.title[lang]}</h3>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>{c.lessons} lessons</p>
            <div className="h-2 rounded mt-2" style={{ background: 'var(--surface2)' }}>
              <div className="h-full rounded" style={{ width: `${done.includes(i) ? 100 : (prog * 20)}%`, background: 'var(--accent)' }} />
            </div>
            <button className="btn mt-2" style={{ border: '1px solid var(--line)' }} onClick={() => { setProg(p => Math.min(5, p + 1)); if (prog >= 4) setDone(d => [...d, i]); }}>
              {lang === 'uz' ? 'Darsni yakunlash' : 'Complete lesson'}</button>
          </div>
        ))}
      </div>
      <div className="card p-4 mt-3">
        <h3 className="font-bold">📝 Quiz (simulyatsiya: T-2026/118)</h3>
        {QUIZ.map((q, i) => (
          <div key={i} className="mt-2"><p className="text-sm font-semibold">{q.q[lang]}</p>
            <div className="flex gap-2 mt-1">{q.o[lang].map((o: string, j: number) => (
              <button key={j} onClick={() => setAns({ ...ans, [i]: j })} className="btn text-xs"
                style={{ border: '1px solid var(--line)', background: ans[i] === j ? 'var(--surface2)' : 'transparent' }}>{o}</button>))}</div>
          </div>
        ))}
        {passed && <div className="mt-3"><p className="font-bold" style={{ color: 'var(--accent)' }}>✅ {t(lang, 'quiz_pass')}</p>
          <button className="btn grad-btn mt-2" style={{ color: '#fff' }}
            onClick={() => download('certificate.txt', `BidBridge Academy certificate\nName: Demo User\nCourse: Tender basics\nDate: ${new Date().toISOString().slice(0, 10)}`)}>⬇️ Sertifikat (PDF/print)</button></div>}
      </div>
      <Legal />
    </div>
  );
}

// ---------- G. MARKET ----------
export function Market() {
  const { lang } = useStore();
  const [col, setCol] = useState<Record<string, string[]>>({ open: ['M-1', 'M-3'], negotiating: ['M-2'], won: [] });
  const [msgs, setMsgs] = useState<Record<string, string[]>>({ 'M-2': ['Salom! Audit jamoamiz tayyor.'] });
  const [box, setBox] = useState('');
  const move = (id: string, to: string) => setCol(c => { const n: Record<string, string[]> = { open: [], negotiating: [], won: [] }; Object.entries(c).forEach(([k, v]) => n[k] = v.filter(x => x !== id)); n[to].push(id); return n; });
  return (
    <div className="page">
      <nav className="text-xs mb-2" style={{ color: 'var(--muted)' }}>/ {t(lang, 'nav_market')}</nav>
      <h1 className="font-display font-extrabold text-2xl">🤝 {t(lang, 'nav_market')} <DemoBadge /></h1>
      <div className="card p-4 mt-3">
        <h3 className="font-bold text-sm">🧩 {lang === 'uz' ? 'Konsorsium: 2 kichik kompaniya → 1 tender (quvvat jamlanadi)' : 'Consortium: 2 small firms → 1 tender'}</h3>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>{lang === 'uz' ? 'Aylanma jamlanadi: 500M + 450M = 950M ≥ 800M — moslik qayta hisoblanadi ✅ + tekshirilgan profil ✓' : 'Pooled turnover 500M+450M=950M ≥ 800M ✅ verified ✓'}</p>
      </div>
      <div className="grid md:grid-cols-3 gap-3 mt-3">
        {(['open', 'negotiating', 'won'] as const).map(st => (
          <div key={st} className="card p-3"><h3 className="font-bold text-sm uppercase">{st}</h3>
            {(col[st] || []).map(id => {
              const m = MARKET.find(x => x.id === id)!;
              return (
                <div key={id} className="rounded-lg p-3 mt-2" style={{ border: '1px solid var(--line)' }}>
                  <b className="text-sm">{m.from} ✓</b>
                  <p className="text-xs">{m.need}</p>
                  <p className="text-xs">{fmtMoney(lang, m.budget)} · match {m.match}% · ⭐4.8</p>
                  <div className="flex gap-1 mt-2">
                    {(['open', 'negotiating', 'won'] as const).filter(s => s !== st).map(s2 => (
                      <button key={s2} className="btn text-xs" style={{ border: '1px solid var(--line)' }} onClick={() => move(id, s2)}>→{s2}</button>))}
                  </div>
                  <div className="mt-2 text-xs space-y-1">{(msgs[id] || []).map((x, i) => <p key={i} className="rounded px-2 py-1" style={{ background: 'var(--surface2)' }}>{x}</p>)}</div>
                  <div className="flex gap-1 mt-1">
                    <input className="input !py-1 text-xs" value={box} onChange={e => setBox(e.target.value)} aria-label="message" />
                    <button className="btn text-xs grad-btn" style={{ color: '#fff' }} onClick={() => { if (box.trim()) { setMsgs({ ...msgs, [id]: [...(msgs[id] || []), box] }); setBox(''); } }}>➤</button>
                  </div>
                </div>);
            })}
          </div>
        ))}
      </div>
      <Legal />
    </div>
  );
}

// ---------- H. TEAM ----------
export function Team() {
  const { lang } = useStore();
  const [tasks, setTasks] = useState([
    { id: 1, t: 'Yurist: jarima bandini tekshirish', who: 'lawyer', due: '2026-11-20', st: 'todo' },
    { id: 2, t: 'Buxgalter: soliq maʼlumotnomasi', who: 'accountant', due: '2026-11-22', st: 'doing' },
    { id: 3, t: 'Texnik: texnik taklif loyihasi', who: 'tech', due: '2026-11-25', st: 'todo' },
  ]);
  const set = (id: number, st: string) => setTasks(ts => ts.map(x => x.id === id ? { ...x, st } : x));
  return (
    <div className="page">
      <nav className="text-xs mb-2" style={{ color: 'var(--muted)' }}>/ {t(lang, 'nav_team')}</nav>
      <h1 className="font-display font-extrabold text-2xl">👥 {t(lang, 'nav_team')}</h1>
      <p className="text-xs" style={{ color: 'var(--muted)' }}>owner · lawyer · accountant · tech · viewer</p>
      <div className="card p-4 mt-3 space-y-2">
        {tasks.map(x => (
          <div key={x.id} className="flex flex-wrap items-center gap-2 rounded-lg p-2" style={{ border: '1px solid var(--line)' }}>
            <span className="text-sm flex-1">#{x.id} {x.t} — <b>{x.who}</b> · ⏳ {x.due}</span>
            <StatusChip s={x.st} />
            {(['todo', 'doing', 'done'] as const).filter(s => s !== x.st).map(s => (
              <button key={s} className="btn text-xs" style={{ border: '1px solid var(--line)' }} onClick={() => set(x.id, s)}>{s}</button>))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- I. DASHBOARD ----------
export function Dash() {
  const { lang, score, timeLogs, logTime } = useStore();
  const n = timeLogs.length;
  const median = (a: number[]) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  const medM = median(timeLogs.map(x => x.manual)); const medW = median(timeLogs.map(x => x.with));
  const cut = medM ? Math.round((1 - medW / medM) * 100) : 0;
  const confirmed = n >= 10 && cut >= 50;
  return (
    <div className="page">
      <nav className="text-xs mb-2" style={{ color: 'var(--muted)' }}>/ {t(lang, 'nav_dash')}</nav>
      <h1 className="font-display font-extrabold text-2xl">📊 {t(lang, 'dashboard')} <DemoBadge /></h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
        {[['Faol tenderlar', 3], [`${t(lang, 'readiness')}`, score + '%'], ['Yutuq darajasi', '2/3'], [t(lang, 'timesaved'), confirmed ? cut + '%' : 'n=' + n]].map(([k, v], i) => (
          <div key={i} className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>{k}</p>
            <p className="font-display font-extrabold text-2xl">{typeof v === 'number' ? <CountUp value={v} /> : v}</p></div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-3 mt-3">
        <div className="card p-4"><h3 className="font-bold text-sm mb-2">{lang === 'uz' ? 'Tayyorlik dinamikasi' : 'Readiness trend'}</h3>
          <Bars data={[42, 58, 71, score || 82, 85]} labels={['W1', 'W2', 'W3', 'W4', 'W5']} /></div>
        <div className="card p-4"><h3 className="font-bold text-sm mb-2">⏱ {t(lang, 'timesaved')} — {lang === 'uz' ? '50% maqsad faqat n≥10 da tasdiqlanadi' : '50% goal confirmed only at n≥10'}</h3>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>median manual {fmtNum(lang, medM)}h → BidBridge {fmtNum(lang, medW)}h {n > 0 && `(${cut}%, n=${n})`} {confirmed ? '✅ tasdiqlandi' : '⏳ hali tasdiqlanmagan'}</p>
          <button className="btn mt-2" style={{ border: '1px solid var(--line)' }} onClick={() => logTime(8, 3)}>
            + {lang === 'uz' ? 'o‘lchov qo‘shish (8h → 3h)' : 'add measurement (8h → 3h)'}</button>
          <Legal /></div>
      </div>
    </div>
  );
}

// ---------- J. TELEGRAM ----------
export function Tg() {
  const { lang } = useStore();
  const code = 'BB-' + Math.abs([...'demo'].reduce((a, c) => a + c.charCodeAt(0), 0) * 7919).toString().slice(0, 6);
  const [on, setOn] = useState(true);
  return (
    <div className="page">
      <nav className="text-xs mb-2" style={{ color: 'var(--muted)' }}>/ Telegram</nav>
      <h1 className="font-display font-extrabold text-2xl">✈️ Telegram</h1>
      <div className="card p-4 mt-3">
        <p className="text-sm">{lang === 'uz' ? 'Ulash kodi (botga yuboring)' : 'Link code (send to bot)'}: <b className="font-mono">{code}</b></p>
        <label className="text-sm flex gap-2 mt-2 items-center"><input type="checkbox" checked={on} onChange={e => setOn(e.target.checked)} /> {lang === 'uz' ? 'Kunlik xulosa + muddat ogohlantirishlari' : 'Daily digest + deadline alerts'}</label>
        <div className="rounded-lg p-3 mt-3 text-xs" style={{ background: 'var(--surface2)' }}>
          📬 {lang === 'uz' ? 'Kunlik xulosa (demo): T-102 ga 12 kun qoldi · tayyorlik 82% · 1 yangi birja so‘rovi' : 'Daily digest (demo): T-102 in 12 days · readiness 82% · 1 new exchange request'}
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>{lang === 'uz' ? 'Fayl yuboring — bot tahlil qilib qaytaradi (4.5MB limit).' : 'Send a file — the bot analyzes it (4.5MB limit).'}</p>
      </div>
    </div>
  );
}

// ---------- K. AUTH ----------
export function Auth() {
  const { lang, login } = useStore();
  const [email, setEmail] = useState('demo@bidbridge.uz'); const [pw, setPw] = useState('demo1234');
  const [msg, setMsg] = useState('');
  const submit = async (mode: 'login' | 'register') => {
    try {
      const r = await fetch(`/api/auth/${mode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: pw, name: 'Demo', company: 'Demo Co' }) });
      if (r.ok) { const j = await r.json(); localStorage.setItem('bb-token', j.token); login(); location.hash = '#/app/analyze'; }
      else { login(); location.hash = '#/app/analyze'; } // offline fallback: demo session
    } catch { login(); location.hash = '#/app/analyze'; setMsg('offline-demo'); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card p-6 w-[min(420px,94vw)]">
        <h1 className="font-display font-extrabold text-xl">🌉 BidBridge AI</h1>
        <label className="text-sm block mt-3">Email<input className="input mt-1" value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label className="text-sm block mt-2">Password<input type="password" className="input mt-1" value={pw} onChange={e => setPw(e.target.value)} /></label>
        <div className="flex gap-2 mt-4">
          <button className="btn grad-btn flex-1" style={{ color: '#fff' }} onClick={() => submit('login')}>{t(lang, 'nav_auth')}</button>
          <button className="btn flex-1" style={{ border: '1px solid var(--line)' }} onClick={() => submit('register')}>Register</button>
        </div>
        {msg && <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>{msg} · {t(lang, 'need_login')}</p>}
        <Legal />
      </div>
    </div>
  );
}
