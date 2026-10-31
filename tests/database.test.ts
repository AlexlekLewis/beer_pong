import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, expect, it } from 'vitest';

const db = new PGlite();
const owner = '10000000-0000-0000-0000-000000000001';
const player = '10000000-0000-0000-0000-000000000002';
const outsider = '10000000-0000-0000-0000-000000000003';
const event = '20000000-0000-0000-0000-000000000001';
async function asUser(id: string | null, sql: string) {
    await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${id ?? ''}', false); set role ${id ? 'authenticated' : 'anon'};`);
    return db.query(sql);
}
beforeAll(async () => {
    await db.exec(`create role anon; create role authenticated; create schema auth;
        create table auth.users(id uuid primary key);
        create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
        grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;
        insert into auth.users values ('${owner}'), ('${player}'), ('${outsider}');`);
    await db.exec(readFileSync(new URL('../supabase/migrations/20261031003341_player_team_registration.sql', import.meta.url), 'utf8'));
    await db.exec(readFileSync(new URL('../supabase/migrations/20261031003622_tighten_team_fields.sql', import.meta.url), 'utf8'));
}, 30000);
afterAll(() => db.close());
it('enforces ownership, privacy, uniqueness, review privileges and closed events', async () => {
    await asUser(owner, `insert into registration_events(id,owner_id,name) values('${event}','${owner}','Pong');`);
    await expect(asUser(player, `insert into registration_events(id,owner_id,name) values(gen_random_uuid(),'${owner}','Forged');`)).rejects.toThrow();
    await expect(asUser(null, `insert into registration_entries(tournament_id,submitted_by,kind,player1) values('${event}','${player}','player','Alice');`)).rejects.toThrow();
    await expect(asUser(outsider, `insert into registration_entries(tournament_id,submitted_by,kind,player1) values('${event}','${outsider}','team','Missing teammate');`)).rejects.toThrow();
    await asUser(player, `insert into registration_entries(tournament_id,submitted_by,kind,player1) values('${event}','${player}','player','Alice');`);
    expect((await asUser(player, 'select * from registration_entries')).rows).toHaveLength(1);
    expect((await asUser(outsider, 'select * from registration_entries')).rows).toHaveLength(0);
    await expect(asUser(null, 'select * from registration_entries')).rejects.toThrow();
    expect((await asUser(player, `update registration_entries set status='accepted' returning id`)).rows).toHaveLength(0);
    await expect(asUser(player, `update registration_entries set player1='Changed'`)).rejects.toThrow();
    await expect(asUser(player, `insert into registration_entries(tournament_id,submitted_by,kind,player1) values('${event}','${player}','player','Alice');`)).rejects.toThrow();
    await expect(asUser(outsider, `insert into registration_entries(tournament_id,submitted_by,kind,player1,status) values('${event}','${outsider}','player','Eve','accepted');`)).rejects.toThrow();
    expect((await asUser(owner, `update registration_entries set status='accepted' returning id`)).rows).toHaveLength(1);
    expect((await asUser(outsider, `update registration_events set is_open=false returning id`)).rows).toHaveLength(0);
    await asUser(owner, `update registration_events set is_open=false`);
    await expect(asUser(outsider, `insert into registration_entries(tournament_id,submitted_by,kind,player1) values('${event}','${outsider}','player','Eve');`)).rejects.toThrow();
});
