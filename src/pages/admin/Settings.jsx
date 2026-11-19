import { useTournament } from '../../store/TournamentContext.jsx'
export default function Settings({ api, signOut }) {
  const { settings, teams } = useTournament()
  return (
    <div className="adm-pad">
      <div className="adm-card">
        <h3>Match</h3>
        <div className="form-grid">
          <label>Match length (minutes, one half)<input type="number" min="1" defaultValue={settings.match_minutes} onBlur={e => api.setSetting('match_minutes', Number(e.target.value) || 10)} /></label>
          <label>Match day<input type="date" defaultValue={settings.match_day} onBlur={e => e.target.value && api.setSetting('match_day', e.target.value)} /></label>
        </div>
      </div>
      <div className="adm-card">
        <h3>Last-resort tie-break</h3>
        <p className="muted">Only used if teams are level on points, goal difference, goals scored and head-to-head. 1 ranks highest; leave blank otherwise.</p>
        <div className="form-grid">
          {teams.map(t => <label key={t.id}>{t.name}<input type="number" min="1" defaultValue={t.tiebreak_rank ?? ''} onBlur={e => api.update('teams', t.id, { tiebreak_rank: e.target.value === '' ? null : +e.target.value })} /></label>)}
        </div>
      </div>
      {signOut && <button className="btn ghost" onClick={signOut}>Sign out</button>}
    </div>
  )
}
