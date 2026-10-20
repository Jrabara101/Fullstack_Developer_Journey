# NEXUS: Progressive Relationship & Follow Engine — UI/UX Design System Specification

## 1. Visual Identity & Aesthetic Principles

- **Design Language**: Tactile social minimalism inspired by Threads, Linear, and modern Discord. Crisp borders, calibrated whitespace, elevated backdrops with high-order Gaussian blurs (`backdrop-blur-md`), and warm human-centric surfaces.
- **Progressive Intimacy**: Visual styling deepens dynamically as a connection matures:
  - **Strangers / Non-Followers**: Clean, neutral monochrome surfaces with high-contrast call-to-actions.
  - **One-Way Inbound ("Follow Back")**: Subtle sky-tinted highlight ring with reciprocal icon indicators.
  - **One-Way Outbound ("Following")**: Subtle slate borders, calming secondary presence.
  - **Mutual Friends ("Friends ✨")**: Unlocks vibrant dual-tone violet-to-pink gradient accents, animated continuous border rings around avatars, elevated status pills, and unlocked private contact & communication zones.
- **Density Calibration**:
  - **High-Density**: User cards in lists, search drawers, and discovery radars with tabular metric alignment.
  - **Breathable Canvas**: Spacious profile hero header and rich social feed cards with comfortable vertical rhythm.

---

## 2. Design Tokens & Styling Variables

### Color System

| Token Name | Light Mode Value | Dark Mode Value | Usage Context |
| :--- | :--- | :--- | :--- |
| `canvas-primary` | `#FFFFFF` | `#0A0A0C` | Main background viewport |
| `surface-secondary` | `#F8FAFC` | `#121316` | Feed cards, sidebar containers, headers |
| `surface-elevated` | `#FFFFFF` | `#1A1C20` | Hovercards, floating menus, dialog modals |
| `border-subtle` | `#E2E8F0` | `#26292E` | Card borders, section separators, divider lines |
| `border-active` | `#CBD5E1` | `#3F444D` | Active tab indicators, input borders |
| `text-primary` | `#0F172A` | `#F8FAFC` | Display names, post headlines, primary labels |
| `text-muted` | `#64748B` | `#94A3B8` | User handles, connection counts, timestamps |
| `brand-action` | `#2563EB` | `#3B82F6` | Primary action buttons, verified badge checks |
| `mutual-start` | `#8B5CF6` | `#A78BFA` | Mutual gradient origin (Electric Violet) |
| `mutual-end` | `#EC4899` | `#F472B6` | Mutual gradient terminus (Vibrant Pink) |
| `mutual-glow` | `rgba(236, 72, 153, 0.15)` | `rgba(236, 72, 153, 0.25)` | Ambient friendship aura |
| `destructive-hover` | `#EF4444` | `#F87171` | Unfollow & soft-block hover alert |

### Typography Scale

- **UI & Navigation**: `Inter`, `-apple-system`, `sans-serif` (12px to 14px, tracking `-0.01em`, font weight `500` / `600`).
- **Display & Profile Names**: `Plus Jakarta Sans` or `Inter Display`, 18px to 24px, Bold (`font-bold`).
- **Microcopy & Tabular Metrics**: Monospace tabular figures (`JetBrains Mono`, `font-mono tabular-nums`, 12px) for metrics like follower, following, and mutual friend counts.

---

## 3. Core Component Blueprints

### A. Universal Relationship Action Button (`RelationshipActionButton`)

The interactive pill morphs across 5 discrete visual states:

1. **Not Following / Stranger (`+ Follow`)**:
   - `bg-slate-900 text-white dark:bg-white dark:text-black font-medium px-4 py-1.5 rounded-full text-sm hover:opacity-90 transition-all active:scale-95`
2. **Follow Back (`Follow Back ⮂`)**:
   - `border border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 font-medium px-4 py-1.5 rounded-full text-sm hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-all active:scale-95 flex items-center gap-1.5`
3. **Pending Approval (`Requested ⏳`)**:
   - `bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 font-medium px-4 py-1.5 rounded-full text-sm cursor-default flex items-center gap-1.5`
4. **Following One-Way (`Following`)**:
   - `border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 font-medium px-4 py-1.5 rounded-full text-sm transition-colors duration-150`
   - *Hover Flip*: Text smoothly transitions to "Unfollow" on hover.
