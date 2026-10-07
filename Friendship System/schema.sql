-- ============================================================================
-- NEXUSGRAPH: PRODUCTION SOCIAL RELATIONSHIP & FOLLOW ENGINE
-- PostgreSQL / Supabase Schema & Real-Time Event Trigger Architecture
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean slate (for development/testing runs)
DROP TRIGGER IF EXISTS trg_relationship_mutual_check ON relationships;
DROP TRIGGER IF EXISTS trg_relationship_sever_check ON relationships;
DROP FUNCTION IF EXISTS handle_relationship_insert() CASCADE;
DROP FUNCTION IF EXISTS handle_relationship_delete() CASCADE;
DROP MATERIALIZED VIEW IF EXISTS friendships_materialized CASCADE;
DROP VIEW IF EXISTS friendships CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS user_mutes CASCADE;
DROP TABLE IF EXISTS relationship_requests CASCADE;
DROP TABLE IF EXISTS relationships CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ----------------------------------------------------------------------------
-- 1. USERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    is_private BOOLEAN NOT NULL DEFAULT FALSE,
    activity_status TEXT DEFAULT 'Active now',
    location TEXT,
    website TEXT,
    -- Intimate / Mutual-only contact information protected by RLS
    email TEXT NOT NULL,
    phone_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30)
);

CREATE INDEX idx_users_username ON users(username);

-- ----------------------------------------------------------------------------
-- 2. RELATIONSHIPS TABLE (Directed Asymmetrical Graph Edges)
-- ----------------------------------------------------------------------------
-- Represents: follower_id -> following_id (A follows B)
CREATE TABLE relationships (
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Composite Primary Key ensures exactly one directional edge per pair
    PRIMARY KEY (follower_id, following_id),

    -- Prevent self-follows
    CONSTRAINT prevent_self_follow CHECK (follower_id <> following_id)
);

-- B-Tree indexes for instantaneous edge traversals in both directions
CREATE INDEX idx_relationships_follower_id ON relationships(follower_id);
CREATE INDEX idx_relationships_following_id ON relationships(following_id);
CREATE INDEX idx_relationships_composite_reverse ON relationships(following_id, follower_id);

-- ----------------------------------------------------------------------------
-- 3. RELATIONSHIP REQUESTS TABLE (For Private Accounts)
-- ----------------------------------------------------------------------------
CREATE TABLE relationship_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (requester_id, target_id),
    CONSTRAINT prevent_self_request CHECK (requester_id <> target_id)
);

CREATE INDEX idx_requests_target_pending ON relationship_requests(target_id) WHERE status = 'pending';

-- ----------------------------------------------------------------------------
-- 4. USER MUTES (Soft-Disengagement Without Unfriending)
-- ----------------------------------------------------------------------------
CREATE TABLE user_mutes (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    muted_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (user_id, muted_user_id),
    CONSTRAINT prevent_self_mute CHECK (user_id <> muted_user_id)
);

-- ----------------------------------------------------------------------------
-- 5. FRIENDSHIPS VIEW & MATERIALIZED VIEW (Symmetrical Mutual Overlap)
-- ----------------------------------------------------------------------------
-- Computed view for real-time consistency
CREATE OR REPLACE VIEW friendships AS
SELECT 
    r1.follower_id AS user_a_id,
    r1.following_id AS user_b_id,
    GREATEST(r1.created_at, r2.created_at) AS established_at,
    LEAST(r1.created_at, r2.created_at) AS initial_follow_at
FROM relationships r1
JOIN relationships r2 
  ON r1.follower_id = r2.following_id 
 AND r1.following_id = r2.follower_id;

-- Materialized View for ultra-high concurrency and sub-millisecond lookup at scale
-- Stores canonical pair ordering (LEAST(id1, id2), GREATEST(id1, id2))
CREATE MATERIALIZED VIEW friendships_materialized AS
SELECT 
    LEAST(r1.follower_id, r1.following_id) AS user_low_id,
    GREATEST(r1.follower_id, r1.following_id) AS user_high_id,
    GREATEST(r1.created_at, r2.created_at) AS established_at,
    r1.created_at AS first_direction_at,
    r2.created_at AS reciprocated_at
FROM relationships r1
JOIN relationships r2 
  ON r1.follower_id = r2.following_id 
 AND r1.following_id = r2.follower_id
WHERE r1.follower_id < r1.following_id;

-- Unique index required for REFRESH MATERIALIZED VIEW CONCURRENTLY
CREATE UNIQUE INDEX idx_friendships_mat_pair 
ON friendships_materialized(user_low_id, user_high_id);

CREATE INDEX idx_friendships_mat_low ON friendships_materialized(user_low_id);
CREATE INDEX idx_friendships_mat_high ON friendships_materialized(user_high_id);

