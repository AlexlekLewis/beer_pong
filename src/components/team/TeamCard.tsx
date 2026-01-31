// Party Lions - Team Card Component

import { motion } from 'framer-motion';
import type { Team } from '../../types';
import { StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface TeamCardProps {
    team: Team;
    index?: number;
    showActions?: boolean;
    onEdit?: (team: Team) => void;
    onDelete?: (team: Team) => void;
    onClick?: (team: Team) => void;
    selected?: boolean;
    compact?: boolean;
}

export function TeamCard({
    team,
    index,
    showActions = false,
    onEdit,
    onDelete,
    onClick,
    selected = false,
    compact = false,
}: TeamCardProps) {
    return (
        <motion.div
            className={`
        flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer
        ${selected
                    ? 'bg-[var(--gold-main)]/10 border-[var(--gold-main)] shadow-lg shadow-[var(--gold-glow)]'
                    : 'bg-[var(--bg-card)] border-[var(--border)] hover:border-[var(--gold-main)] hover:shadow-lg hover:shadow-[var(--gold-glow)]'
                }
        ${team.status === 'eliminated' ? 'opacity-60' : ''}
      `}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index ? index * 0.05 : 0 }}
            onClick={() => onClick?.(team)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
        >
            {/* Index/Rank */}
            {index !== undefined && (
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--bg-elevated)] text-[var(--text-muted)] font-bold">
                    {index + 1}
                </div>
            )}

            {/* Team Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white truncate">
                        {team.name}
                    </span>
                    {team.isWildcard && (
                        <span className="text-lg" title="Wildcard">🎰</span>
                    )}
                </div>

                {!compact && (team.player1 || team.player2) && (
                    <div className="text-sm text-[var(--text-muted)] truncate">
                        {[team.player1, team.player2].filter(Boolean).join(' & ')}
                    </div>
                )}
            </div>

            {/* Status Badge */}
            {team.status !== 'active' && (
                <StatusBadge status={team.status} />
            )}

            {/* Buy-back count */}
            {team.buyBackCount > 0 && (
                <div className="text-sm text-[var(--purple-main)]" title="Times bought back">
                    💰 ×{team.buyBackCount}
                </div>
            )}

            {/* Actions */}
            {showActions && (
                <div className="flex gap-2">
                    {onEdit && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(team); }}
                            className="p-2 text-[var(--text-muted)] hover:text-white transition-colors"
                            title="Edit"
                        >
                            ✏️
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(team); }}
                            className="p-2 text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors"
                            title="Delete"
                        >
                            🗑️
                        </button>
                    )}
                </div>
            )}
        </motion.div>
    );
}

// Team List Component
interface TeamListProps {
    teams: Team[];
    showActions?: boolean;
    onEdit?: (team: Team) => void;
    onDelete?: (team: Team) => void;
    onSelect?: (team: Team) => void;
    selectedId?: string;
    emptyMessage?: React.ReactNode;
    emptyAction?: React.ReactNode;
}

export function TeamList({
    teams,
    showActions = false,
    onEdit,
    onDelete,
    onSelect,
    selectedId,
    emptyMessage = 'No teams added yet',
    emptyAction
}: TeamListProps) {
    if (teams.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-white/10 rounded-xl bg-black/20">
                <div className="text-6xl mb-4 opacity-80">🦁</div>
                <h3 className="text-xl font-bold text-white mb-2">Ready to Rumble?</h3>
                <div className="text-[var(--text-muted)] text-center max-w-sm mb-6">
                    {emptyMessage}
                </div>
                {emptyAction}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {teams.map((team, index) => (
                <TeamCard
                    key={team.id}
                    team={team}
                    index={index}
                    showActions={showActions}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onClick={onSelect}
                    selected={team.id === selectedId}
                />
            ))}
        </div>
    );
}
