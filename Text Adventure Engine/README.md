# Text Adventure Engine — Arcane Scriptorium Studio & Runtime

A browser-native interactive fiction studio and playable text adventure engine bridging classic parser-driven exploration with modern choice-based storytelling and visual world-building. Built with React 18+, TypeScript, Vite, Tailwind CSS, and shadcn UI design tokens.

---

## 🌟 Vision & Key Highlights

- **Instant "Write-to-Play" Flight Check:** With a single keypress (`[Space]` or the mode switcher capsule), seamlessly transition from the visual room-and-passage node editor directly into the live playable story terminal at the exact scene being edited.
- **Hybrid "Smart Parser + Tactile Pill" Input Engine:** Type natural-language commands into the monospace autocomplete prompt (e.g. `unlock vault with assembled chronos key` or `go north`) OR click highlighted cyan hyper-words directly inside the narrative prose to pop open contextual action pills (`[Examine]`, `[Take]`, `[Use]`, `[Combine]`).
- **Visual "World-Weave" Node & Compass Studio ("The Loom"):** Authors place Room Cards, Relics, and Logic Gates onto an infinite 2D canvas, dragging glowing cubic Bezier conduits between nodes to wire compass exits (`North`, `South`, `East`, `West`, `Up`, `Down`) and conditional story triggers.
- **Dynamic "Auto-Cartographer" Fog-of-War Radar:** Procedurally sketches an interactive node-and-corridor blueprint map in the HUD. Explored chambers illuminate with item/exit indicators, unvisited exits appear as dashed mystery vectors, and cleared rooms support one-click fast travel.
- **Kinetic Typography & Atmospheric Mood Shaders:** Prose tags render living text effects—`[shake]` for earthquakes, `[glow]` for arcane runes, `[ember]` for crackling sparks, `[ghost]` for spectral whispers, and `[gold]` for celestial items—synchronized with pitch-modulated Web Audio typewriter chirps.
- **"Time-Turner" Turn Rewind & Save Forking:** Every action commits an immutable snapshot to a local-first timeline. Rewind turn-by-turn (`Undo` or `Ctrl+Z`) to recover from fatal traps or test alternative narrative choices.
- **One-Click "Story Cartridge" & Seed Exporter:** Export stories into portable JSON cartridges, standalone playable HTML files, or compressed URL hash seeds (`#story=...`) for instant 1-click sharing.
- **Live State Debugger ("God Mode"):** Floating inspector drawer allowing creators to toggle world flags, edit variables, teleport between rooms, and spawn satchel relics in real-time.

---

## 📜 Custom Story Markup Syntax

| Syntax | Description | Example |
|---|---|---|
| `[[Name\|id:entity_id\|actions:inspect,take,use]]` | Interactive clickable entity badge with verb popover | `[[Grand Astrolabe\|id:brass_astrolabe]]` |
| `{if flag:flag_name}...{else}...{/if}` | Conditional prose branch based on story flag | `{if flag:astrolabe_aligned}Conduits hum with gold.{/if}` |
| `{if !flag:flag_name}...{/if}` | Negative flag conditional | `{if !flag:vault_unlocked}The door is sealed.{/if}` |
| `{if item:item_id}...{/if}` | Item in inventory check | `{if item:chronometer_key}You hold the key.{/if}` |
| `{if var:ticks>=2}...{/if}` | Numeric variable evaluation | `{if var:ticks>=3}The pendulum stops.{/if}` |
| `[shake]...[/shake]` | Trembling kinetic vibration effect | `[shake]The vault door shudders![/shake]` |
| `[glow]...[/glow]` | Arcane pulsing sky-cyan radiance | `[glow]Runes pulse with power.[/glow]` |
| `[ember]...[/ember]` | Crackling amber ember heat glow | `[ember]Sparks shower the dais.[/ember]` |
| `[ghost]...[/ghost]` | Faint spectral italic whisper | `[ghost]Whispers echo from the past.[/ghost]` |
| `[gold]...[/gold]` | Radiant celestial gold glow | `[gold]✦ TEMPORAL CRISIS AVERTED ✦[/gold]` |
| `[dropcap]L[/dropcap]` | Editorial serif drop-cap chapter initial | `[dropcap]Y[/dropcap]ou step into the foyer.` |

