# 🔐 THE CIPHER GALLOWS // Tactical Word Deduction Platform

A modern, atmospheric reimagining of the classic word-deduction game that moves away from crude pen-and-paper sticks toward rich narrative stakes, tactile visual telemetry, and social competition.

Built with **React 18+**, **TypeScript**, **Tailwind CSS v3**, **Express.js**, and **Socket.io**.

---

## ⚡ High-Impact & Non-Technical Features

### 1. Themed Narrative Stages (Beyond the Gallows)
Three selectable visual stages where each miss advances a multi-part story with progressive vector animations:
- **🌊 The Deep-Sea Diver (`deep_sea_diver`)**: A vintage brass diving suit descending into an oceanic trench; misses snap hoist cables, strain harnesses, and crack the viewport with escaping bubbles.
- **⚙️ The Clockwork Automaton (`steampunk_automaton`)**: A mechanical steam puppet assembled piece-by-piece; complete the automaton before its rogue mainspring snaps into overdrive.
- **🚀 The Orbital Spacewalk (`orbital_astronaut`)**: An astronaut whose umbilical tether gradually unspools and snaps into the void.

### 2. Contextual "Radar" Hint Engine
Misses aren't purely punitive:
- After **3 mistakes**: Unlocks the secret word's **vowel count**.
- After **4 mistakes**: Unlocks the **part of speech** (noun, adjective, etc.).
- After **5 mistakes**: Unlocks the **etymological cryptic root**.
- **Radar Token Spend**: Allows directly revealing a random hidden glyph.

### 3. Tactile Letter Frequency Telemetry
- Real-time English corpus letter frequency heatmaps (common vowels vs. rare consonants).
- On-screen tactile keyboard displays dynamic probability distributions (E 12.7%, T 9.1%, A 8.2%, etc.).
- Computes and suggests the mathematically optimal next guess.

### 4. Daily Synchronized "Cipher"
- Seeded via a deterministic **Mulberry32 PRNG** keyed to UTC ISO dates (`YYYY-MM-DD`).
- All players globally tackle the exact same challenge within an identical mistake budget.
- Generates a Wordle-style copyable emoji recap (e.g. `🟩 🟥 🟩 🟩 ⚡ Strikes: 1/6`) for social sharing.

### 5. Procedural Web Audio Engine & Dynamic Tension Valve
- Zero external MP3/WAV dependencies; built with native Web Audio API oscillators and filters.
- Tactile mechanical keycap clicks, harmonic chord match chimes, and escalating error clangs.
- **Dynamic Tension Valve**: Activates an ambient sub-bass drone that tightens and pitches upward as remaining mistake tokens dwindle to 5/6!
- Victory fanfare and decompression breach shutdown audio.

---

## 🛠️ Architecture & Monorepo Structure

```
Hangman/
├── shared/
│   └── types.ts            # Shared TypeScript contracts (state, socket events, letter telemetry)
├── server/                 # Express + Socket.io authoritative game service
│   ├── src/
│   │   ├── dictionary.ts   # Tiered vocabulary (Easy, Medium, Hard, Obscure), Mulberry32 PRNG
│   │   ├── game-engine.ts  # Authoritative game session (client NEVER receives secret word)
│   │   └── index.ts        # REST endpoints (/api/daily, /api/word/*) + Socket.io handlers
│   ├── package.json
│   └── tsconfig.json
├── client/                 # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── game/
│   │   │   │   ├── VectorStage.tsx     # Dynamic SVG path animations (3 themes, 6 stages)
│   │   │   │   ├── WordDeck.tsx        # 3D Flip Card masked word reveal deck
│   │   │   │   ├── TactileKeyboard.tsx # 3-row QWERTY keyboard with telemetry heatmap
│   │   │   │   ├── TelemetryDock.tsx   # Hint Radar Console & Frequency guide
│   │   │   │   └── EndgameModal.tsx    # Victory/Defeat modal & emoji share generator
│   │   │   └── layout/
│   │   │       └── Header.tsx          # Tactical top bar, strikes, mode, audio toggle
│   │   ├── hooks/
│   │   │   └── useHangmanGame.ts       # Headless React game engine with offline fallback
│   │   ├── lib/
│   │   │   ├── audio.ts                # Synthesized Web Audio API sound engine
│   │   │   └── utils.ts                # cn utility
│   │   ├── App.tsx                     # Split cockpit HUD layout
│   │   ├── main.tsx
│   │   └── index.css                   # Tactical grid & CRT scanline styling
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── package.json            # Monorepo root with concurrent dev scripts
```

---

## 🚀 Running the Project

### Start both Client and Server concurrently:
```bash
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend REST API**: [http://localhost:3001/api](http://localhost:3001/api)
- **Backend WebSocket**: `ws://localhost:3001`

### Or start individually:
```bash
# Terminal 1: Backend Server
cd server
npm run dev

# Terminal 2: Frontend Client
cd client
npm run dev
```
