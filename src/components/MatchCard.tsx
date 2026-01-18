import React from 'react';
import type { Match } from '../types';

interface MatchCardProps {
    match: Match;
    onSelect?: (matchId: string, winnerId: string) => void;
    completed?: boolean;
    status?: string; // For explicit status overrides if needed
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onSelect, completed }) => {
    const isBye = !match.team2;

    if (isBye) {
        return (
            <div className="match-card bye">
                <div className="match-header">
                    <span className="match-label">BYE</span>
                    <div className="match-status">
                        <span className="dot" style={{ background: 'var(--accent)' }}></span>
                        <span>Auto-advance</span>
                    </div>
                </div>
                <div className="bye-content">
                    <div className="bye-label">ADVANCES TO NEXT ROUND</div>
                    <div className="bye-team">{match.team1.name}</div>
                </div>
            </div>
        );
    }

    const isCompleted = completed || match.completed;

    return (
        <div className={`match-card ${isCompleted ? 'completed' : ''}`}>
            <div className="match-header">
                <span className="match-label">Match</span>
                <div className="match-status">
                    <span className="dot"></span>
                    <span>{isCompleted ? 'Complete' : 'In Progress'}</span>
                </div>
            </div>
            <div className="match-body">
                {/* Team 1 */}
                <div
                    className={`match-team ${match.winner?.id === match.team1.id ? 'winner' : ''} ${match.loser?.id === match.team1.id ? 'loser' : ''}`}
                    onClick={() => !isCompleted && onSelect && match.team2 && onSelect(match.id, match.team1.id)}
                    style={{ cursor: isCompleted || !onSelect ? 'default' : 'pointer' }}
                >
                    <div className="team-info">
                        <span className="team-name">{match.team1.name}</span>
                        {match.team1.buyBacks > 0 && <span className="buyback-badge">×{match.team1.buyBacks}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {!isCompleted && onSelect && <span className="admin-win-hint" style={{ fontSize: '0.7em', textTransform: 'uppercase', opacity: 0.7 }}>Tap to Win</span>}
                        <span className="stats">{match.team1.wins}W-{match.team1.losses}L</span>
                    </div>
                </div>

                <div className="match-vs">VS</div>

                {/* Team 2 */}
                {match.team2 && (
                    <div
                        className={`match-team ${match.winner?.id === match.team2.id ? 'winner' : ''} ${match.loser?.id === match.team2.id ? 'loser' : ''}`}
                        onClick={() => !isCompleted && onSelect && onSelect(match.id, match.team2.id)}
                        style={{ cursor: isCompleted || !onSelect ? 'default' : 'pointer' }}
                    >
                        <div className="team-info">
                            <span className="team-name">{match.team2.name}</span>
                            {match.team2.buyBacks > 0 && <span className="buyback-badge">×{match.team2.buyBacks}</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {!isCompleted && onSelect && <span className="admin-win-hint" style={{ fontSize: '0.7em', textTransform: 'uppercase', opacity: 0.7 }}>Tap to Win</span>}
                            <span className="stats">{match.team2.wins}W-{match.team2.losses}L</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MatchCard;
