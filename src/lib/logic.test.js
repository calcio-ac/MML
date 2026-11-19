import { describe, it, expect } from 'vitest'
import { scoreOf, matchWinner } from './score.js'
import { computeStandings, topScorers } from './standings.js'
import { roundRobin, resolveKnockouts } from './fixtures.js'
import { matchMinute, minuteLabel } from './clock.js'
import { FORMATIONS } from './formations.js'

const T = ['a', 'b', 'c', 'd', 'e'].map((id, i) => ({ id, name: id.toUpperCase(), tiebreak_rank: null }))
const m = (id, h, a, extra = {}) => ({ id, stage: 'group', home_team_id: h, away_team_id: a, status: 'ft', ...extra })
const goals = (match_id, team_id, n, player_id = null) =>
  Array.from({ length: n }, (_, i) => ({ id: `${match_id}-${team_id}-${i}-${player_id}`, match_id, type: 'goal', team_id, player_id }))

describe('scoreOf', () => {
  it('credits own goals to the team in team_id (the benefiting team)', () => {
    const ev = [
      { id: 1, match_id: 'm1', type: 'goal', team_id: 'a', player_id: 'p1' },
      { id: 2, match_id: 'm1', type: 'own_goal', team_id: 'b', player_id: 'p1' },
      { id: 3, match_id: 'm2', type: 'goal', team_id: 'a', player_id: 'p1' },
      { id: 4, match_id: 'm1', type: 'yellow', team_id: 'a', player_id: 'p1' },
    ]
    expect(scoreOf(m('m1', 'a', 'b'), ev)).toEqual({ home: 1, away: 1 })
  })
  it('drops when the last goal is undone (score derived from events)', () => {
    const ev = goals('m1', 'a', 2)
    expect(scoreOf(m('m1', 'a', 'b'), ev).home).toBe(2)
    expect(scoreOf(m('m1', 'a', 'b'), ev.slice(0, 1)).home).toBe(1)
  })
  it('matchWinner uses penalties on a knockout draw', () => {
    const k = m('k', 'a', 'b', { stage: 'sf', home_pens: 3, away_pens: 4 })
    expect(matchWinner(k, goals('k', 'a', 1).concat(goals('k', 'b', 1)))).toBe('b')
    expect(matchWinner({ ...k, status: 'live' }, [])).toBe(null)
  })
})

describe('topScorers', () => {
  it('excludes own goals and sorts by goals then name', () => {
    const players = [{ id: 'p1', name: 'Zed', team_id: 'a' }, { id: 'p2', name: 'Abe', team_id: 'b' }, { id: 'p3', name: 'Cal', team_id: 'b' }]
    const ev = [...goals('m1', 'a', 2, 'p1'), ...goals('m1', 'b', 2, 'p2'), ...goals('m1', 'b', 1, 'p3'),
      { id: 'og', match_id: 'm1', type: 'own_goal', team_id: 'a', player_id: 'p3' }]
    expect(topScorers(ev, players).map(r => [r.name, r.goals])).toEqual([['Abe', 2], ['Zed', 2], ['Cal', 1]])
  })
})

