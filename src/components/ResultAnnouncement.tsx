import React, { useEffect, useState } from 'react';
import type { Match } from '../types';

interface ResultAnnouncementProps {
    match: Match;
    onComplete: () => void;
}

const ResultAnnouncement: React.FC<ResultAnnouncementProps> = ({ match, onComplete }) => {
    const [phase, setPhase] = useState<'intro' | 'reveal' | 'outro'>('intro');

    useEffect(() => {
        // Timeline:
        // 0s: Intro (VS screen)
        // 1s: Reveal (Ticks/Crosses appear)
        // 6s: Outro (Fade out)
        // 7s: Complete

        const timer1 = setTimeout(() => setPhase('reveal'), 1000);
        const timer2 = setTimeout(() => setPhase('outro'), 6000);
        const timer3 = setTimeout(onComplete, 7000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [onComplete]);

    if (!match.winner || !match.loser) return null;

    return (
        <div className={`result-overlay ${phase}`}>
            <div className="vs-container">
                {/* Winner Side */}
                <div className={`side winner-side ${phase === 'reveal' ? 'revealed' : ''}`}>
                    <div className="team-content">
                        <div className="team-name">{match.winner.name}</div>
                        {phase === 'intro' && <div className="placeholder">?</div>}
                        {phase !== 'intro' && (
                            <div className="result-icon tick">
                                ✅
                                <div className="result-label">WINNER</div>
                            </div>
                        )}
                    </div>
                    {phase !== 'intro' && <div className="confetti-cannon"></div>}
                </div>

                {/* VS Divider */}
                <div className="vs-divider">
                    <span>VS</span>
                </div>

                {/* Loser Side */}
                <div className={`side loser-side ${phase === 'reveal' ? 'revealed' : ''}`}>
                    <div className="team-content">
                        <div className="team-name">{match.loser.name}</div>
                        {phase === 'intro' && <div className="placeholder">?</div>}
                        {phase !== 'intro' && (
                            <div className="result-icon cross">
                                ❌
                                <div className="result-label">ELIMINATED</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .result-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0,0,0,0.95);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: opacity 1s;
                }
                .result-overlay.outro {
                    opacity: 0;
                }

                .vs-container {
                    display: flex;
                    width: 100%;
                    height: 100%;
                    position: relative;
                }

                .side {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    transition: all 0.5s;
                    position: relative;
                    overflow: hidden;
                }

                .winner-side {
                    background: linear-gradient(135deg, rgba(0, 255, 136, 0.1), transparent);
                    border-right: 1px solid rgba(255,255,255,0.1);
                }
                
                .loser-side {
                     background: linear-gradient(225deg, rgba(255, 0, 60, 0.1), transparent);
                     border-left: 1px solid rgba(255,255,255,0.1);
                     filter: grayscale(100%);
                }

                .winner-side.revealed {
                    background: linear-gradient(135deg, rgba(0, 255, 136, 0.3), rgba(0,0,0,0.9));
                    transform: scale(1.05);
                    z-index: 2;
                    box-shadow: 0 0 100px rgba(0,255,136,0.3);
                }

                .loser-side.revealed {
                    filter: grayscale(100%) brightness(0.5);
                    transform: scale(0.95);
                }

                .team-name {
                    font-size: 5rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    text-align: center;
                    margin-bottom: 2rem;
                    text-shadow: 0 0 30px rgba(0,0,0,0.5);
                    font-family: 'Orbitron', sans-serif;
                }

                .result-icon {
                    font-size: 10rem;
                    animation: pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                
                .result-label {
                    font-size: 2rem;
                    margin-top: 1rem;
                    letter-spacing: 0.5em;
                    font-weight: bold;
                }
                
                .tick { color: #00ff88; text-shadow: 0 0 50px #00ff88; }
                .cross { color: #ff003c; text-shadow: 0 0 50px #ff003c; text-decoration: none !important; }

                .vs-divider {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 3rem;
                    font-weight: 900;
                    background: #fff;
                    color: #000;
                    padding: 1rem 2rem;
                    border-radius: 50%;
                    z-index: 10;
                    font-family: 'Orbitron', sans-serif;
                    box-shadow: 0 0 50px rgba(255,255,255,0.5);
                }

                @keyframes pop-in {
                    0% { transform: scale(0) rotate(-180deg); opacity: 0; }
                    100% { transform: scale(1) rotate(0deg); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default ResultAnnouncement;
