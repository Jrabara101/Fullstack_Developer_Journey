# Acme Cloud — Startup Landing Page & Interactive Conversion Engine

> A high-velocity, browser-native startup storefront and interactive product proving ground designed to eliminate buyer skepticism and "sign-up fatigue."

---

## 🚀 Key Architectural Highlights

### 1. Zero-Signup "Live Sandbox" Product Intro & Persona Switcher
- **Persona Lens Switcher:** Toggle between **For Founders**, **For Engineering**, and **For Ops & Finance**. The hero headline, value proposition copy, telemetry badge, and Bento feature priorities dynamically morph in real time.
- **Interactive Micro-Instance Sandbox:** Visitors interact with a live, un-gated mini-dashboard directly in the hero viewport:
  - **Workflows & Deployments:** Interactive 4-stage pipeline DAG (Git Push → Edge Build → Canary Gate → Global Anycast) with simulated blue/green rollout.
  - **Global Edge Mesh:** Interactive 35-PoP region inspector with live ping latencies (SFO, IAD, LHR, FRA, NRT, SIN).
  - **Telemetry & Circuit Breakers:** Real-time SVG latency curve plotting sub-12ms response times with anomaly tripwires.
  - **SOC2 & KMS Vault:** Live hardware key rotation visualizer (AES-256-GCM) with continuous compliance posture monitoring.
  - **Live Command Runner:** Interactive terminal allowing visitors to click quick presets (`deploy --canary`, `benchmark p99`, `test rollback`) or type custom shell commands with instant telemetry response.
  - **Micro-Instance Runtime Toggles:** Four live toggles (*Zero-Downtime Rollout*, *Edge AI Cache*, *DB Branching*, *SOC2 Audit Trail*) that immediately update sandbox charts and system states.

### 2. Tactile "Chaos vs. Clarity" Workflow Comparator
- Interactive before-and-after scrubber contrasting the fragmented **"Legacy Status Quo"** (14 manual steps, SSH firefighting, Slack alert panics, $4,800/mo orphan dev servers) against **Acme Automated Clarity** (1-click declarative deploy, 380ms auto-rollback canary, zero-drift database branching).
- Smooth mouse, touch, and preset-button scrubber controls.

### 3. Interactive "ROI & Usage Simulator" Pricing Engine
- **Billing Cadence Switch:** Toggle Monthly vs. Annual (`Save 20%` emerald badge).
- **Dual Volume Sliders:**
  - *Active Team Seats* (1 to 100+ seats)
  - *Monthly Pipeline Events / API Runs* (10k to 3M+ runs/mo)
- **Dynamic Tier Illumination:** The matrix dynamically illuminates the most cost-effective tier (`Developer`, `Growth`, `Scale`, or `Enterprise`) with an elevated spotlight border and `RECOMMENDED FOR YOUR VOLUME` badge as volume sliders move.
- **ROI & Savings Calculator:** Calculates estimated competitor hyperscaler spend, monthly direct infrastructure savings, developer hours recovered, and annual capital value.
- **CFO-Ready Quote Generator:** One-click generation of a permanent, cryptographically timestamped quote (`/quote/:id`) persisted in SQLite with itemized volume breakdowns, competitor ROI justifications, and legal compliance guarantees.

### 4. Metric-Verified "Wall of Love" & Blueprint Testimonials
- Authenticated social proof cards filterable by **Persona** (`Founder`, `Engineering`, `Finance`) and **Company Stage** (`Seed`, `Series A`, `Series B+`, `Enterprise`).
- Each card pairs customer quotes with verified telemetry deltas (`⚡ 3.4x Faster Deploys`, `📉 -64% P99 Latency`, `💰 $14,200/mo Cloud Savings`).
- **Inspect Stack Blueprint Drawer:** Expandable side drawer revealing the exact architecture modules deployed by each customer and their before/after performance metrics.

### 5. Dual-Velocity "Claim Your Workspace" CTA Dock
- **Sub-200ms Live Handle Availability Check:** Real-time debounce checking against reserved system handles and the SQLite database (`app.acme.dev/[your-slug]`).
- **One-Click Magic Link Provisioner:** Captures lead signups alongside complete interactive telemetry attribution (active persona lens, configured seat/event sliders, session duration, and sandbox interaction counts).
- **Enterprise Architecture Review Booker:** 1-click modal with interactive calendar slot selector and security compliance guarantees (SOC2 Type II, ISO 27001, HIPAA, 99.999% SLA).

### 6. Obsidian Atelier Design System
- **Design Concept:** Linear/Vercel/Stripe-inspired obsidian aesthetic (`#06080F`), specular top-edge illumination (`shadow-specular`), glassmorphic panels (`#0D111C/90 backdrop-blur-xl`), and electric indigo/laser cyan radiant auroras.
- **Typography:** Display: *Plus Jakarta Sans*; UI: *Inter*; Telemetry: *JetBrains Mono*.
- **Command Palette (`⌘K` / `Ctrl+K`):** Global quick-jump menu to navigate sections, switch buyer lenses, open calculators, or schedule reviews.

