# ACER Strike

A third-person tactical shooter prototype — a Counter-Strike-inspired, round-based
MVP built with React, TypeScript and Three.js.

Features CS 1.6-style counter-strafing, per-weapon recoil spray patterns,
parallax-corrected hitscan ballistics, positional 3D audio, bomb defusal rounds,
and waypoint-driven bot combat.

## Run locally

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev
```

The dev server runs at http://localhost:3000/.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server on port 3000 |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Type-check only (`tsc --noEmit`) |

## Controls

| Input | Action |
| --- | --- |
| `WASD` | Move (counter-strafe to stop instantly) |
| `Shift` / `Ctrl` | Walk silently / crouch |
| `Space` | Jump |
| `Mouse 1` | Fire |
| `V` / `Mouse 3` | Swap shoulder |
| `R` | Reload |
| `1` `2` `3` `5` | Primary / pistol / knife / C4 |
| `E` | Plant or defuse (hold) |
| `B` | Buy menu |
| `Tab` | Scoreboard (hold) |
| `~` / `F1` | Dev panel |
| `Esc` | Pause menu |
