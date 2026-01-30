// Party Lions - Wildcard Page

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LotteryWheel } from '../components/wildcard/LotteryWheel';
import { useTournamentStore } from '../lib/store';
import { fireWinnerConfetti } from '../components/effects/Confetti';

export function WildcardPage() {
    const {
        tournament,
        prepareWildcard,
        wildcardResult,
        confirmWildcard,
        setView
    } = useTournamentStore();

    // Prepare wildcard selection on mount
    useEffect(() => {
        if (tournament && !wildcardResult) {
            prepareWildcard();
        }
    }, [tournament, wildcardResult, prepareWildcard]);

    if (!tournament) {
        return null;
    }

    // Get eligible teams (eliminated this round, didn't buy back)
    const eligibleTeams = tournament.teams.filter(t =>
        tournament.eliminatedThisRound.includes(t.id) &&
        !tournament.buyBackDecisions[t.id]
    );

    const handleComplete = () => {
        fireWinnerConfetti();
        confirmWildcard();
    };

    // If no eligible teams, skip
    if (eligibleTeams.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="text-6xl mb-4">🤔</div>
                    <h2 className="text-2xl font-bold text-white mb-4">
                        No Eligible Teams
                    </h2>
                    <p className="text-[var(--text-muted)] mb-6">
                        No teams are eligible for the wildcard lottery
                    </p>
                    <button
                        onClick={() => setView('tournament')}
                        className="btn btn-primary"
                    >
                        Back to Tournament
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
            <motion.div
                className="glass-panel-strong p-8 max-w-lg w-full"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <LotteryWheel
                    teams={eligibleTeams}
                    selectedIndex={wildcardResult?.index ?? 0}
                    onSpinComplete={handleComplete}
                />
            </motion.div>
        </div>
    );
}
