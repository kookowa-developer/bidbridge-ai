import React, { useState } from 'react';
import { t, fmtDate } from '../i18n/dict';
import { useStore } from '../lib/store';
import { extractRequirements, checkCompliance, decide, escapeHtml, download } from '../lib/analysis';
import { DEMO_PASSPORT, demoTender } from '../lib/demo';
import { DemoBadge, Legal, Empty, StatusChip, CountUp } from '../components/ui';

// ---------- A. ANALYZE ----------
export function Analyze() {
  const { lang, docText, setDocText, reqs, analyze, score, push } = useStore();
  const [sel, setSel] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [deadline, setDeadline] = useState('2026-12-01');

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    if (f.size > 4.5 * 1024 * 1024) { push('File too large (>4.5MB)'); return; }
    setBusy(true);
    try {
      // try backend first, fallback to local
      const fd = new FormData(); fd.append('file', f);
      const r = await fetch('/api/analyze', { method: 'POST', body: fd });
      if (r.ok) {
        const j = await r.json();
        analyze(demoTender(lang) + '\n\n[Yuklangan fayl: ' + f.name + ']');
        push(`${j.requirements.length} talab (server)`);
      } else {
        const txt = await f.text().catch(() => '');
        analyze(txt || demoTender(lang));
      }
    } catch { const txt = await f.text().catch(() => ''); analyze(txt || demoTender(lang)); }
    setBusy(false);
  };

  const highlighted = (text: string) => {
    if (sel == null || !reqs[sel]) return escapeHtml(text).slice(0, 4000);
    const q = reqs[sel].quote.slice(0, 60).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      return escapeHtml(text).replace(new RegExp(`(${q.slice(0, 20)})`, 'i'), '<mark class="hl">$1</mark>').slice(0, 6000);
    } catch { return escapeHtml(text).slice(0, 4000); }
  };

  return (
    <div className="page">
      <nav className="text-xs mb-2" style={{ color: 'var(--muted)' }} aria-label="breadcrumb">/ {t(lang, 'nav_analyze')}</nav>
      <h1 className="font-display font-extrabold text-2xl">{t(lang, 'upload_title')} <DemoBadge /></h1>
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); onFile(e.dataTransfer.files?.[0]); }}
        className="card p-6 mt-3 text-center border-dashed" style={{ borderStyle: 'dashed' }}>
        <p className="font-bold">📥 {t(lang, 'upload_hint')}</p>
        <input type="file" accept=".pdf,.docx,.txt,.png,.jpg" aria-label="file" className="mt-3"
          onChange={e => onFile(e.target.files?.[0])} />
        <div className="flex gap-2 mt-3">
          <textarea className="input" rows={4} value={docText} placeholder={t(lang, 'paste')}
            onChange={e => setDocText(e.target.value)} aria-label="tender text" />
        </div>
        <div className="flex gap-2 mt-3 items-center">
          <label className="text-sm">Deadline <input type="date" className="input !w-auto" value={deadline} onChange={e => setDeadline(e.target.value)} /></label>
          <button className="btn grad-btn ml-auto" style={{ color: '#fff' }} disabled={busy}
            onClick={() => { analyze(docText || demoTender(lang)); push('Tahlil tayyor: ' + fmtDate(lang, deadline)); }}>
            {busy ? '…' : '🔍 ' + t(lang, 'analyze_btn')}</button>
          <button className="btn" style={{ border: '1px solid var(--line)' }} onClick={() => analyze(demoTender(lang))}>{t(lang, 'start_demo')}</button>
        </div>
      </div>
      {busy && <div className="grid md:grid-cols-2 gap-3 mt-3"><div className="skeleton h-40 rounded-xl" /><div className="skeleton h-40 rounded-xl" /></div>}
      {!reqs.length && !busy ? <div className="mt-3"><Empty text={t(lang, 'empty')} /></div> : (
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <div className="card p-4">
            <h3 className="font-bold text-sm mb-2">📄 {lang === 'uz' ? 'Hujjat matni' : lang === 'ru' ? 'Текст документа' : 'Document text'}</h3>
            <div className="text-xs leading-relaxed max-h-96 overflow-auto" style={{ color: 'var(--muted)' }}
              dangerouslySetInnerHTML={{ __html: highlighted(docText) }} />
          </div>
          <div className="card p-4">
            <h3 className="font-bold text-sm mb-2">🧩 {lang === 'uz' ? `Talablar (${reqs.length}) · Tayyorlik ${score}%` : `Requirements (${reqs.length}) · ${score}%`}</h3>
            <ul className="space-y-2 max-h-96 overflow-auto">
              {reqs.map((r, i) => (
                <li key={i}><button onClick={() => setSel(i)} aria-expanded={sel === i}
                  className="w-full text-left rounded-lg p-2 text-xs" style={{ background: sel === i ? 'var(--surface2)' : 'transparent', border: '1px solid var(--line)' }}>
                  <b>{r.key}</b> · {lang === 'uz' ? 'sahifa' : 'page'} {r.page} · “{r.quote.slice(0, 90)}…”
                  {sel === i && <span className="block mt-1" style={{ color: 'var(--muted)' }}>“{r.quote}” (p.{r.page})</span>}
                </button></li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <Legal />
    </div>
  );
}

// ---------- B. PASSPORT ----------
export function Passport() {
  const { lang, reqs, score } = useStore();
  const [stir2, setStir2] = useState('301234568'); // mismatch demo
  const passport = { ...DEMO_PASSPORT, documents: [...DEMO_PASSPORT.documents, { type: 'financial', no: 'MB-9', valid: true, stir: stir2, owner: 'Demo Stroy-Servis MChJ' }] };
  const res = checkCompliance(passport, reqs.length ? reqs : extractRequirements('litsenziya soliq qarzi STIR aylanma tajriba kafolat muddat jarima'));
  const shown = score || res.score;
  const col = shown >= 65 ? 'var(--accent)' : shown >= 40 ? 'var(--warn)' : 'var(--danger)';
  return (
    <div className="page">
      <nav className="text-xs mb-2" style={{ color: 'var(--muted)' }}>/ {t(lang, 'nav_passport')}</nav>
      <h1 className="font-display font-extrabold text-2xl">🏢 {t(lang, 'nav_passport')} <DemoBadge /></h1>
      <div className="grid md:grid-cols-3 gap-3 mt-3">
        <div className="card p-5 text-center">
          <div className="font-display font-extrabold text-5xl" style={{ color: col }}><CountUp value={shown} suffix="%" /></div>
          <p className="text-sm font-bold mt-1">{t(lang, 'readiness')}</p>
          <svg viewBox="0 0 120 12" className="w-full mt-3" aria-hidden><rect x="0" y="0" width="120" height="12" rx="6" fill="var(--surface2)" /><rect x="0" y="0" width={shown * 1.2} height="12" rx="6" fill={col} /></svg>
        </div>
        <div className="card p-4 md:col-span-2">
          <h3 className="font-bold text-sm">📎 {lang === 'uz' ? 'Hujjatlar (STIR nomuvofiqlik testi)' : 'Documents'}</h3>
          <ul className="text-sm mt-2 space-y-1">
            {passport.documents.map((d, i) => <li key={i} className="flex justify-between border-b py-1" style={{ borderColor: 'var(--line)' }}><span>{d.type} · {d.no} · STIR {d.stir}</span><StatusChip s={d.valid ? 'pass' : 'fail'} /></li>)}
          </ul>
          <label className="text-xs mt-2 block">Moliyaviy hisobot STIR (mismatch demo): <input className="input !w-40" value={stir2} onChange={e => setStir2(e.target.value)} /></label>
          <h3 className="font-bold text-sm mt-3">🧾 {lang === 'uz' ? 'Moslik tafsiloti' : 'Fit detail'}</h3>
          <ul className="text-xs mt-1 space-y-1 max-h-48 overflow-auto">
            {res.items.map((it, i) => <li key={i} className="flex gap-2 items-start"><StatusChip s={it.status} /><span><b>{it.key}</b> — “{it.quote.slice(0, 80)}…” (p.{it.page}){it.note === 'manual-check' ? ' · ✋ qo‘lda tekshirish' : ''}</span></li>)}
          </ul>
        </div>
      </div>
      <Legal />
    </div>
  );
}

// ---------- C. DECISION ----------
const W0 = { fit: 30, margin: 20, capacity: 20, risk: 20, effort: 10 };
export function Decision() {
  const { lang } = useStore();
  const [w, setW] = useState(W0);
  const [blocked, setBlocked] = useState(false);
  const [days, setDays] = useState(7);
  const norm: Record<string, number> = {}; const s = Object.values(w).reduce((a, b) => a + b, 0);
  Object.entries(w).forEach(([k, v]) => norm[k] = v / s);
  const r = decide(norm, blocked, days);
  const col = r.verdict === 'GO' ? 'var(--accent)' : r.verdict === 'CONDITIONAL' ? 'var(--warn)' : 'var(--danger)';
  return (
    <div className="page">
      <nav className="text-xs mb-2" style={{ color: 'var(--muted)' }}>/ {t(lang, 'nav_decision')}</nav>
      <h1 className="font-display font-extrabold text-2xl">⚖️ {t(lang, 'nav_decision')}</h1>
      <div className="grid md:grid-cols-2 gap-3 mt-3">
        <div className="card p-4">
          {Object.entries(w).map(([k, v]) => (
            <label key={k} className="block text-sm my-3">{k} — <b>{v}%</b>
              <input type="range" min={5} max={50} value={v} className="w-full" aria-label={k}
                onChange={e => setW({ ...w, [k]: +e.target.value })} /></label>
          ))}
          <label className="text-sm flex gap-2 items-center"><input type="checkbox" checked={blocked} onChange={e => setBlocked(e.target.checked)} /> {lang === 'uz' ? 'To‘siq bor (masalan, maxsus litsenziya — T-102)' : 'Blocking requirement (e.g. special license — T-102)'}</label>
          <label className="text-sm block mt-2">{lang === 'uz' ? 'Ish hajmi (kun)' : 'Effort (days)'}: <input type="number" className="input !w-24" value={days} onChange={e => setDays(+e.target.value)} /></label>
        </div>
        <div className="card p-6 text-center">
          <div className="chip mx-auto" style={{ background: col, color: '#fff', fontSize: 20, padding: '.5rem 1.5rem' }}>{t(lang, r.verdict === 'GO' ? 'go' : r.verdict === 'CONDITIONAL' ? 'conditional' : 'nogo')}</div>
          <div className="font-display font-extrabold text-4xl mt-3"><CountUp value={Math.round(r.score)} /></div>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>confidence {r.confidence} · {r.assumptions.join(', ')}</p>
          <Legal />
        </div>
      </div>
    </div>
  );
}

// ---------- D. GENERATOR ----------
const TPL: Record<string, { uz: string; en: string; ru: string }> = {
  guarantee_letter: { uz: 'Kafolat xati', en: 'Guarantee letter', ru: 'Гарантийное письмо' },
  experience_ref: { uz: 'Tajriba maʼlumotnomasi', en: 'Experience reference', ru: 'Справка об опыте' },
  tech_proposal: { uz: 'Texnik taklif', en: 'Technical proposal', ru: 'Техническое предложение' },
  tax_letter: { uz: 'Soliq qarzi yo‘qligi xati', en: 'Tax clearance letter', ru: 'Письмо об отсутствии задолженности' },
};
export function Docs() {
  const { lang } = useStore();
  const [kind, setKind] = useState('guarantee_letter');
  const body = `${TPL[kind][lang]}\n\nKompaniya: ${DEMO_PASSPORT.name}\nSTIR: ${DEMO_PASSPORT.stir}\nSana: ${new Date().toISOString().slice(0, 10)}\n\nMazmun: tender T-2026/118 bo‘yicha majburiyatlarni tasdiqlaymiz.\n\n⚖️ Yordamchi vosita — mutaxassis tekshiruvi shart.`;
  return (
    <div className="page">
      <nav className="text-xs mb-2" style={{ color: 'var(--muted)' }}>/ {t(lang, 'nav_docs')}</nav>
      <h1 className="font-display font-extrabold text-2xl">📝 {t(lang, 'nav_docs')} <DemoBadge /></h1>
      <div className="flex gap-2 mt-3 flex-wrap" role="tablist">
        {Object.entries(TPL).map(([k, v]) => (
          <button key={k} role="tab" aria-selected={kind === k} className="btn" style={{ border: '1px solid var(--line)', background: kind === k ? 'var(--surface2)' : 'transparent' }} onClick={() => setKind(k)}>{v[lang]}</button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-3 mt-3">
        <div className="card p-4"><h3 className="font-bold text-sm mb-2">{lang === 'uz' ? 'Oldindan ko‘rish' : 'Preview'}</h3><pre className="text-xs whitespace-pre-wrap max-h-80 overflow-auto">{body}</pre></div>
        <div className="card p-4">
          <h3 className="font-bold text-sm mb-2">⬇️ Download</h3>
          <div className="flex gap-2">
            <button className="btn grad-btn" style={{ color: '#fff' }} onClick={() => download(`${kind}.txt`, body)}>TXT</button>
            <button className="btn" style={{ border: '1px solid var(--line)' }} onClick={() => download(`${kind}.doc`, `<html><body><pre>${escapeHtml(body)}</pre></body></html>`, 'application/msword')}>DOC</button>
            <button className="btn" style={{ border: '1px solid var(--line)' }} onClick={() => window.print()}>PDF (print)</button>
          </div>
          <Legal />
        </div>
      </div>
    </div>
  );
}
