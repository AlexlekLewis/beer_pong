import { motion } from 'framer-motion';
import { useTournamentStore } from '../../lib/store';

interface NavItemProps {
    icon: string;
    label: string;
    active: boolean;
    onClick: () => void;
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center w-full py-2 transition-colors relative ${active ? 'text-white' : 'text-[var(--text-muted)]'
                }`}
        >
            <span className="text-xl mb-1">{icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            {active && (
                <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute top-0 w-8 h-1 bg-[var(--gold-main)] rounded-b-full"
                />
            )}
        </button>
    );
}

export function BottomNav() {
    const { currentView, tournament, setView } = useTournamentStore();

    if (!tournament) return null;

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0f1218]/95 backdrop-blur-lg border-t border-white/10 pb-safe z-50">
            <div className="flex justify-around items-center h-16">
                <NavItem
                    icon="🏠"
                    label="Home"
                    active={currentView === 'home' || currentView === 'setup'}
                    onClick={() => setView(tournament.status === 'setup' ? 'setup' : 'home')}
                />
                <NavItem
                    icon="🏆"
                    label="Bracket"
                    active={currentView === 'tournament'}
                    onClick={() => setView('tournament')}
                />
                <NavItem
                    icon="⚙️"
                    label="Dashboard"
                    active={currentView === 'dashboard'}
                    onClick={() => setView('dashboard')}
                />
                <NavItem
                    icon="📊"
                    label="Results"
                    active={currentView === 'results'}
                    onClick={() => setView('results')}
                />
            </div>
        </div>
    );
}
