// Party Lions - Team Form Component

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useTournamentStore } from '../../lib/store';
import { parseQuickAdd } from '../../lib/import';

interface TeamFormProps {
    onSuccess?: () => void;
    mode?: 'single' | 'quick';
}

export function TeamForm({ onSuccess, mode: initialMode = 'single' }: TeamFormProps) {
    const [mode, setMode] = useState<'single' | 'quick'>(initialMode);
    const [name, setName] = useState('');
    const [player1, setPlayer1] = useState('');
    const [player2, setPlayer2] = useState('');
    const [quickInput, setQuickInput] = useState('');
    const [error, setError] = useState('');

    const { addTeam, addTeams, tournament } = useTournamentStore();

    const handleSubmitSingle = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Team name is required');
            return;
        }

        // Check for duplicate names
        if (tournament?.teams.some(t => t.name.toLowerCase() === name.trim().toLowerCase())) {
            setError('A team with this name already exists');
            return;
        }

        addTeam(name.trim(), player1.trim() || undefined, player2.trim() || undefined);

        // Reset form
        setName('');
        setPlayer1('');
        setPlayer2('');
        onSuccess?.();
    };

    const handleSubmitQuick = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const teamNames = parseQuickAdd(quickInput);

        if (teamNames.length === 0) {
            setError('Please enter at least one team name');
            return;
        }

        // Check for duplicates
        const existingNames = tournament?.teams.map(t => t.name.toLowerCase()) || [];
        const duplicates = teamNames.filter(name =>
            existingNames.includes(name.toLowerCase())
        );

        if (duplicates.length > 0) {
            setError(`Duplicate names: ${duplicates.join(', ')}`);
            return;
        }

        const newTeams = teamNames.map(n => ({ name: n }));
        addTeams(newTeams);

        setQuickInput('');
        onSuccess?.();
    };

    return (
        <motion.div
            className="glass-panel p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setMode('single')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'single'
                            ? 'bg-[var(--gold-main)] text-black'
                            : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-white'
                        }`}
                >
                    Single Team
                </button>
                <button
                    onClick={() => setMode('quick')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'quick'
                            ? 'bg-[var(--gold-main)] text-black'
                            : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-white'
                        }`}
                >
                    Quick Add
                </button>
            </div>

            {mode === 'single' ? (
                <form onSubmit={handleSubmitSingle} className="space-y-4">
                    <Input
                        label="Team Name"
                        placeholder="Enter team name..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={error}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Player 1 (Optional)"
                            placeholder="Player name..."
                            value={player1}
                            onChange={(e) => setPlayer1(e.target.value)}
                        />
                        <Input
                            label="Player 2 (Optional)"
                            placeholder="Player name..."
                            value={player2}
                            onChange={(e) => setPlayer2(e.target.value)}
                        />
                    </div>

                    <Button type="submit" variant="primary" fullWidth icon="🦁">
                        Add Team
                    </Button>
                </form>
            ) : (
                <form onSubmit={handleSubmitQuick} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                            Team Names (comma-separated)
                        </label>
                        <textarea
                            className="input min-h-[120px] resize-y"
                            placeholder="Team 1, Team 2, Team 3, ..."
                            value={quickInput}
                            onChange={(e) => setQuickInput(e.target.value)}
                        />
                        {error && (
                            <p className="mt-1 text-sm text-[var(--danger)]">{error}</p>
                        )}
                    </div>

                    <p className="text-sm text-[var(--text-muted)]">
                        💡 Tip: Enter multiple team names separated by commas
                    </p>

                    <Button type="submit" variant="primary" fullWidth icon="⚡">
                        Add All Teams
                    </Button>
                </form>
            )}
        </motion.div>
    );
}
