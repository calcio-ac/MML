export const MMN_URL = 'https://www.instagram.com/mmnitalia/'
export default function Footer() {
  return (
    <footer className="footer">
      <div className="orgs">
        <img src="/logos/mml.webp" alt="Milan Malayali League" />
        <a href={MMN_URL} target="_blank" rel="noopener" aria-label="Milan Malayali Network on Instagram"><img src="/logos/mmn.webp" alt="Milan Malayali Network" /></a>
        <span>Milan Malayali League 4.0 is organised by <a className="mmn" href={MMN_URL} target="_blank" rel="noopener">Milan Malayali Network</a>.</span>
      </div>
      <div className="cac">Tech partner <a href="https://calcioac.com" target="_blank" rel="noopener"><img src="/logos/cac.svg" alt="CAC" width="43" height="22" />calcioac.com</a></div>
    </footer>
  )
}
