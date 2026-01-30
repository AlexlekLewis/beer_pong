// Party Lions - Home Page

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useTournamentStore } from '../lib/store';

export function HomePage() {
    const [showNewModal, setShowNewModal] = useState(false);
    const [showLoadModal, setShowLoadModal] = useState(false);
    const [tournamentName, setTournamentName] = useState('');
    const [importJson, setImportJson] = useState('');
    const [importError, setImportError] = useState('');

    const { createTournament, importTournament, tournament, setView } = useTournamentStore();

    const handleCreate = () => {
        if (!tournamentName.trim()) return;
        createTournament(tournamentName.trim());
        setShowNewModal(false);
        setTournamentName('');
    };

    const handleImport = () => {
        setImportError('');
        const success = importTournament(importJson);
        if (success) {
            setShowLoadModal(false);
            setImportJson('');
        } else {
            setImportError('Invalid tournament data. Please check the JSON format.');
        }
    };

    const handleContinue = () => {
        if (tournament) {
            if (tournament.status === 'setup') {
                setView('setup');
            } else {
                setView('tournament');
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
            {/* Logo & Title */}
            <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <motion.div
                    className="text-8xl mb-4"
                    animate={{
                        rotate: [0, -5, 5, -5, 0],
                        scale: [1, 1.05, 1],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3
                    }}
                >
                    🦁
                </motion.div>
                <h1 className="text-5xl md:text-6xl font-bold text-white tracking-wider mb-2 animate-text-glow">
                    PARTY LIONS
                </h1>
                <p className="text-xl text-[var(--gold-main)] tracking-widest">
                    Beer Pong Championship
                </p>
                <p className="text-sm text-[var(--text-muted)] mt-2 italic">
                    "Unleash the Beast. Sink the Cup."
                </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
                className="w-full max-w-sm space-y-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => setShowNewModal(true)}
                    icon="🍺"
                    className="animate-pulse-glow"
                >
                    NEW TOURNAMENT
                </Button>

                {tournament && (
                    <Button
                        variant="buyback"
                        size="lg"
                        fullWidth
                        onClick={handleContinue}
                        icon="▶️"
                    >
                        CONTINUE: {tournament.name}
                    </Button>
                )}

                <Button
                    variant="ghost"
                    size="lg"
                    fullWidth
                    onClick={() => setShowLoadModal(true)}
                    icon="📂"
                >
                    LOAD TOURNAMENT
                </Button>
            </motion.div>

            {/* Beer emojis decoration */}
            <motion.div
                className="flex gap-4 mt-12 text-4xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 0.5 }}
            >
                🍻 🏓 🍺 🎯 🍻
            </motion.div>

            {/* New Tournament Modal */}
            <Modal
                isOpen={showNewModal}
                onClose={() => setShowNewModal(false)}
                title="🦁 NEW TOURNAMENT"
                size="sm"
            >
                <div className="space-y-4">
                    <Input
                        label="Tournament Name"
                        placeholder="e.g., Friday Night Pong Wars"
                        value={tournamentName}
                        onChange={(e) => setTournamentName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    />

                    <div className="flex gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setShowNewModal(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleCreate}
                            disabled={!tournamentName.trim()}
                            className="flex-1"
                            icon="🔥"
                        >
                            Create
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Load Tournament Modal */}
            <Modal
                isOpen={showLoadModal}
                onClose={() => setShowLoadModal(false)}
                title="📂 LOAD TOURNAMENT"
                size="md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                            Paste Tournament JSON
                        </label>
                        <textarea
                            className="input min-h-[150px] font-mono text-sm"
                            placeholder='{"id": "...", "name": "...", ...}'
                            value={importJson}
                            onChange={(e) => setImportJson(e.target.value)}
                        />
                        {importError && (
                            <p className="mt-2 text-sm text-[var(--danger)]">{importError}</p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setShowLoadModal(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleImport}
                            disabled={!importJson.trim()}
                            className="flex-1"
                            icon="📥"
                        >
                            Import
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
