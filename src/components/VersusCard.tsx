import React from 'react';
import type { Match, Team } from '../types';
import { Card } from './Card';

interface VersusCardProps {
    match: Match;
    team1: Team | undefined;
    team2: Team | undefined;
}

export const VersusCard: React.FC<VersusCardProps> = ({ match, team1, team2 }) => {
    return (
        <div className="relative animate-slide-up w-full max-w-4xl mx-auto mt-8">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--secondary)] via-[var(--primary)] to-[var(--accent)] opacity-20 blur-3xl animate-pulse-fast rounded-full" />

            <Card className="glass-panel-strong border-2 border-[var(--primary)] shadow-[0_0_50px_var(--primary-glow)]">
                <div className="flex flex-col md:flex-row items-center justify-between p-8 md:p-16 gap-8">

                    {/* Team 1 */}
                    <div className="flex-1 text-center animate-game-slide-in-left">
                        <div className="text-4xl md:text-6xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-[0_0_10px_var(--primary)] truncate max-w-full">
                            {team1?.name || "TBD"}
                        </div>
                        <div className="text-xl md:text-2xl font-bold text-[var(--primary)] mt-4 font-orbitron tracking-[0.5em] uppercase opacity-80">
                            {team1?.wins || 0} Wins
                        </div>
                    </div>

                    {/* VS Badge */}
                    <div className="relative z-10 flex-shrink-0 animate-bounce">
                        <div className="text-6xl md:text-8xl font-black font-orbitron italic text-[var(--warning)] drop-shadow-[0_0_20px_var(--warning)] transform -skew-x-12">
                            VS
                        </div>
                        {match.completed && (
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[var(--bg-dark)] border border-[var(--accent)] px-3 py-1 rounded text-xs text-[var(--accent)] uppercase tracking-widest">
                                Final Score: {match.score1} - {match.score2}
                            </div>
                        )}
                    </div>

                    {/* Team 2 */}
                    <div className="flex-1 text-center animate-game-slide-in-right">
                        <div className="text-4xl md:text-6xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-[0_0_10px_var(--secondary)] truncate max-w-full">
                            {team2?.name || "TBD"}
                        </div>
                        <div className="text-xl md:text-2xl font-bold text-[var(--secondary)] mt-4 font-orbitron tracking-[0.5em] uppercase opacity-80">
                            {team2?.wins || 0} Wins
                        </div>
                    </div>

                </div>

                {/* Round Indicator */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2">
                    <div className="px-6 py-1 bg-[var(--bg-dark)] border border-[var(--border)] rounded-full text-[var(--text-dim)] uppercase tracking-[0.3em] text-xs font-bold">
                        Round {match.round} • Match #{match.matchNumber}
                    </div>
                </div>
            </Card>
        </div>
    );
};
