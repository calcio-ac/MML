export const VENUE = {
  name: 'Sport Promotion Comasina',
  area: 'Comasina, Milano',
  link: 'https://maps.app.goo.gl/WtYZDwd9sUZhroCAA',
  directions: 'https://www.google.com/maps/dir/?api=1&destination=45.525474,9.1585678',
  embed: 'https://maps.google.com/maps?q=45.525474,9.1585678&z=15&output=embed',
}

export default function Venue() {
  return (
    <section className="section" aria-labelledby="venue-h">
      <h2 id="venue-h">Where</h2>
      <div className="venue">
        <iframe className="venue-map" src={VENUE.embed} title={`Map of ${VENUE.name}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        <div className="venue-info">
          <div>
            <b>{VENUE.name}</b>
            <span className="muted">{VENUE.area} · Sunday 22 November 2026</span>
          </div>
          <div className="venue-btns">
            <a className="btn" href={VENUE.directions} target="_blank" rel="noopener">Directions</a>
            <a className="btn ghost" href={VENUE.link} target="_blank" rel="noopener">Google Maps</a>
          </div>
        </div>
      </div>
    </section>
  )
}
