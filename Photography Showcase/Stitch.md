# Stitch.md — Photography Showcase UI Design System Specification

## 1. Design Philosophy & Aesthetic Direction
- **Theme Concept:** "Archival Cotton & Quiet Museum Space" — A radically restrained, gallery-focused interface inspired by Leica Galleries, Steidl photobooks, and Swiss exhibition catalogs.
- **Core Principle:** The photograph is sacred; the interface is whisper-quiet. Never overlay permanent text, icons, or heavy drop shadows onto the image canvas itself. At least 40% of the viewport must remain calm negative space ("gallery wall") so each frame commands undivided attention.
- **Visual Mood:** Tactile, unhurried, museum-grade, and timeless. Zero rounded corners on photographs (`border-radius: 0px` for art plates to preserve true frame edges), paired with razor-sharp hairlines and archival serif typography.

## 2. Dynamic Color Tokens & Surface Palette
The UI supports three gallery lighting environments (defaulting to **Archival Warm Cotton**) with zero saturated brand colors that could distort color perception of the photographs.

### Gallery Canvas Tokens (3-Way Lighting Toggle)
- `canvas-archival-cotton` (Default): `#F6F4F0` (Warm museum rag paper — eliminates harsh blue-light glare around photos)
- `canvas-matting-elevated`: `#ECE9E2` (Subtle inset matting for the Contact Sheet and Collector's Tray)
- `canvas-museum-white` (Alt Mode 1): `#FCFCFA` (Crisp neutral gallery wall)
- `canvas-darkroom-obsidian` (Alt Mode 2): `#0E0E0E` with `#161616` elevated surfaces (Low-light nocturnal viewing mode)

### Glass & Chrome Tokens (Floating Controls Only)
- `surface-glass-whisper`: `rgba(246, 244, 240, 0.82)` with `backdrop-filter: blur(16px)` (Used for the floating Curation Bar and Collector's Tray in daylight mode)
- `surface-glass-darkroom`: `rgba(14, 14, 14, 0.82)` with `backdrop-filter: blur(16px)` (Used in Darkroom mode and inside the Lightbox)
- `border-hairline-subtle`: `1px solid rgba(24, 24, 22, 0.09)` (Daylight) / `1px solid rgba(255, 255, 255, 0.10)` (Darkroom)

### Typography & Catalog Accent Tokens
- `text-ink-primary`: `#181816` (Deep carbon ink for titles and photographer name)
- `text-ink-secondary`: `#5C5A55` (Warm graphite for field notes, essays, and location labels)
- `text-ink-muted`: `#8C8982` (Catalog plate numerals `01 / 24`, aspect ratio tags, and inactive states)
- `accent-leica-vermilion`: `#D93829` (Used sparingly as a 6px micro-dot indicator for active filters, audio playing state, or items pinned to the Collector's Tray)
- `accent-frame-oak`: `#C8A97E` (Used for the "See It on the Wall" architectural frame border preview)

## 3. Typography & Scannable Hierarchy
- **Exhibition Display & Essay Font:** `Cormorant Garamond`, `Instrument Serif`, or `Newsreader` (Light `300` / Regular `400` / Italic `400i` — evokes fine-art exhibition catalogs).
- **UI & Functional Sans Font:** `Inter` or `Plus Jakarta Sans` (Regular `400`, Medium `500` — understated and invisible).
- **Catalog / Index Numerals:** `JetBrains Mono` or `IBM Plex Mono` (`font-variant-numeric: tabular-nums` — used for frame numbers `FIG. 04`, negative strip numbers `24A`, and print dimensions `24 × 36 IN`).
- **Scale:**
  - `Exhibition Series Title`: `3.25rem` (52px) desktop / `2.25rem` (36px) mobile, serif, font-weight `300`, letter-spacing `-0.02em`, line-height `1.1`
  - `Editorial Essay Lead`: `1.25rem` (20px), serif italic, line-height `1.6`, max-width `52ch`
  - `Field Note / Caption`: `0.9375rem` (15px), sans-serif, font-weight `400`, line-height `1.65`, color `text-ink-secondary`
  - `Catalog Plate Number`: `0.75rem` (12px), mono, letter-spacing `0.08em`, uppercase, color `text-ink-muted`
  - `Navigation & Filter Link`: `0.8125rem` (13px), sans-serif, font-weight `500`, letter-spacing `0.04em`

## 4. Layout Grid & Spacing System
- **Viewport Architecture:** 12-column Swiss exhibition grid (`max-width: 1440px`, `margin: 0 auto`, `padding: 0 64px` desktop, `0 20px` mobile).
- **Rhythm & Whitespace Rules:**
  - Vertical spacing between gallery rows: `120px` to `160px` on desktop (`64px` on mobile) to enforce slow, contemplative pacing.
  - **Row Pattern A (Solo Hero Plate):** Centered 8-column or 10-column span (`aspect-ratio` preserved).
  - **Row Pattern B (Asymmetric Offset Pair):** Left image spans `Cols 1–6` (aligned top); Right image spans `Cols 8–12` (pushed down `margin-top: 96px` for editorial rhythm).
  - **Row Pattern C (Locked Diptych):** Two matched frames spanning `Cols 2–11` with a tight `16px` gutter between them.
- **Border Radius:**
  - **Photographs:** `0px` (Strict sharp corners to honor the camera sensor's 35mm/medium-format frame edge).
  - **Floating UI Chrome (Filter Pill Bar & Modals):** `9999px` for floating bars, `8px` for drawer containers.

## 5. Component Specifications

### Component A: Whisper-Quiet Header & View Switcher
- **Anatomy:**
  - Fixed or static top bar (`height: 72px`, `padding: 0 64px`) with transparent background that subtly blurs only when scrolling up.
  - **Left Zone:** Photographer Name / Monogram in tracked-out uppercase or refined serif + current series indicator (`SERIES 03 — KYOTO NOCTURNES`).
  - **Center Zone (View Pacing Toggle):** Minimal segmented text switch: `[Exhibition]` • `[Contact Sheet (32)]` • `[Cinema / Essay]`.
  - **Right Zone:**
    1. **Gallery Lighting Dot:** Single circular swatch button (`18px × 18px`) that cycles between *Cotton*, *White*, and *Darkroom*.
    2. **Collector's Tray Counter:** Minimal link `Tray [03]` with a `6px` `accent-leica-vermilion` dot when non-empty.

### Component B: Exhibition Plate & Minimal Caption Block
- **Anatomy:**
  - **Image Frame:** Pure uncropped image container (`border-radius: 0px`) with subtle ambient pre-load placeholder matching the photograph's dominant hex color.
  - **Below-Frame Museum Label (Positioned `14px` beneath the bottom-left & bottom-right corners of the photo, never overlaid):**
    - *Left:* Catalog numeral in monospace (`04 / 24`) + Italic Serif Title (*"Rain on Sanjo Bridge"*).
    - *Right (Fades in softly on hover):* Humanized light tag (`Blue Hour • Kyoto`) + two quiet micro-actions: `[+ Collect]` and `[Inspect ↗]`.

### Component C: Contact Sheet Index View (Analog Film Strip Mode)
- **Anatomy:**
  - Activated via the top View Switcher; transitions the layout into a structured 6-column grid (`gap: 32px 24px`).
  - Each cell behaves like an analog contact sheet frame:
    - Fixed square bounding box (`aspect-ratio: 1 / 1`, `padding: 16px`, `background: canvas-matting-elevated`) containing the uncropped image centered via `object-fit: contain`.
    - Top-left corner displays monospace frame number (`24A`); bottom-right displays a subtle colour/mood dot.
    - Hovering dims non-related frames to `40%` opacity when filtering by a specific Color Swatch or Light Quality.

### Component D: "Loupe & Field Note" Lightbox + Wall-Scale Preview
- **Anatomy:**
  - Full-viewport modal (`100vw × 100vh`, `background: canvas-darkroom-obsidian`) where the image occupies up to `85vh` height and `85vw` width.
  - **Bottom Whisper Dock (Auto-fades after 2s idle):**
    1. **Story Toggle (`[Field Note]`):** Slides up a translucent glass card (`max-width: 480px`) displaying the 2-sentence story behind the shot, humanized camera context, and the **15-Sec Ambient Audio Player** (minimal waveform bar).
    2. **Wall-Scale Toggle (`[See on Wall]`):** Smoothly scales the photograph down into a calibrated architectural room elevation (showing a minimalist gallery bench or credenza silhouette below for scale reference) with frame toggles (`Unframed`, `Raw Oak`, `Matte Black`) and physical print sizes (`16×24"`, `24×36"`, `40×60"`).
    3. **Action CTA:** `[+ Add to Collector's Tray / Inquire]`.

## 6. Micro-Interactions & Motion Rules
- **FLIP Layout Transitions:** Switching between `Exhibition Flow`, `Contact Sheet Index`, and the `Lightbox` must use smooth shared-element FLIP transitions (`cubic-bezier(0.16, 1, 0.3, 1)`, duration `550ms`) so the clicked photograph seamlessly glides into place rather than popping abruptly.
- **No Zoom-Crop on Hover:** Never scale/crop photographs inside an `overflow: hidden` box on hover—that destroys the photographer's edge composition. Instead, subtly dim surrounding plates to `0.85` opacity or gently reveal the museum label below the frame.
- **Progressive Color-Matched Loading:** While high-res plates load, render the exact aspect-ratio box filled with the photograph's extracted dominant background hex color and a smooth `400ms` opacity cross-fade.

