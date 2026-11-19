import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { supabase, hasSupabase } from '../lib/supabase.js'
import { computeStandings, topScorers } from '../lib/standings.js'
import { resolveKnockouts } from '../lib/fixtures.js'
import { scoreOf } from '../lib/score.js'
import { demoState } from './demo.js'
import { SPONSORS } from '../data/seedData.js'

// table name in DB → key in state, primary key function
export const TABLES = {
  teams: ['teams', r => r.id],
  players: ['players', r => r.id],
  matches: ['matches', r => r.id],
  match_events: ['events', r => r.id],
  lineups: ['lineups', r => `${r.match_id}:${r.team_id}`],
  sponsors: ['sponsors', r => r.id],
}

const empty = { teams: [], players: [], matches: [], events: [], lineups: [], sponsors: [], settings: { match_minutes: 10 } }

function reducer(state, action) {
  if (action.type === 'load') return { ...state, ...action.data }
  if (action.type === 'change') {
    const { table, op, row, old } = action
    if (table === 'settings') {
      if (op === 'DELETE') return state
      return { ...state, settings: { ...state.settings, [row.key]: row.value } }
    }
    const [key, pk] = TABLES[table] || []
    if (!key) return state
    const list = state[key]
    if (op === 'DELETE') return { ...state, [key]: list.filter(r => pk(r) !== pk(old)) }
    const i = list.findIndex(r => pk(r) === pk(row))
    const next = i === -1 ? [...list, row] : list.map((r, j) => (j === i ? { ...r, ...row } : r))
    return { ...state, [key]: next }
  }
  return state
}

const Ctx = createContext(null)
export const DEMO = !hasSupabase

export function TournamentProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, empty)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!hasSupabase) { dispatch({ type: 'load', data: demoState() }); setLoading(false); return }
    let alive = true
    async function load() {
      const q = (t, order) => supabase.from(t).select('*').order(order)
      const [teams, players, matches, events, lineups, sponsors, settings] = await Promise.all([
        q('teams', 'sort'), q('players', 'name'), q('matches', 'kickoff_at'), q('match_events', 'created_at'),
        supabase.from('lineups').select('*'), q('sponsors', 'sort'), supabase.from('settings').select('*'),
      ])
      const err = [teams, players, matches, events, lineups, sponsors, settings].find(r => r.error)
      if (!alive) return
      if (err) { setError(err.error.message); setLoading(false); return }
      dispatch({ type: 'load', data: {
        teams: teams.data, players: players.data, matches: matches.data, events: events.data, lineups: lineups.data,
        sponsors: sponsors.data.length ? sponsors.data : SPONSORS, settings: { ...empty.settings, ...Object.fromEntries(settings.data.map(s => [s.key, s.value])) },
      } })
      setLoading(false)
    }
    // Light refresh of only the match-day tables (3 small queries).
    async function refreshLive() {
      const [matches, events, lineups] = await Promise.all([
        supabase.from('matches').select('*').order('kickoff_at'),
        supabase.from('match_events').select('*').order('created_at'),
        supabase.from('lineups').select('*'),
      ])
      if (!alive || matches.error || events.error || lineups.error) return
      dispatch({ type: 'load', data: { matches: matches.data, events: events.data, lineups: lineups.data } })
    }
    load()
    // Realtime pushes changes instantly. If the project hits its realtime connection limit
    // (Supabase Free: 200, Pro: 500) the join is refused; those visitors fall back to polling.
    let live = false, timer = null
    const schedule = () => {
      clearInterval(timer)
      timer = setInterval(() => { if (document.visibilityState === 'visible') refreshLive() }, live ? 60_000 : 15_000)
    }
    const channel = supabase.channel('mml-live')
      .on('postgres_changes', { event: '*', schema: 'public' }, p =>
        dispatch({ type: 'change', table: p.table, op: p.eventType, row: p.new, old: p.old }))
      .subscribe(status => {
        const was = live
        live = status === 'SUBSCRIBED'
        if (live && !was) refreshLive() // re-sync after (re)connect
        if (live !== was || !timer) schedule()
      })
    schedule()
    const onVisible = () => document.visibilityState === 'visible' && refreshLive()
    document.addEventListener('visibilitychange', onVisible)
    return () => { alive = false; clearInterval(timer); supabase.removeChannel(channel); document.removeEventListener('visibilitychange', onVisible) }
  }, [])

  const value = useMemo(() => {
    const standings = computeStandings(state.teams, state.matches, state.events)
    const groupDone = state.matches.filter(m => m.stage === 'group').every(m => m.status === 'ft') && state.matches.length > 0
    const matches = resolveKnockouts(state.matches, standings, groupDone, state.events)
      .slice().sort((a, b) => (a.kickoff_at || '').localeCompare(b.kickoff_at || '') || a.number - b.number)
    const team = id => state.teams.find(t => t.id === id)
    const player = id => state.players.find(p => p.id === id)
    return {
      ...state, rawMatches: state.matches, matches, loading, error, standings, groupDone, dispatch,
      scorers: topScorers(state.events, state.players),
      team, player,
      score: m => scoreOf(m, state.events),
      eventsOf: id => state.events.filter(e => e.match_id === id).sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0) || (a.created_at || '').localeCompare(b.created_at || '')),
      lineupOf: (mid, tid) => state.lineups.find(l => l.match_id === mid && l.team_id === tid),
      matchMinutes: Number(state.settings.match_minutes) || 10,
    }
  }, [state, loading, error])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useTournament = () => useContext(Ctx)
