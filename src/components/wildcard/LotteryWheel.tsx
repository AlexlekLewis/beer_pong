// Party Lions - Lottery Wheel Component

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Team } from '../../types';
import { calculateWheelRotation, getSegmentColor } from '../../lib/wildcard';
import { Button } from '../ui/Button';

interface LotteryWheelProps {
    teams: Team[];
    selectedIndex: number;
    onSpinComplete: () => void;
}

export function LotteryWheel({ teams, selectedIndex, onSpinComplete }: LotteryWheelProps) {
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [showResult, setShowResult] = useState(false);

    const segmentAngle = 360 / teams.length;

    const handleSpin = () => {
        if (isSpinning || teams.length === 0) return;

        setIsSpinning(true);
        setShowResult(false);

        // Calculate target rotation
        const targetRotation = calculateWheelRotation(selectedIndex, teams.length);
        setRotation(rotation + targetRotation);

        // Show result after animation
        setTimeout(() => {
            setIsSpinning(false);
            setShowResult(true);
        }, 5000);
    };

    return (
        <div className="flex flex-col items-center gap-8 py-8">
            {/* Header */}
            <div className="text-center">
                <motion.div
                    className="text-5xl mb-2"
                    animate={{ scale: isSpinning ? [1, 1.2, 1] : 1 }}
                    transition={{ repeat: isSpinning ? Infinity : 0, duration: 0.5 }}
                >
                    🎰
                </motion.div>
                <h2 className="text-3xl font-bold text-white tracking-wider">
                    WILDCARD LOTTERY
                </h2>
                <p className="text-[var(--text-muted)] mt-2">
                    We need ONE more team to even out the bracket!
                </p>
            </div>

            {/* Wheel Container */}
            <div className="relative">
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 text-4xl drop-shadow-lg">
                    ▼
                </div>

                {/* Wheel */}
                <motion.div
                    className="relative w-72 h-72 rounded-full border-4 border-[var(--gold-main)] shadow-[0_0_40px_var(--gold-glow)] overflow-hidden"
                    animate={{ rotate: rotation }}
                    transition={{
                        duration: 5,
                        ease: [0.2, 0.8, 0.2, 1], // Custom easing for dramatic slowdown
                    }}
                >
                    {teams.map((team, index) => (
                        <div
                            key={team.id}
                            className="absolute w-full h-full"
                            style={{
                                transform: `rotate(${index * segmentAngle}deg)`,
                            }}
                        >
                            <div
                                className="absolute top-0 left-1/2 h-1/2 origin-bottom flex items-start justify-center text-xs font-bold text-white px-1 pt-4"
                                style={{
                                    width: `${Math.max(60, segmentAngle * 2)}px`,
                                    transform: 'translateX(-50%)',
                                    clipPath: `polygon(50% 100%, 0 0, 100% 0)`,
                                    background: getSegmentColor(index, teams.length),
                                }}
                            >
                                <span className="text-center leading-tight truncate max-w-[50px] rotate-0">
                                    {team.name.slice(0, 8)}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Center Circle */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-[var(--bg-dark)] border-4 border-[var(--gold-main)] flex items-center justify-center shadow-lg">
                            <span className="text-2xl">🦁</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Result Display */}
            {showResult && teams[selectedIndex] && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', damping: 10 }}
                    className="text-center"
                >
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-2xl font-bold text-[var(--gold-main)] mb-2">
                        WILDCARD WINNER!
                    </h3>
                    <div className="bg-[var(--bg-card)] border border-[var(--gold-main)] rounded-xl p-6 shadow-[0_0_30px_var(--gold-glow)]">
                        <p className="text-3xl font-bold text-white tracking-wide">
                            {teams[selectedIndex].name}
                        </p>
                        <p className="text-[var(--text-muted)] mt-2">
                            Gets a FREE pass to the next round! 🆓
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Spin Button */}
            {!showResult && (
                <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSpin}
                    disabled={isSpinning || teams.length === 0}
                    className="animate-pulse-glow"
                    icon={isSpinning ? '🔄' : '🔥'}
                >
                    {isSpinning ? 'SPINNING...' : 'SPIN IT!'}
                </Button>
            )}

            {/* Confirm Button */}
            {showResult && (
                <Button
                    variant="success"
                    size="lg"
                    onClick={onSpinComplete}
                    icon="🦁"
                >
                    CONTINUE TO NEXT ROUND
                </Button>
            )}
        </div>
    );
}
