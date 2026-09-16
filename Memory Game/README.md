# Kinetic Memory — Time-Attack & Cognitive Protocol

A high-performance tactile memory matching card game engineered with **React 18**, **Vite**, **TypeScript**, and **Tailwind CSS**.

## Architecture & Psychology

### 1. Cognitive Mapping & Timer Tension
- **Burn-Down (Countdown Mode)**: Dynamic survival tension. The timer bar smoothly shifts from cyan/amber into a pulsing bright red in the final 10 seconds, accompanied by auditory heartbeat ticks.
- **Count-Up (Stopwatch Mode)**: Zen mastery mode for relaxed play, competing solely against your own personal best time without survival panic.
- **The "Glimpse" Priming Phase**: 2-second initial reveal phase at the start of each round allows players to anchor 2–3 pairs in short-term memory before the timer starts.
- **Mismatch Forgiveness (Grace Period)**: Deliberate 800ms–1000ms delay on mismatch paired with a subtle horizontal denial shake before flipping back, ensuring the player has enough time to register the second card's location.

### 2. Tactile 3D UX & Physics
- Hardware-accelerated 3D Y-axis flips using `cubic-bezier(0.4, 0.0, 0.2, 1)`.
- Board locking during card evaluation with subtle dimming to prevent frantic click-spamming.
- Emerald bloom animation and celebratory particle confetti bursts on matches.
- +3s time bonus awarded on successful matches in countdown mode.

### 3. Difficulty Scaling & Working Memory
- **Phase 01 • Warmup (4 × 4)**: 8 pairs (16 cards). Distinct silhouettes and 60s attack window.
- **Phase 02 • Core (6 × 4)**: 12 pairs (24 cards). Standard balanced grid with 75s attack window.
- **Phase 03 • Hard (8 × 4)**: 16 pairs (32 cards). High-stakes protocol with a **-2s clock penalty** per mismatch error.

### 4. Accessibility & Inclusive Design
- **Dual-Coding**: Every card pair features unique iconography, structural geometric badge, archetype classification, and distinct high-contrast colors for colorblind accessibility.
- **Full Keyboard Navigation**:
  - `Arrow Keys` or `WASD`: Navigate the matrix grid.
  - `Space` or `Enter`: Flip the focused card.
- **Reduced Motion Support**: Detects `prefers-reduced-motion` and provides an in-app toggle to replace 3D rotational flips with smooth cross-fade opacity transitions.
- **Zero-Asset Web Audio API**: Crisp card snaps, reveal chimes, triad match chords, error buzzes, and victory fanfare synthesized entirely in code with mute and volume controls.

## Development & Running Locally

```bash
# Install dependencies
npm install

# Run Vite dev server
npm run dev

# Build production bundle
npm run build

# Preview build
npm run preview
```
