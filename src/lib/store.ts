// Party Lions - Tournament Store (Zustand with localStorage persistence)

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Team, Match, Tournament, TournamentSettings, TournamentStatus } from '../types';
import { generateBracket, getMatchesForRound, advanceWinner, isRoundComplete, getRoundLosers } from './bracket';
import { getBuyBackPrice, processBuyBacks } from './buyback';
import { preSelectWildcard } from './wildcard';

// Default settings
const DEFAULT_SETTINGS: TournamentSettings = {
    allowBuyBacks: true,
    enableSoundEffects: true,
    enableConfetti: true,
    wildcardEnabled: true
};

// View types for navigation
export type ViewType = 'home' | 'setup' | 'tournament' | 'wildcard' | 'results' | 'dashboard';

interface TournamentStore {
    // State
    tournament: Tournament | null;
    currentView: ViewType;
    pendingBuyBackTeamId: string | null;
    wildcardResult: { team: Team; index: number } | null;

    // Navigation
    setView: (view: ViewType) => void;

    // Tournament lifecycle
    createTournament: (name: string) => void;
    addTeam: (name: string, player1?: string, player2?: string) => void;
    addTeams: (teams: { name: string; player1?: string; player2?: string }[]) => void;
    updateTeam: (id: string, updates: Partial<Pick<Team, 'name' | 'player1' | 'player2'>>) => void;
    removeTeam: (id: string) => void;
    shuffleTeams: () => void;
    startTournament: () => void;

    // Match flow
    setMatchWinner: (matchId: string, winnerId: string) => void;

    // Buy-back flow
    setPendingBuyBack: (teamId: string | null) => void;
    processBuyBackDecision: (teamId: string, didBuyBack: boolean) => void;
    finalizeBuyBackPhase: () => void;

    // Wildcard flow
    prepareWildcard: () => void;
    confirmWildcard: () => void;

    // Round management
    advanceToNextRound: () => void;

    // Moderator controls
    updateSettings: (settings: Partial<TournamentSettings>) => void;
    overrideMatchWinner: (matchId: string, newWinnerId: string) => void;
    restartMatch: (matchId: string) => void;
    forceAdvanceRound: () => void;

    // Data management
    renameTournament: (name: string) => void;
    exportTournament: () => string;
    importTournament: (json: string) => boolean;
    resetTournament: () => void;

    // Helpers
    getTeamById: (id: string) => Team | undefined;
    getCurrentBuyBackPrice: () => number;
    getWinnersFromCurrentRound: () => string[];
    getEliminatedThisRound: () => Team[];
}

