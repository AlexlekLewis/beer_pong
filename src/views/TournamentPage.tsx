// Party Lions - Tournament Page (Main Bracket View)

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Bracket } from '../components/bracket/Bracket';
import { BuyBackModal, PriceDisplay } from '../components/buyback/BuyBackModal';
import { useTournamentStore } from '../lib/store';
import { fireCelebration, fireWinnerConfetti } from '../components/effects/Confetti';

export function TournamentPage() {
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportData, setExportData] = useState('');

    const {
        tournament,
        setMatchWinner,
        setView,
        exportTournament,
        resetTournament,
        pendingBuyBackTeamId,
        getTeamById
    } = useTournamentStore();

    if (!tournament) {
        return null;
    }

    const handleSelectWinner = (matchId: string, winnerId: string) => {
        // Fire celebration
        fireCelebration();

        // Update match
        setMatchWinner(matchId, winnerId);

        // Check if tournament is complete
        if (tournament.currentRound === tournament.totalRounds) {
            fireWinnerConfetti();
        }
    };

    const handleExport = () => {
        const data = exportTournament();
        setExportData(data);
        setShowExportModal(true);
    };

    const handleCopyExport = () => {
        navigator.clipboard.writeText(exportData);
    };

    const isComplete = tournament.status === 'completed';
    const isBuyBackPhase = tournament.status === 'buy_back_phase';
    const isWildcardPhase = tournament.status === 'wildcard_phase';

    // Get champion if tournament complete
    const finalMatch = tournament.matches.find(
        m => m.round === tournament.totalRounds && m.status === 'completed'
    );
    const champion = finalMatch?.winnerId ? getTeamById(finalMatch.winnerId) : null;

    return (
        <div className="min-h-screen p-4 md:p-8 bg-lions-showdown bg-fixed has-bg-image">
            {/* Header */}
            <motion.div
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-4">
                    <span className="text-4xl">🦁</span>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wider">
                            {tournament.name}
                        </h1>
                        <p className="text-[var(--text-muted)]">
                            Round {tournament.currentRound} of {tournament.totalRounds}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Buy-back price indicator */}
                    {tournament.settings.allowBuyBacks && !isComplete && (
                        <PriceDisplay
                            round={tournament.currentRound}
                            basePrice={tournament.buyBackBasePrice}
                            increment={tournament.buyBackIncrement}
                        />
                    )}

                    <Button variant="ghost" size="sm" onClick={() => setView('dashboard')} icon="⚙️">
                        Settings
                    </Button>

                    <Button variant="ghost" size="sm" onClick={handleExport} icon="💾">
                        Export
                    </Button>
                </div>
            </motion.div>

            {/* Champion Banner (if complete) */}
            {isComplete && champion && (
                <motion.div
                    className="bg-gradient-to-r from-[var(--gold-main)] via-[var(--amber)] to-[var(--gold-main)] text-black rounded-2xl p-8 mb-8 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', damping: 10 }}
                >
                    <motion.div
                        className="text-6xl mb-4"
                        animate={{
                            rotate: [0, -10, 10, -10, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    >
                        🏆
                    </motion.div>
                    <h2 className="text-4xl font-bold tracking-wider mb-2">
                        CHAMPION!
                    </h2>
                    <p className="text-3xl font-bold">
                        {champion.name}
                    </p>
                    {(champion.player1 || champion.player2) && (
                        <p className="text-lg mt-2 opacity-80">
                            {[champion.player1, champion.player2].filter(Boolean).join(' & ')}
                        </p>
                    )}
                </motion.div>
            )}

            {/* Status Banner */}
            {isBuyBackPhase && (
                <motion.div
                    className="bg-[var(--purple-main)]/20 border border-[var(--purple-main)] rounded-xl p-4 mb-6 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <p className="text-lg font-bold text-[var(--purple-main)]">
                        💰 BUY-BACK PHASE
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">
                        Eliminated teams can buy back into the next round
                    </p>
                </motion.div>
            )}

            {isWildcardPhase && (
                <motion.div
                    className="bg-[var(--gold-main)]/20 border border-[var(--gold-main)] rounded-xl p-4 mb-6 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <p className="text-lg font-bold text-[var(--gold-main)]">
                        🎰 WILDCARD NEEDED
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">
                        Odd number of teams! We need one more for the next round
                    </p>
                    <Button
                        variant="primary"
                        className="mt-3"
                        onClick={() => setView('wildcard')}
                        icon="🎰"
                    >
                        SPIN THE WHEEL
                    </Button>
                </motion.div>
            )}

            {/* Bracket */}
            <motion.div
                className="glass-panel p-4 md:p-6 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Bracket onSelectWinner={handleSelectWinner} />
            </motion.div>

            {/* Footer Actions */}
            <motion.div
                className="mt-8 flex flex-wrap justify-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                {isComplete && (
                    <>
                        <Button variant="primary" onClick={() => setView('results')} icon="🏆">
                            VIEW RESULTS
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                if (confirm('Start a new tournament?')) {
                                    resetTournament();
                                }
                            }}
                        >
                            New Tournament
                        </Button>
                    </>
                )}
            </motion.div>

            {/* Buy-Back Modal */}
            <BuyBackModal isOpen={isBuyBackPhase && !!pendingBuyBackTeamId} />

            {/* Export Modal */}
            <Modal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                title="💾 EXPORT TOURNAMENT"
                size="md"
            >
                <div className="space-y-4">
                    <p className="text-sm text-[var(--text-muted)]">
                        Copy this data to save your tournament progress. You can import it later to continue.
                    </p>
                    <textarea
                        className="input min-h-[200px] font-mono text-xs"
                        value={exportData}
                        readOnly
                    />
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={() => setShowExportModal(false)} className="flex-1">
                            Close
                        </Button>
                        <Button variant="primary" onClick={handleCopyExport} className="flex-1" icon="📋">
                            Copy to Clipboard
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
