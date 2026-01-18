import React, { useState, useEffect } from 'react';
import type { Team } from '../types';

interface LotteryProps {
    pool: Team[];
    onSelect: (winnerId: string) => void;
    onComplete: () => void;
    winner: Team | null;
}

const Lottery: React.FC<LotteryProps> = ({ pool, onSelect, onComplete, winner }) => {
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (!done && pool.length > 0) {
            const idx = Math.floor(Math.random() * pool.length);
            // Wait for animation (3s) then select
            const timer = setTimeout(() => {
                setDone(true);
                onSelect(pool[idx].id);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [pool, done, onSelect]);

    // Create a long list for the scrolling effect
    const extendedPool = [...pool, ...pool, ...pool, ...pool, ...pool];
    const scrollEnd = -(pool.length * 2 * 60 + 30); // Approximate scroll distance calculation

    return (
        <div className="overlay">
            <h2 className="lottery-title">🎰 BUY-BACK LOTTERY 🎰</h2>
            <p className="lottery-subtitle">{pool.length} teams competing for 1 spot</p>

            <div className="lottery-wheel">
                <div
                    className="lottery-names"
                    style={{ '--scroll-end': `${scrollEnd}px` } as React.CSSProperties}
                >
                    {extendedPool.map((t, i) => (
                        <div key={`${t.id}-${i}`} className="lottery-name">
                            {t.name}
                        </div>
                    ))}
                </div>
            </div>

            {winner && (
                <>
                    <div className="lottery-result">🎉 {winner.name} IS BACK! 🎉</div>
                    <button className="btn btn-secondary btn-large" onClick={onComplete}>
                        Continue →
                    </button>
                </>
            )}
        </div>
    );
};

export default Lottery;