---

## 🛠️ Tech Stack & Directory Structure

```
Startup/
├── backend/
│   ├── src/
│   │   ├── data/seedData.ts          # Seeded features, tiers, testimonials, logos, FAQs
│   │   ├── db/database.ts            # SQLite database (workspaces, quotes, leads)
│   │   ├── services/pricingService.ts # Tier & ROI calculator with PPP support
│   │   ├── types/index.ts            # Shared TypeScript contracts
│   │   └── server.ts                 # Express REST API (sub-50ms SLA endpoints)
│   ├── data/startup.db               # SQLite database file (WAL mode)
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/client.ts             # Typed API client
│   │   ├── components/
│   │   │   ├── BillingAndUsageControls.tsx   # Team & Event sliders + cadence toggle
│   │   │   ├── BentoFeatureCards.tsx         # Asymmetric Bento cards with micro-widgets
│   │   │   ├── ChaosVsClarityScrubber.tsx    # Interactive before/after drag scrubber
│   │   │   ├── CommandKModal.tsx             # Global Cmd+K quick-jump command palette
│   │   │   ├── EnterpriseBookerModal.tsx     # 1-click architecture call scheduler
│   │   │   ├── FAQAccordion.tsx              # 2-column objection busting section
│   │   │   ├── FeatureBentoMatrix.tsx        # Bento matrix container
│   │   │   ├── Footer.tsx                    # System status & live pulse readout
│   │   │   ├── HeroProductStage.tsx          # Dynamic hero stage & handle claim bar
│   │   │   ├── InstantProvisionCtaDock.tsx   # Real-time slug validator & magic link CTA
│   │   │   ├── InteractivePricingMatrix.tsx  # Dynamic pricing section
│   │   │   ├── InteractiveProductSandbox.tsx # Playable hero micro-instance
│   │   │   ├── MarketingShell.tsx            # Sticky glassmorphic navbar & shell
│   │   │   ├── PersonaLensToggle.tsx         # Segmented buyer lens pill bar
│   │   │   ├── QuotePage.tsx                 # Shareable CFO quote proposal (/quote/:id)
│   │   │   ├── RoiAndQuoteDrawer.tsx         # ROI summary & CFO quote generator modal
│   │   │   ├── StackBlueprintDrawer.tsx      # Inspect customer stack blueprint sheet
│   │   │   ├── TierComparisonCards.tsx       # 4 responsive tiers with rolling prices
│   │   │   └── TrustLogoMarquee.tsx          # Infinite smooth logo marquee with tooltips
│   │   ├── data/clientData.ts        # Zero-CLS client fallback seed data
│   │   ├── hooks/usePricingCalculator.ts # Real-time tier recommendation hook
│   │   ├── store/marketingStore.ts   # Global Zustand marketing & telemetry store
│   │   ├── types/index.ts            # Frontend TypeScript definitions
│   │   ├── App.tsx                   # Main app & /quote/:id routing
│   │   ├── index.css                 # Obsidian Atelier tokens & specular styling
│   │   └── main.tsx                  # React 18+ QueryClientProvider root
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── package.json                      # Root workspace scripts
└── README.md
```

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
# In project root
npm run dev
```

Or run frontend and backend independently:
```bash
# Terminal 1: Backend API
cd backend
npm run dev

# Terminal 2: Frontend Client
cd frontend
npm run dev
```

- **Frontend Client:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:4000](http://localhost:4000)

---

## 📡 Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health and version check |
| `GET` | `/api/features` | Bento feature matrix across 3 persona lenses |
| `GET` | `/api/pricing/tiers` | 4 base pricing tiers with itemized feature checklists |
| `GET` | `/api/testimonials` | Filterable metric-verified customer testimonials |
| `GET` | `/api/pulse` | Real-time live activity telemetry pulse |
| `POST` | `/api/pricing/calculate` | Computes tiered volume pricing, ROI & PPP discount |
| `POST` | `/api/quotes/generate` | Generates & persists a 30-day shareable CFO quote |
| `GET` | `/api/quotes/:id` | Retrieves persisted quote record for `/quote/:id` |
| `GET` | `/api/workspaces/check-slug` | Sub-200ms debounced workspace handle availability check |
| `POST` | `/api/cta/provision` | Claims workspace slug and captures lead telemetry |

---

## 🧪 Verified Lead Telemetry & Attribution
When a user provisions a workspace, the backend records:
- Target workspace handle and email
- Configured seat count and pipeline event volume
- Selected pricing tier and billing interval
- Which Persona Lens they were exploring (`founder`, `engineering`, or `finance`)
- Total interactive session duration (seconds)
- All Persona tabs visited during the session
- Total count of interactive sandbox actions executed
