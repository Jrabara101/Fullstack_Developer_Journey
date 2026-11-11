# Cognitive Studio & Bespoke Editorial — Interface & Architecture Guide

A modern, interface-focused platform combining **Cognitive Studio** (Tactile Flashcard & Active Recall Web App) and **Bespoke Editorial** (Interactive Event Invitation & Guest Experience Suite), engineered with React 19, Vite, and Tailwind CSS.

---

## 1. System Architecture & Experience Switcher

```
                           ┌───────────────────────────────────────────────┐
                           │      Dual Experience Studio Controller        │
                           └───────────────────────┬───────────────────────┘
                                                   │
                 ┌─────────────────────────────────┴─────────────────────────────────┐
                 ▼                                                                   ▼
    ┌───────────────────────────────┐                                   ┌───────────────────────────────┐
    │       Cognitive Studio        │                                   │       Bespoke Editorial       │
    │  (Tactile Active Recall App)  │                                   │   (Interactive Guest Suite)   │
    └──────────────┬────────────────┘                                   └──────────────┬────────────────┘
                   │                                                                   │
   ┌───────────────┼───────────────┐                                   ┌───────────────┼───────────────┐
   ▼               ▼               ▼                                   ▼               ▼               ▼
Tactile 3D     Memory Decay    Multiplayer                         Wax-Sealed     Scrollytelling  Host Command
Card Canvas    & Forgetting    Crunch Room                         Hero & Lanyard   Itinerary      Center Drawer
  • Tilt &       Curve           • Live racing                      • 3D Tilt      • Moodboards   • Live counts
    specular   • Heatmap         • Leaderboard                        physics      • Map & Weather• Seating CSV
  • Swipes     • 5-Min Blitz     • Deck fork                        • Hologram     • Cal pills    • Broadcasts
```

---

## 2. High-Impact Frontend Features

### Preset A: Cognitive Studio (Tactile Active Recall Engine)
1. **Tactile 3D Card Canvas:**
   - **Dynamic 3D Tilt & Specular Sheen:** Cards respond to cursor/touch coordinates with `perspective: 1200px` and dynamic radial sheen highlights.
   - **Swipe Velocity & Gestures:**
     - Swipe Right $\rightarrow$ **Mastered** (Emerald glow, grade `4`, interval boost)
     - Swipe Left $\rightarrow$ **Review Soon** (Amber glow, grade `2`)
     - Swipe Up $\rightarrow$ **Hard / Lapse** (Coral glow, grade `1`, interval reset)
   - **Keyboard Physical Keycaps:** Full accessibility with `<kbd>` keycaps: `[Space]` to flip, `[1–4]` to grade confidence, `[B]` for 5-Min Blitz.
   - **Image Occlusion Studio:**
     - Select anatomical (Heart & Great Vessels) or architectural charts, or upload custom diagrams.
     - Drag to draw rectangular mask overlays.
     - Study mode allows clicking masks to reveal labels with smooth opacity transitions.
   - **Type-to-Verify & Voice Recall:**
     - Type or use browser Web Speech API (`SpeechRecognition`) to speak recall answers aloud.
     - Word-level precision diff highlighting exact matches in emerald and missed keywords in coral strikethrough, with match percentage score.

2. **Memory Decay & Heatmap Dashboard:**
   - **Mathematical Forgetting Curve:** Interactive SVG curve tracking retention $R = e^{-t/S}$ across days. Cards and decks are dynamically color-coded:
     - 🟢 **Mastered / Fresh** ($\ge 80\%$)
     - 🟡 **Review Soon / Fading** ($50\% - 79\%$)
     - 🔴 **Lapsed / Critical** ($< 50\%$)
   - **Daily Retrieval Consistency Grid:** 12-week GitHub-style activity calendar heatmap with active streak counters.
   - **5-Minute Quick Blitz:** Rapid-fire 300s timer mode targeting highest-decay cards with multiplier streaks and confetti celebrations.

3. **Focus Audio & Ambient Soundscapes:**
   - **Procedural UI Sound Effects:** Web Audio API synthesis for paper flip whooshes, card snap placement, pleasant chimes, master fanfare, wax crackle, and envelope unfolding.
   - **Ambient Generators:** Smooth Brown Noise (low-pass hum) and warm Lo-Fi chord drone with soft rain texture.

---

### Preset B: Bespoke Editorial (Interactive Guest Experience Suite)
1. **Interactive "Unsealing" Hero Experience:**
   - **Wedding ("Champagne & Ink") & Birthday ("Golden Hour"):** Authentic tactile wax-sealed envelope. Clicking breaks the wax seal with audio crackle, opens the flap with 3D paper physics, and pulls out the gold-embossed invitation letter.
   - **Conference ("Kinetic Monolith"):** 3D Interactive Holographic Lanyard badge that tilts with cursor pointer, displaying iridescent sheen, dynamic attendee name, handle, QR code, and VIP Access Tier.
2. **Dynamic Time-Zone & Interactive Itinerary:**
   - Scrollytelling timeline with automatic timezone conversion ("Venue Time" vs "Your Device Time").
   - Expandable chapters with dress code moodboards (color palette swatches), venue map details, live weather forecast, and one-click Google Calendar & Apple Calendar (.ics) export.
3. **Tactile Guest Wall & Polaroid Scrapbook:**
   - Draggable Polaroid cards with washi tape accents, photos, and handwritten notes.
   - **15-Second Voice Toast:** Built-in microphone audio recorder (`MediaRecorder`) with animated waveform and instant playback player on each guest's Polaroid.
4. **Interactive Seating / Session Explorer:**
   - Floorplan map zoom and table highlighter upon typing guest name.
   - Tablemates preview with avatars, dietary preferences, and conversational icebreaker prompts.
5. **Personalized Magic-Link Invites:**
   - Recognizes parties (`smith-family`, `alex-chen`, `vance-crew`), pre-populating household members, allowed "+1" quota, and authorized sub-events.
6. **Crowd-Sourced Atmosphere:**
   - Upvoting system for reception DJ playlist songs or conference panel Q&A topics with duplicate vote prevention.
7. **Smart Dietary, Travel & Ride-Share Coordinator:**
   - Dietary tags and flight arrival matching: automatically pairs guests landing at the airport within the same 30-minute window.
8. **Host Command Center Drawer:**
   - Password-protected (`host2026`) host view with live headcount breakdown, meal tallies, downloadable seating CSV, and one-click broadcast announcement banner.

