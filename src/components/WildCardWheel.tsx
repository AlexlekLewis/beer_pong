import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Button } from './Button';
import type { Team } from '../types';

interface WildCardWheelProps {
    candidates: Team[];
    onComplete: (winner: Team) => void;
}

export const WildCardWheel: React.FC<WildCardWheelProps> = ({ candidates, onComplete }) => {
    const [spinning, setSpinning] = useState(false);
    const [winner, setWinner] = useState<Team | null>(null);
    const wheelRef = useRef<HTMLDivElement>(null);

    const spinWheel = () => {
        if (spinning || candidates.length === 0) return;

        setSpinning(true);

        // Randomly select winner
        const randomIndex = Math.floor(Math.random() * candidates.length);
        const selectedWinner = candidates[randomIndex];

        // Calculate rotation
        // 360 degrees / count = segment size
        // We want to land on the winner.
        // Let's just simulate a spin for 3-4 seconds then snap to winner or show modal.
        // For a visual wheel, we need to know the angles. 
        // Simpler "Digital" Approach: Rapidly cycling names or a horizontal ticker?
        // User asked for a "Wheel". Let's try a CSS Conic Gradient Wheel.

        const spinDuration = 4000; // ms
        const rotations = 5; // minimum full spins
        const segmentAngle = 360 / candidates.length;

        // Target angle to land on the winner (center of segment)
        // Ensure the winner's segment is at the top (pointer) or right.
        // Let's assume pointer is at Top (0deg/360deg).
        // If segment 0 is 0-X deg, segment 1 is X-2X deg.
        // To land on index i, we need to rotate so that index i is at top.
        // Rotation = - (i * segmentAngle + segmentAngle/2)
        // Add full rotations: - (360 * rotations + targetAngle)

        const targetAngle = randomIndex * segmentAngle + (segmentAngle / 2);
        // We want this angle to be at 0 (Top).
        // Current position 0. We rotate the wheel.
        // Final Rotation should be such that (FinalRotation % 360) + targetAngle = 0 (or 360)?
        // Actually: Rotation = (360 * rotations) + (360 - targetAngle);

        const finalRotation = (360 * rotations) + (360 - targetAngle);

        if (wheelRef.current) {
            wheelRef.current.style.transition = `transform ${spinDuration}ms cubic-bezier(0.1, 0, 0.2, 1)`;
            wheelRef.current.style.transform = `rotate(${finalRotation}deg)`;
        }

        setTimeout(() => {
            setWinner(selectedWinner);
            setSpinning(false);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#FFA500', '#FF4500']
            });
        }, spinDuration + 500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="flex flex-col items-center gap-8 max-w-2xl w-full p-4">
                <h2 className="text-4xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-[0_0_15px_rgba(255,165,0,0.5)] uppercase text-center animate-pulse">
                    Wild Card Spin
                </h2>

                {!winner ? (
                    <div className="relative">
                        {/* Pointer */}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-white drop-shadow-lg" />

                        {/* Wheel Container */}
                        <div
                            ref={wheelRef}
                            className="w-[400px] h-[400px] rounded-full border-4 border-white/20 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                            style={{
                                background: `conic-gradient(${candidates.map((c, i) => {
                                    const start = (i / candidates.length) * 100;
                                    const end = ((i + 1) / candidates.length) * 100;
                                    // Alternate Colors
                                    const color = i % 2 === 0 ? '#1a1a1a' : '#333333';
                                    return `${color} ${start}% ${end}%`;
                                }).join(', ')
                                    })`
                            }}
                        >
                            {candidates.map((c, i) => {
                                const angle = (360 / candidates.length) * i + (360 / candidates.length) / 2;
                                return (
                                    <div
                                        key={c.id}
                                        className="absolute top-1/2 left-1/2 w-full h-[1px] origin-left flex items-center"
                                        style={{ transform: `rotate(${angle - 90}deg)` }}
                                    >
                                        <div className="pl-[60px] text-white font-bold font-rajdhani uppercase tracking-wider text-lg truncate w-[180px] text-right" style={{ transform: 'rotate(90deg)' }}>
                                            {c.name}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="text-center space-y-6 animate-scale-in">
                        <div className="text-2xl text-text-dim font-rajdhani uppercase">The wildcard entry is</div>
                        <div className="text-6xl font-black font-orbitron text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]">
                            {winner.name}
                        </div>
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={() => onComplete(winner)}
                            className="mt-8 animate-bounce"
                        >
                            PROCEED TO NEXT ROUND &rarr;
                        </Button>
                    </div>
                )}

                {!winner && (
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={spinWheel}
                        disabled={spinning}
                        className="min-w-[200px] text-xl py-6 shadow-[0_0_30px_var(--primary-glow)]"
                    >
                        {spinning ? 'SPINNING...' : 'SPIN THE WHEEL'}
                    </Button>
                )}
            </div>
        </div>
    );
};
