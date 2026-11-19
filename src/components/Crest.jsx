export default function Crest({ team, size = '', label }) {
  if (!team) return <span className={`crest tbd ${size}`} aria-label={label || 'To be decided'}>?</span>
  return <img className={`crest ${size}`} src={team.logo_url} alt={`${team.name} crest`} loading="lazy" width="40" height="40" />
}
