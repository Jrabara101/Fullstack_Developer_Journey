import { Album, Track, TourDate, PastShow, MerchProduct, MediaSession, CityDemandLeader } from '../types';

export const INITIAL_ALBUMS: Album[] = [
  {
    id: "alb-nocturne-2026",
    title: "NOCTURNE IN CHROME",
    slug: "nocturne-in-chrome",
    catalog_number: "CAT-026LP",
    release_type: "lp",
    release_date: "2026-10-18",
    cover_art_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    vinyl_disc_art_url: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=600&q=80",
    era_key: "nocturne",
    era_theme_json: {
      bg: "#07080A",
      surface: "#101216",
      accent: "#FF3366",
      secondary: "#00F0FF",
      glow: "rgba(255, 51, 102, 0.25)"
    },
    streaming_links_json: {
      spotify: "https://open.spotify.com",
      apple: "https://music.apple.com",
      bandcamp: "https://bandcamp.com",
      tidal: "https://tidal.com",
      soundcloud: "https://soundcloud.com",
      youtube: "https://youtube.com"
    },
    liner_notes_md: "Recorded live to 2-inch 16-track analog tape between Hansa Tonstudio (Berlin) and Studio 2 (Tokyo). Built entirely on voltage-controlled analog synthesis, continuous tape delays, and live micro-tuned vocal processing. Mastered for vinyl at Sterling Sound by Chris Gehringer at 24-bit/96kHz.",
    is_preorder: false,
    press_quotes: [
      { publication: "Pitchfork", quote: "A triumphant masterclass in tape-saturated analog brutalism.", score: "8.8 Best New Music" },
      { publication: "Resident Advisor", quote: "Sublime, heavyweight electronic composition with visceral emotional stakes.", score: "Essential" },
      { publication: "The Wire", quote: "Redefining the boundaries between modular exploration and pop architecture.", score: "Album of the Month" }
    ]
  },
  {
    id: "alb-solar-2024",
    title: "SOLAR FLARE",
    slug: "solar-flare",
    catalog_number: "CAT-019LP",
    release_type: "lp",
    release_date: "2024-06-21",
    cover_art_url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
    vinyl_disc_art_url: "https://images.unsplash.com/photo-1542208998-f6dbbb27a72f?auto=format&fit=crop&w=600&q=80",
    era_key: "solar",
    era_theme_json: {
      bg: "#090705",
      surface: "#14100C",
      accent: "#FF6B00",
      secondary: "#FFD000",
      glow: "rgba(255, 107, 0, 0.25)"
    },
    streaming_links_json: {
      spotify: "https://open.spotify.com",
      apple: "https://music.apple.com",
      bandcamp: "https://bandcamp.com",
      tidal: "https://tidal.com",
      soundcloud: "https://soundcloud.com",
      youtube: "https://youtube.com"
    },
    liner_notes_md: "Capturing the blinding, heat-distorted frequencies of the summer solstice. Captured in Joshua Tree with battery-powered solar-rigged modular racks and acoustic tape loops.",
    is_preorder: false,
    press_quotes: [
      { publication: "Stereogum", quote: "Blistering synthesis that feels both prehistoric and galactic.", score: "Album of the Week" }
    ]
  },
  {
    id: "alb-echo-2022",
    title: "ECHO CHAMBER",
    slug: "echo-chamber",
    catalog_number: "CAT-011EP",
    release_type: "ep",
    release_date: "2022-11-11",
    cover_art_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    vinyl_disc_art_url: "https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=600&q=80",
    era_key: "echo",
    era_theme_json: {
      bg: "#08060E",
      surface: "#120F1D",
      accent: "#A855F7",
      secondary: "#3B82F6",
      glow: "rgba(168, 85, 247, 0.25)"
    },
    streaming_links_json: {
      spotify: "https://open.spotify.com",
      apple: "https://music.apple.com",
      bandcamp: "https://bandcamp.com",
      tidal: "https://tidal.com",
      soundcloud: "https://soundcloud.com",
      youtube: "https://youtube.com"
    },
    liner_notes_md: "Minimalist spatial reflections recorded in an abandoned Cold War radar dome in Teufelsberg, Berlin. Pure resonance and reverb decay studies.",
    is_preorder: false,
    press_quotes: [
      { publication: "Clash Magazine", quote: "A spectral, cavernous journey through time and decay.", score: "9/10" }
    ]
  }
];

