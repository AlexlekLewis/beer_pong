import React, { useState, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import { VersusCard } from '../components/VersusCard';
import { BracketView } from './BracketView';
import { TeamCard } from '../components/TeamCard';
import { Card } from '../components/Card';
import { Confetti } from '../components/Confetti';

type SpectatorScreen = 'intro' | 'versus' | 'bracket' | 'leaderboard';

export const SpectatorView: React.FC = () => {
    const { matches, teams, status, currentRound } = useTournament();
    const [screen, setScreen] = useState<SpectatorScreen>('intro');
    const [progress, setProgress] = useState(0);

    const ROTATION_TIME = 10000; // 10s per screen

    // --- LOGIC: Determine what to show ---
    const activeMatches = React.useMemo(() =>
        matches.filter(m => m.round === currentRound && !m.completed && !m.isBye),
        [matches, currentRound]
    );
    const hasActiveMatches = activeMatches.length > 0;

    useEffect(() => {
        const startTime = Date.now();
        const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const pct = Math.min(100, (elapsed / ROTATION_TIME) * 100);
            setProgress(pct);

            if (elapsed >= ROTATION_TIME) {
                // Rotate Screen
                setScreen(prev => {
                    switch (prev) {
                        case 'intro': return hasActiveMatches ? 'versus' : 'bracket';
                        case 'versus': return 'bracket';
                        case 'bracket': return 'leaderboard';
                        case 'leaderboard': return hasActiveMatches ? 'versus' : 'intro';
                        default: return 'intro';
                    }
                });
            }
        }, 100);

        const rotationInterval = setInterval(() => {
            setProgress(0);
        }, ROTATION_TIME);

        return () => {
            clearInterval(timer);
            clearInterval(rotationInterval);
        };
    }, [screen, hasActiveMatches]);

    // State for random match to avoid impure render
    const [randomMatchId, setRandomMatchId] = useState<string | null>(null);

    useEffect(() => {
        if (screen === 'versus' && hasActiveMatches) {
            const match = activeMatches[Math.floor(Math.random() * activeMatches.length)];
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setRandomMatchId(match.id);
        }
    }, [screen, hasActiveMatches, activeMatches]);

    // Render Logic
    const renderScreen = () => {
        switch (screen) {
            case 'intro':
                return (
                    <div className="h-full flex flex-col items-center justify-center animate-ken-burns">
                        <h1 className="text-9xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--secondary)] animate-text-glow">
                            PONG ROYALE
                        </h1>
                        <div className="text-4xl text-white font-rajdhani tracking-[1em] mt-8 uppercase animate-pulse">
                            {status === 'active' ? `Round ${currentRound} In Progress` : 'Tournament Standby'}
                        </div>
                    </div>
                );
            case 'versus': {
                if (!hasActiveMatches) return <div className="text-center text-4xl mt-20">No active matches...</div>;

                const matchIndex = matches.findIndex(m => m.id === randomMatchId);
                const match = matchIndex !== -1 ? matches[matchIndex] : activeMatches[0]; // Fallback

                const t1 = teams.find(t => t.id === match.team1Id);
                const t2 = teams.find(t => t.id === match.team2Id);
                return <VersusCard match={match} team1={t1} team2={t2} />;
            }

            case 'bracket':
                return (
                    <div className="mt-8 px-8">
                        <h2 className="text-5xl font-orbitron font-bold text-[var(--accent)] mb-8 text-center drop-shadow-[0_0_15px_var(--accent)]">TOURNAMENT BRACKET</h2>
                        <Card className="glass-panel-strong p-8 overflow-hidden">
                            <div className="transform scale-110 origin-top">
                                <BracketView />
                            </div>
                        </Card>
                    </div>
                );

            case 'leaderboard':
                return (
                    <div className="mt-8 px-8 max-w-6xl mx-auto">
                        <Confetti active={true} />
                        <h2 className="text-5xl font-orbitron font-bold text-[var(--primary)] mb-8 text-center drop-shadow-[0_0_15px_var(--primary)]">TOP SQUADS</h2>
                        <div className="grid grid-cols-2 gap-6">
                            {teams.slice().sort((a, b) => b.wins - a.wins).slice(0, 8).map((t) => (
                                <div key={t.id} className="transform scale-125 origin-left mb-4">
                                    <TeamCard team={t} />
                                </div>
                            ))}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Background is handled by global body styles, but we can overlay extra fx */}

            {/* Content */}
            <div className="relative z-10 pt-12 pb-20">
                {renderScreen()}
            </div>

            {/* Progress Bar Footer */}
            <div className="fixed bottom-0 left-0 w-full h-2 bg-[var(--bg-dark)]">
                <div
                    className="h-full bg-[var(--primary)] shadow-[0_0_10px_var(--primary)] transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Corner Badge */}
            <div className="fixed bottom-4 right-4 bg-black/50 px-4 py-2 rounded text-[var(--text-dim)] font-mono text-xs">
                TV MODE • {screen.toUpperCase()}
            </div>
        </div>
    );
};
