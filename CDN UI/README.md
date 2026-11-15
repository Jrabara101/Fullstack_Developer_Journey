# EdgeStream Studio — Modern CDN & Edge Media Console

> A human-centric Content Delivery Network (CDN) & Edge Media Management UI for Images and Audio built with React 19, TypeScript, Vite, and Tailwind CSS.

![EdgeStream Studio Preview](https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80)

---

## 🌟 Key Product Differentiators

### 1. Interactive Image & Audio Edge Transformation Studio (Visual URL Builder)
- **Before / After "Payload Diet" Loupe:** Tactile, draggable split-screen curtain comparing raw origin uploads (`4.82 MB PNG`) against edge-optimized deliveries (`30.6 KB AVIF • -99.4%`) with a live perceptual quality badge (`[✨ Visually Lossless on Retina Displays]`).
- **Smart Gravity Pin & Multi-Ratio Previewer:** 1-click on any subject or face drops a **Smart Gravity Pin**, dynamically re-framing 4 live derivative previews:
  - `16:9 Desktop Hero` (`1920 × 1080`)
  - `4:5 Mobile Feed` (`1080 × 1350`)
  - `1:1 Avatar / Thumbnail` (`800 × 800`)
  - `1.91:1 OpenGraph Social Card` (`1200 × 630`)
- **Visual "Broken Crop & Text Cutoff" Guard:** Detects when an aspect-ratio crop risks slicing through detected facial or product saliency safe zones, automatically nudging the framing safely into view.
- **Audio Edge Mastering & Bitrate Audition Dock:**
  - Real Web Audio API synthesizer with authentic audio processing.
  - Live bitrate auditioning: `[🎧 Studio 320k]`, `[📱 Edge Opus 96k]`, and `[🚇 Commute 48k (bandpass cellular compression)]`.
  - 1-click **Broadcast Loudness Normalization (`-16 LUFS`)**.
  - Interactive scrubbable 120-point bar waveform with draggable URL trim handles (`?start=14s&end=44s`).
  - Companion **Instant Scrub Waveform JSON** endpoint generator (`1.2 KB` companion payload).

### 2. "Real-World Human Connection" Latency & Progressive Load Simulator
- **1-Click Global Personas:**
  - `[🗼 Tokyo • Fiber 5G (14ms • Instant Edge Hit)]`
  - `[☕ Lisbon • Busy Cafe Wi-Fi (88ms)]`
  - `[🚇 New York Subway • Congested 3G (410ms • Data-Saver Mode)]`
- **Progressive Placeholder Choreography (First 200ms):**
  - **BlurHash Soft Wash:** 32-byte hash gradient wash.
  - **Dominant Color Palette Matte:** Extracted OKLCH color swatches.
  - **Vector Silhouette Trace:** 1.1 KB lightweight inline SVG.
  - Interactive "Replay Load Sequence" with real-time millisecond TTFB ticker and scanline decoding.
- **"Smart Network Empathy" (Save-Data Auto-Downgrade):** Automatically downgrades 4K masters to crisp WebP and audio to 48kbps Opus on `Save-Data: on` without breaking page layout.

### 3. Demystified Cache Control & "Why Is My Old File Showing?" Debugger
- **Plain-English Cache Presets:**
  - `[🔒 Permanent Brand Asset]` — `Cache-Control: public, max-age=31536000, immutable`
  - `[🔄 Evolving Campaign Media]` — `Cache-Control: public, max-age=3600, stale-while-revalidate=86400`
  - `[⚡ Live Event Feed]` — `Cache-Control: public, s-maxage=60, must-revalidate`
- **Tactile "Purge Worldwide" Globe Strip:** 3-second animated propagation wave sequentially invalidating across Americas, Europe, Asia-Pacific, and Global Frontier PoPs.
- **Atomic Surrogate-Key Graph:** Invalidates 1 master + all 7 responsive variants simultaneously (`sk_img_autumn_hero_8f3a`).
- **"Zero-Downtime Asset Swap" (Versioned Alias Pinning):** Swap master files with zero downtime while keeping the exact same public URL, with 1-click version rollback.

### 4. High-Impact Bandwidth Economics, Security & Developer Ergonomics
- **"Bandwidth Thief" & Hotlink Shield Radar:**
  - Visual security monitor tracking unauthorized scrapers and referrer domains.
  - 1-click response controls: `[🛡️ Block Request (403)]`, `[🏷️ Serve Watermarked Low-Res Preview]`, `[✅ Whitelist Partner Domain]`.
  - Live client preview simulating exact responses.
- **Plain-Language "Savings & Speed Receipt":**
  - Clear financial and environmental telemetry: `"Edge Optimization saved 1.84 TB of origin egress this month ($147.20 saved) and slashed mobile load latency by 1.9s."`
  - Detailed breakdown of avoided egress costs, carbon offset (42.6 kg CO₂e), and saved mobile battery hours.
- **1-Click "Drop-In Component" Recipe Drawer:**
  - React `<EdgeImage />` with BlurHash, intrinsic aspect-ratio, and responsive srcset.
  - Semantic HTML `<picture>` element.
  - React `<EdgeAudioPlayer />` with pre-computed waveform companion URL.
  - Raw copyable edge CDN query strings.

---

## 🛠️ Tech Stack & Architecture

- **Framework:** React 19, TypeScript
- **Bundler:** Vite 8
- **Styling:** Tailwind CSS with custom studio color tokens (`canvas-edge-obsidian`, `canvas-console-panel`, checkerboard inspection grid)
- **Audio Engine:** Web Audio API with oscillators, BiquadFilter (lowpass, bandpass), and GainNodes for LUFS gain normalization
- **Icons:** Lucide React

---

## 🚀 Getting Started

```bash
# Navigate to the project directory
cd "CDN UI"

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The application runs at `http://localhost:5173/`.