export const INITIAL_TRACKS: Track[] = [
  {
    id: "trk-nocturne-01",
    album_id: "alb-nocturne-2026",
    track_number: 1,
    title: "Anodized Skyline",
    duration_seconds: 228,
    bpm: 124,
    musical_key: "D Minor",
    stream_url_mp3: "/audio/preview/nocturne-01.mp3",
    lossless_s3_key: "vault/masters/CAT-026LP/01-Anodized-Skyline-24-96.wav",
    stems_json: {
      vocals: "synced_synth_vocal_lead",
      synths: "sequential_prophet6_arps",
      drums: "roland_tr909_kick_snare",
      bass: "moog_sub37_bassline"
    },
    synced_lyrics_lrc: [
      { time_ms: 12000, text: "Low voltage hums against the obsidian skyline" },
      { time_ms: 24000, text: "We trace the grid where signals cross the wires" },
      { time_ms: 36000, text: "Analog frequencies bleeding through the glass" },
      { time_ms: 48000, text: "Nothing remains static beneath the chrome" },
      { time_ms: 64000, text: "Oscilloscope light dancing in your eyes" },
      { time_ms: 80000, text: "Touch the tape reel as the motor spins" },
      { time_ms: 98000, text: "Every transient held in magnetic drift" },
      { time_ms: 120000, text: "[Analog Synth Modulation Solo]" },
      { time_ms: 154000, text: "We built a temple out of vacuum tubes and noise" },
      { time_ms: 182000, text: "Fade down the faders until dawn returns" }
    ],
    waveform_peaks: [
      0.15, 0.28, 0.42, 0.38, 0.65, 0.72, 0.55, 0.62, 0.84, 0.92,
      0.78, 0.64, 0.52, 0.68, 0.81, 0.76, 0.88, 0.95, 0.82, 0.71,
      0.58, 0.45, 0.35, 0.48, 0.62, 0.74, 0.89, 0.93, 0.85, 0.78,
      0.65, 0.72, 0.84, 0.98, 0.91, 0.83, 0.67, 0.52, 0.41, 0.38,
      0.55, 0.69, 0.81, 0.87, 0.96, 1.00, 0.92, 0.84, 0.76, 0.69,
      0.62, 0.58, 0.71, 0.83, 0.88, 0.94, 0.79, 0.63, 0.48, 0.32,
      0.45, 0.58, 0.72, 0.84, 0.81, 0.75, 0.62, 0.51, 0.42, 0.30
    ],
    credits_json: {
      producers: ["Artist", "Kazu M."],
      mix_engineer: "Hansa Tonstudio, Berlin",
      studio_gear: [
        "Sequential Prophet-6 (Polyphonic Synthesizer)",
        "Roland RE-201 Space Echo",
        "Neumann U67 Tube Mic",
        "Moog Subsequent 37",
        "Studer A800 2-Inch Tape Machine"
      ],
      collaborators: ["Kazu (Vocal Processing, Modular Routing)"]
    },
    fan_reactions: [
      { id: "rx-1", timestamp_ms: 36000, emoji: "⚡", comment: "That filter sweep opening up!", fan_handle: "BerlinTapeClub" },
      { id: "rx-2", timestamp_ms: 80000, emoji: "🔥", comment: "The 909 kick hits so heavy here", fan_handle: "ModularJunkie" },
      { id: "rx-3", timestamp_ms: 120000, emoji: "✨", comment: "Prophet-6 solo gave me full chills", fan_handle: "NocturneArchive" }
    ]
  },
  {
    id: "trk-nocturne-02",
    album_id: "alb-nocturne-2026",
    track_number: 2,
    title: "Glass Cathedral (feat. Kazu)",
    duration_seconds: 252,
    bpm: 122,
    musical_key: "F Minor",
    stream_url_mp3: "/audio/preview/nocturne-02.mp3",
    lossless_s3_key: "vault/masters/CAT-026LP/02-Glass-Cathedral-24-96.wav",
    stems_json: {
      vocals: "kazu_lead_and_harmonies",
      synths: "oberheim_ob6_pads",
      drums: "linndrum_analog_percussion",
      bass: "roland_sh101_acid_bass"
    },
    synced_lyrics_lrc: [
      { time_ms: 8000, text: "Walking through mirrors in the cathedral of glass" },
      { time_ms: 22000, text: "Your voice echoes in reverse polarity" },
      { time_ms: 38000, text: "Hold the vibration between the ribs" },
      { time_ms: 54000, text: "Every shattered light refracted in delay" },
      { time_ms: 72000, text: "[Chorus: Harmonic Vocal Swell]" },
      { time_ms: 92000, text: "We are the signal that outlived the tower" },
      { time_ms: 110000, text: "Resonating at forty-four hertz" },
      { time_ms: 138000, text: "Feel the pressure wave against the sternum" },
      { time_ms: 170000, text: "No compression can hold what we became" },
      { time_ms: 210000, text: "Sub-bass decaying into quiet tape hiss" }
    ],
    waveform_peaks: [
      0.12, 0.22, 0.35, 0.48, 0.58, 0.67, 0.74, 0.82, 0.79, 0.85,
      0.90, 0.88, 0.72, 0.65, 0.78, 0.84, 0.91, 0.95, 0.86, 0.79,
      0.68, 0.54, 0.42, 0.50, 0.67, 0.78, 0.89, 0.97, 0.92, 0.84,
      0.72, 0.79, 0.88, 0.99, 0.94, 0.85, 0.74, 0.62, 0.53, 0.44
    ],
    credits_json: {
      producers: ["Artist"],
      mix_engineer: "Sterling Sound (Chris Gehringer)",
      studio_gear: [
        "Oberheim OB-6 (Analog Synthesizer)",
        "LinnDrum LM-2",
        "Roland SH-101 Bass",
        "Eventide H949 Harmonizer"
      ],
      collaborators: ["Kazu (Featured Vocalist & Modular Performance)"]
    },
    fan_reactions: [
      { id: "rx-4", timestamp_ms: 22000, emoji: "💎", comment: "The reverse vocal delay is crazy", fan_handle: "ShibuyaSound" },
      { id: "rx-5", timestamp_ms: 110000, emoji: "🔊", comment: "Sub hits 44hz check your monitors!!", fan_handle: "Basshead99" },
      { id: "rx-6", timestamp_ms: 170000, emoji: "🙌", comment: "Song of the year easily", fan_handle: "VibeSeeker" }
    ]
  },
  {
    id: "trk-nocturne-03",
    album_id: "alb-nocturne-2026",
    track_number: 3,
    title: "Chrome Horizon",
    duration_seconds: 235,
    bpm: 128,
    musical_key: "A Minor",
    stream_url_mp3: "/audio/preview/nocturne-03.mp3",
    lossless_s3_key: "vault/masters/CAT-026LP/03-Chrome-Horizon-24-96.wav",
    stems_json: {
      vocals: "vocoder_carrier_modulator",
      synths: "buchla_modular_plucks",
      drums: "analog_electronic_breaks",
      bass: "acid_sub_oscillator"
    },
    synced_lyrics_lrc: [
      { time_ms: 15000, text: "Horizon line dipped in liquid metal" },
      { time_ms: 32000, text: "Accelerating past the red line" },
      { time_ms: 50000, text: "Binary pulses in the night air" },
      { time_ms: 78000, text: "Don't let the signal drop" },
      { time_ms: 112000, text: "[Acid Synthesizer Break]" }
    ],
    waveform_peaks: [
      0.18, 0.30, 0.45, 0.52, 0.68, 0.79, 0.85, 0.88, 0.92, 0.95,
      0.82, 0.74, 0.69, 0.78, 0.86, 0.93, 0.97, 0.99, 0.90, 0.81
    ],
    credits_json: {
      producers: ["Artist"],
      mix_engineer: "Hansa Tonstudio, Berlin",
      studio_gear: ["Buchla 200e Modular", "Roland VP-330 Vocoder", "E-mu SP-1200"],
      collaborators: []
    },
    fan_reactions: [
      { id: "rx-7", timestamp_ms: 112000, emoji: "🚀", comment: "128 BPM acid break goes berserk", fan_handle: "RaveArchivist" }
    ]
  },
  {
    id: "trk-solar-01",
    album_id: "alb-solar-2024",
    track_number: 1,
    title: "Helios Rising",
    duration_seconds: 242,
    bpm: 125,
    musical_key: "D Major",
    stream_url_mp3: "/audio/preview/solar-01.mp3",
    lossless_s3_key: "vault/masters/CAT-019LP/01-Helios-Rising-24-96.wav",
    stems_json: {
      vocals: "warm_acoustic_vocalese",
      synths: "brass_analog_chords",
      drums: "kick_and_organic_shaker",
      bass: "warm_saw_drive"
    },
    synced_lyrics_lrc: [
      { time_ms: 10000, text: "First ray of light cracking the canyon wall" },
      { time_ms: 28000, text: "Dust storms rising in fifty degrees of heat" },
      { time_ms: 60000, text: "Solar charged oscillators breathing with the sun" }
    ],
    waveform_peaks: [
      0.2, 0.35, 0.5, 0.6, 0.75, 0.8, 0.85, 0.9, 0.85, 0.75,
      0.65, 0.7, 0.8, 0.9, 0.95, 0.85, 0.75, 0.65, 0.6, 0.7
    ],
    credits_json: {
      producers: ["Artist"],
      mix_engineer: "Joshua Tree Solar Studio",
      studio_gear: ["Solar Eurorack", "Fender Rhodes Mark I"],
      collaborators: []
    },
    fan_reactions: [
      { id: "rx-8", timestamp_ms: 28000, emoji: "☀️", comment: "Golden hour anthem forever", fan_handle: "DesertSun" }
    ]
  },
  {
    id: "trk-echo-01",
    album_id: "alb-echo-2022",
    track_number: 1,
    title: "Tape Hiss & Glass",
    duration_seconds: 216,
    bpm: 118,
    musical_key: "C Minor",
    stream_url_mp3: "/audio/preview/echo-01.mp3",
    lossless_s3_key: "vault/masters/CAT-011EP/01-Tape-Hiss-Glass-24-96.wav",
    stems_json: {
      vocals: "whisper_and_reverb_tails",
      synths: "cold_digital_resonators",
      drums: "minimal_click_and_rim",
      bass: "subterranean_sine"
    },
    synced_lyrics_lrc: [
      { time_ms: 14000, text: "Ten seconds of decay in the empty concrete dome" },
      { time_ms: 35000, text: "A whispered vowel multiplying into white light" },
      { time_ms: 70000, text: "We captured what the microphone forgot to hear" }
    ],
    waveform_peaks: [
      0.1, 0.2, 0.3, 0.4, 0.45, 0.5, 0.6, 0.65, 0.7, 0.75,
      0.8, 0.85, 0.7, 0.6, 0.55, 0.65, 0.75, 0.8, 0.85, 0.9
    ],
    credits_json: {
      producers: ["Artist"],
      mix_engineer: "Teufelsberg Radar Station Acoustic Field",
      studio_gear: ["Nagra 4.2 Portable Reel", "AKG C414 B-ULS"],
      collaborators: []
    },
    fan_reactions: [
      { id: "rx-9", timestamp_ms: 70000, emoji: "🔮", comment: "The acoustic decay here is unbelievable", fan_handle: "AmbientAesthetics" }
    ]
  }
];

