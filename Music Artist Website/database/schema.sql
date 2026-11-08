-- ============================================================================
-- ARTIST-OS DATABASE SCHEMA (PostgreSQL / Supabase Compatible)
-- Concurrency-Safe, Strict Integer-Cents E-Commerce & Interactive Audio Ledger
-- ============================================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. ALBUMS & CATALOG VAULT
-- ----------------------------------------------------------------------------
CREATE TYPE release_type_enum AS ENUM ('lp', 'ep', 'single', 'live_archive');

CREATE TABLE albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    catalog_number TEXT NOT NULL, -- e.g. 'CAT-026LP'
    release_type release_type_enum NOT NULL DEFAULT 'lp',
    release_date DATE NOT NULL,
    cover_art_url TEXT NOT NULL,
    vinyl_disc_art_url TEXT,
    era_theme_json JSONB NOT NULL DEFAULT '{"bg": "#07080A", "accent": "#FF3366", "secondary": "#00F0FF"}'::jsonb,
    streaming_links_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    liner_notes_md TEXT,
    is_preorder BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for slug queries and release sorting
CREATE INDEX idx_albums_slug ON albums(slug);
CREATE INDEX idx_albums_release_date ON albums(release_date DESC);

-- ----------------------------------------------------------------------------
-- 2. TRACKS & MULTI-TRACK STEM REGISTRY
-- ----------------------------------------------------------------------------
CREATE TABLE tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
    track_number INT NOT NULL,
    title TEXT NOT NULL,
    duration_seconds INT NOT NULL CHECK (duration_seconds > 0),
    bpm INT CHECK (bpm > 0),
    musical_key TEXT,
    stream_url_mp3 TEXT NOT NULL,
    lossless_s3_key TEXT,
    stems_json JSONB NOT NULL DEFAULT '{"vocals": "", "synths": "", "drums": "", "bass": ""}'::jsonb,
    synced_lyrics_lrc JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of { time_ms: number, text: string }
    waveform_peaks REAL[] NOT NULL DEFAULT '{}',
    credits_json JSONB NOT NULL DEFAULT '{}'::jsonb, -- personnel, studio gear, mixing engineers
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(album_id, track_number)
);

CREATE INDEX idx_tracks_album_id ON tracks(album_id);

-- ----------------------------------------------------------------------------
-- 3. GEO-TARGETED TOUR DATES & CROWD-DEMAND HEATMAP
-- ----------------------------------------------------------------------------
CREATE TYPE ticket_status_enum AS ENUM (
    'presale',
    'on_sale',
    'low_tickets',
    'sold_out',
    'cancelled',
    'past_completed'
);

CREATE TABLE tour_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_leg_name TEXT NOT NULL,
    show_date TIMESTAMPTZ NOT NULL,
    doors_time TEXT NOT NULL, -- e.g. '20:00'
    city TEXT NOT NULL,
    country_code CHAR(2) NOT NULL, -- ISO-3166-1 alpha-2, e.g. 'US', 'JP', 'DE'
    venue_name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    ticket_status ticket_status_enum NOT NULL DEFAULT 'on_sale',
    remaining_tickets_estimate INT,
    ticket_url TEXT NOT NULL,
    vip_upgrade_url TEXT,
    support_acts TEXT[] NOT NULL DEFAULT '{}',
    setlist_tracks_json JSONB NOT NULL DEFAULT '[]'::jsonb, -- populated post-show with setlist & bootleg audio
    poster_art_url TEXT,
    venue_pickup_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tour_dates_show_date ON tour_dates(show_date);
CREATE INDEX idx_tour_dates_status ON tour_dates(ticket_status);
CREATE INDEX idx_tour_dates_geo ON tour_dates(latitude, longitude);

CREATE TABLE city_demand_pledges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fan_email TEXT NOT NULL,
    fan_phone TEXT,
    city_name TEXT NOT NULL,
    country_code CHAR(2) NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    favorite_streaming_platform TEXT DEFAULT 'spotify',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(fan_email, city_name)
);

CREATE INDEX idx_city_demand_city ON city_demand_pledges(city_name, country_code);

-- ----------------------------------------------------------------------------
-- 4. DIRECT-TO-FAN VINYL PRESSING MATRIX & MERCH ATELIER
-- ----------------------------------------------------------------------------
CREATE TYPE merch_category_enum AS ENUM (
    'vinyl',
    'cassette',
    'apparel',
    'poster_zine',
    'digital',
    'bundle'
);

