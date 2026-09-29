# 🃏 WILD ANTE | Online Multiplayer Card Arena (Uno × Poker Hybrid)

A browser-native multiplayer card arena merging the fast-paced color/action-matching sabotage of **Uno** with the psychological bluffing, hand combos, and pot-wagering tension of **Poker**.

Built with **Node.js (Fastify) + WebSockets (Socket.io)** on the server-authoritative backend, paired with **Vite, React 18+, TypeScript, Tailwind CSS, and shadcn UI** on the frontend.

---

## 🌟 Key Highlights & Gameplay Mechanics

### 1. 🪑 Instant Table Seating & Dual-Device Play
- **Zero Registration**: Enter private tables in seconds using 4-character room codes (e.g. `T7KD`) or direct invite links.
- **Dual-Device Pocket Controller**: Desktop screens serve as the cinematic shared 16:9 **Felt Table Broadcast**, while players can scan the instant QR code to use their smartphone as a private, tactile hand controller with native haptic vibration feedback (`navigator.vibrate`).
- **AI Bots**: Host can seat intelligent AI opponents anytime to test or fill tables immediately.

### 2. 💰 Wild Ante & Escalating Pot Stakes
- **Pot Stakes**: Every played action card (*Draw Two*, *Skip*, *Wild Ante*) requires matching the current discard or paying an escalating ante into the central pot.
- **Poker-Uno Melds**: Multi-card combinations (Straight Flushes, Pure Color Flushes, Trips, Rainbow Straights) sweep pot shares and claim combo multiplier bonuses.

### 3. 🖐️ Tactile 3D Corner-Peeking & Flick-to-Play
- **CSS 3D Transforms**: Implemented with `perspective: 1000px` and `transform-style: preserve-3d`.
- **Corner-Peeking**: Pointer listeners calculate drag displacement on card corners, applying localized `rotateX` and `rotateY` transforms with dynamic shadows so players can discreetly peek at hidden hand values.
- **Flick-to-Play**: Calculates pointer release velocity vectors `(deltaY / deltaTime)` to animate cards gliding onto the felt pile with dynamic micro-rotations (-15° to +15°).

### 4. 🚨 5-Second "Bluff Call" Suspense Window
- Players can play cards face-down in **Bluff Mode**.
- Opponents have an instantaneous screen-wide **5-second countdown** to slam the **Call Bluff** button.
- **Caught Bluffing**: The bluffer draws 3 penalty cards and pays 100 chips into the pot.
- **False Accusation**: The challenger draws 2 penalty cards and pays double ante to the honest player.

### 5. 🛡️ Cryptographic Fog-of-War & Anti-Cheat Authority
- Opponent cards and the draw deck are **never exposed** in client DOM or WebSocket payloads.
- Fisher-Yates deck shuffle seeded with `crypto.randomBytes`.
- Server delivers masked player state where `hand` is populated **only** for the local client.
- Automatic fallback auto-draw/auto-fold for idling or disconnected players.
- JWT session recovery token in `localStorage` for page refresh reconnection.

---

## 🛠️ Architecture & Tech Stack

```
Online Card Game/
├── server/                           # Server-Authoritative Backend Engine
│   ├── src/
│   │   ├── types.ts                  # Shared data contracts (Card, TablePlayer, CardGameState)
│   │   ├── session.ts                # JWT session recovery tokens
│   │   ├── engine/
│   │   │   ├── deck.ts               # Cryptographic Fisher-Yates shuffle & legality checks
│   │   │   ├── roomManager.ts        # Room lifecycle state machine & Fog-of-War masking
│   │   │   └── combos.ts             # Poker meld evaluation (Flushes, Straights, Sets)
│   │   └── server.ts                 # Fastify app + Socket.io gateway (port 3005)
│   └── package.json
│
├── client/                           # Modern React 18+ Gaming Client
│   ├── src/
│   │   ├── types/game.ts             # Core contracts matching server specifications
│   │   ├── hooks/
│   │   │   ├── useCardGameSocket.ts  # Headless client hook (optimistic plays & reconciliation)
│   │   │   └── useSoundEffects.ts    # Web Audio API procedural sound synthesizer
│   │   ├── components/
│   │   │   ├── 3d/Card3D.tsx         # 3D transforms, corner-peeking, velocity flick physics
│   │   │   ├── table/
│   │   │   │   ├── FeltTableArena.tsx# 16:9 felt table, glowing active suit halo, pot counter
│   │   │   │   └── PlayerSeat.tsx    # SVG countdown rings, chip balances, card count badges
│   │   │   ├── hand/ActionDock.tsx   # Arc fan-spread rack, hover elevation, suit selector
│   │   │   ├── wagering/
│   │   │   │   └── WageringDrawer.tsx# shadcn Sheet with chip slider, quick presets, melds
│   │   │   ├── modals/
│   │   │   │   ├── BluffChallengeModal.tsx # Screen-wide 5s escalating countdown modal
│   │   │   │   └── RoundPayoutModal.tsx    # Confetti fireworks, fanfare, showdown telemetry
│   │   │   ├── controller/
│   │   │   │   └── PocketControllerView.tsx# Mobile thumb-first layout with haptics
│   │   │   ├── emotes/TableEmotesOverlay.tsx# Floating tomatoes, chips, slams
│   │   │   ├── lobby/LobbyView.tsx   # 4-character PIN codes, QR code modal, AI bots
│   │   │   ├── navigation/TopBar.tsx # Header controls, invite link copy, mode switch
│   │   │   └── ui/                   # Modular shadcn UI primitives (Button, Badge, etc.)
│   │   ├── App.tsx                   # Main orchestrator & dual viewport switcher
│   │   └── index.css                 # Felt textures, glows, 3D perspective classes
│   └── vite.config.ts                # Vite dev server with WebSocket proxy to port 3005
│
└── package.json                      # Workspace root scripts
```

---

## 🚀 Running the Game Locally

### 1. Start Both Backend & Frontend Concurrently:
From the root directory (`Online Card Game/`):
```bash
npm run dev
```

Or run services individually:
```bash
# Terminal 1 - Fastify + Socket.io Server (Port 3005)
npm run dev:server

# Terminal 2 - Vite + React Client (Port 5174)
npm run dev:client
```

### 2. Play the Game:
1. Open your browser at **`http://localhost:5174`** (or the port shown by Vite).
2. Enter your call-sign and click **Create New Table (Host)**.
3. Click **Add AI Seat** to add bots for solo play, or share your 4-letter Room Code / URL with friends across browser tabs or mobile devices.
4. Click **Start Card Arena Match** and enjoy!
