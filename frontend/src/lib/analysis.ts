// Real client-side analysis engine (mirrors backend/app/main.py)
export interface Req { key: string; kind: string; keyword: string; quote: string; page: number; offset: number; }
export interface CheckItem extends Req { status: 'pass' | 'warn' | 'fail' | 'manual'; note?: string }

const CHARS_PER_PAGE = 1800;
const RULES: [string, string[], string][] = [
  ['license', ['litsenziya', 'лицензия', 'license'], 'doc'],
  ['tax_clearance', ['soliq qarzi', 'налогов', 'tax clearance', "qarzi yo'q"], 'doc'],
  ['stir', ['stir', 'стир', 'tin'], 'doc'],
  ['turnover', ['aylanma', 'оборот', 'turnover', "so'm", 'сум', 'uzs'], 'numeric'],
  ['experience', ['tajriba', 'опыт', 'experience', 'yil', 'лет', 'years'], 'numeric'],
  ['guarantee', ["ta'minot", 'обеспечен', 'guarantee', 'kafolat', '%'], 'numeric'],
  ['deadline', ['muddat', 'срок', 'deadline', 'topshirish', 'подач'], 'date'],
  ['risk_penalty', ['jarima', 'штраф', 'penalty', 'penya'], 'risk'],
  ['risk_onesided', ['bir tomonlama', 'односторон', 'unilateral'], 'risk'],
  ['risk_short', ['qisqa muddat', 'короткий срок', 'urgent'], 'risk'],
];

export function extractRequirements(text: string): Req[] {
  const low = text.toLowerCase(); const out: Req[] = [];
  for (const [key, kws, kind] of RULES) {
    for (const kw of kws) {
      const i = low.indexOf(kw.toLowerCase());
      if (i >= 0) {
        const s = Math.max(0, i - 140), e = Math.min(text.length, i + 220);
        out.push({ key, kind, keyword: kw, quote: text.slice(s, e).replace(/\s+/g, ' '), page: Math.floor(s / CHARS_PER_PAGE) + 1, offset: s });
        break;
      }
    }
  }
  return out;
}

export interface Passport { name: string; stir: string; documents: { type: string; no: string; valid: boolean; stir?: string; owner?: string }[]; metrics: Record<string, number>; experience: string[]; }

export function checkCompliance(passport: Passport, reqs: Req[]): { score: number; items: CheckItem[] } {
  const docs: Record<string, boolean> = {};
  passport.documents.forEach(d => { docs[d.type] = d.valid; });
  const items: CheckItem[] = reqs.map(r => {
    if (r.kind === 'doc') {
      const ok = !!docs[r.key];
      return { ...r, status: ok ? 'pass' : (r.key === 'stir' ? 'manual' : 'fail') };
    }
    if (r.kind === 'risk') return { ...r, status: 'warn' };
    if (r.kind === 'numeric') return { ...r, status: 'warn', note: 'manual-check' };
    return { ...r, status: 'manual' };
  });
  const stirs = new Set(passport.documents.map(d => d.stir).filter(Boolean));
  const owners = new Set(passport.documents.map(d => d.owner).filter(Boolean));
  if (stirs.size > 1 || owners.size > 1)
    items.push({ key: 'cross_mismatch', kind: 'doc', keyword: 'STIR', quote: `STIR/nom mos emas`, page: 0, offset: 0, status: 'fail' });
  if (!items.length) return { score: 0, items };
  const w = { pass: 1, warn: 0.5, manual: 0.3, fail: 0 };
  return { score: Math.round(100 * items.reduce((a, i) => a + w[i.status], 0) / items.length), items };
}

export function decide(weights: Record<string, number>, blocked: boolean, effortDays: number) {
  if (blocked) return { verdict: 'NO-GO' as const, score: 8, confidence: 0.92, assumptions: ['blocking-requirement-present'] };
  const s = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
  const n: Record<string, number> = {}; Object.entries(weights).forEach(([k, v]) => n[k] = v / s);
  const score = Math.round(100 * ((n.fit ?? .25) * .9 + (n.margin ?? .2) * .7 + (n.capacity ?? .2) * .8 - (n.risk ?? .2) * .6 - Math.min(effortDays / 30, 1) * .15) * 10) / 10;
  return { verdict: (score >= 65 ? 'GO' : score >= 40 ? 'CONDITIONAL' : 'NO-GO') as 'GO' | 'CONDITIONAL' | 'NO-GO', score, confidence: Math.round(Math.max(.5, Math.min(.9, .6 + Object.keys(weights).length * .05)) * 100) / 100, assumptions: ['weights-user-adjustable', 'manual-review-required'] };
}

export function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function download(filename: string, content: string | Blob, mime = 'text/plain') {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime + ';charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
