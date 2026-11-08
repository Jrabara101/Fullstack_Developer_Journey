# ARTIST-OS // Flagship Direct-to-Fan Music Artist Platform

> **An atmospheric, artist-owned digital flagship and direct-to-fan commerce engine** uniting the tactile analog hardware precision of Teenage Engineering and Ableton, the direct-to-fan economics and archival depth of Bandcamp, the transparent no-scalper ticketing of DICE and Resident Advisor, and the cinematic world-building of A24 and NTS Radio.

---

## Key Highlights & High-Impact Features

### 1. Interactive Discography, 4-Track Stem Isolator & "Era-Shifting" Audio Dock
* **Uninterrupted Persistent Vinyl/Tape Audio Dock:**
  A floating hardware-inspired master audio deck pinned to the bottom of the viewport that continues playing seamlessly at 60fps across route navigation, drawer toggles, and checkout steps. Built on the Web Audio API with real-time `AnalyserNode` frequency spectrum bars and 4-channel `GainNode` stem mixing.
* **Album "Era" Chameleon Theme Switcher:**
  Dynamically morphs the site's accent typography, ambient backlights, waveform shaders, and hardware badges across the artist's discography:
  - **`2026 LP: NOCTURNE IN CHROME`**: Laser Crimson (`#FF3366`) & Oscilloscope Cyan (`#00F0FF`)
  - **`2024 LP: SOLAR FLARE`**: Analog VU Amber (`#FF6B00`) & Solar Gold (`#FFD000`)
  - **`2022 EP: ECHO CHAMBER`**: Synthesizer Ultraviolet (`#A855F7`) & Radar Blue (`#3B82F6`)
* **Tactile 4-Channel Stem Mixer & Time-Synced Lyrics:**
  Fans can toggle individual **Solo** and **Mute** states across 4 channels (`Vocals`, `Analog Synths`, `Drums & 909`, `Sub Bass`) with real-time LED volume meters. Interactive karaoke-synced lyrics allow 1-click audio seeking to any millisecond.
* **Canvas Waveform Scrubber & Timed Fan Reactions:**
  Displays played progress in the active era accent, buffered range, and glowing interactive appreciation markers (`🔥 @ 02:14 • "That filter sweep!"`). Fans can post their own millisecond-pinned reactions directly onto the waveform.

### 2. Geo-Targeted Tour Horizon & Anti-Scalper Setlist Ledger
* **Geo-Aware "Nearest Show to You" Spotlight:**
  Resolves browser coordinates or edge IP via Haversine calculation to elevate the closest upcoming concert (`"📍 Playing 14 miles from you at The Regency Ballroom — Friday, Nov 20 • Only 19 Tickets Left"`).
* **Transparent Velocity Pills & Verified Fan Presales:**
  `On Sale`, `Low Tickets < 10%`, `Sold Out — Join Waitlist`, `VIP Soundcheck Upgrade`. Fans enter passcode `CHROME2026` to unlock anti-scalper presale tiers 48 hours early.
* **"Demand My City" Crowd-Routing Heatmap:**
  Fans pledge their cities and emails to unlock tour additions, featuring a live global leaderboard (Manila, Seoul, Montreal, Berlin, Mexico City, Taipei).
* **Past Tour Setlist & Bootleg Archive:**
  Toggles between upcoming schedule and 142 documented past shows, complete with 18-song setlists, direct soundboard audio tapes, venue posters, and fan concert photos.

### 3. Direct-to-Fan Vinyl Pressing Matrix & Venue Pickup Mode
* **Interactive Vinyl Sleeve & Variant Inspector:**
  Hovering slides the 33⅓ RPM vinyl disc out of its gatefold jacket. Swapping swatches (`180g Oxblood Marble`, `Liquid Chrome`, `Standard Black`, `Japanese Obi-Strip`) updates disc textures and live stamped edition numbers (`#034 / 500 Remaining`).
* **Smart "Era Bundle" Configurator (LP + Tour Hoodie + Poster):**
  Combines vinyl pressings with tour apparel to unlock automatic 15% savings, dynamically splitting immediate 24-bit lossless digital delivery from physical fulfillment.
* **"Skip the Merch Line" Live Venue Pickup Mode:**
  Fans at or attending concerts can toggle checkout fulfillment to **`[ 🎫 Venue Pickup Tonight — Booth #2 ]`** for $0.00 shipping, receiving an authentic cryptographic Apple Wallet / QR Pickup Pass to collect pre-packed items without waiting in line.
* **Instant Digital Lossless Vault:**
  Pre-orders and vinyl buyers unlock instant midnight 24-bit/96kHz `.WAV`, `.FLAC`, and `320kbps MP3` digital downloads with 30-day token expiration.

### 4. Zero-Jank Omni-Platform Media Embeds & Cinema Video Stage
* **Performance-First "Facade" Streaming Switcher:**
  4K Live KEXP Sessions, Tokyo Studio 2 Modular Session, and Official Music Videos load with lightweight custom facades that only mount third-party iframes upon click—preserving a 99+ Lighthouse score.
* **Cross-Play Auto-Ducking Handshake:**
  Starting a video or platform embed smoothly ducks and pauses the site's persistent bottom vinyl dock (and vice versa) so audio streams never clash simultaneously.

---

## Tech Stack & Architecture

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti |
| **Audio Engine** | Web Audio API (`AudioContext`, `GainNode` stem sub-mix, `AnalyserNode` FFT, Oscillator synthesizers) |
| **Backend** | Node.js, Express, ES Modules, RESTful APIs, Haversine Geo-Resolver, Node Native Test Runner |
| **Database** | PostgreSQL / Supabase schema (`database/schema.sql`) with strict integer-cents, row-level locks, JSONB |
| **Commerce** | Direct-to-Fan stripe simulation, atomic inventory locks, Apple Wallet / QR Pickup token generator |

---

## Quickstart & Running the Project

### 1. Install Dependencies
```bash
# In the root project directory:
npm install

# In backend and frontend (if not already installed):
npm --prefix backend install
npm --prefix frontend install
```

### 2. Run Both Frontend and Backend Concurrently
```bash
npm run dev
```
* **Frontend:** http://localhost:5173
* **Backend API:** http://localhost:4000/api/v1/health

### 3. Run Backend Test Suite
```bash
npm run test
```

### 4. Build Frontend for Production
```bash
npm run build
```

---

## Database Schema (`database/schema.sql`)
Includes full DDL for PostgreSQL / Supabase:
- `albums` & `tracks` (with multi-channel stem registry, synced lyrics, waveform peaks, gear notes)
- `tour_dates` & `city_demand_pledges`
- `merch_products` & `merch_variants` (with strict `price_cents` and concurrency row locks)
- `orders`, `venue_pickup_passes`, and `digital_vault_tokens`
- Stored procedure `deduct_merch_inventory` with `SELECT FOR UPDATE` to prevent overselling limited drops.

