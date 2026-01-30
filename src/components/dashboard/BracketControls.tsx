// Party Lions - Bracket Controls Component (Moderator)

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useTournamentStore } from '../../lib/store';

export function BracketControls() {
    const { tournament, getTeamById, overrideMatchWinner, restartMatch, forceAdvanceRound } = useTournamentStore();
    const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
    const [showOverrideModal, setShowOverrideModal] = useState(false);

    if (!tournament) return null;

    const matchesByRound = tournament.matches.reduce((acc, match) => {
        if (!acc[match.round]) acc[match.round] = [];
        acc[match.round].push(match);
        return acc;
    }, {} as Record<number, typeof tournament.matches>);

    const selectedMatchData = selectedMatch ? tournament.matches.find(m => m.id === selectedMatch) : null;

    const handleOverride = (newWinnerId: string) => {
        if (selectedMatch) {
            overrideMatchWinner(selectedMatch, newWinnerId);
            setShowOverrideModal(false);
            setSelectedMatch(null);
        }
    };

    const handleRestart = (matchId: string) => {
        if (confirm('Restart this match? The winner will be removed and both teams set to active.')) {
            restartMatch(matchId);
        }
    };

    const handleForceAdvance = () => {
        if (confirm('Force advance to next round? This will skip buy-back and wildcard phases.')) {
            forceAdvanceRound();
        }
    };

    return (
        <motion.div
            className="glass-panel p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>🎮</span> Bracket Controls
                </h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleForceAdvance}
                    icon="⏩"
                >
                    Force Advance
                </Button>
            </div>

            {/* Tournament Status */}
            <div className="mb-6 p-4 bg-[var(--bg-elevated)] rounded-lg">
                <div className="flex justify-between items-center">
                    <span className="text-[var(--text-muted)]">Status:</span>
                    <StatusBadge status={tournament.status} />
                </div>
                <div className="flex justify-between items-center mt-2">
                    <span className="text-[var(--text-muted)]">Current Round:</span>
                    <span className="text-white font-bold">{tournament.currentRound} of {tournament.totalRounds}</span>
                </div>
            </div>

            {/* Matches by Round */}
            <div className="space-y-6 max-h-[400px] overflow-y-auto">
                {Object.entries(matchesByRound).map(([round, matches]) => (
                    <div key={round}>
                        <h4 className="text-sm font-medium text-[var(--gold-main)] mb-3">
                            Round {round} {Number(round) === tournament.totalRounds ? '(Final)' : ''}
                        </h4>
                        <div className="space-y-2">
                            {matches.filter(m => !m.isByeMatch).map(match => {
                                const team1 = match.team1Id ? getTeamById(match.team1Id) : null;
                                const team2 = match.team2Id ? getTeamById(match.team2Id) : null;

                                return (
                                    <div
                                        key={match.id}
                                        className={`p-3 rounded-lg border ${match.status === 'completed'
                                                ? 'bg-[var(--bg-card)] border-[var(--border)]'
                                                : 'bg-[var(--bg-elevated)] border-[var(--gold-main)]/30'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm ${match.winnerId === match.team1Id
                                                            ? 'text-[var(--success)] font-bold'
                                                            : 'text-white'
                                                        }`}>
                                                        {team1?.name || 'TBD'}
                                                    </span>
                                                    {match.winnerId === match.team1Id && <span>🏆</span>}
                                                </div>
                                                <div className="text-xs text-[var(--text-dim)] my-1">vs</div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm ${match.winnerId === match.team2Id
                                                            ? 'text-[var(--success)] font-bold'
                                                            : 'text-white'
                                                        }`}>
                                                        {team2?.name || 'TBD'}
                                                    </span>
                                                    {match.winnerId === match.team2Id && <span>🏆</span>}
                                                </div>
                                            </div>

                                            {match.status === 'completed' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedMatch(match.id);
                                                            setShowOverrideModal(true);
                                                        }}
                                                        className="p-2 text-[var(--text-muted)] hover:text-[var(--gold-main)] transition-colors"
                                                        title="Override winner"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handleRestart(match.id)}
                                                        className="p-2 text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors"
                                                        title="Restart match"
                                                    >
                                                        🔄
                                                    </button>
                                                </div>
                                            )}

                                            {match.status === 'pending' && (
                                                <span className="text-xs text-[var(--text-dim)]">Pending</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Override Winner Modal */}
            <Modal
                isOpen={showOverrideModal}
                onClose={() => {
                    setShowOverrideModal(false);
                    setSelectedMatch(null);
                }}
                title="✏️ Override Winner"
                size="sm"
            >
                {selectedMatchData && (
                    <div className="space-y-4">
                        <p className="text-[var(--text-muted)] text-sm">
                            Select the correct winner for this match:
                        </p>

                        <div className="space-y-3">
                            {[selectedMatchData.team1Id, selectedMatchData.team2Id].filter(Boolean).map(teamId => {
                                const team = getTeamById(teamId!);
                                if (!team) return null;

                                return (
                                    <button
                                        key={team.id}
                                        onClick={() => handleOverride(team.id)}
                                        className={`w-full p-4 rounded-lg border transition-all ${selectedMatchData.winnerId === team.id
                                                ? 'bg-[var(--success)]/20 border-[var(--success)] text-[var(--success)]'
                                                : 'bg-[var(--bg-elevated)] border-[var(--border)] text-white hover:border-[var(--gold-main)]'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{team.name}</span>
                                            {selectedMatchData.winnerId === team.id && (
                                                <span>Current Winner</span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <Button
                            variant="ghost"
                            fullWidth
                            onClick={() => {
                                setShowOverrideModal(false);
                                setSelectedMatch(null);
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                )}
            </Modal>
        </motion.div>
    );
}

// Status Badge
function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        setup: 'bg-blue-500/20 text-blue-400',
        in_progress: 'bg-green-500/20 text-green-400',
        buy_back_phase: 'bg-yellow-500/20 text-yellow-400',
        wildcard_phase: 'bg-purple-500/20 text-purple-400',
        completed: 'bg-gray-500/20 text-gray-400',
    };

    const labels: Record<string, string> = {
        setup: 'Setup',
        in_progress: 'In Progress',
        buy_back_phase: 'Buy-Back Phase',
        wildcard_phase: 'Wildcard Phase',
        completed: 'Completed',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status] || colors.setup}`}>
            {labels[status] || status}
        </span>
    );
}
