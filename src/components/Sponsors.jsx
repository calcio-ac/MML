import { useTournament } from '../store/TournamentContext.jsx'

function Tile({ s, hidden }) {
  const img = <img src={s.logo_url} alt={hidden ? '' : s.name} />
  return s.url
    ? <a className="sp-tile" href={s.url} target="_blank" rel="noopener" tabIndex={hidden ? -1 : undefined} aria-hidden={hidden || undefined}>{img}</a>
    : <div className="sp-tile" aria-hidden={hidden || undefined}>{img}</div>
}

// One row of equal tiles scrolling sideways forever. The list is drawn twice so the loop is seamless.
export default function Sponsors() {
  const { sponsors } = useTournament()
  const list = [...sponsors].sort((a, b) => a.sort - b.sort)
  if (!list.length) return null
  const seconds = Math.max(18, list.length * 5)
  return (
    <section className="section" aria-labelledby="sp-h">
      <h2 id="sp-h">Our sponsors</h2>
      <div className="marquee" style={{ '--dur': `${seconds}s` }}>
        <div className="marquee-track">
          {list.map(s => <Tile key={s.id} s={s} />)}
          {list.map(s => <Tile key={`${s.id}-2`} s={s} hidden />)}
        </div>
      </div>
    </section>
  )
}
