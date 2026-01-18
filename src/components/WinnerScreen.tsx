import React from 'react';
import type { Team } from '../types';

interface WinnerScreenProps {
    champion: Team;
    onClose: () => void;
}

const WinnerScreen: React.FC<WinnerScreenProps> = ({ champion, onClose }) => {
    const colors = ['#00ff88', '#ff00aa', '#00d4ff', '#ffaa00', '#ff3366'];

    return (
        <div className="overlay winner-overlay">
            {[...Array(60)].map((_, i) => (
                <div
                    key={i}
                    className="confetti"
                    style={{
                        left: `${Math.random() * 100}%`,
                        background: colors[Math.floor(Math.random() * colors.length)],
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${2 + Math.random() * 3}s`
                    }}
                />
            ))}
            <div className="winner-badge">🏆 CHAMPION 🏆</div>
            <div className="winner-name">{champion.name}</div>
            <div className="winner-stats">
                {champion.wins} Wins • {champion.losses} Losses
                {champion.buyBacks > 0 && ` • ${champion.buyBacks} Comebacks`}
            </div>
            <button
                className="btn btn-primary btn-large"
                onClick={onClose}
                style={{ zIndex: 10 }}
            >
                New Tournament
            </button>
        </div>
    );
};

export default WinnerScreen;
