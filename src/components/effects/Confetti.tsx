// Party Lions - Confetti Effect Component

import { useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
    trigger?: boolean;
    type?: 'celebration' | 'winner' | 'wildcard';
}

export function useConfetti() {
    const fire = useCallback((type: 'celebration' | 'winner' | 'wildcard' = 'celebration') => {
        const configs = {
            celebration: () => {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#ffa500', '#ff8c00', '#ffd700', '#ff4500', '#ff1493'],
                });
            },
            winner: () => {
                const duration = 3000;
                const animationEnd = Date.now() + duration;
                const defaults = {
                    startVelocity: 30,
                    spread: 360,
                    ticks: 60,
                    zIndex: 100,
                    colors: ['#00ff7f', '#ffd700', '#ff1493', '#ff4500'],
                };

                const interval: NodeJS.Timeout = setInterval(() => {
                    const timeLeft = animationEnd - Date.now();

                    if (timeLeft <= 0) {
                        return clearInterval(interval);
                    }

                    const particleCount = 50 * (timeLeft / duration);

                    confetti({
                        ...defaults,
                        particleCount,
                        origin: { x: Math.random() * 0.4 + 0.1, y: Math.random() - 0.2 },
                    });
                    confetti({
                        ...defaults,
                        particleCount,
                        origin: { x: Math.random() * 0.4 + 0.5, y: Math.random() - 0.2 },
                    });
                }, 250);
            },
            wildcard: () => {
                // Golden sparkle effect
                confetti({
                    particleCount: 50,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#ffd700', '#ffa500', '#ff8c00'],
                });
                confetti({
                    particleCount: 50,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#ffd700', '#ffa500', '#ff8c00'],
                });
            },
        };

        configs[type]?.();
    }, []);

    return { fire };
}

export function Confetti({ trigger, type = 'celebration' }: ConfettiProps) {
    const { fire } = useConfetti();

    useEffect(() => {
        if (trigger) {
            fire(type);
        }
    }, [trigger, type, fire]);

    return null;
}

// Quick confetti helpers
export function fireCelebration() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ffa500', '#ff8c00', '#ffd700', '#ff4500', '#ff1493'],
    });
}

export function fireWinnerConfetti() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 100,
        colors: ['#00ff7f', '#ffd700', '#ff1493', '#ff4500'],
    };

    const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
            ...defaults,
            particleCount,
            origin: { x: Math.random() * 0.4 + 0.1, y: Math.random() - 0.2 },
        });
        confetti({
            ...defaults,
            particleCount,
            origin: { x: Math.random() * 0.4 + 0.5, y: Math.random() - 0.2 },
        });
    }, 250);
}
