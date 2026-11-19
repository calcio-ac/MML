import { useState } from 'react'
import { useTournament } from '../../store/TournamentContext.jsx'
import Crest from '../../components/Crest.jsx'

const POS = ['GK', 'DEF', 'MID', 'FWD']
const slug = s => s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-')

function TeamEditor({ t, api, say }) {
  const { players } = useTournament()
  const squad = players.filter(p => p.team_id === t.id)
  const [name, setName] = useState(''), [pos, setPos] = useState('MID')
  const field = (k, label, type = 'text') => (
    <label>{label}<input type={type} defaultValue={t[k] ?? ''} onBlur={e => e.target.value !== (t[k] ?? '') && api.update('teams', t.id, { [k]: e.target.value || null })} /></label>
  )
  async function addPlayer(e) {
    e.preventDefault()
    if (!name.trim()) return
    if (squad.length >= 10) return say('A team can have at most 10 players.')
    await api.upsert('players', { team_id: t.id, name: name.trim(), position: pos }); setName('')
  }
  async function upload(e) {
    const f = e.target.files?.[0]; if (!f) return
    const url = await api.uploadLogo(f, 'teams'); await api.update('teams', t.id, { logo_url: url }); say('Crest updated', 'ok')
  }
  return (
    <div className="adm-card">
      <div className="adm-card-head"><Crest team={t} size="lg" /><h3>{t.name}</h3>
        <label className="btn ghost file">Change crest<input type="file" accept="image/*" onChange={upload} /></label></div>
      <div className="form-grid">
        {field('name', 'Team name')}{field('short_name', 'Short name')}
        {field('manager', 'Manager')}{field('team_director', 'Team director')}
        {field('primary_color', 'Main colour', 'color')}{field('secondary_color', 'Second colour', 'color')}
      </div>
      <h4>Squad <span className="muted">{squad.length}/10</span></h4>
      <ul className="squad-edit">
        {squad.map(p => (
          <li key={p.id}>
            <input defaultValue={p.name} aria-label="Player name" onBlur={e => e.target.value.trim() && e.target.value !== p.name && api.update('players', p.id, { name: e.target.value.trim() })} />
            <select value={p.position} aria-label="Position" onChange={e => api.update('players', p.id, { position: e.target.value })}>{POS.map(x => <option key={x}>{x}</option>)}</select>
            <button className="x" aria-label={`Remove ${p.name}`} onClick={() => confirm(`Remove ${p.name}?`) && api.remove('players', p.id)}>✕</button>
          </li>
        ))}
      </ul>
      {squad.length < 10 && (
        <form className="squad-add" onSubmit={addPlayer}>
          <input placeholder="Player name" value={name} onChange={e => setName(e.target.value)} />
          <select value={pos} onChange={e => setPos(e.target.value)} aria-label="Position">{POS.map(x => <option key={x}>{x}</option>)}</select>
          <button className="btn">Add</button>
        </form>
      )}
    </div>
  )
}

export default function TeamsAdmin({ api, say }) {
  const { teams } = useTournament()
  const [open, setOpen] = useState(teams[0]?.id)
  const [newName, setNewName] = useState('')
  async function addTeam(e) {
    e.preventDefault(); const n = newName.trim(); if (!n) return
    await api.upsert('teams', { id: slug(n), name: n, short_name: n.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 4), logo_url: '/logos/mml.webp', sort: teams.length })
    setNewName(''); setOpen(slug(n))
  }
  return (
    <div className="adm-pad">
      <div className="seg wrap">{teams.map(t => <button key={t.id} aria-pressed={open === t.id} onClick={() => setOpen(t.id)}>{t.short_name}</button>)}</div>
      {teams.filter(t => t.id === open).map(t => <TeamEditor key={t.id} t={t} api={api} say={say} />)}
      <form className="squad-add" onSubmit={addTeam} style={{ marginTop: 24 }}>
        <input placeholder="New team name" value={newName} onChange={e => setNewName(e.target.value)} />
        <button className="btn ghost">Add team</button>
      </form>
    </div>
  )
}
