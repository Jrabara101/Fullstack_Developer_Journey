---
name: Aerie Atmospheric Editorial
colors:
  surface: '#0c1323'
  surface-dim: '#0c1323'
  surface-bright: '#32394b'
  surface-container-lowest: '#070e1e'
  surface-container-low: '#141b2c'
  surface-container: '#191f30'
  surface-container-high: '#232a3b'
  surface-container-highest: '#2e3446'
  on-surface: '#dce2f9'
  on-surface-variant: '#dbc1b3'
  inverse-surface: '#dce2f9'
  inverse-on-surface: '#293041'
  outline: '#a38c7f'
  outline-variant: '#554338'
  surface-tint: '#ffb787'
  primary: '#ffb787'
  on-primary: '#502400'
  primary-container: '#d9782d'
  on-primary-container: '#471f00'
  inverse-primary: '#964900'
  secondary: '#7bd0ff'
  on-secondary: '#00354a'
  secondary-container: '#00a6e0'
  on-secondary-container: '#00374d'
  tertiary: '#f9bd22'
  on-tertiary: '#402d00'
  tertiary-container: '#b98a00'
  on-tertiary-container: '#382800'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdcc7'
  primary-fixed-dim: '#ffb787'
  on-primary-fixed: '#311300'
  on-primary-fixed-variant: '#723600'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#ffdf9f'
  tertiary-fixed-dim: '#f9bd22'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5c4300'
  background: '#0c1323'
  on-background: '#dce2f9'
  surface-variant: '#2e3446'
typography:
  headline-hero:
    fontFamily: Inter
    fontSize: 104px
    fontWeight: '300'
    lineHeight: 104px
    letterSpacing: -0.04em
  headline-hero-mobile:
    fontFamily: Inter
    fontSize: 72px
    fontWeight: '300'
    lineHeight: 76px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  human-summary:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.01em
  day-label:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  metric-value:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  section-label:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-md: 1.5rem
  gutter-lg: 2rem
  margin: 1rem
  margin-md: 2rem
  margin-lg: 3.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system expresses atmospheric meteorological data through an editorial lens. It marries deep naturalistic horizon gradients with high-refraction glassmorphism, evoking the clarity, vastness, and tranquility of open skies. It transforms utilitarian weather telemetry into an ambient, visceral experience.

The visual style is characterized by:
- **Atmospheric Depth:** Full-bleed sky transitions layered beneath optically calibrated frosted glass.
- **Editorial Legibility:** Crisp, featherweight typographic hierarchy prioritizing high-contrast readouts and poetic meteorological summaries over cluttered technical dashboards.
- **Ethereal Refraction:** Soft translucent backdrops, diffuse ambient occlusion, and fine specular highlight borders simulating physical optical glass.
- **Intentional Purity:** Elimination of artificial skeuomorphism, heavy opaque cards, and raw mechanical data tables in favor of structured atmospheric capsules and breathable whitespace.

## Colors

Color is dynamic, environmental, and foundational. Atmospheric full-bleed canvases shift based on local solar time and meteorological conditions, engineered specifically with darkened thresholds to maintain uncompromising contrast for pure white typography.

### Sky Canvases (Top to Bottom Gradients)
- **Golden Hour (Default Hero):** `linear-gradient(180deg, #1F2A44 0%, #7A3A16 52%, #D9782D 100%)` — dramatic dusk twilight.
- **Clear Day:** `linear-gradient(180deg, #1E5AA8 0%, #4F8FD0 100%)` — deep azure transition to radiant sky blue.
- **Overcast:** `linear-gradient(180deg, #3D4656 0%, #7C8798 100%)` — balanced slate storm silver.
- **Night Clear:** `linear-gradient(180deg, #0B1222 0%, #1E293B 100%)` — midnight obsidian navy.

### Text & Readability Tiers
- **Text Primary:** `#FFFFFF` — used for hero temperatures, current conditions, primary headings, and critical values.
- **Text Secondary:** `rgba(255, 255, 255, 0.78)` — used for section headers, temporal labels, and primary metadata.
- **Text Muted:** `rgba(255, 255, 255, 0.60)` — used for sub-labels and units. Never rendered below 13px to guarantee accessibility.

### Semantic Meteorological Accents
- **Sun / UV Index:** `#FBBF24` (Warm Amber Gold)
- **Precipitation / Humidity:** `#38BDF8` (Electric Sky Cyan)
- **Optimal Outdoor Window:** `#34D399` (Emerald Mint)
- **Weather Advisory / Hazard:** `#F87171` (Coral Rose)

### Under-Glass Protective Tint
When rendering over high-luminance canvas stages (such as the base of Golden Hour or mid-day Clear Day), glass containers must implement an underlying veil of `rgba(10, 12, 20, 0.18)` beneath the blur stack to eliminate luminance bleed and prevent white typography wash-out.

## Typography

The typographical voice balances editorial restraint with high-efficiency scientific readouts. Inter is applied universally to establish clean geometric consistency and pristine optical rendering across devices.

### Tabular Formatting
All numerical metrics, degrees, barometric readings, wind vectors, and timestamps must explicitly leverage `font-variant-numeric: tabular-nums` to ensure stability and alignment across real-time dynamic data changes.

### Typographic Hierarchy
- **Hero Temperature:** Rendered ultra-light (`font-weight: 300`) with tight tracking (`-0.04em`), floating cleanly against the ambient sky canvas without heavy visual mass.
- **Human Summary:** Formatted as prose (`20px`, `font-weight: 500`, `line-height: 1.4`) to convey poetic conditions (e.g., *"Gentle breeze continuing into twilight with scattered cloud cover"*).
- **Section Labels:** Strict uppercase styling with expanded tracking (`0.08em`) and semi-bold weighting, surfaced using secondary text opacity.

