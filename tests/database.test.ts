import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { afterAll, beforeAll, expect, it } from 'vitest';

const db = new PGlite();
const owner = '10000000-0000-0000-0000-000000000001';
const outsider = '10000000-0000-0000-0000-000000000002';
const event = '20000000-0000-0000-0000-000000000001';
const code = 'ABCD-EFGH-JKLM';
const hash = (value: string) => createHash('sha256').update(value.toUpperCase().replace(/[-\s]/g, '')).digest('hex');
async function asUser(id: string | null, sql: string) {
    await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${id ?? ''}', false); set role ${id ? 'authenticated' : 'anon'};`);
    return db.query(sql);
}
async function submit(groupCode = code, name = 'Lions', first = 'Alice', second = 'Bob', kind = 'team') {
    await db.exec('reset role; set role service_role;');
    const result = await db.query<{ result: { id?: string; error?: string } }>('select public.submit_group_registration($1,$2,$3,$4,$5,$6) as result', [event, groupCode, kind, name, first, second]);
    return result.rows[0].result;
}
beforeAll(async () => {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth;
        create table auth.users(id uuid primary key);
        create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
        grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;
        insert into auth.users values ('${owner}'), ('${outsider}');`);
    const directory = new URL('../supabase/migrations/', import.meta.url);
    for (const file of readdirSync(directory).filter(file => file.endsWith('.sql')).sort()) await db.exec(readFileSync(new URL(file, directory), 'utf8'));
}, 30000);
afterAll(() => db.close());

it('accepts code-authenticated pairs while protecting private entries and organiser actions', async () => {
    await asUser(owner, `insert into registration_events(id,owner_id,name) values('${event}','${owner}','Pong');`);
    await asUser(owner, `insert into registration_group_codes(tournament_id,code_hash) values('${event}','${hash(code)}');`);
    expect((await asUser(outsider, 'select * from registration_group_codes')).rows).toHaveLength(0);
    await expect(asUser(null, 'select * from registration_group_codes')).rejects.toThrow();
    await expect(asUser(outsider, `insert into registration_events(id,owner_id,name) values(gen_random_uuid(),'${owner}','Forged');`)).rejects.toThrow();
    await expect(asUser(outsider, `insert into registration_entries(tournament_id,submitted_by,kind,player1) values('${event}','${outsider}','player','Bypass');`)).rejects.toThrow();
    await expect(asUser(null, `select submit_group_registration('${event}','${code}','player',null,'Bypass',null)`)).rejects.toThrow();
    expect((await submit('WRONG-CODE')).error).toMatch(/Invalid group code/);
    expect((await submit('', 'Missing code')).error).toMatch(/Invalid group code/);
    expect((await submit(code, 'Self pair', 'Alice', 'alice')).error).toMatch(/different player/);
    expect((await submit(code, 'A'.repeat(61))).error).toMatch(/team name/);
    const accepted = await submit('abcd efgh jklm');
    expect(accepted.id).toBeTruthy();
    expect((await submit()).error).toMatch(/already registered/);
    expect((await submit(code, 'Other', 'Charlie', 'Alice')).error).toMatch(/already registered/);
    expect((await submit(code, '', 'Charlie', '', 'player')).id).toBeTruthy();
    const entries = (await asUser(owner, 'select * from registration_entries')).rows;
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({ status: 'pending', submitted_by: null });
    expect((await asUser(outsider, 'select * from registration_entries')).rows).toHaveLength(0);
    await expect(asUser(null, 'select * from registration_entries')).rejects.toThrow();
    expect((await asUser(outsider, `update registration_entries set status='accepted' returning id`)).rows).toHaveLength(0);
    expect((await asUser(owner, `update registration_entries set status='accepted' returning id`)).rows).toHaveLength(2);
    expect((await asUser(outsider, `update registration_events set is_open=false returning id`)).rows).toHaveLength(0);
});

it('invalidates rotated codes and closes registration atomically', async () => {
    const replacement = 'NPQR-STUV-WXYZ';
    await asUser(owner, `update registration_group_codes set code_hash='${hash(replacement)}' where tournament_id='${event}'`);
    expect((await submit(code, 'Bears', 'Dave', 'Eve')).error).toMatch(/Invalid group code/);
    expect((await submit(replacement, 'Bears', 'Dave', 'Eve')).id).toBeTruthy();
    await asUser(owner, `update registration_events set is_open=false where id='${event}'`);
    expect((await submit(replacement, 'Closed', 'Frank', 'Grace')).error).toMatch(/closed/);
});
