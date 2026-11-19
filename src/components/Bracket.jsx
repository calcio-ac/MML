import { Link } from 'react-router-dom'
import { useTournament } from '../store/TournamentContext.jsx'
import { matchWinner } from '../lib/score.js'
import Crest from './Crest.jsx'
import { sourceLabel, kickoff } from './format.js'

function Ko({ m, label }) {
  const { team, score, events } = useTournament()
  if (!m) return null
  const s = score(m), w = matchWinner(m, events), started = m.status !== 'scheduled'
  const row = (id, src, g) => (
    <div className={`row${w ? (w === id ? ' win' : ' lose') : ''}`}>
      <Crest team={team(id)} />{team(id)?.name ?? sourceLabel(src)}<b>{started ? g : ''}</b>
    </div>
  )
  return (
    <Link to={`/match/${m.id}`} className={`ko${m.stage === 'final' ? ' final' : ''}`}>
      <span className="lbl">{label} · {kickoff(m.kickoff_at)}</span>
      {row(m.home_team_id, m.home_source, s.home)}
      {row(m.away_team_id, m.away_source, s.away)}
    </Link>
  )
}
export default function Bracket() {
  const { matches } = useTournament()
  const get = id => matches.find(m => m.id === id)
  return (
    <div className="bracket">
      <Ko m={get('SF1')} label="Semi-final 1" />
      <Ko m={get('SF2')} label="Semi-final 2" />
      <Ko m={get('F')} label="Final" />
    </div>
  )
}