export const useTournamentStore = create<TournamentStore>()(
    persist(
        (set, get) => ({
            tournament: null,
            currentView: 'home',
            pendingBuyBackTeamId: null,
            wildcardResult: null,

            // Navigation
            setView: (view) => set({ currentView: view }),

            // Create new tournament
            createTournament: (name) => {
                const tournament: Tournament = {
                    id: uuidv4(),
                    name,
                    createdAt: new Date().toISOString(),
                    currentRound: 1,
                    totalRounds: 0,
                    status: 'setup',
                    teams: [],
                    matches: [],
                    buyBackBasePrice: 10,
                    buyBackIncrement: 10,
                    settings: { ...DEFAULT_SETTINGS },
                    eliminatedThisRound: [],
                    buyBackDecisions: {}
                };
                set({ tournament, currentView: 'setup' });
            },

            // Add single team
            addTeam: (name, player1, player2) => {
                const { tournament } = get();
                if (!tournament || tournament.status !== 'setup') return;

                const team: Team = {
                    id: uuidv4(),
                    name,
                    player1,
                    player2,
                    status: 'active',
                    buyBackCount: 0,
                    isWildcard: false
                };

                set({
                    tournament: {
                        ...tournament,
                        teams: [...tournament.teams, team]
                    }
                });
            },

            // Add multiple teams (from import)
            addTeams: (teams) => {
                const { tournament } = get();
                if (!tournament || tournament.status !== 'setup') return;

                const newTeams: Team[] = teams.map(t => ({
                    id: uuidv4(),
                    name: t.name,
                    player1: t.player1,
                    player2: t.player2,
                    status: 'active',
                    buyBackCount: 0,
                    isWildcard: false
                }));

                set({
                    tournament: {
                        ...tournament,
                        teams: [...tournament.teams, ...newTeams]
                    }
                });
            },

            // Update team
            updateTeam: (id, updates) => {
                const { tournament } = get();
                if (!tournament) return;

                set({
                    tournament: {
                        ...tournament,
                        teams: tournament.teams.map(t =>
                            t.id === id ? { ...t, ...updates } : t
                        )
                    }
                });
            },

            // Remove team
            removeTeam: (id) => {
                const { tournament } = get();
                if (!tournament || tournament.status !== 'setup') return;

                set({
                    tournament: {
                        ...tournament,
                        teams: tournament.teams.filter(t => t.id !== id)
                    }
                });
            },

            // Shuffle team order
            shuffleTeams: () => {
                const { tournament } = get();
                if (!tournament || tournament.status !== 'setup') return;

                const shuffled = [...tournament.teams];
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }

                set({
                    tournament: { ...tournament, teams: shuffled }
                });
            },

            // Start tournament - generate bracket
            startTournament: () => {
                const { tournament } = get();
                if (!tournament || tournament.teams.length < 2) return;

                const { matches, totalRounds } = generateBracket(tournament.teams, true);

                set({
                    tournament: {
                        ...tournament,
                        matches,
                        totalRounds,
                        currentRound: 1,
                        status: 'in_progress'
                    },
                    currentView: 'tournament'
                });
            },

            // Set match winner
            setMatchWinner: (matchId, winnerId) => {
                const { tournament } = get();
                if (!tournament) return;

                let matches = tournament.matches.map(m => {
                    if (m.id === matchId) {
                        const loserId = m.team1Id === winnerId ? m.team2Id : m.team1Id;
                        return {
                            ...m,
                            winnerId,
                            loserId,
                            status: 'completed' as const
                        };
                    }
                    return m;
                });

                // Advance winner to next match
                const completedMatch = matches.find(m => m.id === matchId)!;
                matches = advanceWinner(matches, completedMatch, winnerId);

                // Track eliminated team
                const loserId = completedMatch.loserId;
                let eliminatedThisRound = [...tournament.eliminatedThisRound];
                let teams = tournament.teams;

                if (loserId) {
                    eliminatedThisRound.push(loserId);
                    teams = teams.map(t =>
                        t.id === loserId
                            ? { ...t, status: 'eliminated' as const, eliminatedInRound: tournament.currentRound }
                            : t
                    );
                }

                // Check if round is complete
                const roundComplete = isRoundComplete(matches, tournament.currentRound);
                let status: TournamentStatus = tournament.status;

                if (roundComplete) {
                    // Check if this was the final
                    if (tournament.currentRound === tournament.totalRounds) {
                        status = 'completed';
                    } else if (tournament.settings.allowBuyBacks && eliminatedThisRound.length > 0) {
                        status = 'buy_back_phase';
                    }
                }

                set({
                    tournament: {
                        ...tournament,
                        matches,
                        teams,
                        status,
                        eliminatedThisRound
                    },
                    pendingBuyBackTeamId: status === 'buy_back_phase' ? eliminatedThisRound[0] || null : null
                });
            },

            // Set pending buy-back team
            setPendingBuyBack: (teamId) => set({ pendingBuyBackTeamId: teamId }),

            // Process buy-back decision
            processBuyBackDecision: (teamId, didBuyBack) => {
                const { tournament } = get();
                if (!tournament) return;

                const buyBackDecisions = {
                    ...tournament.buyBackDecisions,
                    [teamId]: didBuyBack
                };

                // Update team status
                const teams = tournament.teams.map(t => {
                    if (t.id === teamId) {
                        if (didBuyBack) {
                            return {
                                ...t,
                                status: 'bought_back' as const,
                                buyBackCount: t.buyBackCount + 1
                            };
                        }
                        // Already marked as eliminated
                    }
                    return t;
                });

                // Find next team needing buy-back decision
                const pendingTeams = tournament.eliminatedThisRound.filter(
                    id => !(id in buyBackDecisions)
                );
                const nextPendingTeamId = pendingTeams[0] || null;

                set({
                    tournament: {
                        ...tournament,
                        teams,
                        buyBackDecisions
                    },
                    pendingBuyBackTeamId: nextPendingTeamId
                });

                // If all decisions made, finalize
                if (!nextPendingTeamId) {
                    get().finalizeBuyBackPhase();
                }
            },

            // Finalize buy-back phase
            finalizeBuyBackPhase: () => {
                const { tournament } = get();
                if (!tournament) return;

                const winners = get().getWinnersFromCurrentRound();
                const {
                    nextRoundPool,
                    needsWildcard,
                    eligibleForWildcard
                } = processBuyBacks(
                    tournament.teams,
                    winners,
                    tournament.buyBackDecisions,
                    tournament.currentRound
                );

                if (needsWildcard && eligibleForWildcard.length > 0 && tournament.settings.wildcardEnabled) {
                    // Need wildcard - go to wheel
                    set({
                        tournament: { ...tournament, status: 'wildcard_phase' },
                        currentView: 'wildcard'
                    });
                } else {
                    // Advance directly
                    get().advanceToNextRound();
                }
            },

            // Prepare wildcard (pre-select winner for animation)
            prepareWildcard: () => {
                const { tournament } = get();
                if (!tournament) return;

                const eligible = tournament.teams.filter(t =>
                    tournament.eliminatedThisRound.includes(t.id) &&
                    !tournament.buyBackDecisions[t.id]
                );

                const result = preSelectWildcard(eligible);
                set({ wildcardResult: result });
            },

            // Confirm wildcard selection
            confirmWildcard: () => {
                const { tournament, wildcardResult } = get();
                if (!tournament || !wildcardResult) return;

                // Update team status
                const teams = tournament.teams.map(t =>
                    t.id === wildcardResult.team.id
                        ? { ...t, status: 'wildcarded' as const, isWildcard: true }
                        : t
                );

                set({
                    tournament: { ...tournament, teams },
                    wildcardResult: null
                });

                get().advanceToNextRound();
            },

            // Advance to next round
            advanceToNextRound: () => {
                const { tournament } = get();
                if (!tournament) return;

                set({
                    tournament: {
                        ...tournament,
                        currentRound: tournament.currentRound + 1,
                        status: 'in_progress',
                        eliminatedThisRound: [],
                        buyBackDecisions: {}
                    },
                    currentView: 'tournament',
                    pendingBuyBackTeamId: null
                });
            },

            // === MODERATOR CONTROLS ===

            // Update tournament settings
            updateSettings: (settings) => {
                const { tournament } = get();
                if (!tournament) return;

                set({
                    tournament: {
                        ...tournament,
                        settings: { ...tournament.settings, ...settings }
                    }
                });
            },

            // Override a completed match winner (admin function)
            overrideMatchWinner: (matchId, newWinnerId) => {
                const { tournament } = get();
                if (!tournament) return;

                const match = tournament.matches.find(m => m.id === matchId);
                if (!match) return;

                const oldWinnerId = match.winnerId;
                const newLoserId = match.team1Id === newWinnerId ? match.team2Id : match.team1Id;

                // Update the match
                let matches = tournament.matches.map(m => {
                    if (m.id === matchId) {
                        return {
                            ...m,
                            winnerId: newWinnerId,
                            loserId: newLoserId
                        };
                    }
                    return m;
                });

                // Update next round match if the old winner was advanced
                matches = matches.map(m => {
                    if (m.team1Id === oldWinnerId) {
                        return { ...m, team1Id: newWinnerId };
                    }
                    if (m.team2Id === oldWinnerId) {
                        return { ...m, team2Id: newWinnerId };
                    }
                    return m;
                });

                // Update team statuses
                const teams = tournament.teams.map(t => {
                    if (t.id === newWinnerId) {
                        return { ...t, status: 'active' as const };
                    }
                    if (t.id === newLoserId) {
                        return { ...t, status: 'eliminated' as const, eliminatedInRound: match.round };
                    }
                    return t;
                });

                set({
                    tournament: {
                        ...tournament,
                        matches,
                        teams
                    }
                });
            },

            // Restart a completed match (reset to pending)
            restartMatch: (matchId) => {
                const { tournament } = get();
                if (!tournament) return;

                const match = tournament.matches.find(m => m.id === matchId);
                if (!match || match.status !== 'completed') return;

                // Reset the match
                let matches: Match[] = tournament.matches.map(m => {
                    if (m.id === matchId) {
                        return {
                            ...m,
                            winnerId: null,
                            loserId: null,
                            status: 'pending' as const
                        };
                    }
                    return m;
                });

                // Remove winner from next round match
                if (match.winnerId) {
                    matches = matches.map(m => {
                        if (m.team1Id === match.winnerId && m.round > match.round) {
                            return { ...m, team1Id: null };
                        }
                        if (m.team2Id === match.winnerId && m.round > match.round) {
                            return { ...m, team2Id: null };
                        }
                        return m;
                    });
                }

                // Reset team statuses
                const teams = tournament.teams.map(t => {
                    if (t.id === match.loserId) {
                        return { ...t, status: 'active' as const, eliminatedInRound: undefined };
                    }
                    return t;
                });

                // Reset tournament status if needed
                let status = tournament.status;
                if (status === 'completed' || status === 'buy_back_phase') {
                    status = 'in_progress';
                }

                set({
                    tournament: {
                        ...tournament,
                        matches,
                        teams,
                        status
                    }
                });
            },

            // Force advance to next round (skip buy-back/wildcard)
            forceAdvanceRound: () => {
                const { tournament } = get();
                if (!tournament) return;

                // Check if we're in the final round
                if (tournament.currentRound >= tournament.totalRounds) {
                    // Mark tournament as completed
                    set({
                        tournament: {
                            ...tournament,
                            status: 'completed'
                        },
                        currentView: 'results'
                    });
                } else {
                    set({
                        tournament: {
                            ...tournament,
                            currentRound: tournament.currentRound + 1,
                            status: 'in_progress',
                            eliminatedThisRound: [],
                            buyBackDecisions: {}
                        },
                        currentView: 'tournament',
                        pendingBuyBackTeamId: null,
                        wildcardResult: null
                    });
                }
            },

            // Rename tournament
            renameTournament: (name) => {
                const { tournament } = get();
                if (tournament && name.trim()) {
                    set({
                        tournament: { ...tournament, name: name.trim() }
                    });
                }
            },

            // Export tournament as JSON
            exportTournament: () => {
                const { tournament } = get();
                return JSON.stringify(tournament, null, 2);
            },

            // Import tournament from JSON
            importTournament: (json) => {
                try {
                    const data = JSON.parse(json) as Tournament;
                    if (!data.id || !data.teams || !data.matches) {
                        return false;
                    }
                    set({
                        tournament: data,
                        currentView: data.status === 'setup' ? 'setup' : 'tournament'
                    });
                    return true;
                } catch {
                    return false;
                }
            },

            // Reset tournament
            resetTournament: () => {
                set({
                    tournament: null,
                    currentView: 'home',
                    pendingBuyBackTeamId: null,
                    wildcardResult: null
                });
            },

            // Get team by ID
            getTeamById: (id) => {
                const { tournament } = get();
                return tournament?.teams.find(t => t.id === id);
            },

            // Get current buy-back price
            getCurrentBuyBackPrice: () => {
                const { tournament } = get();
                if (!tournament) return 10;
                return getBuyBackPrice(
                    tournament.currentRound,
                    tournament.buyBackBasePrice,
                    tournament.buyBackIncrement
                );
            },

            // Get winners from current round
            getWinnersFromCurrentRound: () => {
                const { tournament } = get();
                if (!tournament) return [];

                const roundMatches = getMatchesForRound(tournament.matches, tournament.currentRound);
                return roundMatches
                    .filter(m => m.status === 'completed' && m.winnerId)
                    .map(m => m.winnerId!);
            },

            // Get teams eliminated this round
            getEliminatedThisRound: () => {
                const { tournament } = get();
                if (!tournament) return [];

                return tournament.teams.filter(t =>
                    tournament.eliminatedThisRound.includes(t.id)
                );
            }
        }),
        {
            name: 'party-lions-storage',
            storage: createJSONStorage(() => localStorage)
        }
    )
);
