// Party Lions - Results Page

import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { useTournamentStore } from '../lib/store';
import { fireWinnerConfetti } from '../components/effects/Confetti';
import { useEffect } from 'react';

export function ResultsPage() {
    const { tournament, getTeamById, setView, resetTournament, exportTournament } = useTournamentStore();

    // Fire confetti on mount
    useEffect(() => {
        fireWinnerConfetti();
    }, []);

    if (!tournament) {
        return null;
    }

    // Get final match and champion
    const finalMatch = tournament.matches.find(
        m => m.round === tournament.totalRounds && m.status === 'completed'
    );
    const champion = finalMatch?.winnerId ? getTeamById(finalMatch.winnerId) : null;
    const runnerUp = finalMatch?.loserId ? getTeamById(finalMatch.loserId) : null;

    // Calculate stats
    const totalMatches = tournament.matches.filter(m => m.status === 'completed' && !m.isByeMatch).length;
    const totalBuyBacks = tournament.teams.filter(t => t.buyBackCount > 0).reduce((sum, t) => sum + t.buyBackCount, 0);
    const wildcardTeams = tournament.teams.filter(t => t.isWildcard);

    const handleShare = () => {
        const text = `🦁 PARTY LIONS CHAMPION 🏆\n\n${champion?.name} wins "${tournament.name}"!\n\n🍺 ${tournament.teams.length} teams competed\n🏓 ${totalMatches} matches played\n💰 ${totalBuyBacks} buy-backs used`;

        if (navigator.share) {
            navigator.share({ text });
        } else {
            navigator.clipboard.writeText(text);
            alert('Results copied to clipboard!');
        }
    };

    const handleExport = () => {
        const data = exportTournament();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tournament.name.replace(/\s+/g, '_')}_results.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen p-4 md:p-8">
            {/* Champion Section */}
            <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <motion.div
                    className="text-8xl mb-4"
                    animate={{
                        rotate: [0, -10, 10, -10, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                >
                    🏆
                </motion.div>

                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wider mb-2">
                    CHAMPION
                </h1>

                <motion.div
                    className="inline-block bg-gradient-to-r from-[var(--gold-main)] via-[var(--amber)] to-[var(--gold-main)] text-black rounded-2xl px-8 py-4 mt-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10, delay: 0.3 }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold">
                        {champion?.name || 'Unknown'}
                    </h2>
                    {champion && (champion.player1 || champion.player2) && (
                        <p className="text-lg mt-1 opacity-80">
                            {[champion.player1, champion.player2].filter(Boolean).join(' & ')}
                        </p>
                    )}
                </motion.div>

                {runnerUp && (
                    <motion.p
                        className="mt-4 text-[var(--text-muted)]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        🥈 Runner-up: <span className="text-white font-medium">{runnerUp.name}</span>
                    </motion.p>
                )}
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <StatCard label="Teams" value={tournament.teams.length} icon="🦁" />
                <StatCard label="Matches" value={totalMatches} icon="🏓" />
                <StatCard label="Rounds" value={tournament.totalRounds} icon="📊" />
                <StatCard label="Buy-backs" value={totalBuyBacks} icon="💰" />
            </motion.div>

            {/* Team Rankings */}
            <motion.div
                className="max-w-2xl mx-auto mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                <h3 className="text-xl font-bold text-white mb-4 text-center tracking-wider">
                    FINAL STANDINGS
                </h3>

                <div className="glass-panel p-4 space-y-2">
                    {/* Champion */}
                    {champion && (
                        <div className="flex items-center gap-4 p-4 bg-[var(--gold-main)]/20 border border-[var(--gold-main)] rounded-xl">
                            <span className="text-3xl">🥇</span>
                            <div className="flex-1">
                                <span className="font-bold text-white text-lg">{champion.name}</span>
                                {champion.isWildcard && <span className="ml-2">🎰</span>}
                            </div>
                            <Badge variant="winner">Champion</Badge>
                        </div>
                    )}

                    {/* Runner-up */}
                    {runnerUp && (
                        <div className="flex items-center gap-4 p-4 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl">
                            <span className="text-3xl">🥈</span>
                            <div className="flex-1">
                                <span className="font-bold text-white">{runnerUp.name}</span>
                                {runnerUp.isWildcard && <span className="ml-2">🎰</span>}
                            </div>
                            <span className="text-[var(--text-muted)] text-sm">Runner-up</span>
                        </div>
                    )}

                    {/* Wildcard teams */}
                    {wildcardTeams.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[var(--border)]">
                            <p className="text-sm text-[var(--text-muted)] mb-2">🎰 Wildcard entries:</p>
                            <div className="flex flex-wrap gap-2">
                                {wildcardTeams.map(team => (
                                    <Badge key={team.id} variant="wildcard">{team.name}</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Actions */}
            <motion.div
                className="flex flex-wrap justify-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
            >
                <Button variant="primary" onClick={handleShare} icon="📤">
                    Share Results
                </Button>
                <Button variant="ghost" onClick={handleExport} icon="💾">
                    Download Results
                </Button>
                <Button variant="ghost" onClick={() => setView('dashboard')} icon="⚙️">
                    Settings
                </Button>
                <Button variant="ghost" onClick={() => setView('home')} icon="🏠">
                    Home
                </Button>
                <Button
                    variant="buyback"
                    onClick={() => {
                        if (confirm('Start a new tournament?')) {
                            resetTournament();
                        }
                    }}
                    icon="🦁"
                >
                    New Tournament
                </Button>
            </motion.div>

            {/* Tournament name footer */}
            <motion.p
                className="text-center mt-12 text-[var(--text-dim)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
                {tournament.name} • Party Lions 🦁
            </motion.p>
        </div>
    );
}

// Stat Card Component
function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
    return (
        <motion.div
            className="glass-panel p-4 text-center"
            whileHover={{ scale: 1.02 }}
        >
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-3xl font-bold text-white">{value}</div>
            <div className="text-sm text-[var(--text-muted)]">{label}</div>
        </motion.div>
    );
}
