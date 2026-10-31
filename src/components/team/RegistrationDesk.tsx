import { useRegistrationUser } from '../../lib/useRegistrationUser';
import { useCallback, useEffect, useState } from 'react';
import { registrationClient, registrationLink, closeRegistration, type RegistrationEntry } from '../../lib/registration-api';
import { useTournamentStore } from '../../lib/store';
import { RegistrationLogin } from './RegistrationLogin';
import { Button } from '../ui/Button';

export function RegistrationDesk() {
    const client = registrationClient;
    const userId = useRegistrationUser();
    const { tournament, enableOnlineRegistration, acceptRegistration } = useTournamentStore();
    const [entries, setEntries] = useState<RegistrationEntry[]>([]);
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const id = tournament?.id;
    const load = useCallback(async () => {
        if (!registrationClient || !id || !userId) return;
        const [eventResult, entryResult] = await Promise.all([
            client!.from('registration_events').select('is_open,owner_id').eq('id', id).maybeSingle(),
            client!.from('registration_entries').select('*').eq('tournament_id', id).order('created_at'),
        ]);
        if (entryResult.error || eventResult.error) setMessage('Could not load registration. Check the backend configuration and try Refresh.');
        else { setEntries(entryResult.data ?? []); setIsOpen(eventResult.data?.owner_id === userId && eventResult.data.is_open); }
    }, [id, userId, client]);
    useEffect(() => { void load(); }, [load]);
    if (!tournament || tournament.status !== 'setup') return null;
    const run = async (action: () => Promise<void>) => {
        if (busy) return;
        setBusy(true); setMessage('');
        try { await action(); await load(); }
        catch (error) { setMessage(error instanceof Error ? error.message : 'Action failed. Please try again.'); }
        finally { setBusy(false); }
    };
    return <section className="glass-panel p-6 mb-6 space-y-4" aria-labelledby="online-heading">
        <h2 id="online-heading" className="text-xl font-bold">ONLINE REGISTRATION</h2>
        {!registrationClient ? <p className="text-sm">Shared registration needs a connected Supabase backend. Local player and team entry is available below.</p>
            : !userId ? <><p>Organisers: sign in to open registration and review entries from players’ phones.</p><RegistrationLogin /></>
            : <>
                <p className="text-sm">Open a shared sign-up link, then refresh here to review entries. Accepted entries are saved in this browser’s tournament; keep a backup before changing devices.</p>
                <div className="flex flex-wrap gap-3">
                    <Button disabled={busy} onClick={() => void run(async () => {
                        const { data: existing, error: readError } = await client!.from('registration_events').select('owner_id').eq('id', tournament.id).maybeSingle();
                        if (readError) throw readError;
                        if (existing && existing.owner_id !== userId) throw new Error('Sign in with the organiser account that opened this tournament.');
                        const result = existing
                            ? await client!.from('registration_events').update({ name: tournament.name, is_open: true }).eq('id', tournament.id).select('id').single()
                            : await client!.from('registration_events').insert({ id: tournament.id, name: tournament.name, owner_id: userId }).select('id').single();
                        if (result.error) throw result.error;
                        enableOnlineRegistration();
                    })}>Open registration</Button>
                    <Button variant="ghost" disabled={busy} onClick={() => void run(load)}>Refresh entries</Button>
                    {isOpen && <Button variant="ghost" disabled={busy} onClick={() => void run(() => closeRegistration(tournament.id))}>Close registration</Button>}
                </div>
                {isOpen && <label className="block text-sm">Share this link with players<input className="input mt-2" readOnly value={registrationLink(tournament.id)} onFocus={event => event.target.select()} /><a className="underline inline-block mt-2" href={registrationLink(tournament.id)} target="_blank" rel="noreferrer">Preview registration page</a></label>}
                <h3 className="font-bold">Pending entries ({entries.filter(entry => entry.status === 'pending').length})</h3>
                <ul className="space-y-3">{entries.filter(entry => entry.status === 'pending').map(entry => <li key={entry.id} className="border border-[var(--border)] rounded p-3 space-y-2">
                    <p>{entry.kind === 'team' ? entry.team_name : 'Solo player'} — {entry.player1}{entry.player2 ? ` & ${entry.player2}` : ''}</p>
                    <div className="flex gap-2">{(['accepted', 'rejected'] as const).map(status => <Button key={status} size="sm" variant={status === 'accepted' ? 'primary' : 'ghost'} disabled={busy} onClick={() => void run(async () => {
                        const current = useTournamentStore.getState().tournament;
                        if (status === 'rejected' && (current?.teams.some(team => team.registrationId === entry.id) || current?.players?.some(player => player.registrationId === entry.id))) throw new Error('This entry is already in the local roster. Finish accepting it, then remove it from the roster if needed.');
                        if (status === 'accepted') {
                            const error = acceptRegistration(entry);
                            if (error) throw new Error(error);
                        }
                        const { error } = await client!.from('registration_entries').update({ status }).eq('id', entry.id).select('id').single();
                        if (error) throw error;
                    })}>{status === 'accepted' ? 'Accept' : 'Reject'}</Button>)}</div>
                </li>)}</ul>
                {entries.some(entry => entry.status === 'accepted') && <Button variant="ghost" disabled={busy} onClick={() => void run(async () => {
                    for (const entry of entries.filter(item => item.status === 'accepted')) {
                        const error = acceptRegistration(entry);
                        if (error) throw new Error(error);
                    }
                    setMessage('Accepted entries restored to this device.');
                })}>Restore accepted entries to this device</Button>}
            </>}
        <p role="status" className="text-sm">{message}</p>
    </section>;
}