describe('computeStandings', () => {
  it('counts only finished group matches', () => {
    const matches = [m('m1', 'a', 'b'), m('m2', 'c', 'd', { status: 'live' }), m('s', 'a', 'c', { stage: 'sf' })]
    const ev = [...goals('m1', 'a', 2), ...goals('m2', 'c', 5), ...goals('s', 'a', 3)]
    const s = computeStandings(T, matches, ev)
    const a = s.find(r => r.team_id === 'a')
    expect(a).toMatchObject({ p: 1, w: 1, d: 0, l: 0, gf: 2, ga: 0, gd: 2, pts: 3 })
    expect(s.find(r => r.team_id === 'c').p).toBe(0)
    expect(s[0].team_id).toBe('a')
  })
  it('breaks a pts/gd/gf tie by head-to-head, then by manual tiebreak_rank', () => {
    // a beats b 1-0, b beats c 1-0, c beats a 1-0  => perfect 3-way tie, h2h also tied
    // d beats nobody; e draws.
    const matches = [m('1', 'a', 'b'), m('2', 'b', 'c'), m('3', 'c', 'a')]
    const ev = [...goals('1', 'a', 1), ...goals('2', 'b', 1), ...goals('3', 'c', 1)]
    const teams = T.map(t => ({ ...t, tiebreak_rank: { a: 3, b: 1, c: 2 }[t.id] ?? null }))
    const order = computeStandings(teams, matches, ev).slice(0, 3).map(r => r.team_id)
    expect(order).toEqual(['b', 'c', 'a'])
    // head-to-head decides when two teams are level
    const m2 = [m('1', 'a', 'b'), m('2', 'c', 'd'), m('3', 'b', 'd'), m('4', 'c', 'a')]
    const ev2 = [...goals('1', 'b', 1), ...goals('2', 'c', 1), ...goals('3', 'b', 0), ...goals('4', 'c', 0)]
    // b: W vs a, D vs d => 4pts gf1 ga0 ; c: W vs d, D vs a => 4pts gf1 ga0. No h2h match => rank
    const teams2 = T.map(t => ({ ...t, tiebreak_rank: { c: 1, b: 2 }[t.id] ?? null }))
    expect(computeStandings(teams2, m2, ev2).slice(0, 2).map(r => r.team_id)).toEqual(['c', 'b'])
    const m5 = [m('x', 'a', 'b'), m('y', 'c', 'd'), m('z', 'b', 'd'), m('w', 'a', 'c')]
    const ev5 = [...goals('x', 'a', 1), ...goals('y', 'd', 1), ...goals('z', 'b', 1), ...goals('w', 'c', 1)]
    // a: W b, L c => 3pts 1-1 ; b: L a, W d => 3pts 1-1 ; c: L d, W a => 3 1-1 ; d: W c, L b => 3 1-1  (4-way)
    // With no ranks, order must be stable (by name) across calls
    const r1 = computeStandings(T, m5, ev5).map(r => r.team_id)
    const r2 = computeStandings(T, [...m5].reverse(), [...ev5].reverse()).map(r => r.team_id)
    expect(r1).toEqual(r2)
  })
  it('head-to-head separates two teams level on pts, gd and gf', () => {
    // a beat b 2-1. a lost to c 0-1. b beat c 1-0 … compute: a 3pts gf2 ga2, b 3pts gf2 ga2, c 3pts gf1 ga1
    const matches = [m('1', 'a', 'b'), m('2', 'a', 'c'), m('3', 'b', 'c')]
    const ev = [...goals('1', 'a', 2), ...goals('1', 'b', 1), ...goals('2', 'c', 1), ...goals('3', 'b', 1)]
    const teams = T.map(t => ({ ...t, tiebreak_rank: { b: 1, a: 2 }[t.id] ?? null }))
    const s = computeStandings(teams, matches, ev).map(r => r.team_id)
    expect(s.slice(0, 2)).toEqual(['a', 'b']) // h2h a beat b, beats manual rank
  })
})

describe('roundRobin', () => {
  it('makes 10 unique pairs where every team plays 4', () => {
    const pairs = roundRobin(['a', 'b', 'c', 'd', 'e'])
    expect(pairs).toHaveLength(10)
    const keys = new Set(pairs.map(p => [...p].sort().join('-')))
    expect(keys.size).toBe(10)
    for (const t of 'abcde') expect(pairs.filter(p => p.includes(t))).toHaveLength(4)
  })
  it('never makes a team play two matches in a row', () => {
    const pairs = roundRobin(['a', 'b', 'c', 'd', 'e'])
    for (let i = 1; i < pairs.length; i++) expect(pairs[i].some(t => pairs[i - 1].includes(t))).toBe(false)
  })
})

