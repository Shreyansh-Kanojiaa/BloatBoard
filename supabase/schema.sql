-- BloatBoard schema. Run in the Supabase SQL editor (or `supabase db push`).

create table if not exists public.apps (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 60),
  category text not null check (category in ('electron', 'java', 'native', 'browser-tab', 'other')),
  ram_mb integer not null check (ram_mb > 0 and ram_mb <= 1000000),
  description text check (char_length(description) <= 280),
  source_url text check (source_url is null or source_url ~* '^https?://'),
  -- nullable so seed rows can exist without a user; RLS still forces auth.uid() on user inserts
  submitted_by uuid references auth.users (id) on delete set null,
  submitter_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  unique (app_id, user_id)
);

create index if not exists votes_app_id_idx on public.votes (app_id);
create index if not exists votes_user_id_idx on public.votes (user_id);

-- Derived leaderboard. security_invoker so RLS on the base tables applies.
create or replace view public.app_scores
with (security_invoker = true) as
select
  a.*,
  coalesce(sum(v.value), 0)::int as score,
  count(v.id)::int as vote_count
from public.apps a
left join public.votes v on v.app_id = a.id
group by a.id;

-- Row Level Security -------------------------------------------------------

alter table public.apps enable row level security;
alter table public.votes enable row level security;

drop policy if exists "apps are public" on public.apps;
create policy "apps are public" on public.apps
  for select using (true);

drop policy if exists "users insert own apps" on public.apps;
create policy "users insert own apps" on public.apps
  for insert to authenticated with check (auth.uid() = submitted_by);

drop policy if exists "users update own apps" on public.apps;
create policy "users update own apps" on public.apps
  for update to authenticated using (auth.uid() = submitted_by) with check (auth.uid() = submitted_by);

drop policy if exists "users delete own apps" on public.apps;
create policy "users delete own apps" on public.apps
  for delete to authenticated using (auth.uid() = submitted_by);

drop policy if exists "votes are public" on public.votes;
create policy "votes are public" on public.votes
  for select using (true);

drop policy if exists "users insert own votes" on public.votes;
create policy "users insert own votes" on public.votes
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "users update own votes" on public.votes;
create policy "users update own votes" on public.votes
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users delete own votes" on public.votes;
create policy "users delete own votes" on public.votes
  for delete to authenticated using (auth.uid() = user_id);

-- Realtime -----------------------------------------------------------------
-- FULL replica identity so UPDATE/DELETE events carry the old `value`,
-- letting clients apply score deltas without refetching.
alter table public.votes replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'votes'
  ) then
    alter publication supabase_realtime add table public.votes;
  end if;
end $$;
