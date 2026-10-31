-- Only organisers can see or rotate a group's code hash. Players submit through
-- the Edge Function; they never receive table insert/read/approval privileges.
create table public.registration_group_codes (
    tournament_id uuid primary key references public.registration_events(id) on delete cascade,
    code_hash text not null check (code_hash ~ '^[0-9a-f]{64}$')
);
alter table public.registration_group_codes enable row level security;
revoke all on public.registration_group_codes from anon, authenticated;
grant select, insert, update on public.registration_group_codes to authenticated;
grant all on public.registration_group_codes to service_role;
create policy "Only event owner reads code hash" on public.registration_group_codes for select to authenticated
    using (exists (select 1 from public.registration_events e where e.id = tournament_id and e.owner_id = (select auth.uid())));
create policy "Only event owner creates code" on public.registration_group_codes for insert to authenticated
    with check (exists (select 1 from public.registration_events e where e.id = tournament_id and e.owner_id = (select auth.uid())));
create policy "Only event owner rotates code" on public.registration_group_codes for update to authenticated
    using (exists (select 1 from public.registration_events e where e.id = tournament_id and e.owner_id = (select auth.uid())))
    with check (exists (select 1 from public.registration_events e where e.id = tournament_id and e.owner_id = (select auth.uid())));

alter table public.registration_entries alter column submitted_by drop not null;
revoke insert on public.registration_entries from authenticated;
drop policy "Submit to an open event" on public.registration_entries;

-- Invoker rights: callable only by the server-side service role. The group code
-- is the submission credential; it grants no ability to list or review entries.
create function public.submit_group_registration(
    p_event uuid, p_code text, p_kind text, p_team_name text, p_player1 text, p_player2 text
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
    event_open boolean;
    expected_hash text;
    entry_id uuid;
    first_name text := regexp_replace(btrim(p_player1), '\s+', ' ', 'g');
    second_name text := regexp_replace(btrim(p_player2), '\s+', ' ', 'g');
    team_name text := regexp_replace(btrim(p_team_name), '\s+', ' ', 'g');
begin
    -- Serialize with closing the event and other submissions, avoiding races.
    select e.is_open into event_open from public.registration_events e where e.id = p_event for update;
    select c.code_hash into expected_hash from public.registration_group_codes c where c.tournament_id = p_event for share;
    if not coalesce(event_open, false) or expected_hash is null
        or length(p_code) > 32 or p_code is null
        or expected_hash <> encode(sha256(convert_to(upper(regexp_replace(p_code, '[-\s]', '', 'g')), 'UTF8')), 'hex') then
        return jsonb_build_object('error', 'Invalid group code, or registration is closed.');
    end if;
    if p_kind is null or p_kind not in ('player', 'team') or first_name is null or length(first_name) not between 1 and 60 then
        return jsonb_build_object('error', 'Enter a valid player display name (up to 60 characters).');
    end if;
    if p_kind = 'team' and (team_name is null or length(team_name) not between 1 and 60
        or second_name is null or length(second_name) not between 1 and 60 or lower(first_name) = lower(second_name)) then
        return jsonb_build_object('error', 'Enter a team name and two different player display names (up to 60 characters each).');
    end if;
    if exists (select 1 from public.registration_entries r where r.tournament_id = p_event and r.status <> 'rejected'
        and (lower(r.player1) = lower(first_name) or lower(r.player2) = lower(first_name)
            or (p_kind = 'team' and (lower(r.player1) = lower(second_name) or lower(r.player2) = lower(second_name))))) then
        return jsonb_build_object('error', 'One of these player names is already registered. Use distinct display names or contact the organiser.');
    end if;
    insert into public.registration_entries(tournament_id, kind, team_name, player1, player2)
        values(p_event, p_kind, case when p_kind = 'team' then team_name else null end, first_name,
            case when p_kind = 'team' then second_name else null end) returning id into entry_id;
    return jsonb_build_object('id', entry_id);
exception when unique_violation then
    return jsonb_build_object('error', 'This team name is already registered.');
end;
$$;
revoke all on function public.submit_group_registration(uuid,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.submit_group_registration(uuid,text,text,text,text,text) to service_role;
-- Explicit grants also make this contract work with projects that revoke defaults.
grant select, update on public.registration_events to service_role;
grant select, insert on public.registration_entries to service_role;
