// Party Lions - Bracket Components

import { motion } from 'framer-motion';
import type { Match, Team } from '../../types';
import { useTournamentStore } from '../../lib/store';
import { getMatchesForRound } from '../../lib/bracket';

// Match Node Component
interface MatchNodeProps {
    match: Match;
    team1?: Team;
    team2?: Team;
    isActive?: boolean;
    isFinal?: boolean;
    onSelectWinner?: (teamId: string) => void;
}

export function MatchNode({
    match,
    team1,
    team2,
    isActive = false,
    isFinal = false,
    onSelectWinner,
}: MatchNodeProps) {
    const isComplete = match.status === 'completed';
    const isPending = match.status === 'pending';

    return (
        <motion.div
            className={`
        relative rounded-xl border-2 transition-all
        ${isActive
                    ? 'border-[var(--gold-main)] shadow-lg shadow-[var(--gold-glow)] bg-[#1e1428]'
                    : isComplete
                        ? 'border-[var(--success)]/30 bg-[#1e1428]'
                        : 'border-[var(--border)] bg-[#1e1428]'
                }
        ${isFinal ? 'p-6' : 'p-3'}
      `}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={isActive ? { scale: 1.02 } : undefined}
        >
            {isFinal && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--gold-main)] text-black px-3 py-1 rounded text-xs font-bold tracking-wider">
                    🏆 FINAL
                </div>
            )}

            <div className="space-y-2">
                {/* Team 1 */}
                <TeamSlot
                    team={team1}
                    isWinner={match.winnerId === team1?.id}
                    isLoser={isComplete && match.winnerId !== team1?.id}
                    isClickable={isActive && !!team1}
                    onClick={() => team1 && onSelectWinner?.(team1.id)}
                />

                {/* VS Divider */}
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-[var(--border)]" />
                    <span className="text-xs text-[var(--text-dim)] font-bold">VS</span>
                    <div className="flex-1 h-px bg-[var(--border)]" />
                </div>

                {/* Team 2 */}
                <TeamSlot
                    team={team2}
                    isWinner={match.winnerId === team2?.id}
                    isLoser={isComplete && match.winnerId !== team2?.id}
                    isClickable={isActive && !!team2}
                    onClick={() => team2 && onSelectWinner?.(team2.id)}
                />
            </div>
        </motion.div>
    );
}

// Team Slot within a Match
interface TeamSlotProps {
    team?: Team;
    isWinner?: boolean;
    isLoser?: boolean;
    isClickable?: boolean;
    onClick?: () => void;
}

function TeamSlot({ team, isWinner, isLoser, isClickable, onClick }: TeamSlotProps) {
    if (!team) {
        return (
            <div className="h-10 flex items-center justify-center text-[var(--text-dim)] text-sm italic">
                TBD
            </div>
        );
    }

    return (
        <motion.button
            className={`
        w-full h-10 px-3 rounded-lg flex items-center gap-2 transition-all text-left
        ${isWinner
                    ? 'bg-[var(--success)]/20 border border-[var(--success)] text-white'
                    : isLoser
                        ? 'bg-[var(--eliminated-gray)]/20 text-[var(--text-dim)] line-through'
                        : isClickable
                            ? 'bg-[var(--bg-card)] hover:bg-[var(--gold-main)]/20 hover:border-[var(--gold-main)] border border-transparent cursor-pointer'
                            : 'bg-[var(--bg-card)]'
                }
      `}
            onClick={isClickable ? onClick : undefined}
            disabled={!isClickable}
            whileHover={isClickable ? { scale: 1.02 } : undefined}
            whileTap={isClickable ? { scale: 0.98 } : undefined}
        >
            {/* Wildcard indicator */}
            {team.isWildcard && <span className="text-sm">🎰</span>}

            {/* Team name */}
            <span className="flex-1 truncate font-medium">
                {team.name}
            </span>

            {/* Winner crown */}
            {isWinner && <span>🏆</span>}
        </motion.button>
    );
}

// Full Bracket View
interface BracketProps {
    onSelectWinner?: (matchId: string, winnerId: string) => void;
}

export function Bracket({ onSelectWinner }: BracketProps) {
    const { tournament, getTeamById } = useTournamentStore();

    if (!tournament) return null;

    const rounds = Array.from({ length: tournament.totalRounds }, (_, i) => i + 1);

    // Get round names
    const getRoundName = (round: number, total: number) => {
        const remaining = total - round;
        if (remaining === 0) return 'Final';
        if (remaining === 1) return 'Semifinals';
        if (remaining === 2) return 'Quarterfinals';
        return `Round ${round}`;
    };

    return (
        <div className="overflow-x-auto pb-4">
            <div className="flex gap-8 min-w-fit px-4">
                {rounds.map((round) => {
                    const allMatches = getMatchesForRound(tournament.matches, round);
                    // Filter out completely empty bye matches (both teams are TBD)
                    const matches = allMatches.filter(match => {
                        // Show if either team exists OR if it's not a bye match
                        return match.team1Id || match.team2Id || !match.isByeMatch;
                    });

                    // Skip rendering this round column if no visible matches
                    if (matches.length === 0) return null;

                    const isCurrentRound = round === tournament.currentRound;
                    const isFinalRound = round === tournament.totalRounds;

                    return (
                        <div key={round} className="flex flex-col gap-4">
                            {/* Round Header */}
                            <div className={`
                text-center py-2 px-4 rounded-lg
                ${isCurrentRound
                                    ? 'bg-[var(--gold-main)] text-black'
                                    : 'bg-[#1e1428] text-[var(--text-muted)]'
                                }
              `}>
                                <h3 className="font-bold text-sm tracking-wider">
                                    {getRoundName(round, tournament.totalRounds)}
                                </h3>
                            </div>

                            {/* Matches */}
                            <div
                                className="flex flex-col gap-4 justify-around flex-1"
                                style={{ minWidth: isFinalRound ? '220px' : '180px' }}
                            >
                                {matches.map((match) => {
                                    const team1 = match.team1Id ? getTeamById(match.team1Id) : undefined;
                                    const team2 = match.team2Id ? getTeamById(match.team2Id) : undefined;
                                    const isActive = isCurrentRound &&
                                        match.status !== 'completed' &&
                                        !!team1 && !!team2;

                                    return (
                                        <MatchNode
                                            key={match.id}
                                            match={match}
                                            team1={team1}
                                            team2={team2}
                                            isActive={isActive}
                                            isFinal={isFinalRound}
                                            onSelectWinner={(winnerId) =>
                                                onSelectWinner?.(match.id, winnerId)
                                            }
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
