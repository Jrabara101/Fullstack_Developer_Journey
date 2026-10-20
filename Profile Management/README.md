# Atelier Identity — High-Conversion Profile Management & User Settings

An intuitive, high-trust identity management center synthesizing the effortless aesthetic of **Linear** and **Raycast** with the defensive data sovereignty of **GitHub** and **Apple ID**.

Built with **React**, **Vite**, **Tailwind CSS**, and a resilient **Node.js / PostgreSQL / Supabase / S3** backend architecture.

---

## Key Features & Product Experience

### 1. Tactile Avatar & Media Curation Studio
* **In-Browser Interactive Canvas Cropper:** High-precision modal featuring smooth pan, pinch/wheel zoom, 90° rotation handles, 3x3 grid guidelines, and boundary clipping. Supports circular (1:1) aspect locking for avatars and panoramic (3:1) locking for cover banners.
* **Client-Side Compression & Smart Fallbacks:** Instant client-side WebP compression ensuring sub-500ms uploads without server bottlenecks. If no photo is provided, generates dynamic multi-style generative fallback avatars (Geometric Gradient Meshes, Clean Initials, or Playful Algorithmic SVG Seeds).
* **Social & Gravatar Sync Bridge:** One-click import allowing users to pull verified profile photos and metadata directly from GitHub, Gravatar (via cryptographic MD5 email hashing), or Google Workspace.
* **Accessibility & Alt-Text Bridge:** Prompts users for an optional descriptive image caption or alt-text for screen readers when uploading custom profile pictures.

### 2. Audience-Gated Visibility & "View As" Simulator
* **Field-by-Field Privacy Scopes:** Fine-grained audience controls on individual data points (Email, Phone, Real Name, Activity Status, Social Links) selectable between `Public`, `Team/Connections Only`, and `Private (Only You)`.
* **Live "View Profile As" Impersonation Sandbox:** Interactive toggle letting users preview exactly how their profile appears to an **Anonymous Stranger**, an authenticated **Team Colleague**, a **Search Crawler (Googlebot)**, or **You (Owner)** without logging out.
* **Search Indexing & Discoverability Controls:** Single-switch toggle to disallow search engine crawlers from indexing the user's public profile page (`noindex, nofollow` meta enforcement).

### 3. Temporal Ergonomics & Locale Preferences
* **Context-Aware Regional Formatting:** Auto-detects and allows manual overrides for timezone, 12h/24h clock, first day of the week (Sunday vs. Monday), number separators, and language locales with real-time preview chips (*"Preview: Monday, 12 October 2026 • 14:30"*).
* **Smart Notification Horizon:** Timezone-anchored quiet hours ("Do Not Disturb") automatically pausing email digests and push alerts during user sleeping hours.
* **Interface Density & Theme Schedules:** Instant switching between Compact, Cozy, and Spacious UI densities, alongside scheduled theme automation (light canvas during daylight, obsidian dark canvas after sunset).

### 4. Data Sovereignty, Audit Trails & Account Lifecycle
* **Zero-Lock-In Personal Data Takeout:** Single-click export compiling user profile, preferences, media links, and audit logs into a formatted `.json` bundle and downloadable `.zip` archive (GDPR Article 20 / CCPA Section 1798.100 compliant).
* **Floating Dirty-State Bar:** Non-intrusive floating dock that springs into view when form fields are modified (*"Careful — you have unsaved changes"*), complete with instant `Revert` and `Save Changes` hotkeys (`Cmd+S` / `Ctrl+S`).
* **Quarantine Deactivation vs. Permanent Deletion:** Clear separation between soft temporary account freezing and permanent deletion with a 14-day recovery grace period and double-confirmation security prompt requiring typing `"delete my account"`.

---

## Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS v3, Lucide React, TanStack Query (React Query), JSZip, canvas-confetti.
- **Backend:** Node.js, Express, Archiver (streaming zip creation), Crypto.
- **Database Architecture:** PostgreSQL & Supabase schema with Row-Level Security (RLS) policies, indexes, and triggers (`server/src/db/schema.sql`).
- **Resilient Storage:** In-memory + JSON persistence engine (`server/src/db/store.js`) ensuring out-of-the-box local execution.

---

## Getting Started

### 1. Install Dependencies
```bash
# In client:
cd client && npm install

# In server:
cd ../server && npm install
```

### 2. Run the Application
From the root directory:
```bash
node start-dev.js
```
Or start each service individually:
```bash
# Start backend (Port 3001)
npm run dev:server

# Start frontend (Port 5173)
npm run dev:client
```
Visit **`http://localhost:5173`** in your browser.

---

## API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/profile` | Fetches active profile metadata and pending deletion status |
| `PUT` | `/api/profile` | Updates profile fields and logs audit events |
| `GET` | `/api/profile/check-username?username=...` | Asynchronous username availability validation |
| `POST` | `/api/media/upload-intent` | Presigned S3 / Supabase storage upload token generator |
| `POST` | `/api/media/upload` | Processes media upload & generates multi-resolution WebP derivatives |
| `POST` | `/api/media/sync-social` | Social and Gravatar photo import bridge |
| `GET` | `/api/account/export-takeout` | Downloads complete GDPR/CCPA personal data takeout `.zip` archive |
| `POST` | `/api/account/deactivate` | Soft temporary quarantine freeze |
| `POST` | `/api/account/reactivate` | Restores account to active status |
| `POST` | `/api/account/delete-intent` | Schedules permanent account purge with 14-day grace period |
| `POST` | `/api/account/cancel-deletion` | Cancels scheduled account purge |
| `GET` | `/api/account/audit-logs` | Fetches immutable security audit trail |
| `GET` | `/api/health` | Health check endpoint |
