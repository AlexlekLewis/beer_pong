import React from 'react';
import type { Match } from '../types';

interface AdminMatchRowProps {
    match: Match;
    onSelect: (matchId: string, winnerId: string) => void;
}

const AdminMatchRow: React.FC<AdminMatchRowProps> = ({ match, onSelect }) => {
    return (
        <div className="match-row">
            {/* Team 1 */}
            <div className="team-side">
                <span className="team-name">{match.team1.name}</span>
                <span className="team-record">({match.team1.wins}W)</span>
                <button
                    className="btn-win"
                    onClick={() => onSelect(match.id, match.team1.id)}
                >
                    WINNER
                </button>
            </div>

            {/* VS Divider */}
            <div className="vs-badge">VS</div>

            {/* Team 2 */}
            <div className="team-side right">
                <button
                    className="btn-win"
                    onClick={() => match.team2 && onSelect(match.id, match.team2.id)}
                    disabled={!match.team2}
                >
                    WINNER
                </button>
                <span className="team-record">({match.team2 ? `${match.team2.wins}W` : '-'})</span>
                <span className="team-name">{match.team2 ? match.team2.name : 'Bye'}</span>
            </div>

            <style>{`
                .match-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: rgba(255, 255, 255, 0.03);
                    padding: 0.8rem 1rem;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    margin-bottom: 0.5rem;
                }
                
                .match-row:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.1);
                }

                .team-side {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                
                .team-side.right {
                    justify-content: flex-end;
                }

                .team-name {
                    font-weight: bold;
                    font-size: 1.1rem;
                    color: white;
                }

                .team-record {
                    color: var(--text-dim);
                    font-size: 0.9rem;
                }

                .vs-badge {
                    background: #222;
                    color: #666;
                    font-weight: bold;
                    padding: 0.2rem 0.8rem;
                    border-radius: 10px;
                    font-size: 0.8rem;
                    margin: 0 1rem;
                }

                .btn-win {
                    background: rgba(0, 255, 136, 0.1);
                    color: #00ff88;
                    border: 1px solid rgba(0, 255, 136, 0.2);
                    padding: 0.4rem 0.8rem;
                    border-radius: 4px;
                    font-weight: bold;
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-win:hover {
                    background: #00ff88;
                    color: black;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
                }
            `}</style>
        </div>
    );
};

export default AdminMatchRow;
