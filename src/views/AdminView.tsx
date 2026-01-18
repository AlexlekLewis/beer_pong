import React from 'react';
import { useTournament } from '../context/TournamentContext';
import AdminMatchRow from '../components/AdminMatchRow';

const AdminView: React.FC = () => {
    const {
        matches,
        currentRound,
        teams,
        recordMatchResult,
        nextRound,
        buyBackTeam,
        resetTournament,
        getBuyBackCost
    } = useTournament();

    // Sort teams for leaderboard: Active > Buyback > Eliminated, then by Wins
    const sortedTeams = [...teams].sort((a, b) => {
        const statusPriority = { active: 3, 'buyback-pending': 2, eliminated: 1 };
        if (statusPriority[a.status] !== statusPriority[b.status]) {
            return statusPriority[b.status] - statusPriority[a.status];
        }
        return b.wins - a.wins;
    });

    const roundMatches = matches.filter(m => m.round === currentRound);
    const pendingMatches = roundMatches.filter(m => !m.completed && !m.isBye);
    const completedMatches = roundMatches.filter(m => m.completed);

    // Status filters
    const active = teams.filter(t => t.status === 'active');
    const eliminated = teams.filter(t => t.status === 'eliminated');
    const pending = teams.filter(t => t.status === 'buyback-pending');

    const isRoundComplete = roundMatches.length > 0 && roundMatches.every(m => m.completed);

    return (
    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

            {/* ACTION BAR / HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Control Panel</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className="btn-tiny btn-primary"
                        onClick={() => window.open('/spectator', '_blank')}
                    >
                        📺 Open Projector View
                    </button>
                    <button
                        className="btn-tiny"
                        style={{ background: '#333', color: '#ff4444' }}
                        onClick={() => {
                            if (confirm("Reset everything?")) resetTournament();
                        }}
                    >
                        ⚠️ Reset
                    </button>
                </div>
            </div>

            {/* 1. ACTIVE MATCHES (Priority) */}
            <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
                <div className="card-header">
                    <h2 className="card-title">⚡ Round {currentRound} Live Matches</h2>
                    <div className="badge">{active.length} Teams Remaining</div>
                </div>

                <div className="matches-list">
                    {pendingMatches.length > 0 ? (
                        pendingMatches.map(m => (
                            <AdminMatchRow
                                key={m.id}
                                match={m}
                                onSelect={(matchId, winnerId) => recordMatchResult(matchId, winnerId)}
                            />
                        ))
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                            {isRoundComplete ? "All matches complete. Ready for next round." : "Waiting for next round generation..."}
                        </div>
                    )}
                </div>

                {/* Next Round Action */}
                {isRoundComplete && (
                    <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0, 255, 136, 0.1)', borderRadius: '8px', display: 'flex', justifyContent: 'center' }}>
                        <button className="btn btn-success" onClick={nextRound} style={{ width: '100%', maxWidth: '400px', padding: '15px', fontSize: '1.2rem' }}>
                            Start Round {currentRound + 1} →
                        </button>
                    </div>
                )}
            </div>

            {/* 2. BUY BACKS (Secondary) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                {/* Buy Back Panel */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">💰 Buy Backs (${getBuyBackCost(currentRound)})</h3>
                    </div>
                    {eliminated.length === 0 ? (
                        <div style={{ padding: '10px', color: 'var(--text-dim)' }}>No eliminated teams yet.</div>
                    ) : (
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <table style={{ width: '100%', fontSize: '0.9rem' }}>
                                <tbody>
                                    {eliminated.map(t => (
                                        <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '8px' }}>{t.name}</td>
                                            <td style={{ padding: '8px', color: 'var(--text-dim)' }}>{t.wins} - {t.losses}</td>
                                            <td style={{ padding: '8px', textAlign: 'right' }}>
                                                <button
                                                    className="btn-tiny"
                                                    style={{ border: '1px solid var(--warning)', color: 'var(--warning)', background: 'transparent' }}
                                                    onClick={() => {
                                                        const cost = getBuyBackCost(currentRound);
                                                        if (confirm(`Charge ${t.name} $${cost} to buy back?`)) buyBackTeam(t.id);
                                                    }}
                                                >
                                                    Buy In
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* 3. RECENTLY COMPLETED (Context) */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">✅ Finished Results</h3>
                    </div>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {completedMatches.length === 0 && <div style={{ padding: '10px', color: 'var(--text-dim)' }}>No results yet.</div>}
                        {completedMatches.map(m => (
                            <div key={m.id} style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', opacity: 0.7 }}>
                                <span style={{ color: m.winner?.id === m.team1.id ? 'var(--success)' : '' }}>{m.team1.name}</span>
                                <span style={{ fontSize: '0.8rem', color: '#666' }}>vs</span>
                                <span style={{ color: m.winner?.id === m.team2?.id ? 'var(--success)' : '' }}>{m.team2 ? m.team2.name : 'Bye'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. STANDINGS (Bottom Reference) */}
            <div className="card" style={{ marginTop: '20px', opacity: 0.8 }}>
                <div className="card-header">
                    <h3 className="card-title">📊 Full Standings</h3>
                    <button
                        className="btn-text"
                        onClick={(e) => {
                            const el = e.currentTarget.nextElementSibling as HTMLElement;
                            el.style.display = el.style.display === 'none' ? 'block' : 'none';
                        }}
                    >
                        Toggle Visibility
                    </button>
                </div>
                <div style={{ display: 'none' }}>
                    <table style={{ width: '100%', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', color: 'var(--text-dim)' }}>
                                <th style={{ padding: '10px' }}>Rank</th>
                                <th>Team</th>
                                <th>Status</th>
                                <th>W</th>
                                <th>L</th>
                                <th>BB</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTeams.map((t, i) => (
                                <tr key={t.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '8px' }}>#{i + 1}</td>
                                    <td style={{ fontWeight: 'bold' }}>{t.name}</td>
                                    <td>
                                        <span className={`status-badge ${t.status}`} style={{ fontSize: '0.7em', padding: '2px 6px' }}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td>{t.wins}</td>
                                    <td>{t.losses}</td>
                                    <td>{t.buyBacks}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminView;
