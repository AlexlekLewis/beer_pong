import React, { useState } from 'react';
import { TournamentProvider, useTournament } from './context/TournamentContext';
import { SetupView } from './views/SetupView';
import { DashboardView } from './views/DashboardView';
import { SpectatorView } from './views/SpectatorView';
import { MainLayout } from './components/MainLayout';

const AppContent: React.FC = () => {
    const { status } = useTournament();
    const [isSpectator] = useState(() => window.location.search.includes('spectator'));

    if (isSpectator) {
        return <SpectatorView />;
    }

    return (
        <MainLayout>
            {status === 'setup' ? (
                <SetupView />
            ) : (
                <DashboardView />
            )}
        </MainLayout>
    );
};

import { ViewProvider } from './context/ViewContext';

// ...

function App() {
    return (
        <TournamentProvider>
            <ViewProvider>
                <AppContent />
            </ViewProvider>
        </TournamentProvider>
    );
}

export default App;
