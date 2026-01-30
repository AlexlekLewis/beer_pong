// Party Lions - Team Import Component (CSV/XLSX)

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { useTournamentStore } from '../../lib/store';
import { importSpreadsheet, getAcceptedFileTypes, isValidFileType } from '../../lib/import';
import type { ImportResult } from '../../types';

interface TeamImportProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function TeamImport({ onSuccess, onCancel }: TeamImportProps) {
    const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<ImportResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { addTeams } = useTournamentStore();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError('');

        if (!isValidFileType(file)) {
            setError('Invalid file type. Please upload a CSV, XLSX, XLS, or TSV file.');
            return;
        }

        setLoading(true);

        try {
            const importResult = await importSpreadsheet(file);
            setResult(importResult);

            if (importResult.success && importResult.teams.length > 0) {
                setStep('preview');
            } else {
                setError(importResult.errors.join('\n') || 'No teams found in file');
            }
        } catch (err) {
            setError('Failed to read file');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmImport = () => {
        if (!result?.teams) return;

        addTeams(result.teams);
        setStep('done');

        setTimeout(() => {
            onSuccess?.();
        }, 1500);
    };

    const handleReset = () => {
        setStep('upload');
        setResult(null);
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <motion.div
            className="glass-panel p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <AnimatePresence mode="wait">
                {step === 'upload' && (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="text-center mb-6">
                            <div className="text-4xl mb-2">📊</div>
                            <h3 className="text-lg font-bold text-white">Import Teams</h3>
                            <p className="text-sm text-[var(--text-muted)]">
                                Upload a CSV or Excel file with team names
                            </p>
                        </div>

                        <div
                            className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center hover:border-[var(--gold-main)] transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={getAcceptedFileTypes()}
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            {loading ? (
                                <div className="animate-pulse">
                                    <div className="text-3xl mb-2">⏳</div>
                                    <p className="text-[var(--text-muted)]">Reading file...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="text-3xl mb-2">📁</div>
                                    <p className="text-white font-medium mb-1">Click to upload</p>
                                    <p className="text-sm text-[var(--text-muted)]">
                                        CSV, XLSX, XLS, or TSV
                                    </p>
                                </>
                            )}
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-4 bg-[var(--danger)]/10 border border-[var(--danger)] rounded-lg text-[var(--danger)] text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="mt-6 p-4 bg-[var(--bg-elevated)] rounded-lg">
                            <h4 className="text-sm font-medium text-white mb-2">Expected format:</h4>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-[var(--text-muted)]">
                                        <th className="text-left pb-2">Team Name</th>
                                        <th className="text-left pb-2">Player 1</th>
                                        <th className="text-left pb-2">Player 2</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[var(--text-dim)]">
                                    <tr>
                                        <td>Beer Wolves</td>
                                        <td>John</td>
                                        <td>Jane</td>
                                    </tr>
                                    <tr>
                                        <td>Cup Crushers</td>
                                        <td>Mike</td>
                                        <td>Sarah</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {onCancel && (
                            <Button variant="ghost" fullWidth className="mt-4" onClick={onCancel}>
                                Cancel
                            </Button>
                        )}
                    </motion.div>
                )}

                {step === 'preview' && result && (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="text-center mb-6">
                            <div className="text-4xl mb-2">✅</div>
                            <h3 className="text-lg font-bold text-white">
                                Found {result.teams.length} Teams
                            </h3>
                        </div>

                        {/* Warnings */}
                        {result.errors.length > 0 && (
                            <div className="mb-4 p-3 bg-[var(--warning)]/10 border border-[var(--warning)] rounded-lg text-sm text-[var(--warning)]">
                                ⚠️ {result.errors.length} warning(s):
                                <ul className="mt-1 list-disc list-inside">
                                    {result.errors.slice(0, 3).map((err, i) => (
                                        <li key={i}>{err}</li>
                                    ))}
                                    {result.errors.length > 3 && (
                                        <li>...and {result.errors.length - 3} more</li>
                                    )}
                                </ul>
                            </div>
                        )}

                        {/* Preview List */}
                        <div className="max-h-[300px] overflow-y-auto mb-6 space-y-2">
                            {result.teams.map((team, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 p-3 bg-[var(--bg-elevated)] rounded-lg"
                                >
                                    <span className="w-6 h-6 flex items-center justify-center bg-[var(--bg-card)] rounded text-sm text-[var(--text-muted)]">
                                        {i + 1}
                                    </span>
                                    <div className="flex-1">
                                        <div className="font-medium text-white">{team.name}</div>
                                        {(team.player1 || team.player2) && (
                                            <div className="text-sm text-[var(--text-muted)]">
                                                {[team.player1, team.player2].filter(Boolean).join(' & ')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={handleReset} className="flex-1">
                                Back
                            </Button>
                            <Button variant="primary" onClick={handleConfirmImport} className="flex-1" icon="🦁">
                                Import All
                            </Button>
                        </div>
                    </motion.div>
                )}

                {step === 'done' && (
                    <motion.div
                        key="done"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-8"
                    >
                        <motion.div
                            className="text-6xl mb-4"
                            initial={{ rotate: -20 }}
                            animate={{ rotate: 0 }}
                            transition={{ type: 'spring', damping: 10 }}
                        >
                            🎉
                        </motion.div>
                        <h3 className="text-xl font-bold text-white">
                            {result?.teams.length} Teams Imported!
                        </h3>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
