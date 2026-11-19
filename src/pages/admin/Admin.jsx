import { useEffect, useMemo, useState } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { supabase, hasSupabase } from '../../lib/supabase.js'
import { makeApi } from '../../lib/api.js'
import { useTournament } from '../../store/TournamentContext.jsx'
import Live from './Live.jsx'
import Lineups from './Lineups.jsx'
import TeamsAdmin from './TeamsAdmin.jsx'
import Fixtures from './Fixtures.jsx'
import SponsorsAdmin from './SponsorsAdmin.jsx'
import Settings from './Settings.jsx'
import './admin.css'

function Login({ onError }) {
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [busy, setBusy] = useState(false)
  async function submit(e) {
    e.preventDefault(); setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false); if (error) onError(error.message)
  }
  return (
    <form className="adm-login" onSubmit={submit}>
      <img src="/logos/mml.webp" alt="" width="72" height="72" />
      <h1>MML 4.0 admin</h1>
      <label>Email<input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required /></label>
      <label>Password<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
      <button className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  )
}

const NAV = [['live', 'Live'], ['lineups', 'Lineups'], ['teams', 'Teams'], ['fixtures', 'Fixtures'], ['sponsors', 'Sponsors'], ['settings', 'Settings']]

export default function Admin() {
  const { dispatch, loading } = useTournament()
  const api = useMemo(() => makeApi(dispatch), [dispatch])
  const [session, setSession] = useState(hasSupabase ? undefined : { demo: true })
  const [isAdmin, setIsAdmin] = useState(!hasSupabase)
  const [toast, setToast] = useState(null)
  const say = (msg, kind = 'err') => { setToast({ msg, kind }); setTimeout(() => setToast(null), 3500) }

  useEffect(() => {
    if (!hasSupabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])
  useEffect(() => {
    if (!hasSupabase || !session) return
    supabase.from('admins').select('user_id').eq('user_id', session.user.id).maybeSingle()
      .then(({ data }) => setIsAdmin(Boolean(data)))
  }, [session])

  // wrap api calls so every failure shows a readable message
  const safe = useMemo(() => Object.fromEntries(Object.entries(api).map(([k, fn]) => [k, async (...a) => {
    try { return await fn(...a) } catch (e) { say(`Not saved: ${e.message}`); throw e }
  }])), [api])

  if (session === undefined || loading) return <div className="adm"><p className="adm-pad muted">Loading…</p></div>
  if (!session) return <div className="adm">{toast && <div className="toast err">{toast.msg}</div>}<Login onError={say} /></div>
  if (!isAdmin) return (
    <div className="adm adm-pad">
      <h1>No edit access</h1>
      <p className="muted">You're signed in as {session.user.email}, but this account isn't on the admin list. Add it in Supabase (see README, step 4), then reload.</p>
      <button className="btn ghost" onClick={() => supabase.auth.signOut()}>Sign out</button>
    </div>
  )
  return (
    <div className="adm">
      <header className="adm-top">
        <NavLink to="/" className="adm-brand"><img src="/logos/mml.webp" alt="" />Admin</NavLink>
        <nav>{NAV.map(([p, l]) => <NavLink key={p} to={`/admin/${p}`}>{l}</NavLink>)}</nav>
      </header>
      {!hasSupabase && <p className="notice adm-pad">Demo mode: Supabase isn't connected, so changes only live in this browser tab.</p>}
      {toast && <div className={`toast ${toast.kind}`} role="status">{toast.msg}</div>}
      <Routes>
        <Route index element={<Navigate to="live" replace />} />
        <Route path="live" element={<Live api={safe} say={say} />} />
        <Route path="lineups" element={<Lineups api={safe} say={say} />} />
        <Route path="teams" element={<TeamsAdmin api={safe} say={say} />} />
        <Route path="fixtures" element={<Fixtures api={safe} say={say} />} />
        <Route path="sponsors" element={<SponsorsAdmin api={safe} say={say} />} />
        <Route path="settings" element={<Settings api={safe} say={say} signOut={hasSupabase ? () => supabase.auth.signOut() : null} />} />
      </Routes>
    </div>
  )
}
