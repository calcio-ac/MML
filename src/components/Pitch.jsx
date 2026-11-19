import { FORMATIONS } from '../lib/formations.js'
import { useTournament } from '../store/TournamentContext.jsx'
import Crest from './Crest.jsx'

function textOn(hex) {
  const n = parseInt((hex || '#000').slice(1), 16)
  const l = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
  return l > 0.6 ? '#0B2A3E' : '#fff'
}

export function PitchLines() {
  return (
    <svg className="lines" viewBox="0 0 75 100" preserveAspectRatio="none" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => <rect key={i} x="0" y={i * 10} width="75" height="10" fill={i % 2 ? 'rgba(255,255,255,.035)' : 'transparent'} />)}
      <g fill="none" stroke="rgba(255,255,255,.55)" strokeWidth=".6">
        <rect x="3" y="3" width="69" height="94" rx="1" />
        <line x1="3" y1="50" x2="72" y2="50" />
        <circle cx="37.5" cy="50" r="8" />
        <path d="M22 97 v-9 a15.5 15.5 0 0 1 31 0 v9" />
        <path d="M22 3 v9 a15.5 15.5 0 0 0 31 0 v-9" />
        <rect x="31" y="97" width="13" height="2" /><rect x="31" y="1" width="13" height="2" />
      </g>
    </svg>
  )
}

export default function Pitch({ teamId, lineup }) {
  const { team, player, players } = useTournament()
  const t = team(teamId)
  const formation = lineup?.formation || '1-2-1'
  const slots = FORMATIONS[formation] || FORMATIONS['1-2-1']
  const ids = lineup?.slots || []
  const bench = players.filter(p => p.team_id === teamId && !ids.includes(p.id))
  const c = t?.primary_color || '#C8373A'
  return (
    <div className="pitch-card">
      <h3><Crest team={t} />{t?.short_name ?? 'TBD'}<span className="formation">{lineup ? formation : 'Lineup not set'}</span></h3>
      <div className="pitch">
        <PitchLines />
        {slots.map((s, i) => {
          const p = player(ids[i])
          return (
            <div key={i} className={`dot${p ? '' : ' empty-slot'}`} style={{ left: `${s.x}%`, top: `${s.y}%` }}>
              <i style={{ background: i === 0 ? '#F5C518' : c, color: i === 0 ? '#0B2A3E' : textOn(c) }}>{s.role === 'GK' ? 'GK' : ''}</i>
              <span>{p?.name ?? '—'}</span>
            </div>
          )
        })}
      </div>
      {lineup && bench.length > 0 && <div className="bench">Subs: {bench.map(p => p.name).join(', ')}</div>}
    </div>
  )
}
