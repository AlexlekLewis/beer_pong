/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { TeamCard } from './TeamCard';
import { Button } from './Button';
import { Card } from './Card';
import { WildCardWheel } from './WildCardWheel';
import type { Team } from '../types';

export const BuyBackPhase: React.FC = () => {
    const {
        teams,
        currentRound,
        buyBackTeam,
        getBuyBackCost,
        nextRound,
        forceUpdateTeam
    } = useTournament();

    const [showWheel, setShowWheel] = useState(false);
    const [wheelCandidates, setWheelCandidates] = useState<Team[]>([]);

    const activeTeams = teams.filter(t => t.status === 'active');

    // List of ALL teams relevant to this buyback phase:
    // 1. Teams eliminated in this round (candidates)
    // 2. Teams eliminated in this round BUT already bought back (status='active')
    const buyBackPool = teams.filter(t =>
        t.eliminatedInRound === currentRound
    );

    // Eligible for purchase: Just the eliminated ones
    const eligibleForBuyBack = buyBackPool.filter(t => t.status === 'eliminated');

    const handleContinue = () => {
        // Check even/odd
        const count = activeTeams.length;
        if (count % 2 !== 0) {
            // Odd: Trigger Wild Card
            // Pool: Teams eliminated in this round who did NOT buy back.
            // Wait, elgibleForBuyBack matches this definition exactly.
            if (eligibleForBuyBack.length === 0) {
                // Edge case: Odd number but no one left to fill spot? 
                // E.g. start with 3 teams? 
                // System should proceed with Bye.
                nextRound();
            } else {
                setWheelCandidates(eligibleForBuyBack);
                setShowWheel(true);
            }
        } else {
            // Even: Proceed
            nextRound();
        }
    };

    const handleWildCardComplete = (winner: Team) => {
        // 1. Resurrect winner (Free buyback essentially, logic-wise just active)
        // We use forceUpdateTeam to side-step checks if needed, or buyBackTeam but reset buyBack count if we want?
        // User said: "wild card entry". Let's assume it counts as a buyback stat or separate? 
        // Let's just set them active.

        // Actually context `buyBackTeam` increments `buyBacks`. 
        // Wild card is free? Maybe we shouldn't charge them (increment count).
        // Let's use `forceUpdateTeam` to set active.

        forceUpdateTeam(winner.id, {
            status: 'active',
            eliminatedInRound: null as any
        });

        // 2. Proceed (Close wheel handled by unmount)
        setTimeout(() => {
            nextRound();
        }, 500);
    };

    if (showWheel) {
        return <WildCardWheel candidates={wheelCandidates} onComplete={handleWildCardComplete} />;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center mb-12">
                <h2 className="text-5xl font-black font-orbitron mb-4 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                    BUY BACK PHASE
                </h2>
                <div className="text-xl text-accent font-rajdhani tracking-[0.5em] uppercase">
                    Round {currentRound} Complete
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Buy Back Panel */}
                <Card className="border-success/30 bg-success/5">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-success/20">
                        <h3 className="text-xl font-bold text-success uppercase tracking-widest">
                            Eligible for Buy Back
                        </h3>
                        <div className="text-2xl font-mono text-white bg-success/20 px-3 py-1 rounded">
                            ${getBuyBackCost(currentRound)}
                        </div>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {buyBackPool.length === 0 ? (
                            <div className="text-center py-8 text-success/50 italic">
                                No eligible teams.
                            </div>
                        ) : (
                            buyBackPool.map(t => {
                                const isBoughtBack = t.status === 'active';
                                return (
                                    <div key={t.id} className={`group relative transition-all duration-500 ${isBoughtBack ? 'scale-105' : ''}`}>
                                        <div className={`relative rounded-lg ${isBoughtBack ? 'ring-4 ring-success shadow-[0_0_20px_rgba(0,255,0,0.5)]' : ''}`}>
                                            <TeamCard team={t} />
                                        </div>

                                        {!isBoughtBack ? (
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => buyBackTeam(t.id)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_15px_rgba(0,255,0,0.5)]"
                                            >
                                                BUY IN NOW
                                            </Button>
                                        ) : (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-success text-black font-black uppercase tracking-widest px-3 py-1 rounded shadow animate-pulse">
                                                BOUGHT IN
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="mt-6 text-xs text-center text-success/70 uppercase tracking-wider">
                        Teams not bought back will be eligible for Wild Card Spin if required.
                    </div>
                </Card>

                {/* Status / Confirm Panel */}
                <div className="space-y-6">
                    <Card title="Current Status">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-text-muted">Advancing Teams:</span>
                            <span className="text-2xl font-bold text-white">{activeTeams.length}</span>
                        </div>
                        <div className="text-sm text-text-dim leading-relaxed">
                            {activeTeams.length % 2 === 0 ? (
                                <span className="text-success">
                                    ● ROSTER BALANCED (EVEN). READY FOR NEXT ROUND.
                                </span>
                            ) : (
                                <span className="text-orange-400 animate-pulse">
                                    ● ROSTER UNBALANCED (ODD). WILD CARD REQUIRED.
                                </span>
                            )}
                        </div>
                    </Card>

                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleContinue}
                        className="w-full py-8 text-2xl shadow-[0_0_40px_var(--primary-glow)] hover:scale-[1.02]"
                    >
                        {activeTeams.length % 2 === 0
                            ? `INITIALIZE ROUND ${currentRound + 1} >>`
                            : "SPIN WILD CARD & PROCEED >>"}
                    </Button>

                    <div className="text-center text-xs text-text-dim uppercase tracking-widest">
                        Proceeding will lock these rosters.
                    </div>
                </div>
            </div>
        </div>
    );
};
