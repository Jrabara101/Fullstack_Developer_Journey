# ⚔️ ArcaneArmory: Multiplayer RPG Spatial Inventory & Party Hub

A production-ready, browser-native multiplayer RPG inventory and character progression demo that transforms static spreadsheet inventory management into a tactile, living party armory. Designed for frictionless browser-based play with zero downloads or logins, it bridges spatial grid-management satisfaction with real-time party cooperation, item trading, and dynamic quest-driven loot drops.

---

## 🌟 Key Architecture & Highlights

### 1. Spatial Grid & "Tetris-Style" Bag Mechanics
- **10×6 Multi-Cell Grid System**: Items occupy distinct 2D dimensions (`1x1` rings/potions, `1x3` longbows/broadswords, `2x2` shields/helmets, `2x3` heavy plate/obsidian cleavers).
- **Collision Detection & Boundaries**: Boundary limit checking, occupied slot collision detection, and dynamic green/red drop preview feedback.
- **Rotation Engine (`[R]` Key)**: Rotate items 90° on the fly while dragging or through the right-click contextual action menu.
- **2D Bin-Packing Auto-Sort**: Packs your bag using an automated 2D bin-packing heuristic (sorting by item bounding area, rarity, and gold value).
- **Zero-Dependency Procedural Audio**: Built with the Web Audio API to provide mechanical pickup clicks, resonant drop impacts, rotation swishes, coin jingles, and trade locks.

### 2. Paper Doll Equipment Rig & Stat Engine
- **Slot Constraints**: Head, Chest, Hands, Legs, Feet, Main Hand, Off Hand, Amulet, and Ring.
- **Two-Handed Weapon Rigging**: Equipping Two-Handed weapons (like the Obsidian Cleaver or Longbow) automatically un-equips shields and disables the Off-Hand slot.
- **Pure TypeScript Stat Calculator**:
  - Dynamically scales Attack Power (from Strength & weapon base damage), Critical Strike Precision (from Dexterity), Elemental Haste (from Intelligence), and Armor.
  - **Dynamic Differentials**: Hovering any item produces comparative colored pills (`+18 Atk`, `-4 Def`, `+1.2% Crit`).
- **Encumbrance Simulation**: Dynamic total weight computation against `maxCarryWeight` with penalty telemetry for movement speed and stamina recovery when overburdened.
- **Visual Equipment Glows & Status Auras**: Rarity-colored illuminated borders (Common Slate, Uncommon Green, Rare Blue, Epic Purple, Legendary Gold) with astral status auras around the character silhouette.

### 3. Synchronized Peer-to-Peer Trade Chamber
- **Double-Lock Protocol**: Both players stage items and gold into a shared matrix.
- **Anti-Scam Reset Mechanism**: Any alteration to staged items or gold immediately releases locks and resets the confirmation timer, preventing bait-and-switch scams.
- **Atomic Two-Phase Commit**: Backed by the Fastify authoritative ledger; if either client disconnects or aborts, state rolls back to the authoritative snapshot.

### 4. Quest Progression & Seeded Loot Podium
- **Shared Party Quest Tracker**: Checkpoints synchronize across the room in real time.
- **Seeded Loot Director**: Slaying bosses triggers an arcade-style Loot Podium with a 15-second radial countdown timer.
- **Need / Greed / Pass Rolls**: Real-time D100 dice roll animations and authoritative roll resolution (Need > Greed > Pass) with direct item deposit into the winner's bag and victory fanfare!

### 5. Multi-Client & AI Companion Support
- Supports up to 4 real human players synchronized via 4-character room codes (e.g. `VALK`).
- Built-in AI party companions ("Aria Shadowblade", "Thorin Ironbreaker", "Lyra Dawnwhisper") allowing full solo testing of party inspection, live trading, and multi-roller Need/Greed competitions.

---

## 🛠 Tech Stack

- **Frontend**: Vite, React 19, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti.
- **Backend**: Node.js, Fastify, `@fastify/websocket`, `@fastify/cors`.
- **Audio Engine**: Pure procedural Web Audio API synthesizer.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### Installation & Launch
```bash
# Install dependencies
npm install

# Run fullstack development environment (Frontend + Fastify WebSocket server concurrently)
npm run dev
```

- **Frontend Application**: `http://localhost:5174/` (or port assigned by Vite)
- **Fastify WebSocket Server**: `http://localhost:3008/` (`/ws` endpoint)

### Available Scripts
- `npm run dev`: Runs both client and server concurrently.
- `npm run dev:client`: Runs Vite frontend dev server.
- `npm run dev:server`: Runs Fastify WebSocket server using `tsx`.
- `npm run build`: Type-checks and creates production Vite bundle.

---

## 🎮 Controls & Shortcuts

| Action | Control |
|---|---|
| Move Item | Left-Click & Drag |
| Rotate Item | Press `R` or `r` during drag / hover |
| Context Menu | Right-Click item (Equip, Rotate, Drop) |
| Auto-Pack Bag | Click **2D Auto-Pack** button |
| Inspect Party Member | Click **Inspect Sheet** on Vanguard card |
| Start Trade | Click **Trade Chamber** on Vanguard card |
| Roll on Loot | Click **Need**, **Greed**, or **Pass** in Loot Podium |
| Advance Quest | Click **Advance Milestone / Slay Boss** |
| Mute / Unmute Audio | Click sound icon in top-right header |
