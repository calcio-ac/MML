import { useEffect, useState } from 'react'
import { useTournament } from '../../store/TournamentContext.jsx'
import { elapsedSeconds, matchMinute, minuteLabel } from '../../lib/clock.js'
import { useNow } from '../../hooks/useNow.js'
import Crest from '../../components/Crest.jsx'
import { currentMatch } from '../../components/LiveBar.jsx'
import { sourceLabel } from '../../components/format.js'
import MatchPicker from './MatchPicker.jsx'

const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export default function Live({ api, say }) {
  const t = useTournament()
  const { matches, team, players, score, eventsOf, lineupOf, matchMinutes, player } = t
  const [id, setId] = useState(null)
  const [sheet, setSheet] = useState(null) // { kind: 'goal'|'card', side: 'home'|'away' }
  const [busy, setBusy] = useState(false)
  const now = useNow(500)
  useEffect(() => { if (!id && matches.length) setId(currentMatch(matches)?.id) }, [matches, id])
  const m = matches.find(x => x.id === id)
  if (!m) return <p className="adm-pad muted">No matches yet. Add them under Fixtures.</p>

  const h = team(m.home_team_id), a = team(m.away_team_id), s = score(m)
  const ev = eventsOf(m.id)
  const elapsed = elapsedSeconds(m, now)
  const { min } = matchMinute(m, now, matchMinutes)
  const ready = h && a
  const isLive = m.status === 'live' || m.status === 'paused'
  const draw = s.home === s.away
  const act = async fn => { if (busy) return; setBusy(true); try { await fn() } catch { /* toast shown */ } finally { setBusy(false) } }
  const nowIso = () => new Date().toISOString()

  const start = () => act(() => api.update('matches', m.id, {
    status: 'live', clock_started_at: nowIso(), clock_offset_s: 0, home_team_id: m.home_team_id, away_team_id: m.away_team_id,
  }))
  const pause = () => act(() => api.update('matches', m.id, { status: 'paused', clock_offset_s: Math.round(elapsed), clock_started_at: null }))
  const resume = () => act(() => api.update('matches', m.id, { status: 'live', clock_started_at: nowIso() }))
  const end = () => act(() => api.update('matches', m.id, { status: 'ft', clock_offset_s: Math.round(elapsed), clock_started_at: null }))
  const reopen = () => act(() => api.update('matches', m.id, { status: 'paused' }))
  const reset = () => {
    if (!confirm(`Reset ${h?.short_name ?? 'home'} v ${a?.short_name ?? 'away'}? This deletes its ${ev.length} goal/card entries and sets it back to not started.`)) return
    act(async () => {
      for (const e of ev) await api.remove('match_events', e.id)
      await api.update('matches', m.id, {
        status: 'scheduled', clock_started_at: null, clock_offset_s: 0, home_pens: null, away_pens: null,
        ...(m.stage !== 'group' ? { home_team_id: null, away_team_id: null } : {}),
      })
      say('Match reset', 'ok')
    })
  }
  const next = () => { const i = matches.findIndex(x => x.id === m.id); if (matches[i + 1]) setId(matches[i + 1].id) }

  const sideTeam = side => (side === 'home' ? h : a)
  const otherTeam = side => (side === 'home' ? a : h)
  const squad = tm => {
    const lu = tm && lineupOf(m.id, tm.id)
    const list = players.filter(p => p.team_id === tm?.id)
    const on = new Set(lu?.slots || [])
    return [...list.filter(p => on.has(p.id)), ...list.filter(p => !on.has(p.id))].map(p => ({ ...p, starter: on.has(p.id) }))
  }
  const record = (type, tm, playerId) => act(async () => {
    await api.upsert('match_events', { match_id: m.id, type, team_id: tm.id, player_id: playerId, minute: Math.max(1, min || 1), created_at: nowIso() })
    setSheet(null)
    const p = player(playerId)
    say(`${type === 'goal' ? 'Goal' : type === 'own_goal' ? 'Own goal' : type === 'yellow' ? 'Yellow card' : 'Red card'} · ${p?.name ?? tm.short_name} ${minuteLabel(Math.max(1, min || 1), matchMinutes)}`, 'ok')
  })
  const last = [...ev].sort((x, y) => (x.created_at || '').localeCompare(y.created_at || '')).at(-1)
  const undo = () => last && act(async () => { await api.remove('match_events', last.id); say('Removed', 'ok') })
  const evName = e => `${e.type === 'goal' ? '⚽' : e.type === 'own_goal' ? '⚽ OG' : e.type === 'yellow' ? '🟨' : '🟥'} ${player(e.player_id)?.name ?? team(e.team_id)?.short_name ?? ''} ${e.minute ? minuteLabel(e.minute, matchMinutes) : ''}`

  return (
    <div className="adm-pad live">
      <MatchPicker value={m.id} onChange={setId} />

      <div className="sb">
        <div className="sb-team"><Crest team={h} size="lg" /><span>{h?.name ?? sourceLabel(m.home_source)}</span></div>
        <div className="sb-mid">
          <div className="sb-score">{s.home}<span>–</span>{s.away}</div>
          <div className={`sb-clock ${m.status}`}>{m.status === 'scheduled' ? 'Not started' : m.status === 'ft' ? `FT · ${fmt(elapsed)}` : `${fmt(elapsed)}${m.status === 'paused' ? ' · paused' : ''}`}</div>
          {isLive && elapsed >= matchMinutes * 60 && <div className="sb-over">Time's up: {matchMinutes}:00 reached</div>}
        </div>
        <div className="sb-team"><Crest team={a} size="lg" /><span>{a?.name ?? sourceLabel(m.away_source)}</span></div>
      </div>

      <div className="clock-row">
        {m.status === 'scheduled' && <button className="big go" disabled={!ready || busy} onClick={start}>{ready ? 'Start match' : 'Teams not decided yet'}</button>}
        {m.status === 'live' && <><button className="big ghost" disabled={busy} onClick={pause}>Pause</button><button className="big stop" disabled={busy} onClick={end}>End match</button></>}
        {m.status === 'paused' && <><button className="big go" disabled={busy} onClick={resume}>Resume</button><button className="big stop" disabled={busy} onClick={end}>End match</button></>}
        {m.status === 'ft' && <><button className="big ghost" disabled={busy} onClick={reopen}>Reopen</button><button className="big go" onClick={next}>Next match</button></>}
      </div>

      {m.status !== 'scheduled' && (
        <>
          <div className="goal-row">
            <button className="goal" style={{ '--c': h?.primary_color }} disabled={busy} onClick={() => setSheet({ kind: 'goal', side: 'home' })}>⚽ Goal<small>{h?.short_name}</small></button>
            <button className="goal" style={{ '--c': a?.primary_color }} disabled={busy} onClick={() => setSheet({ kind: 'goal', side: 'away' })}>⚽ Goal<small>{a?.short_name}</small></button>
          </div>
          <div className="card-row">
            <button className="ghost" onClick={() => setSheet({ kind: 'card', side: 'home' })}>🟨🟥 Card {h?.short_name}</button>
            <button className="ghost" onClick={() => setSheet({ kind: 'card', side: 'away' })}>🟨🟥 Card {a?.short_name}</button>
          </div>
          {last && <button className="undo" disabled={busy} onClick={undo}>↩ Undo last: {evName(last)}</button>}
        </>
      )}

      {m.status === 'ft' && m.stage !== 'group' && draw && (
        <div className="pens">
          <h3>Penalties</h3>
          <p className="muted">Knockout draw. Enter the shoot-out score.</p>
          <div className="pens-row">
            <label>{h?.short_name}<input type="number" min="0" inputMode="numeric" defaultValue={m.home_pens ?? ''} onBlur={e => api.update('matches', m.id, { home_pens: e.target.value === '' ? null : +e.target.value })} /></label>
            <label>{a?.short_name}<input type="number" min="0" inputMode="numeric" defaultValue={m.away_pens ?? ''} onBlur={e => api.update('matches', m.id, { away_pens: e.target.value === '' ? null : +e.target.value })} /></label>
          </div>
        </div>
      )}

      {m.status !== 'scheduled' && <button className="reset" disabled={busy} onClick={reset}>Reset match</button>}

      <ul className="adm-events">
        {[...ev].reverse().map(e => <li key={e.id}><span>{evName(e)}</span><span className="muted">{team(e.team_id)?.short_name}</span></li>)}
      </ul>

      {sheet && (
        <div className="sheet-bg" onClick={() => setSheet(null)}>
          <div className="sheet" onClick={e => e.stopPropagation()} role="dialog" aria-label="Pick player">
            <div className="sheet-head">
              <h3>{sheet.kind === 'goal' ? `Goal for ${sideTeam(sheet.side)?.name}` : `Card · ${sideTeam(sheet.side)?.name}`}</h3>
              <span className="muted">{minuteLabel(Math.max(1, min || 1), matchMinutes)}</span>
            </div>
            {sheet.kind === 'goal' ? (
              <>
                <p className="muted">Who scored?</p>
                <div className="chips">
                  {squad(sideTeam(sheet.side)).map(p => <button key={p.id} className={p.starter ? 'on' : ''} onClick={() => record('goal', sideTeam(sheet.side), p.id)}>{p.name}</button>)}
                  <button className="plain" onClick={() => record('goal', sideTeam(sheet.side), null)}>Unknown</button>
                </div>
                <p className="muted">Own goal by {otherTeam(sheet.side)?.short_name}:</p>
                <div className="chips og">
                  {squad(otherTeam(sheet.side)).map(p => <button key={p.id} onClick={() => record('own_goal', sideTeam(sheet.side), p.id)}>{p.name}</button>)}
                </div>
              </>
            ) : (
              <div className="chips cards">
                {squad(sideTeam(sheet.side)).map(p => (
                  <div key={p.id} className="card-pick"><b>{p.name}</b>
                    <button className="y" onClick={() => record('yellow', sideTeam(sheet.side), p.id)} aria-label={`Yellow card ${p.name}`}>🟨</button>
                    <button className="r" onClick={() => record('red', sideTeam(sheet.side), p.id)} aria-label={`Red card ${p.name}`}>🟥</button>
                  </div>
                ))}
              </div>
            )}
            <button className="big ghost" onClick={() => setSheet(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