5. **Mutual Friends (`Friends ✨`)**:
   - `bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-violet-500/30 text-violet-700 dark:text-pink-300 font-medium px-3.5 py-1.5 rounded-full text-sm shadow-sm hover:border-pink-500/50 transition-all flex items-center gap-1.5`
   - Integrated dropdown menu trigger for Muting, Soft-Block (silent removal of follower), Direct Messaging, and Close Friends tagging.

---

### B. User Profile Header with Friendship Reveal (`ProfileHeader`)

- **Avatar Stack**:
  - `96x96px` circular avatar.
  - **Mutual Status Active**: Continuous animated rotating gradient ring (`p-[2.5px] bg-gradient-to-tr from-violet-500 via-purple-500 to-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.35)] rounded-full`).
  - **Status Chip**: Overlapping badge at bottom-right of avatar featuring interlocking dual-rings glyph.
- **Identity Row**:
  - Primary display name + `@handle`.
  - **MutualBadge**: Glowing pill with dual interlocking rings glyph and "Mutual Friend" label.
  - Active status indicator ("Active now", "Online", or custom status).
- **Relationship Context Strip**:
  - Horizontal metadata proof: *"Followed by Sarah, Alex, and 4 other accounts you follow"*, with a 3-avatar stacked micro cluster.
- **Metric Row**:
  - Segmented buttons: `[ 412 Following ] [ 1.8k Followers ] [ 84 Mutuals ]` with tabular monospace numbers. Clicking opens the connection modal pre-filtered.
- **Timeline Milestone**:
  - Profile memory chip: *"Mutuals since October 2024 • 12 Shared Connections"*.
- **Mutual Content Gate Unlocking**:
  - Displays private contact info card (Direct Email, Secure Phone, Discord handle, Direct Message button) when bidirectional mutual edge exists. If not mutual, displays a sleek frosted glass container with *"🔒 Contact details visible to Mutual Friends only"*.

---

### C. Contextual Hovercard (`ContextualHovercard`)

- **Floating Geometry**: Width `320px`, `rounded-2xl`, elevated shadow `shadow-2xl`, border `border-slate-200 dark:border-zinc-800`, background `bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md z-50`.
- **Zero Layout Shift**: Positioned with fixed coordinates or anchored popover.
- **Card Contents**:
  - **Top Row**: 44px circular avatar with mutual ring indicator + full `RelationshipActionButton`.
  - **Middle Row**: Display name, `@handle`, bio snippet (max 2 lines), and contextual badge ("Follows you" if inbound).
  - **Footer Row**: Shared mutual count + mini avatar cluster of mutual connections.

---

### D. Social Graph Connection Modal (`SocialConnectionsDrawer`)

- **Dialog Geometry**: Centered modal (max-w-md w-full) with darkened blurred backdrop (`backdrop-blur-sm bg-black/40`).
- **Segmented Tabs**:
  - `Followers (N)`
  - `Following (N)`
  - `Mutual Friends (N)` (highlighted with subtle violet-pink gradient active pill)
- **Search Bar**: Instant real-time fuzzy filtering by display name or username handle.
- **List Item Card**:
  - Avatar with mutual status ring if applicable.
  - Name and handle + mutual connection summary chip.
  - Embedded Universal Relationship Action Button for inline relationship state management.

---

## 4. Micro-Interactions & Animation Specs

1. **The "Mutual Spark" Celebration**:
   - When a user clicks `Follow Back ⮂`, completing the bidirectional loop:
   - Button performs a spring pop (`scale(1.06)` -> `scale(1)`).
   - An burst of electric violet and pink particles (`canvas-confetti`) erupts from the button center.
   - The avatar smoothly transitions to the dual-tone spinning gradient ring.
   - A celebration toast announces *"Mutual Friendship Unlocked! ✨ You can now exchange direct messages and view mutual-exclusive posts."*
2. **Optimistic Rollback**:
   - Every button action updates the UI instantly (0ms latency).
   - If simulated network error toggle is active:
     - The button triggers an error shake animation (`translate-x-[-4px]` to `translate-x-[4px]`).
     - State rolls back gracefully to previous state.
     - An alert toast warns: *"Network timeout: Connection state restored."*
3. **Hover Flip**:
   - Hovering over `Following` transforms the label to crimson `"Unfollow"`.
   - Hovering over `Friends ✨` reveals dropdown options or `"Disconnect"`.
