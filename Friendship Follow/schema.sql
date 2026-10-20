-- ============================================================================
-- NEXUS RELATIONSHIP GRAPH: ASYMMETRICAL TO SYMMETRICAL FOLLOW & MUTUAL ENGINE
-- PostgreSQL / Supabase Schema & Real-Time Event Trigger Architecture
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean slate for migrations / updates
DROP TRIGGER IF EXISTS trg_relationship_mutual_check ON relationships;
DROP TRIGGER IF EXISTS trg_relationship_sever_check ON relationships;
DROP TRIGGER IF EXISTS trg_request_auto_mutual ON relationship_requests;
DROP FUNCTION IF EXISTS handle_relationship_insert() CASCADE;
DROP FUNCTION IF EXISTS handle_relationship_delete() CASCADE;
DROP FUNCTION IF EXISTS handle_request_auto_mutual() CASCADE;
DROP FUNCTION IF EXISTS refresh_friendships_materialized() CASCADE;
DROP MATERIALIZED VIEW IF EXISTS friendships_materialized CASCADE;
DROP VIEW IF EXISTS friendships CASCADE;
DROP TABLE IF EXISTS direct_messages CASCADE;
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
    -- Intimate / Mutual-only contact information (Secured via RLS)
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
-- Represents: follower_id -> following_id (Directional subscription: A follows B)
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
CREATE INDEX idx_requests_requester ON relationship_requests(requester_id);

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
-- Real-time computed view joining relationships r1 and r2
CREATE OR REPLACE VIEW friendships AS
SELECT 
    r1.follower_id AS user_a_id,
    r1.following_id AS user_b_id,
    GREATEST(r1.created_at, r2.created_at) AS mutual_since
FROM relationships r1
INNER JOIN relationships r2
    ON r1.follower_id = r2.following_id 
   AND r1.following_id = r2.follower_id;

-- Materialized View for sub-millisecond lookups at high concurrency
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

-- Unique composite index allows REFRESH MATERIALIZED VIEW CONCURRENTLY
CREATE UNIQUE INDEX idx_friendships_mat_pair 
    ON friendships_materialized(user_low_id, user_high_id);
CREATE INDEX idx_friendships_mat_low ON friendships_materialized(user_low_id);
CREATE INDEX idx_friendships_mat_high ON friendships_materialized(user_high_id);

