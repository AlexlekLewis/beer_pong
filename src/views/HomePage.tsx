// Party Lions - Home Page

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useTournamentStore } from '../lib/store';
import { importSpreadsheet } from '../lib/import';

export function HomePage() {
    const [showNewModal, setShowNewModal] = useState(false);
    const [showLoadModal, setShowLoadModal] = useState(false);
    const [loadMode, setLoadMode] = useState<'teams' | 'tournament'>('teams');
    const [tournamentName, setTournamentName] = useState('');
    const [importJson, setImportJson] = useState('');
    const [importError, setImportError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { createTournament, importTournament, addTeams, tournament, setView } = useTournamentStore();

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

    const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImportError('');

        try {
            const result = await importSpreadsheet(file);
            if (result.success && result.teams.length > 0) {
                // If no tournament exists, create one first
                if (!tournament) {
                    createTournament(file.name.replace(/\.[^/.]+$/, '') || 'Imported Tournament');
                }
                addTeams(result.teams);
                setShowLoadModal(false);
                setView('setup');
            } else {
                setImportError(result.errors.join('\n') || 'No teams found in file');
            }
        } catch (err) {
            setImportError('Failed to read file');
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-beerpong-main bg-overlay-dark">
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
                onClose={() => { setShowLoadModal(false); setLoadMode('teams'); setImportJson(''); setImportError(''); }}
                title="📂 LOAD DATA"
                size="3xl"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column - Import Teams */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-[var(--gold-main)] flex items-center gap-2">
                            📊 Import Teams
                        </h3>

                        <div
                            className="border-2 border-dashed border-[var(--border)] rounded-xl p-6 text-center hover:border-[var(--gold-main)] transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.xlsx,.xls,.tsv"
                                onChange={handleFileImport}
                                className="hidden"
                            />
                            <div className="text-3xl mb-2">📁</div>
                            <p className="text-white font-medium mb-1">Click to upload teams file</p>
                            <p className="text-sm text-[var(--text-muted)]">
                                Supports: CSV, XLSX, XLS, TSV
                            </p>
                        </div>

                        <div className="p-3 bg-[var(--bg-elevated)] rounded-lg text-sm">
                            <h4 className="font-medium text-white mb-2">Expected format:</h4>
                            <div className="text-[var(--text-dim)] space-y-1">
                                <div className="grid grid-cols-3 gap-2 text-xs text-[var(--text-muted)] font-medium">
                                    <span>Team Name</span>
                                    <span>Player 1</span>
                                    <span>Player 2</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                    <span>Beer Wolves</span>
                                    <span>John</span>
                                    <span>Jane</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-[var(--border)]" />

                    {/* Right Column - Restore Backup */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-[var(--gold-main)] flex items-center gap-2">
                            💾 Restore Backup
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                                Paste Tournament Backup JSON
                            </label>
                            <textarea
                                className="input min-h-[120px] font-mono text-sm"
                                placeholder='{"id": "...", "name": "...", ...}'
                                value={importJson}
                                onChange={(e) => setImportJson(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={handleImport}
                            disabled={!importJson.trim()}
                            icon="📥"
                        >
                            Restore Tournament
                        </Button>
                    </div>
                </div>

                {importError && (
                    <p className="text-sm text-[var(--danger)] mt-4">{importError}</p>
                )}

                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    <Button
                        variant="ghost"
                        fullWidth
                        onClick={() => setShowLoadModal(false)}
                    >
                        Cancel
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
