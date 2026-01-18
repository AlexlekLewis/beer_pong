import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';

const SetupView: React.FC = () => {
    const { teams, addTeam, removeTeam, startTournament } = useTournament();
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            addTeam(name);
            setName('');
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title"><span className="icon">🎯</span>Team Registration</h2>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <input
                        type="text"
                        className="input"
                        placeholder="Enter team name..."
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">Add Team</button>
                </div>
            </form>

            {teams.length > 0 ? (
                <>
                    <div className="team-grid">
                        {teams.map((t, i) => (
                            <div key={t.id} className="team-chip">
                                <div>
                                    <span className="number">#{String(i + 1).padStart(2, '0')}</span>
                                    <span className="name">{t.name}</span>
                                </div>
                                <button className="remove-btn" onClick={() => removeTeam(t.id)}>×</button>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-40">
                        <p className="team-count mb-20"><span>{teams.length}</span> teams registered</p>
                        <button
                            className="btn btn-success btn-large"
                            onClick={() => startTournament()}
                            disabled={teams.length < 2}
                        >
                            🚀 Launch Tournament
                        </button>
                    </div>
                </>
            ) : (
                <div className="empty-state">
                    <div className="icon">🍺</div>
                    <p>Add at least 2 teams to begin</p>
                </div>
            )}
        </div>
    );
};

export default SetupView;
