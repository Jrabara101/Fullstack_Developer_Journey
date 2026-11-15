import type { DatabaseSync } from 'node:sqlite';

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString();
}

function hoursFromNow(h: number): string {
  return new Date(Date.now() + h * 3600_000).toISOString();
}

export function seedDatabase(db: DatabaseSync): void {
  const existing = db.prepare(`SELECT COUNT(*) as cnt FROM profiles`).get() as { cnt: number };
  if (existing.cnt > 0) return;

  const insertProfile = db.prepare(`
    INSERT INTO profiles (
      id, username, display_name, bio, pronouns, website, location,
      status_emoji, status_text, avatar_url, banner_url, is_private,
      read_receipts_enabled, followers_count, following_count, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const profiles = [
    [
      'user-alex',
      'alex_chen',
      'Alex Chen',
      'Designing tactile interfaces & shooting rainy night geometry. Building tools for creative flow.',
      'he/him',
      'alexchen.studio',
      'San Francisco • Tokyo',
      '🎨',
      'Designing in Tokyo • Listening to Fred again..',
      '/media/avatar-alex.svg',
      '/media/banner-alex.svg',
      0,
      1,
      2840,
      412,
      hoursAgo(2400),
    ],
    [
      'user-maya',
      'maya_lin',
      'Maya Lin',
      'Spatial UI & editorial art director. Obsessed with warm tungsten light, matcha, and clean grids.',
      'she/her',
      'maya.design',
      'Shibuya, Tokyo',
      '☕',
      'Pulling single-origin espresso shots',
      '/media/avatar-maya.svg',
      '/media/banner-maya.svg',
      0,
      1,
      14200,
      612,
      hoursAgo(2200),
    ],
    [
      'user-elena',
      'elena_rostova',
      'Elena Rostova',
      'Architectural photographer & 120mm film enthusiast. Finding quiet geometry in loud cities.',
      'she/her',
      'rostova.photo',
      'Berlin • Kyoto',
      '📷',
      'Scanning fresh Portra 400 rolls',
      '/media/avatar-elena.svg',
      '/media/banner-elena.svg',
      0,
      1,
      9640,
      388,
      hoursAgo(2100),
    ],
    [
      'user-marcus',
      'marcus_vance',
      'Marcus Vance',
      'Modular synth composer & sound designer. Recording tape loops for spatial apps.',
      'he/they',
      'vanceaudio.fm',
      'Brooklyn, NY',
      '🎛️',
      'Patching ambient pads at 118 BPM',
      '/media/avatar-marcus.svg',
      '/media/banner-marcus.svg',
      0,
      1,
      5310,
      295,
      hoursAgo(1900),
    ],
    [
      'user-sora',
      'sora_takahashi',
      'Sora Takahashi',
      'Motion designer & cafe hopper. Documenting Tokyo dawn walks and kinetic typography.',
      'they/them',
      'soramotion.jp',
      'Nakameguro, Tokyo',
      '🎧',
      'Editing new 60fps reel transitions',
      '/media/avatar-sora.svg',
      '/media/banner-sora.svg',
      0,
      1,
      7820,
      540,
      hoursAgo(1700),
    ],
    [
      'user-kai',
      'kai_nakamura',
      'Kai Nakamura',
      'Creative technologist & shader artist. Prototyping WebGPU canvases and generative sound.',
      'he/him',
      'kainakamura.dev',
      'Kyoto, Japan',
      '⚡',
      'Shipping shader experiments',
      '/media/avatar-kai.svg',
      '/media/banner-kai.svg',
      0,
      1,
      4190,
      210,
      hoursAgo(1600),
    ],
    [
      'user-nina',
      'nina_patel',
      'Nina Patel',
      'Design systems lead & Swiss typography collector. Curating quiet digital spaces.',
      'she/her',
      'ninapatel.co',
      'London, UK',
      '📐',
      'Refining tabular numeral scales',
      '/media/avatar-nina.svg',
      '/media/banner-nina.svg',
      0,
      1,
      11500,
      340,
      hoursAgo(1500),
    ],
  ];

  for (const p of profiles) {
    insertProfile.run(...p);
  }

  // Relationships: (follower_id, following_id, status, is_close_friend, created_at)
  const insertRel = db.prepare(`
    INSERT INTO relationships (follower_id, following_id, status, is_close_friend, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const relationships: Array<[string, string, string, number]> = [
    // Mutuals + Close Friends with Alex
    ['user-alex', 'user-maya', 'accepted', 1],
    ['user-maya', 'user-alex', 'accepted', 1],
    ['user-alex', 'user-elena', 'accepted', 1],
    ['user-elena', 'user-alex', 'accepted', 1],
    ['user-alex', 'user-marcus', 'accepted', 0],
    ['user-marcus', 'user-alex', 'accepted', 1],
    // Sora follows Alex (Alex has NOT followed back yet -> Follow Back button!)
    ['user-sora', 'user-alex', 'accepted', 0],
    // Alex follows Nina, Nina doesn't follow Alex yet
    ['user-alex', 'user-nina', 'accepted', 0],
    // Mutual graph among friends for rich "Followed by Elena, Maya..." social proof
    ['user-maya', 'user-kai', 'accepted', 0],
    ['user-elena', 'user-kai', 'accepted', 0],
    ['user-marcus', 'user-kai', 'accepted', 0],
    ['user-maya', 'user-sora', 'accepted', 0],
    ['user-elena', 'user-sora', 'accepted', 0],
    ['user-maya', 'user-elena', 'accepted', 1],
    ['user-elena', 'user-maya', 'accepted', 1],
    ['user-maya', 'user-nina', 'accepted', 0],
    ['user-elena', 'user-nina', 'accepted', 0],
  ];

  for (const [f1, f2, status, cf] of relationships) {
    insertRel.run(f1, f2, status, cf, hoursAgo(720));
  }

  // Posts
  const insertPost = db.prepare(`
    INSERT INTO posts (
      id, author_id, co_author_id, caption, media_items, quote_card, voice_note,
      poll, tags, location, audio_title, audience, reply_policy, hide_like_count,
      likes_count, comments_count, reposts_count, is_pinned, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertPost.run(
    'post-1',
    'user-maya',
    'user-elena',
    'Late-night Shibuya walk turned into a 3-stop photo dump with @elena_rostova. Wet asphalt reflections + ceramic espresso + warm vinyl spin. #TokyoNights #DesignCraft',
    JSON.stringify([
      {
        url: '/media/post-shibuya-night.svg',
        type: 'image',
        width: 800,
        height: 1000,
        alt: 'Rainy neon reflections in Shibuya crosswalk',
        tagged_users: [
          { username: 'elena_rostova', display_name: 'Elena Rostova', x: 34, y: 58 },
          { username: 'alex_chen', display_name: 'Alex Chen', x: 66, y: 42 },
        ],
      },
      {
        url: '/media/post-shibuya-cafe.svg',
        type: 'image',
        width: 800,
        height: 1000,
        alt: 'Warm ceramic coffee cup under pendant lamp',
      },
      {
        url: '/media/post-shibuya-vinyl.svg',
        type: 'image',
        width: 800,
        height: 1000,
        alt: 'Turntable spinning sunset orange vinyl',
      },
    ]),
    null,
    null,
    null,
    JSON.stringify(['TokyoNights', 'DesignCraft', 'StreetPhotography']),
    'Shibuya, Tokyo',
    'Fred again.. — Delilah (pull me out of this)',
    'public',
    'everyone',
    0,
    1284,
    3,
    46,
    1,
    hoursAgo(2)
  );

  insertPost.run(
    'post-2',
    'user-alex',
    null,
    'Dialed in the obsidian desk setup for late-night prototyping. Keeping chrome whisper-quiet so content and lighting breathe. #MinimalSetup #ProductDesign',
    JSON.stringify([
      {
        url: '/media/post-desk-setup.svg',
        type: 'image',
        width: 1200,
        height: 750,
        alt: 'Obsidian dark mode studio workstation',
      },
      {
        url: '/media/post-desk-sketch.svg',
        type: 'image',
        width: 1200,
        height: 750,
        alt: 'Grid wireframe sketchbook and tactile desk accessories',
      },
    ]),
    null,
    null,
    null,
    JSON.stringify(['MinimalSetup', 'ProductDesign', 'Workspace']),
    'San Francisco Studio',
    '',
    'public',
    'everyone',
    0,
    842,
    2,
    19,
    1,
    hoursAgo(5)
  );

  insertPost.run(
    'post-3',
    'user-marcus',
    null,
    'Recorded a quick 30-second modular synth texture right off the Eurorack skiff. Scrub the waveform if you want to hear the harmonic shimmer in the second half. #SoundDesign #ModularSynth',
    JSON.stringify([
      {
        url: '/media/post-synth-patch.svg',
        type: 'image',
        width: 800,
        height: 1000,
        alt: 'Eurorack modular synth patch cables and waveform monitor',
      },
    ]),
    JSON.stringify({
      text: 'Warm analog saturation makes digital interfaces feel alive.',
      accent: 'cobalt',
      attribution: 'Studio Session #14',
    }),
    JSON.stringify({
      url: '/media/voice-marcus-synth.wav',
      duration_ms: 6000,
      waveform: [
        24, 38, 62, 48, 84, 92, 56, 44, 72, 88, 96, 65, 50, 78, 91, 60,
        40, 68, 86, 94, 72, 54, 80, 90, 58, 42, 64, 76, 52, 36, 28, 22,
      ],
      title: 'Midnight Eurorack Pad (118 BPM)',
    }),
    null,
    JSON.stringify(['SoundDesign', 'ModularSynth', 'AudioCraft']),
    'Brooklyn, NY',
    'Original Audio • Marcus Vance',
    'public',
    'everyone',
    0,
    519,
    1,
    28,
    0,
    hoursAgo(8)
  );

  insertPost.run(
    'post-4',
    'user-maya',
    null,
    'Inner circle rooftop dusk check-in 💚 Testing out a slower evening routine away from notifications. Drop what you are listening to tonight.',
    JSON.stringify([
      {
        url: '/media/post-rooftop-dusk.svg',
        type: 'image',
        width: 800,
        height: 1000,
        alt: 'Sunset gradient over city skyline silhouette',
      },
    ]),
    null,
    null,
    null,
    JSON.stringify(['CloseFriends', 'GoldenHour']),
    'Daikanyama Rooftop',
    '',
    'close_friends',
    'mutuals',
    0,
    64,
    1,
    2,
    0,
    hoursAgo(10)
  );

  insertPost.run(
    'post-5',
    'user-sora',
    null,
    '60fps shader loops & Shibuya dawn motion tests. Built a custom procedural gradient pass for our ambient story backdrop. #MotionDesign #Reels',
    JSON.stringify([
      {
        url: '/media/reel-tokyo-motion.mp4',
        type: 'video',
        width: 720,
        height: 900,
        alt: 'Animated neon gradient motion loop',
      },
    ]),
    null,
    null,
    null,
    JSON.stringify(['MotionDesign', 'Reels', 'CreativeCoding']),
    'Nakameguro, Tokyo',
    'Ambient Pulse — Sora Edit',
    'public',
    'everyone',
    0,
    935,
    1,
    37,
    0,
    hoursAgo(12)
  );

  insertPost.run(
    'post-6',
    'user-elena',
    null,
    'Afternoon sun cutting through raw concrete at the pavilion. Kept like counts hidden on this series — curious how silence changes the way you sit with a photograph. #Architecture #AnalogFilm',
    JSON.stringify([
      {
        url: '/media/post-gallery-sun.svg',
        type: 'image',
        width: 800,
        height: 1000,
        alt: 'Sunlit concrete gallery beam and minimal frame',
      },
      {
        url: '/media/post-kyoto-bamboo.svg',
        type: 'image',
        width: 800,
        height: 1000,
        alt: 'Misty Kyoto cedar and bamboo courtyard',
      },
    ]),
    null,
    null,
    null,
    JSON.stringify(['Architecture', 'AnalogFilm', 'QuietDesign']),
    'Berlin Pavilion',
    '',
    'public',
    'mutuals',
    1,
    412,
    1,
    14,
    1,
    hoursAgo(15)
  );

  insertPost.run(
    'post-7',
    'user-nina',
    null,
    'Quick typography craft poll for our next Design Systems kit: which tabular monospace pairing reads sharpest on OLED dark surfaces? #DesignSystems #Typography',
    JSON.stringify([
      {
        url: '/media/post-type-specimen.svg',
        type: 'image',
        width: 800,
        height: 1000,
        alt: 'Swiss editorial typography grid specimen poster',
      },
    ]),
    null,
    null,
    JSON.stringify({
      question: 'Best tabular pairing for real-time dashboards?',
      options: [
        { id: 'opt-1', label: 'Inter + JetBrains Mono', votes: 142 },
        { id: 'opt-2', label: 'Plus Jakarta + Geist Mono', votes: 98 },
        { id: 'opt-3', label: 'SF Pro + Berkeley Mono', votes: 76 },
      ],
    }),
    JSON.stringify(['DesignSystems', 'Typography', 'UIEngineering']),
    'London Studio',
    '',
    'public',
    'everyone',
    0,
    604,
    1,
    22,
    0,
    hoursAgo(19)
  );

  insertPost.run(
    'post-8',
    'user-kai',
    null,
    'Morning light hitting the Kyoto moss garden before anyone else arrived. Zero filters, pure morning mist. #Kyoto #DesignSystems',
    JSON.stringify([
      {
        url: '/media/post-kyoto-bamboo.svg',
        type: 'image',
        width: 800,
        height: 1000,
        alt: 'Misty emerald bamboo grove in Kyoto',
      },
    ]),
    null,
    null,
    null,
    JSON.stringify(['Kyoto', 'MorningWalk']),
    'Arashiyama, Kyoto',
    '',
    'public',
    'everyone',
    0,
    388,
    0,
    9,
    0,
    hoursAgo(22)
  );

  // Post likes & bookmarks
  const insertLike = db.prepare(`INSERT INTO post_likes (post_id, user_id, created_at) VALUES (?, ?, ?)`);
  insertLike.run('post-1', 'user-alex', hoursAgo(1));
  insertLike.run('post-6', 'user-alex', hoursAgo(3));

  const insertCollection = db.prepare(
    `INSERT INTO saved_collections (id, owner_id, name, is_public, created_at) VALUES (?, ?, ?, ?, ?)`
  );
  insertCollection.run('col-tokyo', 'user-alex', 'Tokyo Inspo', 1, hoursAgo(500));
  insertCollection.run('col-ui', 'user-alex', 'UI Systems & Type', 0, hoursAgo(400));

  const insertBookmark = db.prepare(
    `INSERT INTO post_bookmarks (post_id, user_id, collection_id, created_at) VALUES (?, ?, ?, ?)`
  );
  insertBookmark.run('post-1', 'user-alex', 'col-tokyo', hoursAgo(1));
  insertBookmark.run('post-7', 'user-alex', 'col-ui', hoursAgo(6));

  // Comments (with pinned comments)
  const insertComment = db.prepare(`
    INSERT INTO comments (id, post_id, author_id, content, is_pinned, likes_count, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertComment.run(
    'cmt-1',
    'post-1',
    'user-elena',
    'Best night walk all trip — that espresso shop near Dogenzaka saved us from the downpour!',
    1,
    34,
    hoursAgo(1.8)
  );
  insertComment.run(
    'cmt-2',
    'post-1',
    'user-alex',
    'The neon reflections on slide 1 look unreal. What shutter speed did you shoot at?',
    0,
    18,
    hoursAgo(1.2)
  );
  insertComment.run(
    'cmt-3',
    'post-1',
    'user-marcus',
    'That turntable shot belongs on an album sleeve.',
    0,
    11,
    hoursAgo(0.8)
  );
  insertComment.run(
    'cmt-4',
    'post-2',
    'user-maya',
    'Obsidian border contrast is super clean. Love the desk mat texture.',
    1,
    21,
    hoursAgo(4)
  );
  insertComment.run(
    'cmt-5',
    'post-2',
    'user-nina',
    'The spacing on that dual-pane layout feels effortless.',
    0,
    9,
    hoursAgo(3)
  );
  insertComment.run(
    'cmt-6',
    'post-3',
    'user-alex',
    'Those fifth harmonics at 0:04 hit so smoothly.',
    1,
    12,
    hoursAgo(7)
  );
  insertComment.run(
    'cmt-7',
    'post-4',
    'user-alex',
    'Spinning Four Tet & Fred again.. out on the balcony right now.',
    0,
    5,
    hoursAgo(9)
  );
  insertComment.run(
    'cmt-8',
    'post-5',
    'user-kai',
    'Love the procedural sine color mixing here!',
    0,
    15,
    hoursAgo(11)
  );
  insertComment.run(
    'cmt-9',
    'post-6',
    'user-maya',
    'Shadow angle in frame 1 is perfection.',
    1,
    14,
    hoursAgo(14)
  );
  insertComment.run(
    'cmt-10',
    'post-7',
    'user-alex',
    'Inter + JetBrains Mono with tabular-nums every time.',
    1,
    27,
    hoursAgo(18)
  );

  // Stories (active + archived + highlights)
  const insertStory = db.prepare(`
    INSERT INTO stories (
      id, author_id, media_url, media_type, duration_ms, audience, caption,
      music_track, interactive_widget, highlight_title, expires_at,
      is_highlighted, is_archived, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Maya's 3 active slides (2 public, 1 close_friends)
  insertStory.run(
    'story-maya-1',
    'user-maya',
    '/media/story-coffee-setup.svg',
    'image',
    5500,
    'public',
    'Dialing in Ethiopian natural pour-over before studio standup ☕',
    JSON.stringify({ title: 'Everything Is Recorded', artist: 'Sampha' }),
    JSON.stringify({
      kind: 'poll',
      question: 'Morning ritual fuel?',
      options: [
        { id: 'p1', label: 'V60 Pour-over', votes: 48 },
        { id: 'p2', label: 'Iced Matcha Oat', votes: 39 },
      ],
    }),
    'Studio',
    hoursFromNow(18),
    1,
    0,
    hoursAgo(6)
  );

  insertStory.run(
    'story-maya-2',
    'user-maya',
    '/media/story-tokyo-rain.svg',
    'image',
    5500,
    'public',
    'Rainy crosswalk glow right outside the Shibuya office',
    JSON.stringify({ title: 'Delilah (pull me out of this)', artist: 'Fred again..' }),
    null,
    "Japan '26",
    hoursFromNow(20),
    1,
    0,
    hoursAgo(4)
  );

  insertStory.run(
    'story-maya-3',
    'user-maya',
    '/media/story-close-friends.svg',
    'image',
    5500,
    'close_friends',
    'Secret rooftop acoustic session tonight — DM if you want the door code 💚',
    null,
    null,
    null,
    hoursFromNow(21),
    0,
    0,
    hoursAgo(3)
  );

  // Elena's 2 active slides (one with Emoji Sentiment Slider)
  insertStory.run(
    'story-elena-1',
    'user-elena',
    '/media/story-arch-walk.svg',
    'image',
    5500,
    'public',
    'Caught this 4pm light shaft cutting across the concrete gallery',
    null,
    JSON.stringify({
      kind: 'slider',
      prompt: 'Rate this natural light beam',
      emoji: '🔥',
      average: 86,
      votes: 34,
    }),
    'Architecture',
    hoursFromNow(17),
    1,
    0,
    hoursAgo(7)
  );

  insertStory.run(
    'story-elena-2',
    'user-elena',
    '/media/story-studio-wip.svg',
    'image',
    5000,
    'public',
    'Laying out the new monochrome print zine',
    null,
    null,
    null,
    hoursFromNow(19),
    0,
    0,
    hoursAgo(5)
  );

  // Sora's active story with "Add Yours" prompt chain
  insertStory.run(
    'story-sora-1',
    'user-sora',
    '/media/story-tokyo-rain.svg',
    'image',
    6000,
    'public',
    '9AM desk light & cold brew check-in',
    null,
    JSON.stringify({
      kind: 'add_yours',
      prompt: 'Show your 9AM creative setup',
      chain_id: 'chain-9am-setup',
      participants: [
        { username: 'sora_takahashi', avatar_url: '/media/avatar-sora.svg' },
        { username: 'maya_lin', avatar_url: '/media/avatar-maya.svg' },
        { username: 'elena_rostova', avatar_url: '/media/avatar-elena.svg' },
      ],
      total_count: 19,
    }),
    null,
    hoursFromNow(22),
    0,
    0,
    hoursAgo(2)
  );

  // Marcus's active video story
  insertStory.run(
    'story-marcus-1',
    'user-marcus',
    '/media/reel-studio-loop.mp4',
    'video',
    4500,
    'public',
    'Warm synth shimmer test in Ableton + hardware rack',
    JSON.stringify({ title: 'Analog Drift #04', artist: 'Marcus Vance' }),
    null,
    'Audio Lab',
    hoursFromNow(20),
    1,
    0,
    hoursAgo(4)
  );

  // Expired story by Maya preserved as Highlight + DM snapshot reference!
  insertStory.run(
    'story-maya-expired',
    'user-maya',
    '/media/post-shibuya-night.svg',
    'image',
    5000,
    'public',
    'Rainy crosswalk neon frames from Tuesday night',
    null,
    null,
    "Japan '26",
    hoursAgo(4),
    1,
    1,
    hoursAgo(28)
  );

  // Alex's permanent Story Highlights (so Alex's Profile Studio showcases Highlights immediately!)
  insertStory.run(
    'story-alex-hl-1',
    'user-alex',
    '/media/story-studio-wip.svg',
    'image',
    5000,
    'public',
    'Refining dark-mode tokens & tactile micro-springs',
    null,
    null,
    'UI Craft',
    hoursAgo(120),
    1,
    1,
    hoursAgo(144)
  );

  insertStory.run(
    'story-alex-hl-2',
    'user-alex',
    '/media/story-tokyo-rain.svg',
    'image',
    5000,
    'public',
    'Shibuya rainy street study',
    null,
    null,
    'Tokyo',
    hoursAgo(72),
    1,
    1,
    hoursAgo(96)
  );

  // Direct Messaging Conversations & Messages
  const insertConv = db.prepare(`
    INSERT INTO conversations (id, theme_accent, is_request, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  const insertPart = db.prepare(`
    INSERT INTO conversation_participants (conversation_id, user_id, is_muted, last_read_at)
    VALUES (?, ?, ?, ?)
  `);
  const insertMsg = db.prepare(`
    INSERT INTO messages (
      id, client_msg_id, conversation_id, sender_id, content, media_url, media_type,
      voice_duration_ms, voice_waveform, reply_to_message_id, reply_to_story_id,
      story_snapshot, shared_post_id, reactions, read_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Conv 1: Alex <-> Maya (Story-Reply thumbnail, Shared Playable Post Card, Voice Note, Reactions!)
  insertConv.run('conv-maya', 'cobalt', 0, hoursAgo(48), hoursAgo(0.1));
  insertPart.run('conv-maya', 'user-alex', 0, hoursAgo(0.5));
  insertPart.run('conv-maya', 'user-maya', 0, hoursAgo(0.1));

  insertMsg.run(
    'msg-1',
    '11111111-1111-4111-8111-111111111101',
    'conv-maya',
    'user-alex',
    '🔥 That neon reflection framing is insane! What lens did you bring?',
    null,
    null,
    null,
    null,
    null,
    'story-maya-expired',
    JSON.stringify({
      story_id: 'story-maya-expired',
      author_username: 'maya_lin',
      media_url: '/media/post-shibuya-night.svg',
      caption: 'Rainy crosswalk neon frames from Tuesday night',
      expired: true,
    }),
    null,
    JSON.stringify({ '❤️': ['user-maya'] }),
    hoursAgo(27),
    hoursAgo(27.5)
  );

  insertMsg.run(
    'msg-2',
    '11111111-1111-4111-8111-111111111102',
    'conv-maya',
    'user-maya',
    '35mm f/1.4! Honestly the wet pavement did 90% of the work. Also listen to this quick voice memo about Saturday:',
    null,
    null,
    null,
    null,
    'msg-1',
    null,
    null,
    null,
    JSON.stringify({ '🔥': ['user-alex'] }),
    hoursAgo(20),
    hoursAgo(22)
  );

  insertMsg.run(
    'msg-3',
    '11111111-1111-4111-8111-111111111103',
    'conv-maya',
    'user-maya',
    'Voice memo • Studio rooftop plans',
    '/media/voice-maya-note.wav',
    'audio',
    5000,
    JSON.stringify([
      20, 45, 76, 62, 88, 95, 52, 38, 70, 84, 90, 64, 42, 74, 82, 58,
      36, 68, 91, 78, 49, 63, 85, 72, 46, 30, 54, 68, 40, 28, 22, 18,
    ]),
    null,
    null,
    null,
    null,
    JSON.stringify({ '👏': ['user-alex'] }),
    hoursAgo(4),
    hoursAgo(5)
  );

  insertMsg.run(
    'msg-4',
    '11111111-1111-4111-8111-111111111104',
    'conv-maya',
    'user-alex',
    'Just saw Elena’s pavilion shadows — check out frame 2 in this carousel!',
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    'post-6',
    JSON.stringify({ '😍': ['user-maya'] }),
    hoursAgo(1),
    hoursAgo(1.2)
  );

  insertMsg.run(
    'msg-5',
    '11111111-1111-4111-8111-111111111105',
    'conv-maya',
    'user-maya',
    'Wait that light beam in slide 1 is Unreal. Are you swinging by the gallery after 5?',
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    JSON.stringify({}),
    null,
    hoursAgo(0.15)
  );

  // Conv 2: Alex <-> Elena (Unread message!)
  insertConv.run('conv-elena', 'emerald', 0, hoursAgo(30), hoursAgo(0.4));
  insertPart.run('conv-elena', 'user-alex', 0, hoursAgo(3));
  insertPart.run('conv-elena', 'user-elena', 0, hoursAgo(0.4));

  insertMsg.run(
    'msg-6',
    '11111111-1111-4111-8111-111111111106',
    'conv-elena',
    'user-elena',
    'Sent over the 120mm scans from Kyoto — let me know which frame you want for the co-authored cover.',
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    JSON.stringify({}),
    null,
    hoursAgo(0.4)
  );

  // Conv 3: Alex <-> Marcus
  insertConv.run('conv-marcus', 'violet', 0, hoursAgo(16), hoursAgo(3));
  insertPart.run('conv-marcus', 'user-alex', 0, hoursAgo(3));
  insertPart.run('conv-marcus', 'user-marcus', 0, hoursAgo(3));

  insertMsg.run(
    'msg-7',
    '11111111-1111-4111-8111-111111111107',
    'conv-marcus',
    'user-marcus',
    'Dropped the raw Eurorack stem into the feed post — feel free to sample it for your prototype reel!',
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    'post-3',
    JSON.stringify({ '🔥': ['user-alex'] }),
    hoursAgo(2.5),
    hoursAgo(3)
  );

  // Conv 4: Message Request from Kai
  insertConv.run('conv-kai', 'sunset', 1, hoursAgo(12), hoursAgo(2));
  insertPart.run('conv-kai', 'user-alex', 0, null);
  insertPart.run('conv-kai', 'user-kai', 0, hoursAgo(2));

  insertMsg.run(
    'msg-8',
    '11111111-1111-4111-8111-111111111108',
    'conv-kai',
    'user-kai',
    'Hey Alex! Maya mentioned you were experimenting with glassmorphic canvas blur in Tokyo — would love to compare shader notes.',
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    JSON.stringify({}),
    null,
    hoursAgo(2)
  );

  // Notifications
  const insertNotif = db.prepare(`
    INSERT INTO notifications (id, recipient_id, actor_id, type, entity_id, preview_text, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertNotif.run(
    'notif-1',
    'user-alex',
    'user-maya',
    'comment',
    'post-2',
    'commented: "Obsidian border contrast is super clean. Love the desk mat texture."',
    0,
    hoursAgo(0.5)
  );
  insertNotif.run(
    'notif-2',
    'user-alex',
    'user-sora',
    'follow',
    null,
    'started following you',
    0,
    hoursAgo(1.5)
  );
  insertNotif.run(
    'notif-3',
    'user-alex',
    'user-elena',
    'co_author',
    'post-1',
    'tagged you in Shibuya walk photo dump',
    0,
    hoursAgo(2)
  );
  insertNotif.run(
    'notif-4',
    'user-alex',
    'user-marcus',
    'like',
    'post-2',
    'liked your studio desk setup carousel',
    1,
    hoursAgo(4)
  );
}

