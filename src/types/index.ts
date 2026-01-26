export type TeamStatus = 'active' | 'eliminated' | 'buyback-pending';

export interface Team {
    id: string;
    name: string;
    status: TeamStatus;
    wins: number;
    losses: number;
    buyBacks: number;
    eliminatedInRound?: number; // Round number when eliminated
    seed: number; // Initial seed
}

export interface Match {
    id: string;
    round: number; // 1, 2, 3...
    matchNumber: number; // 1, 2, 3 within the round
    team1Id: string | null; // null if waiting for previous match
    team2Id: string | null;
    score1: number;
    score2: number;
    winnerId: string | null;
    completed: boolean;
    completedAt?: number; // Timestamp of completion
    isBye: boolean; // If true, team1 automatically advances
    nextMatchId: string | null; // Pointer to where the winner goes
}

export type TournamentStatus = 'setup' | 'active' | 'buy_back_phase' | 'completed';

export interface TournamentState {
    teams: Team[];
    matches: Match[];
    currentRound: number;
    status: TournamentStatus;
    winnerId: string | null;
}

export interface TournamentContextType extends TournamentState {
    addTeam: (name: string) => Promise<void>;
    removeTeam: (id: string) => void;
    startTournament: () => void;
    recordMatchResult: (matchId: string, score1: number, score2: number, winnerId: string) => void;
    resetMatch: (matchId: string) => void;
    nextRound: () => void;
    initiateBuyBackPhase: () => void;
    buyBackTeam: (teamId: string) => void;
    getBuyBackCost: (round: number) => number;
    resetTournament: () => void;
    forceUpdateTeam: (id: string, updates: Partial<Team>) => void;
}