describe('resolveKnockouts', () => {
  const standings = ['c', 'a', 'e', 'b', 'd'].map(team_id => ({ team_id }))
  const ko = [
    { id: 'sf1', stage: 'sf', number: 1, home_source: 'G1', away_source: 'G4', home_team_id: null, away_team_id: null, status: 'scheduled' },
    { id: 'sf2', stage: 'sf', number: 2, home_source: 'G2', away_source: 'G3', home_team_id: null, away_team_id: null, status: 'scheduled' },
    { id: 'f', stage: 'final', number: 1, home_source: 'W:SF1', away_source: 'W:SF2', home_team_id: null, away_team_id: null, status: 'scheduled' },
  ]
  it('leaves placeholders while the group is unfinished', () => {
    const r = resolveKnockouts(ko, standings, false, [])
    expect(r.map(x => [x.home_team_id, x.away_team_id])).toEqual([[null, null], [null, null], [null, null]])
  })
  it('fills semis 1v4 and 2v3 and the final from semi winners', () => {
    const done = ko.map(x => x.id === 'sf1' ? { ...x, status: 'ft' } : x)
    const ev = goals('sf1', 'b', 1)
    const r = resolveKnockouts(done, standings, true, ev)
    expect(r[0]).toMatchObject({ home_team_id: 'c', away_team_id: 'b' })
    expect(r[1]).toMatchObject({ home_team_id: 'a', away_team_id: 'e' })
    expect(r[2]).toMatchObject({ home_team_id: 'b', away_team_id: null })
  })
  it('keeps team ids an admin already locked', () => {
    const locked = ko.map(x => x.id === 'sf1' ? { ...x, home_team_id: 'd' } : x)
    expect(resolveKnockouts(locked, standings, true, [])[0].home_team_id).toBe('d')
  })
})

describe('matchMinute', () => {
  const now = Date.parse('2026-11-22T10:00:00Z')
  const started = new Date(now - 65_000).toISOString()
  it('shows added time past 10 minutes', () => {
    const r = matchMinute({ status: 'live', clock_offset_s: 600, clock_started_at: started }, now, 10)
    expect(r).toEqual({ min: 12, label: "10+2'" })
  })
  it('counts the running minute', () => {
    expect(matchMinute({ status: 'live', clock_offset_s: 0, clock_started_at: started }, now, 10).label).toBe("2'")
    expect(matchMinute({ status: 'live', clock_offset_s: 0, clock_started_at: new Date(now).toISOString() }, now, 10).label).toBe("1'")
  })
  it('freezes while paused and never goes negative', () => {
    expect(matchMinute({ status: 'paused', clock_offset_s: 300, clock_started_at: started }, now, 10).label).toBe("5'")
    expect(matchMinute({ status: 'live', clock_offset_s: 0, clock_started_at: new Date(now + 5000).toISOString() }, now, 10).min).toBe(1)
  })
  it('labels finished and scheduled', () => {
    expect(matchMinute({ status: 'ft' }, now, 10).label).toBe('FT')
    expect(matchMinute({ status: 'scheduled' }, now, 10).label).toBe('')
    expect(minuteLabel(12, 10)).toBe("10+2'")
  })
})

describe('FORMATIONS', () => {
  it('has 5 slots per formation with GK first', () => {
    for (const [name, slots] of Object.entries(FORMATIONS)) {
      expect(slots, name).toHaveLength(5)
      expect(slots[0].role).toBe('GK')
      for (const s of slots) { expect(s.x).toBeGreaterThanOrEqual(0); expect(s.y).toBeLessThanOrEqual(100) }
    }
    expect(Object.keys(FORMATIONS).sort()).toEqual(['1-1-2', '1-2-1', '2-1-1', '2-2', '3-1'])
  })
})

import { shiftKickoffs } from './fixtures.js'
describe('shiftKickoffs', () => {
  const ms = ['09:00', '09:15', '09:30', '10:00'].map((t, i) => ({ id: `M${i}`, kickoff_at: `2026-11-22T${t}:00.000Z` }))
  it('moves the edited match and every later one by the same amount', () => {
    const ch = shiftKickoffs(ms, 'M0', '2026-11-22T12:00:00.000Z', true)
    expect(ch.map(c => c.kickoff_at.slice(11, 16))).toEqual(['12:00', '12:15', '12:30', '13:00'])
  })
  it('leaves earlier matches alone when editing a middle one', () => {
    const ch = shiftKickoffs(ms, 'M2', '2026-11-22T09:40:00.000Z', true)
    expect(ch.map(c => c.id)).toEqual(['M2', 'M3'])
    expect(ch[1].kickoff_at.slice(11, 16)).toBe('10:10')
  })
  it('changes only that match when cascade is off', () => {
    expect(shiftKickoffs(ms, 'M0', '2026-11-22T12:00:00.000Z', false)).toEqual([{ id: 'M0', kickoff_at: '2026-11-22T12:00:00.000Z' }])
  })
})
