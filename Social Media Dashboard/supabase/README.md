# Database & Cloud Architecture (Supabase / PostgreSQL + S3)

This project runs locally out of the box with **Fastify + WebSockets + Node `node:sqlite`** (`server/`), mirroring the exact relational data model and visibility rules defined for production **Supabase / PostgreSQL + S3**:

- `migrations/001_initial_schema.sql`: Defines all core tables (`profiles`, `relationships`, `posts`, `post_likes`, `saved_collections`, `post_bookmarks`, `comments`, `stories`, `story_views`, `conversations`, `conversation_participants`, `messages`, `notifications`), cursor pagination indexes, and the `archive_expired_stories()` TTL archival function.
- `migrations/002_rls_policies.sql`: Implements Row-Level Security (RLS) enforcing `close_friends` inner-circle visibility via `relationships.is_close_friend`, `mutuals`-only comment policies, 24h TTL / Highlight access rules, and participant-scoped DM security.

## Deploying to Supabase + S3

1. Apply both SQL files in order via the Supabase CLI (`supabase db push`) or SQL Editor.
2. Schedule `SELECT public.archive_expired_stories();` every 15 minutes using `pg_cron`.
3. Configure `S3_BUCKET` / `S3_REGION` / `S3_ENDPOINT` environment variables in `server/storage.ts` to switch from local disk storage (`uploads/`) to presigned S3 / Cloudflare R2 / Supabase Storage URLs.

