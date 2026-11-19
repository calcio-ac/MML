import { Link } from 'react-router-dom'
import { useTournament } from '../store/TournamentContext.jsx'
import { matchMinute } from '../lib/clock.js'
import { useNow } from '../hooks/useNow.js'
import Crest from './Crest.jsx'
import { kickoff, sourceLabel, stageShort } from './format.js'

export function StatusPill({ match }) {
  const { matchMinutes } = useTournament()
  const now = useNow(1000)
  if (match.status === 'live' || match.status === 'paused') {
    const { label } = matchMinute(match, now, matchMinutes)
    return <span className="pill live">{match.status === 'paused' ? 'Paused' : label}</span>
  }
  if (match.status === 'ft') return <span className="pill ft">FT</span>
  return null
}

export default function MatchRow({ match }) {
  const { team, score } = useTournament()
  const h = team(match.home_team_id), a = team(match.away_team_id)
  const started = match.status !== 'scheduled'
  const s = score(match)
  const live = match.status === 'live' || match.status === 'paused'
  return (
    <Link to={`/match/${match.id}`} className={`mrow${live ? ' is-live' : ''}`}>
      <div className="when">
        <div>{kickoff(match.kickoff_at)}</div>
        <span className="stage">{stageShort(match)}</span>
        <StatusPill match={match} />
      </div>
      <div className="side home"><Crest team={h} /><span>{h?.name ?? sourceLabel(match.home_source)}</span></div>
      <div className={`score${started ? '' : ' vs'}`} aria-label={started ? `${s.home} to ${s.away}` : 'not started'}>
        {started ? `${s.home}–${s.away}` : 'vs'}
        {match.home_pens != null && match.status === 'ft' && <div style={{ fontSize: 13, fontFamily: 'var(--body)', color: 'var(--paper-dim)' }}>pens {match.home_pens}–{match.away_pens}</div>}
      </div>
      <div className="side away"><Crest team={a} /><span>{a?.name ?? sourceLabel(match.away_source)}</span></div>
    </Link>
  )
}
