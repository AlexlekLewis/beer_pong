// Party Lions - Buy-Back System Logic

import type { Team, Tournament } from '../types';

/**
 * Calculate buy-back price for a given round
 * Formula: basePrice + (round - 1) * increment
 * Default: $10 base + $10 per round = $10, $20, $30, $40, $50...
 */
export function getBuyBackPrice(
    round: number,
    basePrice: number = 10,
    increment: number = 10
): number {
    return basePrice + (round - 1) * increment;
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
    return `$${price}`;
}

/**
 * Process buy-back decisions and determine next round pool
 */
export function processBuyBacks(
    teams: Team[],
    winners: string[],
    buyBackDecisions: Record<string, boolean>,
    currentRound: number
): {
    nextRoundPool: string[];
    boughtBackTeams: string[];
    eliminatedTeams: string[];
    needsWildcard: boolean;
    eligibleForWildcard: string[];
} {
    const boughtBackTeams: string[] = [];
    const eliminatedTeams: string[] = [];

    // Process each buy-back decision
    Object.entries(buyBackDecisions).forEach(([teamId, didBuyBack]) => {
        if (didBuyBack) {
            boughtBackTeams.push(teamId);
        } else {
            eliminatedTeams.push(teamId);
        }
    });

    // Combine winners and bought-back teams for next round
    const nextRoundPool = [...winners, ...boughtBackTeams];

    // Check if we need a wildcard (odd number of teams)
    const needsWildcard = nextRoundPool.length % 2 !== 0;

    // Eligible for wildcard: teams eliminated this round who didn't buy back
    const eligibleForWildcard = eliminatedTeams;

    return {
        nextRoundPool,
        boughtBackTeams,
        eliminatedTeams,
        needsWildcard,
        eligibleForWildcard
    };
}

/**
 * Get teams eligible for buy-back (just eliminated in current round)
 */
export function getEligibleForBuyBack(
    teams: Team[],
    eliminatedThisRound: string[]
): Team[] {
    return teams.filter(t => eliminatedThisRound.includes(t.id));
}

/**
 * Check if all buy-back decisions have been made
 */
export function allBuyBackDecisionsMade(
    eliminatedThisRound: string[],
    buyBackDecisions: Record<string, boolean>
): boolean {
    return eliminatedThisRound.every(teamId => teamId in buyBackDecisions);
}

/**
 * Get pending buy-back decisions
 */
export function getPendingBuyBackDecisions(
    eliminatedThisRound: string[],
    buyBackDecisions: Record<string, boolean>
): string[] {
    return eliminatedThisRound.filter(teamId => !(teamId in buyBackDecisions));
}
