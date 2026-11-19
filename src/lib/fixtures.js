import { matchWinner } from './score.js'

/** Single round-robin ordered so no team plays two matches back to back (search over all pairs). */
export function roundRobin(teamIds) {
  const pairs = []
  for (let i = 0; i < teamIds.length; i++)
    for (let j = i + 1; j < teamIds.length; j++) pairs.push([teamIds[i], teamIds[j]])
  const out = [], used = new Array(pairs.length).fill(false)
  const homeCount = Object.fromEntries(teamIds.map(t => [t, 0]))
  const go = () => {
    if (out.length === pairs.length) return true
    const prev = out[out.length - 1]
    for (let k = 0; k < pairs.length; k++) {
      if (used[k] || (prev && pairs[k].some(t => prev.includes(t)))) continue
      used[k] = true; out.push(pairs[k])
      if (go()) return true
      used[k] = false; out.pop()
    }
    return false
  }
  if (!go()) { out.length = 0; out.push(...pairs) }
  // balance home/away: give home to whoever has hosted less
  return out.map(([a, b]) => {
    const p = homeCount[a] <= homeCount[b] ? [a, b] : [b, a]
    homeCount[p[0]]++
    return p
  })
}

/** Fill knockout team ids from sources "G1".."G4" (group position) and "W:SF1" (winner of semi 1). */
export function resolveKnockouts(matches, standings, groupDone, events) {
  const find = (src) => {
    if (!src) return null
    const g = /^G(\d)$/.exec(src)
    if (g) return groupDone ? standings[+g[1] - 1]?.team_id ?? null : null
    const w = /^W:SF(\d)$/.exec(src)
    if (w) {
      const sf = resolved.find(m => m.stage === 'sf' && m.number === +w[1])
      return sf ? matchWinner(sf, events) : null
    }
    return null
  }
  const resolved = []
  const order = [...matches].sort((a, b) => (a.stage === 'final') - (b.stage === 'final'))
  for (const m of order) {
    if (m.stage === 'group') { resolved.push(m); continue }
    resolved.push({ ...m, home_team_id: m.home_team_id ?? find(m.home_source), away_team_id: m.away_team_id ?? find(m.away_source) })
  }
  const byId = new Map(resolved.map(m => [m.id, m]))
  return matches.map(m => byId.get(m.id))
}

/** Kick-off changes when one match is moved; with cascade, every later match shifts by the same delta. */
export function shiftKickoffs(matches, id, newIso, cascade) {
  const target = matches.find(m => m.id === id)
  if (!target) return []
  const oldT = Date.parse(target.kickoff_at), delta = Date.parse(newIso) - oldT
  const out = [{ id, kickoff_at: new Date(Date.parse(newIso)).toISOString() }]
  if (!cascade || !delta || Number.isNaN(oldT)) return out
  for (const m of [...matches].sort((a, b) => Date.parse(a.kickoff_at) - Date.parse(b.kickoff_at)))
    if (m.id !== id && Date.parse(m.kickoff_at) > oldT) out.push({ id: m.id, kickoff_at: new Date(Date.parse(m.kickoff_at) + delta).toISOString() })
  return out
}