---

## 🕹️ Natural Language Command Lexer

The parser understands English commands with fuzzy entity matching, direction shortcuts, and prepositions:

- **Movement:** `go north`, `walk south`, `travel east`, `head west`, `climb up`, `descend`, or single letters: `n`, `s`, `e`, `w`, `u`, `d`
- **Inspection:** `look`, `l`, `examine <item>`, `inspect <item>`, `read <journal>`, `survey`
- **Collection:** `take <item>`, `grab <item>`, `pick up <item>`, `collect <item>`
- **Interaction:** `use <item>`, `activate <item>`, `ignite <lamp>`, `turn <wheel>`
- **Crafting & Combination:** `combine <item> with <item>`, `assemble <part> and <part>` (e.g. `combine brass cog with star spindle` -> `Assembled Chronos Key`)
- **System:** `inventory` (or `i`), `help` (or `?`)

---

## 🏗️ Architecture & Project Structure

```
src/
├── types/
│   └── engine.ts               # Core data schemas (RoomNode, WorldEntity, Cartridge, RuntimeState)
├── lib/
│   ├── audio.ts                # Web Audio API procedural synthesizer (typewriter chirps, chimes, shudder)
│   ├── markup.tsx              # Interactive entity badges, kinetic text effects, conditional logic
│   ├── parser.ts               # Natural language lexer, synonym dictionary, fuzzy matcher, autocomplete
│   ├── storage.ts              # Local-first persistence adapter
│   ├── urlSeed.ts              # Compressed URL hash encoder/decoder & standalone HTML exporter
│   └── utils.ts                # cn utility and unique ID generator
├── data/
│   ├── clockworkObservatory.ts  # Pre-loaded 6-room demo story ("The Clockwork Observatory")
│   └── whisperingCrypt.ts      # Bonus 4-room gothic mystery demo story ("The Whispering Crypt")
├── store/
│   └── engineStore.ts          # Zustand store managing runtime state, undo stack, and studio actions
├── components/
│   ├── ui/                     # shadcn-inspired primitives (Button, Badge, Dialog, Tabs, Popover)
│   ├── topbar/
│   │   ├── StudioTopBar.tsx    # Header, mode switcher capsule, turn counter, undo, mute, god mode
│   │   └── GodModeDrawer.tsx   # Live variable & flag inspector, teleport, item spawner
│   ├── play/
│   │   ├── PlayTerminal.tsx    # Scrollable story reader with drop-cap headers & entity links
│   │   ├── InteractiveEntityPopover.tsx # Contextual verb pill popup menu
│   │   ├── CommandBar.tsx      # Monospace prompt, live autocomplete, exit & choice pills
│   │   ├── AutoMapRadar.tsx    # Procedural SVG Auto-Map with fog-of-war and click-to-fast-travel
│   │   └── SatchelHUD.tsx      # Tabbed satchel grid, combine slots, quest journal, and flags
│   ├── creator/
│   │   ├── CreatorStudio.tsx   # 2D infinite pan-and-zoom node graph canvas
│   │   ├── RoomNodeCard.tsx    # Draggable room cards with biome mood colors & exit ports
│   │   ├── BezierConduit.tsx   # Glowing SVG cubic Bezier wires with lock and direction indicators
│   │   ├── OutlinerDrawer.tsx  # Searchable tree of chambers, relics, and story flags
│   │   └── PassageInspector.tsx# Rich prose markup editor, syntax palette, exit & choice builder
│   └── modals/
│       ├── CartridgeModal.tsx  # Story library, JSON import/export, URL hash seed, standalone HTML
│       └── EntityModal.tsx     # World entity creator and recipe editor
└── App.tsx                     # Main layout orchestrator
```

---

## 🚀 Getting Started

### Development Server
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```
