import { useTournament } from '../../store/TournamentContext.jsx'
import { kickoff, stageShort, sourceLabel } from '../../components/format.js'
export default function MatchPicker({ value, onChange }) {
  const { matches, team } = useTournament()
  return (
    <select className="adm-select" value={value || ''} onChange={e => onChange(e.target.value)} aria-label="Match">
      {matches.map(m => (
        <option key={m.id} value={m.id}>
          {stageShort(m)} · {kickoff(m.kickoff_at)} · {team(m.home_team_id)?.short_name ?? sourceLabel(m.home_source)} v {team(m.away_team_id)?.short_name ?? sourceLabel(m.away_source)}{m.status === 'ft' ? ' · FT' : m.status !== 'scheduled' ? ' · LIVE' : ''}
        </option>
      ))}
    </select>
  )
}
