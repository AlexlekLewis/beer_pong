import React from 'react';
import { useTournament } from '../context/TournamentContext';

interface DashboardViewProps {
    onNavigate: (view: 'setup' | 'admin') => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
    const { teams, matches, currentRound, loading } = useTournament();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <h2 className="text-3xl font-bold text-gray-500 animate-pulse">Loading...</h2>
            </div>
        );
    }

    const active = teams.filter(t => t.status === 'active');
    const eliminated = teams.filter(t => t.status === 'eliminated' || t.status === 'buyback-pending');
    const buyBacks = teams.reduce((s, t) => s + (t.buyBacks || 0), 0);
    const games = matches.filter(m => m.completed && !m.isBye).length;
    const top = [...teams].sort((a, b) => b.wins - a.wins).slice(0, 5);

    return (
        <div className="max-w-6xl mx-auto px-4 pb-12">

            {/* NO TOURNAMENT STATE */}
            {teams.length < 2 && (
                <div className="text-center py-20 px-6 border-2 border-dashed border-gray-700 rounded-2xl bg-gray-900/50">
                    <h2 className="text-3xl font-bold mb-6 text-gray-300">No Tournament Active</h2>
                    <button
                        className="bg-green-500 hover:bg-green-400 text-black font-bold text-xl py-4 px-10 rounded-xl shadow-lg shadow-green-900/40 transform hover:scale-105 transition-all"
                        onClick={() => onNavigate('setup')}
                    >
                        Get Started in Registration 📝
                    </button>
                    <p className="mt-4 text-gray-500">Go to the <b>Registration</b> tab to add teams.</p>
                </div>
            )}

            {/* ACTION BANNER */}
            {currentRound > 0 && matches.some(m => !m.completed) && (
                <div onClick={() => onNavigate('admin')} className="mb-8 bg-gradient-to-r from-green-900/40 to-blue-900/40 border-l-4 border-green-500 rounded-r-xl p-8 cursor-pointer hover:bg-white/5 transition-all group relative overflow-hidden">
                    <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors"></div>
                    <div className="relative flex justify-between items-center">
                        <div>
                            <h3 className="text-2xl font-bold text-green-400 mb-2 flex items-center gap-3">
                                <span className="animate-pulse">●</span> Action Required
                            </h3>
                            <p className="text-gray-300 text-lg">Matches are waiting! Go to the <b>Control Panel</b> to manage the round.</p>
                        </div>
                        <button className="bg-green-500 text-black font-bold py-3 px-8 rounded-lg shadow-lg group-hover:scale-105 transition-transform">
                            Open Control Panel →
                        </button>
                    </div>
                </div>
            )}

            {/* HIGH VISIBILITY STATS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
                <div className="bg-[#12121f] border border-[#2a2a4a] p-6 rounded-2xl text-center relative overflow-hidden group hover:border-[#00d4ff] transition-colors">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#00d4ff]"></div>
                    <div className="text-6xl font-extrabold text-[#00d4ff] mb-2 drop-shadow-[0_0_15px_rgba(0,212,255,0.4)]">{currentRound}</div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Round</div>
                </div>

                <div className="bg-[#12121f] border border-[#2a2a4a] p-6 rounded-2xl text-center relative overflow-hidden hover:border-white transition-colors">
                    <div className="text-6xl font-extrabold text-white mb-2">{active.length}</div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Remaining</div>
                </div>

                <div className="bg-[#12121f] border border-[#2a2a4a] p-6 rounded-2xl text-center relative overflow-hidden hover:border-[#ff3366] transition-colors">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#ff3366]"></div>
                    <div className="text-6xl font-extrabold text-[#ff3366] mb-2 drop-shadow-[0_0_15px_rgba(255,51,102,0.4)]">{eliminated.length}</div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Eliminated</div>
                </div>

                <div className="bg-[#12121f] border border-[#2a2a4a] p-6 rounded-2xl text-center relative overflow-hidden hover:border-[#ff00aa] transition-colors">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#ff00aa]"></div>
                    <div className="text-6xl font-extrabold text-[#ff00aa] mb-2 drop-shadow-[0_0_15px_rgba(255,0,170,0.4)]">{buyBacks}</div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Buy-Backs</div>
                </div>

                <div className="bg-[#12121f] border border-[#2a2a4a] p-6 rounded-2xl text-center relative overflow-hidden hover:border-[#ffaa00] transition-colors">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#ffaa00]"></div>
                    <div className="text-6xl font-extrabold text-[#ffaa00] mb-2 drop-shadow-[0_0_15px_rgba(255,170,0,0.4)]">{games}</div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Games</div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* STATUS BOARD */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Active Teams */}
                    <div className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-3 h-3 rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88] animate-pulse"></div>
                            <h3 className="text-xl font-bold uppercase tracking-widest">Still In Competition ({active.length})</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {active.map(t => (
                                <div key={t.id} className="bg-[#12121f] border border-[#2a2a4a] hover:border-[#00ff88] p-4 rounded-xl flex justify-between items-center transition-all group">
                                    <span className="font-bold text-lg group-hover:text-[#00ff88] transition-colors">{t.name}</span>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs text-gray-500 font-mono">REC</span>
                                        <span className="font-mono font-bold text-gray-300">{t.wins}W-{t.losses}L</span>
                                    </div>
                                    {t.buyBacks > 0 && <span className="absolute -top-2 -right-2 bg-[#ff00aa] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">×{t.buyBacks}</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Eliminated Teams */}
                    {eliminated.length > 0 && (
                        <div className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl p-6 opacity-70 hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-3 rounded-full bg-[#ff3366]"></div>
                                <h3 className="text-xl font-bold uppercase tracking-widest text-gray-400">Eliminated ({eliminated.length})</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {eliminated.map(t => (
                                    <div key={t.id} className="bg-[#12121f] border border-[#2a2a4a] p-3 rounded-xl flex justify-between items-center grayscale hover:grayscale-0 transition-all">
                                        <span className="font-medium text-gray-400">{t.name}</span>
                                        <span className="text-xs font-mono text-gray-600">{t.wins}-{t.losses}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* LEADERBOARD */}
                <div className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl p-0 overflow-hidden h-fit">
                    <div className="bg-[#12121f] p-5 border-b border-[#2a2a4a]">
                        <h3 className="text-xl font-bold uppercase tracking-widest flex items-center gap-3">
                            <span className="text-2xl">🏆</span> Leaderboard
                        </h3>
                    </div>
                    <div className="divide-y divide-[#2a2a4a]">
                        {top.map((t, i) => (
                            <div key={t.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                                <div className={`font-mono font-bold text-xl w-8 h-8 flex items-center justify-center rounded ${i === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                                        i === 1 ? 'bg-gray-400/20 text-gray-400' :
                                            i === 2 ? 'bg-orange-700/20 text-orange-600' : 'text-gray-600'
                                    }`}>
                                    #{i + 1}
                                </div>
                                <div className="flex-1 font-bold text-lg">{t.name}</div>
                                <div className="font-mono font-bold text-[#00ff88]">{t.wins} <span className="text-xs text-gray-500">WINS</span></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
