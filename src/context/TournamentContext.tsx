import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Team, Match, TournamentState, TournamentStatus } from '../types';
import { supabase } from '../lib/supabase';

interface TournamentContextType extends TournamentState {
    addTeam: (name: string) => void;
    removeTeam: (id: string) => void;
    buyBackTeam: (id: string) => void;
    startTournament: () => void;
    recordMatchResult: (matchId: string, winnerId: string) => void;
    nextRound: () => void;
    resolveLottery: (winnerId: string) => void;
    isLotteryRequired: boolean;
    lotteryCandidates: Team[];
    resetTournament: () => void;
    getBuyBackCost: (round: number) => number;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export const useTournament = () => {
    const context = useContext(TournamentContext);
    if (!context) {
        throw new Error('useTournament must be used within a TournamentProvider');
    }
    return context;
};

export const TournamentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Load initial state from localStorage
    const [teams, setTeams] = useState<Team[]>(() => {
        const saved = localStorage.getItem('pong_teams');
        return saved ? JSON.parse(saved) : [];
    });
    const [matches, setMatches] = useState<Match[]>(() => {
        const saved = localStorage.getItem('pong_matches');
        return saved ? JSON.parse(saved) : [];
    });
    const [currentRound, setCurrentRound] = useState(() => {
        const saved = localStorage.getItem('pong_round');
        return saved ? parseInt(saved) : 1;
    });
    const [status, setStatus] = useState<TournamentStatus>(() => {
        const saved = localStorage.getItem('pong_status');
        return saved ? (saved as TournamentStatus) : 'setup';
    });

    // Additional state (no need to complicate persistence for transient UI states, but lottery candidates matter)
    const [lotteryCandidates, setLotteryCandidates] = useState<Team[]>(() => {
        const saved = localStorage.getItem('pong_lottery');
        return saved ? JSON.parse(saved) : [];
    });

    // Supabase Integration
    const TOURNAMENT_ID = 'default-event'; // Single event mode for now

    // 1. Initial Load & Subscription
    useEffect(() => {
        let subscription: any;

        const initSupabase = async () => {
            // Fetch initial state
            const { data, error } = await supabase
                .from('tournament_state')
                .select('data')
                .eq('id', TOURNAMENT_ID)
                .single();

            if (data?.data) {
                console.log("Loaded from Cloud:", data.data);
                const cloudState = data.data;
                setTeams(cloudState.teams || []);
                setMatches(cloudState.matches || []);
                setCurrentRound(cloudState.currentRound || 1);
                setStatus(cloudState.status || 'setup'); // Also load status from cloud
                setLotteryCandidates(cloudState.lotteryCandidates || []); // Also load lottery candidates from cloud
            } else {
                // If no cloud data, we might be the first.
                // We'll upsert our current (empty/initial) state shortly.
            }

            // Subscribe to changes
            subscription = supabase
                .channel('public:tournament_state')
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'tournament_state',
                    filter: `id = eq.${TOURNAMENT_ID} `
                }, (payload) => {
                    console.log("Real-time Update:", payload);
                    const newData = payload.new.data;
                    if (newData) {
                        // Update local state from cloud
                        // Note: This might conflict with local typing if we are typing fast.
                        // ideally we debounce or only update if we aren't the editor.
                        // For this simple app, we'll just accept "last write wins" from cloud.
                        setTeams(newData.teams || []);
                        setMatches(newData.matches || []);
                        setCurrentRound(newData.currentRound || 1);
                        setStatus(newData.status || 'setup'); // Update status from cloud
                        setLotteryCandidates(newData.lotteryCandidates || []); // Update lottery candidates from cloud
                    }
                })
                .subscribe();
        };

        initSupabase();

