# MML 4.0 · Milan Malayali League

Live scores, scorers, lineups and table for **MML 4.0** (Sunday 22 November 2026), organised by
**Milan Malayali Network**. Tech partner **CAC** ([calcioac.com](https://calcioac.com)).

- Public site: home story (Kerala → Milan) + match day, Matches, Table & knockouts, Teams, Golden Boot.
- Admin at `/admin`: live scoring from a phone, lineups/formations, teams & players, fixtures, sponsors, settings.
- Without Supabase keys the site runs in **demo mode** with sample data (admin edits stay in the browser tab).

## Setup (about 10 minutes)

### 1. Supabase project
1. Create a project at [supabase.com](https://supabase.com) (region: EU).
2. **SQL Editor → New query**, paste all of [`supabase/schema.sql`](supabase/schema.sql), run.
3. New query, paste [`supabase/seed.sql`](supabase/seed.sql), run. This adds the 5 clubs, 6 sponsors and the 13 fixtures.

### 2. Admin login
1. **Authentication → Users → Add user** → your email + a password (tick "Auto confirm").
2. **Authentication → Sign In / Providers**: turn **off** "Allow new users to sign up".
3. SQL Editor, run (with your email):
   ```sql
   insert into admins (user_id, email)
   select id, email from auth.users where email = 'you@example.com';
   ```
   Repeat for anyone else who should be able to edit.

### 3. Deploy on Vercel
1. [vercel.com/new](https://vercel.com/new) → import `calcio-ac/MML` (framework: Vite).
2. Environment variables (Supabase → Project Settings → API):
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_ANON_KEY` = `anon` public key
3. Deploy. Open `/admin`, sign in.

### 4. Before Sunday
- **Teams**: add each squad (max 10, position GK/DEF/MID/FWD), manager and team director.
- **Fixtures**: set real kick-off times (seeded at 10:00 with 15-minute slots).
- **Lineups**: pick formation + 5 starters per match ("Copy last lineup" saves time).

## Match day (one phone at the touchline)
1. **Live** opens on the current match. **Start match** starts the 10-minute clock.
2. **⚽ Goal** under the scoring team → tap the scorer. Own goal: pick from the opponent list in the same sheet.
3. Made a mistake? **↩ Undo last** removes the latest event. Score is always counted from the goals list.
4. **End match** → **Next match**. Semis and final fill in from the table automatically; knockout draws show a penalties box.

The public site updates within about a second. If a phone loses signal it re-syncs when it reconnects.

## Rules built in
- Win 3, draw 1. Order: points → goal difference → goals scored → head-to-head → manual rank (Settings).
- Semi-finals 1st v 4th and 2nd v 3rd; final between the semi winners.
- Own goals count for the other team and not for the Golden Boot.

## Develop
```bash
npm install
cp .env.example .env.local   # optional; without it you get demo mode
npm run dev
npm test                     # tournament logic tests
node scripts/make-seed.mjs   # regenerate supabase/seed.sql from src/data/seedData.js
```
