import React from 'react';
import type { Match } from '../types';

interface MatchDirectorCardProps {
    match: Match;
    onRecordResult: (matchId: string, winnerId: string) => void;
    onReset: (matchId: string) => void;
}

const MatchDirectorCard: React.FC<MatchDirectorCardProps> = ({ match, onRecordResult, onReset }) => {
    const isCompleted = match.completed;

    return (
        <div className={`match-card ${isCompleted ? 'completed' : ''}`}>
            <div className="match-header">
                <span>Match #{match.id.slice(0, 4)}</span>
                <div className="match-status">
                    <span className="dot"></span>
                    <span>{isCompleted ? 'Final' : 'Live'}</span>
                </div>
            </div>

            <div className="match-body">
                {/* Team 1 */}
                <div
                    className={`match-team ${match.winner?.id === match.team1.id ? 'winner' : ''} ${match.loser?.id === match.team1.id ? 'loser' : ''}`}
                    onClick={() => !isCompleted && onRecordResult(match.id, match.team1.id)}
                    style={{ cursor: isCompleted ? 'default' : 'pointer' }}
                >
                    <div className="team-info">
                        <span className="team-name">{match.team1.name}</span>
                        {match.team1.buyBacks > 0 && <span className="buyback-badge">×{match.team1.buyBacks}</span>}
                    </div>
                    <div className="stats">{match.team1.wins}W</div>
                </div>

                <div className="match-vs">VS</div>

                {/* Team 2 */}
                {match.team2 ? (
                    <div
                        className={`match-team ${match.winner?.id === match.team2!.id ? 'winner' : ''} ${match.loser?.id === match.team2!.id ? 'loser' : ''}`}
                        onClick={() => !isCompleted && onRecordResult(match.id, match.team2!.id)}
                        style={{ cursor: isCompleted ? 'default' : 'pointer' }}
                    >
                        <div className="team-info">
                            <span className="team-name">{match.team2.name}</span>
                            {match.team2.buyBacks > 0 && <span className="buyback-badge">×{match.team2.buyBacks}</span>}
                        </div>
                        <div className="stats">{match.team2.wins}W</div>
                    </div>
                ) : (
                    <div className="bye-content">
                        <div className="bye-label">BYE RUN</div>
                    </div>
                )}

                {/* Undo Action */}
                {isCompleted && (
                    <div style={{ marginTop: '15px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                        <button
                            onClick={(e) => { e.stopPropagation(); onReset(match.id); }}
                            className="btn-tiny"
                            style={{ color: 'var(--text-dim)', background: 'transparent', border: 'none', fontSize: '0.7em' }}
                        >
                            ↺ Undo Result
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MatchDirectorCard;
