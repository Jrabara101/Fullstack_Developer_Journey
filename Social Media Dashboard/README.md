# Lumen — Social Editorial & Messaging Dashboard

A modern, high-concurrency Social Media Dashboard combining an **Intentional Multi-Lens Feed**, **24-Hour Ephemeral Stories ("Living Moments")**, an **Expressive Profile Studio**, and **Real-Time Direct Messaging** with a persistent Floating Quick-Chat Dock.

## Quick Start

```bash
npm install
npm run dev
```

- **Frontend (Vite + React 19 + Tailwind CSS v4):** `http://localhost:5173`
- **Backend (Fastify 5 + WebSockets + Node `node:sqlite`):** `http://localhost:3001`

## Verification Commands

```bash
npm run build   # TypeScript typecheck + production Vite bundle
npm run lint    # Oxlint static checks
npm test        # Backend visibility/RLS, TTL Story Archiver, Story-to-DM & cursor pagination tests
```

## Architecture Highlights

- **Frontend State & Sync:** TanStack Query (`useInfiniteQuery` cursor pagination + optimistic UI mutations with rollback) paired with Zustand (`useStoryPlayerStore`, `useMessengerStore`, `useAppStore`) and WebSocket live presence/typing/read receipts (`/ws`).
- **Backend & Storage:** Local Fastify + `node:sqlite` server (`server/`) implementing Close Friends ACL checks, mutuals-only reply restrictions, 3-comment pinning limit, automated 24h TTL story archiving, and S3-compatible media uploads (`server/storage.ts`).
- **Production PostgreSQL / Supabase Migrations:** Complete DDL and Row-Level Security (RLS) SQL migrations located in `supabase/migrations/`.

