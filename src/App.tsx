import React, { useState } from 'react';
import { useTournament, TournamentProvider } from './context/TournamentContext';
import SetupView from './views/SetupView';
import AdminView from './views/AdminView';
import DashboardView from './views/DashboardView';
import BracketView from './views/BracketView';
import SpectatorView from './views/SpectatorView';
import WinnerScreen from './components/WinnerScreen';
import Layout from './components/Layout';

// Inner component to use the context
const AppContent: React.FC = () => {
  const { teams, status, resetTournament } = useTournament();
  const [view, setView] = useState<'setup' | 'admin' | 'dashboard' | 'bracket'>('dashboard');

  const activeTeams = teams.filter(t => t.status === 'active');
  const handleNav = (v: 'setup' | 'admin' | 'dashboard' | 'bracket') => setView(v);

  // Determine Champion if completed
  const champion = status === 'completed' && activeTeams.length === 1 ? activeTeams[0] : null;

  // Spectator Route Check
  if (window.location.pathname === '/spectator') {
    return <SpectatorView />;
  }

  return (
    <Layout
      currentView={view}
      onChangeView={handleNav}
    >
      {/* Factory Reset Hack Button (Top Right) - Optional, maybe remove for clean UI or keep hidden */}
      {/* Leaving it out for now to ensure strict type compliance with Layout's children constraint */}

      {/* Winner Overlay */}
      {status === 'completed' && champion && (
        <WinnerScreen
          champion={champion}
          onClose={resetTournament}
        />
      )}

      {/* Main Views */}
      {view === 'setup' && <SetupView />}
      {view === 'admin' && <AdminView />}
      {view === 'dashboard' && <DashboardView />}
      {view === 'bracket' && <BracketView />}
    </Layout>
  );
};

// Main App Component wrapping with Provider
const App: React.FC = () => {
  return (
    <TournamentProvider>
      <AppContent />
    </TournamentProvider>
  );
};

export default App;
