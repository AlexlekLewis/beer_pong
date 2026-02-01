import { useEffect, useState, useRef } from 'react';
import { useTournamentStore } from '../../lib/store';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

export function MatchTimer() {
    const { timer, startTimer, pauseTimer, resetTimer, setTimerDuration } = useTournamentStore();
    const [displayTime, setDisplayTime] = useState(timer.remainingTime);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio
    useEffect(() => {
        audioRef.current = new Audio('/sounds/airhorn.mp3');
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Tick logic
    useEffect(() => {
        let interval: number;

        const updateTimer = () => {
            if (timer.isRunning && timer.endTime) {
                const now = Date.now();
                const remaining = timer.endTime - now;

                if (remaining <= 0) {
                    setDisplayTime(0);
                    pauseTimer(); // Stop state logic
                    // Play sound
                    if (audioRef.current) {
                        audioRef.current.currentTime = 0;
                        audioRef.current.play().catch(console.error);
                    }
                    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
                } else {
                    setDisplayTime(remaining);
                }
            } else {
                setDisplayTime(timer.remainingTime);
            }
        };

        // Run immediately
        updateTimer();

        if (timer.isRunning) {
            interval = window.setInterval(updateTimer, 100);
        }

        return () => window.clearInterval(interval);
    }, [timer.isRunning, timer.endTime, timer.remainingTime, pauseTimer]);

    const formatTime = (ms: number) => {
        const totalSeconds = Math.ceil(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const isUrgent = displayTime <= 10000 && displayTime > 0;
    const isFinished = displayTime === 0;

    return (
        <div className={`glass-panel p-6 relative overflow-hidden transition-colors duration-500 ${isUrgent ? 'border-red-500/50 bg-red-500/10' : ''}`}>

            <div className="flex flex-col items-center relative z-10">
                <div className="flex items-center gap-2 mb-4 text-[var(--text-muted)] uppercase tracking-widest text-xs font-bold">
                    <span>⏱️ Match Timer</span>
                </div>

                {/* Main Display */}
                <div className="relative mb-6">
                    <div className={`text-6xl md:text-8xl font-black font-mono tracking-wider tabular-nums transition-colors duration-300 ${isUrgent ? 'text-red-500 animate-pulse' :
                        isFinished ? 'text-red-500' : 'text-white'
                        }`}>
                        {formatTime(displayTime)}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3 mb-6">
                    {!timer.isRunning ? (
                        <Button
                            variant="primary"
                            size="lg"
                            className="w-32"
                            onClick={startTimer}
                            disabled={displayTime <= 0 && timer.remainingTime <= 0}
                        >
                            Start
                        </Button>
                    ) : (
                        <Button
                            variant="warning"
                            size="lg"
                            className="w-32"
                            onClick={pauseTimer}
                        >
                            Pause
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        size="md"
                        className="w-12 h-12 p-0 flex items-center justify-center rounded-full"
                        onClick={resetTimer}
                        title="Reset Timer"
                    >
                        🔄
                    </Button>
                </div>

                {/* Presets */}
                <div className="grid grid-cols-3 gap-2 w-full">
                    <button
                        onClick={() => setTimerDuration(30000, 'shot')}
                        className={`p-2 rounded-lg text-xs font-bold transition-all ${timer.type === 'shot'
                            ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20'
                            : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated-hover)]'
                            }`}
                    >
                        30s Shot
                    </button>
                    <button
                        onClick={() => setTimerDuration(600000, 'match')}
                        className={`p-2 rounded-lg text-xs font-bold transition-all ${timer.type === 'match'
                            ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20'
                            : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated-hover)]'
                            }`}
                    >
                        10m Match
                    </button>
                    <button
                        onClick={() => setTimerDuration(1200000, 'custom')}
                        className={`p-2 rounded-lg text-xs font-bold transition-all ${timer.type === 'custom'
                            ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20'
                            : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated-hover)]'
                            }`}
                    >
                        20m Final
                    </button>
                </div>
            </div>
        </div>
    );
}
