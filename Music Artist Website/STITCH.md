# Design System Specification: Music Artist Flagship Website (STITCH.md)

Production-grade UI design specification and component architecture for the Artist Flagship Website featuring an Era-Shifting Discography & Stem Player, Geo-Aware Tour & Setlist Ledger, Direct-to-Fan Vinyl & Merch Boutique, and Omni-Platform Media Embed Theater.

---

## 1. Visual Identity & Aesthetic Principles
* **Design Philosophy:** Tactile analog audio hardware meets underground editorial journalism (synthesizing the industrial precision of Teenage Engineering and Ableton Live, the direct-to-fan economics and archival depth of Bandcamp, the transparent no-scalper ticketing of DICE and Resident Advisor, and the cinematic world-building of A24 and NTS Radio).
* **Atmospheric Era Immersion & Hardware Chrome:** Deep studio-obsidian surfaces (`#07080A`), subtle analog film grain (`opacity: 0.035`), exposed `1px` structural hairlines (`border-white/10`), and anodized metallic control surfaces.
* **Tabular Catalog & Timecode Precision:** Every timestamp (`03:48 / 04:12`), BPM counter (`124 BPM`), musical key (`D Minor`), catalog serial number (`CAT-026LP`), tour date, edition counter (`#034 / 500`), and merch price (`$38.00`) enforces strict tabular monospace numerals (`tabular-nums`) for authentic studio hardware legibility.

---

## 2. Design Tokens

### Color Palette
* **Canvas Primary (Studio Obsidian — Default):** `#07080A` (Deep Mastering Room Black)
* **Canvas Secondary (Archival Liner-Notes Paper):** `#F5F4EF` (Unbleached Gatefold Paper)
* **Surface Secondary (Cards, Tour Ledger, Stem Channels):** `#101216` (Dark) / `#EAE8E1` (Light)
* **Surface Elevated (Persistent Audio Dock, Cart Drawer, Modals):** `rgba(13, 15, 20, 0.95)` with `backdrop-filter: blur(24px)`
* **Borders & Exposed Grid Hairlines:** `rgba(255, 255, 255, 0.10)` (Default Grid) / `rgba(255, 255, 255, 0.22)` (Hardware Bezel)
* **Text Primary:** `#F8FAFC` (Pure Signal White)
* **Text Muted:** `#8E95A5` (Brushed Aluminum) / `#5A5D64` (Muted Timecode)

### Dynamic "Album Era" & Audio Telemetry Accent Tokens
* **Era 1 Default ("Nocturne in Chrome" — 2026 LP):**
  * Accent: `#FF3366` (Laser Crimson)
  * Secondary: `#00F0FF` (Oscilloscope Cyan)
  * Background: `#07080A`
* **Era 2 ("Solar Flare" — 2024 LP):**
  * Accent: `#FF6B00` (Analog VU-Meter Amber)
  * Secondary: `#FFD000` (Solar Gold)
  * Background: `#090705`
* **Era 3 ("Echo Chamber" — 2022 EP):**
  * Accent: `#A855F7` (Synthesizer Ultraviolet)
  * Secondary: `#3B82F6` (Radar Blue)
  * Background: `#08060E`

### Real-Time LED Peak Indicators & Inventory Badges
* **Audio Peak / Active Stem Solo:** `#10B981` (Signal Emerald LED)
* **On Sale / In Stock / Lossless Ready:** Fill `rgba(16, 185, 129, 0.12)`, Text `#34D399`, Border `rgba(16, 185, 129, 0.25)`
* **Low Tickets (<10% Left) / Limited Vinyl (<50 Copies):** Fill `rgba(245, 158, 11, 0.15)`, Text `#FBBF24`, Border `rgba(251, 191, 36, 0.35)`
* **Sold Out / Archive Pressing:** Fill `rgba(239, 68, 68, 0.12)`, Text `#F87171`, Border `rgba(248, 113, 113, 0.25)`
* **Verified Fan Presale / Venue Pickup Pass:** Fill `rgba(0, 240, 255, 0.12)`, Text `#00F0FF`, Border `rgba(0, 240, 255, 0.35)`

### Typography
* **Artist Wordmark & Album Titles:** `Syne` (`text-5xl` to `text-8xl`, `font-extrabold`, uppercase tracking `-0.03em`, line-height `0.94`).
* **Editorial Liner Notes & Lyrics:** `Newsreader` (`text-lg` to `text-2xl`, `italic` accents for liner notes & pull-quotes).
* **Catalog Numbers, Durations, Tour Dates & Prices:** `JetBrains Mono` (`11px` to `14px`, `tabular-nums` mandatory).
* **UI Controls & Labels:** `Inter` (`12px` to `15px`, `font-medium` to `font-bold`).

