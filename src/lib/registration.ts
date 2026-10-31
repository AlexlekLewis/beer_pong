import type { Player, Team } from '../types';

export const normalizeName = (value: string) => value.trim().replace(/\s+/g, ' ');
const key = (value: string) => normalizeName(value).toLocaleLowerCase();

export function validateName(value: string, label: string): string | null {
    const name = normalizeName(value);
    if (!name) return `${label} is required.`;
    if (name.length > 60) return `${label} must be 60 characters or fewer.`;
    return null;
}

export function validateTeamNames(names: string[], existing: Team[]): string | null {
    const seen = new Set(existing.map(team => key(team.name)));
    for (const name of names) {
        const error = validateName(name, 'Team name');
        if (error) return error;
        if (seen.has(key(name))) return `A team named "${normalizeName(name)}" already exists.`;
        seen.add(key(name));
    }
    return null;
}

export function playerNameTaken(name: string, players: Player[], teams: Team[]): boolean {
    return players.some(player => key(player.name) === key(name)) ||
        teams.some(team => [team.player1, team.player2].some(value => value && key(value) === key(name)));
}

export function availablePlayers(players: Player[], teams: Team[]): Player[] {
    const assigned = new Set(teams.flatMap(team => [team.player1Id, team.player2Id]).filter(Boolean));
    return players.filter(player => !assigned.has(player.id));
}