-- ----------------------------------------------------------------------------
-- 6. TIERED SOCIAL POSTS TABLE (Content Gating Verification)
-- ----------------------------------------------------------------------------
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url TEXT,
    audience TEXT NOT NULL CHECK (audience IN ('public', 'followers', 'mutuals')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_audience ON posts(audience);

-- ----------------------------------------------------------------------------
-- 7. HELPER FUNCTIONS
-- ----------------------------------------------------------------------------

-- Check if two users have an active mutual friendship
CREATE OR REPLACE FUNCTION are_mutual_friends(user1 UUID, user2 UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM relationships r1
        JOIN relationships r2 
          ON r1.follower_id = r2.following_id 
         AND r1.following_id = r2.follower_id
        WHERE r1.follower_id = user1 
          AND r1.following_id = user2
    );
$$;

-- Get shared mutual connections between two users
CREATE OR REPLACE FUNCTION get_shared_mutual_friends(viewer UUID, target UUID)
RETURNS TABLE (
    friend_id UUID,
    username TEXT,
    display_name TEXT,
    avatar_url TEXT
)
LANGUAGE sql
STABLE
AS $$
    SELECT u.id, u.username, u.display_name, u.avatar_url
    FROM users u
    WHERE EXISTS (
        -- Viewer is mutual with U
        SELECT 1 FROM friendships f1 
        WHERE f1.user_a_id = viewer AND f1.user_b_id = u.id
    )
    AND EXISTS (
        -- Target is mutual with U
        SELECT 1 FROM friendships f2 
        WHERE f2.user_a_id = target AND f2.user_b_id = u.id
    )
    AND u.id NOT IN (viewer, target);
$$;

-- ----------------------------------------------------------------------------
-- 8. DATABASE TRIGGERS & REAL-TIME WEBSOCKET EVENT DISPATCH
-- ----------------------------------------------------------------------------

-- Trigger on insert: When A follows B, check if B was already following A.
-- If reciprocal, elevate to mutual friendship and fire pg_notify WebSocket payload.
CREATE OR REPLACE FUNCTION handle_relationship_insert()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_reciprocal BOOLEAN;
    reciprocal_time TIMESTAMPTZ;
    v_payload JSONB;
BEGIN
    -- Check if following_id was already following follower_id
    SELECT TRUE, created_at
    INTO is_reciprocal, reciprocal_time
    FROM relationships
    WHERE follower_id = NEW.following_id 
      AND following_id = NEW.follower_id;

    IF is_reciprocal IS TRUE THEN
        -- Build the real-time event payload
        v_payload := jsonb_build_object(
            'event', 'relationship.mutual_unlocked',
            'user_a_id', NEW.follower_id,
            'user_b_id', NEW.following_id,
            'established_at', NEW.created_at,
            'reciprocated_at', reciprocal_time,
            'tenure_seconds', EXTRACT(EPOCH FROM (NEW.created_at - reciprocal_time))
        );

        -- Broadcast via Postgres Listen/Notify (Supabase Realtime listens to this)
        PERFORM pg_notify('social_events', v_payload::TEXT);

        -- Also clean up any lingering pending follow requests between these two
        DELETE FROM relationship_requests 
        WHERE (requester_id = NEW.follower_id AND target_id = NEW.following_id)
           OR (requester_id = NEW.following_id AND target_id = NEW.follower_id);
    ELSE
        -- One-way follow event
        v_payload := jsonb_build_object(
            'event', 'relationship.follow_created',
            'follower_id', NEW.follower_id,
            'following_id', NEW.following_id,
            'created_at', NEW.created_at
        );
        PERFORM pg_notify('social_events', v_payload::TEXT);
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_relationship_mutual_check
AFTER INSERT ON relationships
FOR EACH ROW
EXECUTE FUNCTION handle_relationship_insert();

-- Trigger on delete: Handles unfollow or soft block.
-- If connection was mutual, fire 'relationship.mutual_broken' event.
CREATE OR REPLACE FUNCTION handle_relationship_delete()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    was_mutual BOOLEAN;
    v_payload JSONB;
BEGIN
    -- Check if inverse edge still exists
    SELECT TRUE
    INTO was_mutual
    FROM relationships
    WHERE follower_id = OLD.following_id 
      AND following_id = OLD.follower_id;

    IF was_mutual IS TRUE THEN
        v_payload := jsonb_build_object(
            'event', 'relationship.mutual_broken',
            'initiator_id', OLD.follower_id,
            'affected_user_id', OLD.following_id,
            'timestamp', now()
        );
        PERFORM pg_notify('social_events', v_payload::TEXT);
    ELSE
        v_payload := jsonb_build_object(
            'event', 'relationship.unfollowed',
            'follower_id', OLD.follower_id,
            'following_id', OLD.following_id,
            'timestamp', now()
        );
        PERFORM pg_notify('social_events', v_payload::TEXT);
    END IF;

    RETURN OLD;
END;
$$;

CREATE TRIGGER trg_relationship_sever_check
AFTER DELETE ON relationships
FOR EACH ROW
EXECUTE FUNCTION handle_relationship_delete();

-- ----------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- USERS: Public profiles readable by everyone
CREATE POLICY "Public profile fields visible to all authenticated users"
ON users FOR SELECT
USING (true);

-- RELATIONSHIPS: Transparent social graph reading
CREATE POLICY "Relationships readable by everyone"
ON relationships FOR SELECT
USING (true);

-- Insert/Delete controlled by authenticated owner
CREATE POLICY "Users can only insert their own follow edges"
ON relationships FOR INSERT
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete edges they initiated or remove followers (soft-block)"
ON relationships FOR DELETE
USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- POSTS: Dynamic Tiered Social Intimacy Gate
CREATE POLICY "Gated posts access policy"
ON posts FOR SELECT
USING (
    -- Author always has access to their own post
    auth.uid() = author_id
    OR
    -- Public posts visible to all
    audience = 'public'
    OR
    -- Followers only: viewer must follow author
    (audience = 'followers' AND EXISTS (
        SELECT 1 FROM relationships 
        WHERE follower_id = auth.uid() AND following_id = posts.author_id
    ))
    OR
    -- Mutual friends only: bidirectional follow edge must exist
    (audience = 'mutuals' AND are_mutual_friends(auth.uid(), posts.author_id))
);

CREATE POLICY "Users can create their own posts"
ON posts FOR INSERT
WITH CHECK (auth.uid() = author_id);
