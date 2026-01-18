import React, { type ReactNode } from 'react';
import { useTournament } from '../context/TournamentContext';
import { useView } from '../context/ViewContext';

interface LayoutProps {
    children: ReactNode;
}

export const MainLayout: React.FC<LayoutProps> = ({ children }) => {
    const { status } = useTournament();
    const { currentView, setCurrentView } = useView();

    return (
        <div className="flex h-screen bg-bg-dark text-text overflow-hidden font-rajdhani">
            {/* Sidebar */}
            <aside className="w-20 lg:w-64 bg-[#0f1218] flex flex-col items-center lg:items-start py-8 border-r border-white/5 z-20">
                <div className="mb-12 px-0 lg:px-6">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-accent rounded-full flex items-center justify-center font-black text-white text-xl shadow-[0_0_15px_var(--accent)]">
                        PR
                    </div>
                </div>

                <nav className="flex-1 w-full space-y-2 px-2 lg:px-4">
                    <SidebarItem
                        icon="🏠"
                        label="Overview"
                        active={currentView === 'overview'}
                        onClick={() => setCurrentView('overview')}
                    />
                    <SidebarItem
                        icon="🏆"
                        label="Bracket"
                        active={currentView === 'bracket'}
                        onClick={() => setCurrentView('bracket')}
                    />
                    <SidebarItem
                        icon="👥"
                        label="Teams"
                        active={currentView === 'teams'}
                        onClick={() => setCurrentView('teams')}
                    />
                    <SidebarItem
                        icon="⚙️"
                        label="Settings"
                        active={currentView === 'settings'}
                        onClick={() => setCurrentView('settings')}
                    />
                </nav>

                <div className="p-4 text-xs text-text-dim text-center lg:text-left">
                    v2.1 ESPORT
                </div>
            </aside>

            {/* Main Wrapper */}
            <div className="flex-1 flex flex-col relative">
                {/* Header */}
                <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-[#0f1218]/50 backdrop-blur">
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-text-dim uppercase tracking-wider flex items-center gap-2">
                            <span className="opacity-50">DASHBOARD</span>
                            <span className="text-white/20">/</span>
                            <span className="text-primary font-bold">{currentView}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <div className="text-xs text-text-dim uppercase tracking-wider">Status</div>
                            <div className="text-primary font-bold">{status}</div>
                        </div>
                        {/* Circle Badge */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs bg-bg-elevated border border-white/10`}>
                            {status === 'active' ? 'ON' : 'OFF'}
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 p-8 overflow-y-auto relative custom-scrollbar">
                    {/* Inner Glass Shell matching the reference image */}
                    <div className="w-full h-full bg-[#1b202b]/80 backdrop-blur-md rounded-xl border border-white/5 shadow-2xl p-8 overflow-x-hidden relative">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

const SidebarItem = ({ icon, label, active = false, onClick }: { icon: string, label: string, active?: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group ${active ? 'bg-gradient-to-r from-primary/20 to-transparent text-white border-l-2 border-primary' : 'text-text-muted hover:bg-white/5 hover:text-white'}`}
    >
        <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
        <span className="hidden lg:block font-bold tracking-wide">{label}</span>
    </button>
);
