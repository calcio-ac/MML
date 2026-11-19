import { NavLink } from 'react-router-dom'
const I = {
  home: <path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  matches: <><circle cx="12" cy="12" r="9" /><path d="m12 7 4 3-1.5 5h-5L8 10z" /></>,
  table: <path d="M4 5h16M4 10h16M4 15h16M4 20h16M9 5v15" />,
  teams: <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />,
  stats: <path d="M5 20V10M12 20V4M19 20v-7" />,
}
const tabs = [['/', 'Home', 'home'], ['/matches', 'Matches', 'matches'], ['/table', 'Table', 'table'], ['/teams', 'Teams', 'teams'], ['/stats', 'Scorers', 'stats']]
export default function TabBar() {
  return (
    <nav className="tabbar" aria-label="Main">
      {tabs.map(([to, label, ic]) => (
        <NavLink key={to} to={to} end={to === '/'}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">{I[ic]}</svg>
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
