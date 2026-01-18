import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { TeamCard } from '../components/TeamCard';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';

export const SetupView: React.FC = () => {
    const { teams, addTeam, removeTeam, startTournament } = useTournament();
    const [newTeamName, setNewTeamName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTeamName.trim()) {
            addTeam(newTeamName.trim());
            setNewTeamName('');
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
            {/* Hero Text */}
            <div className="text-center mb-12 animate-fade-in">
                <h2 className="text-6xl font-black font-orbitron mb-4 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                    INSERT SQUAD
                </h2>
                <div className="text-xl text-accent font-rajdhani tracking-[0.5em] uppercase">
                    Registration Phase
                </div>
            </div>

            {/* Registration Deck */}
            <Card className="w-full glass-panel-strong p-8 mb-8 transform hover:scale-[1.01] transition-transform duration-500">
                <div className="mb-8">
                    <form onSubmit={handleSubmit} className="flex gap-4">
                        <Input
                            placeholder="ENTER TEAM NAME..."
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                            className="bg-black/30 text-2xl"
                            autoFocus
                        />
                        <Button type="submit" variant="secondary" disabled={!newTeamName.trim()} className="shrink-0">
                            ADD
                        </Button>
                    </form>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {teams.length === 0 ? (
                        <div className="text-center py-12 text-white/20 font-rajdhani text-2xl uppercase tracking-widest border-2 border-dashed border-white/10 rounded-lg">
                            Waiting for Challengers...
                        </div>
                    ) : (
                        teams.map((team) => (
                            <div key={team.id} className="animate-slide-in">
                                <TeamCard team={team} onRemove={() => removeTeam(team.id)} />
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-8 pt-4 border-t border-white/10 flex justify-between items-center text-sm text-text-dim font-mono">
                    <span>REGISTERED: {teams.length}</span>
                    <span>MIN REQUIRED: 2</span>
                </div>
            </Card>

            {/* Large Launch Button */}
            <div className="w-full transform transition-all duration-300 hover:scale-105">
                <Button
                    onClick={startTournament}
                    disabled={teams.length < 2}
                    size="lg"
                    variant="primary"
                    className="w-full text-2xl py-6 shadow-[0_0_50px_var(--primary-glow)] hover:shadow-[0_0_80px_var(--primary-glow)]"
                >
                    INITIALIZE TOURNAMENT SEQUENCE
                </Button>
            </div>
        </div>
    );
};
