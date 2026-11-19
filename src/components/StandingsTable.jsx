import { Link } from 'react-router-dom'
import { useTournament } from '../store/TournamentContext.jsx'
import Crest from './Crest.jsx'
export default function StandingsTable() {
  const { standings, team } = useTournament()
  return (
    <>
      <table className="standings">
        <thead><tr><th>#</th><th style={{ textAlign: 'left' }}>Team</th><th>P</th><th className="hide-sm">W</th><th className="hide-sm">D</th><th className="hide-sm">L</th><th>GD</th><th>Pts</th></tr></thead>
        <tbody>
          {standings.map((r, i) => {
            const t = team(r.team_id)
            return (
              <tr key={r.team_id} className={i < 4 ? 'q' : ''}>
                <td className="pos">{i + 1}</td>
                <td className="team"><Link to={`/team/${r.team_id}`}><Crest team={t} />{t?.name}</Link></td>
                <td>{r.p}</td><td className="hide-sm">{r.w}</td><td className="hide-sm">{r.d}</td><td className="hide-sm">{r.l}</td>
                <td>{r.gd > 0 ? `+${r.gd}` : r.gd}</td><td className="pts">{r.pts}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="legend"><i />Top 4 go to the semi-finals</p>
    </>
  )
}
