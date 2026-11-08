import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import {
  ALBUMS,
  TRACKS,
  TOUR_DATES,
  PAST_SHOWS_ARCHIVE,
  MERCH_PRODUCTS,
  CITY_DEMAND_PLEDGES,
  MEDIA_SESSIONS,
  ORDERS,
  DIGITAL_VAULT_TOKENS,
  VENUE_PICKUP_PASSES,
  calculateHaversineMiles,
  atomicDeductVariantStock
} from './store.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS & JSON parsing
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ============================================================================
// 1. HEALTH & METRICS
// ============================================================================
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'ARTIST-OS v2.6 // Master Deck Controller',
    server_time: new Date().toISOString(),
    catalog_albums_count: ALBUMS.length,
    active_tour_dates: TOUR_DATES.length,
    total_past_shows: 142,
    merch_catalog_count: MERCH_PRODUCTS.length
  });
});

// ============================================================================
// 2. ALBUMS & TRACKS
// ============================================================================
app.get('/api/v1/albums', (req, res) => {
  res.json({
    albums: ALBUMS
  });
});

app.get('/api/v1/albums/:slug', (req, res) => {
  const album = ALBUMS.find(a => a.slug === req.params.slug || a.id === req.params.slug);
  if (!album) {
    return res.status(404).json({ error: 'Album not found' });
  }
  const albumTracks = TRACKS.filter(t => t.album_id === album.id);
  res.json({
    album,
    tracks: albumTracks
  });
});

app.get('/api/v1/tracks', (req, res) => {
  res.json({
    tracks: TRACKS
  });
});

app.get('/api/v1/tracks/:id', (req, res) => {
  const track = TRACKS.find(t => t.id === req.params.id);
  if (!track) {
    return res.status(404).json({ error: 'Track not found' });
  }
  res.json({ track });
});

