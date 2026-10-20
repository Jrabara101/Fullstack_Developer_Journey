# CRITIC.VAULT — Game Criticism Sanctuary & Taste-Sync Platform

A browser-native game criticism sanctuary, social play-diary, and taste-matching platform that transforms scattered user ratings into rich, context-aware critiques and living player identities.

Built with **React 18+**, **Vite**, **TypeScript**, **Tailwind CSS**, and **Zustand** on the frontend, paired with a high-performance **Node.js (Express)** backend powered by a seeded database, **5-Pillar Radar Scoring**, **Authoritative Anti-Brigading Ledger**, and a **Cosine-Similarity Taste-Vector Engine**.

---

## 🌟 Key Features

### 1. Tactile "5-Pillar Radar" & Half-Star Rating Matrix
- **Fluid Half-Star Scrubber (`<HalfStarScrubber />`)**: Moves beyond blunt binary thumbs or flat numbers with a tactile 0.5 to 5.0 star scrubber in 0.5 increments, amber aura hover illumination, and subtle scale popping (`scale-110`).
- **Masterpiece Crown Anointment**: Optional toggle that crowns essential all-time masterworks with a radiant rose-gold particle burst.
- **5-Axis Attribute Radar (`<FivePillarRadar />`)**: Custom SVG radar polygon mapping *Gameplay Loop*, *Narrative & World*, *Visual Direction*, *Audio & Score*, and *Technical Polish*. Smoothly interpolates vertices over 250ms and supports comparative overlays (Community Consensus vs. Your Personal Taste vs. Critic Cohort).

### 2. The "Critic Identity" Profile & "Top 4 Plinth" Showcase
- **Curated Museum Showcase (`<TopFourPlinth />`)**: 4-slot holographic showcase plinth with 3D perspective tilt (`rotateX(4deg) rotateY(-4deg)`), moving specular sheen, and user's pinned star badge.
- **365-Day Play-Diary Heatmap (`<PlayDiaryHeatmap />`)**: 52-week contribution-style calendar tracking daily play hours, session bursts, and published reviews, accompanied by annual KPI counters.
- **Shelf Matrix Tabs**: Library shelves categorized by *Main Story Beaten*, *100% Mastered*, *Currently Playing*, *Dropped/Shelved*, *Backlog*, and *Published Reviews*.
- **Dynamic Taste Compatibility Gauge**: Circular SVG gauge displaying real-time algorithmic compatibility (`94% Taste Sync`) when visiting other critics.

### 3. Completion-Stamped & Context-Verified Chronicles
- **Contextual Verification Badges**: Every review captures completion state (`🟢 STORY BEATEN`, `🟣 100% MASTERED`, `🔴 DROPPED AT 6.5H`), platform tested (`PC`, `PS5`, `DECK`, etc.), and patch version tested at time of review.
- **Spoiler Shield Shroud (`<SpoilerBlock />`)**: Frosted glass shroud (`backdrop-blur-md`) with lock icon. Dissolves into crisp text on click, and **automatically unmasks** if the reader's profile has already marked the game as Beaten or 100% Mastered.

### 4. "Dropped vs. Devoured" Playtime Sentiment Horizon
- **Interactive Playtime Histogram (`<PlaytimeSentimentHorizon />`)**: Visualizes how a game's reception evolves across hours invested (`< 8 hrs`, `8-25 hrs`, `25-60 hrs`, `60-110 hrs`), highlighting drop-off rates and identifying whether a title suffers from early onboarding friction or late-game fatigue.

### 5. Curated "Quest Lists" & Shareable Critic Passport Cards
- **Ranked Thematic Collections**: Explore curated collections (e.g., *"Detective Games That Don't Hold Your Hand"*, *"The Steel Symphony: God-Tier Parry & Combat Loops"*, *"Cinematic Obsidian: Uncompromising Visual & Audio Moods"*) with per-game curator notes and upvotes.
- **Critic Passport Generator (`<CriticPassportModal />`)**: One-click DOM-to-PNG card generator formatted for Discord embeds and social sharing, complete with avatar, tier badge, taste radar, top 4 plinths, and annual hours.

### 6. Backend Anti-Brigading Ledger & Cosine Taste-Vector Engine
- **Anti-Brigading Anomaly Engine**: Analyzes review velocity and rating variance across time-series buckets correlated with game patch versions. Flags surges exceeding 3 standard deviations (`> 3σ`), isolating review-bombing spikes from the organic critic average with an interactive quarantine ledger.
- **Cosine Similarity Taste-Matching**: Computes cosine similarity across shared game ratings and 5-pillar preference vectors to determine a 0–100% compatibility index between players and critics.

---

## 🛠️ Tech Stack

- **Frontend**: React 18+, Vite, TypeScript, Tailwind CSS, Lucide Icons, Canvas-Confetti, HTML-to-Image.
- **State Management**: Zustand (active persona, review drafts, comparison profiles, modals, spoiler preferences), TanStack Query (server state caching, optimistic mutations, invalidation).
- **Backend**: Node.js, Express, TypeScript (TSX).
- **Database**: Seeded database with 25+ iconic games, 5 distinct critic profiles, 150+ reviews with spoiler blocks, and curated quest lists.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
git clone <repo-url>
cd "Game Review Platform"
npm install
```

### Running Locally
To run both the Express backend and the Vite frontend concurrently:
```bash
npm run dev
```

- **Frontend Client**: `http://localhost:3000`
- **Backend API**: `http://localhost:3001`

### Running Server or Client Individually
```bash
# Start backend server only (Port 3001)
npm run server:dev

# Start Vite client only (Port 3000)
npm run client:dev
```

### Production Build
```bash
npm run client:build
```

---

## 📡 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/games` | `GET` | Catalog with search, genre, platform, and sorting (`rating`, `reviews`, `year`) |
| `/api/games/:id` | `GET` | Detailed game metrics, 5-pillar averages, playtime horizon, and anomaly telemetry |
| `/api/games/:id/reviews` | `GET` | Reviews filtered by completion state, platform, taste sync >80%, and quarantine flag |
| `/api/games/:id/reviews` | `POST` | Submit context-verified review with half-stars, 5 pillars, and completion tags |
| `/api/games/:id/anti-brigade` | `GET` | Anti-brigade velocity report, z-scores, and organic vs. unfiltered scores |
| `/api/games/:id/anti-brigade/toggle` | `POST` | Toggle quarantine for anomalous patch version surge |
| `/api/users` | `GET` | List all critic profiles |
| `/api/users/:id` | `GET` | Critic profile with Top-4 games, 365-day play diary heatmap, and shelves |
| `/api/users/:id/taste-match` | `GET` | Cosine similarity taste-matching index (0-100%) against active user |
| `/api/users/:id/shelf` | `POST` | Update game shelf status (`PLAYING`, `BEATEN`, `MASTERED_100`, `DROPPED`, `BACKLOG`) |
| `/api/lists` | `GET` | Curated Quest Lists with curator notes and game data |
| `/api/search` | `GET` | Fuzzy search for Cmd+K command palette across games, critics, and quest lists |
