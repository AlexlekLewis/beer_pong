import { useEffect, useState } from 'react';
import { registrationClient, submitGroupEntry } from '../lib/registration-api';
import { normalizeName, validateName } from '../lib/registration';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function RegistrationPage({ eventId }: { eventId: string }) {
    const [code, setCode] = useState('');
    const [event, setEvent] = useState<{ name: string; is_open: boolean } | null>(null);
    const [loading, setLoading] = useState(true);
    const [kind, setKind] = useState<'player' | 'team'>('team');
    const [name, setName] = useState('');
    const [first, setFirst] = useState('');
    const [second, setSecond] = useState('');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [busy, setBusy] = useState(false);
    useEffect(() => {
        if (!registrationClient) return;
        let active = true;
        void registrationClient.from('registration_events').select('name,is_open').eq('id', eventId).single().then(({ data, error }) => {
            if (!active) return;
            setEvent(data);
            setLoading(false);
            if (error) setMessage('This registration link is unavailable. Ask the organiser for a current link.');
        });
        return () => { active = false; };
    }, [eventId]);
    return <main className="min-h-screen p-4 sm:p-8 flex justify-center items-start">
        <section className="glass-panel p-6 mt-8 w-full max-w-lg space-y-5">
            <p className="text-[var(--gold-main)] font-bold">PARTY LIONS</p>
            <h1 className="text-3xl font-bold">{event?.name ?? 'Tournament registration'}</h1>
            {!registrationClient ? <p>Online registration has not been configured. Contact the organiser.</p>
                : loading ? <p role="status">Loading registration…</p>
                : !event ? <p role="alert">{message}</p>
                : !event.is_open ? <p>Registration is closed. Contact the organiser for help.</p>
                : submitted ? <div role="status"><h2 className="font-bold text-xl">You’re on the list!</h2><p>Your entry is awaiting organiser approval. Solo players will be paired into teams.</p></div>
                : <form className="space-y-4" onSubmit={async e => {
                    e.preventDefault();
                    if (!registrationClient || busy) return;
                    if (!code.trim()) { setMessage('Enter the group code from your organiser.'); return; }
                    const error = validateName(first, 'Player name') ?? (kind === 'team' ? validateName(name, 'Team name') ?? validateName(second, 'Second player name') : null);
                    if (error) { setMessage(error); return; }
                    if (kind === 'team' && normalizeName(first).toLowerCase() === normalizeName(second).toLowerCase()) { setMessage('Use two different player display names.'); return; }
                    setBusy(true); setMessage('');
                    try {
                        await submitGroupEntry({ eventId, code: code.trim(), kind, teamName: normalizeName(name), player1: normalizeName(first), player2: normalizeName(second) });
                        setSubmitted(true);
                    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not register. Please try again.'); }
                    finally { setBusy(false); }
                }}>
                    <p className="text-sm text-[var(--text-muted)]">One person can register the pair. Use the group code shared by your organiser — no email or account needed.</p>
                    <Input label="Group code" required maxLength={32} autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="XXXX-XXXX-XXXX" value={code} onChange={e => setCode(e.target.value)} />
                    <label className="block">Registration type<select className="input mt-2" value={kind} onChange={e => setKind(e.target.value as 'player' | 'team')}><option value="player">Solo player — find me a teammate</option><option value="team">Two-player team</option></select></label>
                    {kind === 'team' && <Input label="Team name" required maxLength={60} value={name} onChange={e => setName(e.target.value)} />}
                    <Input label={kind === 'team' ? 'Player 1 display name' : 'Your display name'} required maxLength={60} value={first} onChange={e => setFirst(e.target.value)} />
                    {kind === 'team' && <Input label="Player 2 display name" required maxLength={60} value={second} onChange={e => setSecond(e.target.value)} />}
                    <p className="text-sm text-[var(--text-muted)]">Submit once per pair. Entries are reviewed by the organiser before joining the bracket. Use distinct player display names.</p>
                    <p role="alert" className="text-sm">{message}</p>
                    <Button type="submit" fullWidth disabled={busy}>{busy ? 'Registering…' : 'Register'}</Button>
                </form>}
        </section>
    </main>;
}
