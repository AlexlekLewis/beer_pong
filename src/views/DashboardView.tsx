import React from 'react';
import { useTournament } from '../context/TournamentContext';

interface DashboardViewProps {
    onNavigate: (view: 'setup' | 'admin') => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
    const { teams, matches, currentRound, loading } = useTournament();

    if (loading) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <h2 className="logo">Loading...</h2>
            </div>
        );
    }

    const active = teams.filter(t => t.status === 'active');
    const eliminated = teams.filter(t => t.status === 'eliminated' || t.status === 'buyback-pending');
    const buyBacks = teams.reduce((s, t) => s + (t.buyBacks || 0), 0);
    const games = matches.filter(m => m.completed && !m.isBye).length;
    const top = [...teams].sort((a, b) => b.wins - a.wins).slice(0, 5);

    return (
        <div>
            {/* Navigation Helpers based on state */}
            {teams.length < 2 && (
                <div style={{ textAlign: 'center', margin: '40px 0', padding: '40px', border: '2px dashed var(--text-dim)', borderRadius: '8px' }}>
                    <h2 style={{ marginBottom: '20px' }}>No Tournament Active</h2>
                    <button
                        className="btn btn-primary btn-large"
                        onClick={() => onNavigate('setup')}
                    >
                        Get Started in Registration 📝
                    </button>
                    <p style={{ marginTop: '10px', color: 'var(--text-dim)' }}>Go to the <b>Registration</b> tab to add teams.</p>
                </div>
            )}

            {currentRound > 0 && matches.some(m => !m.completed) && (
                <div className="card" style={{ borderLeft: '4px solid var(--primary)', background: 'linear-gradient(90deg, rgba(0,255,136,0.05), transparent)' }}>
                    <div className="card-header">
                        <h3 className="card-title">Action Required</h3>
                        <button className="btn btn-primary" onClick={() => onNavigate('admin')}>
                            Go to Control Panel →
                        </button>
                    </div>
                    <p>Matches are waiting! Go to <b>Control</b> to enter results and advance the round.</p>
                </div>
            )}

            <div className="stats-grid">
                <div className="stat-card" style={{ '--stat-color': 'var(--accent)', '--stat-glow': 'var(--accent-glow)' } as React.CSSProperties}>
                    <div className="stat-value">{currentRound}</div>
                    <div className="stat-label">Round</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{active.length}</div>
                    <div className="stat-label">Remaining</div>
                </div>
                <div className="stat-card" style={{ '--stat-color': 'var(--danger)', '--stat-glow': 'rgba(255,51,102,0.4)' } as React.CSSProperties}>
                    <div className="stat-value">{eliminated.length}</div>
                    <div className="stat-label">Eliminated</div>
                </div>
                <div className="stat-card" style={{ '--stat-color': 'var(--secondary)', '--stat-glow': 'var(--secondary-glow)' } as React.CSSProperties}>
                    <div className="stat-value">{buyBacks}</div>
                    <div className="stat-label">Buy-Backs</div>
                </div>
                <div className="stat-card" style={{ '--stat-color': 'var(--warning)', '--stat-glow': 'var(--warning-glow)' } as React.CSSProperties}>
                    <div className="stat-value">{games}</div>
                    <div className="stat-label">Games</div>
                </div>
            </div>

            <div className="card">
                <div className="status-section">
                    <div className="status-header">
                        <span className="status-dot active"></span>
                        <span className="status-title">Still In</span>
                        <span className="status-count">({active.length})</span>
                    </div>
                    <div className="team-status-grid">
                        {active.map(t => (
                            <div key={t.id} className="team-status-chip">
                                <span>{t.name}</span>
                                <span className="record">{t.wins}W-{t.losses}L</span>
                                {t.buyBacks > 0 && <span className="buyback-badge">×{t.buyBacks}</span>}
                            </div>
                        ))}
                    </div>
                </div>

                {eliminated.length > 0 && (
                    <div className="status-section">
                        <div className="status-header">
                            <span className="status-dot eliminated"></span>
                            <span className="status-title">Out</span>
                            <span className="status-count">({eliminated.length})</span>
                        </div>
                        <div className="team-status-grid">
                            {eliminated.map(t => (
                                <div key={t.id} className="team-status-chip" style={{ opacity: 0.6 }}>
                                    <span>{t.name}</span>
                                    <span className="record">{t.wins}W-{t.losses}L</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title"><span className="icon">🏆</span>Leaderboard</h3>
                </div>
                {top.map((t, i) => (
                    <div key={t.id} className="leaderboard-item">
                        <span className="rank">#{i + 1}</span>
                        <span className="name">{t.name}</span>
                        <span className="wins">{t.wins} W</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DashboardView;
