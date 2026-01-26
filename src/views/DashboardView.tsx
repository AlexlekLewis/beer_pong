import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { MatchDirectorCard } from '../components/MatchDirectorCard';
import { TeamCard } from '../components/TeamCard';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { BracketView } from './BracketView';
import { BuyBackPhase } from '../components/BuyBackPhase';

import { useView } from '../context/ViewContext';

export const DashboardView: React.FC = () => {
    const [resetInput, setResetInput] = useState('');
    const {
        matches,
        teams,
        currentRound,
        status,
        recordMatchResult,
        resetMatch,
        // nextRound, // Handled by BuyBackPhase mostly now, or via initiateBuyBackPhase
        resetTournament,
        buyBackTeam,
        getBuyBackCost,
        initiateBuyBackPhase
    } = useTournament();

    const { currentView } = useView();

    const roundMatches = matches.filter(m => m.round === currentRound);
    const pendingMatches = roundMatches.filter(m => !m.completed);
    const completedMatches = roundMatches.filter(m => m.completed).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
    const isRoundComplete = roundMatches.length > 0 && pendingMatches.length === 0;

    const activeTeams = teams.filter(t => t.status === 'active');
    const eliminatedTeams = teams.filter(t => t.status === 'eliminated');

    return (
        <div className="space-y-8">
            {/* BUY BACK PHASE OVERLAY */}
            {status === 'buy_back_phase' ? (
                <BuyBackPhase />
            ) : (
                <>
                    {/* Status Bar removed as it is now in Sidebar/Header */}

                    {/* BRACKETS */}
                    {currentView === 'bracket' && (
                        <div className="animate-slide-up">
                            <Card title="Tournament Bracket">
                                <BracketView />
                            </Card>
                        </div>
                    )}

                    {/* LIVE MATCHES (Overview) */}
                    {currentView === 'overview' && (
                        <div className="space-y-8 animate-slide-up">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-white font-rajdhani">
                                    LIVE FEED <span className="animate-pulse text-accent">●</span>
                                </h2>
                                {isRoundComplete && status === 'active' && (
                                    <Button variant="success" onClick={initiateBuyBackPhase} className="animate-pulse shadow-[0_0_20px_rgba(0,255,0,0.4)]">
                                        ROUND COMPLETE - PROCEED TO BUY BACKS &rarr;
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                {pendingMatches.map(match => (
                                    <MatchDirectorCard
                                        key={match.id}
                                        match={match}
                                        teams={teams}
                                        onRecordResult={recordMatchResult}
                                        onReset={resetMatch}
                                    />
                                ))}
                            </div>

                            {pendingMatches.length === 0 && (
                                <div className="text-center py-12 border border-dashed border-white/10 rounded text-text-muted">
                                    ALL MATCHES IN SEQUENCE COMPLETED
                                </div>
                            )}

                            {completedMatches.length > 0 && (
                                <div className="mt-12">
                                    <h3 className="text-xl font-bold text-text-muted mb-6 uppercase tracking-widest">
                                        Completed Log
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-80">
                                        {completedMatches.map(match => (
                                            <div key={match.id} className="relative group">
                                                {match.completedAt && (
                                                    <div className="absolute -top-3 left-4 bg-bg-dark border border-white/10 px-2 py-1 text-[10px] uppercase tracking-widest text-text-dim rounded shadow z-10">
                                                        {new Date(match.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                )}
                                                <MatchDirectorCard
                                                    match={match}
                                                    teams={teams}
                                                    onRecordResult={recordMatchResult}
                                                    onReset={resetMatch}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STANDINGS (Teams) */}
                    {currentView === 'teams' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up">
                            <Card title="Active Protocols">
                                <div className="space-y-2">
                                    {activeTeams.map(t => (
                                        <TeamCard key={t.id} team={t} />
                                    ))}
                                </div>
                            </Card>

                            <Card title="Restricted Access / Buyback">
                                <div className="space-y-6">
                                    {eliminatedTeams.length === 0 && <div className="text-center text-text-dim">No Eliminated Teams</div>}

                                    {/* Eligible for Buyback */}
                                    <div>
                                        <h4 className="text-success text-sm uppercase font-bold tracking-widest mb-3 border-b border-white/10 pb-2">Buyback Window Open</h4>
                                        <div className="space-y-4">
                                            {eliminatedTeams.filter(t => t.eliminatedInRound === currentRound).map(t => (
                                                <div key={t.id} className="flex flex-col gap-2 p-4 border border-success/30 bg-success/5 rounded">
                                                    <TeamCard team={t} />
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (confirm(`Buy back ${t.name} for $${getBuyBackCost(currentRound)}?`)) {
                                                                buyBackTeam(t.id);
                                                            }
                                                        }}
                                                        className="w-full font-bold"
                                                    >
                                                        BUY BACK (${getBuyBackCost(currentRound)})
                                                    </Button>
                                                    <div className="text-xs text-center text-success/70 uppercase tracking-wider">
                                                        Must buy back BEFORE Round {currentRound + 1}
                                                    </div>
                                                </div>
                                            ))}
                                            {eliminatedTeams.filter(t => t.eliminatedInRound === currentRound).length === 0 && (
                                                <div className="text-xs text-text-dim italic">No eligible teams for this round.</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Permanently Eliminated */}
                                    <div>
                                        <h4 className="text-danger text-sm uppercase font-bold tracking-widest mb-3 border-b border-white/10 pb-2">Permanently Eliminated</h4>
                                        <div className="space-y-4">
                                            {eliminatedTeams.filter(t => t.eliminatedInRound !== currentRound).map(t => (
                                                <div key={t.id} className="flex flex-col gap-2 p-4 border border-white/5 rounded bg-bg-dark opacity-50 grayscale">
                                                    <TeamCard team={t} />
                                                    <div className="text-center text-xs text-danger font-bold uppercase tracking-widest">
                                                        ELIMINATED IN ROUND {t.eliminatedInRound || '?'}
                                                    </div>
                                                </div>
                                            ))}
                                            {eliminatedTeams.filter(t => t.eliminatedInRound !== currentRound).length === 0 && (
                                                <div className="text-xs text-text-dim italic">No permanently eliminated teams yet.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* ADMIN (Settings) */}
                    {currentView === 'settings' && (
                        <div className="max-w-xl mx-auto animate-slide-up">
                            <Card title="System Override">
                                <div className="space-y-6">
                                    <div className="p-4 bg-danger/10 border border-danger/30 rounded text-center">
                                        <h4 className="text-danger font-bold text-lg mb-2">⚠ DANGER ZONE</h4>
                                        <p className="text-text-muted text-sm mb-4">
                                            This action will <strong className="text-white">permanently delete</strong> all tournament data, including teams, matches, and history. This cannot be undone.
                                        </p>

                                        <div className="max-w-xs mx-auto">
                                            <label className="block text-xs uppercase tracking-widest text-text-dim mb-2">
                                                Type "RESET" to confirm
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Type 'reset'"
                                                value={resetInput}
                                                className="w-full bg-black/50 border border-white/10 rounded px-4 py-2 text-center font-mono text-white focus:border-danger focus:ring-1 focus:ring-danger outline-none transition-all uppercase"
                                                onChange={(e) => setResetInput(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        id="btn-factory-reset"
                                        variant="danger"
                                        className="w-full opacity-50 relative overflow-hidden"
                                        disabled={resetInput.toLowerCase() !== 'reset'}
                                        style={{ opacity: resetInput.toLowerCase() === 'reset' ? 1 : 0.5 }}
                                        onClick={() => {
                                            resetTournament();
                                            setResetInput('');
                                        }}
                                    >
                                        <span className="relative z-10">FACTORY RESET SYSTEM</span>
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
