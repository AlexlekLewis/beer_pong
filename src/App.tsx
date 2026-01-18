import React, { useState, useEffect } from 'react';
import { useTournament } from './context/TournamentContext';
import SetupView from './views/SetupView';
import AdminView from './views/AdminView';
import DashboardView from './views/DashboardView';
import BracketView from './views/BracketView';
import SpectatorView from './views/SpectatorView';
// Sidebar replaced by TopNav in this design
import Lottery from './components/Lottery';
import WinnerScreen from './components/WinnerScreen';

// The Shell Layout
const App: React.FC = () => {
  const {
    tournamentStatus,
    matches,
    currentRound,
    teams,
    processLotteryWinner
  } = useTournament();

  const [view, setView] = useState<'setup' | 'admin' | 'dashboard' | 'bracket'>('dashboard');

  const [showLottery, setShowLottery] = useState(false);
  const [lotteryPool, setLotteryPool] = useState<typeof teams>([]);
  const [lotteryWinner, setLotteryWinner] = useState<typeof teams[0] | null>(null);

  const [showWinner, setShowWinner] = useState(false);
  const [champion, setChampion] = useState<typeof teams[0] | null>(null);

  // Sync View with Status
  useEffect(() => {
    if (tournamentStatus === 'active' && view === 'setup') {
      setView('admin');
    }
  }, [tournamentStatus, view]);

  // Check for Lottery Condition (Buyback Pending > 0 and Active Teams needed to pair?)
  // Actually, the context handles logic. We need to know when to SHOW the lottery UI.
  // We can check if 'buyback-pending' teams exist AND we are in a 'lottery needed' state?
  // Easier: Context should explicitly tell us "Lottery Needed".
  // For now, let's look for Pending teams.
  useEffect(() => {
    // If we have pending teams that need resolution
    // In snippet: "active.length === 1 && pending.length === 0" -> Winner
    // "pending.length > 0 && (active+pending)%2 !== 0" -> Lottery?
    // We will implement a manual trigger in AdminView for lottery if we want, or auto?
    // Let's stick to the visual structure for now.
  }, [teams]);

  // Check for Winner
  useEffect(() => {
    const active = teams.filter(t => t.status === 'active');
    const others = teams.filter(t => t.status !== 'active');
    if (tournamentStatus === 'completed' && active.length === 1) {
      setChampion(active[0]);
      setShowWinner(true);
    }
  }, [tournamentStatus, teams]);

  // Temporary route for Spectator
  if (window.location.pathname === '/spectator') {
    return <SpectatorView />;
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="logo">PONG ROYALE</h1>
        <p className="tagline">Tournament Management System</p>
        <button
          onClick={() => {
            if (confirm('Full Reset? This clears all data.')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: '1px solid #333', color: '#555', padding: '5px 10px', cursor: 'pointer', fontSize: '0.8rem' }}
        >
          Factory Reset
        </button>
      </header>

      <nav className="nav">
        <button
          className={`nav-btn ${view === 'setup' ? 'active' : ''}`}
          onClick={() => setView('setup')}
        >
          <span className="icon">📝</span>Registration
        </button>
        <button
          className={`nav-btn ${view === 'admin' ? 'active' : ''}`}
          onClick={() => setView('admin')}
        >
          <span className="icon">⚙️</span>Control
        </button>
        <button
          className={`nav-btn ${view === 'dashboard' ? 'active' : ''}`}
          onClick={() => setView('dashboard')}
        >
          <span className="icon">📊</span>Dashboard
        </button>
        <button
          className={`nav-btn ${view === 'bracket' ? 'active' : ''}`}
          onClick={() => setView('bracket')}
        >
          <span className="icon">🏆</span>Bracket
        </button>
        <button
          className="nav-btn"
          onClick={() => window.open('/spectator', '_blank')}
        >
          <span className="icon">📺</span>Projector
        </button>
      </nav>

      {view === 'setup' && <SetupView />}
      {view === 'admin' && <AdminView />}
      {view === 'dashboard' && <DashboardView />}
      {view === 'bracket' && <BracketView />}

      {/* 
        Lottery integration is tricky without Context support for 'LotteryState'.
        For now, omitting automatic Lottery trigger to ensure stability.
        Added placeholder logic if needed.
       */}

      {/* 
         Winner Screen
      */}
      {showWinner && champion && (
        <WinnerScreen
          champion={champion}
          onClose={() => {
            setShowWinner(false);
            // Context reset logic?
          }}
        />
      )}
    </div>
  );
};

export default App;
