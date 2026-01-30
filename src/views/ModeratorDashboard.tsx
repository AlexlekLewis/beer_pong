// Party Lions - Moderator Dashboard

import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { useTournamentStore } from '../lib/store';
import { SettingsPanel } from '../components/dashboard/SettingsPanel';
import { BracketControls } from '../components/dashboard/BracketControls';

export function ModeratorDashboard() {
    const { tournament, setView, resetTournament, exportTournament } = useTournamentStore();

    if (!tournament) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-[var(--text-muted)] mb-4">No active tournament</p>
                    <Button variant="primary" onClick={() => setView('home')}>
                        Go Home
                    </Button>
                </div>
            </div>
        );
    }

    const handleExport = () => {
        const data = exportTournament();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tournament.name.replace(/\s+/g, '_')}_backup.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleReset = () => {
        if (confirm('⚠️ Are you sure you want to reset? This will delete all tournament data!')) {
            if (confirm('This action cannot be undone. Type "RESET" to confirm...')) {
                resetTournament();
            }
        }
    };

    const getBackView = () => {
        if (tournament.status === 'setup') return 'setup';
        if (tournament.status === 'completed') return 'results';
        return 'tournament';
    };

    return (
        <div className="min-h-screen p-4 md:p-8">
            {/* Header */}
            <motion.div
                className="flex items-center justify-between mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setView(getBackView())}
                        className="text-2xl hover:scale-110 transition-transform"
                    >
                        ←
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wider">
                            ⚙️ MODERATOR DASHBOARD
                        </h1>
                        <p className="text-[var(--text-muted)]">{tournament.name}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setView('home')} icon="🏠">
                        Home
                    </Button>
                </div>
            </motion.div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
                {/* Settings Panel */}
                <SettingsPanel />

                {/* Bracket Controls */}
                <BracketControls />

                {/* Team Management Quick Stats */}
                <motion.div
                    className="glass-panel p-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span>🦁</span> Team Overview
                    </h3>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <StatBox label="Total Teams" value={tournament.teams.length} icon="👥" />
                        <StatBox
                            label="Active"
                            value={tournament.teams.filter(t => t.status === 'active' || t.status === 'bought_back' || t.status === 'wildcarded').length}
                            icon="✅"
                        />
                        <StatBox
                            label="Eliminated"
                            value={tournament.teams.filter(t => t.status === 'eliminated').length}
                            icon="❌"
                        />
                        <StatBox
                            label="Bought Back"
                            value={tournament.teams.filter(t => t.buyBackCount > 0).length}
                            icon="💰"
                        />
                    </div>

                    {/* Quick Team List */}
                    <div className="max-h-[200px] overflow-y-auto space-y-2">
                        {tournament.teams.map(team => (
                            <div
                                key={team.id}
                                className={`flex items-center justify-between p-2 rounded-lg ${team.status === 'eliminated'
                                        ? 'bg-red-500/10 border border-red-500/20'
                                        : 'bg-[var(--bg-elevated)]'
                                    }`}
                            >
                                <span className={`text-sm ${team.status === 'eliminated' ? 'text-red-400 line-through' : 'text-white'
                                    }`}>
                                    {team.name}
                                </span>
                                <div className="flex items-center gap-2">
                                    {team.isWildcard && <span className="text-xs">🎰</span>}
                                    {team.buyBackCount > 0 && (
                                        <span className="text-xs text-[var(--gold-main)]">
                                            💰×{team.buyBackCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Data Management */}
                <motion.div
                    className="glass-panel p-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span>💾</span> Data Management
                    </h3>

                    <div className="space-y-4">
                        <Button
                            variant="ghost"
                            fullWidth
                            onClick={handleExport}
                            icon="📥"
                        >
                            Export Tournament Backup
                        </Button>

                        <div className="border-t border-[var(--border)] pt-4 mt-4">
                            <p className="text-sm text-[var(--text-muted)] mb-3">
                                ⚠️ Danger Zone
                            </p>
                            <Button
                                variant="danger"
                                fullWidth
                                onClick={handleReset}
                                icon="🗑️"
                            >
                                Reset Tournament
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Quick Navigation */}
            <motion.div
                className="flex flex-wrap justify-center gap-4 mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                <Button
                    variant={tournament.status === 'setup' ? 'primary' : 'ghost'}
                    onClick={() => setView('setup')}
                    icon="📝"
                    disabled={tournament.status !== 'setup'}
                >
                    Team Setup
                </Button>
                <Button
                    variant={tournament.status === 'in_progress' ? 'primary' : 'ghost'}
                    onClick={() => setView('tournament')}
                    icon="🏓"
                    disabled={tournament.status === 'setup'}
                >
                    View Bracket
                </Button>
                <Button
                    variant={tournament.status === 'completed' ? 'primary' : 'ghost'}
                    onClick={() => setView('results')}
                    icon="🏆"
                    disabled={tournament.status !== 'completed'}
                >
                    View Results
                </Button>
            </motion.div>
        </div>
    );
}

// Stat Box Component
function StatBox({ label, value, icon }: { label: string; value: number; icon: string }) {
    return (
        <div className="bg-[var(--bg-elevated)] rounded-lg p-4 text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-[var(--text-muted)]">{label}</div>
        </div>
    );
}
