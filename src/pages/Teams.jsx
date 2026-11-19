import { Link } from 'react-router-dom'
import { useTournament } from '../store/TournamentContext.jsx'
import Crest from '../components/Crest.jsx'
export default function Teams() {
  const { teams } = useTournament()
  // 2-2-1 layout: Sexy Sesto FC takes the centred last tile
  const LAST = 'sexy-sesto'
  const ordered = [...teams.filter(t => t.id !== LAST), ...teams.filter(t => t.id === LAST)]
  return (
    <main className="page">
      <h1 style={{ fontSize: 64 }}>Five teams</h1>
      <p className="muted">Squads built at the MML 4.0 player auction on 15 November.</p>
      <div className="team-grid" style={{ marginTop: 24 }}>
        {ordered.map(t => (
          <Link key={t.id} to={`/team/${t.id}`} className="team-tile" style={{ '--c1': t.primary_color }}>
            <Crest team={t} size="lg" /><b>{t.name}</b>
          </Link>
        ))}
      </div>
    </main>
  )
}