        return () => {
            if (subscription) supabase.removeChannel(subscription);
        };
    }, []);

    // 2. Sync to Cloud on Change
    // We use a ref to prevent sync loops if the change came FROM the cloud
    // But for simplicity in this V1, let's just push every local change.
    // The subscription will re-trigger a set, but React diffing should be okay?
    // Actually, to avoid infinite loops, we should ideally check deep equality or use a flag.
    // For now, let's just debounce the save.
    useEffect(() => {
        const payload = { teams, matches, currentRound, status, lotteryCandidates };

        const saveData = async () => {
            // Save to LocalStorage as backup
            localStorage.setItem('pong_tournament_data', JSON.stringify(payload));
            // Also update individual localStorage items for backward compatibility/direct access
            localStorage.setItem('pong_teams', JSON.stringify(teams));
            localStorage.setItem('pong_matches', JSON.stringify(matches));
            localStorage.setItem('pong_round', currentRound.toString());
            localStorage.setItem('pong_status', status);
            localStorage.setItem('pong_lottery', JSON.stringify(lotteryCandidates));


            // Save to Supabase
            const { error } = await supabase
                .from('tournament_state')
                .upsert({ id: TOURNAMENT_ID, data: payload });

            if (error) console.error("Cloud Sync Error:", error);
        };

        const timer = setTimeout(saveData, 1000); // 1s debounce
        return () => clearTimeout(timer);
    }, [teams, matches, currentRound, status, lotteryCandidates]);


    // Removed the old localStorage persistence effect and multi-tab sync effect as Supabase handles this.

    // Safe ID generator (fallback for environments where crypto.randomUUID is flaky)
    const generateId = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    const addTeam = (name: string) => {
        if (teams.some(t => t.name.toLowerCase() === name.toLowerCase())) return;
        const newTeam: Team = {
            id: generateId(),
            name,
            wins: 0,
            losses: 0,
            buyBacks: 0,
            status: 'active',
            eliminatedRound: null
        };
        setTeams([...teams, newTeam]);
    };

    const removeTeam = (id: string) => {
        setTeams(teams.filter(t => t.id !== id));
    };

    const buyBackTeam = (id: string) => {
        setTeams(teams.map(t =>
            t.id === id ? { ...t, status: 'buyback-pending', buyBacks: t.buyBacks + 1 } : t
        ));
    };

    const generateMatches = (activeTeams: Team[]) => {
        // Shuffle
        const shuffled = [...activeTeams].sort(() => Math.random() - 0.5);
        const newMatches: Match[] = [];
        let byeTeam: Team | null = null;
        let pairingPool = [...shuffled];

        // Odd logic
        if (pairingPool.length % 2 !== 0) {
            const maxWins = Math.max(...pairingPool.map(t => t.wins));
            const candidates = pairingPool.filter(t => t.wins === maxWins);
            const selectedBye = candidates[Math.floor(Math.random() * candidates.length)];

            byeTeam = selectedBye;
            pairingPool = pairingPool.filter(t => t.id !== selectedBye.id); // Remove

            // Add Bye Match
            newMatches.push({
                id: generateId(),
                round: currentRound,
                team1: byeTeam,
                team2: null,
                winner: byeTeam, // Auto win
                loser: null,
                completed: true,
                isBye: true
            });
        }

        // Shuffle rest
        pairingPool.sort(() => Math.random() - 0.5);

        while (pairingPool.length >= 2) {
            const t1 = pairingPool.pop()!;
            const t2 = pairingPool.pop()!;
            newMatches.push({
                id: generateId(),
                round: currentRound,
                team1: t1,
                team2: t2,
                winner: null,
                loser: null,
                completed: false,
                isBye: false
            });
        }

        setMatches(prev => [...prev, ...newMatches]);

        // Process Bye auto-win in state
        if (byeTeam) {
            setTeams(prev => prev.map(t =>
                t.id === byeTeam!.id ? { ...t, wins: t.wins + 1 } : t
            ));
        }
    };

    const startTournament = () => {
        if (teams.length < 2) return;
        setStatus('active');
        setCurrentRound(1);
        generateMatches(teams); // All active initially
    };

    const recordMatchResult = (matchId: string, winnerId: string) => {
        const matchRaw = matches.find(m => m.id === matchId);
        if (!matchRaw) return;

        // If match was already completed, we need to REVERSE the stats for the previous winner/loser first
        let teamsCopy = [...teams];
        if (matchRaw.completed && matchRaw.winner && matchRaw.loser) {
            teamsCopy = teamsCopy.map(t => {
                if (t.id === matchRaw.winner!.id) return { ...t, wins: t.wins - 1 };
                // If they were eliminated by this match, restore them?
                // Logic: check if they are currently eliminated AND this was the match that eliminated them?
                // Easier: just decrement losses. Status restoration is tricky if they bought back, but for simple 'undo' in same round:
                if (t.id === matchRaw.loser!.id) {
                    const newLosses = t.losses - 1;
                    // If they were eliminated, reactivate them safely
                    return { ...t, losses: newLosses, status: t.status === 'eliminated' ? 'active' : t.status };
                }
                return t;
            });
        }

        const winner = teamsCopy.find(t => t.id === winnerId)!;
        // Determine loser based on the fresh copy
        const loserId = matchRaw.team1.id === winnerId ? matchRaw.team2!.id : matchRaw.team1.id;
        const loser = teamsCopy.find(t => t.id === loserId)!;

        // Apply NEW stats
        teamsCopy = teamsCopy.map(t => {
            if (t.id === winner.id) return { ...t, wins: t.wins + 1 };
            if (t.id === loser.id) return { ...t, losses: t.losses + 1, status: 'eliminated', eliminatedRound: currentRound };
            return t;
        });

        setTeams(teamsCopy);

        setMatches(prev => prev.map(m =>
            m.id === matchId
                ? {
                    ...m,
                    completed: true,
                    winner: teamsCopy.find(t => t.id === winner.id) || null,
                    loser: teamsCopy.find(t => t.id === loserId) || null
                }
                : m
        ));
    };

    const nextRound = () => {
        const active = teams.filter(t => t.status === 'active');
        const pending = teams.filter(t => t.status === 'buyback-pending');

        // Check Champion
        if (active.length === 1 && pending.length === 0) {
            setStatus('completed');
            return;
        }

        const totalCount = active.length + pending.length;

        if (totalCount % 2 === 0) {
            // Even: Promote all pending -> active
            const newTeams = teams.map(t =>
                t.status === 'buyback-pending' ? { ...t, status: 'active' as const } : t
            );
            setTeams(newTeams);
            // We need to pass the updated list to generateMatches
            const newActive = newTeams.filter(t => t.status === 'active');
            setCurrentRound(r => r + 1);
            generateMatches(newActive);
        } else {
            // Odd
            if (pending.length > 0) {
                // Lottery
                setLotteryCandidates(pending);
            } else {
                // No buybacks, just odd active number
                setCurrentRound(r => r + 1);
                generateMatches(active);
            }
        }
    };

    const resolveLottery = (winnerId: string) => {
        // Winner gets active, others get eliminated AND buyback decrement
        const newTeams = teams.map(t => {
            if (t.status !== 'buyback-pending') return t;
            if (t.id === winnerId) {
                return { ...t, status: 'active' as const };
            } else {
                // Refund/Decrement buyback
                return { ...t, status: 'eliminated' as const, buyBacks: Math.max(0, t.buyBacks - 1) };
            }
        });

        setTeams(newTeams);
        setLotteryCandidates([]); // Clear lottery

        // Now start round
        const active = newTeams.filter(t => t.status === 'active');
        setCurrentRound(r => r + 1);
        generateMatches(active);
    };

    const resetTournament = () => {
        setTeams([]);
        setMatches([]);
        setCurrentRound(1);
        setStatus('setup');
        setLotteryCandidates([]);
        localStorage.removeItem('pong_teams');
        localStorage.removeItem('pong_matches');
        localStorage.removeItem('pong_round');
        localStorage.removeItem('pong_status');
        localStorage.removeItem('pong_lottery');
    };

    const getBuyBackCost = (round: number): number => {
        // "10, 20, 40, 50, 60, 70, 80, and 100 dollars"
        // Note: The jump from 20 to 40 seems to skip 30?
        // Round 1: 10
        // Round 2: 20
        // Round 3: 40
        // Round 4: 50
        // Round 5: 60
        // Round 6: 70
        // Round 7: 80
        // Round 8+: 100

        if (round === 1) return 10;
        if (round === 2) return 20;
        if (round === 3) return 40;
        if (round === 4) return 50;
        if (round === 5) return 60;
        if (round === 6) return 70;
        if (round === 7) return 80;
        return 100;
    };

    return (
        <TournamentContext.Provider value={{
            teams,
            matches,
            currentRound,
            status,
            addTeam,
            removeTeam,
            buyBackTeam,
            startTournament,
            recordMatchResult,
            nextRound,
            resolveLottery,
            isLotteryRequired: lotteryCandidates.length > 0,
            lotteryCandidates,
            resetTournament,
            getBuyBackCost // Exported
        }}>
            {children}
        </TournamentContext.Provider>
    );
};
