import { Link, useParams } from 'react-router-dom'
import { useTournament } from '../store/TournamentContext.jsx'
import Crest from '../components/Crest.jsx'
import MatchRow from '../components/MatchRow.jsx'

const GROUPS = [['GK', 'Goalkeepers'], ['DEF', 'Defenders'], ['MID', 'Midfielders'], ['FWD', 'Forwards']]
export default function Team() {
  const { id } = useParams()
  const { team, players, matches, scorers, standings, loading } = useTournament()
  const t = team(id)
  if (!t) return <main className="page"><p className="empty">{loading ? 'Loading…' : 'Team not found.'} <Link to="/teams">All teams</Link></p></main>
  const squad = players.filter(p => p.team_id === id)
  const goals = Object.fromEntries(scorers.filter(s => s.team_id === id).map(s => [s.player_id, s.goals]))
  const pos = standings.findIndex(r => r.team_id === id) + 1
  const row = standings.find(r => r.team_id === id)
  return (
    <main className="page">
      <div className="team-head">
        <Crest team={t} size="xl" />
        <div>
          <h1>{t.name}</h1>
          {row && <p className="muted" style={{ margin: '8px 0 0' }}>{pos}{['st', 'nd', 'rd'][pos - 1] || 'th'} in the table · {row.pts} pts from {row.p} played</p>}
        </div>
      </div>
      <div className="staff">
        <div><small>Manager</small><b>{t.manager || 'To be announced'}</b></div>
        <div><small>Team director</small><b>{t.team_director || 'To be announced'}</b></div>
      </div>
      <section className="section">
        <h2>Squad</h2>
        {squad.length ? (
          <div className="squad">
            {GROUPS.map(([k, label]) => {
              const list = squad.filter(p => p.position === k)
              if (!list.length) return null
              return <div key={k}><h3>{label}</h3><ul>{list.map(p => <li key={p.id}>{p.name}{goals[p.id] ? <em>⚽ {goals[p.id]}</em> : null}</li>)}</ul></div>
            })}
          </div>
        ) : <p className="empty">Squad not announced yet.</p>}
      </section>
      <section className="section">
        <h2>Matches</h2>
        <div className="board">{matches.filter(m => m.home_team_id === id || m.away_team_id === id).map(m => <MatchRow key={m.id} match={m} />)}</div>
      </section>
    </main>
  )
}
