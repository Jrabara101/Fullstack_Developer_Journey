# Atelier — High-Conversion Job Application Portal & Candidate Experience Engine

> An intentional, zero-anxiety job application and candidate tracking platform synthesizing the structural speed and clarity of Ashby and Linear with the candidate-first warmth of Read.cv and Wellfound.

---

## 🌟 Core Value Proposition

Traditional enterprise Applicant Tracking Systems (ATS) punish candidates by forcing them to upload a PDF resume only to manually re-type every job title and date into 12 pages of clunky forms, losing their progress on session timeouts, and dropping their application into an opaque black hole.

**Atelier** transforms applying for a job into a high-trust, respectful experience:
1. **Intelligent Resume-to-Form Auto-Fill:** Drag-and-drop a resume (`PDF`, `DOCX`, `TXT`, `Markdown`) to parse work history, education, skills, and portfolio URLs in under 2 seconds with an interactive bi-directional bounding-box viewer.
2. **Keystroke-Level Dual-Layer Autosave:** Immediately commits every typed character to client-side `IndexedDB` (`Dexie`) and debounces optimistic sync to the cloud database with a reassuring live status heartbeat (`"✓ Draft saved 2s ago • Safe to close tab"`).
3. **Passwordless Magic Handoff:** Start on mobile, scan a high-contrast SVG QR code or copy a 7-day magic URL to resume on desktop at the exact cursor position with zero passwords required.
4. **Transparent "Domino's-Style" Status Tracker:** Interactive 6-stage pipeline stepper with active pulse rings, verified activity timeline, and an honest Anti-Ghosting SLA countdown.
5. **Stage-Contextual Interview Prep Packet:** Self-service 45-minute calendar slot booking, interviewer bios (with GitHub/LinkedIn links), and transparent expectation guides (zero whiteboard trick questions).
6. **High-Velocity Recruiter Triage Cockpit:** Keyboard-driven review studio (`J`/`K` navigation, `A` advance, `R` pass, `S` scheduler) with an Anti-Ghosting SLA Watchdog highlighting candidates waiting $> 5$ business days.

---

## 📐 Architecture & Technology Stack

| Layer | Technology | Key Capabilities |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 6, Tailwind CSS | 60 FPS split-view studio, SVG bounding boxes, laser scan animation, dark/light theme |
| **Client Storage** | Dexie.js (IndexedDB) | Zero-loss dual-layer draft persistence, offline resilience |
| **Backend API** | Node.js, Express, TypeScript (`tsx`) | REST endpoints, idempotent autosave, magic handoff token engine, SVG QR generation |
| **Parsing & Linter** | Custom Heuristic Parser & OCR Mapper | Normalized bounding box generator, keyword alignment linter, link health sentinel |
| **UI Components** | Lucide React, Canvas Confetti | Ergonomic design tokens, Plus Jakarta Sans, Inter, JetBrains Mono |

---

## 🎨 Design System Tokens (Stitch.md Compliant)

- **Canvas Primary:** `#FAF9F6` (Editorial Alabaster Light) / `#0A0B0E` (Obsidian Dark)
- **Surface Secondary:** `#F3F2EE` (Light) / `#111318` (Dark)
- **Surface Elevated:** `#FFFFFF` (Light) / `#171A21` (Dark)
- **Hairlines & Dividers:** `1px` hairlines (`#E4E2DD` / `#232730`)
- **Brand Interactive:** `#4F46E5` (Career Indigo) / `#6366F1` (Dark Mode Focus)
- **Status Tokens:**
  - 🟢 **Emerald (`#10B981`):** Autosaved, Verified Parse, Offer Extended
  - 🔵 **Electric Cobalt (`#3B82F6`):** Active Stage, Under Review, Cloud Syncing
  - 🟣 **Royal Violet (`#7C3AED`):** Interview Action Required, Slot Booking Open
  - 🟡 **Warm Amber (`#D97706`):** Broken Link Warning, SLA Approaching / Breached
  - 🔴 **Crimson Alert (`#DC2626`):** Broken Link (404), Withdrawn, Passed
- **Typography:**
  - Headings: `Plus Jakarta Sans` / `Inter Display` (`-0.025em` tracking)
  - UI Chrome & Labels: `Inter`
  - Clocks, Progress, Salaries & Tracking IDs: `JetBrains Mono` (`tabular-nums` mandatory)

---

## 🚀 Quickstart & Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Both Backend & Frontend Concurrently
```bash
npm run dev
```
- **Backend API:** `http://localhost:3001`
- **Frontend App:** `http://localhost:5173`

### 3. Run Automated Test Suite
```bash
npx tsx server/test-suite.ts
```

---

## 🧩 Key Views & User Workflows

### 1. Job Directory (`/` or `#jobs`)
- Role discovery with search, faceted department filters (Engineering, Product, Design, Infrastructure), and transparent compensation sliders.
- Shows "Draft in Progress" resume badges for candidates with saved local drafts.

### 2. Split Application Studio (`#apply/:slug`)
- **Left Pane:** Resume dropzone with 600ms laser scan animation, interactive bounding box overlays linked to form inputs, resume vault switcher, skill alignment meter, and link verification badge.
- **Right Pane:** Step-by-step auto-populated form:
  - Step 1: Candidate Identity & Verified Links (with live HTTP ping badges)
  - Step 2: Parsed Work History Cards & Education (compact, collapsible, editable)
  - Step 3: Role-Specific Questions with word counter and keystroke autosave indicators
  - Step 4: Review, Blind Screening preview, and final submission
- **Top Sticky Bar:** Autosave heartbeat pill (`[ 🟢 Draft saved 2s ago • Safe to close tab ]`), Cross-Device Magic Handoff trigger (`[ 📱→💻 Continue on mobile ]`), and time estimate (`⏱ ~2m left`).

### 3. Candidate Live Status Portal (`#track/:trackingCode`)
- Tracking header badge (`APP-2026-8941`), live status pill, and Anti-Ghosting SLA countdown.
- 6-Stage visual Domino's-style pipeline stepper with glowing active pulse rings.
- Embedded self-service 45-minute calendar slot picker with timezone selector and instant Google Meet link generation.
- Interviewer bios for Elena Rostova (VP Eng) and Marcus Vance (Staff UI Eng) with session expectations (zero LeetCode riddles).
- Verified activity timeline with stage updates and "Resume reviewed by engineering team" pulse.
- Self-service controls: Grace-window resume swap, recruiter direct messaging, and graceful withdrawal with "Keep Warm" talent pool opt-in.

### 4. Recruiter High-Velocity Review Cockpit (`#recruiter`)
- Top SLA & Funnel Velocity Ribbon (Total Applicants, Unreviewed, ⚠️ SLA Breached, In Interviews, Avg. Time to First Review).
- Split-pane keyboard triage view (`J`/`K` navigation, `A` advance, `R` constructive pass, `S` scheduler).
- Left candidate list with SLA breach warning badges (`⏳ 4d 18h Waiting`, `⚠️ SLA Breached (6d)`).
- Center/Right stage showing parsed resume side-by-side with screening answers, recruiter notes, and stage transition controls.

### 5. Multi-Application Hub (`#my-applications`)
- Displays In-Progress Drafts with completion progress rings and last-saved timestamps.
- Lists Active Applications with mini pipeline steppers and SLA status.
