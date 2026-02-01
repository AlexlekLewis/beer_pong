// Party Lions - Main App with View Router

import { useEffect } from 'react';
import { useTournamentStore } from './lib/store';
import { HomePage } from './views/HomePage';
import { SetupPage } from './views/SetupPage';
import { TournamentPage } from './views/TournamentPage';
import { WildcardPage } from './views/WildcardPage';
import { ResultsPage } from './views/ResultsPage';
import { ModeratorDashboard } from './views/ModeratorDashboard';
import { TVModeView } from './views/TVModeView';
import { KeyboardShortcutsListener } from './components/effects/KeyboardShortcutsListener';
import { SaveIndicator } from './components/ui/SaveIndicator';
import { BottomNav } from './components/ui/BottomNav';

function App() {
    const { currentView, tournament } = useTournamentStore();

    // Apply dynamic theme
    useEffect(() => {
        if (tournament?.settings.themeColor) {
            const root = document.documentElement;
            const color = tournament.settings.themeColor;

            // Set main color
            root.style.setProperty('--gold-main', color);

            // Calculate variations (simple hex manipulation for now, or just reuse)
            // Ideally we'd use a color library, but for now we'll trust explicit overrides or fallback
            // A simple light/glow variation
            root.style.setProperty('--gold-glow', `${color}80`); // 50% opacity
            root.style.setProperty('--gold-light', color); // Fallback
        } else {
            // Reset to default if no tournament or custom Color
            const root = document.documentElement;
            root.style.removeProperty('--gold-main');
            root.style.removeProperty('--gold-glow');
            root.style.removeProperty('--gold-light');
        }
    }, [tournament?.settings.themeColor]);

    // Redirect to home if no tournament for views that require one
    const requiresTournament = ['setup', 'tournament', 'wildcard', 'results', 'dashboard'];
    if (requiresTournament.includes(currentView) && !tournament) {
        return <HomePage />;
    }

    return (
        <>
            <KeyboardShortcutsListener />
            {currentView !== 'tv' && (
                <>
                    <SaveIndicator />
                    <BottomNav />
                </>
            )}

            <div className={currentView === 'tv' ? '' : 'min-h-screen pb-20 lg:pb-0'}>
                {currentView === 'home' && <HomePage />}
                {currentView === 'setup' && <SetupPage />}
                {currentView === 'tournament' && <TournamentPage />}
                {currentView === 'wildcard' && <WildcardPage />}
                {currentView === 'results' && <ResultsPage />}
                {currentView === 'dashboard' && <ModeratorDashboard />}
                {currentView === 'tv' && <TVModeView />}
            </div>
        </>
    );
}

export default App;