---

## 3. Core Component Hierarchy
1. **`Navbar`**: Sticky studio navigation with artist monogram, catalog serial chip `[ SYS // ARTIST-OS v2.6 ]`, live Era chameleon theme dropdown, quick anchor jumps, Backstage SMS trigger, and Cart bag trigger with dynamic total and bundle badge.
2. **`EraHeroAndLatestReleaseStage`**: Asymmetric 2-column hero with provenance badge, oversized title, press quote ticker, `[ ▶ Play Full Album & Stems ]` button, `[ 💿 Order Limited 180g Vinyl ]` button, omni-platform streaming links, and interactive 3D gatefold sleeve with 33⅓ RPM rotating vinyl disc.
3. **`PersistentHardwareAudioDock`**: Bottom-pinned master audio deck with spinning mini-vinyl thumbnail, track/BPM/key metadata, hardware transport controls, canvas peak waveform scrubber with timed fan reaction pins, 4-stem mixer trigger, synced lyrics trigger, live 8-band LED spectrum analyzer, and media ducking alert chip.
4. **`StemMixerDrawer`**: Slide-up console featuring 4 hardware channels (`Vocals`, `Analog Synths`, `Drums & 909`, `Sub Bass`), per-channel tactile Solo & Mute buttons, volume faders, and live Web Audio level meters.
5. **`SyncedLyricsModal`**: Interactive karaoke lyrics viewer auto-scrolling with current playback, highlighting active timestamps in the active era accent and allowing 1-click seeking.
6. **`DiscographyAndLinerNotesVault`**: Catalog filter bar (`All`, `Studio LPs`, `EPs`), split-pane inspector with tracklist table (animated equalizers on active track), 4-stem mini console, and segmented tabs for Lyrics, Studio Hardware Gear (Sequential Prophet-6, Space Echo, etc.), and Vinyl Pressing Specs.
7. **`GeoTourDatesAndSetlistHub`**: Mode switcher between upcoming dates and past show archives (142 shows), nearest show spotlight banner with Haversine distance detection, tabular schedule with ticket velocity pills, anti-scalper presale verification modal, "Demand My City" crowd routing heatmap & leaderboard, and past show setlist drawer.
8. **`MerchAndVinylBoutique`**: Direct-to-fan boutique with fulfillment switcher (`Ship Worldwide` vs `Pick Up at Venue Tonight`), 2-column flagship vinyl gatefold inspector with color variant swatches, stamped remaining edition counters, 480GSM heavyweight tour hoodies, screenprints, and 15% automatic bundle discounts.
9. **`OmniMediaTheaterGrid`**: Zero-jank facade player for 4K live sessions (KEXP Seattle, Tokyo Studio 2, Official 4K Music Video) with chapter markers, theater expansion mode, official platform streaming tabs, and cross-play auto-ducking handshake.
10. **`UnifiedCartAndBundleDrawer`**: Slide-over bag with hybrid fulfillment switching (`Ship to Address` vs `Venue Pickup Booth #2`), 15% bundle discount progress bar, and Stripe/Apple Pay checkout simulation.
11. **`OrderSuccessModal`**: Post-checkout modal rendering cryptographic Apple Wallet / QR Venue Pickup Pass and 24-bit/96kHz Lossless Vault Download links.
12. **`BackstagePresaleModal`**: Fan club dispatch modal granting verified anti-scalper passcodes (`CHROME2026`).
13. **`LinerNotesDeepDiveModal`**: Fullscreen archival dossier with recording chain schematics and synth patch documentation.
14. **`Footer`**: Studio telemetry, copyright, links, and quick jump to top.

---

## 4. Concurrency-Safe Database Schema (PostgreSQL)
* File: `database/schema.sql`
* Features:
  * Strict integer cents math (`price_cents`, `subtotal_cents`, `total_cents`)
  * Enum types for `release_type`, `ticket_status`, `merch_category`, `fulfillment_mode`, `order_status`
  * Row-level locking function `deduct_merch_inventory` using `SELECT ... FOR UPDATE` to eliminate overselling during high-traffic vinyl drops
  * Tables: `albums`, `tracks`, `tour_dates`, `city_demand_pledges`, `merch_products`, `merch_variants`, `orders`, `venue_pickup_passes`, `digital_vault_tokens`, `track_fan_reactions`

