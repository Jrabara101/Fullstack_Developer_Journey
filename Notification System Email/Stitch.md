# Design System Specification: Multi-Channel Notification Center (Stitch.md)

**System Name:** Stitch Pulse Omni-Channel Notification Center  
**Version:** 2.4.0 (Production Grade)  
**Target Environments:** Web Desktop & Mobile (React / Tailwind CSS / Modern CSS Standards) & Transactional HTML Email (RFC 8058 compliant)  
**Architectural Pedigree:** Inspired by Linear's keyboard-first triage ergonomics, GitHub's thread subscription models, Knock/Courier's intelligent multi-channel routing engine, and Apple iOS's serene glanceable notification cards.

---

## 1. Visual Identity & Aesthetic Principles

### 1.1 Aesthetic Philosophy: Tactical Glanceability Meets Serene Minimalism
Modern knowledge workers and engineering teams suffer from severe cognitive notification fatigue. Most tools exacerbate this by treating every ping as a frantic interruption. 

The Stitch Pulse design philosophy is predicated on:
1. **Low-Contrast Baseline, High-Contrast Signal:** Backgrounds, dividers, and read items recede into calm, neutral obsidian and slate tones. Dynamic accent colors (Cobalt unread dots, Amber decision pills, Crimson security shields) are reserved exclusively for actionable states.
2. **Density Rhythm & Micro-Spacing:** Compact 44px–52px line-item heights in the flyout drawer ensure maximum visible entries per viewport, expanding into comfortable 72px+ reading cards inside the full-screen triage console.
3. **Optimistic Zero-Latency Tactility:** Every interaction—marking as read, approving a pull request, accepting a team invite—is executed optimistically on the client with instant visual feedback and a 5-second non-blocking undo toast.

---

## 2. Design Tokens & System Specifications

### 2.1 Color Palette & Chromatic Values

| Token | Light Mode Value | Dark Mode Value (Default) | Semantic Application |
|---|---|---|---|
| `canvas-primary` | `#FFFFFF` | `#0A0B0E` | Main application shell and viewport canvas |
| `surface-secondary` | `#F8FAFC` | `#131418` | Flyouts, cards, reading stage backdrop |
| `surface-elevated` | `#FFFFFF` | `#191B20` | Modals, popovers, flyout drawer container |
| `surface-hover` | `rgba(15, 23, 42, 0.04)` | `rgba(255, 255, 255, 0.05)` | Hover state for notification rows and action buttons |
| `surface-active` | `rgba(15, 23, 42, 0.08)` | `rgba(255, 255, 255, 0.09)` | Keyboard focus ring fill, pressed item state |
| `border-divider` | `#E2E8F0` | `#242730` | Hairline panel borders, divider rules, subtle separators |
| `border-elevated` | `#CBD5E1` | `#333744` | Popover outlines, active modal borders |
| `text-primary` | `#0F172A` | `#F8FAFC` | High-contrast notification headlines, actor names |
| `text-secondary` | `#475569` | `#C8D2DE` | Context descriptions, email subject lines |
| `text-muted` | `#64748B` | `#8F9CAE` | Timestamps, trigger reasons, metadata tags |
| `text-subtle` | `#94A3B8` | `#586274` | Keyboard shortcuts, disabled indicators, footnote copy |

### 2.2 Notification Status & Channel Accents

