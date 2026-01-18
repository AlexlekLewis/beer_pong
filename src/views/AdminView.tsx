import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import MatchDirectorCard from '../components/MatchDirectorCard';
import type { Team } from '../types';

const AdminView: React.FC = () => {
    const {
        matches,
        currentRound,
        teams,
        recordMatchResult,
        nextRound,
        buyBackTeam,
        resetTournament,
        getBuyBackCost,
        forceUpdateTeam,
        resetMatch
    } = useTournament();

    const [activeTab, setActiveTab] = useState<'live' | 'god'>('live');

    // --- LIVE DATA ---
    const roundMatches = matches.filter(m => m.round === currentRound);
    const pendingMatches = roundMatches.filter(m => !m.completed && !m.isBye);
    const completedMatches = roundMatches.filter(m => m.completed); // Includes byes if we want, or filter out
    const isRoundComplete = roundMatches.length > 0 && roundMatches.every(m => m.completed);

    // Logic for next step
    const active = teams.filter(t => t.status === 'active');
    const eliminated = teams.filter(t => t.status === 'eliminated');
    const pendingBuyback = teams.filter(t => t.status === 'buyback-pending');

    // --- GOD MODE STATE ---
    // We don't need local state for editing if we just commit on blur/enter? 
    // Or we keep a "working copy"? For speed, let's commit on change or blur.

    const handleStatChange = (id: string, field: keyof Team, value: number) => {
        forceUpdateTeam(id, { [field]: value });
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 10px' }}>

            {/* HEADER & TABS */}
            <div className="flex justify-between items-center mb-6 pt-4">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                    Director Mode <span className="text-sm font-mono text-gray-500">v2.0</span>
                </h1>

                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('live')}
                        className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'live' ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                        ⚡ Live Ops
                    </button>
                    <button
                        onClick={() => setActiveTab('god')}
                        className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'god' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-purple-900/40'}`}
                    >
                        👁️ God Mode
                    </button>
                </div>
            </div>

            {/* LIVE OPS TAB */}
            {activeTab === 'live' && (
                <div className="space-y-6">

                    {/* FLOW BAR */}
                    <div className="bg-gray-900/50 border border-gray-700 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Current Status</div>
                            <div className="text-xl font-bold">
                                Round {currentRound} <span className="text-gray-500 mx-2">|</span>
                                {pendingMatches.length === 0 ? <span className="text-green-400">All Matches Complete</span> : <span className="text-yellow-400">{pendingMatches.length} Matches In Progress</span>}
                            </div>
                        </div>

                        {/* NEXT ACTION BUTTON */}
                        <div className="flex gap-3">
                            {/* Buy Back Panel Trigger (Simplified for now, we put buybacks below) */}
                            {isRoundComplete ? (
                                <button
                                    onClick={nextRound}
                                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-green-900/40 transform hover:scale-105 transition-all"
                                >
                                    🚀 START NEXT ROUND
                                </button>
                            ) : (
                                <div className="text-gray-500 italic text-sm py-2 px-4 border border-white/5 rounded-lg bg-black/20">
                                    Waiting for results...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* TRIAGE DECK (Active Matches) */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4">
                        {/* Column 1: PENDING MATCHES (Priority) */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 min-h-[400px]">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                                Active Matches ({pendingMatches.length})
                            </h2>
                            <div className="space-y-3">
                                {pendingMatches.length === 0 && (
                                    <div className="text-center py-10 text-gray-500 italic">
                                        No active matches right now.
                                    </div>
                                )}
                                {pendingMatches.map(m => (
                                    <MatchDirectorCard
                                        key={m.id}
                                        match={m}
                                        onRecordResult={recordMatchResult}
                                        onReset={resetMatch}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Column 2: COMPLETED & BUYBACKS */}
                        <div className="space-y-4">

                            {/* MATCH HISTORY */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10 max-h-[400px] overflow-y-auto">
                                <h2 className="text-lg font-bold mb-4 text-gray-400 text-sm uppercase">Recent History</h2>
                                {completedMatches.slice().reverse().map(m => (
                                    <MatchDirectorCard
                                        key={m.id}
                                        match={m}
                                        onRecordResult={recordMatchResult}
                                        onReset={resetMatch}
                                    />
                                ))}
                                {completedMatches.length === 0 && <div className="text-gray-600 text-sm">No history yet.</div>}
                            </div>

                            {/* BUY BACKS */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-bold text-orange-400">💰 The Graveyard</h2>
                                    <span className="text-sm font-mono bg-orange-500/10 text-orange-400 px-2 py-1 rounded">Cost: ${getBuyBackCost(currentRound)}</span>
                                </div>
                                <div className="max-h-[200px] overflow-y-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead>
                                            <tr className="text-gray-500 border-b border-white/5">
                                                <th className="pb-2">Team</th>
                                                <th className="pb-2">Record</th>
                                                <th className="pb-2 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {eliminated.length === 0 && (
                                                <tr><td colSpan={3} className="py-4 text-center text-gray-600">No eliminated teams.</td></tr>
                                            )}
                                            {eliminated.map(t => (
                                                <tr key={t.id} className="border-b border-white/5 hover:bg-white/5">
                                                    <td className="py-2 text-white">{t.name}</td>
                                                    <td className="py-2 text-gray-400">{t.wins} - {t.losses}</td>
                                                    <td className="py-2 text-right">
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(`Buy back ${t.name}?`)) buyBackTeam(t.id);
                                                            }}
                                                            className="text-xs bg-orange-600/20 text-orange-400 border border-orange-600/50 px-2 py-1 rounded hover:bg-orange-600 hover:text-white transition-colors"
                                                        >
                                                            Buy In
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* GOD MODE TAB */}
            {activeTab === 'god' && (
                <div className="bg-black/40 border border-purple-500/30 rounded-xl p-6 shadow-2xl shadow-purple-900/20">
                    <div className="flex justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-purple-400">God Mode 👁️</h2>
                            <p className="text-gray-400 text-sm">Manually overwrite tournament data. Be careful.</p>
                        </div>
                        <button
                            className="btn-tiny"
                            style={{ background: '#333', color: '#ff4444' }}
                            onClick={() => {
                                if (confirm("⚠️ NUCLEAR OPTION: RESET EVERYTHING?")) resetTournament();
                            }}
                        >
                            🛑 RESET TOURNAMENT
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-gray-400 uppercase font-mono">
                                <tr>
                                    <th className="p-3">Team Name</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3 w-24">Wins</th>
                                    <th className="p-3 w-24">Losses</th>
                                    <th className="p-3 w-24">BuyBacks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {teams.map(t => (
                                    <tr key={t.id} className="hover:bg-white/5 transition-colors">
                                        {/* NAME (Editable?) - Let's keep name static for now to avoid confusion, or edit? Plan said stats. */}
                                        <td className="p-3 font-bold text-white">{t.name}</td>

                                        {/* STATUS SELECT */}
                                        <td className="p-3">
                                            <select
                                                value={t.status}
                                                onChange={(e) => forceUpdateTeam(t.id, { status: e.target.value as any })}
                                                className="bg-black border border-gray-700 rounded px-2 py-1 text-gray-300 focus:border-purple-500 focus:outline-none"
                                            >
                                                <option value="active">Active</option>
                                                <option value="eliminated">Eliminated</option>
                                                <option value="buyback-pending">Buyback Pending</option>
                                            </select>
                                        </td>

                                        {/* WINS INPUT */}
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                value={t.wins}
                                                onChange={(e) => handleStatChange(t.id, 'wins', parseInt(e.target.value) || 0)}
                                                className="w-16 bg-black border border-gray-700 rounded px-2 py-1 text-center font-mono focus:border-purple-500 focus:outline-none"
                                            />
                                        </td>

                                        {/* LOSSES INPUT */}
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                value={t.losses}
                                                onChange={(e) => handleStatChange(t.id, 'losses', parseInt(e.target.value) || 0)}
                                                className="w-16 bg-black border border-gray-700 rounded px-2 py-1 text-center font-mono focus:border-purple-500 focus:outline-none"
                                            />
                                        </td>

                                        {/* BUYBACKS INPUT */}
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                value={t.buyBacks}
                                                onChange={(e) => handleStatChange(t.id, 'buyBacks', parseInt(e.target.value) || 0)}
                                                className="w-16 bg-black border border-gray-700 rounded px-2 py-1 text-center font-mono focus:border-purple-500 focus:outline-none"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminView;
