-- ============================================================================
-- Lumen Social Media Dashboard — Row-Level Security (RLS) Policies
-- Enforces Close Friends inner-circle visibility, follower privacy,
-- mutual-only comment policies, and participant-scoped direct messages.
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper: Check if viewer is an accepted follower of author
CREATE OR REPLACE FUNCTION public.is_accepted_follower(viewer UUID, author UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.relationships r
    WHERE r.follower_id = viewer
      AND r.following_id = author
      AND r.status = 'accepted'
  );
$$;

-- Helper: Check if viewer belongs to author's Close Friends inner circle
CREATE OR REPLACE FUNCTION public.is_close_friend(viewer UUID, author UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.relationships r
    WHERE r.follower_id = viewer
      AND r.following_id = author
      AND r.status = 'accepted'
      AND r.is_close_friend = true
  );
$$;

-- Helper: Check mutual friendship (both users follow each other with accepted status)
CREATE OR REPLACE FUNCTION public.is_mutual_friend(user_a UUID, user_b UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.is_accepted_follower(user_a, user_b)
     AND public.is_accepted_follower(user_b, user_a);
$$;

-- PROFILES: Readable by all authenticated viewers; editable only by owner
CREATE POLICY profiles_select ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- POSTS: Enforce public / followers / close_friends audience checks
CREATE POLICY posts_select_visibility ON public.posts
  FOR SELECT USING (
    author_id = auth.uid()
    OR co_author_id = auth.uid()
    OR (
      audience = 'public'
      AND NOT EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = author_id AND p.is_private = true
      )
    )
    OR (
      audience IN ('public', 'followers')
      AND public.is_accepted_follower(auth.uid(), author_id)
    )
    OR (
      audience = 'close_friends'
      AND public.is_close_friend(auth.uid(), author_id)
    )
  );

CREATE POLICY posts_insert_own ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY posts_update_own ON public.posts
  FOR UPDATE USING (auth.uid() = author_id OR auth.uid() = co_author_id);

-- COMMENTS: Enforce post visibility + mutual-only reply policy
CREATE POLICY comments_insert_policy ON public.comments
  FOR INSERT WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_id
        AND (
          p.reply_policy = 'everyone'
          OR p.author_id = auth.uid()
          OR p.co_author_id = auth.uid()
          OR public.is_mutual_friend(auth.uid(), p.author_id)
        )
    )
  );

-- STORIES: Enforce 24h TTL (or Highlight) AND close_friends graph check
CREATE POLICY stories_select_visibility ON public.stories
  FOR SELECT USING (
    author_id = auth.uid()
    OR (
      (expires_at > now() OR is_highlighted = true)
      AND is_archived = false
      AND (
        (audience = 'public' AND (
          NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = author_id AND p.is_private = true)
          OR public.is_accepted_follower(auth.uid(), author_id)
        ))
        OR (audience = 'close_friends' AND public.is_close_friend(auth.uid(), author_id))
      )
    )
  );

CREATE POLICY stories_insert_own ON public.stories
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- STORY VIEWS: Viewer can log views; author & viewer can read view records
CREATE POLICY story_views_select ON public.story_views
  FOR SELECT USING (
    viewer_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.author_id = auth.uid())
  );

CREATE POLICY story_views_upsert ON public.story_views
  FOR INSERT WITH CHECK (viewer_id = auth.uid());

-- DIRECT MESSAGING: Strictly scoped to conversation participants
CREATE POLICY conversations_select_participant ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY messages_select_participant ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY messages_insert_participant ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()
    )
  );

-- SAVED COLLECTIONS: Public collections visible to all; private collections owner-only
CREATE POLICY collections_select ON public.saved_collections
  FOR SELECT USING (is_public = true OR owner_id = auth.uid());

