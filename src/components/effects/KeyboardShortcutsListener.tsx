import { useEffect } from 'react';
import { useTournamentStore } from '../../lib/store';

export function KeyboardShortcutsListener() {
    const { undoLastMatch } = useTournamentStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if input is focused
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            // Undo: Cmd+Z or Ctrl+Z
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                e.preventDefault();
                undoLastMatch();
            }

            // Space: Pause/Play (Placeholder for now)
            if (e.key === ' ' && e.code === 'Space') {
                // e.preventDefault(); // Prevent scrolling
                // togglePause(); // TODO: Implement pause in store if needed
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undoLastMatch]);

    return null;
}
