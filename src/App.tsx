// Party Lions - Main App with View Router

import { useTournamentStore } from './lib/store';
import { HomePage } from './views/HomePage';
import { SetupPage } from './views/SetupPage';
import { TournamentPage } from './views/TournamentPage';
import { WildcardPage } from './views/WildcardPage';
import { ResultsPage } from './views/ResultsPage';
import { ModeratorDashboard } from './views/ModeratorDashboard';
import { KeyboardShortcutsListener } from './components/effects/KeyboardShortcutsListener';
import { SaveIndicator } from './components/ui/SaveIndicator';
import { BottomNav } from './components/ui/BottomNav';

function App() {
    const { currentView, tournament } = useTournamentStore();

    // Redirect to home if no tournament for views that require one
    const requiresTournament = ['setup', 'tournament', 'wildcard', 'results', 'dashboard'];
    if (requiresTournament.includes(currentView) && !tournament) {
        return <HomePage />;
    }

    return (
        <>
            <KeyboardShortcutsListener />
            <SaveIndicator />
            <BottomNav />
            <div className="min-h-screen pb-20 lg:pb-0">
                {currentView === 'home' && <HomePage />}
                {currentView === 'setup' && <SetupPage />}
                {currentView === 'tournament' && <TournamentPage />}
                {currentView === 'wildcard' && <WildcardPage />}
                {currentView === 'results' && <ResultsPage />}
                {currentView === 'dashboard' && <ModeratorDashboard />}
            </div>
        </>
    );
}

export default App;
