import { useState } from 'react'
import { useTournament } from '../store/TournamentContext.jsx'
import MatchRow from '../components/MatchRow.jsx'
import { VENUE } from '../components/Venue.jsx'

const FILTERS = [['all', 'All'], ['group', 'Group'], ['ko', 'Semis & final']]
export default function Matches() {
  const { matches, teams } = useTournament()
  const [f, setF] = useState('all')
  const [t, setT] = useState('')
  const list = matches.filter(m => (f === 'all' || (f === 'group' ? m.stage === 'group' : m.stage !== 'group'))
    && (!t || m.home_team_id === t || m.away_team_id === t))
  return (
    <main className="page">
      <h1 style={{ fontSize: 64 }}>Matches</h1>
      <p className="muted">Sunday 22 November 2026 at <a href={VENUE.link} target="_blank" rel="noopener">{VENUE.name}</a>. One pitch, 10-minute matches.</p>
      <div className="filters" role="group" aria-label="Stage">
        {FILTERS.map(([k, l]) => <button key={k} aria-pressed={f === k} onClick={() => setF(k)}>{l}</button>)}
      </div>
      <div className="filters" role="group" aria-label="Team">
        <button aria-pressed={!t} onClick={() => setT('')}>All teams</button>
        {teams.map(x => <button key={x.id} aria-pressed={t === x.id} onClick={() => setT(x.id)}>{x.short_name}</button>)}
      </div>
      {list.length ? <div className="board">{list.map(m => <MatchRow key={m.id} match={m} />)}</div>
        : <p className="empty">No matches for this filter.</p>}
    </main>
  )
}
