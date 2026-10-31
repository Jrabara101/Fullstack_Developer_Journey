# NEXUS // Senior Game Architect Portfolio & Mechanics Lab

A browser-native game developer portfolio, interactive mechanics laboratory, and living dev-log archive built with **React 18**, **Vite**, **TypeScript**, **Tailwind CSS**, **Fastify**, and **SQLite (Prisma)**.

---

## ⚡ Quick Start

From the root directory (`Game Developer Website`):

```bash
# 1. Install dependencies (Root, Frontend & Backend)
npm run install:all

# 2. Setup & Seed SQLite Database
npm run db:setup

# 3. Launch both Fastify Backend (Port 3001) & Vite Frontend (Port 5173) concurrently:
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🎮 Individual Services

- **Frontend only**:
  ```bash
  cd frontend
  npm run dev
  ```
- **Backend only**:
  ```bash
  cd backend
  npm run dev
  ```

---

## 🚀 Key Features

1. **Zero-Latency Video & Chapter Scrubber**:
   - Discrete chapter jumping (`CH 1`, `CH 2`, `CH 3`, `CH 4`).
   - Keyboard scrubbing shortcuts: `[J]` (-5s), `[K]` (Pause/Play), `[L]` (+5s).
   - Generative 60 FPS simulated trailer canvas fallback for instant zero-friction previews.
2. **Sandboxed Playable Demo Slice (`PlayableSliceModal`)**:
   - In-browser playable action platformer slice with kinematic movement, air-dashing, wall jumps, katana slashes, and training drones.
   - Real-time telemetry: FPS counter, 16.6ms frame-time sparkline graph, and Gamepad API connection detector.
3. **The "Mechanic Dissector" Sandbox**:
   - Live parameter juicers: Coyote Grace Window (0-250ms), Jump Input Buffer (0-200ms), Hit-Stop Freeze Frame (0-150ms), Camera Trauma Shake (0-100%), Squash & Stretch, and Raycast Debug Vectors.
   - Draggable Before/After split-curtain wipe comparing raw greybox hitboxes against final lit renders.
4. **`[X-RAY DEBUG MODE]` (Hotkey: `[~]`)**:
   - Global HUD overlay showing live wireframe collision boxes, state-machine transition node telemetry, draw call budgets, and frame pacing metrics.
5. **Living "Dev-Log Chronicle"**:
   - Milestone version time-travel (`v0.1` -> `v0.5` -> `v0.8` -> `v1.0`).
   - Side-by-side performance benchmarks (Draw calls -45%, physics step time 3.82ms -> 1.45ms, memory GC alloc 48KB -> 0KB).
   - Embedded interactive Continuous Swept AABB collision widget preventing sub-pixel tunneling.
6. **Recruiter & Publisher Passport**:
   - High-contrast developer summary card, engine proficiency matrix, one-click copyable Discord/Social embeds, and downloadable Press Kit JSON.