export const INITIAL_TOUR_DATES: TourDate[] = [
  {
    id: "tour-sf-2026",
    tour_leg_name: "World Tour 2026: North America Leg",
    show_date: "2026-11-20T20:00:00Z",
    doors_time: "20:00",
    city: "San Francisco, CA",
    country_code: "US",
    venue_name: "The Regency Ballroom",
    neighborhood: "Van Ness / Nob Hill",
    latitude: 37.7891,
    longitude: -122.4215,
    ticket_status: "low_tickets",
    remaining_tickets_estimate: 19,
    price_usd: 42,
    ticket_url: "https://dice.fm",
    vip_upgrade_url: "https://dice.fm/vip",
    support_acts: ["Kazu (Live)", "Minimal Wave DJs"],
    venue_pickup_enabled: true,
    poster_art_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
    is_nearest_default: true
  },
  {
    id: "tour-la-2026",
    tour_leg_name: "World Tour 2026: North America Leg",
    show_date: "2026-11-22T20:30:00Z",
    doors_time: "20:30",
    city: "Los Angeles, CA",
    country_code: "US",
    venue_name: "The Fonda Theatre",
    neighborhood: "Hollywood Blvd",
    latitude: 34.1018,
    longitude: -118.3245,
    ticket_status: "on_sale",
    remaining_tickets_estimate: 140,
    price_usd: 45,
    ticket_url: "https://dice.fm",
    vip_upgrade_url: "https://dice.fm/vip",
    support_acts: ["Kazu (Live)", "Hiroshi Y."],
    venue_pickup_enabled: true,
    poster_art_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "tour-tokyo-2026",
    tour_leg_name: "World Tour 2026: Asia-Pacific Leg",
    show_date: "2026-11-24T19:30:00Z",
    doors_time: "19:30",
    city: "Tokyo, JP",
    country_code: "JP",
    venue_name: "Spotify O-EAST",
    neighborhood: "Shibuya Dogenzaka",
    latitude: 35.6595,
    longitude: 139.6953,
    ticket_status: "presale",
    remaining_tickets_estimate: 75,
    price_usd: 55,
    ticket_url: "https://eplus.jp",
    vip_upgrade_url: "https://eplus.jp/vip",
    support_acts: ["Minimal Wave + Live Modular Visuals", "Merzbow (Ambient Set)"],
    venue_pickup_enabled: true,
    poster_art_url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "tour-london-2026",
    tour_leg_name: "World Tour 2026: Europe & UK Leg",
    show_date: "2026-12-02T19:00:00Z",
    doors_time: "19:00",
    city: "London, UK",
    country_code: "GB",
    venue_name: "Roundhouse",
    neighborhood: "Camden",
    latitude: 51.5432,
    longitude: -0.1517,
    ticket_status: "sold_out",
    remaining_tickets_estimate: 0,
    price_usd: 48,
    ticket_url: "https://dice.fm",
    vip_upgrade_url: null,
    support_acts: ["Actress (DJ Set)", "Loraine James"],
    venue_pickup_enabled: true,
    poster_art_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "tour-berlin-2026",
    tour_leg_name: "World Tour 2026: Europe & UK Leg",
    show_date: "2026-12-05T21:00:00Z",
    doors_time: "21:00",
    city: "Berlin, DE",
    country_code: "DE",
    venue_name: "Funkhaus Nalepastrasse",
    neighborhood: "Saal 1",
    latitude: 52.4938,
    longitude: 13.5042,
    ticket_status: "on_sale",
    remaining_tickets_estimate: 88,
    price_usd: 40,
    ticket_url: "https://residentadvisor.net",
    vip_upgrade_url: "https://residentadvisor.net/vip",
    support_acts: ["Kazu (Live Modular)", "Hansa Resident Ensembles"],
    venue_pickup_enabled: true,
    poster_art_url: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "tour-nyc-2026",
    tour_leg_name: "World Tour 2026: North America Leg",
    show_date: "2026-12-12T20:00:00Z",
    doors_time: "20:00",
    city: "New York, NY",
    country_code: "US",
    venue_name: "Brooklyn Steel",
    neighborhood: "Williamsburg / East Williamsburg",
    latitude: 40.7196,
    longitude: -73.9388,
    ticket_status: "low_tickets",
    remaining_tickets_estimate: 28,
    price_usd: 45,
    ticket_url: "https://bowerypresents.com",
    vip_upgrade_url: "https://bowerypresents.com/vip",
    support_acts: ["Kelly Lee Owens (Live)", "Special Guests"],
    venue_pickup_enabled: true,
    poster_art_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "tour-paris-2026",
    tour_leg_name: "World Tour 2026: Europe & UK Leg",
    show_date: "2026-12-15T20:00:00Z",
    doors_time: "20:00",
    city: "Paris, FR",
    country_code: "FR",
    venue_name: "L'Élysée Montmartre",
    neighborhood: "18th Arr.",
    latitude: 48.8829,
    longitude: 2.3444,
    ticket_status: "on_sale",
    remaining_tickets_estimate: 112,
    price_usd: 38,
    ticket_url: "https://dice.fm",
    vip_upgrade_url: "https://dice.fm/vip",
    support_acts: ["Rone (Ambient set)"],
    venue_pickup_enabled: true,
    poster_art_url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "tour-ams-2026",
    tour_leg_name: "World Tour 2026: Europe & UK Leg",
    show_date: "2026-12-18T20:30:00Z",
    doors_time: "20:30",
    city: "Amsterdam, NL",
    country_code: "NL",
    venue_name: "Paradiso",
    neighborhood: "Main Hall",
    latitude: 52.3622,
    longitude: 4.8837,
    ticket_status: "on_sale",
    remaining_tickets_estimate: 45,
    price_usd: 40,
    ticket_url: "https://paradiso.nl",
    vip_upgrade_url: null,
    support_acts: ["Colin Benders (Modular Live)"],
    venue_pickup_enabled: true,
    poster_art_url: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=600&q=80"
  }
];