-- Function to refresh materialized view concurrently
CREATE OR REPLACE FUNCTION refresh_friendships_materialized()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY friendships_materialized;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 6. TIERED SOCIAL POSTS TABLE (Audience Gated Visibility)
-- ----------------------------------------------------------------------------
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url TEXT,
    audience TEXT NOT NULL DEFAULT 'public' CHECK (audience IN ('public', 'followers', 'mutuals')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_audience ON posts(audience);

-- ----------------------------------------------------------------------------
-- 7. DIRECT MESSAGES TABLE (Mutual-Friends Only Communication)
-- ----------------------------------------------------------------------------
CREATE TABLE direct_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_read BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_dm_pair ON direct_messages(sender_id, receiver_id);

-- ----------------------------------------------------------------------------
-- 8. DATABASE TRIGGERS & REAL-TIME EVENT EMISSION
-- ----------------------------------------------------------------------------

-- Trigger 8A: Mutual Friendship Detection on Relationship Insert
CREATE OR REPLACE FUNCTION handle_relationship_insert()
RETURNS TRIGGER AS $$
DECLARE
    inverse_exists BOOLEAN;
    mutual_timestamp TIMESTAMPTZ;
BEGIN
    -- Check if inverse edge exists: following_id already follows follower_id
    SELECT EXISTS (
        SELECT 1 FROM relationships
        WHERE follower_id = NEW.following_id
          AND following_id = NEW.follower_id
    ) INTO inverse_exists;

    IF inverse_exists THEN
        mutual_timestamp := now();

        -- 1. Broadcast real-time WebSocket event via PostgreSQL NOTIFY / Supabase Realtime
        PERFORM pg_notify(
            'relationship_events',
            json_build_object(
                'event', 'relationship.mutual_unlocked',
                'user_a_id', NEW.follower_id,
                'user_b_id', NEW.following_id,
                'mutual_since', mutual_timestamp
            )::text
        );

        -- 2. Clear any pending requests between the two
        DELETE FROM relationship_requests
        WHERE (requester_id = NEW.follower_id AND target_id = NEW.following_id)
           OR (requester_id = NEW.following_id AND target_id = NEW.follower_id);
    ELSE
        -- Directional follow event
        PERFORM pg_notify(
            'relationship_events',
            json_build_object(
                'event', 'relationship.follow_created',
                'follower_id', NEW.follower_id,
                'following_id', NEW.following_id,
                'created_at', NEW.created_at
            )::text
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_relationship_mutual_check
    AFTER INSERT ON relationships
    FOR EACH ROW
    EXECUTE FUNCTION handle_relationship_insert();

-- Trigger 8B: Relationship Severed (Drop from Mutual to Follow or Clean Slate)
CREATE OR REPLACE FUNCTION handle_relationship_delete()
RETURNS TRIGGER AS $$
DECLARE
    was_mutual BOOLEAN;
BEGIN
    -- Check if other directional edge still remains
    SELECT EXISTS (
        SELECT 1 FROM relationships
        WHERE follower_id = OLD.following_id
          AND following_id = OLD.follower_id
    ) INTO was_mutual;

    IF was_mutual THEN
        -- Was a mutual friendship; now downgraded to one-way follow
        PERFORM pg_notify(
            'relationship_events',
            json_build_object(
                'event', 'relationship.mutual_severed',
                'severed_by', OLD.follower_id,
                'remaining_follower', OLD.following_id
            )::text
        );
    ELSE
        -- Clean disconnect
        PERFORM pg_notify(
            'relationship_events',
            json_build_object(
                'event', 'relationship.unfollowed',
                'unfollower_id', OLD.follower_id,
                'target_id', OLD.following_id
            )::text
        );
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_relationship_sever_check
    AFTER DELETE ON relationships
    FOR EACH ROW
    EXECUTE FUNCTION handle_relationship_delete();

-- Trigger 8C: Automatic Mutual Unlock on Private Account Request
-- If User A sends a follow request to private User B, but User B is ALREADY following User A:
-- Automatically approve and promote directly to Mutual Friendship!
CREATE OR REPLACE FUNCTION handle_request_auto_mutual()
RETURNS TRIGGER AS $$
DECLARE
    target_already_follows BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM relationships
        WHERE follower_id = NEW.target_id
          AND following_id = NEW.requester_id
    ) INTO target_already_follows;

    IF target_already_follows THEN
        -- Insert reciprocal edge directly into relationships table
        INSERT INTO relationships (follower_id, following_id, created_at)
        VALUES (NEW.requester_id, NEW.target_id, now())
        ON CONFLICT DO NOTHING;

        -- Mark request as approved
        NEW.status := 'approved';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_request_auto_mutual
    BEFORE INSERT ON relationship_requests
    FOR EACH ROW
    EXECUTE FUNCTION handle_request_auto_mutual();

-- ----------------------------------------------------------------------------
-- 9. ROW-LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

-- 9A. Users Policies
-- Public info is readable by anyone
CREATE POLICY "Public profile data is viewable by all users"
    ON users FOR SELECT
    USING (true);

-- 9B. Posts Policies (Tiered Audience Gating)
-- 1. Public posts: visible to anyone
CREATE POLICY "Public posts are viewable by everyone"
    ON posts FOR SELECT
    USING (audience = 'public');

-- 2. Followers-only posts: visible if current user is author OR follows author
CREATE POLICY "Followers-only posts are viewable by followers and author"
    ON posts FOR SELECT
    USING (
        author_id = auth.uid() OR
        (
            audience = 'followers' AND
            EXISTS (
                SELECT 1 FROM relationships
                WHERE follower_id = auth.uid()
                  AND following_id = posts.author_id
            )
        )
    );

-- 3. Mutual-only posts: visible ONLY if current user is author OR mutual friend
CREATE POLICY "Mutual-only posts are viewable strictly by mutual friends"
    ON posts FOR SELECT
    USING (
        author_id = auth.uid() OR
        (
            audience = 'mutuals' AND
            EXISTS (
                SELECT 1 FROM friendships
                WHERE user_a_id = auth.uid()
                  AND user_b_id = posts.author_id
            )
        )
    );

-- Author can insert/update/delete their own posts
CREATE POLICY "Authors can manage their own posts"
    ON posts FOR ALL
    USING (author_id = auth.uid())
    WITH CHECK (author_id = auth.uid());

-- 9C. Direct Messages Policies (Restricted to Mutual Friends)
CREATE POLICY "Mutual friends can read direct messages"
    ON direct_messages FOR SELECT
    USING (
        (sender_id = auth.uid() OR receiver_id = auth.uid()) AND
        EXISTS (
            SELECT 1 FROM friendships
            WHERE (user_a_id = sender_id AND user_b_id = receiver_id)
               OR (user_a_id = receiver_id AND user_b_id = sender_id)
        )
    );

CREATE POLICY "Mutual friends can send direct messages"
    ON direct_messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM friendships
            WHERE (user_a_id = sender_id AND user_b_id = receiver_id)
        )
    );