// Timed fan waveform reaction
app.post('/api/v1/tracks/:id/reactions', (req, res) => {
  const track = TRACKS.find(t => t.id === req.params.id);
  if (!track) {
    return res.status(404).json({ error: 'Track not found' });
  }
  const { timestamp_ms, emoji, comment, fan_handle } = req.body;
  if (timestamp_ms === undefined || !comment) {
    return res.status(400).json({ error: 'timestamp_ms and comment are required' });
  }
  const newReaction = {
    id: `rx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp_ms: Number(timestamp_ms),
    emoji: emoji || '🔥',
    comment: String(comment).slice(0, 140),
    fan_handle: fan_handle ? String(fan_handle).slice(0, 32) : 'Verified Fan'
  };
  track.fan_reactions.push(newReaction);
  res.status(201).json({
    success: true,
    reaction: newReaction,
    total_reactions: track.fan_reactions.length
  });
});

// ============================================================================
// 3. TOUR DATES, GEO RESOLVER & CROWD DEMAND
// ============================================================================
app.get('/api/v1/tour/dates', (req, res) => {
  const { region } = req.query;
  let dates = [...TOUR_DATES];

  if (region === 'na') {
    dates = dates.filter(d => d.country_code === 'US' || d.country_code === 'CA');
  } else if (region === 'eu') {
    dates = dates.filter(d => ['GB', 'DE', 'FR', 'NL', 'IS'].includes(d.country_code));
  } else if (region === 'asia') {
    dates = dates.filter(d => ['JP', 'KR', 'AU'].includes(d.country_code));
  }

  res.json({
    tour_dates: dates,
    total_upcoming: TOUR_DATES.length
  });
});

app.get('/api/v1/tour/archive', (req, res) => {
  res.json({
    past_shows: PAST_SHOWS_ARCHIVE,
    total_past_completed: 142
  });
});

// Geo-Distance Tour Resolver
app.get('/api/v1/tour/nearest', (req, res) => {
  let lat = parseFloat(req.query.lat);
  let lng = parseFloat(req.query.lng);

  // Default fallback coordinates: San Francisco if coordinates unavailable
  if (isNaN(lat) || isNaN(lng)) {
    lat = 37.7749;
    lng = -122.4194;
  }

  let nearestShow = null;
  let minDistance = Infinity;

  for (const show of TOUR_DATES) {
    const dist = calculateHaversineMiles(lat, lng, show.latitude, show.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      nearestShow = show;
    }
  }

  res.json({
    user_coordinates: { lat, lng },
    nearest_show: nearestShow,
    distance_miles: minDistance,
    distance_km: Math.round(minDistance * 1.60934),
    within_reasonable_distance: minDistance <= 250
  });
});

// Fan Presale Passcode Verification
app.post('/api/v1/presale/verify', (req, res) => {
  const { passcode } = req.body;
  const validCodes = ['CHROME2026', 'NOCTURNE', 'SOUNDCHECK', 'ARTIST26', 'BERLIN'];
  
  if (passcode && validCodes.includes(passcode.trim().toUpperCase())) {
    res.json({
      valid: true,
      message: 'Verified Fan Passcode Accepted! 48-hour anti-scalper tickets unlocked.',
      discount_perks: 'VIP Soundcheck Access Priority'
    });
  } else {
    res.status(400).json({
      valid: false,
      message: 'Invalid fan passcode. Check your email confirmation or album pre-order receipt.'
    });
  }
});

// City Demand Pledges (Crowd Routing)
app.post('/api/v1/tour/demand', (req, res) => {
  const { fan_email, city_name, country_code, preferred_tier, streaming_platform } = req.body;
  if (!fan_email || !city_name) {
    return res.status(400).json({ error: 'Email and city name are required' });
  }

  const existingCity = CITY_DEMAND_PLEDGES.find(
    c => c.city_name.toLowerCase() === city_name.trim().toLowerCase()
  );

  if (existingCity) {
    existingCity.count += 1;
  } else {
    CITY_DEMAND_PLEDGES.push({
      city_name: city_name.trim(),
      country_code: country_code || 'US',
      count: 1,
      lat: null,
      lng: null
    });
  }

  // Sort leaderboard
  CITY_DEMAND_PLEDGES.sort((a, b) => b.count - a.count);

  res.status(201).json({
    success: true,
    message: `Pledge logged for ${city_name}! When 300+ fans pledge, routing agents evaluate the date.`,
    city_count: existingCity ? existingCity.count : 1,
    leaderboard_rank: CITY_DEMAND_PLEDGES.findIndex(c => c.city_name.toLowerCase() === city_name.trim().toLowerCase()) + 1
  });
});

app.get('/api/v1/tour/demand/leaderboard', (req, res) => {
  res.json({
    leaderboard: CITY_DEMAND_PLEDGES.slice(0, 10),
    total_pledges: CITY_DEMAND_PLEDGES.reduce((acc, c) => acc + c.count, 0)
  });
});

// ============================================================================
// 4. MERCH STOREFRONT & VINYL MATRIX
// ============================================================================
app.get('/api/v1/merch/products', (req, res) => {
  res.json({
    products: MERCH_PRODUCTS
  });
});

// Concurrency-Safe Checkout & Pass Minting
app.post('/api/v1/cart/checkout', (req, res) => {
  const {
    fan_email,
    fulfillment_mode, // 'ship_to_address' | 'venue_pickup' | 'digital_only'
    pickup_tour_date_id,
    items, // array of { variant_id, product_id, quantity }
    shipping_address
  } = req.body;

  if (!fan_email || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Email and valid items array are required' });
  }

  // Atomic stock check and deduction
  let subtotal_cents = 0;
  let has_vinyl_or_lp = false;
  let has_apparel_or_poster = false;
  let includes_instant_digital = false;
  const processedItems = [];

  for (const item of items) {
    const deductRes = atomicDeductVariantStock(item.variant_id, item.quantity || 1);
    if (!deductRes.success) {
      return res.status(409).json({
        error: `Insufficient inventory for item "${item.variant_id}": ${deductRes.reason}`
      });
    }

    const { variant, product } = deductRes;
    const itemTotal = variant.price_cents * (item.quantity || 1);
    subtotal_cents += itemTotal;

    if (product.category === 'vinyl' || product.category === 'bundle') has_vinyl_or_lp = true;
    if (product.category === 'apparel' || product.category === 'poster_zine') has_apparel_or_poster = true;
    if (product.includes_instant_digital_album) includes_instant_digital = true;

    processedItems.push({
      product_id: product.id,
      product_title: product.title,
      variant_id: variant.id,
      variant_name: variant.variant_name,
      unit_price_cents: variant.price_cents,
      quantity: item.quantity || 1,
      total_price_cents: itemTotal
    });
  }

  // Calculate Bundle Discounts (e.g. 15% off subtotal if bundle configured)
  let bundle_discount_cents = 0;
  if (has_vinyl_or_lp && has_apparel_or_poster) {
    bundle_discount_cents = Math.round(subtotal_cents * 0.15);
  }

  // Shipping calculation
  let shipping_cents = 0;
  if (fulfillment_mode === 'venue_pickup') {
    shipping_cents = 0; // Skip the line, pick up at booth
  } else if (fulfillment_mode === 'digital_only') {
    shipping_cents = 0;
  } else {
    shipping_cents = 950; // $9.50 flat rate tracked shipping
  }

  const total_cents = subtotal_cents - bundle_discount_cents + shipping_cents;
  const order_number = `ORD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

  // Generate Digital Vault Token if applicable
  let digital_vault_token = null;
  if (includes_instant_digital || has_vinyl_or_lp) {
    digital_vault_token = crypto.randomBytes(16).toString('hex');
    DIGITAL_VAULT_TOKENS.set(digital_vault_token, {
      token: digital_vault_token,
      order_number,
      album_title: "NOCTURNE IN CHROME (Deluxe Edition)",
      formats: ["24-bit/96kHz Master .WAV", ".FLAC Lossless", "320kbps MP3"],
      downloads_used: 0,
      max_downloads: 5,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  // Generate Venue Pickup Pass if venue pickup mode selected
  let venue_pickup_pass = null;
  if (fulfillment_mode === 'venue_pickup') {
    const selectedTour = TOUR_DATES.find(t => t.id === pickup_tour_date_id) || TOUR_DATES[0];
    const qr_secret = `VENUE-PICKUP-${order_number}-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    venue_pickup_pass = {
      pass_id: `pass-${Date.now()}`,
      order_number,
      tour_date_id: selectedTour.id,
      city: selectedTour.city,
      venue_name: selectedTour.venue_name,
      show_date: selectedTour.show_date,
      booth: "Merch Booth #2 (Main Concourse Floor)",
      qr_code_data: qr_secret,
      status: "issued",
      fan_email,
      perks: ["Line-Skip Express Lane", "Pre-Packed Gatefold Bag", "Zero Handling Damage"]
    };
    VENUE_PICKUP_PASSES.set(qr_secret, venue_pickup_pass);
  }

  const newOrder = {
    id: `ord-${Date.now()}`,
    order_number,
    fan_email,
    fulfillment_mode,
    pickup_tour_date_id: pickup_tour_date_id || null,
    subtotal_cents,
    bundle_discount_cents,
    shipping_cents,
    total_cents,
    items: processedItems,
    shipping_address: shipping_address || null,
    digital_vault_token,
    venue_pickup_pass,
    status: 'paid',
    created_at: new Date().toISOString()
  };

  ORDERS.push(newOrder);

  res.status(201).json({
    success: true,
    order: newOrder
  });
});

// Digital Vault Token Access
app.get('/api/v1/vault/:token', (req, res) => {
  const tokenData = DIGITAL_VAULT_TOKENS.get(req.params.token);
  if (!tokenData) {
    return res.status(404).json({ error: 'Invalid or expired digital vault token' });
  }

  if (tokenData.downloads_used >= tokenData.max_downloads) {
    return res.status(403).json({ error: 'Download limit exceeded (5/5 used)' });
  }

  tokenData.downloads_used += 1;

  res.json({
    status: 'valid',
    vault_token: tokenData.token,
    order_number: tokenData.order_number,
    album_title: tokenData.album_title,
    available_formats: [
      { format: 'WAV', quality: '24-bit / 96kHz Studio Master', size_mb: 840, download_url: `/download/vault/${tokenData.token}/wav` },
      { format: 'FLAC', quality: 'Lossless Audio Compression', size_mb: 480, download_url: `/download/vault/${tokenData.token}/flac` },
      { format: 'MP3', quality: '320kbps Joint-Stereo LAME', size_mb: 110, download_url: `/download/vault/${tokenData.token}/mp3` }
    ],
    booklet_pdf_url: `/download/vault/${tokenData.token}/booklet.pdf`,
    downloads_used: tokenData.downloads_used,
    max_downloads: tokenData.max_downloads,
    expires_at: tokenData.expires_at
  });
});

// ============================================================================
// 5. MEDIA SESSIONS & STREAMING CHANNELS
// ============================================================================
app.get('/api/v1/media/sessions', (req, res) => {
  res.json({
    sessions: MEDIA_SESSIONS,
    streaming_embed_configs: {
      spotify_uri: "spotify:album:1DFixLWuPkv3KT3TnV35m3",
      apple_music_id: "1598284729",
      bandcamp_album_id: "328941782",
      soundcloud_url: "https://soundcloud.com/artist/sets/nocturne-in-chrome"
    }
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[ARTIST-OS BACKEND] Server running on http://localhost:${PORT}`);
});

export default app;

