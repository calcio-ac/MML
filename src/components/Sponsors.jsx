import { useTournament } from '../store/TournamentContext.jsx'
const Wrap = ({ s, children, className }) => s.url
  ? <a className={className} href={s.url} target="_blank" rel="noopener">{children}</a>
  : <div className={className}>{children}</div>
function Logo({ s, lazy }) {
  return <img src={s.logo_url} alt={s.name} loading={lazy ? 'lazy' : undefined}
    onError={e => { const img = e.currentTarget; img.replaceWith(Object.assign(document.createElement('b'), { textContent: s.name, style: 'color:#0B2A3E;text-align:center' })) }} />
}
export default function Sponsors() {
  const { sponsors } = useTournament()
  const sorted = [...sponsors].sort((a, b) => a.sort - b.sort)
  const title = sorted.filter(s => s.tier === 'title'), rest = sorted.filter(s => s.tier !== 'title')
  if (!sorted.length) return null
  return (
    <section className="section" aria-labelledby="sp-h">
      <h2 id="sp-h">Our sponsors</h2>
      <div className="sponsors">
        {title.map(s => <Wrap key={s.id} s={s} className="sp-title"><Logo s={s} /></Wrap>)}
        <div className="sp-grid">
          {rest.map(s => <Wrap key={s.id} s={s} className="sp-tile"><Logo s={s} lazy /></Wrap>)}
        </div>
      </div>
    </section>
  )
}
