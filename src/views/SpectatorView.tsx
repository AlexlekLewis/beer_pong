import React, { useState, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import MatchCard from '../components/MatchCard';
import ResultAnnouncement from '../components/ResultAnnouncement';
import type { Match } from '../types';

/* 
  Spectator View - "Live Display"
  This component matches the second HTML snippet provided by the user.
  It uses the same data source (TournamentContext) but presents it in the "Spectator" layout.
*/

const SpectatorView: React.FC = () => {
    const { teams, matches, currentRound, getBuyBackCost } = useTournament();

    // Auto-scroll or simple display? Snippet suggests static grid with scroll.

    const activeTeams = teams.filter(t => t.status === 'active');
    const eliminatedTeams = teams.filter(t => t.status === 'eliminated' || t.status === 'buyback-pending');
    const totalBuyBacks = teams.reduce((s, t) => s + (t.buyBacks || 0), 0);
    const leaderboard = [...teams].sort((a, b) => b.wins - a.wins).slice(0, 6);

    const pendingMatches = matches.filter(m => !m.completed && m.round === currentRound);
    const completedMatches = matches.filter(m => m.completed && m.round === currentRound);

    const [announcementMatch, setAnnouncementMatch] = useState<Match | null>(null);
    const [processedMatchIds, setProcessedMatchIds] = useState<Set<string>>(new Set());

    // Effect to detect NEWLY completed matches
    useEffect(() => {
        const completed = matches.filter(m => m.completed && m.winner);

        // Find a match that is completed, has a winner, and hasn't been shown yet
        // We also want to make sure we don't show old matches on initial load (unless we want to?)
        // Let's rely on the user being "live". If they reload, we might replay the last one?
        // Better: Initialize processedMatchIds with all currently completed matches on mount?
        // For now, let's just checking against our local set.

        const newResult = completed.find(m => !processedMatchIds.has(m.id));

        if (newResult) {
            setAnnouncementMatch(newResult);
            setProcessedMatchIds(prev => new Set([...prev, newResult.id]));
        } else {
            // Initialize set on first run (optional, to avoid replaying history on refresh)
            // Actually, if I refresh, I probably don't want to see 10 animations.
            // So let's sync the set if it's empty and we have completed matches.
            if (processedMatchIds.size === 0 && completed.length > 0) {
                const ids = new Set(completed.map(m => m.id));
                setProcessedMatchIds(ids);
            }
        }
    }, [matches, processedMatchIds]);

    return (
        <div className="display-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: '20px', position: 'relative', overflow: 'hidden' }}>

            {/* ANNOUNCEMENT OVERLAY */}
            {announcementMatch && (
                <ResultAnnouncement
                    match={announcementMatch}
                    onComplete={() => setAnnouncementMatch(null)}
                />
            )}

            {/* Navigation Control (Hover to reveal) */}
            <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000, opacity: 0, transition: 'opacity 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                className="spectator-controls"
            >
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => window.open('/', '_self')}
                        style={{ boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
                    >
                        <span className="icon">⚙️</span> Dashboard
                    </button>
                    <button
                        className="btn btn-danger"
                        onClick={() => {
                            if (window.opener) {
                                window.close();
                            } else {
                                window.location.href = '/';
                            }
                        }}
                        style={{ boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
                    >
                        Close ✕
                    </button>
                </div>
            </div>

            <style>{`
                .display-container:hover .spectator-controls {
                    opacity: 1 !important;
                }
                
                /* Layout Overrides for Single Screen */
                .matches-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                    padding: 1rem 0;
                    align-content: start; /* Don't stretch rows */
                }

                .match-card {
                    /* Make match cards slightly bigger since we have room */
                    transform: scale(1);
                    transition: all 0.3s;
                }

                .horizontal-deck {
                    margin-top: auto;
                    padding-top: 1rem;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    display: flex;
                    gap: 2rem;
                    height: 15vh; /* Fixed height for footer */
                }

                .deck-section {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: rgba(0,0,0,0.3);
                    border-radius: 8px;
                    padding: 10px;
                    border: 1px solid rgba(255,255,255,0.05);
                }

                .deck-title {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 0.8rem;
                    color: var(--primary);
                    margin-bottom: 0.5rem;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }

                .deck-content {
                    display: flex;
                    gap: 10px;
                    overflow-x: auto;
                    align-items: center;
                    padding-bottom: 5px;
                }

                .mini-card {
                    background: rgba(255,255,255,0.05);
                    padding: 5px 10px;
                    border-radius: 4px;
                    white-space: nowrap;
                    font-size: 0.9rem;
                    border: 1px solid transparent;
                }
                
                .mini-card.gold { border-color: #ffd700; color: #ffd700; }
                .mini-card.active-tag { border-left: 3px solid var(--success); }
                .mini-card.eliminated-tag { border-left: 3px solid var(--danger); opacity: 0.6; }

                /* Hide scrollbars */
                ::-webkit-scrollbar { width: 0px; height: 0px; }
            `}</style>

            {/* Header - Compact */}
            <header className="header" style={{ marginBottom: '1rem', paddingBottom: '0.5rem' }}>
                <div className="logo-section">
                    <span className="logo-icon">🍺</span>
                    <h1 className="logo" style={{ fontSize: '2.5rem' }}>PONG ROYALE</h1>
                </div>

                <div className="round-badge">
                    <div className="round-label">Round</div>
                    <div className="round-number">{currentRound}</div>
                </div>

                <div className="stats-bar">
                    {/* Combined Stats for space */}
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>{activeTeams.length}</div>
                            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.7 }}>Active</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--danger)' }}>{eliminatedTeams.length}</div>
                            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.7 }}>Out</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div className="stat-value" style={{ color: 'var(--warning)', textShadow: '0 0 10px var(--warning)', fontSize: '1.8rem' }}>${getBuyBackCost(currentRound)}</div>
                            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.7 }}>Buy-In</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN GRID - Takes remaining height */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                <div className="matches-grid">
                    {/* Live Matches First */}
                    {pendingMatches.map(match => (
                        <MatchCard key={match.id} match={match} status="active" />
                    ))}
                    {/* Then Completed (if needed, or maybe hide them to save space?) */}
                    {/* User said "fit all teams". Completed matches this round still show results. */}
                    {completedMatches.map(match => (
                        <MatchCard key={match.id} match={match} status="complete" />
                    ))}

                    {matches.length === 0 && (
                        <div className="empty-state" style={{ width: '100%', gridColumn: '1 / -1' }}>
                            <div className="empty-icon">🏓</div>
                            <div className="empty-text">Reviewing Stats...</div>
                            <div className="empty-subtext">Round {currentRound} Prep</div>
                        </div>
                    )}
                </div>
            </div>

            {/* HORIZONTAL DECK (Footer) */}
            <div className="horizontal-deck">
                {/* Leaderboard Section */}
                <div className="deck-section" style={{ flex: 1 }}>
                    <div className="deck-title">Top Squads</div>
                    <div className="deck-content">
                        {leaderboard.map((team, i) => (
                            <div key={team.id} className="mini-card gold">
                                #{i + 1} {team.name} <span style={{ opacity: 0.7 }}>({team.wins}W)</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status Ticker (Buybacks / Eliminated recently?) */}
                <div className="deck-section" style={{ flex: 2 }}>
                    <div className="deck-title">Field Status</div>
                    <div className="deck-content">
                        {activeTeams.map(t => (
                            <div key={t.id} className="mini-card active-tag">
                                {t.name}
                            </div>
                        ))}
                        {eliminatedTeams.slice(0, 5).map(t => (
                            <div key={t.id} className="mini-card eliminated-tag">
                                {t.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpectatorView;
