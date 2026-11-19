# MML 4.0 — Tournament Website Design

**Date:** 2026-11-19 · **Match day:** Sunday 22 November 2026 · **Owner:** Precious (CAC)

## Intent
Public website for **MML 4.0 — Milan Malayali League**, the annual 5-a-side tournament organised by
**Milan Malayali Network (MMN)**, with **CAC (calcioac.com)** as tech partner. On match day, people at
the pitch and at home open it on their phones to see **live scores, who scored, and each team's
formation on the pitch**. It also carries the tournament's story and gives sponsors visibility.

The homepage tells a story told through code-drawn motion graphics: a young man from Kerala moves to Milan for study/work,
but the boy who played football by the backwaters is still alive in him, and he finds it again on a Milan 5-a-side pitch.

## Goals
- Live scores + scorers that update within ~1s, no refresh.
- Formation of each team per match, drawn on a 5-a-side pitch.
- Group standings auto-calculated; semis/final auto-filled from standings.
- Phone-first admin usable one-handed at the touchline by one person running 13 matches back-to-back.
- Sponsors and the 5 club crests prominently shown.

## Non-goals
- No player photos, stats beyond goals/cards, shot maps, possession.
- No public accounts, comments, predictions.
- No multi-tournament support (MML 5 = copy the repo / reset data).

## Anti-goals (failure even if it works)
- The story animation slowing the page or hiding the scores on match day.
- Admin needing precise taps/drags or a laptop during matches.
- Anyone without the admin login being able to change data.

## Constraints
- Live by **Sun 22 Nov 2026**. One pitch, 13 matches in one day.
- Must work well on mid-range phones on 4G outdoors (contrast, size, weight).
- Supabase (database, realtime, auth). Repo: `github.com/calcio-ac/MML`. Deploy on Vercel.
- Style from the MML 4.0 auction deck: navy `#0B2A3E`, red `#C8373A`, off-white `#F4F1EA`,
  halftone-dot textures. Headlines **Bebas Neue** (used in deck; "Horizon" if a licensed file is supplied),
  body **DM Sans**.

## Tournament format
| Stage | Detail | Matches |
|---|---|---|
| Group | 5 teams, single round-robin | 10 |
| Semi-finals | 1st v 4th, 2nd v 3rd | 2 |
| Final | SF winners | 1 |

Teams: Real Garibaldi FC, Moscova Mafia, Sexy Sesto FC, Atletico Affori, Frattini Fratelli.
Squad: up to 10 players (name + position: GK/DEF/MID/FWD), 1 manager, 1 team director.

## Approaches considered (story)
| | Approach | Trade-off | Picked |
|---|---|---|---|
| A | Scroll-driven story on the homepage, live score bar pinned on top | Most memorable; scores still one tap away | ✅ Precious chose A |
| B | Looping animated background behind scores | Always visible but competes with scores on small screens | — |
| C | Pre-rendered MP4 background | Heavy on 4G, blurry text; good only as a social clip | — |

## Decided
- Fresh build (ASIA2026 repo used only as data-model reference).
- Story approach A.
- Sponsor logos each on a white tile.
- Supabase backend; one person scoring live on a phone.

## Site structure
**Public (bottom tab bar, mobile-first):**
1. **Home** — pinned live bar (current/next match + score). Story in 4 chapters on scroll:
   ① Kerala: backwaters, palms, a boy juggling a ball → ② Departure: plane arc India → Italy, books/laptop →
   ③ Milan: Duomo line-art, metro lines (team names are metro-line themed), grey routine →
   ④ The pitch: floodlights switch on, five dots form a formation → reveals "MML 4.0".
   Then: today's matches, standings, top scorers, sponsors, footer (MMN · tech partner CAC).
2. **Matches** — all 13 fixtures by time; status chip (Upcoming / LIVE + minute / FT).
3. **Match page** — score, goal timeline (scorer, minute, OG), cards, both formations on a pitch.
4. **Table** — group standings (P W D L GF GA GD Pts), top-4 highlighted; knockout bracket.
5. **Teams** — crest, manager, team director, squad grouped by position, team's results.
6. **Stats** — top scorers (Golden Boot), cards.

**Admin (`/admin`, login required):**
- **Live** (default on match day): next/current match; Start / Half-time / Resume / End;
  big ⚽ GOAL per team → tap scorer chip (or Own goal) → minute auto from match clock;
  🟨/🟥 card; ↩ Undo last event. Score is derived from goal events (single source of truth).
- **Lineups**: per match per team pick formation preset (2-2, 1-2-1, 2-1-1, 3-1, 1-1-2) and tap
  players into slots; "copy from last match" button.
- **Teams & players**: add/edit team (name, crest upload, colours, manager, team director), players (name, position).
- **Fixtures**: generate round-robin automatically, edit times; knockouts auto-filled from table (editable).
- **Sponsors**: add/reorder/remove logos + optional link; tier (title / partner).
- **Settings**: match duration, halves on/off.

## Data model (Supabase / Postgres)
- `teams(id, name, short_name, logo_url, primary_color, secondary_color, manager, team_director, sort)`
- `players(id, team_id, name, position)`
- `matches(id, stage[group|sf|final], number, home_team_id, away_team_id, kickoff_at, status[scheduled|live|ht|ft],
   clock_started_at, clock_offset_s, home_pens, away_pens, home_source, away_source)`
- `match_events(id, match_id, type[goal|own_goal|yellow|red], team_id (benefiting team for goals), player_id, minute, created_at)`
- `lineups(match_id, team_id, formation, slots jsonb [{slot, player_id}])`
- `sponsors(id, name, logo_url, url, tier, sort)`
- `settings(key, value jsonb)`
- Views: `standings`, `top_scorers`.
- RLS: public `select` on all; `insert/update/delete` only for authenticated admins.
- Realtime on `matches`, `match_events`, `lineups`.

## Tech (builder's call, stated to Precious)
React + Vite SPA, Supabase JS client, plain CSS with design tokens, story animation in
Canvas/SVG driven by scroll position (no video files; respects `prefers-reduced-motion`).
Logos served from `/public/logos`; sponsor/crest uploads via Supabase Storage.

## Standings tie-breakers (builder's call — confirm)
Points → goal difference → goals for → head-to-head → coin toss (manual override in admin).
Knockout draws decided by penalties entered in admin.

## Left to the builder
Exact illustration style within the palette, animation timing, component structure,
image optimisation, seed data for the 5 teams and sponsors.
