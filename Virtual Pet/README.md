# 🥚 AethelPet | Epigenetic Virtual Pet Sanctuary & Playdate Park

A browser-native, tactile virtual pet sanctuary elevating nostalgic 90s digital companion mechanics into an organic, living ecosystem. Engineered with monotonic circadian metabolism, branching epigenetic evolution, tactile micro-interactions, spring kinematics, and frictionless peer connectivity.

---

## 🌟 High-Impact Features

### 1. Monotonic "Circadian Metabolism" & Anti-Clock Tampering
- **Authoritative Backend Reconciliation**: When the client connects (`/api/pet/:id/sync`), the authoritative Fastify backend reconciles elapsed time using monotonic UTC timestamps.
- **Gradual Degradation Without Punitive Death**: Calculates gradual hunger decay, hygiene loss, dream state energy recovery, and waste accumulation (`wasteCount = min(6, floor(elapsedHours / 4))`). Neglected companions transition to a reversible `SICK` mood that can be nursed back to health with medicine and baths.
- **Dream State Restoration**: While sleeping, hunger decay slows by 60% and energy regenerates up to 100%.

### 2. Epigenetic Branching Evolution Matrix
- **Non-Linear Evolution**: Maturation branches organically based on holistic care telemetry rather than simple level thresholds:
  - **Egg ➔ Blobkin** (Stage I: Baby, incubator tap hatch)
  - **Blobkin ➔ Chibi Sprout** (High hygiene purity > 70%)
  - **Blobkin ➔ Nibble Pug** (High protein & savory diet)
  - **Blobkin ➔ Sparkle Mite** (High confectionery & sweet diet)
  - **Stage III (Teen)**: Verdant Cub, Pyro Fang, Glimmer Sprite, Iron Shell
  - **Stage IV (Adult)**: Cyber Drake (Extreme discipline + protein), Mossy Boulderkind (Pristine hygiene), Astral Wisp (High sugar + ecstatic joy), Solar Gryphon, Voidling, Mecha Titan
  - **Stage V (Ancient)**: Celestial Guardian, Chrono Dragon, Gaia Behemoth

### 3. Tactile Physicality & Decoupled 60fps Game Engine
- **Decoupled Render & Physics Loops**: High-DPI HTML5 2D Canvas runs a dedicated `requestAnimationFrame` loop completely decoupled from React state renders.
- **Spring Kinematics**: Soft-body squash-and-stretch deformation (`SquashAndStretch` spring damper) responds dynamically to walks, jumps, pet purrs, bites, and ball kicks.
- **Multi-Bite Munch Deformation**: Dragging food into proximity bounding boxes triggers mouth-snapping animations and subtracts 33% item volume per bite with flying crumb particles.
- **Sponge Scrub Suds**: Accumulates cursor velocity over the pet's hitbox (`cursorSpeed > 40px/s`), spawning canvas foam bubbles that progressively wash away dirt decals.
- **Interactive Bouncing Toy Ball**: Physical ball with gravitational acceleration, restitution, ground friction, and pet kick response.

### 4. "Playdate Park" Peer Lobbies & Genetic Seed Swaps
- **Real-Time WebSocket Coordinator**: Ephemeral 4-character room codes (`PARK`, `LUNA`, `STAR`) host 2–4 players.
- **Camera-Scanned QR Code**: Live QR code generator for instant mobile camera join.
- **Synchronized Ball Physics & Emotes**: Synchronizes spatial coordinates, reactions (`❤️`, `🎉`, `⚽`, `😋`), and ball kicks.
- **Genetic Pollen Swapping**: Companions interact in the park to exchange genetic pollen, synthesizing non-fungible hybrid seeds stored in the persistent `seed_vault`.

### 5. Holographic "Pet Passport" & Lifespan Ledger
- **Visual Identity Card**: High-contrast, iridescent holographic card (`holographic-card`) mapping the pet's lineage tree (`🥚 ➔ 🫧 ➔ 🌱`), milestone badges, lifespan counter, and vitals.
- **Social Sharing**: Copyable high-contrast ledger string for Discord and social feeds.

---

## 🛠️ Technical Stack

- **Frontend**: React 19 / 18+, TypeScript, Vite 8, Tailwind CSS v4, Lucide React, Canvas Confetti, QRCode
- **Physics & Kinematics**: Custom 2D Spring-Damper System, Autonomous Steering Behaviors (Wall avoidance, Wander, Curiosity, Poop fleeing), Particle System (Foam lather, Crumbs, Joy emotes)
- **Audio & Haptics**: Procedural Web Audio API sound synthesizer (purring vibrato, crunch noise, bubble pops, fanfare arpeggio) + Navigator Haptics
- **Backend**: Node.js 24 (native TypeScript execution + native zero-dependency `node:sqlite`), Fastify v5, `@fastify/websocket`, `@fastify/cors`
- **Database**: SQLite (`data/virtual_pet.db`) tracking pets, inventory, care logs, and hybrid seed vaults

---

## 🎮 Universal Controls & Keyboard Hotkeys

| Hotkey | Tool / Action | Description |
|:---:|:---:|:---|
| **1** | **Pet / Hand** | Purr touch, joyful squish deformation, and happiness restoration |
| **2** | **Scrub / Sponge** | Spawns lathering suds when wiped over pet to clean dirt decals |
| **3** | **Feed / Pantry** | Opens food inventory drawer with categorized foods and trait hints |
| **4** | **Play / Ball** | Spawns interactive bouncing rubber ball for exercise and coins |
| **5** | **Sleep / Lamp** | Toggles day/night circadian lamp and dream state energy recovery |
| **Touch** | **Mobile Touch** | Low-latency mobile touch gestures with haptic purr vibration |

---

## 🚀 Running Locally

### Prerequisites
- Node.js 22+ or 24+
- npm 10+

### Setup & Launch
```bash
# 1. Install dependencies
npm install

# 2. Run both Backend Server & Frontend Client concurrently
npm run dev

# Or run services independently:
npm run server   # Starts Fastify backend on http://localhost:3001 & ws://localhost:3001
npm run client   # Starts Vite frontend on http://localhost:5174 (proxied to backend)

# 3. Production Build
npm run build
```

---

## 📡 API Contract Reference

### REST Endpoints
- `GET /api/pet/current` - Retrieves or initializes the active companion.
- `GET /api/pet/:id/sync` - Authoritative monotonic offline decay reconciliation.
- `POST /api/pet/action` - Validates and executes care actions (`HATCH`, `FEED`, `CLEAN`, `PET`, `PLAY`, `SLEEP_TOGGLE`, `MEDICINE`) with anti-macro cooldowns.
- `POST /api/pet/evolve` - Evaluates epigenetic matrix and applies deterministic mutation.
- `POST /api/pet/rename` - Updates companion name.
- `GET /api/foods` - Returns player food inventory and nutrition metadata.
- `GET /api/vault/:petId` - Returns harvested hybrid seeds from playdate park pollen swaps.

### WebSocket Relay (`/ws/playdate`)
- `JOIN_ROOM` - Joins ephemeral 4-character park room.
- `PET_MOVE` - Broadcasts `(x, y)` coordinate deltas and current mood.
- `PET_EMOTE` - Streams emoji reactions over the shared canvas.
- `BALL_KICK` - Synchronizes multi-client toy ball physics.
- `POLLEN_SWAP_REQUEST` - Initiates genetic pollen exchange and generates non-fungible hybrid seeds.
