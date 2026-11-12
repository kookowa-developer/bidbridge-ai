import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Lang } from '../i18n/dict';
import { DEMO_PASSPORT, demoTender } from './demo';
import { extractRequirements, checkCompliance, type Req } from './analysis';

export type Theme = 'light' | 'dark' | 'system';
interface Store {
  lang: Lang; setLang: (l: Lang) => void;
  theme: Theme; setTheme: (t: Theme) => void; resolved: 'light' | 'dark';
  authed: boolean; login: () => void; logout: () => void;
  docText: string; setDocText: (s: string) => void;
  reqs: Req[]; score: number;
  runDemo: () => void; analyze: (text: string) => void;
  notif: string[]; push: (s: string) => void;
  timeLogs: { manual: number; with: number }[]; logTime: (m: number, w: number) => void;
  tour: number; setTour: (n: number) => void;
}
const Ctx = createContext<Store>(null as unknown as Store);
export const useStore = () => useContext(Ctx);

const getSystem = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export function Provider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('bb-lang') as Lang) || 'uz');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('bb-theme') as Theme) || 'system');
  const [resolved, setResolved] = useState<'light' | 'dark'>('dark');
  const [authed, setAuthed] = useState(() => !!localStorage.getItem('bb-token'));
  const [docText, setDocText] = useState('');
  const [reqs, setReqs] = useState<Req[]>([]);
  const [score, setScore] = useState(0);
  const [notif, setNotif] = useState<string[]>(['T-102 muddati 12 kundan keyin tugaydi']);
  const [timeLogs, setTimeLogs] = useState<{ manual: number; with: number }[]>(() => {
    try { return JSON.parse(localStorage.getItem('bb-time') || '[]'); } catch { return []; }
  });
  const [tour, setTour] = useState(-1);

  useEffect(() => { localStorage.setItem('bb-lang', lang); document.documentElement.lang = lang; }, [lang]);
  useEffect(() => {
    localStorage.setItem('bb-theme', theme);
    const r = theme === 'system' ? getSystem() : theme;
    setResolved(r); document.documentElement.dataset.theme = r;
  }, [theme]);

  const analyze = (text: string) => {
    setDocText(text);
    const r = extractRequirements(text);
    setReqs(r);
    setScore(checkCompliance(DEMO_PASSPORT, r).score);
  };
  const runDemo = () => {
    localStorage.setItem('bb-token', 'demo-token');
    setAuthed(true);
    analyze(demoTender(lang));
    push('DEMO yuklandi: kompaniya, tenderlar, kurslar, birja');
  };
  const push = (s: string) => setNotif(n => [s, ...n].slice(0, 8));
  const logTime = (manual: number, withT: number) => {
    const v = [...timeLogs, { manual, with: withT }].slice(-50);
    setTimeLogs(v); localStorage.setItem('bb-time', JSON.stringify(v));
  };
  return <Ctx.Provider value={{ lang, setLang, theme, setTheme, resolved, authed, login: () => { localStorage.setItem('bb-token', 'demo-token'); setAuthed(true); }, logout: () => { localStorage.removeItem('bb-token'); setAuthed(false); }, docText, setDocText, reqs, score, runDemo, analyze, notif, push, timeLogs, logTime, tour, setTour }}>{children}</Ctx.Provider>;
}
