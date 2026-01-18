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
  const { teams, tournamentStatus } = useTournament();
  const [view, setView] = useState<'setup' | 'admin' | 'dashboard' | 'bracket'>('dashboard');

  const activeTeams = teams.filter(t => t.status === 'active');
  const handleNav = (v: 'setup' | 'admin' | 'dashboard' | 'bracket') => setView(v);

  // Spectator Route Check
  if (window.location.pathname === '/spectator') {
    return <SpectatorView />;
  }

  return (
    <Layout
      currentView={view}
      onNavigate={handleNav}
      activeTeamCount={activeTeams.length}
    >
      {/* Winner Overlay */}
      {tournamentStatus === 'completed' && <WinnerScreen />}

      {/* Main Views */}
      {view === 'setup' && <SetupView onComplete={() => setView('dashboard')} />}
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