export const INITIAL_PAST_SHOWS: PastShow[] = [
  {
    id: "past-show-01",
    show_date: "2026-05-14",
    city: "Kyoto, JP",
    venue_name: "ROHM Theatre",
    tour_leg_name: "Solar Flare Tour 2026",
    poster_art_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80",
    soundboard_stream_url: "/audio/bootleg/kyoto-live.mp3",
    fan_photos: [
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80"
    ],
    setlist_tracks: [
      { num: 1, title: "Helios Rising (Extended Modular Intro)", duration: "06:12" },
      { num: 2, title: "Corona Shift", duration: "04:18" },
      { num: 3, title: "Solar Wind Echoes", duration: "05:04" },
      { num: 4, title: "Glass Cathedral (Debut Live)", duration: "05:44" },
      { num: 5, title: "Anodized Skyline (Early Tape Jam)", duration: "07:10" },
      { num: 6, title: "Tape Hiss & Glass", duration: "04:30" },
      { num: 7, title: "Modular Synthesis Improv @ 126 BPM", duration: "11:22" },
      { num: 8, title: "Resonant Decay (Encore w/ Prophet-6)", duration: "06:40" }
    ]
  },
  {
    id: "past-show-02",
    show_date: "2025-10-28",
    city: "Reykjavík, IS",
    venue_name: "Harpa Concert Hall",
    tour_leg_name: "Northern Solstice Sessions",
    poster_art_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    soundboard_stream_url: "/audio/bootleg/reykjavik-live.mp3",
    fan_photos: [
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80"
    ],
    setlist_tracks: [
      { num: 1, title: "Corona Shift (Sub-Zero Ambient Intro)", duration: "07:15" },
      { num: 2, title: "Helios Rising", duration: "04:35" },
      { num: 3, title: "Ghost Frequency", duration: "05:50" },
      { num: 4, title: "Echo Chamber Drone in Quad", duration: "14:10" },
      { num: 5, title: "Solar Flare Reprise", duration: "06:05" }
    ]
  }
];

