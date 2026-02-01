// Party Lions - Beer Pong Tournament Types

export type TeamStatus = 'active' | 'eliminated' | 'bought_back' | 'wildcarded';
export type MatchStatus = 'pending' | 'in_progress' | 'completed';
export type TournamentStatus = 'setup' | 'in_progress' | 'buy_back_phase' | 'wildcard_phase' | 'completed';

export interface Team {
    id: string;
    name: string;
    player1?: string;
    player2?: string;
    status: TeamStatus;
    eliminatedInRound?: number;
    buyBackCount: number;
    isWildcard: boolean;
}

export interface Match {
    id: string;
    round: number;
    position: number;
    team1Id: string | null;
    team2Id: string | null;
    winnerId: string | null;
    loserId: string | null;
    status: MatchStatus;
    isByeMatch: boolean;
}

export interface TournamentSettings {
    allowBuyBacks: boolean;
    buyBackTimeLimit?: number;
    enableSoundEffects: boolean;
    enableConfetti: boolean;
    wildcardEnabled: boolean;
    themeColor?: string; // Hex code
}

export interface Tournament {
    id: string;
    name: string;
    createdAt: string;
    currentRound: number;
    totalRounds: number;
    status: TournamentStatus;
    teams: Team[];
    matches: Match[];
    buyBackBasePrice: number;
    buyBackIncrement: number;
    settings: TournamentSettings;
    eliminatedThisRound: string[]; // Team IDs eliminated in current round
    buyBackDecisions: Record<string, boolean>; // teamId -> bought back?
}

export interface ImportResult {
    success: boolean;
    teams: Omit<Team, 'id' | 'status' | 'buyBackCount' | 'isWildcard'>[];
    errors: string[];
}
