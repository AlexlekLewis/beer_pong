import React from 'react';
import type { Match } from '../types';

interface BracketNodeProps {
    match: Match;
    x: number;
    y: number;
    width: number;
    height: number;
    onClick?: () => void;
}

const BracketNode: React.FC<BracketNodeProps> = ({ match, x, y, width, height, onClick }) => {
    const { team1, team2, winner, completed } = match;

    // Helper to determine status color
    const getStatusColor = (teamId: string) => {
        if (!completed) return 'text-[var(--text-main)]';
        return winner?.id === teamId ? 'text-[var(--success)] font-bold' : 'text-[var(--text-light)]';
    };

    const getScoreDisplay = (teamId: string) => {
        if (!completed) return '-';
        return winner?.id === teamId ? '1' : '0'; // Binary score for beer pong typically
    };

    return (
        <div
            className="absolute flex flex-col justify-center bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-[var(--primary)] transition-all cursor-pointer group z-10"
            style={{
                left: x,
                top: y,
                width: width,
                height: height
            }}
            onClick={onClick}
        >
            {/* Team 1 */}
            <div className={`flex justify-between items-center px-4 py-2 border-b border-gray-100 ${winner?.id === team1.id ? 'bg-[var(--success)]/5 rounded-t-xl' : ''}`}>
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white
                        ${winner?.id === team1.id ? 'bg-[var(--success)]' : 'bg-gray-300'}
                    `}>
                        {team1.name.charAt(0).toUpperCase()}
                    </div>
                    <span className={`text-sm truncate ${getStatusColor(team1.id)}`}>{team1.name}</span>
                </div>
                <span className={`text-sm ${getStatusColor(team1.id)}`}>{getScoreDisplay(team1.id)}</span>
            </div>

            {/* Team 2 */}
            <div className={`flex justify-between items-center px-4 py-2 ${winner?.id === team2.id ? 'bg-[var(--success)]/5 rounded-b-xl' : ''}`}>
                <div className="flex items-center gap-2 overflow-hidden">
                    {team2 ? (
                        <>
                            <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white
                                ${winner?.id === team2.id ? 'bg-[var(--success)]' : 'bg-gray-300'}
                            `}>
                                {team2.name.charAt(0).toUpperCase()}
                            </div>
                            <span className={`text-sm truncate ${getStatusColor(team2.id)}`}>{team2.name}</span>
                        </>
                    ) : (
                        <span className="text-sm text-[var(--text-light)] italic">Waiting...</span>
                    )}
                </div>
                {team2 && <span className={`text-sm ${getStatusColor(team2.id)}`}>{getScoreDisplay(team2.id)}</span>}
            </div>

            {/* Hover Indicator */}
            <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-2 h-2 bg-[var(--primary)] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
    );
};

export default BracketNode;
