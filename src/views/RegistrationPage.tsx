import { useRegistrationUser } from '../lib/useRegistrationUser';
import { useEffect, useState } from 'react';
import { registrationClient } from '../lib/registration-api';
import { normalizeName, validateName } from '../lib/registration';
import { RegistrationLogin } from '../components/team/RegistrationLogin';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function RegistrationPage({ eventId }: { eventId: string }) {
    const userId = useRegistrationUser();
    const [event, setEvent] = useState<{ name: string; is_open: boolean } | null>(null);
    const [loading, setLoading] = useState(true);
    const [kind, setKind] = useState<'player' | 'team'>('player');
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
                : !userId ? <><p>Sign in to register yourself or a two-player team. Your email is used for sign-in and is not shown on the roster.</p><RegistrationLogin /></>
                : submitted ? <div role="status"><h2 className="font-bold text-xl">You’re on the list!</h2><p>Your entry is awaiting organiser approval. Solo players will be paired into teams.</p></div>
                : <form className="space-y-4" onSubmit={async e => {
                    e.preventDefault();
                    if (!registrationClient || busy) return;
                    const error = validateName(first, 'Player name') ?? (kind === 'team' ? validateName(name, 'Team name') ?? validateName(second, 'Second player name') : null);
                    if (error) { setMessage(error); return; }
                    if (kind === 'team' && normalizeName(first).toLowerCase() === normalizeName(second).toLowerCase()) { setMessage('Use two different player display names.'); return; }
                    setBusy(true); setMessage('');
                    const { error: saveError } = await registrationClient.from('registration_entries').insert({ tournament_id: eventId, submitted_by: userId, kind, team_name: kind === 'team' ? normalizeName(name) : null, player1: normalizeName(first), player2: kind === 'team' ? normalizeName(second) : null });
                    setBusy(false);
                    if (saveError) setMessage(saveError.code === '23505' ? 'You or this team are already registered for this tournament.' : 'Could not register. Registration may have closed; refresh and try again.');
                    else setSubmitted(true);
                }}>
                    <label className="block">Registration type<select className="input mt-2" value={kind} onChange={e => setKind(e.target.value as 'player' | 'team')}><option value="player">Solo player — find me a teammate</option><option value="team">Two-player team</option></select></label>
                    {kind === 'team' && <Input label="Team name" required maxLength={60} value={name} onChange={e => setName(e.target.value)} />}
                    <Input label={kind === 'team' ? 'Player 1 display name' : 'Your display name'} required maxLength={60} value={first} onChange={e => setFirst(e.target.value)} />
                    {kind === 'team' && <Input label="Player 2 display name" required maxLength={60} value={second} onChange={e => setSecond(e.target.value)} />}
                    <p className="text-sm text-[var(--text-muted)]">Entries are reviewed by the organiser before joining the bracket. Each signed-in account can submit one entry per tournament.</p>
                    <p role="alert" className="text-sm">{message}</p>
                    <Button type="submit" fullWidth disabled={busy}>{busy ? 'Registering…' : 'Register'}</Button>
                </form>}
        </section>
    </main>;
}