export const INITIAL_MERCH: MerchProduct[] = [
  {
    id: "merch-vinyl-nocturne",
    album_id: "alb-nocturne-2026",
    title: "Nocturne in Chrome — Deluxe 2xLP Gatefold",
    slug: "nocturne-in-chrome-deluxe-vinyl",
    category: "vinyl",
    description: "Mastered at 24-bit/96kHz at Sterling Sound and pressed onto heavyweight 180g virgin vinyl. Features a 425gsm unbleached reverse-board gatefold jacket, foil-stamped catalog telemetry, and an exclusive 24-page archival booklet with studio schematics, synth patch diagrams, and lyrics.",
    is_limited_edition: true,
    edition_total: 500,
    copies_remaining: 34,
    includes_instant_digital_album: true,
    images: [
      "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
    ],
    perks: [
      "Immediate 24-bit Lossless (.WAV / .FLAC) & 320kbps MP3 Digital Vault Download",
      "Heavyweight 425gsm Matte Gatefold + 24-Page Full Color Lyric & Synth Patch Book",
      "Stitched Japanese-Style Obi-Strip on selected editions",
      "Direct Stamped Edition Number (#001 to #500)"
    ],
    variants: [
      {
        id: "var-vinyl-oxblood",
        sku: "VIN-NOC-OXB",
        variant_name: "180g Translucent Oxblood Marble",
        price_cents: 3800,
        stock_available: 18,
        color_hex: "#8B0000",
        texture_name: "Oxblood Swirl"
      },
      {
        id: "var-vinyl-chrome",
        sku: "VIN-NOC-CHM",
        variant_name: "Liquid Chrome Silver Sheen",
        price_cents: 4200,
        stock_available: 10,
        color_hex: "#D4D4D8",
        texture_name: "Mirror Chrome"
      },
      {
        id: "var-vinyl-obi",
        sku: "VIN-NOC-OBI",
        variant_name: "Japanese Import w/ Obi-Strip",
        price_cents: 4800,
        stock_available: 6,
        color_hex: "#FF3366",
        texture_name: "Tokyo Pressing"
      },
      {
        id: "var-vinyl-black",
        sku: "VIN-NOC-BLK",
        variant_name: "Standard 180g Audiophile Black",
        price_cents: 3400,
        stock_available: 45,
        color_hex: "#18181B",
        texture_name: "Pure Carbon Black"
      }
    ]
  },
  {
    id: "merch-cassette-chrome",
    album_id: "alb-nocturne-2026",
    title: "Nocturne in Chrome — Master Type-II Chrome Cassette",
    slug: "nocturne-chrome-cassette",
    category: "cassette",
    description: "High-bias Cobalt Type-II magnetic tape duplicated in real-time onto vintage Nakamichi decks. Housed in a custom smokey-quartz jewel box with metallic silver j-card foil typography.",
    is_limited_edition: true,
    edition_total: 150,
    copies_remaining: 19,
    includes_instant_digital_album: true,
    images: [
      "https://images.unsplash.com/photo-1542208998-f6dbbb27a72f?auto=format&fit=crop&w=800&q=80"
    ],
    perks: [
      "Real-time Type-II magnetic duplication with extended high-end frequency response",
      "Immediate Lossless .WAV & .FLAC Vault Download Code",
      "Numbered foil sticker seal"
    ],
    variants: [
      {
        id: "var-cas-smokey",
        sku: "CAS-NOC-01",
        variant_name: "Smokey Quartz Tint Shell",
        price_cents: 1800,
        stock_available: 19
      }
    ]
  },
  {
    id: "merch-apparel-hoodie",
    album_id: "alb-nocturne-2026",
    title: "Studio Hardware Architecture Hoodie (480GSM)",
    slug: "studio-hardware-hoodie",
    category: "apparel",
    description: "Constructed from 480GSM ultra-dense organic French terry cotton. Custom boxy dropped-shoulder silhouette with silicone puff-print analog oscilloscope graphics across the spine and catalog embroidery on the wrist.",
    is_limited_edition: false,
    edition_total: null,
    includes_instant_digital_album: false,
    garment_specs: {
      fabric: "480GSM Combed Organic French Terry Cotton",
      treatment: "Vintage Mineral Wash with Pre-Shrunk Finish",
      print: "High-Density Puff Ink & Tonal Embroidery",
      fit: "Relaxed Boxy Drop-Shoulder Fit"
    },
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      { id: "var-hoodie-s", sku: "APP-HOD-S", variant_name: "Small", price_cents: 6800, stock_available: 22 },
      { id: "var-hoodie-m", sku: "APP-HOD-M", variant_name: "Medium", price_cents: 6800, stock_available: 35 },
      { id: "var-hoodie-l", sku: "APP-HOD-L", variant_name: "Large", price_cents: 6800, stock_available: 40 },
      { id: "var-hoodie-xl", sku: "APP-HOD-XL", variant_name: "X-Large", price_cents: 6800, stock_available: 18 }
    ]
  },
  {
    id: "merch-poster-screenprint",
    album_id: "alb-nocturne-2026",
    title: "World Tour 2026 Screenprint (Metallic Ink on French Paper)",
    slug: "world-tour-screenprint-poster",
    category: "poster_zine",
    description: "18 x 24 inch 4-color hand-pulled screenprint featuring duotone silver metallic ink and laser crimson pigment on 100lb French Paper Kraft-Tone stock. Hand-signed and numbered by the artist.",
    is_limited_edition: true,
    edition_total: 200,
    copies_remaining: 47,
    includes_instant_digital_album: false,
    images: [
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      { id: "var-pos-std", sku: "POS-WLD-01", variant_name: "18 x 24 Hand-Pulled Print", price_cents: 3500, stock_available: 47 }
    ]
  },
  {
    id: "merch-bundle-era",
    album_id: "alb-nocturne-2026",
    title: "The Nocturne Flagship Era Bundle (Save 15%)",
    slug: "nocturne-era-bundle",
    category: "bundle",
    description: "The complete collector experience: Deluxe 2xLP 180g Oxblood Vinyl + 480GSM Hardware Hoodie + Metallic Tour Screenprint + Instant 24-bit/96kHz Lossless Master Vault Download + VIP Soundcheck Priority Access.",
    is_limited_edition: true,
    edition_total: 100,
    copies_remaining: 14,
    includes_instant_digital_album: true,
    images: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
    ],
    perks: [
      "15% Automatic Savings vs. individual purchase ($141 value for $119)",
      "Instant 24-bit Lossless Digital Vault Token",
      "Guaranteed Low Edition Vinyl Stamping (#001–#100)",
      "Ships with screenprinted canvas tote bag"
    ],
    variants: [
      { id: "var-bun-s", sku: "BUN-NOC-S", variant_name: "Bundle w/ Hoodie Size S", price_cents: 11900, stock_available: 4 },
      { id: "var-bun-m", sku: "BUN-NOC-M", variant_name: "Bundle w/ Hoodie Size M", price_cents: 11900, stock_available: 6 },
      { id: "var-bun-l", sku: "BUN-NOC-L", variant_name: "Bundle w/ Hoodie Size L", price_cents: 11900, stock_available: 4 }
    ]
  }
];

