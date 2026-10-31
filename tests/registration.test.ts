import { beforeEach, describe, expect, it } from 'vitest';
import { useTournamentStore as store } from '../src/lib/store';
import { availablePlayers } from '../src/lib/registration';
import { generateNextRoundMatches } from '../src/lib/bracket';

beforeEach(() => { store.getState().resetTournament(); store.getState().createTournament('Friday Pong'); });

describe('player and team registration', () => {
    it('registers, pairs, releases and re-pairs players without losing identities', () => {
        expect(store.getState().registerPlayer(' Alice ')).toBeNull();
        expect(store.getState().registerPlayer('Bob')).toBeNull();
        const players = store.getState().tournament!.players!;
        expect(store.getState().registerTeam('Lions', players[0].id, players[1].id)).toBeNull();
        let tournament = store.getState().tournament!;
        expect(tournament.teams[0].player1).toBe('Alice');
        expect(availablePlayers(players, tournament.teams)).toHaveLength(0);
        store.getState().removePlayer(players[0].id);
        expect(store.getState().tournament!.players).toHaveLength(2);
        store.getState().removeTeam(tournament.teams[0].id);
        tournament = store.getState().tournament!;
        expect(availablePlayers(players, tournament.teams)).toHaveLength(2);
    });
    it('rejects duplicate names, self pairing, reused players and closed registration', () => {
        store.getState().registerPlayer('Alice');
        expect(store.getState().registerPlayer(' ALICE ')).toMatch(/already/);
        store.getState().registerPlayer('Bob');
        const [a, b] = store.getState().tournament!.players!;
        expect(store.getState().registerTeam('Lions', a.id, a.id)).toMatch(/different/);
        store.getState().registerTeam('Lions', a.id, b.id);
        expect(store.getState().registerTeam('Other', a.id, b.id)).toMatch(/assigned/);
        store.getState().addTeams([{ name: ' lions ' }, { name: 'Bears' }]);
        expect(store.getState().tournament!.teams).toHaveLength(1);
        store.getState().addTeam('Bears'); store.getState().startTournament();
        expect(store.getState().registerPlayer('Charlie')).toMatch(/closed/);
        expect(store.getState().registerTeam('Late', a.id, b.id)).toMatch(/closed/);
    });
    it('accepts online entries idempotently and preserves them in backups', () => {
        const id = store.getState().tournament!.id;
        const entry = { id: 'entry-1', tournament_id: id, kind: 'team' as const, team_name: 'Lions', player1: 'Alice', player2: 'Bob', status: 'pending' as const, created_at: new Date().toISOString() };
        expect(store.getState().acceptRegistration(entry)).toBeNull();
        expect(store.getState().acceptRegistration(entry)).toBeNull();
        expect(store.getState().tournament!.teams).toHaveLength(1);
        const json = store.getState().exportTournament();
        store.getState().resetTournament();
        expect(store.getState().importTournament(json)).toBe(true);
        expect(store.getState().tournament!.teams[0].registrationId).toBe('entry-1');
    });
});

describe('tournament audit regressions', () => {
    it('preserves every team in odd next-round pools', () => {
        for (const count of [3, 5, 7, 9]) {
            const teams = Array.from({ length: count }, (_, i) => String(i));
            const matches = generateNextRoundMatches([], teams, 2);
            expect(matches.flatMap(match => [match.team1Id, match.team2Id]).filter(Boolean).sort()).toEqual([...teams].sort());
            expect(matches.filter(match => match.isByeMatch)).toHaveLength(1);
        }
    });
    it('retains the confirmed wildcard in the next round', () => {
        store.getState().addTeams(['A', 'B', 'C', 'D'].map(name => ({ name })));
        store.getState().startTournament();
        for (const match of store.getState().tournament!.matches.filter(match => match.round === 1)) store.getState().setMatchWinner(match.id, match.team1Id!);
        const tournament = store.getState().tournament!;
        const wildcard = tournament.teams.find(team => team.status === 'eliminated')!;
        store.setState({ tournament: { ...tournament, status: 'wildcard_phase' }, wildcardResult: { team: wildcard, index: 0 } });
        store.getState().confirmWildcard();
        expect(store.getState().tournament!.matches.filter(match => match.round === 2).some(match => [match.team1Id, match.team2Id].includes(wildcard.id))).toBe(true);
        expect(store.getState().wildcardResult).toBeNull();
    });
    it('ignores invalid and repeated match results and premature advancement', () => {
        store.getState().addTeams([{ name: 'A' }, { name: 'B' }]); store.getState().startTournament();
        const match = store.getState().tournament!.matches[0];
        store.getState().setMatchWinner('missing', 'missing');
        store.getState().setMatchWinner(match.id, 'missing');
        expect(store.getState().tournament!.matches[0].status).toBe('pending');
        store.getState().advanceToNextRound();
        expect(store.getState().tournament!.currentRound).toBe(1);
        store.getState().setMatchWinner(match.id, match.team1Id!);
        store.getState().setMatchWinner(match.id, match.team2Id!);
        expect(store.getState().tournament!.matches[0].winnerId).toBe(match.team1Id);
        expect(store.getState().tournament!.eliminatedThisRound).toHaveLength(1);
    });
});

describe('organiser round buy-in amounts', () => {
    it('uses custom round amounts including free entry, and restores defaults', () => {
        expect(store.getState().getCurrentBuyBackPrice()).toBe(10);
        expect(store.getState().setRoundBuyBackPrice(1, 12.50)).toBeNull();
        expect(store.getState().getCurrentBuyBackPrice()).toBe(12.50);
        expect(store.getState().setRoundBuyBackPrice(2, 0)).toBeNull();
        const json = store.getState().exportTournament();
        store.getState().resetTournament(); store.getState().importTournament(json);
        expect(store.getState().tournament!.buyBackRoundPrices).toEqual({ 1: 12.5, 2: 0 });
        store.setState({ tournament: { ...store.getState().tournament!, currentRound: 2 } });
        expect(store.getState().getCurrentBuyBackPrice()).toBe(0);
        expect(store.getState().setRoundBuyBackPrice(2, null)).toBeNull();
        expect(store.getState().getCurrentBuyBackPrice()).toBe(20);
    });
    it('rejects invalid prices and locks paid or past rounds', () => {
        for (const amount of [-1, NaN, Infinity, 1.234]) expect(store.getState().setRoundBuyBackPrice(1, amount)).not.toBeNull();
        expect(store.getState().setRoundBuyBackPrice(1.5, 20)).not.toBeNull();
        store.setState({ tournament: { ...store.getState().tournament!, currentRound: 2, buyBackDecisions: { paid: true } } });
        expect(store.getState().setRoundBuyBackPrice(1, 20)).not.toBeNull();
        expect(store.getState().setRoundBuyBackPrice(2, 20)).toMatch(/locked/);
        expect(store.getState().setRoundBuyBackPrice(3, 25)).toBeNull();
    });
});
