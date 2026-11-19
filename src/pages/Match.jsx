import { Link, useParams } from 'react-router-dom'
import { useTournament } from '../store/TournamentContext.jsx'
import Crest from '../components/Crest.jsx'
import Pitch from '../components/Pitch.jsx'
import { StatusPill } from '../components/MatchRow.jsx'
import { kickoff, sourceLabel, stageName } from '../components/format.js'
import { minuteLabel } from '../lib/clock.js'

function EventLine({ e, match }) {
  const { player, matchMinutes } = useTournament()
  const p = player(e.player_id)
  // own goal: team_id is the team credited; show it on that side
  const home = e.team_id === match.home_team_id
  const what = e.type === 'goal' ? <>⚽ {p?.name ?? 'Goal'}</>
    : e.type === 'own_goal' ? <>⚽ {p?.name ?? 'Own goal'} <span className="muted">(OG)</span></>
    : <><span className={`ic ${e.type}`} aria-label={`${e.type} card`} />{p?.name ?? ''}</>
  return (
    <li>
      <span className="h">{home ? what : ''}</span>
      <span className="min">{e.minute ? minuteLabel(e.minute, matchMinutes) : ''}</span>
      <span>{home ? '' : what}</span>
    </li>
  )
}

export default function Match() {
  const { id } = useParams()
  const { matches, team, score, eventsOf, lineupOf, loading } = useTournament()
  const m = matches.find(x => x.id === id)
  if (!m) return <main className="page"><p className="empty">{loading ? 'Loading…' : 'Match not found.'} <Link to="/matches">All matches</Link></p></main>
  const h = team(m.home_team_id), a = team(m.away_team_id), s = score(m)
  const ev = eventsOf(m.id)
  const started = m.status !== 'scheduled'
  return (
    <main className="page">
      <p className="muted" style={{ marginBottom: 12 }}><Link to="/matches">Matches</Link> / {stageName(m)}</p>
      <section className="match-hero">
        <div className="teams">
          <Link className="team" to={h ? `/team/${h.id}` : '#'}><Crest team={h} size="lg" />{h?.name ?? sourceLabel(m.home_source)}</Link>
          <div>
            <div className="big">{started ? `${s.home}–${s.away}` : kickoff(m.kickoff_at)}</div>
            {m.home_pens != null && <div className="pens">Penalties {m.home_pens}–{m.away_pens}</div>}
            <div style={{ marginTop: 8 }}>{started ? <StatusPill match={m} /> : <span className="pill next">Kick-off</span>}</div>
          </div>
          <Link className="team" to={a ? `/team/${a.id}` : '#'}><Crest team={a} size="lg" />{a?.name ?? sourceLabel(m.away_source)}</Link>
        </div>
      </section>

      <section className="section">
        <h2>Goals & cards</h2>
        {ev.length ? <ul className="timeline">{ev.map(e => <EventLine key={e.id} e={e} match={m} />)}</ul>
          : <p className="empty">{started ? 'No goals yet.' : 'Goals will appear here as they happen.'}</p>}
      </section>

      <section className="section">
        <h2>Lineups</h2>
        {h && a ? (
          <div className="pitches">
            <Pitch teamId={h.id} lineup={lineupOf(m.id, h.id)} />
            <Pitch teamId={a.id} lineup={lineupOf(m.id, a.id)} />
          </div>
        ) : <p className="empty">Lineups appear once both teams are known.</p>}
      </section>
    </main>
  )
}
