alter table public.registration_entries add constraint team_fields_required
    check (kind <> 'team' or (team_name is not null and player2 is not null));