-- ----------------------------------------------------------------------------
-- 10. GRAPH HELPER FUNCTIONS (Contextual Radar & Density Recommendations)
-- ----------------------------------------------------------------------------

-- Contextual Overlap Radar: Get shared mutual friends between two users
CREATE OR REPLACE FUNCTION get_contextual_overlap(viewer_id UUID, target_id UUID)
RETURNS TABLE (
    mutual_user_id UUID,
    username TEXT,
    display_name TEXT,
    avatar_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.username,
        u.display_name,
        u.avatar_url
    FROM relationships r_viewer
    INNER JOIN relationships r_target
        ON r_viewer.following_id = r_target.following_id
    INNER JOIN users u
        ON u.id = r_viewer.following_id
    WHERE r_viewer.follower_id = viewer_id
      AND r_target.follower_id = target_id
      AND u.id NOT IN (viewer_id, target_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Smart Suggestions Based on Graph Triangle Completions
CREATE OR REPLACE FUNCTION get_triangle_completion_suggestions(current_user_id UUID, limit_count INT DEFAULT 10)
RETURNS TABLE (
    suggested_user_id UUID,
    username TEXT,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    shared_mutual_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH my_mutuals AS (
        -- Accounts that current_user has mutual friendship with
        SELECT user_b_id AS mutual_id
        FROM friendships
        WHERE user_a_id = current_user_id
    ),
    candidate_triangles AS (
        -- Users who follow my mutuals OR are followed by my mutuals
        SELECT 
            r.following_id AS candidate_id,
            COUNT(DISTINCT r.follower_id) AS shared_connections
        FROM relationships r
        INNER JOIN my_mutuals m ON r.follower_id = m.mutual_id
        WHERE r.following_id <> current_user_id
          -- Exclude users current_user is already following
          AND r.following_id NOT IN (
              SELECT following_id FROM relationships WHERE follower_id = current_user_id
          )
        GROUP BY r.following_id
    )
    SELECT 
        u.id,
        u.username,
        u.display_name,
        u.avatar_url,
        u.bio,
        c.shared_connections
    FROM candidate_triangles c
    INNER JOIN users u ON u.id = c.candidate_id
    ORDER BY c.shared_connections DESC, u.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
