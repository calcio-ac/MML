import { useTournament } from '../store/TournamentContext.jsx'
import Crest from '../components/Crest.jsx'
export function ScorerList({ limit }) {
  const { scorers, team } = useTournament()
  const list = limit ? scorers.slice(0, limit) : scorers
  if (!list.length) return <p className="empty">No goals scored yet.</p>
  let rank = 0, prev = null
  return (
    <ol className="scorers">
      {list.map((s, i) => {
        if (s.goals !== prev) { rank = i + 1; prev = s.goals }
        const t = team(s.team_id)
        return (
          <li key={s.player_id}>
            <span className="rk">{rank}</span><Crest team={t} />
            <span className="nm"><b>{s.name}</b><small>{t?.name}</small></span>
            <span className="g" aria-label={`${s.goals} goals`}>{s.goals}</span>
          </li>
        )
      })}
    </ol>
  )
}
export default function Stats() {
  const { events, player, team } = useTournament()
  const cards = events.filter(e => e.type === 'yellow' || e.type === 'red')
  return (
    <main className="page">
      <h1 style={{ fontSize: 64 }}>Golden Boot</h1>
      <p className="muted">Own goals don't count towards a player's tally.</p>
      <section className="section" style={{ marginTop: 24 }}><ScorerList /></section>
      <section className="section">
        <h2>Cards</h2>
        {cards.length ? (
          <ul className="timeline">
            {cards.map(e => <li key={e.id} style={{ gridTemplateColumns: '24px 1fr auto' }}>
              <span className={`ic ${e.type}`} /><span>{player(e.player_id)?.name ?? 'Unknown'}</span><span className="muted">{team(e.team_id)?.short_name}</span>
            </li>)}
          </ul>
        ) : <p className="empty">No cards so far.</p>}
      </section>
    </main>
  )
}
