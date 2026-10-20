# 🏆 Cyber-Colosseum // Prime Broadcast Deck & Esports Tournament Hub

A premier, broadcast-tier esports tournament telemetry and double-elimination bracket system built with **Fastify**, **WebSockets**, **React 18**, **TypeScript**, and **Tailwind CSS**. Designed according to the **Stitch.md Cyber-Colosseum** design system specifications.

---

## 🌟 Key Features & Deliverables

### 1. Fastify Backend & Real-Time WebSocket Engine
- **Fastify 4.x Server** listening on port `3001` with `@fastify/websocket` and `@fastify/cors`.
- **Tournament Progression Engine**:
  - Double Elimination bracket progression (16 Tier-1 teams: Upper Bracket, Lower Bracket gauntlet, and Grand Finals).
  - Automatically advances winners to `nextMatchId` and drops losers to `loserMatchId`.
  - Supports live score mutations with sub-millisecond broadcast updates.
- **Dual-Captain Reporting & Automatic Dispute Handling**:
  - Independent endpoints for Captain 1 and Captain 2 match submissions.
  - **Consensus Detection**: If both captains agree on scores and winner, the match is finalized and the winner advances automatically.
  - **Conflict & Dispute Detection**: If captains submit conflicting outcomes, the match immediately transitions to `DISPUTED`, triggers amber pulse alerts (`animate-pulse`), logs the dispute reason, and requires Admin Dispute Resolution.
  - **Admin Dispute Override**: Tournament directors can inspect conflicting reports and enforce an official outcome.
- **Autonomous Simulation Controller**:
  - `/api/tournament/simulate-next` ticks live round scores, simulates map completions, or advances matches for testing and broadcast demonstration.

### 2. Interactive Pan & Zoom Bracket Visualizer
- **Infinite Canvas Viewport** with smooth mouse-drag panning and cursor-anchored wheel zooming.
- **Strict Stage Columns**:
  - Upper Bracket: Round of 16 (8 matches) → Quarterfinals (4 matches) → Semifinals (2 matches) → Upper Final (1 match).
  - Lower Bracket: Round 1 (4 matches) → Round 2 (4 matches) → Quarterfinals (2 matches) → Semifinal (1 match) → Lower Final (1 match).
  - Grand Championship Final (Best of 5 with solar gold underglow).
- **Dynamic SVG Broadcast Cables**:
  - Cubic bezier connectors linking stage outputs to destination slots.
  - **Team Trajectory Trace**: Hovering over or selecting any team dims unrelated nodes to 25% opacity and illuminates that team's entire forward and backward path with an energetic electric cyan glow (`stroke-width: 3.5px; filter: drop-shadow(0 0 6px #06B6D4)`).
  - **Winner Advance Glint**: Finished matches illuminate advancing cables in emerald green (`#10B981`).
  - **Live Cable Pulse**: Outgoing lines for live matches pulse with animated dashes.
- **Floating Canvas Controls**: Zoom In (`+`), Zoom Out (`-`), Reset View (`[ ]`), and "Find My Team" instant autofocus.

### 3. Responsive Cyber-Colosseum Match Card
- Built strictly to 240px width x 86px height dimensions.
- Dual team slots with seed badges (`#01`), team avatars, tags, and 32px score cells.
- **Score Mutation Flare**: 200ms scale punch (`scale-125`) with rapid crimson background flash on score mutations.
- **Dispute Warning Pill**: Amber alternating border pulse with "Review" badge when captain reports clash.
- Click to open the deep Match Telemetry Modal.

### 4. Complete UI Suite & Broadcast Deck
- **Top Live Broadcast Ticker (44px Sticky Header)**:
  - Horizontally scrolling match tape displaying `[● LIVE]` status, live scores, current map counter, and one-click match selection.
  - WebSocket connection indicator (`BROADCAST FEED // LIVE`).
  - Quick simulation and reset controls.
- **Tournament Hero Deck**:
  - High-impact header banner with tournament branding, total prize pool ($1,000,000 USD), format pill (`Double Elimination • 16 Teams`), and stage tabs.
- **Team Roster Drawer**:
  - Slide-over panel featuring all 16 teams, region filtering, win-loss records, and 5-man rosters with player roles (Duelist, Initiator, Controller, Sentinel, IGL).
- **Schedule & Results Feed**:
  - Date-segmented list view (`TODAY - SATURDAY, OCT 17`), status filters (`ALL`, `LIVE`, `SCHEDULED`, `COMPLETED`, `DISPUTED`), and search.
- **Dual-Captain & Admin Desk**:
  - Live dispute resolution desk, match telemetry inspector, and simulator.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
Starts both Fastify backend (port `3001`) and Vite frontend (port `5173`):
```bash
npm run dev
```

Or run them individually:
```bash
# Terminal 1: Fastify Backend
npm run server:dev

# Terminal 2: Vite Client
npm run client:dev
```

Open your browser at:
```
http://localhost:5173
```

---

## 📡 API Reference

### REST Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/tournament` | Returns full tournament state, teams, matches, and live list |
| `GET` | `/api/matches` | Returns all bracket nodes |
| `GET` | `/api/matches/:id` | Returns single match details |
| `GET` | `/api/teams` | Returns all 16 qualified teams and rosters |
| `POST` | `/api/matches/:id/score` | Increments score: `{ teamSlot: 1 \| 2, points?: number }` |
| `POST` | `/api/matches/:id/report` | Submits captain report: `{ captainId, captainName, teamId, reportedWinnerId, reportedScore1, reportedScore2 }` |
| `POST` | `/api/matches/:id/resolve-dispute` | Admin dispute resolution: `{ winnerId, score1, score2, adminNotes? }` |
| `POST` | `/api/matches/:id/status` | Updates match status (`LIVE`, `READY`, `COMPLETED`, etc.) |
| `POST` | `/api/tournament/simulate-next` | Advances live round or starts next ready match |
| `POST` | `/api/tournament/reset` | Resets tournament to initial state |

### WebSocket Endpoint (`/ws`)
- Automatically transmits `{ type: 'INIT', data: TournamentState }` on connection.
- Broadcasts updates when scores mutate, disputes are raised, or teams advance.
- Accepts actions:
  - `{ action: 'SCORE_INCREMENT', matchId, teamSlot, points }`
  - `{ action: 'CAPTAIN_REPORT', matchId, report }`
  - `{ action: 'SIMULATE' }`
  - `{ action: 'RESET' }`

---

## 🎨 Color Palette Tokens (Stitch.md)
| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `--bg-canvas` | `#07090E` | Arena void background |
| `--surface-dock` | `#0C101A` | Header ticker and canvas well |
| `--surface-card` | `#131926` | Match cards and modal dialogs |
| `--surface-elevated` | `#1C2436` | Hover states and active dropdowns |
| `--border-subtle` | `#1E283D` | Structural dividers |
| `--border-active` | `#38BDF8` | Luminous cyan for active nodes |
| `--accent-live` | `#EF4444` | Pulsing crimson for live matches |
| `--accent-victory` | `#10B981` | Emerald green for confirmed wins |
| `--accent-gold` | `#F59E0B` | Solar gold for championship finals |
| `--bracket-connector` | `#334155` | Neutral slate tree cables |
| `--bracket-highlight`| `#06B6D4` | Electric cyan for trajectory trace |