CREATE TABLE merch_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID REFERENCES albums(id) ON DELETE SET NULL, -- optional link to specific era
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category merch_category_enum NOT NULL DEFAULT 'vinyl',
    description TEXT NOT NULL,
    garment_specs_json JSONB DEFAULT '{}'::jsonb, -- e.g. {"gsm": 480, "fabric": "Organic Cotton"}
    is_limited_edition BOOLEAN NOT NULL DEFAULT false,
    edition_total INT, -- e.g. 500 for numbered pressing
    images_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    includes_instant_digital_album BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE merch_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES merch_products(id) ON DELETE CASCADE,
    sku TEXT NOT NULL UNIQUE,
    variant_name TEXT NOT NULL, -- e.g. '180g Oxblood Marble LP', 'Hoodie - L'
    price_cents BIGINT NOT NULL CHECK (price_cents >= 0), -- strict integer cents ($38.00 = 3800)
    stock_available INT NOT NULL CHECK (stock_available >= 0),
    stock_reserved INT NOT NULL DEFAULT 0 CHECK (stock_reserved >= 0),
    weight_grams INT NOT NULL DEFAULT 350,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_merch_variants_product ON merch_variants(product_id);

-- ----------------------------------------------------------------------------
-- 5. ORDERS, VENUE PICKUP PASSES & DIGITAL VAULT TOKENS
-- ----------------------------------------------------------------------------
CREATE TYPE fulfillment_mode_enum AS ENUM ('ship_to_address', 'venue_pickup', 'digital_only');
CREATE TYPE order_status_enum AS ENUM ('pending', 'paid', 'picked_up_at_venue', 'shipped', 'refunded');

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE, -- e.g. 'ORD-2026-89421'
    fan_email TEXT NOT NULL,
    fulfillment_mode fulfillment_mode_enum NOT NULL DEFAULT 'ship_to_address',
    pickup_tour_date_id UUID REFERENCES tour_dates(id) ON DELETE SET NULL,
    subtotal_cents BIGINT NOT NULL CHECK (subtotal_cents >= 0),
    bundle_discount_cents BIGINT NOT NULL DEFAULT 0 CHECK (bundle_discount_cents >= 0),
    shipping_cents BIGINT NOT NULL DEFAULT 0 CHECK (shipping_cents >= 0),
    total_cents BIGINT NOT NULL CHECK (total_cents >= 0),
    stripe_payment_intent_id TEXT,
    shipping_address_json JSONB DEFAULT '{}'::jsonb,
    items_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    status order_status_enum NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_fan_email ON orders(fan_email);
CREATE INDEX idx_orders_status ON orders(status);

-- Venue Pickup Pass for day-of-show fans
CREATE TYPE pass_status_enum AS ENUM ('issued', 'scanned_redeemed', 'expired');

CREATE TABLE venue_pickup_passes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    tour_date_id UUID NOT NULL REFERENCES tour_dates(id) ON DELETE CASCADE,
    qr_code_secret TEXT NOT NULL UNIQUE,
    pass_status pass_status_enum NOT NULL DEFAULT 'issued',
    booth_number TEXT NOT NULL DEFAULT 'Booth #2 (Main Concourse)',
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    redeemed_at TIMESTAMPTZ
);

CREATE INDEX idx_venue_pickup_qr ON venue_pickup_passes(qr_code_secret);

-- Digital Vault Token for pre-orders & vinyl buyers (FLAC / WAV / MP3 320)
CREATE TYPE audio_format_enum AS ENUM ('flac', 'wav', 'mp3_320');

CREATE TABLE digital_vault_tokens (
    token CHAR(32) PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
    preferred_format audio_format_enum NOT NULL DEFAULT 'wav',
    downloads_used INT NOT NULL DEFAULT 0,
    max_downloads INT NOT NULL DEFAULT 5,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. ATOMIC INVENTORY DEDUCTION PROCEDURE (Concurrency Safeguard)
-- ----------------------------------------------------------------------------
-- Prevents race conditions during limited 1-of-500 vinyl drops:
-- Runs within a transaction using PostgreSQL row-level locks (SELECT FOR UPDATE)
CREATE OR REPLACE FUNCTION deduct_merch_inventory(
    p_variant_id UUID,
    p_quantity INT
) RETURNS BOOLEAN AS $$
DECLARE
    v_available INT;
BEGIN
    -- Acquire exclusive row lock on variant
    SELECT stock_available INTO v_available
    FROM merch_variants
    WHERE id = p_variant_id
    FOR UPDATE;

    IF v_available >= p_quantity THEN
        UPDATE merch_variants
        SET stock_available = stock_available - p_quantity
        WHERE id = p_variant_id;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 7. TIMED WAVEFORM FAN REACTIONS REGISTRY
-- ----------------------------------------------------------------------------
CREATE TABLE track_fan_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    timestamp_ms INT NOT NULL CHECK (timestamp_ms >= 0),
    emoji TEXT NOT NULL DEFAULT '🔥',
    comment TEXT NOT NULL,
    fan_handle TEXT NOT NULL DEFAULT 'Anon Fan',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_track_fan_reactions ON track_fan_reactions(track_id, timestamp_ms);

