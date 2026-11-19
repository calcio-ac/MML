import { useEffect, useState } from 'react'
import { useTournament } from '../../store/TournamentContext.jsx'
import { FORMATIONS, FORMATION_NAMES } from '../../lib/formations.js'
import { PitchLines } from '../../components/Pitch.jsx'
import { currentMatch } from '../../components/LiveBar.jsx'
import MatchPicker from './MatchPicker.jsx'

export default function Lineups({ api, say }) {
  const { matches, team, players, lineups, lineupOf, player } = useTournament()
  const [id, setId] = useState(null)
  const [side, setSide] = useState('home')
  const [slot, setSlot] = useState(0)
  useEffect(() => { if (!id && matches.length) setId((matches.find(m => m.status === 'scheduled') || currentMatch(matches))?.id) }, [matches, id])
  const m = matches.find(x => x.id === id)
  if (!m) return <p className="adm-pad muted">No matches yet.</p>
  const tid = side === 'home' ? m.home_team_id : m.away_team_id
  const t = team(tid)
  const lu = lineupOf(m.id, tid) || { match_id: m.id, team_id: tid, formation: '1-2-1', slots: [null, null, null, null, null] }
  const squad = players.filter(p => p.team_id === tid)
  const save = patch => tid && api.saveLineup({ match_id: m.id, team_id: tid, formation: lu.formation, slots: lu.slots, ...patch })
  const place = pid => {
    const slots = [...lu.slots].map(x => (x === pid ? null : x))
    slots[slot] = pid
    save({ slots })
    const nextEmpty = slots.findIndex(x => !x)
    setSlot(nextEmpty === -1 ? slot : nextEmpty)
  }
  const copyLast = () => {
    const prev = [...lineups].filter(l => l.team_id === tid && l.match_id !== m.id)
      .sort((x, y) => (y.updated_at || '').localeCompare(x.updated_at || ''))[0]
      || [...lineups].filter(l => l.team_id === tid && l.match_id !== m.id).at(-1)
    if (!prev) return say('No earlier lineup for this team yet.')
    save({ formation: prev.formation, slots: prev.slots }); say('Copied last lineup', 'ok')
  }
  return (
    <div className="adm-pad">
      <MatchPicker value={m.id} onChange={v => { setId(v); setSlot(0) }} />
      <div className="seg">
        {['home', 'away'].map(s => {
          const x = team(s === 'home' ? m.home_team_id : m.away_team_id)
          return <button key={s} aria-pressed={side === s} onClick={() => { setSide(s); setSlot(0) }}>{x?.name ?? 'TBD'}</button>
        })}
      </div>
      {!t ? <p className="muted">This team is decided by the group table. Come back once it's known.</p> : (
        <>
          <div className="seg small">
            {FORMATION_NAMES.map(f => <button key={f} aria-pressed={lu.formation === f} onClick={() => save({ formation: f })}>{f}</button>)}
          </div>
          <div className="pitch adm-pitch">
            <PitchLines />
            {FORMATIONS[lu.formation].map((s, i) => (
              <button key={i} className={`dot slot${slot === i ? ' sel' : ''}${lu.slots[i] ? '' : ' empty-slot'}`} style={{ left: `${s.x}%`, top: `${s.y}%` }} onClick={() => setSlot(i)}>
                <i style={{ background: i === 0 ? '#F5C518' : t.primary_color }}>{s.role}</i>
                <span>{player(lu.slots[i])?.name ?? 'Tap to pick'}</span>
              </button>
            ))}
          </div>
          <p className="muted">Picking for: <b>{FORMATIONS[lu.formation][slot].role}</b> slot {slot + 1}. Tap a player.</p>
          <div className="chips">
            {squad.map(p => <button key={p.id} className={lu.slots.includes(p.id) ? 'on' : ''} onClick={() => place(p.id)}>{p.name}<small>{p.position}</small></button>)}
          </div>
          {!squad.length && <p className="muted">No players yet. Add them under Teams.</p>}
          <div className="row-btns">
            <button className="btn ghost" onClick={copyLast}>Copy last lineup</button>
            <button className="btn ghost" onClick={() => save({ slots: [null, null, null, null, null] })}>Clear</button>
          </div>
        </>
      )}
    </div>
  )
}
