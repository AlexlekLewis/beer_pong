import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import MatchDirectorCard from '../components/MatchDirectorCard';
import type { Team } from '../types';

const AdminView: React.FC = () => {
    const {
        matches,
        currentRound,
        teams,
        recordMatchResult,
        nextRound,
        buyBackTeam,
        resetTournament,
        getBuyBackCost,
        forceUpdateTeam,
        resetMatch
    } = useTournament();

    const [activeTab, setActiveTab] = useState<'live' | 'god'>('live');

    // --- LIVE DATA ---
    const roundMatches = matches.filter(m => m.round === currentRound);
    const pendingMatches = roundMatches.filter(m => !m.completed && !m.isBye);
    const completedMatches = roundMatches.filter(m => m.completed); // Includes byes if we want, or filter out
    const isRoundComplete = roundMatches.length > 0 && roundMatches.every(m => m.completed);

    // Logic for next step
    const active = teams.filter(t => t.status === 'active');
    const eliminated = teams.filter(t => t.status === 'eliminated');
    const pendingBuyback = teams.filter(t => t.status === 'buyback-pending');

    // --- GOD MODE STATE ---
    // We don't need local state for editing if we just commit on blur/enter? 
    // Or we keep a "working copy"? For speed, let's commit on change or blur.

    const handleStatChange = (id: string, field: keyof Team, value: number) => {
        forceUpdateTeam(id, { [field]: value });
    };

    return (
        <div className="app-container">

            {/* HEADER & TABS */}
            <div className="header" style={{ padding: '20px 0', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem', background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Director Mode <span style={{ fontSize: '0.5em', color: 'var(--text-dim)', fontFamily: 'monospace' }}>v2.0</span>
                    </h1>
                </div>

                <div className="nav" style={{ margin: 0 }}>
                    <button
                        onClick={() => setActiveTab('live')}
                        className={`nav-btn ${activeTab === 'live' ? 'active' : ''}`}
                        style={{ padding: '10px 20px', fontSize: '0.8rem' }}
                    >
                        ⚡ Live Ops
                    </button>
                    <button
                        onClick={() => setActiveTab('god')}
                        className={`nav-btn ${activeTab === 'god' ? 'active' : ''}`}
                        style={{ padding: '10px 20px', fontSize: '0.8rem' }}
                    >
                        👁️ God Mode
                    </button>
                </div>
            </div>

            {/* LIVE OPS TAB */}
            {activeTab === 'live' && (
                <div>

                    {/* FLOW BAR */}
                    <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--accent)' }}>
                        <div>
                            <div className="stat-label" style={{ marginTop: 0 }}>Current Status</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                Round {currentRound}
                                <span style={{ margin: '0 15px', color: 'var(--text-dim)', fontWeight: 'normal' }}>|</span>
                                {pendingMatches.length === 0 ?
                                    <span style={{ color: 'var(--primary)' }}>All Matches Complete</span> :
                                    <span style={{ color: 'var(--warning)' }}>{pendingMatches.length} Matches In Progress</span>
                                }
                            </div>
                        </div>

                        {/* NEXT ACTION BUTTON */}
                        <div>
                            {isRoundComplete ? (
                                <button
                                    onClick={nextRound}
                                    className="btn btn-success btn-large"
                                >
                                    🚀 START NEXT ROUND
                                </button>
                            ) : (
                                <div style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontStyle: 'italic', color: 'var(--text-dim)' }}>
                                    Waiting for results...
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
                        {/* Column 1: PENDING MATCHES (Priority) */}
                        <div>
                            <h2 className="card-title" style={{ marginBottom: '20px' }}>
                                <span className="icon">⚡</span> Active Matches ({pendingMatches.length})
                            </h2>

                            <div className="matches-list">
                                {pendingMatches.length === 0 && (
                                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)', background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: '4px' }}>
                                        No active matches right now.
                                    </div>
                                )}
                                {pendingMatches.map(m => (
                                    <MatchDirectorCard
                                        key={m.id}
                                        match={m}
                                        onRecordResult={recordMatchResult}
                                        onReset={resetMatch}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Column 2: COMPLETED & BUYBACKS */}
                        <div>

                            {/* MATCH HISTORY */}
                            <div className="card">
                                <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '15px' }}>✅ Recent History</h3>
                                <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {completedMatches.slice().reverse().map(m => (
                                        <MatchDirectorCard
                                            key={m.id}
                                            match={m}
                                            onRecordResult={recordMatchResult}
                                            onReset={resetMatch}
                                        />
                                    ))}
                                    {completedMatches.length === 0 && <div style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>No history yet.</div>}
                                </div>
                            </div>

                            {/* BUY BACKS */}
                            <div className="card" style={{ borderColor: 'var(--warning)' }}>
                                <div className="card-header" style={{ marginBottom: '15px' }}>
                                    <h3 className="card-title" style={{ color: 'var(--warning)', fontSize: '1rem' }}>💰 The Graveyard</h3>
                                    <span style={{ fontSize: '0.8rem', background: 'rgba(255, 170, 0, 0.1)', color: 'var(--warning)', padding: '2px 8px', borderRadius: '4px' }}>${getBuyBackCost(currentRound)}</span>
                                </div>
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                                        <tbody>
                                            {eliminated.length === 0 && (
                                                <tr><td colSpan={3} style={{ padding: '15px', textAlign: 'center', color: 'var(--text-dim)' }}>No eliminated teams.</td></tr>
                                            )}
                                            {eliminated.map(t => (
                                                <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '8px' }}>{t.name}</td>
                                                    <td style={{ padding: '8px', color: 'var(--text-dim)' }}>{t.wins}-{t.losses}</td>
                                                    <td style={{ padding: '8px', textAlign: 'right' }}>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(`Buy back ${t.name}?`)) buyBackTeam(t.id);
                                                            }}
                                                            className="btn-tiny"
                                                            style={{
                                                                background: 'transparent',
                                                                border: '1px solid var(--warning)',
                                                                color: 'var(--warning)',
                                                                padding: '4px 8px',
                                                                cursor: 'pointer'
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
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* GOD MODE TAB */}
            {activeTab === 'god' && (
                <div className="card" style={{ borderColor: 'var(--secondary)', boxShadow: '0 0 50px rgba(138, 43, 226, 0.1)' }}>
                    <div className="card-header">
                        <div>
                            <h2 className="card-title" style={{ color: 'var(--secondary)' }}>God Mode 👁️</h2>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '5px' }}>Manually overwrite tournament data. Be careful.</p>
                        </div>
                        <button
                            className="btn btn-danger"
                            onClick={() => {
                                if (confirm("⚠️ NUCLEAR OPTION: RESET EVERYTHING?")) resetTournament();
                            }}
                        >
                            🛑 RESET TOURNAMENT
                        </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: 'var(--text-dim)', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '12px' }}>Team Name</th>
                                    <th style={{ padding: '12px' }}>Status</th>
                                    <th style={{ padding: '12px' }}>Wins</th>
                                    <th style={{ padding: '12px' }}>Losses</th>
                                    <th style={{ padding: '12px' }}>BuyBacks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teams.map(t => (
                                    <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{t.name}</td>

                                        <td style={{ padding: '12px' }}>
                                            <select
                                                value={t.status}
                                                onChange={(e) => forceUpdateTeam(t.id, { status: e.target.value as any })}
                                                className="input"
                                                style={{ padding: '4px 8px', fontSize: '0.9rem' }}
                                            >
                                                <option value="active">Active</option>
                                                <option value="eliminated">Eliminated</option>
                                                <option value="buyback-pending">Buyback Pending</option>
                                            </select>
                                        </td>

                                        <td style={{ padding: '12px' }}>
                                            <input
                                                type="number"
                                                value={t.wins}
                                                onChange={(e) => handleStatChange(t.id, 'wins', parseInt(e.target.value) || 0)}
                                                className="input"
                                                style={{ width: '60px', padding: '4px 8px', textAlign: 'center' }}
                                            />
                                        </td>

                                        <td style={{ padding: '12px' }}>
                                            <input
                                                type="number"
                                                value={t.losses}
                                                onChange={(e) => handleStatChange(t.id, 'losses', parseInt(e.target.value) || 0)}
                                                className="input"
                                                style={{ width: '60px', padding: '4px 8px', textAlign: 'center' }}
                                            />
                                        </td>

                                        <td style={{ padding: '12px' }}>
                                            <input
                                                type="number"
                                                value={t.buyBacks}
                                                onChange={(e) => handleStatChange(t.id, 'buyBacks', parseInt(e.target.value) || 0)}
                                                className="input"
                                                style={{ width: '60px', padding: '4px 8px', textAlign: 'center' }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminView;
