import React from 'react';

type ViewMode = 'admin' | 'dashboard' | 'bracket';

interface SidebarProps {
    currentView: ViewMode;
    onChangeView: (view: ViewMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
    const navItems = [
        {
            id: 'admin', label: 'Overview', icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            )
        },
        {
            id: 'bracket', label: 'Brackets', icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
            )
        },
        {
            id: 'dashboard', label: 'Leaderboard', icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>
            )
        },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-[280px] bg-white border-r border-[#EFEFEF] flex flex-col z-50 shadow-[4px_0_20px_rgba(0,0,0,0.02)]">
            {/* Logo Area */}
            <div className="h-[100px] flex items-center px-8 border-b border-[#F5F5F7]">
                <div className="w-10 h-10 bg-[#6C5DD3] rounded-xl flex items-center justify-center text-white mr-4 shadow-lg shadow-[#6C5DD3]/30">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-5.38C13.72 10.8 8.96 5.13 8.56 2.75"></path></svg>
                </div>
                <div>
                    <h1 className="font-[Outfit] font-bold text-lg text-[#11142D] leading-tight">Beer Pong</h1>
                    <span className="text-xs text-[#808191] font-medium">Tournament Cup</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-6 space-y-2">
                <div className="text-xs font-bold text-[#B2B3BD] uppercase tracking-wider mb-4 pl-4">Menu</div>
                {navItems.map(item => {
                    const isActive = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onChangeView(item.id as ViewMode)}
                            className={`
                                w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 group relative overflow-hidden
                                ${isActive ? 'bg-[#6C5DD3] text-white shadow-xl shadow-[#6C5DD3]/20' : 'text-[#808191] hover:bg-[#F0F2F5] hover:text-[#5F616E]'}
                            `}
                        >
                            {/* Icon Box */}
                            <span className={`transition-colors ${isActive ? 'text-white' : 'text-[#B2B3BD] group-hover:text-[#6C5DD3]'}`}>
                                {item.icon}
                            </span>

                            <span className="font-[Inter] font-semibold text-[15px]">{item.label}</span>

                            {isActive && (
                                <div className="absolute right-0 top-0 h-full w-1 bg-white/20"></div>
                            )}
                        </button>
                    )
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-8 border-t border-[#F5F5F7]">
                <div className="bg-[#FF754C]/10 rounded-2xl p-6 text-center relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#FF754C]/10 rounded-bl-[40px] transition-all group-hover:scale-110"></div>
                    <div className="w-10 h-10 bg-[#FF754C] rounded-full flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-[#FF754C]/30">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                    </div>
                    <h3 className="font-bold text-[#FF754C] text-sm">New Match</h3>
                    <p className="text-[#FF754C]/70 text-xs mt-1">Quick Start</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
