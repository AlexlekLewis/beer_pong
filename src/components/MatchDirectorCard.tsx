import React from 'react';
import type { Match } from '../types';

interface MatchDirectorCardProps {
    match: Match;
    onRecordResult: (matchId: string, winnerId: string) => void;
    onReset: (matchId: string) => void;
}

const MatchDirectorCard: React.FC<MatchDirectorCardProps> = ({ match, onRecordResult, onReset }) => {
    const isCompleted = match.completed;

    return (
        <div className={`p-4 mb-3 rounded-xl border ${isCompleted ? 'bg-gray-800/50 border-gray-700' : 'bg-white/5 border-white/10'}`}>
            <div className="flex justify-between items-center gap-4">

                {/* Team 1 */}
                <div className={`flex-1 flex flex-col items-center p-3 rounded-lg transition-colors ${match.winner?.id === match.team1.id ? 'bg-green-500/20 border border-green-500/30' : 'hover:bg-white/5'}`}>
                    <span className="font-bold text-lg mb-1">{match.team1.name}</span>
                    <span className="text-xs text-gray-400 font-mono mb-2">Wins: {match.team1.wins}</span>
                    {!isCompleted && (
                        <button
                            onClick={() => onRecordResult(match.id, match.team1.id)}
                            className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-2 px-6 rounded-full transition-all shadow-lg shadow-green-900/20"
                        >
                            WINNER
                        </button>
                    )}
                </div>

                {/* VS / Status */}
                <div className="flex flex-col items-center justify-center w-12">
                    {isCompleted ? (
                        <div className="text-green-400 font-bold text-xl">✓</div>
                    ) : (
                        <div className="text-gray-600 font-black text-sm">VS</div>
                    )}
                </div>

                {/* Team 2 */}
                <div className={`flex-1 flex flex-col items-center p-3 rounded-lg transition-colors ${match.winner?.id === match.team2?.id ? 'bg-green-500/20 border border-green-500/30' : 'hover:bg-white/5'}`}>
                    <span className="font-bold text-lg mb-1">{match.team2?.name || 'Bye'}</span>
                    <span className="text-xs text-gray-400 font-mono mb-2">Wins: {match.team2?.wins || 0}</span>
                    {!isCompleted && match.team2 && (
                        <button
                            onClick={() => onRecordResult(match.id, match.team2!.id)}
                            className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-2 px-6 rounded-full transition-all shadow-lg shadow-green-900/20"
                        >
                            WINNER
                        </button>
                    )}
                </div>
            </div>

            {/* Undo Action */}
            {isCompleted && (
                <div className="mt-2 pt-2 border-t border-white/5 flex justify-end">
                    <button
                        onClick={() => onReset(match.id)}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                        Undo / Re-open
                    </button>
                </div>
            )}
        </div>
    );
};

export default MatchDirectorCard;
