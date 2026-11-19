import { Link } from 'react-router-dom'
import { useTournament } from '../store/TournamentContext.jsx'
import MatchRow from '../components/MatchRow.jsx'
import StandingsTable from '../components/StandingsTable.jsx'
import Sponsors from '../components/Sponsors.jsx'
import { ScorerList } from './Stats.jsx'
import Story from '../story/Story.jsx'

export function HomeContent() {
  const { matches } = useTournament()
  const idx = Math.max(0, matches.findIndex(m => m.status !== 'ft'))
  const around = matches.slice(Math.max(0, idx - 1), idx + 4)
  return (
    <main className="page" id="scores">
      <section>
        <div className="section-head"><h2>Match day</h2><Link to="/matches">All 13 matches</Link></div>
        <div className="board">{around.map(m => <MatchRow key={m.id} match={m} />)}</div>
      </section>
      <section className="section">
        <div className="section-head"><h2>Table</h2><Link to="/table">Knockouts</Link></div>
        <StandingsTable />
      </section>
      <section className="section">
        <div className="section-head"><h2>Golden Boot</h2><Link to="/stats">All scorers</Link></div>
        <ScorerList limit={5} />
      </section>
      <Sponsors />
    </main>
  )
}
export default function Home() { return <><Story /><HomeContent /></> }
