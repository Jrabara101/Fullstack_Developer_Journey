# NexusGraph — Friendship & Follow Graph System

A modern, high-concurrency **Social Relationship & Follow Engine** web application built with **React 19, Vite, Tailwind CSS**, and a resilient **PostgreSQL / Supabase** backend architecture.

---

## 🌟 Core Product Vision & Value Proposition

NexusGraph implements an **asymmetrical-to-symmetrical relationship model**, combining the frictionless subscription model of Twitter/X and Instagram with the intimate privacy of mutual friendship networks.

- **Instant Asymmetrical Follow:** Zero-friction one-way subscriptions allowing users to curate public feeds without requiring approval.
- **Automated Friendship Trigger:** When user B reciprocates user A's follow, the system silently triggers an elevated `FRIENDSHIP_CONFIRMED` event. Both profiles dynamically reveal the exclusive **Mutual Friends** status pill and shared badge.
- **Tiered Social Intimacy:** Dynamic content gating where posts, contact info, and activity status are targeted to: `Public`, `Followers Only`, or `Mutual Friends Only`.
- **Relationship Timeline Milestone:** Contextual profile memory chip displaying mutual tenure (e.g., *"Mutuals since October 2024 • 12 Shared Connections"*).

---

## 🚀 Key Features

### 1. Progressive Relationship Transition ("Mutual Unlock")
- **Instant Follow Back & Celebration:** Completing the bidirectional loop triggers the celebratory micro-interaction modal with interlocking glowing rings, gold-emerald particle confetti, and unlocked intimacy privileges.
- **Audience-Gated Content:**
  - `🌐 Public`: Visible to anyone on the platform.
  - `👥 Followers Only`: Automatically accessible to directed subscribers.
  - `🔒✨ Mutual Friends Only`: Exclusive updates, behind-the-scenes stories, and private contact details (phone, email) protected by PostgreSQL RLS.

### 2. Social Ergonomics & Mutual Discovery
- **Contextual Overlap Radar:** Displays social proof with stacked avatar rings: *"Followed by Sarah, Alex, and 2 other mutual friends"*.
- **Interactive Hovercard Previews:** Hovering over any mention or avatar renders an interactive relationship card showing follow state, mutual connections, and recent shared interactions with **zero layout shift**.
- **Smart Suggestions (Graph Triangle Completion):** Identifies triadic graph closures, recommending users who follow your mutuals with real-time network density scoring.

### 3. Privacy, Safety & Soft-Disengagement Controls
- **Silent Uncoupling & "Soft Block":** Ability to remove a follower without blocking them entirely, seamlessly dropping the connection from "Mutual Friend" back to a one-way follow or clean slate without sending a notification.
- **Mute Without Severing:** Users can mute posts and activity updates while preserving public mutual status to avoid social friction.
- **Follow Request Gates for Private Accounts:** Asymmetrical pending requests that transition directly to Mutual Friendship if the target is already following the requester.

### 4. Real-Time Presence & Interface Signals
- **Dynamic Button State Machine:** A unified action button that morphs smoothly across 5 discrete visual states:
  1. `+ Follow`
  2. `Requested`
  3. `Following` (morphs to red `Unfollow` on hover)
  4. `Follow Back` (pulsing reciprocal invitation)
  5. `Friends ✨` (opens friendship intimacy menu: Direct Message, Mute, Soft-Block, Unfollow)

---

## 🏗️ Technical Architecture & Deliverables

### Frontend (React + Vite + Tailwind CSS)
- **`useRelationship(targetUserId)` Hook:**
  - Optimistic UI updates with instant rollback on simulated or real network failures.
  - Encapsulated finite state machine handling state transitions (`NONE` ➔ `FOLLOWING` ➔ `MUTUAL` / `REQUESTED` / `FOLLOW_BACK`).
- **`RelationshipActionButton`:** Dynamic, context-aware interactive button with hover states and mutual dropdown settings.
- **`MutualBadge`:** Lightweight, animated chip rendered next to usernames with hover tooltips.
- **`SocialConnectionsDrawer`:** Slide-over tabbed modal (`Followers`, `Following`, `Mutuals`) with real-time fuzzy search and bulk filter pills (`All`, `Mutuals Only`, `Private`, `Online Now`).
- **`GraphTopologyVisualizer`:** Interactive SVG canvas rendering all graph nodes, directed one-way edges, and golden glowing mutual bridges in real time.
- **`PersonaSwitcher`:** 1-click switcher between 8 rich personas (Alex, Sarah, Elena, Marcus, Chloe, David, Maya, Jordan) to test reciprocation from both sides.
- **`EventLogTicker`:** Real-time event broker stream with network latency slider and optimistic failure simulation toggle.

### Backend & Storage (PostgreSQL / Supabase)
Complete schema located in `schema.sql`:
- **`relationships` table:** Directed graph edges with composite primary key `(follower_id, following_id)`.
- **`friendships` Materialized View & Computed View:** Joins `relationships r1` with `relationships r2` where `r1.follower_id = r2.following_id AND r1.following_id = r2.follower_id` with canonical `(LEAST, GREATEST)` indexing for sub-millisecond lookups.
- **Database Triggers:** Post-insert trigger evaluating inverse edge, dispatching `pg_notify('social_events', ...)` WebSocket payloads.
- **Row-Level Security (RLS):** Granular policies ensuring mutual-only fields and gated posts are only queryable when a bidirectional record exists in the friendship graph.

---

## 🛠️ Running Locally

```bash
# 1. Navigate to the project directory
cd "c:\Users\Admin\Fullstack_Developer_Journey\Friendship System"

# 2. Start the Vite development server
npm run dev

# 3. Open in your browser
http://localhost:5173/
```
