-- ============================================================
-- MML 4.0 — Supabase schema. Run once in Supabase → SQL Editor.
-- Safe to re-run (IF NOT EXISTS / OR REPLACE / DROP POLICY IF EXISTS).
-- ============================================================

create table if not exists teams (
  id text primary key,                       -- slug, e.g. 'sexy-sesto'
  name text not null,
  short_name text not null,
  logo_url text,
  primary_color text default '#C8373A',
  secondary_color text default '#0B2A3E',
  manager text,
  team_director text,
  metro_line text,
  tiebreak_rank int,                         -- manual last-resort tie-break (1 = higher)
  sort int default 0,
  created_at timestamptz default now()
);

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  team_id text not null references teams(id) on delete cascade,
  name text not null,
  position text not null check (position in ('GK','DEF','MID','FWD')),
  created_at timestamptz default now()
);

-- max 10 players per team
create or replace function enforce_squad_size() returns trigger language plpgsql as $$
begin
  if (select count(*) from players where team_id = new.team_id and id <> new.id) >= 10 then
    raise exception 'A team can have at most 10 players';
  end if;
  return new;
end $$;
drop trigger if exists squad_size on players;
create trigger squad_size before insert or update of team_id on players
  for each row execute function enforce_squad_size();

create table if not exists matches (
  id text primary key,                       -- 'G1'..'G10', 'SF1', 'SF2', 'F'
  stage text not null check (stage in ('group','sf','final')),
  number int not null,
  home_team_id text references teams(id),
  away_team_id text references teams(id),
  home_source text,                          -- knockouts: 'G1'..'G4' (table position) or 'W:SF1'
  away_source text,
  kickoff_at timestamptz,
  status text not null default 'scheduled' check (status in ('scheduled','live','paused','ft')),
  clock_started_at timestamptz,              -- when the clock was last (re)started
  clock_offset_s int not null default 0,     -- seconds already played before clock_started_at
  home_pens int,
  away_pens int,
  created_at timestamptz default now()
);

create table if not exists match_events (
  id uuid primary key default gen_random_uuid(),
  match_id text not null references matches(id) on delete cascade,
  type text not null check (type in ('goal','own_goal','yellow','red')),
  team_id text not null references teams(id),  -- goals/own goals: team CREDITED with the goal; cards: player's team
  player_id uuid references players(id) on delete set null,
  minute int,
  created_at timestamptz default now()
);
create index if not exists match_events_match on match_events(match_id);

create table if not exists lineups (
  match_id text references matches(id) on delete cascade,
  team_id text references teams(id) on delete cascade,
  formation text not null default '1-2-1',
  slots jsonb not null default '[null,null,null,null,null]'::jsonb, -- player ids, index = formation slot (0 = GK)
  updated_at timestamptz default now(),
  primary key (match_id, team_id)
);

create table if not exists sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text not null,
  url text,
  tier text not null default 'partner' check (tier in ('title','partner')),
  sort int default 0
);

create table if not exists settings (
  key text primary key,
  value jsonb
);

-- Who may edit. Add yourself after creating your login (see README).
create table if not exists admins (
  user_id uuid primary key,
  email text
);

create or replace function is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid())
$$;

-- ============================================================
-- Table privileges (newer Supabase projects don't grant these automatically)
-- ============================================================
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
grant execute on function is_admin() to anon, authenticated;
alter default privileges in schema public grant select on tables to anon, authenticated;
alter default privileges in schema public grant insert, update, delete on tables to authenticated;

-- ============================================================
-- Row level security: everyone reads, only admins write
-- ============================================================
do $$
declare t text;
begin
  foreach t in array array['teams','players','matches','match_events','lineups','sponsors','settings'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "public read" on %I', t);
    execute format('create policy "public read" on %I for select to anon, authenticated using (true)', t);
    execute format('drop policy if exists "admin write" on %I', t);
    execute format('create policy "admin write" on %I for all to authenticated using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;
alter table admins enable row level security;
drop policy if exists "self read" on admins;
create policy "self read" on admins for select to authenticated using (user_id = auth.uid());

-- ============================================================
-- Realtime (live scores without refresh)
-- ============================================================
alter table match_events replica identity full;
alter table lineups replica identity full;
alter table players replica identity full;
do $$
declare t text;
begin
  foreach t in array array['teams','players','matches','match_events','lineups','sponsors','settings'] loop
    begin
      execute format('alter publication supabase_realtime add table %I', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;

-- ============================================================
-- Storage bucket for crest / sponsor uploads from the admin
-- ============================================================
insert into storage.buckets (id, name, public) values ('logos', 'logos', true)
  on conflict (id) do nothing;
drop policy if exists "logos public read" on storage.objects;
create policy "logos public read" on storage.objects for select using (bucket_id = 'logos');
drop policy if exists "logos admin write" on storage.objects;
create policy "logos admin write" on storage.objects for all to authenticated
  using (bucket_id = 'logos' and is_admin()) with check (bucket_id = 'logos' and is_admin());
