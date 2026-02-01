import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTournamentStore } from '../lib/store';
import { Bracket } from '../components/bracket/Bracket';
import { MatchNode } from '../components/bracket/Bracket';
import type { Team } from '../types';

export function TVModeView() {
    const { tournament, setView } = useTournamentStore();
    const [mode, setMode] = useState<'bracket' | 'spotlight'>('bracket');

    // Auto-rotation timer
    useEffect(() => {
        const interval = setInterval(() => {
            setMode(prev => prev === 'bracket' ? 'spotlight' : 'bracket');
        }, 15000); // 15 seconds per view

        // Exit on Escape
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setView('tournament');
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            clearInterval(interval);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [setView]);

    if (!tournament) return null;

    // Get active matches for spotlight
    const activeMatches = tournament.matches.filter(
        m => m.round === tournament.currentRound && m.status === 'pending' && (m.team1Id || m.team2Id)
    ).slice(0, 2); // Show up to 2 active matches

    // Team helper
    const getTeam = (id: string | null) => id ? tournament.teams.find(t => t.id === id) : undefined;

    return (
        <div className="fixed inset-0 z-50 bg-[var(--bg-dark)] overflow-hidden flex flex-col">
            {/* Ambient Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--purple-main)] rounded-full blur-[100px] animate-pulse-glow" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--gold-main)] rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-4">
                    <span className="text-4xl">🦁</span>
                    <div>
                        <h1 className="text-2xl font-bold tracking-widest text-white uppercase">{tournament.name}</h1>
                        <p className="text-[var(--gold-main)] font-bold tracking-wider">LIVE TOURNAMENT FEED</p>
                    </div>
                </div>
                {/* Hidden/Subtle Exit Hint */}
                {/* Exit Button - Always visible but subtle */}
                <div>
                    <button
                        onClick={() => setView('tournament')}
                        className="text-white/50 text-sm border border-white/20 px-3 py-1 rounded-full hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
                    >
                        <span className="text-xs">✕</span> Exit TV Mode (ESC)
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative p-8 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {mode === 'bracket' ? (
                        <motion.div
                            key="bracket"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.8 }}
                            className="w-full h-full flex items-center justify-center overflow-auto"
                        >
                            <div className="scale-110 origin-center">
                                <Bracket readonly />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="spotlight"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.8 }}
                            className="w-full max-w-5xl grid grid-cols-1 gap-8"
                        >
                            <div className="text-center mb-4">
                                <h2 className="text-4xl font-black text-white tracking-widest uppercase mb-2">Current Matchups</h2>
                                <p className="text-[var(--text-muted)] text-xl">Round {tournament.currentRound}</p>
                            </div>

                            {activeMatches.length === 0 ? (
                                <div className="text-center p-12 glass-panel">
                                    <h3 className="text-3xl text-white font-bold mb-4">Prepare for the next round!</h3>
                                    <p className="text-xl text-[var(--gold-main)] animate-pulse">Matches starting soon...</p>
                                </div>
                            ) : (
                                <div className={`grid ${activeMatches.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-8`}>
                                    {activeMatches.map(match => (
                                        <div key={match.id} className="glass-panel-strong p-8 transform scale-110">
                                            <div className="flex flex-col gap-6">
                                                <SpotlightTeam team={getTeam(match.team1Id)} />
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-1 h-0.5 bg-[var(--gold-main)]/50" />
                                                    <span className="text-2xl font-black text-[var(--gold-main)] bg-black/50 px-4 py-2 rounded-lg border border-[var(--gold-main)]/50">VS</span>
                                                    <div className="flex-1 h-0.5 bg-[var(--gold-main)]/50" />
                                                </div>
                                                <SpotlightTeam team={getTeam(match.team2Id)} align="right" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer / Ticker */}
            <div className="h-12 bg-black/80 backdrop-blur border-t border-white/10 flex items-center overflow-hidden">
                <div className="animate-marquee whitespace-nowrap pl-[100%] text-[var(--text-muted)] font-mono text-sm tracking-widest flex gap-8">
                    <span>🏆 TOURNAMENT PROGRESS: ROUND {tournament.currentRound}</span>
                    <span>•</span>
                    <span>TEAMS REMAINING: {tournament.teams.filter(t => t.status !== 'eliminated').length}</span>
                    <span>•</span>
                    <span>NEXT UPDATE IN 15S</span>
                    <span>•</span>
                    <span>PARTY LIONS v3.0</span>
                </div>
            </div>
        </div>
    );
}

function SpotlightTeam({ team, align = 'left' }: { team: Team | undefined, align?: 'left' | 'right' }) {
    if (!team) return <div className="text-3xl text-white/30 font-bold italic">TBD</div>;

    return (
        <div className={`flex flex-col ${align === 'right' ? 'items-end text-right' : 'items-start text-left'}`}>
            <h3 className="text-4xl md:text-5xl font-black text-white mb-2 leading-tight">
                {team.name}
            </h3>
            <div className="flex items-center gap-3">
                {team.player1 && <span className="text-xl text-[var(--text-muted)]">👤 {team.player1}</span>}
                {team.player2 && <span className="text-xl text-[var(--text-muted)]">👤 {team.player2}</span>}
            </div>
            {team.isWildcard && (
                <span className="mt-2 inline-block bg-[var(--gold-main)] text-black text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    Wildcard Team
                </span>
            )}
        </div>
    );
}
