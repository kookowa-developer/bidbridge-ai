import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from './lib/store';
import Landing from './pages/Landing';
import { Analyze, Passport, Decision, Docs } from './pages/Analyze';
import { Tenders, Academy, Market, Team, Dash, Tg, Auth } from './pages/Modules';
import { Sidebar, Topbar, Tour } from './components/ui';

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar />
        <main className="p-4 max-w-5xl mx-auto">{children}</main>
      </div>
      <Tour />
    </div>
  );
}

export default function App() {
  return (
    <Provider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/app/analyze" element={<Shell><Analyze /></Shell>} />
          <Route path="/app/passport" element={<Shell><Passport /></Shell>} />
          <Route path="/app/decision" element={<Shell><Decision /></Shell>} />
          <Route path="/app/docs" element={<Shell><Docs /></Shell>} />
          <Route path="/app/tenders" element={<Shell><Tenders /></Shell>} />
          <Route path="/app/academy" element={<Shell><Academy /></Shell>} />
          <Route path="/app/market" element={<Shell><Market /></Shell>} />
          <Route path="/app/team" element={<Shell><Team /></Shell>} />
          <Route path="/app/dash" element={<Shell><Dash /></Shell>} />
          <Route path="/app/tg" element={<Shell><Tg /></Shell>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
    </Provider>
  );
}