## Layout & Spacing

The layout is built around a full-bleed, edge-to-edge canvas where components float like atmospheric instruments.

### Layout Model
- **Mobile (< 768px):** Single-column fluid stacked layout. Section margins are fixed at `1rem`. Hero temperature and condition summaries take the top focal area, followed by horizontally scrolling 24-hour capsules and vertical 7-day projection panels.
- **Tablet (768px – 1024px):** 8-column layout with `1.5rem` gutters and `2rem` outer page margins. Metrics group into 2-column modular glass clusters.
- **Desktop (> 1024px):** 12-column structured grid with a maximum content container width of `1280px` centered within the viewport. Spacing scales to `2rem` gutters and `3.5rem` margins. The primary display divides into an expansive editorial hero overview (columns 1–7) alongside a modular diagnostic grid (columns 8–12).

### Structural Rules
- Layouts must breathe; maintain at least `space-xl` vertical margins between primary atmospheric chapters.
- Horizontal metric lists must clip to parent bounds cleanly using CSS masks with directional linear fades (`mask-image: linear-gradient(...)`) rather than harsh edge cuts.

## Elevation & Depth

Visual hierarchy is constructed entirely through optical refraction, surface luminosity, and subtle ambient occlusion. Opaque elevations, harsh cast shadows, and heavy outlines are strictly prohibited.

### Elevation Architecture
1. **Base Atmosphere (Z0):** The raw sky canvas gradient. Unbroken and continuous.
2. **Glass Container (Z1):**
   - Background: `rgba(255, 255, 255, 0.12)`
   - Backdrop Filter: `blur(20px)`
   - Under-Tint (on bright skies): `rgba(10, 12, 20, 0.18)`
   - Border: `1px solid rgba(255, 255, 255, 0.18)`
   - Shadow: `0 8px 32px 0 rgba(0, 0, 0, 0.20)`
   - Usage: Primary forecast containers, multi-hour timelines, radar plates.
3. **Glass Raised (Z2 - Interactive / Hover / Expanded):**
   - Background: `rgba(255, 255, 255, 0.20)`
   - Backdrop Filter: `blur(24px)`
   - Border: `1px solid rgba(255, 255, 255, 0.28)`
   - Shadow: `0 12px 40px 0 rgba(0, 0, 0, 0.28)`
   - Usage: Active hourly items, focused search controls, popover condition breakdowns.

### Highlight Vector
Borders simulate the physical edge of glass. When technically feasible, apply an asymmetric top-to-bottom border gradient (`linear-gradient(180deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.08) 100%)`) to emulate downwelling sky luminance catching the top bevel of the physical glass pane.

## Shapes

The geometric signature uses smooth, human-scale curved containers paired with full circular pills for persistent navigation and spatial chips.

### Geometry Hierarchy
- **Outer Glass Containers & Panels:** `24px` border radius (`rounded-xl` context) creates soft, organic containment that frames background cloud and gradient forms.
- **Inner Metric Units & Hourly Cells:** `16px` border radius (`rounded-lg` context) nested inside the primary panels, establishing visual rhythm and mathematical harmony.
- **Controls, Location Badges, and Search:** `9999px` full-pill geometry (`rounded-full`) signaling complete tactile interactability and standalone status.

## Components

### Iconography
- Icons use clean, duotone line geometry built on a 24px grid with 1.5px and 2px stroke weights.
- Features a subtle ethereal glow (`filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.35))`).
- Strictly vector strokes. Emoji representations of weather phenomena are never allowed.

### Buttons & Interactive Pills
- **Primary Pill Action:** Pill-shaped (`rounded-full`), padded `10px 20px`. Background `rgba(255, 255, 255, 0.16)` with `1px` border `rgba(255, 255, 255, 0.25)`. On hover, scale smoothly to `rgba(255, 255, 255, 0.24)` with backdrop blur `20px`.
- **Secondary Icon Trigger:** `44x44px` circular glass button for settings, radar toggles, and geolocation.

### Location & Search Bar
- Floating capsule styling (`height: 48px`, `border-radius: 9999px`) utilizing `glass` tokens.
- Placeholder text in Text Muted (`rgba(255, 255, 255, 0.60)`). Search input text set in Text Primary.
- Focus state activates `glass-raised` with a subtle white halo (`box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3)`).

### Metric Cards & Grids
- Inner cards inside main containers use `16px` corner radii and subtle internal padding (`16px`).
- Consists of:
  - Top row: Semantic Icon (18px) + Section Label (12px uppercase).
  - Center: Tabular Value (24px to 28px, semi-bold).
  - Bottom: Contextual micro-prose (13px, Text Muted) or sparkline mini-graph.

### Hourly Timeline Strip
- Horizontally scrollable container with hidden scrollbars and edge fading.
- Each time slot is a vertical pill or card (`rounded-lg`, `padding: 12px 14px`).
- Current active hour receives `glass-raised` styling with an accentuated accent indicator dot (`#FBBF24` for sun or `#38BDF8` for precipitation).

### Extended Forecast List
- Clean segmented glass row items separated by `1px solid rgba(255, 255, 255, 0.08)`.
- Left-aligned Day Label (`16px`, semi-bold), center-aligned icon and precipitation probability percentage (`13px`, `#38BDF8`), right-aligned temperature range bar showing low to high with tabular metrics.

### Alerts & Banners
- Encased in a `glass` surface featuring an inset left border accent (`3px solid #F87171`).
- Contains high-priority advisory warnings with concise summary text, maintaining translucent fidelity without jarring solid banner blocks.