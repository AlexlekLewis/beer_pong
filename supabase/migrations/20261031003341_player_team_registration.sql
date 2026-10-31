-- Public event metadata; registration contents are private to submitter and organiser.
create table public.registration_events (
    id uuid primary key,
    owner_id uuid not null references auth.users(id),
    name text not null check (length(btrim(name)) between 1 and 120),
    is_open boolean not null default true,
    created_at timestamptz not null default now()
);
create table public.registration_entries (
    id uuid primary key default gen_random_uuid(),
    tournament_id uuid not null references public.registration_events(id) on delete cascade,
    submitted_by uuid not null references auth.users(id),
    kind text not null check (kind in ('player', 'team')),
    team_name text,
    player1 text not null check (length(btrim(player1)) between 1 and 60),
    player2 text,
    status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
    created_at timestamptz not null default now(),
    unique(tournament_id, submitted_by),
    check ((kind = 'player' and team_name is null and player2 is null)
        or (kind = 'team' and length(btrim(team_name)) between 1 and 60
            and length(btrim(player2)) between 1 and 60
            and lower(btrim(player1)) <> lower(btrim(player2))))
);
create unique index registration_team_name_unique on public.registration_entries
    (tournament_id, lower(btrim(team_name))) where kind = 'team';
create index registration_event_owner on public.registration_events(owner_id);
create index registration_entry_submitter on public.registration_entries(submitted_by);

alter table public.registration_events enable row level security;
alter table public.registration_entries enable row level security;
revoke all on public.registration_events, public.registration_entries from anon, authenticated;
grant select on public.registration_events to anon, authenticated;
grant insert(id, owner_id, name) on public.registration_events to authenticated;
grant update(name, is_open) on public.registration_events to authenticated;
grant select on public.registration_entries to authenticated;
grant insert(tournament_id, submitted_by, kind, team_name, player1, player2) on public.registration_entries to authenticated;
grant update(status) on public.registration_entries to authenticated;

create policy "Public event metadata" on public.registration_events for select to anon, authenticated using (true);
create policy "Organisers create their own events" on public.registration_events for insert to authenticated
    with check (owner_id = (select auth.uid()));
create policy "Only organiser changes event" on public.registration_events for update to authenticated
    using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "Submit to an open event" on public.registration_entries for insert to authenticated
    with check (submitted_by = (select auth.uid()) and status = 'pending'
        and exists (select 1 from public.registration_events event where event.id = tournament_id and event.is_open));
create policy "Submitter and organiser read entries" on public.registration_entries for select to authenticated
    using (submitted_by = (select auth.uid()) or exists (
        select 1 from public.registration_events event where event.id = tournament_id and event.owner_id = (select auth.uid())));
create policy "Only organiser reviews entries" on public.registration_entries for update to authenticated
    using (exists (select 1 from public.registration_events event where event.id = tournament_id and event.owner_id = (select auth.uid())))
    with check (exists (select 1 from public.registration_events event where event.id = tournament_id and event.owner_id = (select auth.uid())));
