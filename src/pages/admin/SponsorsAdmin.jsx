import { useState } from 'react'
import { useTournament } from '../../store/TournamentContext.jsx'

export default function SponsorsAdmin({ api, say }) {
  const { sponsors } = useTournament()
  const list = [...sponsors].sort((a, b) => a.sort - b.sort)
  const [name, setName] = useState(''), [file, setFile] = useState(null), [busy, setBusy] = useState(false)
  async function add(e) {
    e.preventDefault()
    if (!name.trim() || !file) return say('Add a name and a logo file.')
    setBusy(true)
    try {
      const url = await api.uploadLogo(file, 'sponsors')
      await api.upsert('sponsors', { name: name.trim(), logo_url: url, tier: 'partner', sort: list.length })
      setName(''); setFile(null); e.target.reset(); say('Sponsor added', 'ok')
    } finally { setBusy(false) }
  }
  const move = async (i, d) => {
    const a = list[i], b = list[i + d]; if (!b) return
    await api.update('sponsors', a.id, { sort: b.sort }); await api.update('sponsors', b.id, { sort: a.sort })
  }
  return (
    <div className="adm-pad">
      <p className="muted">Logos show on white tiles. The title sponsor gets the big tile.</p>
      <ul className="sp-edit">
        {list.map((s, i) => (
          <li key={s.id}>
            <span className="sp-thumb"><img src={s.logo_url} alt="" /></span>
            <div className="sp-fields">
              <input defaultValue={s.name} aria-label="Name" onBlur={e => e.target.value !== s.name && api.update('sponsors', s.id, { name: e.target.value })} />
              <input defaultValue={s.url ?? ''} placeholder="Website (optional)" aria-label="Website" onBlur={e => api.update('sponsors', s.id, { url: e.target.value || null })} />
              <select value={s.tier} onChange={e => api.update('sponsors', s.id, { tier: e.target.value })} aria-label="Tier"><option value="title">Title sponsor</option><option value="partner">Partner</option></select>
            </div>
            <div className="sp-btns">
              <button onClick={() => move(i, -1)} aria-label="Move up" disabled={i === 0}>↑</button>
              <button onClick={() => move(i, 1)} aria-label="Move down" disabled={i === list.length - 1}>↓</button>
              <button className="x" onClick={() => confirm(`Remove ${s.name}?`) && api.remove('sponsors', s.id)} aria-label={`Remove ${s.name}`}>✕</button>
            </div>
          </li>
        ))}
      </ul>
      <form className="adm-card" onSubmit={add}>
        <h3>Add sponsor</h3>
        <div className="form-grid">
          <label>Name<input value={name} onChange={e => setName(e.target.value)} /></label>
          <label>Logo<input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} /></label>
        </div>
        <button className="btn" disabled={busy}>{busy ? 'Uploading…' : 'Add sponsor'}</button>
      </form>
    </div>
  )
}
