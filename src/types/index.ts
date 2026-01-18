export type TeamStatus = 'active' | 'eliminated' | 'buyback-pending';

export interface Team {
  id: string;
  name: string;
  wins: number;
  losses: number;
  buyBacks: number;
  status: TeamStatus;
  eliminatedRound: number | null;
}

export interface Match {
  id: string;
  round: number;
  team1: Team;
  team2: Team | null; // Null implies a bye if isBye is true, or placeholder? PRD says 'Team | null' for second team
  winner: Team | null;
  loser: Team | null;
  completed: boolean;
  isBye: boolean;
}

export type TournamentStatus = 'setup' | 'active' | 'completed';

export interface TournamentState {
  teams: Team[];
  matches: Match[];
  currentRound: number;
  status: TournamentStatus;
}
