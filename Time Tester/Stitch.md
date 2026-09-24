# SYNAPSE // Reflex Telemetry Deck — UI Design System & Technical Spec (Stitch.md)

## System Identity & Philosophy
- **Name**: SYNAPSE Reflex Telemetry Deck (F1 / Aerospace Grade Reflex Combine)
- **Aesthetic**: Tactical Avionics, Aerospace Biometric Telemetry, Cyber-Precision HUD
- **Target Audience**: Competitive Esports Athletes, Formula 1 Drivers, Combat Pilots, and Performance Biohackers

---

## 1. Color Palette Tokens
| Token Name | Hex Code | HSL / Tailwind | Usage |
| :--- | :--- | :--- | :--- |
| `void` | `#090A0F` | `zinc-950` / Deep Onyx | Default background canvas, report backing |
| `wait` | `#DC2626` | `red-600` / Crimson Tension | Anticipation phase (DO NOT CLICK) |
| `trigger` | `#16A34A` | `emerald-600` / Emerald Flash | Optical reflex stimulus (CLICK NOW) |
| `penalty` | `#D97706` | `amber-600` / False Start | Early trigger jump penalty |
| `telemetry-cyan` | `#06B6D4` / `#22D3EE` | `cyan-500` / `cyan-400` | Apex badges, glowing reticles, HUD accents |
| `hud-border` | `rgba(255,255,255,0.08)` | `zinc-800` | High-contrast frosted glass borders |

---

## 2. Typography
- **Primary Sans**: `Plus Jakarta Sans`, weights 400, 600, 700, 800, 900
- **Telemetry Monospace**: `JetBrains Mono`, weights 400, 500, 700, 800 (used for numeric latencies, HUD indicators, round chips, delta timestamps)

---

## 3. Micro-Animations & Sensory Visual Effects
- **Supersonic Shockwave Ripple**: Triggered on sub-190ms latencies. Expanding radial pulse originating precisely from click coordinates.
- **HUD Reticle Grid & Scanlines**: Sub-pixel 40px grid overlay (`rgba(255,255,255,0.02)`) with horizontal scanline interference.
- **Corner Telemetry Brackets**: 4-quadrant corner reticles framing the reaction viewport.
- **Rolling Digital Number Counter**: 200ms cubic-bezier ease-out rolling display showing resolved milliseconds down to 0.1ms precision.
- **Jarring Early Shake**: 0.15s rapid jitter animation when an early jump is triggered.

---

## 4. Audio Synthesis Architecture (Zero External Assets)
Web Audio API synthesizer with sub-millisecond scheduling:
- **Arm Phase**: 300Hz triangle wave (100ms duration, soft gain ramp)
- **Reflex Trigger**: 880Hz sine burst with 1760Hz harmonic overtone
- **Supersonic Apex (<190ms)**: Arpeggiated C-major chord (523Hz, 1046Hz, 2093Hz)
- **Early Penalty Alert**: 180Hz / 140Hz dual dissonant sawtooth buzz
- **Session Complete**: Descending then ascending telemetry sequence

---

## 5. Reflex Benchmark Archetypes
| Latency Range | Archetype Name | Tier | Percentile Placement |
| :--- | :--- | :--- | :--- |
| `< 170ms` | **Apex Pro / Fighter Pilot** | Tier 1 (Apex) | Top 0.5% |
| `171ms – 210ms` | **Esports Contender** | Tier 2 (Pro) | Top 5.0% |
| `211ms – 260ms` | **Median Human Baseline** | Tier 3 (Baseline) | Top 50.0% |
| `261ms – 330ms` | **Casual Reflex** | Tier 4 (Sub-Par) | Top 80.0% |
| `330ms+` | **Caffeine Deficient** | Tier 5 (Fatigued) | Bottom 20% |

---

## 6. Multi-Modal Reflex Modes
1. **Visual Flash**: Sudden color transition from Crimson Alert to Electric Emerald across 100% of viewport.
2. **Auditory Burst**: Instant acoustic frequency trigger testing auditory reaction latency (typically 30-50ms faster than optical processing).
3. **Peripheral Flank**: Target pip spawns at randomized polar coordinates testing peripheral vision saccade speed and visual search latency.

---

## 7. Circadian Bio-Rhythm & Fatigue Tracking
Sessions are cataloged with circadian timestamps:
- **Morning (05:00 - 11:59)**: Peak alertness window
- **Afternoon (12:00 - 17:59)**: Post-prandial / sustained focus window
- **Late Night (18:00 - 04:59)**: Neuromuscular fatigue degradation window
Stores rolling sessions in LocalStorage, plotting 7-day and 30-day interactive SVG trend sparklines.
