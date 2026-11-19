// Demo data so the site and admin work before Supabase is connected (and for local previews).
import { TEAMS, SPONSORS, buildMatches, SETTINGS } from '../data/seedData.js'

const FIRST = ['Aflah', 'Rihab', 'Ashiq', 'Abir', 'Naseef', 'Vichu', 'Arjun', 'Chacko', 'Nihal', 'Rub', 'Akhil', 'Eljo', 'Mubeen', 'Rishan', 'Jithin', 'Sreyas', 'Alan', 'Basil', 'Fahad', 'Gokul', 'Hari', 'Irfan', 'Jobin', 'Kiran', 'Linto']
const POS = ['GK', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'FWD', 'FWD']

export function demoState() {
  const players = []
  TEAMS.forEach((t, ti) => POS.forEach((position, pi) => players.push({
    id: `${t.id}-p${pi}`, team_id: t.id, name: FIRST[(ti * 5 + pi) % FIRST.length], position,
  })))
  const now = Date.now()
  const matches = buildMatches().map((m, i) => {
    if (i < 3) return { ...m, status: 'ft', clock_offset_s: 600 }
    if (i === 3) return { ...m, status: 'live', clock_started_at: new Date(now - 6.5 * 60_000).toISOString(), clock_offset_s: 0 }
    return m
  })
  const goal = (match, team, pi, minute, type = 'goal') => ({
    id: `${match}-${team}-${pi}-${minute}`, match_id: match, type, team_id: team, player_id: `${team}-p${pi}`, minute, created_at: new Date(now).toISOString(),
  })
  const [g1, g2, g3, g4] = matches
  const events = [
    goal(g1.id, g1.home_team_id, 6, 3), goal(g1.id, g1.home_team_id, 7, 8), goal(g1.id, g1.away_team_id, 6, 9),
    goal(g2.id, g2.away_team_id, 7, 5), { ...goal(g2.id, g2.home_team_id, 2, 7, 'yellow') },
    goal(g3.id, g3.home_team_id, 6, 2), goal(g3.id, g3.away_team_id, 6, 6),
    goal(g4.id, g4.home_team_id, 7, 4),
  ]
  const lineups = matches.slice(0, 5).flatMap(m => [m.home_team_id, m.away_team_id].map(tid => ({
    match_id: m.id, team_id: tid, formation: '1-2-1', slots: [0, 1, 3, 4, 6].map(pi => `${tid}-p${pi}`),
  })))
  return { teams: TEAMS, players, matches, events, lineups, sponsors: SPONSORS, settings: SETTINGS }
}
