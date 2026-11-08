export type ReleaseType = 'lp' | 'ep' | 'single' | 'live_archive';

export interface EraTheme {
  bg: string;
  surface: string;
  accent: string;
  secondary: string;
  glow: string;
}

export interface PressQuote {
  publication: string;
  quote: string;
  score: string;
}

export interface Album {
  id: string;
  title: string;
  slug: string;
  catalog_number: string;
  release_type: ReleaseType;
  release_date: string;
  cover_art_url: string;
  vinyl_disc_art_url?: string;
  era_key: 'nocturne' | 'solar' | 'echo';
  era_theme_json: EraTheme;
  streaming_links_json: Record<string, string>;
  liner_notes_md: string;
  is_preorder: boolean;
  press_quotes?: PressQuote[];
}

export interface LyricLine {
  time_ms: number;
  text: string;
}

export interface TrackCredits {
  producers: string[];
  mix_engineer: string;
  studio_gear: string[];
  collaborators: string[];
}

export interface FanReaction {
  id: string;
  timestamp_ms: number;
  emoji: string;
  comment: string;
  fan_handle: string;
}

export interface Track {
  id: string;
  album_id: string;
  track_number: number;
  title: string;
  duration_seconds: number;
  bpm: number;
  musical_key: string;
  stream_url_mp3: string;
  lossless_s3_key?: string;
  stems_json: {
    vocals: string;
    synths: string;
    drums: string;
    bass: string;
  };
  synced_lyrics_lrc: LyricLine[];
  waveform_peaks: number[];
  credits_json: TrackCredits;
  fan_reactions: FanReaction[];
}

export type TicketStatus = 'presale' | 'on_sale' | 'low_tickets' | 'sold_out' | 'cancelled' | 'past_completed';

export interface TourDate {
  id: string;
  tour_leg_name: string;
  show_date: string;
  doors_time: string;
  city: string;
  country_code: string;
  venue_name: string;
  neighborhood?: string;
  latitude: number;
  longitude: number;
  ticket_status: TicketStatus;
  remaining_tickets_estimate?: number;
  price_usd: number;
  ticket_url: string;
  vip_upgrade_url?: string | null;
  support_acts: string[];
  venue_pickup_enabled: boolean;
  poster_art_url?: string;
  is_nearest_default?: boolean;
}

export interface PastShowSetlistTrack {
  num: number;
  title: string;
  duration: string;
}

export interface PastShow {
  id: string;
  show_date: string;
  city: string;
  venue_name: string;
  tour_leg_name: string;
  poster_art_url: string;
  soundboard_stream_url: string;
  fan_photos: string[];
  setlist_tracks: PastShowSetlistTrack[];
}

export interface CityDemandLeader {
  city_name: string;
  country_code: string;
  count: number;
  lat: number | null;
  lng: number | null;
}

export type MerchCategory = 'vinyl' | 'cassette' | 'apparel' | 'poster_zine' | 'digital' | 'bundle';

export interface MerchVariant {
  id: string;
  sku: string;
  variant_name: string;
  price_cents: number;
  stock_available: number;
  color_hex?: string;
  texture_name?: string;
}

export interface MerchProduct {
  id: string;
  album_id?: string;
  title: string;
  slug: string;
  category: MerchCategory;
  description: string;
  is_limited_edition: boolean;
  edition_total?: number | null;
  copies_remaining?: number;
  includes_instant_digital_album: boolean;
  images: string[];
  perks?: string[];
  garment_specs?: Record<string, string>;
  variants: MerchVariant[];
}

export interface CartItem {
  product: MerchProduct;
  variant: MerchVariant;
  quantity: number;
}

export interface VenuePickupPass {
  pass_id: string;
  order_number: string;
  tour_date_id: string;
  city: string;
  venue_name: string;
  show_date: string;
  booth: string;
  qr_code_data: string;
  status: string;
  fan_email: string;
  perks: string[];
}

export interface DigitalVaultTokenData {
  status: string;
  vault_token: string;
  order_number: string;
  album_title: string;
  available_formats: Array<{
    format: string;
    quality: string;
    size_mb: number;
    download_url: string;
  }>;
  booklet_pdf_url: string;
  downloads_used: number;
  max_downloads: number;
  expires_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  fan_email: string;
  fulfillment_mode: 'ship_to_address' | 'venue_pickup' | 'digital_only';
  pickup_tour_date_id?: string | null;
  subtotal_cents: number;
  bundle_discount_cents: number;
  shipping_cents: number;
  total_cents: number;
  items: Array<{
    product_id: string;
    product_title: string;
    variant_id: string;
    variant_name: string;
    unit_price_cents: number;
    quantity: number;
    total_price_cents: number;
  }>;
  digital_vault_token?: string | null;
  venue_pickup_pass?: VenuePickupPass | null;
  status: string;
  created_at: string;
}

export interface StemChannelState {
  muted: boolean;
  solo: boolean;
  volume: number; // 0 to 1
}

export interface StemMixerState {
  vocals: StemChannelState;
  synths: StemChannelState;
  drums: StemChannelState;
  bass: StemChannelState;
}

export interface MediaSession {
  id: string;
  title: string;
  category: string;
  duration: string;
  date: string;
  poster_url: string;
  embed_type: string;
  youtube_id: string;
  chapters: Array<{ time: string; title: string }>;
  description: string;
}

