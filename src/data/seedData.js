// Single source for the 5 clubs, sponsors and fixture slots (used by seed SQL + demo mode).
import { roundRobin } from '../lib/fixtures.js'

export const TEAMS = [
  { id: 'real-garibaldi', name: 'Real Garibaldi FC', short_name: 'RGF', primary_color: '#0E1F45', secondary_color: '#D4A93C' },
  { id: 'moscova-mafia', name: 'Moscova Mafia', short_name: 'MOS', primary_color: '#036A38', secondary_color: '#111111' },
  { id: 'sexy-sesto', name: 'Sexy Sesto FC', short_name: 'SSFC', primary_color: '#E8323C', secondary_color: '#111111' },
  { id: 'atletico-affori', name: 'Atletico Affori', short_name: 'ATA', primary_color: '#FFCB05', secondary_color: '#0B1A40' },
  { id: 'frattini-fratelli', name: 'Frattini Fratelli', short_name: 'FRF', primary_color: '#1E6FD9', secondary_color: '#C9CED6' },
].map((t, i) => ({ ...t, logo_url: `/logos/teams/${t.id}.webp`, manager: null, team_director: null, tiebreak_rank: null, sort: i }))

export const SPONSORS = [
  ['Adlers Lombard', 'adlers-lombard', 'title'],
  ['Edusetin Study Abroad', 'edusetin', 'partner'],
  ['Flymart International Grocery Store', 'flymart', 'partner'],
  ['Saravanaa Bhavan Milan', 'saravanaa-bhavan', 'partner'],
  ['Kashmiria Fashion', 'kashmiria-fashion', 'partner'],
  ["God's Own Country Films", 'gods-own-country-films', 'partner'],
].map(([name, f, tier], i) => ({ id: f, name, logo_url: `/logos/sponsors/${f}.webp`, url: null, tier, sort: i }))

// Sunday 22 Nov 2026, 10:00 Europe/Rome (UTC+1) = 09:00Z. One pitch: 10' match + 3' changeover.
const START = Date.parse('2026-11-22T09:00:00Z'), SLOT = 13 * 60_000
const at = i => new Date(START + i * SLOT).toISOString()

export function buildMatches() {
  const base = { status: 'scheduled', clock_started_at: null, clock_offset_s: 0, home_pens: null, away_pens: null }
  const group = roundRobin(TEAMS.map(t => t.id)).map(([h, a], i) => ({
    ...base, id: `G${i + 1}`, stage: 'group', number: i + 1, home_team_id: h, away_team_id: a, home_source: null, away_source: null, kickoff_at: at(i),
  }))
  return [...group,
    { ...base, id: 'SF1', stage: 'sf', number: 1, home_team_id: null, away_team_id: null, home_source: 'G1', away_source: 'G4', kickoff_at: at(10) },
    { ...base, id: 'SF2', stage: 'sf', number: 2, home_team_id: null, away_team_id: null, home_source: 'G2', away_source: 'G3', kickoff_at: at(11) },
    { ...base, id: 'F', stage: 'final', number: 1, home_team_id: null, away_team_id: null, home_source: 'W:SF1', away_source: 'W:SF2', kickoff_at: at(12) },
  ]
}
export const SETTINGS = { match_minutes: 10, match_day: '2026-11-22' }
