// Party Lions - Bracket Generation Logic

import { v4 as uuidv4 } from 'uuid';
import type { Team, Match } from '../types';

/**
 * Get the next power of 2 greater than or equal to n
 */
export function nextPowerOf2(n: number): number {
    return Math.pow(2, Math.ceil(Math.log2(n)));
}

/**
 * Calculate number of rounds for a bracket size
 */
export function calculateRounds(bracketSize: number): number {
    return Math.log2(bracketSize);
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Generate initial bracket matches for first round
 */
export function generateBracket(teams: Team[], shouldShuffle: boolean = true): { matches: Match[], totalRounds: number } {
    const numTeams = teams.length;

    if (numTeams < 2) {
        return { matches: [], totalRounds: 0 };
    }

    const bracketSize = nextPowerOf2(numTeams);
    const totalRounds = calculateRounds(bracketSize);
    const numByes = bracketSize - numTeams;

    // Optionally shuffle teams for random seeding
    const seededTeams = shouldShuffle ? shuffleArray([...teams]) : [...teams];

    // Pad with null for bye slots
    const paddedTeams: (Team | null)[] = [...seededTeams];
    for (let i = 0; i < numByes; i++) {
        paddedTeams.push(null);
    }

    const matches: Match[] = [];

    // Generate all rounds
    let matchId = 0;
    let matchesInRound = bracketSize / 2;

    for (let round = 1; round <= totalRounds; round++) {
        for (let position = 0; position < matchesInRound; position++) {
            const match: Match = {
                id: uuidv4(),
                round,
                position,
                team1Id: null,
                team2Id: null,
                winnerId: null,
                loserId: null,
                status: 'pending',
                isByeMatch: false
            };

            // Only populate first round with teams
            if (round === 1) {
                const team1Index = position * 2;
                const team2Index = position * 2 + 1;

                match.team1Id = paddedTeams[team1Index]?.id || null;
                match.team2Id = paddedTeams[team2Index]?.id || null;

                // Check for bye match (one team is null)
                if (!match.team1Id || !match.team2Id) {
                    match.isByeMatch = true;
                    match.status = 'completed';
                    match.winnerId = match.team1Id || match.team2Id;
                    match.loserId = null; // No loser in bye match
                }
            }

            matches.push(match);
            matchId++;
        }

        matchesInRound = matchesInRound / 2;
    }

    return { matches, totalRounds };
}

/**
 * Get matches for a specific round
 */
export function getMatchesForRound(matches: Match[], round: number): Match[] {
    return matches.filter(m => m.round === round).sort((a, b) => a.position - b.position);
}

/**
 * Get the parent match that a match feeds into
 */
export function getNextMatch(matches: Match[], currentMatch: Match): Match | null {
    const nextRound = currentMatch.round + 1;
    const nextPosition = Math.floor(currentMatch.position / 2);

    return matches.find(m => m.round === nextRound && m.position === nextPosition) || null;
}

/**
 * Advance winner to next round match
 */
export function advanceWinner(matches: Match[], match: Match, winnerId: string): Match[] {
    const nextMatch = getNextMatch(matches, match);

    if (!nextMatch) {
        // This was the final match
        return matches;
    }

    const updatedMatches = matches.map(m => {
        if (m.id === nextMatch.id) {
            // Determine which slot (team1 or team2) based on position parity
            if (match.position % 2 === 0) {
                return { ...m, team1Id: winnerId };
            } else {
                return { ...m, team2Id: winnerId };
            }
        }
        return m;
    });

    return updatedMatches;
}

/**
 * Check if all matches in a round are completed
 */
export function isRoundComplete(matches: Match[], round: number): boolean {
    const roundMatches = getMatchesForRound(matches, round);
    return roundMatches.every(m => m.status === 'completed');
}

/**
 * Get the current active match (first pending match in current round)
 */
export function getCurrentMatch(matches: Match[], currentRound: number): Match | null {
    const roundMatches = getMatchesForRound(matches, currentRound);
    return roundMatches.find(m => m.status === 'pending' || m.status === 'in_progress') || null;
}

/**
 * Get all losers from a specific round
 */
export function getRoundLosers(matches: Match[], round: number): string[] {
    const roundMatches = getMatchesForRound(matches, round);
    return roundMatches
        .filter(m => m.status === 'completed' && m.loserId && !m.isByeMatch)
        .map(m => m.loserId!);
}

/**
 * Generate matches for next round after buy-backs and wildcards
 */
export function generateNextRoundMatches(
    existingMatches: Match[],
    nextRoundTeamIds: string[],
    nextRound: number
): Match[] {
    const matchCount = Math.floor(nextRoundTeamIds.length / 2);
    const newMatches: Match[] = [];

    // Shuffle for fair matchups
    const shuffledTeams = shuffleArray(nextRoundTeamIds);

    for (let i = 0; i < matchCount; i++) {
        newMatches.push({
            id: uuidv4(),
            round: nextRound,
            position: i,
            team1Id: shuffledTeams[i * 2],
            team2Id: shuffledTeams[i * 2 + 1],
            winnerId: null,
            loserId: null,
            status: 'pending',
            isByeMatch: false
        });
    }

    return [...existingMatches, ...newMatches];
}
