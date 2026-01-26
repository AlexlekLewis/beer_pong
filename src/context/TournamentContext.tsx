/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Team, Match, TournamentState, TournamentContextType } from '../types';
import { supabase } from '../lib/supabase';

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export const TournamentProvider = ({ children }: { children: ReactNode }) => {
    // --- State ---
    const [teams, setTeams] = useState<Team[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [currentRound, setCurrentRound] = useState(1);
    const [status, setStatus] = useState<TournamentState['status']>('setup');
    const [winnerId, setWinnerId] = useState<string | null>(null);

    // --- Data Mapper Helper ---
    // (Optional: You might want a better mapper)
    // The select queries return snake_case. 
    // We map them to camelCase in the useEffect above manually or cast types?
    // Actually, in the useEffect `setTeams(teamsData as any[])` casts it but doesn't transform keys.
    // The frontend expects camelCase (buyBacks, eliminatedInRound).
    // Supabase returns snake_case (buy_backs, eliminated_in_round).
    // We need to map the data receiving from Supabase.

    // Let's refine the useEffect to map keys.
    const mapTeam = (data: any): Team => ({
        id: data.id,
        name: data.name,
        status: data.status,
        wins: data.wins,
        losses: data.losses,
        buyBacks: data.buy_backs,
        seed: data.seed,
        eliminatedInRound: data.eliminated_in_round
    });

    const mapMatch = (data: any): Match => ({
        id: data.id,
        round: data.round,
        matchNumber: data.match_number,
        team1Id: data.team1_id,
        team2Id: data.team2_id,
        score1: data.score1,
        score2: data.score2,
        winnerId: data.winner_id,
        completed: data.completed,
        completedAt: data.completed_at ? new Date(data.completed_at).getTime() : undefined,
        isBye: data.is_bye,
        nextMatchId: data.next_match_id
    });

    // --- Persistence (Supabase Realtime) ---
    useEffect(() => {
        // Initial Fetch
        const fetchInitialData = async () => {
            const { data: teamsData } = await supabase.from('teams').select('*').order('seed', { ascending: true });
            if (teamsData) setTeams(teamsData.map(mapTeam));

            const { data: matchesData } = await supabase.from('matches').select('*').order('id', { ascending: true });
            if (matchesData) setMatches(matchesData.map(mapMatch));

            const { data: stateData } = await supabase.from('tournament_state').select('*').eq('id', 1).single();

            if (stateData) {
                setCurrentRound(stateData.current_round || 1);
                setStatus(stateData.status as any || 'setup');
                setWinnerId(stateData.winner_id || null);
            }
        };

        fetchInitialData();

        // Realtime Subscriptions
        const channel = supabase.channel('tournament_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setTeams(prev => [...prev, mapTeam(payload.new)].sort((a, b) => a.seed - b.seed));
                } else if (payload.eventType === 'DELETE') {
                    setTeams(prev => prev.filter(t => t.id !== payload.old.id));
                } else if (payload.eventType === 'UPDATE') {
                    setTeams(prev => prev.map(t => t.id === payload.new.id ? mapTeam(payload.new) : t));
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setMatches(prev => [...prev, mapMatch(payload.new)].sort((a, b) => a.id.localeCompare(b.id)));
                } else if (payload.eventType === 'DELETE') {
                    setMatches(prev => prev.filter(m => m.id !== payload.old.id));
                } else if (payload.eventType === 'UPDATE') {
                    setMatches(prev => prev.map(m => m.id === payload.new.id ? mapMatch(payload.new) : m));
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tournament_state' }, (payload) => {
                if (payload.eventType === 'UPDATE') {
                    const newData = payload.new;
                    setCurrentRound(newData.current_round || 1);
                    setStatus(newData.status as any || 'setup');
                    setWinnerId(newData.winner_id || null);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // --- Actions ---

    const updateState = async (updates: any) => {
        try {
            await supabase.from('tournament_state').update(updates).eq('id', 1);
        } catch (e) {
            console.error("Error updating tournament state:", e);
        }
    };

    const addTeam = async (name: string) => {
        try {
            // Need robust seed generation if high concurrency, but length+1 is okay for small scale
            // To be safer, we could query count, but local state is likely synced enough.
            const newTeamData = {
                name,
                status: 'active',
                wins: 0,
                losses: 0,
                buy_backs: 0,
                seed: teams.length + 1,
                eliminated_in_round: null
            };

            const { error } = await supabase.from('teams').insert(newTeamData);
            if (error) throw error;
        } catch (e) {
            console.error("Error adding team:", e);
            throw e;
        }
    };

    const removeTeam = async (id: string) => {
        try {
            await supabase.from('teams').delete().eq('id', id);
        } catch (e) {
            console.error("Error removing team:", e);
        }
    };

    const startTournament = async () => {
        if (teams.length < 2) return;

        try {
            // 1. Update State
            await updateState({
                status: 'active',
                current_round: 1,
                winner_id: null
            });

            // 2. Generate Matches
            const shuffled = [...teams].sort(() => Math.random() - 0.5);
            const newMatches = [];

            for (let i = 0; i < shuffled.length; i += 2) {
                const t1 = shuffled[i];
                const t2 = shuffled[i + 1];

                if (t2) {
                    newMatches.push({
                        round: 1,
                        match_number: (i / 2) + 1,
                        team1_id: t1.id,
                        team2_id: t2.id,
                        score1: 0,
                        score2: 0,
                        winner_id: null,
                        completed: false,
                        is_bye: false,
                        next_match_id: null
                    });
                } else {
                    newMatches.push({
                        round: 1,
                        match_number: (i / 2) + 1,
                        team1_id: t1.id,
                        team2_id: null,
                        score1: 0,
                        score2: 0,
                        winner_id: t1.id,
                        completed: true,
                        is_bye: true,
                        next_match_id: null
                    });
                }
            }

            if (newMatches.length > 0) {
                await supabase.from('matches').insert(newMatches);
            }
        } catch (e) {
            console.error("Error starting tournament:", e);
        }
    };

    const generateRoundMatches = async (round: number, pool: Team[]) => {
        try {
            const shuffled = [...pool].sort(() => Math.random() - 0.5);
            const existingMatchesCount = matches.length;
            const newMatches = [];

            for (let i = 0; i < shuffled.length; i += 2) {
                const t1 = shuffled[i];
                const t2 = shuffled[i + 1];

                if (t2) {
                    newMatches.push({
                        round,
                        match_number: existingMatchesCount + (i / 2) + 1,
                        team1_id: t1.id,
                        team2_id: t2.id,
                        score1: 0,
                        score2: 0,
                        winner_id: null,
                        completed: false,
                        is_bye: false,
                        next_match_id: null
                    });
                } else {
                    newMatches.push({
                        round,
                        match_number: existingMatchesCount + (i / 2) + 1,
                        team1_id: t1.id,
                        team2_id: null,
                        score1: 0,
                        score2: 0,
                        winner_id: t1.id,
                        completed: true,
                        is_bye: true,
                        next_match_id: null
                    });
                }
            }

            if (newMatches.length > 0) {
                await supabase.from('matches').insert(newMatches);
            }
        } catch (e) {
            console.error("Error generating round matches:", e);
        }
    };

    const recordMatchResult = async (matchId: string, score1: number, score2: number, winnerId: string) => {
        try {
            // 1. Update Match
            const matchUpdate = {
                score1,
                score2,
                winner_id: winnerId,
                completed: true,
                completed_at: new Date().toISOString()
            };
            await supabase.from('matches').update(matchUpdate).eq('id', matchId);

            // 2. Update Team Stats
            const match = matches.find(m => m.id === matchId);
            if (match) {
                const loserId = match.team1Id === winnerId ? match.team2Id : match.team1Id;

                if (winnerId) {
                    // Need to fetch current wins to increment safely or use RPC. 
                    // For simplicity reading local state is risky if race condition, but okay for now.
                    // Better: rely on simple increment logic or just overwrite with local known state + 1
                    const winner = teams.find(t => t.id === winnerId);
                    if (winner) {
                        await supabase.from('teams').update({ wins: winner.wins + 1 }).eq('id', winnerId);
                    }
                }

                if (loserId) {
                    const loser = teams.find(t => t.id === loserId);
                    if (loser) {
                        await supabase.from('teams').update({
                            losses: loser.losses + 1,
                            status: 'eliminated',
                            eliminated_in_round: currentRound
                        }).eq('id', loserId);
                    }
                }
            }
        } catch (e) {
            console.error("Error recording match result:", e);
        }
    };

    const resetMatch = async (matchId: string) => {
        const match = matches.find(m => m.id === matchId);
        if (!match || !match.completed) return;

        try {
            const winnerId = match.winnerId;
            const loserId = match.team1Id === winnerId ? match.team2Id : match.team1Id;

            // Revert Stats
            if (winnerId) {
                const winner = teams.find(t => t.id === winnerId);
                if (winner) {
                    await supabase.from('teams').update({ wins: winner.wins - 1 }).eq('id', winnerId);
                }
            }
            if (loserId) {
                const loser = teams.find(t => t.id === loserId);
                if (loser) {
                    await supabase.from('teams').update({
                        losses: loser.losses - 1,
                        status: 'active',
                        eliminated_in_round: null
                    }).eq('id', loserId);
                }
            }

            // Reset Match
            await supabase.from('matches').update({
                score1: 0,
                score2: 0,
                winner_id: null,
                completed: false,
                completed_at: null
            }).eq('id', matchId);
        } catch (e) {
            console.error("Error resetting match:", e);
        }
    };

    const initiateBuyBackPhase = async () => {
        await updateState({ status: 'buy_back_phase' });
    };

    const nextRound = async () => {
        try {
            const activeTeams = teams.filter(t => t.status === 'active');

            if (activeTeams.length <= 1) {
                await updateState({
                    status: 'completed',
                    winner_id: activeTeams[0]?.id || null
                });
                return;
            }

            const nextRoundNum = currentRound + 1;
            // Update state to active and increment round
            await updateState({
                status: 'active',
                current_round: nextRoundNum
            });
            await generateRoundMatches(nextRoundNum, activeTeams);
        } catch (e) {
            console.error("Error advancing to next round:", e);
        }
    };

    const buyBackTeam = async (teamId: string) => {
        const team = teams.find(t => t.id === teamId);
        if (!team || team.eliminatedInRound !== currentRound) {
            console.warn("Buyback invalid: Team eliminated in different round or not found.");
            return;
        }

        try {
            await supabase.from('teams').update({
                status: 'active',
                buy_backs: team.buyBacks + 1
            }).eq('id', teamId);
        } catch (e) {
            console.error("Error buying back team:", e);
        }
    };

    const getBuyBackCost = (round: number) => {
        return round * 10;
    };

    const resetTournament = async () => {
        try {
            // Delete all matches
            await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
            // Delete all teams
            await supabase.from('teams').delete().neq('id', '00000000-0000-0000-0000-000000000000');

            // Reset State
            await updateState({
                status: 'setup',
                current_round: 1,
                winner_id: null
            });

            localStorage.removeItem('pong_royale_v2_data');
        } catch (e) {
            console.error("Error resetting tournament:", e);
        }
    };

    const forceUpdateTeam = async (id: string, updates: Partial<Team>) => {
        try {
            // Map camelCase to snake_case if needed
            const dbUpdates: any = { ...updates };
            if (updates.buyBacks !== undefined) {
                dbUpdates.buy_backs = updates.buyBacks;
                delete dbUpdates.buyBacks;
            }
            if (updates.eliminatedInRound !== undefined) {
                dbUpdates.eliminated_in_round = updates.eliminatedInRound;
                delete dbUpdates.eliminatedInRound;
            }

            await supabase.from('teams').update(dbUpdates).eq('id', id);
        } catch (e) {
            console.error("Error force updating team:", e);
        }
    };

    return (
        <TournamentContext.Provider value={{
            teams,
            matches,
            currentRound,
            status,
            winnerId,
            addTeam,
            removeTeam,
            startTournament,
            recordMatchResult,
            resetMatch,
            initiateBuyBackPhase,
            nextRound,
            buyBackTeam,
            getBuyBackCost,
            resetTournament,
            forceUpdateTeam
        }}>
            {children}
        </TournamentContext.Provider>
    );
};

export const useTournament = () => {
    const context = useContext(TournamentContext);
    if (context === undefined) {
        throw new Error('useTournament must be used within a TournamentProvider');
    }
    return context;
};