export const INITIAL_LEADERBOARD: CityDemandLeader[] = [
  { city_name: "Manila", country_code: "PH", count: 412, lat: 14.5995, lng: 120.9842 },
  { city_name: "Seoul", country_code: "KR", count: 389, lat: 37.5665, lng: 126.9780 },
  { city_name: "Montreal", country_code: "CA", count: 310, lat: 45.5017, lng: -73.5673 },
  { city_name: "Berlin", country_code: "DE", count: 295, lat: 52.5200, lng: 13.4050 },
  { city_name: "Mexico City", country_code: "MX", count: 270, lat: 19.4326, lng: -99.1332 },
  { city_name: "Taipei", country_code: "TW", count: 242, lat: 25.0330, lng: 121.5654 },
  { city_name: "São Paulo", country_code: "BR", count: 215, lat: -23.5505, lng: -46.6333 },
  { city_name: "Stockholm", country_code: "SE", count: 188, lat: 59.3293, lng: 18.0686 }
];

export const INITIAL_MEDIA: MediaSession[] = [
  {
    id: "vid-kexp-2026",
    title: "Live on KEXP (Full 4-Track Stem & Modular Performance)",
    category: "live_session",
    duration: "26:42",
    date: "2026-10-24",
    poster_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    embed_type: "youtube_facade",
    youtube_id: "dQw4w9WgXcQ",
    chapters: [
      { time: "00:00", title: "Tape Echo Calibration & Intro" },
      { time: "03:40", title: "Glass Cathedral (Live Modular)" },
      { time: "09:15", title: "Anodized Skyline" },
      { time: "15:30", title: "Sequential Prophet-6 Solo" },
      { time: "21:05", title: "Chrome Horizon Acid Jam" }
    ],
    description: "Recorded live in the KEXP Live Room in Seattle. Features 4 synchronized tape delays, real-time vocal harmonizer feedback, and an exclusive unreleased analog modular interlude."
  },
  {
    id: "vid-tokyo-modular",
    title: "Live from Studio 2, Shibuya (Nocturne in Chrome Full Playthrough)",
    category: "studio_session",
    duration: "38:15",
    date: "2026-10-12",
    poster_url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80",
    embed_type: "youtube_facade",
    youtube_id: "M7lc1UVf-VE",
    chapters: [
      { time: "00:00", title: "Hansa 2-Inch Tape Master Playback" },
      { time: "12:40", title: "Stem Isolation Demonstration" },
      { time: "24:18", title: "Analog Synthesis Q&A with Kazu" }
    ],
    description: "An intimate, single-take video stream from Studio 2 in Shibuya showcasing the exact hardware used on the album."
  },
  {
    id: "vid-mv-cathedral",
    title: "Glass Cathedral (Official 4K Music Video directed by A24 Cinema)",
    category: "official_video",
    duration: "04:18",
    date: "2026-10-01",
    poster_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    embed_type: "youtube_facade",
    youtube_id: "3JZ_D3ELwOQ",
    chapters: [
      { time: "00:00", title: "Movement I: Reflection" },
      { time: "02:15", title: "Movement II: Transmission" }
    ],
    description: "Shot on 35mm anamorphic film in Tokyo and Iceland. Directed in collaboration with A24 cinematographers."
  }
];

