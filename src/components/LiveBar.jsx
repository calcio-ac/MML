import { Link } from 'react-router-dom'
import { useTournament } from '../store/TournamentContext.jsx'
import Crest from './Crest.jsx'
import { StatusPill } from './MatchRow.jsx'
import { kickoff } from './format.js'

export function currentMatch(matches) {
  return matches.find(m => m.status === 'live' || m.status === 'paused')
    || matches.find(m => m.status === 'scheduled')
    || matches[matches.length - 1]
}

export default function LiveBar() {
  const { matches, team, score } = useTournament()
  const m = currentMatch(matches)
  const h = m && team(m.home_team_id), a = m && team(m.away_team_id)
  const s = m && score(m)
  return (
    <header className="livebar">
      <Link to="/" className="brand"><img src="/logos/mml.webp" alt="" />MML 4.0</Link>
      {m && (
        <Link to={`/match/${m.id}`} className="now" aria-label="Current match">
          {m.status === 'scheduled' ? <span className="pill next">Next {kickoff(m.kickoff_at)}</span> : <StatusPill match={m} />}
          <Crest team={h} />
          <b>{m.status === 'scheduled' ? 'v' : `${s.home}–${s.away}`}</b>
          <Crest team={a} />
        </Link>
      )}
    </header>
  )
}
