# 🍺 Pong Royale V2.0

> **The Ultimate Beer Pong Tournament Manager.**  
> *Now with Cyberpunk/Esport Aesthetics, Strict Rules Engine, and Party Mode.*

![V2 Dashboard Preview](https://via.placeholder.com/800x400?text=Pong+Royale+V2+Dashboard)

## 🚀 Overview

Pong Royale V2 is a complete rewrite of the original tournament manager, designed to run professional-grade (and chaos-proof) beer pong tournaments. It features a robust state management system, high-contrast "Riot Games" style UI, and safety features for drunk... err, *enthusiastic* admins.

## ✨ Key Features

### 🎮 Gameplay & Rules
-   **Dynamic Bracket**: Automatically pairs teams and advances winners.
-   **Strict Buyback Engine**:
    -   Teams can *only* buy back in the round they were eliminated.
    -   **Dynamic Pricing**: Cost increases by **$10 per round** (e.g., Round 3 = $30).
    -   **Visual Feedback**: Dashboard clearly separates "Eligible" losers from "Permanently Eliminated".
-   **Two-Step Scoring**:
    -   Avoid accidental clicks! Select a winner -> Review -> Confirm ("VICTORY").

### 🛡️ Admin & Security
-   **State Persistence**: Auto-saves to `localStorage`. Refresh the page without losing the bracket.
-   **Secure Factory Reset**: The "Reset Tournament" button is safely gated. Admins must type **"RESET"** to unlock the destructive action.

### 🎨 Visual Experience
-   **Esport Theme**: Dark blue-grey palette (`#0f171e`) with Indigo (`#6366f1`) and Valorant Red (`#ff4655`) accents.
-   **TV / Spectator Mode**: A dedicated view for the big screen that auto-rotates between:
    -   Intro / Welcome
    -   Live "Versus" Matchups
    -   Full Bracket Tree
    -   Leaderboard with **Confetti Celebrations**

## 🛠️ Tech Stack

-   **Frontend**: React 18, TypeScript, Vite
-   **Styling**: Tailwind CSS, CSS Variables, Custom Animations
-   **State**: React Context + Reducer Architecture
-   **Assets**: Canvas API for particle effects (Confetti)

## ⚡ Quick Start

### Prerequisites
-   Node.js (v18+)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/pong-royale-v2.git

# Install dependencies
cd pong-royale-v2
npm install

# Start the dev server
npm run dev
```

## 📖 Admin Guide

### 1. Setup Phase
-   Enter team names in the "Registration Deck".
-   Click **"LOCK & START TOURNAMENT"** when ready.

### 2. Running Matches
-   The "Live Feed" shows all active matches.
-   Click a team to select them as the **Winner**.
-   Click **"CONFIRM VICTORY"** to finalize.

### 3. Handling Losers
-   When a team loses, they appear in the "Restricted Access / Buyback" list.
-   **IF** they pay the fee ($10 * Round), click **"BUY BACK"** to return them to the active pool for the next round.
-   **WARNING**: If you advance to the next round without buying them back, they are permanently eliminated.

### 4. TV Mode
-   Hook a laptop up to the TV.
-   Navigate to `/` and add `?spectator=true` to the URL (or click the link in the footer).
-   Press `F11` for Fullscreen. The app will run itself!

---

*Built with ❤️ (and probably some beer) for the boys.*
