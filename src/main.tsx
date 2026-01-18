import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import './styles/theme.css' // Pong Royale Themes/animations.css'
import App from './App.tsx'
import { TournamentProvider } from './context/TournamentContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TournamentProvider>
      <App />
    </TournamentProvider>
  </StrictMode>,
)
