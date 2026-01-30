// Party Lions - Main App with View Router

import { useTournamentStore } from './lib/store';
import { HomePage } from './views/HomePage';
import { SetupPage } from './views/SetupPage';
import { TournamentPage } from './views/TournamentPage';
import { WildcardPage } from './views/WildcardPage';
import { ResultsPage } from './views/ResultsPage';
import { ModeratorDashboard } from './views/ModeratorDashboard';

function App() {
    const { currentView, tournament } = useTournamentStore();

    // Redirect to home if no tournament for views that require one
    const requiresTournament = ['setup', 'tournament', 'wildcard', 'results', 'dashboard'];
    if (requiresTournament.includes(currentView) && !tournament) {
        return <HomePage />;
    }

    // Render current view
    switch (currentView) {
        case 'home':
            return <HomePage />;
        case 'setup':
            return <SetupPage />;
        case 'tournament':
            return <TournamentPage />;
        case 'wildcard':
            return <WildcardPage />;
        case 'results':
            return <ResultsPage />;
        case 'dashboard':
            return <ModeratorDashboard />;
        default:
            return <HomePage />;
    }
}

export default App;
