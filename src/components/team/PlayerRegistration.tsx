import { useState } from 'react';
import { useTournamentStore } from '../../lib/store';
import { availablePlayers } from '../../lib/registration';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export function PlayerRegistration() {
    const { tournament, registerPlayer, registerTeam, removePlayer } = useTournamentStore();
    const [playerName, setPlayerName] = useState('');
    const [teamName, setTeamName] = useState('');
    const [first, setFirst] = useState('');
    const [second, setSecond] = useState('');
    const [message, setMessage] = useState('');
    if (!tournament || tournament.status !== 'setup') return null;
    const waiting = availablePlayers(tournament.players ?? [], tournament.teams);
    return <section className="glass-panel p-6 mb-6 space-y-5" aria-labelledby="players-heading">
        <h2 id="players-heading" className="text-xl font-bold">PLAYER REGISTRATION</h2>
        <p className="text-sm text-[var(--text-muted)]">Register solo players, then pair them into teams. Players waiting below are not in the bracket yet.</p>
        <form className="flex gap-3 items-end" onSubmit={event => {
            event.preventDefault();
            const error = registerPlayer(playerName);
            setMessage(error ?? 'Player registered.');
            if (!error) setPlayerName('');
        }}>
            <Input label="Player display name" required maxLength={60} value={playerName} onChange={event => setPlayerName(event.target.value)} />
            <Button type="submit">Register player</Button>
        </form>
        <h3 className="font-bold">Waiting for a team ({waiting.length})</h3>
        <ul className="space-y-2">{waiting.map(player => <li key={player.id} className="flex justify-between items-center gap-3">
            <span>{player.name}</span><button type="button" className="text-sm text-[var(--text-muted)]" onClick={() => removePlayer(player.id)} aria-label={`Remove ${player.name}`}>Remove</button>
        </li>)}</ul>
        {waiting.length >= 2 && <form className="space-y-3" onSubmit={event => {
            event.preventDefault();
            const error = registerTeam(teamName, first, second);
            setMessage(error ?? 'Team registered and added to the roster.');
            if (!error) { setTeamName(''); setFirst(''); setSecond(''); }
        }}>
            <Input label="New team name" required maxLength={60} value={teamName} onChange={event => setTeamName(event.target.value)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[first, second].map((value, index) => <label key={index} className="text-sm">Player {index + 1}
                <select className="input mt-2" required value={value} onChange={event => (index === 0 ? setFirst : setSecond)(event.target.value)}>
                    <option value="">Select a player</option>
                    {waiting.filter(player => player.id !== (index === 0 ? second : first)).map(player => <option key={player.id} value={player.id}>{player.name}</option>)}
                </select>
            </label>)}</div>
            <Button type="submit" fullWidth>Create team from players</Button>
        </form>}
        <p role="status" className="text-sm">{message}</p>
    </section>;
}
