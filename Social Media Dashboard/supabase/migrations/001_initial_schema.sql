-- ============================================================================
-- Lumen Social Media Dashboard — Initial PostgreSQL / Supabase Schema
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  pronouns TEXT DEFAULT '',
  website TEXT DEFAULT '',
  location TEXT DEFAULT '',
  status_emoji TEXT NOT NULL DEFAULT '✨',
  status_text TEXT NOT NULL DEFAULT '',
  avatar_url TEXT NOT NULL,
  banner_url TEXT NOT NULL DEFAULT '',
  is_private BOOLEAN NOT NULL DEFAULT false,
  read_receipts_enabled BOOLEAN NOT NULL DEFAULT true,
  followers_count INT NOT NULL DEFAULT 0,
  following_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. RELATIONSHIPS (Follow graph + Inner-Circle Close Friends)
CREATE TABLE IF NOT EXISTS public.relationships (
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('accepted', 'pending')) DEFAULT 'accepted',
  is_close_friend BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS idx_relationships_following
  ON public.relationships (following_id, status, is_close_friend);

-- 3. POSTS (Supports carousels, voice notes, polls, co-authorship & safety controls)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  co_author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  caption TEXT NOT NULL DEFAULT '',
  media_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  quote_card JSONB,
  voice_note JSONB,
  poll JSONB,
  tags TEXT[] NOT NULL DEFAULT '{}',
  location TEXT DEFAULT '',
  audio_title TEXT DEFAULT '',
  audience TEXT NOT NULL CHECK (audience IN ('public', 'followers', 'close_friends')) DEFAULT 'public',
  reply_policy TEXT NOT NULL CHECK (reply_policy IN ('everyone', 'mutuals')) DEFAULT 'everyone',
  hide_like_count BOOLEAN NOT NULL DEFAULT false,
  likes_count INT NOT NULL DEFAULT 0,
  comments_count INT NOT NULL DEFAULT 0,
  reposts_count INT NOT NULL DEFAULT 0,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_feed_cursor
  ON public.posts (created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author
  ON public.posts (author_id, is_pinned, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_co_author
  ON public.posts (co_author_id) WHERE co_author_id IS NOT NULL;

-- 4. POST LIKES & SAVED COLLECTIONS
CREATE TABLE IF NOT EXISTS public.post_likes (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.saved_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.post_bookmarks (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES public.saved_collections(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

-- 5. COMMENTS (Supports pinning up to 3 top comments)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  likes_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_post
  ON public.comments (post_id, is_pinned DESC, created_at ASC);

-- 6. EPHEMERAL STORIES (24h TTL + Highlights Archive)
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')) DEFAULT 'image',
  duration_ms INT NOT NULL DEFAULT 5000,
  audience TEXT NOT NULL CHECK (audience IN ('public', 'close_friends')) DEFAULT 'public',
  caption TEXT DEFAULT '',
  music_track JSONB,
  interactive_widget JSONB,
  highlight_title TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  is_highlighted BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stories_active
  ON public.stories (author_id, expires_at DESC)
  WHERE is_archived = false;

-- 7. STORY VIEWS & INTERACTIONS
CREATE TABLE IF NOT EXISTS public.story_views (
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction_emoji TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (story_id, viewer_id)
);

-- 8. DIRECT MESSAGING (Conversations & Persistent Messages)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_accent TEXT NOT NULL DEFAULT 'cobalt',
  is_request BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_muted BOOLEAN NOT NULL DEFAULT false,
  last_read_at TIMESTAMPTZ,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_msg_id UUID UNIQUE NOT NULL,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  media_url TEXT,
  media_type TEXT,
  voice_duration_ms INT,
  voice_waveform JSONB,
  reply_to_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  reply_to_story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
  story_snapshot JSONB,
  shared_post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  reactions JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_cursor
  ON public.messages (conversation_id, created_at DESC, id DESC);

-- 9. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'follow_request', 'story_reaction', 'co_author', 'mention')),
  entity_id UUID,
  preview_text TEXT DEFAULT '',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. AUTOMATED TTL STORY ARCHIVER FUNCTION
CREATE OR REPLACE FUNCTION public.archive_expired_stories()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  UPDATE public.stories
  SET is_archived = true
  WHERE expires_at <= now()
    AND is_archived = false;

  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$;

