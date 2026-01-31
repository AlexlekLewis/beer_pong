import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTournamentStore } from '../../lib/store';

export function SaveIndicator() {
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => {
        // Subscribe to store changes to simulate "Saving"
        const unsubscribe = useTournamentStore.subscribe((state, prevState) => {
            // Primitive comparison to avoid triggering on every single selector
            if (state.tournament !== prevState.tournament) {
                setStatus('saving');

                if (timeoutRef.current) clearTimeout(timeoutRef.current);

                // Show "Saved" after a brief delay
                timeoutRef.current = setTimeout(() => {
                    setStatus('saved');

                    // Reset to idle
                    timeoutRef.current = setTimeout(() => {
                        setStatus('idle');
                    }, 2000);
                }, 600);
            }
        });

        return () => {
            unsubscribe();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <AnimatePresence>
            {status !== 'idle' && (
                <motion.div
                    className="flex items-center gap-2 text-xs font-mono fixed bottom-4 right-4 z-50 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full border border-white/10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                >
                    {status === 'saving' ? (
                        <>
                            <div className="w-2 h-2 rounded-full bg-[var(--gold-main)] animate-pulse" />
                            <span className="text-[var(--text-muted)]">Saving...</span>
                        </>
                    ) : (
                        <>
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-[var(--text-dim)]">Saved</span>
                        </>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
