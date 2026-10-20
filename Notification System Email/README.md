# Stitch Pulse — Omni-Channel Notification Center & Delivery Engine

**Production-Grade Omni-Channel Notification System** adhering strictly to the **Stitch.md** design specification. Synthesizes the triage speed of **Linear** and **GitHub Notifications** with the multi-channel orchestration of **Knock** and **Courier**.

---

## 🌟 Key Features

### 1. In-App Bell Trigger & Dropdown Flyout (Blueprint A)
* **Top-Nav Trigger Anatomy:** Minimalist bell icon with live unread counter badge (`9+` logic), real-time WebSocket transport indicator pip, and scale bounce pop animation on incoming pings.
* **Flyout Container:** 420px max-width, 580px max-height elevated card with header action strip (`Mark all as read`, `Settings`).
* **Segmented Filter Pills:** Horizon strip with compact filter tabs: `All`, `Unread (4)`, `Mentions`, `System`.
* **Grouped Virtualized List:** Grouped date headers (`Today`, `Yesterday`, `Older`).
* **Actionable Notification Cards:** Squircles with category badges, narrative lines with bold actor names, truncated body excerpts, and polymorphic action slots.
* **Hover Action Strip:** Smoothly swaps timestamp for quick action buttons: `[Mark as Read]`, `[Archive]`, `[Snooze 3h]`, `[Why did I receive this?]`, `[View Transactional Email]`.

### 2. Full-Page Power Triage Console (Blueprint B: `/notifications`)
* **Desktop Split-Stage Layout:** 420px master list column on left, fluid high-context reading stage on right.
* **Fuzzy Search & Multi-Select Batch Toolbar:** Rapid keyword filtering + batch toolbar (`[Mark Read]`, `[Archive]`, `[Snooze ▾]`).
* **Keyboard-First Navigation:**
  * `J` / `↓` : Next item
  * `K` / `↑` : Previous item
  * `E` : Mark Read / Archive selected item
  * `U` : Toggle Unread
  * `S` : Snooze for 3 hours
  * `Ctrl+Enter` : Send quick-reply
* **High-Context Reading Stage:** Full thread conversation, pull request diff stats (`+342 -89`), security IP/device telemetry, and direct action-in-place controls.

### 3. Multi-Channel Preferences Matrix (Blueprint C: `/settings/notifications`)
* **Global Overrides:**
  * **Do Not Disturb (DND):** Start & End quiet hours pickers (`22:00` to `08:00`) with auto-detected timezone chip (`America/New_York`).
  * **Circadian Morning Digest:** Queues non-critical alerts during rest hours and releases them in an 08:30 AM morning stack.
  * **Desktop Browser Push:** One-click permission toggle.
  * **Burnout Safeguard Ceiling:** Frequency capping at 15 alerts/day max.
* **Matrix Grid Table:** Collapsible accordions for **Team & Collaboration**, **System & Security** (*email locked to Instant with lock badge*), **Billing & Usage**, and **Product Updates**.

### 4. Transactional Email Preview Template (Blueprint D: Responsive HTML)
* **600px Centered Card:** Light `#F1F5F9` envelope backdrop, monochrome brand header, quoted message bubble with vertical left accent (`border-l-4 border-blue-600`), and high-contrast centered action CTA button (`"Reply to Comment →"`).
* **RFC 8058 Compliance:** Single-click `List-Unsubscribe` header support and instant token link without requiring password login.
* **Interactive Controls:** Toggle between Light & Dark email client preview, view raw generated HTML, or inspect RFC 8058 headers.

### 5. Cognitive Fatigue Shield & Dynamic Event Batching
* **Intelligent Time-Window Aggregation:** Rolls rapid-fire successive comments within a 10-minute quiet buffer into a single digest (*"Sarah and 4 others commented on your roadmap"*).
* **Channel Escalation Fallback:** 30-minute timer that automatically dispatches a fallback email if an urgent notification remains unread in the in-app inbox.
* **Personal Delivery Log ("Why did I receive this?"):** One-click audit modal explaining the exact trigger rule and delivery route.

---

## 🛠️ Getting Started

### Prerequisites
* Node.js v18+ (tested on v24.11.1)
* npm v9+

### Installation & Local Run
```bash
# Navigate to directory
cd "c:\Users\Admin\Fullstack_Developer_Journey\Notification System Email"

# Install dependencies (already completed)
npm install

# Start development server
npm run dev
```

Visit the app in your browser at `http://localhost:5173`.

---

## 🏗️ Technology Stack
* **Frontend:** React 18, Vite 5, Tailwind CSS 3
* **Icons:** Lucide React
* **Audio Engine:** Web Audio API synthesized pings
* **Design Tokens:** Strictly compliant with `Stitch.md` (Obsidian Dark `#0A0B0E`, Cobalt `#2563EB`, Electric Blue `#3B82F6`, Amber `#F59E0B`, Crimson `#EF4444`, Emerald `#10B981`)
