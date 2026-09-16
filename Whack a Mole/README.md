# SYNTH-RUNNER: NEON GRID HUSTLE // PALM DRIVE 1984
## The Arcade-Grade Whack-a-Mole Engine (React + Vite + Zustand + Shadcn UI)

> "Whack-a-Node" is a high-tempo, arcade-grade reflex puzzle game inspired by 1980s Outrun synthwave aesthetics.

---

### Key Architectural Highlights

1. **Timestamp-Driven State Automaton (`Zustand`)**:
   - Rather than mutating individual socket states via chaotic timeouts, mole validity is determined strictly by high-precision timestamps (`expiresAt = spawnTime + duration`).
   - Hit validation (`whackMole`) validates `Date.now() <= mole.expiresAt` directly with `<5ms` response time.

2. **Deterministic Game Loop (`useGameLoop`)**:
   - Driven by `requestAnimationFrame` with delta-time accumulator.
   - Dynamic spawn curve: spawn frequency accelerates and lifespan shortens as round timer winds down.
   - Central expiration cleanup prevents DOM desync and memory leaks.

3. **Zero-Latency Web Audio API Procedural Synthesizer**:
   - Retro 80s sawtooth pluck for standard cassette tapes.
   - Five-note triangle arpeggio for 88 MPH DeLorean Hyper Boosts.
   - Downward sawtooth pitch sweep and resonant crunch for Cyber Skull crash hazards.
   - Low sine thud for missed hits.
   - Dual-chime coin sound on game start.

4. **Dynamic Target Hierarchy**:
   - **Synth Cassette** (`normal`): +50 MPH × multiplier, +1 combo boost.
   - **88 MPH DeLorean** (`gold`): +150 MPH × multiplier, +2 combo boost, high-tempo brief window.
   - **Cyber Skull** (`bomb`): -100 MPH collision penalty, multiplier reset, cabinet screen shake and red penalty flash.

5. **Configurable Grid Arena**:
   - Supports both **3x3** (9 slots) and **4x4** (16 slots) grid configurations.
   - Three cruise difficulty modes: **CRUISE** (Easy), **TURBO** (Normal), and **OUTRUN** (Hyper).

---

### Getting Started

```bash
# Install dependencies
npm install

# Run Vite dev server
npm run dev

# Build production bundle
npm run build
```
