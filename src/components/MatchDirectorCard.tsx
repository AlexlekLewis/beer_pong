import React, { useState } from 'react';
import type { Match, Team } from '../types';
import { Card } from './Card';
import { Button } from './Button';


interface MatchDirectorCardProps {
    match: Match;
    teams: Team[];
    onRecordResult: (matchId: string, score1: number, score2: number, winnerId: string) => void;
    onReset: (matchId: string) => void;
}

export const MatchDirectorCard: React.FC<MatchDirectorCardProps> = ({ match, teams, onRecordResult, onReset }) => {
    const team1 = teams.find(t => t.id === match.team1Id);
    const team2 = teams.find(t => t.id === match.team2Id);

    // Two-step verification state
    const [proposedWinnerId, setProposedWinnerId] = useState<string | null>(null);

    if (!team1 || (!team2 && !match.isBye)) return null;

    const handleSelectWinner = (id: string) => {
        if (match.completed) return;
        setProposedWinnerId(id === proposedWinnerId ? null : id); // Toggle
    };

    const confirmWin = () => {
        if (!proposedWinnerId) return;
        const score1 = proposedWinnerId === team1.id ? 1 : 0;
        const score2 = proposedWinnerId === team2?.id ? 1 : 0;
        onRecordResult(match.id, score1, score2, proposedWinnerId);
        setProposedWinnerId(null);
    };

    const isWinner1 = match.completed && match.winnerId === team1.id;
    const isWinner2 = match.completed && match.winnerId === team2?.id;

    const isProposed1 = proposedWinnerId === team1.id;
    const isProposed2 = proposedWinnerId === team2?.id;

    if (match.isBye) {
        return (
            <Card className="border-dashed border-white/10 opacity-70">
                <div className="text-center">
                    <h4 className="text-accent font-bold mb-2">BYE ROUND</h4>
                    <div className="text-2xl font-bold">{team1.name}</div>
                    <p className="text-sm text-text-dim">Advances automatically</p>
                </div>
            </Card>
        );
    }

    return (
        <Card
            title={`Match #${match.matchNumber}`}
            neonColor={match.completed ? 'var(--primary)' : 'var(--warning)'}
            className={`transition-all duration-300 ${match.completed ? 'opacity-80 hover:opacity-100' : 'ring-1 ring-warning/50'}`}
        >
            <div className="flex flex-col gap-6">
                {/* Teams Row */}
                <div className="flex justify-between items-center gap-4">

                    {/* Team 1 */}
                    <div
                        className={`
                            flex-1 text-center p-4 rounded-lg transition-all duration-300 relative overflow-hidden cursor-pointer
                            ${isWinner1 ? 'bg-primary/20 border border-primary shadow-[0_0_30px_rgba(99,102,241,0.3)]' : ''}
                            ${isProposed1 ? 'bg-primary/10 border border-primary scale-105' : 'bg-bg-dark border border-white/5'}
                            ${(match.completed && !isWinner1) || (proposedWinnerId && !isProposed1) ? 'opacity-30 grayscale' : ''}
                        `}
                        onClick={() => handleSelectWinner(team1.id)}
                    >
                        {isWinner1 && <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent animate-pulse" />}
                        <div className="text-xl font-bold mb-4 truncate relative z-10">{team1.name}</div>

                        {!match.completed && (
                            <div className="text-xs uppercase font-bold tracking-widest text-text-dim">
                                {isProposed1 ? 'Selected' : 'Click to Select'}
                            </div>
                        )}
                        {isWinner1 && <div className="text-success font-black tracking-widest text-lg animate-bounce">VICTORY</div>}
                    </div>

                    <div className="text-text-muted font-bold text-xl italic opacity-50">VS</div>

                    {/* Team 2 */}
                    <div
                        className={`
                            flex-1 text-center p-4 rounded-lg transition-all duration-300 relative overflow-hidden cursor-pointer
                            ${isWinner2 ? 'bg-primary/20 border border-primary shadow-[0_0_30px_rgba(99,102,241,0.3)]' : ''}
                            ${isProposed2 ? 'bg-primary/10 border border-primary scale-105' : 'bg-bg-dark border border-white/5'}
                            ${(match.completed && !isWinner2) || (proposedWinnerId && !isProposed2) ? 'opacity-30 grayscale' : ''}
                        `}
                        onClick={() => handleSelectWinner(team2!.id)}
                    >
                        {isWinner2 && <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent animate-pulse" />}
                        <div className="text-xl font-bold mb-4 truncate relative z-10">{team2?.name}</div>

                        {!match.completed && (
                            <div className="text-xs uppercase font-bold tracking-widest text-text-dim">
                                {isProposed2 ? 'Selected' : 'Click to Select'}
                            </div>
                        )}
                        {isWinner2 && <div className="text-success font-black tracking-widest text-lg animate-bounce">VICTORY</div>}
                    </div>
                </div>

                {/* Actions */}
                {!match.completed && proposedWinnerId && (
                    <div className="animate-slide-up">
                        <Button onClick={confirmWin} className="w-full" variant="success">
                            CONFIRM VICTORY for {proposedWinnerId === team1.id ? team1.name : team2?.name}
                        </Button>
                        <div className="text-center mt-2">
                            <button onClick={() => setProposedWinnerId(null)} className="text-xs text-text-dim hover:text-white underline">Cancel</button>
                        </div>
                    </div>
                )}

                {match.completed && (
                    <div className="flex justify-center -mt-2">
                        <Button onClick={() => onReset(match.id)} variant="danger" size="sm" className="opacity-50 hover:opacity-100">
                            Reset Match
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
};
