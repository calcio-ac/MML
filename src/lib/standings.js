import { scoreOf } from './score.js'

function table(teamIds, matches, events) {
  const rows = new Map(teamIds.map(id => [id, { team_id: id, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 }]))
  for (const m of matches) {
    const h = rows.get(m.home_team_id), a = rows.get(m.away_team_id)
    if (!h || !a) continue
    const s = scoreOf(m, events)
    h.p++; a.p++
    h.gf += s.home; h.ga += s.away; a.gf += s.away; a.ga += s.home
    if (s.home > s.away) { h.w++; a.l++; h.pts += 3 }
    else if (s.home < s.away) { a.w++; h.l++; a.pts += 3 }
    else { h.d++; a.d++; h.pts++; a.pts++ }
  }
  for (const r of rows.values()) r.gd = r.gf - r.ga
  return [...rows.values()]
}

const key = r => `${r.pts}|${r.gd}|${r.gf}`

/** Group table: points → GD → GF → head-to-head points → teams.tiebreak_rank → name. */
export function computeStandings(teams, matches, events) {
  const done = matches.filter(m => m.stage === 'group' && m.status === 'ft')
  const byId = new Map(teams.map(t => [t.id, t]))
  const rows = table(teams.map(t => t.id), done, events)
  const groups = new Map()
  for (const r of rows) groups.set(key(r), [...(groups.get(key(r)) || []), r])
  const h2h = new Map()
  for (const g of groups.values()) {
    if (g.length < 2) continue
    const ids = new Set(g.map(r => r.team_id))
    const mini = table([...ids], done.filter(m => ids.has(m.home_team_id) && ids.has(m.away_team_id)), events)
    for (const r of mini) h2h.set(r.team_id, r.pts)
  }
  const rank = id => byId.get(id)?.tiebreak_rank ?? Infinity
  const name = id => byId.get(id)?.name ?? id
  return rows.sort((x, y) =>
    y.pts - x.pts || y.gd - x.gd || y.gf - x.gf ||
    (h2h.get(y.team_id) ?? 0) - (h2h.get(x.team_id) ?? 0) ||
    rank(x.team_id) - rank(y.team_id) || name(x.team_id).localeCompare(name(y.team_id)))
}

/** Golden Boot: real goals only (own goals excluded). */
export function topScorers(events, players) {
  const count = new Map()
  for (const e of events) if (e.type === 'goal' && e.player_id) count.set(e.player_id, (count.get(e.player_id) || 0) + 1)
  return players.filter(p => count.has(p.id))
    .map(p => ({ player_id: p.id, name: p.name, team_id: p.team_id, goals: count.get(p.id) }))
    .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name))
}
