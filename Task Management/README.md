# FocusFlow • Intelligent Task & Priority Management Suite

A high-velocity, distraction-free productivity engine synthesizing the tactile grace of **Things 3** with the keyboard mastery and speed of **Linear**. Designed to eliminate to-do list debt and cognitive fatigue through frictionless natural-language capture, proactive priority triage, time-budgeted daily horizons, and burnout-conscious planning.

---

## ⚡ Core Features & Capabilities

### 1. Cognitive Offloading & Natural-Language Quick Capture
* **Intelligent Quick-Add Parser (`Cmd+K` or `C`):** Instant capture dialog with a real-time token highlighting preview strip. Typing phrases like:
  ```text
  Draft Q3 product proposal tomorrow 3pm p1 #strategy ~45m @deepwork
  ```
  automatically extracts and highlights:
  - **Title:** `Draft Q3 product proposal`
  - **Priority:** `[ 🔴 P1 Urgent ]`
  - **Due Date & Time:** `[ 📅 Tomorrow, 3:00 PM ]`
  - **Time Budget:** `[ ⏳ ~45m ]`
  - **Contextual Tag:** `[ #strategy ]`
  - **Energy Level:** `[ 🧠 Deep Work ]`
* **Voice-to-Task Transcription:** Built-in micro-dictation with visual recording indicator and smart speech simulation fallback.
* **60-Second Inbox Zero Triage Ritual (`T`):** Morning and Evening Sweep review workflow. Smoothly cycle through lingering or inbox tasks to execute, reschedule (+1d), delegate to P3, or shelve to Someday without guilt.

### 2. Multi-Dimensional Prioritization Engine
* **Dynamic Eisenhower Matrix View (`M`):** 2x2 decision grid balancing urgency vs. importance:
  - **Q1: Do First** (`P1` Urgent & Crucial - Vibrant Crimson accent)
  - **Q2: Schedule** (`P2` High Priority - Amber Ochre accent)
  - **Q3: Delegate / Quick Hit** (`P3` Medium Priority - Cobalt Focus accent)
  - **Q4: Eliminate / Someday** (`P4` Low / Backlog - Muted Slate accent)
* **The Daily Big 3 Soft Ceiling:** Automatically calculates high-priority commitments scheduled for today and surfaces gentle focus guidance if more than 3 `P1` tasks are scheduled.
* **Priority Decay & Stagnancy Sentinel:** Visually flags tasks that have lingered across multiple rescheduled deadlines (`Rescheduled 3x`) with ambient glow borders and 1-click remediation actions.
* **Contextual Energy Tags:** Categorize and filter tasks by mental energy (`🧠 Deep Work`, `⚡ Quick Hit < 5 min`, `🔋 Low Energy / Admin`).

### 3. Temporal Ergonomics & Due Date Horizons
* **Time-Budgeted Daily Horizon:** Visual capacity meter (e.g. `4.5h / 6.0h planned`) summing task estimated minutes against your daily focus budget, proactively flagging overbooking before work begins.
* **Separation of Hard Deadlines vs. Start Dates:** Distinct support for hard due dates (`Due`) and intentional working dates (`Scheduled / Do Today`).
* **Flexible Recurring Schedules:** Support for daily, weekdays, weekly, monthly, and dynamic `Complete + 4 days` cycles.

### 4. Execution Momentum & Deep Focus Mode
* **Single-Task Focus Dock & Zen Mode (`F`):** Collapses the workspace into an ultra-minimal floating desktop dock or fullscreen zen mode with an integrated countdown Pomodoro timer, audio chimes, and single-click completion trigger.
* **Nested Subtask Deconstruction:** Interactive checklist trees with real-time fraction progress indicators (`3/5 subtasks completed`).
* **Keyboard-First Workflow:** Complete keyboard mastery without touching the mouse:
  - `J` / `↓` and `K` / `↑`: Navigate task rows
  - `Space` / `X`: Toggle complete with tactile spring bounce and particle confetti
  - `1`, `2`, `3`, `4`: Set priority P1-P4
  - `E`: Archive task
  - `C` or `Cmd+K`: Quick capture
  - `F`: Toggle single-task deep focus dock
  - `M`: Toggle Eisenhower matrix quad view
  - `T`: Open triage ritual
  - `?`: Open keyboard shortcuts guide
  - `Esc`: Dismiss modals and drawers

---

## 🎨 Stitch.md Design Tokens

* **Canvas Primary:** `#FFFFFF` (Light) / `#0C0D0E` (Dark)
* **Surface Secondary:** `#F7F8F9` (Light) / `#141517` (Dark)
* **Surface Elevated:** `#FFFFFF` (Light) / `#1C1D21` (Dark)
* **Border / Dividers:** `#E5E7EB` (Light) / `#26292D` (Dark)
* **Text Primary:** `#111827` (Light) / `#F3F4F6` (Dark)
* **Text Muted:** `#6B7280` (Light) / `#8A8F98` (Dark)
* **Brand / Action:** `#2563EB` (Cobalt Action) / `#3B82F6` (Dark Mode Focus)
* **Priority Accents:**
  - `P1`: `#EF4444` (Vibrant Crimson)
  - `P2`: `#F59E0B` (Amber Ochre)
  - `P3`: `#3B82F6` (Cobalt Focus)
  - `P4`: `#94A3B8` (Slate Neutral)
* **Due Date Urgency:**
  - `Overdue`: `#DC2626` text with soft pink highlight and ambient pulse
  - `Due Today`: `#D97706` text with warm highlight
  - `Completed`: `#10B981` (Emerald Checkmark)
* **Typography:** `Inter` for UI & Headings, `JetBrains Mono` for tabular timestamps and tokens.

---

## 🗄️ Backend Architecture & Supabase Schema

The backend architecture is documented and ready for Supabase or standard PostgreSQL under `supabase/schema.sql`:
- **Tables:** `projects`, `tasks`, `subtasks`, `tags`, `task_tags`, `task_activity_logs`
- **Security:** Complete Row-Level Security (RLS) policies isolating tenants by `auth.uid() = user_id`
- **Automation:** Stored procedure `rollover_overdue_tasks()` for nightly rollover and stagnancy counter updates
- **Client Sync:** Built-in LocalStorage and JSON export/import backup system in the application UI.

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build & type check
npm run build
```
Navigate to `http://localhost:5173/` in your browser.
