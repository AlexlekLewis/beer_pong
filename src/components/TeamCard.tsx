import React from 'react';
import type { Team } from '../types';

export const TeamCard: React.FC<{ team: Team, onRemove?: () => void }> = ({ team, onRemove }) => {
    const statusColors = {
        active: 'text-[var(--primary)] border-[var(--primary)]',
        eliminated: 'text-[var(--danger)] border-[var(--danger)]',
        'buyback-pending': 'text-[var(--warning)] border-[var(--warning)]'
    };

    return (
        <div className={`p-4 bg-[var(--bg-elevated)] border rounded flex justify-between items-center group hover:bg-[var(--bg-card)] transition-colors ${statusColors[team.status] || 'border-[var(--border)]'}`}>
            <div className="flex items-center gap-4">
                <div className="font-bold text-lg text-white">{team.name}</div>
                <div className={`text-xs px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${statusColors[team.status]}`}>
                    {team.status}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-xs font-mono text-[var(--text-dim)]">
                    {team.wins}W - {team.losses}L
                </div>
                {onRemove && (
                    <button
                        onClick={onRemove}
                        className="text-[var(--danger)] opacity-50 hover:opacity-100 font-bold text-2xl leading-none px-2"
                    >
                        &times;
                    </button>
                )}
            </div>
        </div>
    );
};
