import React, { useState } from 'react';
import type { Team } from '../types';

interface LotteryWheelProps {
    candidates: Team[];
    onComplete: (winnerId: string) => void;
}

const LotteryWheel: React.FC<LotteryWheelProps> = ({ candidates, onComplete }) => {
    const [spinning, setSpinning] = useState(false);
    const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0);

    const handleSpin = () => {
        setSpinning(true);
        // Spin logic
        // We simulate a spin by cycling rapidly through candidates
        let speed = 50;
        let cycles = 0;
        const maxCycles = 30; // Total steps

        // Predetermine winner for deterministic end or just random end?
        // Let's pick winner now
        const winnerIndex = Math.floor(Math.random() * candidates.length);
        const winner = candidates[winnerIndex];

        const spinInterval = () => {
            setCurrentCandidateIndex(prev => (prev + 1) % candidates.length);
            cycles++;

            if (cycles < maxCycles) {
                // Slow down
                if (cycles > maxCycles - 10) speed += 30;
                setTimeout(spinInterval, speed);
            } else {
                // Stop at winner
                setCurrentCandidateIndex(winnerIndex);
                setSpinning(false);
                setTimeout(() => onComplete(winner.id), 1000); // Wait 1s then confirm
            }
        };

        spinInterval();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel p-12 text-center max-w-lg w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-secondary/10 opacity-20 animate-pulse"></div>

                <h2 className="text-4xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">
                    LOTTERY TIME!
                </h2>

                <div className="mb-12 h-32 flex items-center justify-center relative">
                    <div className="text-5xl font-bold text-white transition-all duration-100 scale-125">
                        {candidates[currentCandidateIndex].name}
                    </div>
                    {/* Tick indicator */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-t-[20px] border-t-yellow-500 border-r-[10px] border-r-transparent"></div>
                </div>

                {!spinning ? (
                    <button
                        onClick={handleSpin}
                        className="bg-gradient-to-r from-yellow-500 to-purple-600 text-white font-bold text-2xl px-12 py-4 rounded-full shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:scale-105 active:scale-95 transition-transform"
                    >
                        SPIN THE WHEEL
                    </button>
                ) : (
                    <div className="text-yellow-400 font-bold animate-pulse text-lg">SPINNING...</div>
                )}

                <div className="mt-8 text-sm text-gray-500">
                    {candidates.length} Teams in Buy-Back Pool
                </div>
            </div>
        </div>
    );
};

export default LotteryWheel;
