# NEXUS: Progressive Social Relationship & Follow Graph System

A modern, high-concurrency Social Relationship & Follow Engine web application built with **React 19**, **Vite 8**, **Tailwind CSS v4**, and a resilient **PostgreSQL / Supabase** graph architecture.

---

## 🌟 Core Product Vision & Value Proposition

Nexus establishes an **asymmetrical-to-symmetrical relationship system** that combines the low-friction discovery of Twitter/Instagram with the intimacy of mutual friendships:
- **Instant Asymmetrical Follow**: 0-friction one-way subscriptions allowing users to curate public feeds without approval.
- **Automated Friendship Trigger**: When User B reciprocates User A's follow, the system silently triggers an elevated `FRIENDSHIP_CONFIRMED` event. Both profiles dynamically reveal the exclusive **Mutual Friends** status pill and shared badge.
- **Tiered Social Intimacy**: Dynamic content gating where posts, stories, contact info (email/phone), and activity status can be targeted to: `Public 🌐`, `Followers Only 👥`, or `Mutual Friends Only ✨🔒`.
- **Relationship Timeline Milestone**: Contextual profile memory chip displaying mutual tenure (e.g., *"Mutuals since October 2024 • 12 Shared Connections"*).

---

## 🛠️ Key High-Impact Features

### 1. Dynamic Button State Machine (`RelationshipActionButton`)
A unified action button that morphs smoothly across 5 discrete visual states:
1. **Not Following / Stranger (`+ Follow`)**: High-contrast solid primary (`bg-slate-900 text-white dark:bg-white dark:text-black font-medium px-4 py-1.5 rounded-full text-sm`).
2. **Follow Back (`Follow Back ⮂`)**: Subtle colored ring (`border border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/70 font-medium px-4 py-1.5 rounded-full text-sm`).
3. **Pending Approval (`Requested ⏳`)**: Muted border, low-contrast surface for private accounts. On hover, flips to red "Cancel".
4. **Following One-Way (`Following`)**: Secondary outline. On hover, label switches to crimson **"Unfollow"** (`hover:border-red-500 hover:text-red-600`).
5. **Mutual Friends (`Friends ✨`)**: Gradient border badge (`bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-violet-500/30 text-violet-700 dark:text-pink-300`). Includes a dropdown chevron trigger for relationship settings (Mute, Soft Remove, Direct Message, Disconnect).

### 2. Celebratory Mutual Micro-Interaction ("The Mutual Spark")
When clicking **Follow Back ⮂** completes the mutual connection loop:
- Button triggers a spring pop animation (`scale-105`).
- A celebratory burst of electric violet and pink particles (`canvas-confetti`) erupts.
- Avatar smoothly transitions into a continuous rotating gradient border ring (`p-[2.5px] animate-mutual-ring rounded-full`).
- Unlocks direct messaging and confidential mutual posts.

### 3. Contextual Overlap Radar & Hovercard Previews
- **Contextual Overlap Radar**: Displays social proof: *"Followed by Sarah, Alex, and 4 other mutual friends"* with stacked circular micro-avatars.
- **Interactive Hovercard Previews (`ContextualHovercard`)**: Hovering over any mention or avatar renders an interactive relationship card with zero layout shift (showing follow state, mutual connections, and recent shared interactions).
- **Smart Suggestions Based on Network Density (`DiscoveryRadar`)**: Recommends accounts based on graph triangle completions (users who follow your mutuals, but whom you haven't followed yet).

### 4. Privacy, Safety & Soft-Disengagement Controls
- **Silent Uncoupling & "Soft Block"**: Ability to remove a follower without blocking them entirely, seamlessly dropping the connection from "Mutual Friend" back to a one-way follow or clean slate without sending a notification.
- **Mute Without Severing**: Users can mute posts and activity updates while preserving public mutual status to avoid social friction.
- **Follow Request Gates for Private Accounts**: Asymmetrical pending requests that transition directly to Mutual Friendship if the target is already following the requester.
- **Optimistic UI with Instant Rollback**: 0ms optimistic UI transitions. When simulated network error is toggled in the header, operations trigger a shake animation and roll back state gracefully with an alert toast.

---

## 🗄️ Backend Architecture & Schema (`schema.sql`)

### Key Relational Tables:
- `users`: Core profile data + intimate contact information (`email`, `phone_number`).
- `relationships`: Directed asymmetrical graph edges with composite primary key: `(follower_id, following_id)`.
- `relationship_requests`: Pending authorization requests for private accounts.
- `user_mutes`: Soft-disengagement flags (`user_id`, `muted_user_id`).
- `posts`: Social content with `audience` column (`public`, `followers`, `mutuals`).
- `direct_messages`: End-to-end communication channels strictly restricted to mutual friends.

### Real-Time Computed View & Materialized View:
```sql
CREATE MATERIALIZED VIEW IF NOT EXISTS friendships_materialized AS
SELECT 
    LEAST(r1.follower_id, r1.following_id) AS user_low_id,
    GREATEST(r1.follower_id, r1.following_id) AS user_high_id,
    GREATEST(r1.created_at, r2.created_at) AS mutual_since
FROM relationships r1
INNER JOIN relationships r2
    ON r1.follower_id = r2.following_id 
   AND r1.following_id = r2.follower_id
WHERE r1.follower_id < r1.following_id
WITH DATA;
```

### Database Triggers:
- `trg_relationship_mutual_check`: Dispatches `pg_notify` / Supabase Realtime event `relationship.mutual_unlocked`.
- `trg_relationship_sever_check`: Evaluates if severed connection was mutual and dispatches `relationship.mutual_severed`.
- `trg_request_auto_mutual`: If user A sends request to private user B, but user B already follows A, auto-promotes directly to Mutual Friendship!

### Row-Level Security (RLS) Policies:
- Intimate fields and mutual-only posts are strictly locked unless a bidirectional edge exists in `friendships`.

---

## 🎨 UI/UX Design System (`stitch.md`)

| Design Token | Light Value | Dark Value | Purpose |
| :--- | :--- | :--- | :--- |
| `canvas-primary` | `#FFFFFF` | `#0A0A0C` | Viewport canvas |
| `surface-secondary` | `#F8FAFC` | `#121316` | Feed cards & profile background |
| `surface-elevated` | `#FFFFFF` | `#1A1C20` | Hovercards & modals |
| `border-subtle` | `#E2E8F0` | `#26292E` | Borders and dividers |
| `brand-action` | `#2563EB` | `#3B82F6` | Primary action buttons |
| `mutual-start` | `#8B5CF6` | `#A78BFA` | Electric Violet (Mutual start) |
| `mutual-end` | `#EC4899` | `#F472B6` | Vibrant Pink (Mutual end) |
| `destructive` | `#EF4444` | `#F87171` | Unfollow crimson hover |

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Build production bundle
npm run build
```
Navigate to `http://localhost:5173` to explore the live application.
