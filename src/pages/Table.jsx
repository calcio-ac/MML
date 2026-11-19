import StandingsTable from '../components/StandingsTable.jsx'
import Bracket from '../components/Bracket.jsx'
export default function Table() {
  return (
    <main className="page">
      <h1 style={{ fontSize: 64 }}>Table</h1>
      <p className="muted">Every team plays the other four once. Win 3, draw 1. Ties split by goal difference, goals scored, then head-to-head.</p>
      <section className="section" style={{ marginTop: 24 }}><StandingsTable /></section>
      <section className="section"><h2>Knockouts</h2><p className="muted" style={{ margin: '-8px 0 16px' }}>1st plays 4th, 2nd plays 3rd. Draws go to penalties.</p><Bracket /></section>
    </main>
  )
}