| Token | Hex / RGBA Light | Hex / RGBA Dark | Semantic Role |
|---|---|---|---|
| `accent-unread-pill` | `#2563EB` | `#3B82F6` | Counter pill badge on top-nav bell and filter tabs |
| `accent-unread-dot` | `#3B82F6` | `#3B82F6` | Solid 8px circular pip indicating unread status |
| `status-action-required` | `#F59E0B` (`rgba(245, 158, 11, 0.12)`) | `#FBBF24` (`rgba(251, 191, 36, 0.15)`) | Pending PR approvals, invitations, required user actions |
| `status-critical-alert` | `#EF4444` (`rgba(239, 68, 68, 0.12)`) | `#F87171` (`rgba(248, 113, 113, 0.16)`) | Security logins, failed billing, expired access keys |
| `status-resolved` | `#10B981` (`rgba(16, 185, 129, 0.12)`) | `#34D399` (`rgba(52, 211, 153, 0.15)`) | Accepted invites, merged PRs, resolved alerts |
| `channel-email-glyph` | `#6366F1` | `#818CF8` | Email delivery indicator, transactional template badge |
| `channel-in-app-glyph` | `#3B82F6` | `#60A5FA` | Real-time WebSocket bell channel indicator |
| `channel-push-glyph` | `#8B5CF6` | `#A78BFA` | Mobile/desktop web push indicator |

### 2.3 Typography Scale

```css
/* Font Stacks */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', Consolas, monospace;

/* Type Tokens */
.font-display     { font-family: var(--font-sans); font-size: 1.125rem; font-weight: 600; letter-spacing: -0.02em; }
.font-heading     { font-family: var(--font-sans); font-size: 0.9375rem; font-weight: 600; letter-spacing: -0.015em; }
.font-body        { font-family: var(--font-sans); font-size: 0.8125rem; font-weight: 400; line-height: 1.45; }
.font-body-dense  { font-family: var(--font-sans); font-size: 0.75rem; font-weight: 400; line-height: 1.4; }
.font-mono-meta   { font-family: var(--font-mono); font-size: 0.6875rem; font-weight: 500; letter-spacing: -0.01em; }
.font-kbd-legend  { font-family: var(--font-mono); font-size: 0.625rem; font-weight: 600; border-radius: 4px; }
```

---

## 3. Core Screen Blueprints

### Blueprint A: Navigation Bar Bell Trigger & Dropdown Flyout
- **Dimensions & Placement:**
  - Anchor: Header bar right utility cluster.
  - Flyout dimensions: `width: 420px; max-height: 580px; border-radius: 16px;`.
  - Floating depth: `box-shadow: 0 20px 48px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px var(--border-divider)`.
- **Top-Nav Trigger Anatomy:**
  - Minimalist bell icon button (`p-2 rounded-lg hover:bg-surface-secondary text-text-muted hover:text-text-primary transition-colors`).
  - Unread badge pill: Overlapping top-right (`h-4 min-w-[16px] px-1 text-[10px] font-bold text-white rounded-full bg-accent-unread-pill flex items-center justify-center`). Displays `"9+"` when items exceed 9.
- **Header Strip:**
  - Left: Headline `"Notifications"` + pill chip with unread count.
  - Right: Quick action buttons:
    - `"Mark all as read"` (double-check icon with tooltip `Alt+A`).
    - `"Settings"` (gear icon routing to `/settings/notifications`).
- **Segmented Filter Pills:**
  - Sticky sub-header horizontal scroll track with four pills: `All`, `Unread (4)`, `Mentions`, `System`.
- **List Container & Grouping Rhythm:**
  - Virtualized list with date headers (`"Today"`, `"Yesterday"`, `"Older"`).
  - Unread item anatomy:
    - Actor Avatar (36px squircle) with contextual bottom-right badge (chat bubble, key, credit card, git-pull).
    - Content stack: **Sarah Lin** mentioned you in **Q4 Product Strategy**. Subtext shows truncated message excerpt.
    - Timestamp (`"4m"`) + 8px electric blue unread dot.
    - Hover Action Strip: Smoothly replaces timestamp with `[Mark Read]`, `[Archive]`, `[Mute Thread]`.
- **Footer Bar:**
  - Centered navigation link: `"View all notifications in Inbox →"` linking to `/notifications`.

---

