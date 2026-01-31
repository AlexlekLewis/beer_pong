import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';

// Sound effect definitions
const SOUNDS = [
    { id: 'airhorn', label: '📢 Airhorn', src: '/sounds/airhorn.mp3', color: 'bg-red-500' },
    { id: 'applause', label: '👏 Applause', src: '/sounds/applause.mp3', color: 'bg-green-500' },
    { id: 'boo', label: '👎 Boo', src: '/sounds/boo.mp3', color: 'bg-orange-500' },
    { id: 'drumroll', label: '🥁 Drumroll', src: '/sounds/drumroll.mp3', color: 'bg-blue-500' },
    { id: 'cash', label: '💰 Cash', src: '/sounds/cash.mp3', color: 'bg-[var(--gold-main)]' },
    { id: 'cricket', label: '🦗 Silence', src: '/sounds/cricket.mp3', color: 'bg-stone-500' },
];

export function Soundboard() {
    const [volume, setVolume] = useState(0.5);
    const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

    useEffect(() => {
        // Preload sounds
        SOUNDS.forEach(sound => {
            const audio = new Audio(sound.src);
            audioRefs.current[sound.id] = audio;
        });

        return () => {
            // Cleanup
            Object.values(audioRefs.current).forEach(audio => {
                audio.pause();
                audio.src = '';
            });
        };
    }, []);

    const playSound = (id: string) => {
        const audio = audioRefs.current[id];
        if (audio) {
            audio.currentTime = 0;
            audio.volume = volume;
            audio.play().catch(err => console.warn('Audio play failed:', err));

            // Add subtle vibration if supported
            if (navigator.vibrate) navigator.vibrate(50);
        }
    };

    return (
        <div className="bg-[#1b202b]/80 backdrop-blur-md rounded-xl border border-white/5 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>🔊</span> Hype Board
                </h3>

                {/* Volume Slider */}
                <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full">
                    <span className="text-xs">🔈</span>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-20 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--gold-main)]"
                    />
                    <span className="text-xs">🔊</span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SOUNDS.map((sound) => (
                    <motion.button
                        key={sound.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => playSound(sound.id)}
                        className={`
                            relative overflow-hidden group
                            h-20 rounded-xl border border-white/10 shadow-lg
                            flex flex-col items-center justify-center gap-1
                            transition-all duration-100 dark-gradient
                        `}
                    >
                        <div className={`absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity ${sound.color}`} />
                        <span className="text-2xl z-10">{sound.label.split(' ')[0]}</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-white/90 z-10">
                            {sound.label.split(' ').slice(1).join(' ')}
                        </span>

                        {/* Ripple effect overlay */}
                        <div className="absolute inset-0 bg-white/0 group-active:bg-white/10 transition-colors" />
                    </motion.button>
                ))}
            </div>

            <p className="text-xs text-[var(--text-muted)] text-center mt-4">
                Pro Tip: Connect to external speakers for maximum hype!
            </p>
        </div>
    );
}
