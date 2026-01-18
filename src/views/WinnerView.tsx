import React, { useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import confetti from 'canvas-confetti';

const WinnerView: React.FC = () => {
    const { teams, resetTournament } = useTournament();
    const champion = teams.find(t => t.status === 'active');

    useEffect(() => {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="container mx-auto p-8 text-center animate-scale-in flex flex-col items-center justify-center min-h-[80vh]">
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-500 to-yellow-300 mb-8 animate-pulse drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                CHAMPION!
            </h1>

            <div className="glass-panel p-12 max-w-3xl w-full mx-auto mb-12 border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.2)]">
                <div className="text-2xl text-gray-400 mb-6 uppercase tracking-[0.5em]">The Winner Is</div>
                <div className="text-7xl md:text-9xl font-black text-white drop-shadow-[0_0_30px_rgba(255,215,0,0.8)] mb-8">
                    {champion?.name}
                </div>

                <div className="grid grid-cols-3 gap-8 mt-12 text-xl md:text-2xl text-gray-300">
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500 uppercase">Wins</span>
                        <span className="font-bold text-green-400">{champion?.wins}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500 uppercase">Losses</span>
                        <span className="font-bold text-red-400">{champion?.losses}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500 uppercase">Comebacks</span>
                        <span className="font-bold text-yellow-400">{champion?.buyBacks}</span>
                    </div>
                </div>
            </div>

            <button
                onClick={resetTournament}
                className="bg-white text-black font-bold text-xl px-8 py-3 rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.4)]"
            >
                START NEW TOURNAMENT
            </button>
        </div>
    );
};

export default WinnerView;