### Blueprint B: Full-Page Power Triage Console (`/notifications`)
- **Desktop Split-Stage Layout:**
  - Left Column (420px fixed master list):
    - Search input (`"Filter by keyword, author, or project..."`) with instant debounce.
    - Batch Action Toolbar (surfaces when 1+ checkboxes are checked): `[Mark Read]`, `[Archive]`, `[Delete]`, `[Snooze ▾ (1h, 3h, Tomorrow)]`.
    - Keyboard active item highlight: `ring-2 ring-blue-500/50 bg-blue-50/15 dark:bg-blue-950/25`.
  - Right Stage (Fluid high-context reading stage):
    - Entity header with full actor details, delivery timestamp, category badge, and "Why did I receive this?" audit chip.
    - Full rendered thread conversation, markdown content preview, or diff snippet.
    - Action-in-Place dock:
      - Quick reply input box with `Ctrl+Enter` send.
      - Inline decision controls (`[Approve]`, `[Decline]`, `[Open Resource ↗]`).

---

### Blueprint C: Multi-Channel Preferences Matrix (`/settings/notifications`)
- **Global Overrides Card:**
  - **Do Not Disturb (DND):** Start & End time pickers (`22:00` to `08:00`) with auto-detected timezone chip (`America/New_York` or local).
  - **Circadian Morning Digest:** Toggle to release held notifications at 08:30 AM in a clean summary stack.
  - **Desktop Push Notifications:** Permission status card with one-click browser push permission request.
- **Preferences Matrix Table:**
  - Four collapsible event category accordions:
    1. **Team & Collaboration:** Mentions, Thread Replies, Assignment Updates.
    2. **System & Security:** New IP Logins, Password Resets, API Token Expirations (*Email delivery locked to Instant with lock glyph and tooltip: "Mandatory for account security"*).
    3. **Billing & Account:** Invoices, Payment Failures, Usage Limit Warnings (80% / 100%).
    4. **Product & Releases:** Feature Announcements, Weekly Digest Tips.
  - Column controls:
    - `In-App Bell`: High-contrast toggle switch.
    - `Email Delivery`: Segmented dropdown (`Instant`, `Daily Digest`, `Off`).
    - `Push (Browser)`: Toggle switch.

---

### Blueprint D: Transactional Email Preview Template (Responsive HTML)
- **Container Structure:**
  - Canvas: `#F1F5F9` light slate envelope background.
  - Inner Card: 600px centered card (`#FFFFFF`, `border: 1px solid #E2E8F0`, `border-radius: 12px`, `padding: 32px`).
- **Brand Header:**
  - Monochrome logo mark + category breadcrumb (`"Team Collaboration • Mention"`).
- **Narrative Content:**
  - Actor avatar (40px) + Name + Organization + Time marker.
  - Quoted message bubble: `border-left: 4px solid #2563EB; background: #F8FAFC; border-radius: 0 8px 8px 0; padding: 16px;`.
  - Action CTA button: High-contrast blue button (`#2563EB`, text: `#FFFFFF`, `border-radius: 8px`, `font-weight: 600`, `padding: 12px 24px`): `"Reply to Comment →"`.
- **Trust & Compliance Footer:**
  - Explanation: *"You received this email because you are watching the thread 'Q4 Product Roadmap' in Acme Corp."*
  - RFC 8058 compliant unsubscribe link: `[One-Click Unsubscribe from this Thread]` • `[Manage Notification Settings]`.

---

## 4. Micro-Interactions & State Transitions

1. **Badge Pop & Counter Morph:** When a WebSocket payload arrives, the unread badge executes a quick scale bounce (`transform: scale(1.25) -> scale(1.0)` over 150ms cubic-bezier) accompanied by an electric blue pulse aura.
2. **Inline Action Optimistic Resolution:** Clicking `[Accept Invite]` or `[Approve]` immediately transforms the button group into an emerald green checkmark pill (`"Approved"`) without closing the drawer or causing layout shift.
3. **5-Second Non-Blocking Undo Toast:** Batch actions ("Mark all as read", "Archive 5 items") instantly update UI state and surface a floating bottom toast with a visual 5-second progress countdown and `[Undo]` button.
4. **Keyboard-First Shortcuts:**
   - `J` / `K` or `↓` / `↑`: Traverse list items.
   - `E`: Mark Read / Archive selected item.
   - `U`: Toggle Unread status.
   - `S`: Snooze for 3 hours.
   - `V` or `Enter`: Open reading detail stage.
   - `Esc`: Close flyout drawer.

