import React, { useMemo } from 'react';
import { useTournament } from '../context/TournamentContext';

const BracketView: React.FC = () => {
    const { matches } = useTournament();

    const rounds = useMemo(() => {
        const r: Record<number, typeof matches> = {};
        matches.forEach(m => {
            if (!r[m.round]) r[m.round] = [];
            r[m.round].push(m);
        });
        return r;
    }, [matches]);

    const roundNumbers = Object.keys(rounds).map(Number).sort((a, b) => a - b);

    if (roundNumbers.length === 0) {
        return (
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title"><span className="icon">🏆</span>Bracket</h2>
                </div>
                <div className="empty-state">
                    <div className="icon">📋</div>
                    <p>No matches yet</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title"><span className="icon">🏆</span>Tournament Bracket</h2>
            </div>
            <div className="bracket-container">
                <div className="bracket">
                    {roundNumbers.map(r => (
                        <div key={r} className="bracket-round">
                            <div className="round-header">Round {r}</div>
                            {rounds[r].map(m => (
                                <div key={m.id} className="bracket-match">
                                    {m.isBye ? (
                                        <div className="bracket-team winner" style={{ textAlign: 'center' }}>
                                            {m.team1.name} (BYE)
                                        </div>
                                    ) : (
                                        <>
                                            <div className={`bracket-team ${m.winner?.id === m.team1.id ? 'winner' : ''} ${m.loser?.id === m.team1.id ? 'loser' : ''}`}>
                                                <span>{m.team1.name}</span>
                                                <span className="record">{m.team1.wins}-{m.team1.losses}</span>
                                            </div>
                                            {m.team2 && (
                                                <div className={`bracket-team ${m.winner?.id === m.team2.id ? 'winner' : ''} ${m.loser?.id === m.team2.id ? 'loser' : ''}`}>
                                                    <span>{m.team2.name}</span>
                                                    <span className="record">{m.team2.wins}-{m.team2.losses}</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BracketView;
