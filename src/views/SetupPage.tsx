// Party Lions - Setup Page (Team Entry)

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { TeamList } from '../components/team/TeamCard';
import { TeamForm } from '../components/team/TeamForm';
import { TeamImport } from '../components/team/TeamImport';
import { useTournamentStore } from '../lib/store';
import type { Team } from '../types';

export function SetupPage() {
    const [showAddForm, setShowAddForm] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [editName, setEditName] = useState('');
    const [editPlayer1, setEditPlayer1] = useState('');
    const [editPlayer2, setEditPlayer2] = useState('');
    const [newTournamentName, setNewTournamentName] = useState('');

    const {
        tournament,
        shuffleTeams,
        startTournament,
        removeTeam,
        updateTeam,
        renameTournament,
        exportTournament,
        setView,
        resetTournament
    } = useTournamentStore();

    if (!tournament) {
        return null;
    }

    const handleEdit = (team: Team) => {
        setEditingTeam(team);
        setEditName(team.name);
        setEditPlayer1(team.player1 || '');
        setEditPlayer2(team.player2 || '');
        setShowEditModal(true);
    };

    const handleSaveEdit = () => {
        if (editingTeam && editName.trim()) {
            updateTeam(editingTeam.id, {
                name: editName.trim(),
                player1: editPlayer1.trim() || undefined,
                player2: editPlayer2.trim() || undefined,
            });
            setShowEditModal(false);
            setEditingTeam(null);
        }
    };

    const handleDelete = (team: Team) => {
        if (confirm(`Remove "${team.name}" from the tournament?`)) {
            removeTeam(team.id);
        }
    };

    const handleStart = () => {
        if (tournament.teams.length >= 2) {
            startTournament();
        }
    };

    const canStart = tournament.teams.length >= 2;
    const teamCount = tournament.teams.length;

    return (
        <div className="min-h-screen p-4 md:p-8">
            {/* Header */}
            <motion.div
                className="flex items-center justify-between mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setView('home')}
                        className="text-[var(--text-muted)] hover:text-white transition-colors text-2xl"
                    >
                        ←
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wider">
                            TEAM ROSTER
                        </h1>
                        <p className="text-[var(--text-muted)]">
                            {tournament.name}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setNewTournamentName(tournament?.name || '');
                            setShowSaveModal(true);
                        }}
                        icon="💾"
                    >
                        Save
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setView('dashboard')}
                        icon="⚙️"
                    >
                        Settings
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowImport(true)}
                        icon="📤"
                    >
                        Import
                    </Button>
                </div>
            </motion.div>

            <div className="max-w-3xl mx-auto">
                {/* Add Team Section */}
                <AnimatePresence mode="wait">
                    {showAddForm ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6"
                        >
                            <TeamForm onSuccess={() => { }} />
                            <Button
                                variant="ghost"
                                fullWidth
                                className="mt-3"
                                onClick={() => setShowAddForm(false)}
                            >
                                Done Adding
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="button"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="mb-6"
                        >
                            <Button
                                variant="primary"
                                fullWidth
                                size="lg"
                                onClick={() => setShowAddForm(true)}
                                icon="➕"
                            >
                                ADD TEAM
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Team Count & Actions */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-white">
                            TEAMS ({teamCount})
                        </h2>
                        {teamCount > 0 && (
                            <span className={`text-sm px-2 py-1 rounded ${teamCount >= 2
                                ? 'bg-[var(--success)]/20 text-[var(--success)]'
                                : 'bg-[var(--warning)]/20 text-[var(--warning)]'
                                }`}>
                                {teamCount < 2
                                    ? 'Need at least 2 teams'
                                    : `Ready for ${Math.pow(2, Math.ceil(Math.log2(teamCount)))}-team bracket`
                                }
                            </span>
                        )}
                    </div>

                    {teamCount > 1 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={shuffleTeams}
                            icon="🔀"
                        >
                            Shuffle
                        </Button>
                    )}
                </div>

                {/* Team List */}
                <TeamList
                    teams={tournament.teams}
                    showActions
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    emptyMessage="No teams yet. Add teams to get started!"
                />

                {/* Start Tournament Button */}
                {teamCount > 0 && (
                    <motion.div
                        className="mt-8 space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            disabled={!canStart}
                            onClick={handleStart}
                            className={canStart ? 'animate-pulse-glow' : ''}
                            icon="🔥"
                        >
                            START TOURNAMENT
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            fullWidth
                            onClick={() => {
                                if (confirm('Reset tournament? This will delete all teams.')) {
                                    resetTournament();
                                }
                            }}
                        >
                            Cancel Tournament
                        </Button>
                    </motion.div>
                )}
            </div>

            {/* Import Modal */}
            <Modal
                isOpen={showImport}
                onClose={() => setShowImport(false)}
                title="📊 IMPORT TEAMS"
                size="md"
            >
                <TeamImport
                    onSuccess={() => setShowImport(false)}
                    onCancel={() => setShowImport(false)}
                />
            </Modal>

            {/* Edit Team Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="✏️ EDIT TEAM"
                size="sm"
            >
                <div className="space-y-4">
                    <Input
                        label="Team Name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Player 1"
                            value={editPlayer1}
                            onChange={(e) => setEditPlayer1(e.target.value)}
                        />
                        <Input
                            label="Player 2"
                            value={editPlayer2}
                            onChange={(e) => setEditPlayer2(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setShowEditModal(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSaveEdit}
                            disabled={!editName.trim()}
                            className="flex-1"
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Save Tournament Modal */}
            <Modal
                isOpen={showSaveModal}
                onClose={() => setShowSaveModal(false)}
                title="💾 SAVE TOURNAMENT"
                size="sm"
            >
                <div className="space-y-4">
                    <Input
                        label="Tournament Name"
                        value={newTournamentName}
                        onChange={(e) => setNewTournamentName(e.target.value)}
                        placeholder={tournament?.name}
                    />
                    <div className="flex gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                if (newTournamentName.trim()) {
                                    renameTournament(newTournamentName.trim());
                                }
                                setShowSaveModal(false);
                                setNewTournamentName('');
                            }}
                            className="flex-1"
                        >
                            {newTournamentName.trim() ? 'Save Name' : 'Cancel'}
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => {
                                if (newTournamentName.trim()) {
                                    renameTournament(newTournamentName.trim());
                                }
                                const data = exportTournament();
                                const blob = new Blob([data], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${(newTournamentName.trim() || tournament?.name || 'tournament').replace(/\s+/g, '_')}.json`;
                                a.click();
                                URL.revokeObjectURL(url);
                                setShowSaveModal(false);
                                setNewTournamentName('');
                            }}
                            icon="💾"
                            className="flex-1"
                        >
                            Download Backup
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