---

## 5. Backend Architecture & High-Volume Delivery Pipeline

### 5.1 PostgreSQL Schema Architecture

```sql
-- 1. Notification Templates
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(64) UNIQUE NOT NULL,
    category VARCHAR(32) NOT NULL, -- 'collaboration', 'security', 'billing', 'product'
    title_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    default_channels JSONB NOT NULL DEFAULT '{"in_app": true, "email": "instant", "push": false}',
    is_mandatory BOOLEAN DEFAULT false, -- e.g. security alerts cannot be disabled
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Core Notifications Record
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    template_id UUID REFERENCES notification_templates(id),
    category VARCHAR(32) NOT NULL,
    actor_id UUID,
    actor_name VARCHAR(128),
    actor_avatar TEXT,
    entity_type VARCHAR(64) NOT NULL, -- 'comment', 'pr', 'invoice', 'auth_session'
    entity_id VARCHAR(128) NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    action_url TEXT,
    action_type VARCHAR(32) DEFAULT 'view', -- 'approve_reject', 'accept_decline', 'quick_reply', 'view'
    action_resolved BOOLEAN DEFAULT false,
    action_resolved_state VARCHAR(32), -- 'approved', 'declined', 'replied'
    metadata JSONB DEFAULT '{}',
    delivery_rule_reason TEXT NOT NULL, -- "Sent because you are assigned to this project"
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    is_archived BOOLEAN DEFAULT false,
    is_snoozed BOOLEAN DEFAULT false,
    snoozed_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notifications_user_inbox ON notifications (user_id, is_archived, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications (user_id) WHERE is_read = false AND is_archived = false;

-- 3. Multi-Channel User Preferences
CREATE TABLE notification_preferences (
    user_id UUID NOT NULL,
    category VARCHAR(32) NOT NULL,
    in_app_enabled BOOLEAN NOT NULL DEFAULT true,
    email_mode VARCHAR(16) NOT NULL DEFAULT 'instant', -- 'instant', 'digest', 'disabled'
    push_enabled BOOLEAN NOT NULL DEFAULT false,
    dnd_start TIME WITHOUT TIME ZONE,
    dnd_end TIME WITHOUT TIME ZONE,
    timezone VARCHAR(64) DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, category)
);

-- 4. Email Deliveries & Audit Trail
CREATE TABLE email_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
    user_id UUID NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    provider VARCHAR(32) NOT NULL DEFAULT 'resend', -- 'resend', 'postmark'
    provider_message_id VARCHAR(128),
    status VARCHAR(32) NOT NULL DEFAULT 'queued', -- 'queued', 'sent', 'delivered', 'bounced', 'opened'
    delivery_type VARCHAR(16) NOT NULL DEFAULT 'instant', -- 'instant', 'digest', 'escalation_fallback'
    unsubscribe_token VARCHAR(128) UNIQUE NOT NULL,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.2 BullMQ / Redis Queue Architecture
- **Queue 1: `instant-dispatch`**  
  High-priority worker processing in-app WebSocket broadcasts and transactional security/urgent emails within <100ms.
- **Queue 2: `batch-aggregator`**  
  Applies the Cognitive Fatigue Shield. Gathers rapid events within a 10-minute quiet buffer for the same `(user_id, entity_type, entity_id)` and produces unified digests (*"Sarah and 3 others commented on your roadmap"*).
- **Queue 3: `escalation-fallback`**  
  Scheduled delayed job (30 minutes). If an urgent notification remains unread in the in-app inbox after 30 minutes, it dispatches an email fallback.
- **Queue 4: `digest-cron`**  
  Runs circadian morning recaps (e.g. 08:30 AM local user time) to release all non-urgent notifications queued during Do Not Disturb quiet hours.
