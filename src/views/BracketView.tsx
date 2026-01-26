import React from 'react';
import { useTournament } from '../context/TournamentContext';
import type { Match } from '../types';

export const BracketView: React.FC = () => {
    const { matches, teams } = useTournament();

    // Group by Round
    const rounds = matches.reduce((acc, match) => {
        if (!acc[match.round]) acc[match.round] = [];
        acc[match.round].push(match);
        return acc;
    }, {} as Record<number, Match[]>);

    const roundNumbers = Object.keys(rounds).map(Number).sort((a, b) => a - b);

    const getTeam = (id: string | null) => teams.find(t => t.id === id);

    return (
        <div className="overflow-x-auto pb-4 custom-scrollbar">
            <div className="flex gap-16 min-w-max px-4">
                {roundNumbers.map(round => (
                    <div key={round} className="w-64 flex flex-col justify-center gap-8">
                        <div className="text-center text-[var(--text-dim)] font-bold uppercase tracking-widest font-orbitron pb-4 border-b border-[var(--border)] mb-4">
                            Round {round}
                        </div>

                        {rounds[round].map(match => {
                            const t1 = getTeam(match.team1Id);
                            const t2 = getTeam(match.team2Id);

                            return (
                                <div
                                    key={match.id}
                                    className={`relative bg-[var(--bg-card)] border ${match.completed ? 'border-[var(--primary)]' : 'border-[var(--border)]'} rounded p-3 text-sm transition-all hover:scale-105`}
                                >
                                    {/* Connector Lines (Visual Only - simplified) */}
                                    {round > 1 && (
                                        <div className="absolute top-1/2 -left-8 w-8 h-[2px] bg-[var(--border)]" />
                                    )}
                                    {/* Outgoing Connector - Logic would be complex for exact positioning, skipping strict tree lines for robust grid */}

                                    <div className="flex flex-col gap-2">
                                        <div className={`flex justify-between ${match.winnerId === t1?.id ? 'text-[var(--primary)] font-bold' : ''}`}>
                                            <span className="truncate">{t1?.name || (match.isBye ? 'BYE' : 'TBD')}</span>
                                            <span className="font-mono">{match.score1}</span>
                                        </div>
                                        <div className="h-[1px] bg-[var(--border)]" />
                                        <div className={`flex justify-between ${match.winnerId === t2?.id ? 'text-[var(--primary)] font-bold' : ''}`}>
                                            <span className="truncate">{t2?.name || (match.isBye ? '-' : 'TBD')}</span>
                                            <span className="font-mono">{match.score2}</span>
                                        </div>
                                    </div>

                                    <div className="absolute -top-3 left-3 bg-[var(--bg-dark)] px-2 text-[10px] text-[var(--text-dim)] uppercase">
                                        M{match.matchNumber}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}

                {matches.length === 0 && (
                    <div className="text-center text-[var(--text-dim)] italic p-8">
                        Tournament not started. No bracket data.
                    </div>
                )}
            </div>
        </div>
    );
};
