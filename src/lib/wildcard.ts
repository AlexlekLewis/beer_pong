// Party Lions - Wildcard Lottery System

import type { Team } from '../types';

/**
 * Select a random wildcard from eligible teams
 */
export function selectWildcard(eligibleTeams: Team[]): Team | null {
    if (eligibleTeams.length === 0) return null;

    const index = Math.floor(Math.random() * eligibleTeams.length);
    return eligibleTeams[index];
}

/**
 * Pre-determine wildcard result (for wheel animation)
 * Returns the index and team
 */
export function preSelectWildcard(eligibleTeams: Team[]): {
    index: number;
    team: Team;
} | null {
    if (eligibleTeams.length === 0) return null;

    const index = Math.floor(Math.random() * eligibleTeams.length);
    return {
        index,
        team: eligibleTeams[index]
    };
}

/**
 * Calculate wheel rotation to land on selected team
 * Adds multiple full rotations for dramatic effect
 */
export function calculateWheelRotation(
    selectedIndex: number,
    totalTeams: number,
    minSpins: number = 5,
    maxSpins: number = 8
): number {
    const segmentAngle = 360 / totalTeams;
    const targetAngle = selectedIndex * segmentAngle;

    // Random number of full rotations between min and max
    const fullRotations = minSpins + Math.random() * (maxSpins - minSpins);

    // Total rotation: full spins + angle to land on target
    // We subtract targetAngle because wheel spins and pointer is at top
    return fullRotations * 360 + (360 - targetAngle - segmentAngle / 2);
}

/**
 * Get wheel segment colors (rainbow distribution)
 */
export function getSegmentColor(index: number, total: number): string {
    const hue = (index * 360) / total;
    return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Get contrasting text color for segment
 */
export function getSegmentTextColor(index: number, total: number): string {
    const hue = (index * 360) / total;
    // Use white for darker segments, dark for lighter
    const lightness = 50;
    return lightness > 50 ? '#1a1a1a' : '#ffffff';
}
