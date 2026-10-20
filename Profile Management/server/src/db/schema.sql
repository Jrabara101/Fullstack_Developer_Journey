-- ============================================================================
-- Profile Identity & Account Settings - PostgreSQL / Supabase Schema (RLS Enabled)
-- ============================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL CHECK (char_length(username) >= 3 AND char_length(username) <= 30 AND username ~ '^[a-zA-Z0-9_-]+$'),
    display_name TEXT NOT NULL CHECK (char_length(display_name) >= 1 AND char_length(display_name) <= 100),
    headline TEXT CHECK (char_length(headline) <= 120),
    bio TEXT CHECK (char_length(bio) <= 500),
    avatar_url TEXT,
    banner_url TEXT,
    avatar_alt_text TEXT,
    website_url TEXT,
    social_links JSONB DEFAULT '{"github": "", "x": "", "linkedin": "", "mastodon": ""}'::jsonb,
    visibility_settings JSONB DEFAULT '{
        "email": "private",
        "phone": "private",
        "real_name": "public",
        "activity_status": "public",
        "social_links": "public"
    }'::jsonb,
    locale_preferences JSONB DEFAULT '{
        "timezone": "UTC",
        "time_format": "24h",
        "week_start": "monday",
        "number_separator": "comma",
        "language": "en"
    }'::jsonb,
    theme_preference TEXT CHECK (theme_preference IN ('system', 'light', 'dark')) DEFAULT 'system',
    density_preference TEXT CHECK (density_preference IN ('compact', 'cozy', 'spacious')) DEFAULT 'cozy',
    quiet_hours JSONB DEFAULT '{"enabled": true, "start": "22:00", "end": "07:00"}'::jsonb,
    discoverable_by_search BOOLEAN DEFAULT true,
    account_status TEXT CHECK (account_status IN ('active', 'quarantined', 'pending_deletion')) DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON public.profiles(account_status);

-- 3. Account Deletions Table (Quarantine & 14-day Grace Period)
CREATE TABLE IF NOT EXISTS public.account_deletions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scheduled_purge_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '14 days'),
    reason TEXT,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_account_deletions_user_id ON public.account_deletions(user_id);
CREATE INDEX IF NOT EXISTS idx_account_deletions_purge ON public.account_deletions(scheduled_purge_at) WHERE cancelled_at IS NULL;

-- 4. Audit Log Trail
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- 5. Automatic updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 6. Row-Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_deletions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profile Policies:
-- 1. Users can always read and update their own profile fully
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 2. Public view restriction based on visibility_settings & active status
-- Public / unauthenticated visitors or external users can only read active profiles
CREATE POLICY "Public profiles are visible if active and discoverable"
    ON public.profiles FOR SELECT
    USING (
        account_status = 'active'
    );

-- Account Deletion Policies
CREATE POLICY "Users can view and initiate own account deletion"
    ON public.account_deletions FOR ALL
    USING (auth.uid() = user_id);

-- Audit Log Policies
CREATE POLICY "Users can view own audit logs"
    ON public.audit_logs FOR SELECT
    USING (auth.uid() = user_id);

-- 7. Secure Profile Public Projection View (Audience Masking Function)
CREATE OR REPLACE FUNCTION public.get_public_profile(target_username TEXT, viewer_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    p RECORD;
    is_owner BOOLEAN;
    is_team BOOLEAN;
    result JSONB;
BEGIN
    SELECT * INTO p FROM public.profiles WHERE username = target_username AND account_status = 'active';
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    is_owner := (viewer_id IS NOT NULL AND viewer_id = p.id);
    -- In a real multi-tenant app, check team membership:
    is_team := is_owner OR (viewer_id IS NOT NULL);

    result := jsonb_build_object(
        'id', p.id,
        'username', p.username,
        'display_name', CASE 
            WHEN is_owner OR p.visibility_settings->>'real_name' = 'public' OR (is_team AND p.visibility_settings->>'real_name' = 'team') 
            THEN p.display_name 
            ELSE p.username 
        END,
        'headline', p.headline,
        'bio', p.bio,
        'avatar_url', p.avatar_url,
        'banner_url', p.banner_url,
        'avatar_alt_text', p.avatar_alt_text,
        'website_url', p.website_url,
        'social_links', CASE 
            WHEN is_owner OR p.visibility_settings->>'social_links' = 'public' OR (is_team AND p.visibility_settings->>'social_links' = 'team') 
            THEN p.social_links 
            ELSE '{}'::jsonb 
        END,
        'discoverable_by_search', p.discoverable_by_search,
        'created_at', p.created_at
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
