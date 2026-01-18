import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Team, Match, TournamentState, TournamentContextType } from '../types';

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

const STORAGE_KEY = 'pong_royale_v2_data';

export const TournamentProvider = ({ children }: { children: ReactNode }) => {
    // --- State ---
    const [teams, setTeams] = useState<Team[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [currentRound, setCurrentRound] = useState(1);
    const [status, setStatus] = useState<TournamentState['status']>('setup');
    const [winnerId, setWinnerId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // --- Persistence ---
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                setTeams(data.teams || []);
                setMatches(data.matches || []);
                setCurrentRound(data.currentRound || 1);
                setStatus(data.status || 'setup');
                setWinnerId(data.winnerId || null);
            } catch (e) {
                console.error("Failed to load tournament data", e);
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!loading) {
            const data = { teams, matches, currentRound, status, winnerId };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
    }, [teams, matches, currentRound, status, winnerId, loading]);

    // --- Actions ---

    const addTeam = (name: string) => {
        const newTeam: Team = {
            id: crypto.randomUUID(),
            name,
            status: 'active',
            wins: 0,
            losses: 0,
            buyBacks: 0,
            seed: teams.length + 1
        };
        setTeams(prev => [...prev, newTeam]);
    };

    const removeTeam = (id: string) => {
        setTeams(prev => prev.filter(t => t.id !== id));
    };

    const startTournament = () => {
        if (teams.length < 2) return;
        setStatus('active');
        setCurrentRound(1);
        generateRoundMatches(1, teams);
    };

    const generateRoundMatches = (round: number, pool: Team[]) => {
        // Simple distinct pairing for now.
        // Shuffle pool?
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        const newMatches: Match[] = [];

        for (let i = 0; i < shuffled.length; i += 2) {
            const t1 = shuffled[i];
            const t2 = shuffled[i + 1];

            if (t2) {
                // Pair
                newMatches.push({
                    id: crypto.randomUUID(),
                    round,
                    matchNumber: (newMatches.length + 1),
                    team1Id: t1.id,
                    team2Id: t2.id,
                    score1: 0,
                    score2: 0,
                    winnerId: null,
                    completed: false,
                    isBye: false,
                    nextMatchId: null
                });
            } else {
                // Bye
                newMatches.push({
                    id: crypto.randomUUID(),
                    round,
                    matchNumber: (newMatches.length + 1),
                    team1Id: t1.id,
                    team2Id: null,
                    score1: 0,
                    score2: 0,
                    winnerId: t1.id, // Auto win
                    completed: true,
                    isBye: true,
                    nextMatchId: null
                });
                // Auto-update team stats for bye? Maybe not wins/losses, just advance.
            }
        }

        setMatches(prev => [...prev, ...newMatches]);
    };

    const recordMatchResult = (matchId: string, score1: number, score2: number, winnerId: string) => {
        setMatches(prev => prev.map(m => {
            if (m.id === matchId) {
                return { ...m, score1, score2, winnerId, completed: true, completedAt: Date.now() };
            }
            return m;
        }));

        // Update Team Stats
        const match = matches.find(m => m.id === matchId);
        if (match) {
            const loserId = match.team1Id === winnerId ? match.team2Id : match.team1Id;

            setTeams(prev => prev.map(t => {
                if (t.id === winnerId) return { ...t, wins: t.wins + 1 };
                if (t.id === loserId) return { ...t, losses: t.losses + 1, status: 'eliminated', eliminatedInRound: currentRound };
                return t;
            }));
        }
    };

    const resetMatch = (matchId: string) => {
        const match = matches.find(m => m.id === matchId);
        if (!match || !match.completed) return;

        // Revert stats
        const winnerId = match.winnerId;
        const loserId = match.team1Id === winnerId ? match.team2Id : match.team1Id;

        setTeams(prev => prev.map(t => {
            if (t.id === winnerId) return { ...t, wins: t.wins - 1 };
            if (t.id === loserId) return { ...t, losses: t.losses - 1, status: 'active', eliminatedInRound: undefined }; // Revert elimination
            return t;
        }));

        setMatches(prev => prev.map(m => {
            if (m.id === matchId) {
                return { ...m, score1: 0, score2: 0, winnerId: null, completed: false, completedAt: undefined };
            }
            return m;
        }));
    };

    const nextRound = () => {
        // Collect all 'active' teams (winners + buybacks)
        const activeTeams = teams.filter(t => t.status === 'active');

        if (activeTeams.length <= 1) {
            setStatus('completed');
            setWinnerId(activeTeams[0]?.id || null);
            return;
        }

        const nextRoundNum = currentRound + 1;
        setCurrentRound(nextRoundNum);
        generateRoundMatches(nextRoundNum, activeTeams);
    };

    const buyBackTeam = (teamId: string) => {
        // Strict Window Check
        const team = teams.find(t => t.id === teamId);
        if (!team || team.eliminatedInRound !== currentRound) {
            console.warn("Buyback invalid: Team eliminated in different round or not found.");
            return;
        }

        setTeams(prev => prev.map(t => {
            if (t.id === teamId) {
                return {
                    ...t,
                    status: 'active',
                    buyBacks: t.buyBacks + 1,
                    eliminatedInRound: undefined // Clear elimination record
                };
            }
            return t;
        }));
    };

    const getBuyBackCost = (round: number) => {
        return round * 10; // $10 per round
    };

    const resetTournament = () => {
        setTeams([]);
        setMatches([]);
        setCurrentRound(1);
        setStatus('setup');
        setWinnerId(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    const forceUpdateTeam = (id: string, updates: Partial<Team>) => {
        setTeams(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
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
