# VELVET STREAM — Modern Human-Centric Streaming Interface

A cutting-edge, anti-fatigue Movie & Series Streaming Interface built with **React 19**, **Vite**, **TypeScript**, and **Tailwind CSS**, adhering to the **"Velvet Cinema & Ambient Obsidian"** design system specification (`Stitch.md`).

Rather than presenting static grids of movie posters that paralyze viewers with decision fatigue, **VELVET STREAM** elevates human routines, micro-moods, real-time completion forecasts, and multi-profile taste harmonization into first-class citizens.

---

## 🌟 Key Features & Architectural Innovations

### 1. Immersive Hero Billboard (Above the Fold)
- **Full-Bleed Dynamic Stage:** 78vh cinematic viewport with smooth gradient vignettes (`vignette-hero-bottom` and `vignette-hero-left`) that dissolve naturally into the swimlanes below.
- **"Why Watch Tonight" Editorial Pitch:** Replaces generic plot metadata with punchy, 1-sentence value propositions (e.g., *"A claustrophobic sci-fi thriller where every ticking minute counts"*).
- **Live "Finish By" Timestamp:** Dynamically calculates exact completion times based on your active system clock (`2h 14m • Finish by 10:45 PM`), updating every minute.
- **Pacing & Vibe Pills:** Instant scannable indicators (`[Slow-Burn Mystery]`, `[Dialogue-Heavy]`, `[Edge-of-Seat]`).
- **Cognitive Load Badges:** Clear cues indicating whether a title is `Background-Friendly` vs. `Requires Full Attention / Subtitles`.
- **Non-Intrusive Trailer Preview:** Defaults to calm key-art with subtle Ken-Burns motion, with a 1-click toggle to video preview mode with persistent audio mute memory.

### 2. Netflix-Inspired Horizontal Swimlanes & Smart Hover Cards
- **Momentum Horizontal Carousels:** Categorized by human routines and emotional contexts rather than rigid genres:
  - *90-Minute Brain-Off Movies* (Zero mental overhead, finish before bedtime).
  - *Watch While Eating Dinner* (Brisk, mouthwatering, easy to follow between bites).
  - *Critically Acclaimed Weekend Epics* (Monumental 2.5-hour cinematic journeys).
  - *Top 10 in Your Household* (Household consensus hits with rank numerals).
  - *Quick Bites & Fast Laughs (Under 30m)* (High joke-density sitcoms).
  - *Deep Focus & Mind-Benders* (Complex puzzle-box thrillers).
- **250ms Hover Intent Delay:** Prevents accidental pop-up jitter during vertical scrolling.
- **Spring-Scale Hover Expansion:**
  - Auto-playing preview with bottom gradient fade.
  - Quick action dock: Circular Play, + Tonight's Shortlist, Thumbs Up/Down rating, Chevron Down (more info).
  - Live "Finish-By" timestamp banner and Vibe Match reason (*"96% Match • Because you liked dark workplace satires"*).

### 3. Anti-Decision-Fatigue Discovery Bar
- **Sticky Glassmorphic Ribbon:**
  - **Time Available:** `[All Times]`, `[Under 30m]`, `[Under 90m]`, `[Full Movie Night]`.
  - **Current Mood:** `[All Moods]`, `[Need a Laugh]`, `[Cozy & Comforting]`, `[Mind-Bending]`, `[Adrenaline Rush]`, `[Background Friendly]`.
  - Instant 1-click filter reset with live matching count.
- **"Pick For Us" (3-Card Showdown):**
  - Tactile showdown modal that eliminates decision paralysis by presenting 3 distinct contenders.
  - Users eliminate 2 options to crown the winner, triggering a celebratory confetti burst and instant 1-click playback.

### 4. "Catch Me Up" Continue Watching Cards with Spoiler-Locked Recaps
- **Exact Progress Retention:** 3px crimson progress bar with time-remaining badges (`10m left`, `Paused 9 days ago`).
- **15-Second Spoiler-Safe Recaps:** Context engine maps series episodes and movie acts to pre-indexed plot summaries, serving only recap bullets strictly $\le$ the user's saved `progressSeconds`. Unreached twists are mathematically locked out.

### 5. "Who's Watching Together?" Household Taste Blender
- **Clickable Avatar Group:** Toggle multiple household members (`Alex`, `Sam`, `Jordan`, `Maya`) to activate Co-Watching mode.
- **Harmonic Taste Intersection Engine:**
  - Calculates weighted joint match scores.
  - Automatically filters out titles either member has already finished.
  - Generates a custom consensus row: *Shared Harmony (Alex + Sam)* with transparent compromise notes.

### 6. Time-of-Day Swimlane Orchestrator
- **Dynamic Chrono-Reordering:** Automatically re-ranks carousel rows based on local time and day of week:
  - *Weekday Lunch (11 AM - 3 PM):* Prioritizes 20-minute sitcoms and quick lunch bites.
  - *Weekend Prime (6 PM - 11 PM):* Promotes 2.5-hour prestige cinema and mind-benders.
  - *Late Night (11 PM - 4 AM):* Surfaces low-anxiety 90-minute brain-off comfort movies.
- **Time Simulation Dropdown:** Includes a 1-click simulator to test how the interface adapts to different time routines.

### 7. Ambient Cinema Glow
- The background canvas subtly cross-fades an ultra-wide radial blur (`filter: blur(140px)`, 700ms cubic bezier) to match the dominant color of the currently focused hero title or hovered card.

### 8. Tonight's Shortlist & Interactive Video Player
- **Queue Forecast:** Aggregates total queued runtime and live finish time (`3h 8m total • Finish by 10:32 PM`).
- **Cinema Video Player:** Full-screen simulated streaming player with scrubber, seek controls, audio adjustment, subtitles, and instant 15-second recap overlay.

---

## 🛠️ Tech Stack & Design Tokens

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 + Custom Obsidian Design Tokens
- **Icons:** Lucide React
- **Animations & Effects:** Custom Ken-Burns keyframes, Spring cubic-bezier transitions, Canvas Confetti
- **Key Tokens:**
  - `canvas-obsidian-base`: `#0B0C0E`
  - `surface-card-idle`: `#181A20`
  - `surface-card-expanded`: `#1F222A`
  - `accent-crimson`: `#E50914`
  - `accent-match-emerald`: `#34D399`
  - `accent-cinema-gold`: `#FBBF24`

---

## 🚀 Getting Started

```bash
# Navigate to project directory
cd "Movie Streaming Interface"

# Install dependencies (already installed)
npm install

# Start development server
npm run dev

# Run production build
npm run build
```
The interface is accessible locally at `http://127.0.0.1:5173/`.
