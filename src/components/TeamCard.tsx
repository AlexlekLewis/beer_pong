import React from 'react';
import type { Team } from '../types';

interface TeamCardProps {
    team: Team;
    onRemove?: () => void;
    onBuyBack?: () => void;
    showStats?: boolean;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, onRemove, onBuyBack, showStats = true }) => {
    const isEliminated = team.status === 'eliminated';
    const isPending = team.status === 'buyback-pending';

    return (
        <div className={`clean-card p-5 flex justify-between items-center transition-all bg-white
        ${isEliminated ? 'opacity-70 bg-gray-50 border-dashed border-gray-300' : 'interactive'}
    `}>
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className={`avatar md transition-colors
            ${isEliminated ? 'bg-gray-300 grayscale' : isPending ? 'bg-[var(--warning)]' : ''}
        `}>
                    {team.name.charAt(0).toUpperCase()}
                </div>

                <div>
                    <h3 className="text-heading text-lg leading-tight mb-1">{team.name}</h3>

                    <div className="flex items-center gap-2">
                        {/* Stats or Status */}
                        {isPending && <span className="badge pending">Buy-Back Pending</span>}
                        {isEliminated && isPending === false && <span className="badge eliminated">Eliminated</span>}

                        {showStats && !isPending && !isEliminated && (
                            <div className="flex gap-3 text-sm text-[var(--text-secondary)] font-medium">
                                <span><span className="text-[var(--success)] font-bold">{team.wins}</span>W</span>
                                <span><span className="text-[var(--danger)] font-bold">{team.losses}</span>L</span>
                                {team.buyBacks > 0 && <span className="text-[var(--warning)]">↩ {team.buyBacks}</span>}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                {onRemove && (
                    <button
                        onClick={onRemove}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove Team"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                )}

                {onBuyBack && isEliminated && (
                    <button
                        onClick={onBuyBack}
                        className="btn-primary text-xs py-2 px-4 shadow-none hover:shadow-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)]"
                    >
                        Buy Back
                    </button>
                )}
            </div>
        </div>
    );
};

export default TeamCard;
