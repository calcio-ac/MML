import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { TournamentProvider, useTournament, DEMO } from './store/TournamentContext.jsx'
import LiveBar from './components/LiveBar.jsx'
import TabBar from './components/TabBar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Matches from './pages/Matches.jsx'
import Match from './pages/Match.jsx'
import Table from './pages/Table.jsx'
import Teams from './pages/Teams.jsx'
import Team from './pages/Team.jsx'
import Stats from './pages/Stats.jsx'

const Admin = lazy(() => import('./pages/admin/Admin.jsx'))

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function PublicShell({ children }) {
  const { error } = useTournament()
  return (
    <div className="app">
      <LiveBar />
      {DEMO && <p className="notice" style={{ position: 'fixed', top: 56, left: 12, right: 12, zIndex: 25, margin: 0, padding: '6px 12px' }}>Preview with sample data. Scores aren't real until Supabase is connected.</p>}
      {error && <p className="notice" style={{ position: 'fixed', top: 60, left: 16, right: 16, zIndex: 40 }}>Can't reach the scores server: {error}. Pull to refresh in a moment.</p>}
      {children}
      <div className="page" style={{ paddingTop: 0 }}><Footer /></div>
      <TabBar />
    </div>
  )
}

export default function App() {
  return (
    <TournamentProvider>
      <ScrollTop />
      <Routes>
        <Route path="/admin/*" element={<Suspense fallback={null}><Admin /></Suspense>} />
        <Route path="/" element={<PublicShell><Home /></PublicShell>} />
        <Route path="/matches" element={<PublicShell><Matches /></PublicShell>} />
        <Route path="/match/:id" element={<PublicShell><Match /></PublicShell>} />
        <Route path="/table" element={<PublicShell><Table /></PublicShell>} />
        <Route path="/teams" element={<PublicShell><Teams /></PublicShell>} />
        <Route path="/team/:id" element={<PublicShell><Team /></PublicShell>} />
        <Route path="/stats" element={<PublicShell><Stats /></PublicShell>} />
        <Route path="*" element={<PublicShell><main className="page"><p className="empty">This page doesn't exist. Use the tabs below.</p></main></PublicShell>} />
      </Routes>
    </TournamentProvider>
  )
}
