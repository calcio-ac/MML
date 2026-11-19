/** Goals for a match, derived from events. Own goals carry the benefiting team in team_id. */
export function scoreOf(match, events) {
  let home = 0, away = 0
  for (const e of events) {
    if (e.match_id !== match.id || (e.type !== 'goal' && e.type !== 'own_goal')) continue
    if (e.team_id === match.home_team_id) home++
    else if (e.team_id === match.away_team_id) away++
  }
  return { home, away }
}

/** Winner team id of a finished match (penalties decide knockout draws), else null. */
export function matchWinner(match, events) {
  if (match.status !== 'ft') return null
  const s = scoreOf(match, events)
  if (s.home !== s.away) return s.home > s.away ? match.home_team_id : match.away_team_id
  if (match.stage === 'group') return null
  const hp = match.home_pens ?? 0, ap = match.away_pens ?? 0
  if (hp === ap) return null
  return hp > ap ? match.home_team_id : match.away_team_id
}
