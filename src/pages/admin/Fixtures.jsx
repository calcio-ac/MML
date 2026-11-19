import { useTournament } from '../../store/TournamentContext.jsx'
import { roundRobin } from '../../lib/fixtures.js'
import { stageShort, sourceLabel } from '../../components/format.js'

// Match day is in November → Europe/Rome is UTC+1.
const toLocal = iso => (iso ? new Date(new Date(iso).getTime() + 3600_000).toISOString().slice(11, 16) : '')
const fromLocal = (day, hhmm) => new Date(`${day}T${hhmm}:00+01:00`).toISOString()

export default function Fixtures({ api, say }) {
  const { matches, teams, settings } = useTournament()
  const raw = useTournament().rawMatches
  const day = settings.match_day || '2026-11-22'
  const group = matches.filter(m => m.stage === 'group')
  const started = group.some(m => m.status !== 'scheduled')
  async function regenerate() {
    if (started) return say('Group matches have started, so fixtures are locked.')
    if (!confirm('Replace all 10 group fixtures with a new round-robin order? Kick-off times stay.')) return
    const pairs = roundRobin(teams.map(t => t.id))
    const byNum = [...group].sort((a, b) => a.number - b.number)
    for (let i = 0; i < pairs.length && i < byNum.length; i++)
      await api.update('matches', byNum[i].id, { home_team_id: pairs[i][0], away_team_id: pairs[i][1] })
    say('Fixtures regenerated', 'ok')
  }
  const teamSelect = (m, side) => {
    const stored = raw.find(x => x.id === m.id)
    const key = `${side}_team_id`
    return (
      <select value={m.stage === 'group' ? (m[key] || '') : (stored?.[key] || '')} onChange={e => api.update('matches', m.id, { [key]: e.target.value || null })} aria-label={`${side} team`}>
        <option value="">{m.stage === 'group' ? 'Pick team' : `Auto: ${sourceLabel(m[`${side}_source`])}`}</option>
        {teams.map(t => <option key={t.id} value={t.id}>{t.short_name}</option>)}
      </select>
    )
  }
  return (
    <div className="adm-pad">
      <p className="muted">Times are Milan time on {day}. Semis and final fill in automatically from the table; pick a team only to override.</p>
      <ul className="fx">
        {matches.map(m => (
          <li key={m.id}>
            <b>{stageShort(m)}</b>
            <input type="time" defaultValue={toLocal(m.kickoff_at)} aria-label="Kick-off" onBlur={e => e.target.value && api.update('matches', m.id, { kickoff_at: fromLocal(day, e.target.value) })} />
            {teamSelect(m, 'home')}<span className="muted">v</span>{teamSelect(m, 'away')}
            <span className={`pill ${m.status === 'ft' ? 'ft' : m.status === 'scheduled' ? 'next' : 'live'}`}>{m.status === 'ft' ? 'FT' : m.status === 'scheduled' ? 'Upcoming' : 'Live'}</span>
          </li>
        ))}
      </ul>
      <button className="btn ghost" disabled={started} onClick={regenerate}>Regenerate group fixtures</button>
    </div>
  )
}
