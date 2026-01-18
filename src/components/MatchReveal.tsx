import React, { useState, useEffect } from 'react';
import type { Match } from '../types';

interface MatchRevealProps {
    matches: Match[];
    round: number;
    onClose: () => void;
}

const MatchReveal: React.FC<MatchRevealProps> = ({ matches, round, onClose }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const t = setInterval(() => {
            setCount(prev => {
                if (prev >= matches.length) {
                    clearInterval(t);
                    return prev;
                }
                return prev + 1;
            });
        }, 700);
        return () => clearInterval(t);
    }, [matches.length]);

    return (
        <div className="overlay">
            <h2 className="reveal-title">⚔️ ROUND {round} MATCHUPS ⚔️</h2>
            <div className="reveal-matches">
                {matches.slice(0, count).map((m, i) => (
                    <div key={m.id} className="reveal-match" style={{ animationDelay: `${i * 0.1}s` }}>
                        {m.team2 ? (
                            <>
                                <div className="team">{m.team1.name}</div>
                                <div className="vs">VS</div>
                                <div className="team">{m.team2.name}</div>
                            </>
                        ) : (
                            <>
                                <div className="team">{m.team1.name}</div>
                                <div className="bye-text">BYE</div>
                            </>
                        )}
                    </div>
                ))}
            </div>
            {count >= matches.length && (
                <button className="btn btn-primary btn-large mt-40" onClick={onClose}>
                    LET'S GO! 🍺
                </button>
            )}
        </div>
    );
};

export default MatchReveal;
