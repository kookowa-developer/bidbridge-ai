import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/app.css';

try {
  createRoot(document.getElementById('root')!).render(<App />);
} catch (e) {
  document.getElementById('root')!.innerHTML =
    '<div style="padding:2rem;font-family:sans-serif"><h1>BidBridge AI</h1><p>Init error (env?). Check console and /api/diag. App did not fully crash — this message is the fallback.</p><pre>' + String(e) + '</pre></div>';
}
