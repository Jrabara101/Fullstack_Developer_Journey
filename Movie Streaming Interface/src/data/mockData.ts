import { MediaItem, UserProfile } from '../types';

export const HOUSEHOLD_PROFILES: UserProfile[] = [
  {
    id: 'alex',
    name: 'Alex',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    color: '#3B82F6',
    bio: 'Tech lead who loves hard sci-fi, mind-twisting thrillers, and cerebral world-building.',
    preferences: {
      favoriteGenres: ['Sci-Fi', 'Tech Thriller', 'Cyberpunk', 'Mystery'],
      preferredPacing: ['Slow-Burn Mystery', 'Edge-of-Seat'],
      typicalCognitiveLoad: 'Requires Full Attention',
    },
    watchedIds: ['chrono-shift', 'cyber-hustle', 'kitchen-rush']
  },
  {
    id: 'sam',
    name: 'Sam',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
    color: '#EC4899',
    bio: 'Product designer obsessed with sharp dialogue, psychological tension, and dark satire.',
    preferences: {
      favoriteGenres: ['Psychological Noir', 'Dark Comedy', 'Crime Drama', 'A24'],
      preferredPacing: ['Dialogue-Heavy', 'Tense Chamber Piece'],
      typicalCognitiveLoad: 'Requires Full Attention',
    },
    watchedIds: ['boardroom-protocol', 'subtle-vengeance', 'midnight-relay']
  },
  {
    id: 'jordan',
    name: 'Jordan',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
    color: '#10B981',
    bio: 'Chef & fitness junkie looking for light-hearted comfort, snappy comedies, and fast pacing.',
    preferences: {
      favoriteGenres: ['Action Comedy', 'Sitcom', 'Food Travel', 'High-Octane'],
      preferredPacing: ['Fast-Paced', 'Breezy & Warm'],
      typicalCognitiveLoad: 'Background-Friendly',
    },
    watchedIds: ['taco-rebellion', 'office-mayhem']
  },
  {
    id: 'maya',
    name: 'Maya',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80',
    color: '#F59E0B',
    bio: 'Docu-filmmaker drawn to international cinema, sprawling epics, and immersive soundscapes.',
    preferences: {
      favoriteGenres: ['Historical Epic', 'Indie Cinema', 'Documentary', 'Foreign Language'],
      preferredPacing: ['Atmospheric Epics', 'Poetic Realism'],
      typicalCognitiveLoad: 'Subtitles Recommended',
    },
    watchedIds: ['arctic-silent', 'chrono-shift']
  }
];

export const MEDIA_CATALOG: MediaItem[] = [
  // 1. HERO TITLE: SIGNAL ZERO
  {
    id: 'signal-zero',
    title: 'SIGNAL ZERO',
    type: 'movie',
    tagline: 'When the deep satellite array goes dark, humanity gets a 2-hour warning.',
    editorialHook: 'A claustrophobic sci-fi thriller where every ticking minute counts.',
    synopsis: 'A deep-space communications specialist stationed alone in an automated orbital outpost intercepts a synchronized transmission bouncing back from Earth—dated three hours in the future.',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=85',
    dominantColor: '#38BDF8', // Cyan / Deep Space
    durationMinutes: 114, // 1h 54m
    releaseYear: 2026,
    maturityRating: '16+',
    pacingTags: ['Edge-of-Seat', 'Slow-Burn Mystery', 'Claustrophobic Tension', 'Mind-Bending'],
    cognitiveLoad: 'Requires Full Attention',
    categories: ['household-top10', 'weekend-epics', 'mind-benders'],
    timeBucket: 'under90',
    moods: ['mind-bending', 'adrenaline'],
    isTop10: 1,
    cast: ['Elena Rostova', 'Marcus Vance', 'David Chen'],
    director: 'Kaelen Thorne',
    matchScores: { alex: 98, sam: 94, jordan: 71, maya: 92 },
    matchReason: '98% Match • Because you liked dark workplace satires and tense orbital thrillers',
    criticScore: 94,
    audienceScore: 91,
    pacingProfile: {
      dialogueVsAction: 55,
      tensionCurve: [25, 45, 65, 88, 98],
      intensityLevel: 'Intense',
      pacingNote: 'Relentless slow-burn that escalates sharply every 20 minutes with zero filler.'
    }
  },

  // 2. HERO CANDIDATE 2: THE MIDNIGHT AUDIT
  {
    id: 'midnight-audit',
    title: 'THE MIDNIGHT AUDIT',
    type: 'movie',
    tagline: 'In high finance, the body count is hidden in the decimal points.',
    editorialHook: 'A razor-sharp corporate chess match where whispered threats hit harder than gunfire.',
    synopsis: 'When an internal auditor discovers an algorithmic money-drain inside Manhattan’s largest investment firm on Christmas Eve, the executive board locks the 48th floor and initiates a silent purge.',
    backdropUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb325?auto=format&fit=crop&w=1920&q=85',
    dominantColor: '#F59E0B', // Amber Gold
    durationMinutes: 102, // 1h 42m
    releaseYear: 2025,
    maturityRating: '18+',
    pacingTags: ['Dialogue-Heavy', 'Fast-Paced', 'Dark Workplace Satire', 'High Stakes'],
    cognitiveLoad: 'Requires Full Attention',
    categories: ['90min-brainoff', 'household-top10', 'mind-benders'],
    timeBucket: 'under90',
    moods: ['mind-bending', 'adrenaline', 'prestige'],
    isTop10: 2,
    cast: ['Sterling K. Brooks', 'Camilla Ward', 'Henrik Lindqvist'],
    director: 'Sofia Aris',
    matchScores: { alex: 92, sam: 99, jordan: 64, maya: 89 },
    matchReason: '99% Match for Sam • Razor-sharp banter with ruthless power dynamics',
    criticScore: 96,
    audienceScore: 89,
    pacingProfile: {
      dialogueVsAction: 85,
      tensionCurve: [40, 60, 75, 85, 96],
      intensityLevel: 'Relentless',
      pacingNote: 'Dense, rapid-fire dialogue where every conversation carries lethal career consequences.'
    }
  },

  // 3. HERO CANDIDATE 3: SOLSTICE PROTOCOL
  {
    id: 'solstice-protocol',
    title: 'SOLSTICE PROTOCOL',
    type: 'series',
    tagline: 'The sun set over Svalbard. It hasn’t come back up.',
    editorialHook: 'Nordic noir meets cosmic dread in the freezing perpetual night.',
    synopsis: 'An international team of glaciologists drilling into subterranean ice fissures in Northern Norway unearth a crystalline anomaly that emits an infrared pulse synchronized with human REM cycles.',
    backdropUrl: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1920&q=85',
    dominantColor: '#818CF8', // Indigo
    durationMinutes: 52,
    totalEpisodes: 8,
    releaseYear: 2026,
    maturityRating: '16+',
    pacingTags: ['Slow-Burn Mystery', 'Atmospheric Epics', 'Chilling Score', 'Unpredictable'],
    cognitiveLoad: 'Subtitles Recommended',
    categories: ['weekend-epics', 'household-top10', 'dinner-friendly'],
    timeBucket: 'under90',
    moods: ['mind-bending', 'prestige'],
    isTop10: 3,
    cast: ['Astrid Berg', 'Jonas Dahl', 'Clara Moreau'],
    director: 'Lukas Vinterberg',
    matchScores: { alex: 96, sam: 92, jordan: 58, maya: 97 },
    matchReason: '96% Match • Visually breathtaking, high-tension Scandinavian mystery',
    criticScore: 92,
    audienceScore: 94,
    pacingProfile: {
      dialogueVsAction: 50,
      tensionCurve: [20, 35, 55, 75, 90],
      intensityLevel: 'Moderate',
      pacingNote: 'Meditative and haunting pacing punctuated by chilling discoveries.'
    }
  },

  // 4. CONTINUE WATCHING: CHRONO-SHIFT
  {
    id: 'chrono-shift',
    title: 'CHRONO-SHIFT',
    type: 'series',
    tagline: 'Change thirty seconds. Pay for thirty years.',
    editorialHook: 'The time-travel mystery that actually respects causality and heartbreak.',
    synopsis: 'A grieving quantum physicist builds a desktop particle ring that can send micro-messages precisely 30 seconds into the past—triggering an avalanche of compounding split-second realities.',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=85',
    dominantColor: '#A855F7', // Purple
    durationMinutes: 48,
    totalEpisodes: 10,
    releaseYear: 2025,
    maturityRating: '16+',
    pacingTags: ['Mind-Bending', 'High Emotional Stakes', 'Twisty Paradoxes'],
    cognitiveLoad: 'Requires Full Attention',
    categories: ['household-top10', 'mind-benders'],
    timeBucket: 'under90',
    moods: ['mind-bending', 'adrenaline'],
    isTop10: 4,
    cast: ['Elijah Sterling', 'Hannah Vance', 'Tariq Al-Mansoor'],
    director: 'Nadia Solis',
    matchScores: { alex: 97, sam: 93, jordan: 75, maya: 84 },
    matchReason: '97% Match • Pick up right where you left off before Act 3 unfolds',
    criticScore: 91,
    audienceScore: 93,
    progress: {
      progressSeconds: 2280, // 38 mins into 48m ep
      lastWatchedDaysAgo: 9, // Left unfinished for over a week!
      currentEpisode: 'S1:E5 "The Second Loop"',
      totalEpisodes: 10,
      episodesLeft: 5,
      checkpoints: [
        {
          timestampSeconds: 600,
          actName: 'Act 1: The First Jump',
          bullets: [
            'Elijah successfully transmits the warning string to prevent the laboratory blackout.',
            'Hannah notices the secondary monitor display showing anomalous thermal dissipation.',
            'A mysterious red vehicle parks across the street from Elijah’s apartment window.'
          ]
        },
        {
          timestampSeconds: 1500,
          actName: 'Act 2: The Erased Conversation',
          bullets: [
            'Hannah discovers that her phone call with Tariq never happened in the updated timeline.',
            'Tariq reveals the surveillance footage showing Elijah speaking to a duplicate version of himself in the alley.',
            'The desktop ring begins humming continuously, drawing power from the city municipal grid without permission.'
          ]
        },
        {
          timestampSeconds: 2280,
          actName: 'Act 3 (Your Current Pause Point): The Perimeter Breach',
          bullets: [
            'Federal inspectors arrive at the loading dock claiming a high-frequency grid interference complaint.',
            'Elijah tries to initiate an emergency wipe of the ring’s drive, but the countdown freezes at 00:04.',
            'Hannah receives an encrypted voice message from Tariq—recorded 4 minutes in the future!'
          ]
        }
      ]
    },
    pacingProfile: {
      dialogueVsAction: 60,
      tensionCurve: [30, 50, 70, 85, 95],
      intensityLevel: 'Intense',
      pacingNote: 'Each episode is structured like a ticking time-bomb puzzle.'
    }
  },

  // 5. CONTINUE WATCHING: KITCHEN RUSH
  {
    id: 'kitchen-rush',
    title: 'KITCHEN RUSH: TOKYO HEAT',
    type: 'series',
    tagline: 'Service starts in 10 minutes. Orders are already backed up.',
    editorialHook: 'Frenetic, sizzling, high-stress culinary drama with an incredible soundtrack.',
    synopsis: 'A disgraced Michelin-starred sous chef relocates to an alleyway yakitori bar in Shinjuku, racing against loan sharks and perfectionist food critics during the rainiest autumn on record.',
    backdropUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1920&q=85',
    dominantColor: '#EF4444', // Red
    durationMinutes: 28,
    totalEpisodes: 8,
    releaseYear: 2026,
    maturityRating: '16+',
    pacingTags: ['Edge-of-Seat', 'Fast-Paced', 'Sensory Overload', 'Mouthwatering'],
    cognitiveLoad: 'Requires Full Attention',
    categories: ['fast-laughs', 'dinner-friendly', 'household-top10'],
    timeBucket: 'under30',
    moods: ['adrenaline', 'laugh'],
    isTop10: 5,
    cast: ['Kenji Sato', 'Renka Mori', 'Takeshi Noda'],
    director: 'Shinji Oshima',
    matchScores: { alex: 89, sam: 95, jordan: 92, maya: 88 },
    matchReason: '95% Match • High bpm culinary adrenaline with incredible food cinematography',
    criticScore: 98,
    audienceScore: 96,
    progress: {
      progressSeconds: 1140, // 19m into 28m
      lastWatchedDaysAgo: 14,
      currentEpisode: 'S2:E3 "A5 Smoke"',
      totalEpisodes: 8,
      episodesLeft: 5,
      checkpoints: [
        {
          timestampSeconds: 400,
          actName: 'Act 1: The Charcoal Shortage',
          bullets: [
            'The delivery of specialty binchotan charcoal is delayed due to flash street flooding in Shinjuku.',
            'Kenji decides to improvise with reclaimed applewood casks, infuriating master griller Takeshi.',
            'VIP reservations flood the terminal 15 minutes ahead of schedule.'
          ]
        },
        {
          timestampSeconds: 1140,
          actName: 'Act 2 (Where You Left Off): The Critic Enters',
          bullets: [
            'Renka flags Table 4: Japan’s most dreaded food columnist has quietly seated herself in the corner booth.',
            'Takeshi drops the skewered wagyu onto the ceramic grill rim, igniting an uncontrollable grease flare.',
            'Kenji must decide whether to throw away the final reserve skewer or salvage the searing technique in 30 seconds!'
          ]
        }
      ]
    },
    pacingProfile: {
      dialogueVsAction: 35,
      tensionCurve: [50, 75, 90, 95, 100],
      intensityLevel: 'Relentless',
      pacingNote: 'Zero breathers. Designed to get your heart rate up before dinner is plated.'
    }
  },

  // 6. 90-MINUTE BRAIN-OFF MOVIES: OVERDRIVE NEON
  {
    id: 'overdrive-neon',
    title: 'OVERDRIVE NEON',
    type: 'movie',
    tagline: '120 miles of straight desert highway. 3 armed convoys. No brakes.',
    editorialHook: 'Glorious, high-octane 88-minute popcorn action that demands zero brain power.',
    synopsis: 'A freelance getaway courier in 1990s Nevada agrees to transport a locked aluminum briefcase across Death Valley while pursued by rival syndicate helicopters and synthesizer-fueled synthwave beats.',
    backdropUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1920&q=85',
    dominantColor: '#F43F5E', // Rose / Neon
    durationMinutes: 88, // 1h 28m
    releaseYear: 2025,
    maturityRating: '16+',
    pacingTags: ['Fast-Paced', 'Edge-of-Seat', 'Brain-Off Thrill', 'Synthwave Score'],
    cognitiveLoad: 'Background-Friendly',
    categories: ['90min-brainoff', 'dinner-friendly'],
    timeBucket: 'under90',
    moods: ['adrenaline', 'background'],
    cast: ['Jaxson Stone', 'Mira Bell', 'Victor Cruz'],
    director: 'Chase Reynolds',
    matchScores: { alex: 74, sam: 78, jordan: 97, maya: 65 },
    matchReason: '97% Match for Jordan • Put your feet up, turn up the subwoofers, and switch off your thoughts',
    criticScore: 82,
    audienceScore: 91,
    pacingProfile: {
      dialogueVsAction: 15,
      tensionCurve: [40, 70, 80, 85, 90],
      intensityLevel: 'Intense',
      pacingNote: 'Pure kinetic momentum from frame 1 to the closing credits.'
    }
  },

  // 7. 90-MINUTE BRAIN-OFF: ESCAPE TO CABO
  {
    id: 'escape-to-cabo',
    title: 'ESCAPE TO CABO',
    type: 'movie',
    tagline: 'Three best friends. One mistaken villa reservation. Infinite cocktails.',
    editorialHook: 'Sun-drenched, witty buddy comedy with zero emotional stakes and non-stop laughs.',
    synopsis: 'When three burned-out software engineers accidentally double-book a luxury seaside estate with a retired European pop star, a week of drunken rivalries and beach volleyball ensues.',
    backdropUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=85',
    dominantColor: '#14B8A6', // Teal
    durationMinutes: 86, // 1h 26m
    releaseYear: 2024,
    maturityRating: 'PG-13',
    pacingTags: ['Breezy & Warm', 'Laugh-Out-Loud', 'Feel-Good', 'Brain-Off Comfort'],
    cognitiveLoad: 'Background-Friendly',
    categories: ['90min-brainoff', 'fast-laughs', 'dinner-friendly'],
    timeBucket: 'under90',
    moods: ['laugh', 'cozy', 'background'],
    cast: ['Leo Miller', 'Pete Novak', 'Samira Joy'],
    director: 'Greg Callahan',
    matchScores: { alex: 68, sam: 72, jordan: 95, maya: 60 },
    matchReason: '95% Match • Low cognitive load, maximum vacation vibes',
    criticScore: 78,
    audienceScore: 88,
    pacingProfile: {
      dialogueVsAction: 70,
      tensionCurve: [15, 20, 25, 20, 15],
      intensityLevel: 'Gentle',
      pacingNote: 'Comforting, gentle comedic cadence that never triggers anxiety.'
    }
  },

  // 8. WATCH WHILE EATING DINNER: BAKE OFF EXTRAVAGANZA
  {
    id: 'patisserie-battles',
    title: 'THE SUGAR GUILD',
    type: 'series',
    tagline: 'Sugar glass, spun caramel, and cutthroat Paris pastry warfare.',
    editorialHook: 'The perfect dinner companion: hypnotic pastry craftsmanship with zero stress.',
    synopsis: 'Eight master artisans from France, Japan, and Mexico compete in an 18th-century chateau, constructing architectural confectionery wonders that look too delicate to touch.',
    backdropUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1920&q=85',
    dominantColor: '#F59E0B', // Honey Gold
    durationMinutes: 34,
    totalEpisodes: 6,
    releaseYear: 2025,
    maturityRating: 'G',
    pacingTags: ['Feel-Good', 'Cozy & Comforting', 'Visually Stunning', 'Low Tension'],
    cognitiveLoad: 'Background-Friendly',
    categories: ['dinner-friendly', 'fast-laughs'],
    timeBucket: 'under90',
    moods: ['cozy', 'background', 'laugh'],
    cast: ['Chef Laurent', 'Mina Tanaka', 'Carlos Ruiz'],
    director: 'Claire Dupont',
    matchScores: { alex: 79, sam: 84, jordan: 96, maya: 89 },
    matchReason: '96% Match • Great to look up and down from your dinner plate without missing dialogue',
    criticScore: 95,
    audienceScore: 92,
    pacingProfile: {
      dialogueVsAction: 45,
      tensionCurve: [10, 20, 35, 40, 25],
      intensityLevel: 'Gentle',
      pacingNote: 'Satisfying, relaxing pacing accompanied by classical cello and ASMR pastry sounds.'
    }
  },

  // 9. WATCH WHILE EATING DINNER: STREET NOODLES OF ASIA
  {
    id: 'street-noodles',
    title: 'THE BROTH CRUSADE',
    type: 'series',
    tagline: 'Generations of broth. 40 years over the same open wood flame.',
    editorialHook: 'Warm, evocative food travel that celebrates street legends across Taipei and Seoul.',
    synopsis: 'A lyrical exploration of nocturnal night markets, simmering beef bones, hand-pulled noodles, and the resilient family cooks who feed city neighborhoods at 3:00 AM.',
    backdropUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1920&q=85',
    dominantColor: '#FB923C', // Warm Orange
    durationMinutes: 26,
    totalEpisodes: 8,
    releaseYear: 2026,
    maturityRating: 'PG',
    pacingTags: ['Cozy & Comforting', 'Dialogue-Heavy', 'Mouthwatering', 'Feel-Good'],
    cognitiveLoad: 'Background-Friendly',
    categories: ['dinner-friendly', 'fast-laughs'],
    timeBucket: 'under30',
    moods: ['cozy', 'background'],
    cast: ['Grandmother Lin', 'Chef Chen', 'Bao Nguyen'],
    director: 'Vivian Hu',
    matchScores: { alex: 82, sam: 88, jordan: 94, maya: 96 },
    matchReason: 'Overlapping 92% Joint Match • Wholesome, appetizing, and culturally resonant',
    criticScore: 97,
    audienceScore: 98,
    pacingProfile: {
      dialogueVsAction: 50,
      tensionCurve: [10, 15, 20, 15, 10],
      intensityLevel: 'Gentle',
      pacingNote: 'Zero stress, maximum sensory warmth.'
    }
  },

  // 10. CRITICALLY ACCLAIMED WEEKEND EPICS: THE OBSIDIAN EMPIRE
  {
    id: 'obsidian-empire',
    title: 'THE OBSIDIAN EMPIRE',
    type: 'movie',
    tagline: 'Dynasties crumble not from invaders, but from silence within the council.',
    editorialHook: 'A sweeping 158-minute historical epic with monumental scale and breathtaking cinematography.',
    synopsis: 'In 14th-century Anatolia, a deposed empress forms an uneasy alliance with nomadic desert engineers to construct an impenetrable mountain fortress before the winter passes freeze shut.',
    backdropUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1920&q=85',
    dominantColor: '#CA8A04', // Dark Gold
    durationMinutes: 158, // 2h 38m
    releaseYear: 2025,
    maturityRating: '18+',
    pacingTags: ['Atmospheric Epics', 'Slow-Burn Mystery', 'Visually Stunning', 'Award Winner'],
    cognitiveLoad: 'Requires Full Attention',
    categories: ['weekend-epics', 'household-top10', 'mind-benders'],
    timeBucket: 'fullNight',
    moods: ['prestige', 'mind-bending', 'adrenaline'],
    isTop10: 6,
    cast: ['Yasmine El-Sayed', 'Darius Roman', 'Helena Sterling'],
    director: 'Tariq Mansour',
    matchScores: { alex: 91, sam: 94, jordan: 55, maya: 99 },
    matchReason: '99% Match for Maya • Grand cinematic scope, practical sets, and Oscar-caliber score',
    criticScore: 98,
    audienceScore: 92,
    pacingProfile: {
      dialogueVsAction: 60,
      tensionCurve: [20, 45, 65, 80, 95],
      intensityLevel: 'Moderate',
      pacingNote: 'Patient historical staging that pays off in breathtaking desert siege warfare.'
    }
  },

  // 11. CRITICALLY ACCLAIMED WEEKEND EPICS: CHRONICLES OF PROXIMA
  {
    id: 'chronicles-proxima',
    title: 'CHRONICLES OF PROXIMA',
    type: 'movie',
    tagline: 'The colony ship took 80 years. What awaited them had evolved for a million.',
    editorialHook: 'A philosophical sci-fi monument exploring first contact with non-biological life.',
    synopsis: 'When generation ship Ark-4 arrives in the Proxima Centauri system, the crew awakens from cryo to discover that the intended terraforming drones have built an organic crystalline cathedral across the continent.',
    backdropUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=85',
    dominantColor: '#6366F1', // Indigo / Cosmic
    durationMinutes: 164, // 2h 44m
    releaseYear: 2026,
    maturityRating: '16+',
    pacingTags: ['Mind-Bending', 'Visually Stunning', 'Slow-Burn Mystery', 'Philosophical'],
    cognitiveLoad: 'Requires Full Attention',
    categories: ['weekend-epics', 'mind-benders'],
    timeBucket: 'fullNight',
    moods: ['mind-bending', 'prestige'],
    isTop10: 7,
    cast: ['Nathaniel Cross', 'Sora Vance', 'Gillian Ward'],
    director: 'Denis Villeneuve-inspired style',
    matchScores: { alex: 99, sam: 91, jordan: 48, maya: 97 },
    matchReason: '99% Match for Alex • Majestic cosmic mystery with booming orchestral sound design',
    criticScore: 97,
    audienceScore: 90,
    pacingProfile: {
      dialogueVsAction: 40,
      tensionCurve: [25, 40, 60, 75, 95],
      intensityLevel: 'Moderate',
      pacingNote: 'Vast, awe-inspiring set-pieces framed by contemplative chamber reflections.'
    }
  },

  // 12. MIND-BENDERS: RECURSION LABS
  {
    id: 'recursion-labs',
    title: 'RECURSION LABS',
    type: 'movie',
    tagline: 'If you remember the experiment, you’re still inside it.',
    editorialHook: 'A puzzle-box psychological thriller that will keep you arguing until 2 AM.',
    synopsis: 'A cognitive scientist volunteering for an experimental memory erasure trial wakes up on an empty commuter train holding a cassette tape containing her own frantic voice warning her not to look in any mirrors.',
    backdropUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1920&q=85',
    dominantColor: '#10B981', // Emerald Matrix
    durationMinutes: 104, // 1h 44m
    releaseYear: 2025,
    maturityRating: '16+',
    pacingTags: ['Mind-Bending', 'Dialogue-Heavy', 'Edge-of-Seat', 'Twisty Paradoxes'],
    cognitiveLoad: 'Requires Full Attention',
    categories: ['mind-benders', 'household-top10'],
    timeBucket: 'under90',
    moods: ['mind-bending', 'adrenaline'],
    isTop10: 8,
    cast: ['Clara Bennett', 'Evan Wu', 'Rebecca Stern'],
    director: 'Julian Vance',
    matchScores: { alex: 96, sam: 97, jordan: 62, maya: 85 },
    matchReason: '97% Match • For fans of Memento and Inception who want tight puzzle mechanics',
    criticScore: 93,
    audienceScore: 92,
    pacingProfile: {
      dialogueVsAction: 70,
      tensionCurve: [30, 55, 75, 90, 100],
      intensityLevel: 'Intense',
      pacingNote: 'Complex chronological shifts that require active viewer deduction.'
    }
  },

  // 13. FAST LAUGHS (UNDER 30M): THE DEADLINE SYNDICATE
  {
    id: 'deadline-syndicate',
    title: 'THE DEADLINE SYNDICATE',
    type: 'series',
    tagline: 'Print journalism is dying. These four lunatics are speeding it up.',
    editorialHook: 'Rapid-fire workplace sitcom packed with witty one-liners and lovable disasters.',
    synopsis: 'The rogue city desk of an embattled tabloid newspaper scrambles to generate front-page scoops about bizarre local scandals before the afternoon printing presses roll.',
    backdropUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1920&q=85',
    dominantColor: '#EC4899', // Pink
    durationMinutes: 22,
    totalEpisodes: 12,
    releaseYear: 2026,
    maturityRating: '16+',
    pacingTags: ['Fast-Paced', 'Laugh-Out-Loud', 'Dialogue-Heavy', 'Dark Humor'],
    cognitiveLoad: 'Background-Friendly',
    categories: ['fast-laughs', 'dinner-friendly'],
    timeBucket: 'under30',
    moods: ['laugh', 'background'],
    cast: ['Milo Vance', 'Tessa Reed', 'Arthur Pendelton'],
    director: 'Sarah Brooks',
    matchScores: { alex: 84, sam: 92, jordan: 98, maya: 81 },
    matchReason: '98% Match for Jordan • 22 minutes of pure serotonin and snappy comedic timing',
    criticScore: 90,
    audienceScore: 95,
    pacingProfile: {
      dialogueVsAction: 90,
      tensionCurve: [20, 40, 60, 80, 50],
      intensityLevel: 'Moderate',
      pacingNote: 'Jokes land every 8 seconds with impeccable ensemble chemistry.'
    }
  },

  // 14. FAST LAUGHS: SUBURBAN HEIST CLUB
  {
    id: 'suburban-heist',
    title: 'SUBURBAN HEIST CLUB',
    type: 'series',
    tagline: 'Stealing back their HOA fees, one bird bath at a time.',
    editorialHook: 'Charming, irreverent neighborhood comedy with Ocean’s Eleven aspirations.',
    synopsis: 'Four mild-mannered parents team up to pull off comical, low-stakes robberies targeting the neighborhood association president’s corrupt garden gala.',
    backdropUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1920&q=85',
    dominantColor: '#8B5CF6', // Violet
    durationMinutes: 24,
    totalEpisodes: 8,
    releaseYear: 2025,
    maturityRating: 'PG-13',
    pacingTags: ['Feel-Good', 'Laugh-Out-Loud', 'Breezy & Warm'],
    cognitiveLoad: 'Background-Friendly',
    categories: ['fast-laughs', 'dinner-friendly'],
    timeBucket: 'under30',
    moods: ['laugh', 'cozy'],
    cast: ['Bradley Cooper-vibe lead', 'Sandy Walsh', 'Ronnie Patel'],
    director: 'Kelly Zhang',
    matchScores: { alex: 72, sam: 80, jordan: 96, maya: 75 },
    matchReason: '96% Match • Lighthearted, feel-good entertainment for lunch or after-work downtime',
    criticScore: 86,
    audienceScore: 92,
    pacingProfile: {
      dialogueVsAction: 65,
      tensionCurve: [15, 30, 45, 60, 30],
      intensityLevel: 'Gentle',
      pacingNote: 'Playful caper rhythm that keeps a smile on your face.'
    }
  },

  // 15. TOP 10 / PRESTIGE: THE CELLULOID ARCHIVE
  {
    id: 'celluloid-archive',
    title: 'THE CELLULOID ARCHIVE',
    type: 'movie',
    tagline: 'Some reels were buried for a reason.',
    editorialHook: 'A brooding neo-noir exploration of lost films, obsession, and celluloid decay.',
    synopsis: 'A lonely film archivist in 1980s London is hired by an anonymous patron to restore a nitrate film reel believed to have been destroyed during the Blitz, only to realize the footage records an unsolved ritual murder.',
    backdropUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1920&q=85',
    dominantColor: '#E11D48', // Crimson Red
    durationMinutes: 122, // 2h 02m
    releaseYear: 2025,
    maturityRating: '18+',
    pacingTags: ['Slow-Burn Mystery', 'Atmospheric Epics', 'Dark Psychological Noir', 'Audio Masterclass'],
    cognitiveLoad: 'Requires Full Attention',
    categories: ['household-top10', 'weekend-epics', 'mind-benders'],
    timeBucket: 'under90',
    moods: ['prestige', 'mind-bending', 'adrenaline'],
    isTop10: 9,
    cast: ['Callum Thorne', 'Ingrid Vogel', 'Timothy Wells'],
    director: 'Peter Strickland-style',
    matchScores: { alex: 90, sam: 96, jordan: 45, maya: 98 },
    matchReason: '98% Match for Maya & Sam • Masterclass in visual texture, moody grain, and creeping dread',
    criticScore: 96,
    audienceScore: 87,
    pacingProfile: {
      dialogueVsAction: 70,
      tensionCurve: [20, 35, 50, 75, 95],
      intensityLevel: 'Intense',
      pacingNote: 'Hypnotic, analog pacing that builds toward a dizzying final revelation.'
    }
  },

  // 16. TOP 10: VELOCITY 2099
  {
    id: 'velocity-2099',
    title: 'VELOCITY 2099',
    type: 'movie',
    tagline: 'When gravity fails, speed is the only anchor.',
    editorialHook: 'Adrenaline-packed cyberpunk racing tournament across ruined mega-structures.',
    synopsis: 'In a vertical megalopolis where magnetic storms prevent flight, anti-gravity drift pilots compete in illegal multi-level sky-races where the prize is an orbital exit visa.',
    backdropUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1920&q=85',
    dominantColor: '#06B6D4', // Electric Cyan
    durationMinutes: 108, // 1h 48m
    releaseYear: 2026,
    maturityRating: '16+',
    pacingTags: ['Edge-of-Seat', 'Fast-Paced', 'Visually Stunning', 'Synthwave Score'],
    cognitiveLoad: 'Light Focus',
    categories: ['household-top10', '90min-brainoff'],
    timeBucket: 'under90',
    moods: ['adrenaline', 'mind-bending'],
    isTop10: 10,
    cast: ['Ryder Cole', 'Kira Steele', 'Zane Kincaid'],
    director: 'Marco Silva',
    matchScores: { alex: 93, sam: 82, jordan: 91, maya: 79 },
    matchReason: '93% Match • Kinetic visual spectacle with pulse-pounding sound effects',
    criticScore: 88,
    audienceScore: 93,
    pacingProfile: {
      dialogueVsAction: 25,
      tensionCurve: [40, 60, 75, 85, 95],
      intensityLevel: 'Relentless',
      pacingNote: 'High-speed race sequences linked by brief pit-stop character moments.'
    }
  }
];

export const CATEGORY_DEFINITIONS = [
  {
    id: 'continue-watching',
    title: 'Where You Left Off',
    subtitle: 'Catch up with 15-second spoiler-free recaps up to your exact minute',
    icon: 'RotateCcw',
    mood: 'all'
  },
  {
    id: 'shared-taste',
    title: 'Who’s Watching Together: Shared Harmony',
    subtitle: 'Titles calibrated specifically for the selected household members',
    icon: 'Users',
    mood: 'all'
  },
  {
    id: 'household-top10',
    title: 'Top 10 in Your Household This Week',
    subtitle: 'The consensus hits everyone in the house has been talking about',
    icon: 'Flame',
    mood: 'all'
  },
  {
    id: '90min-brainoff',
    title: '90-Minute Brain-Off Movies',
    subtitle: 'Zero mental overhead. Start now, be asleep by midnight without existential dread',
    icon: 'Sparkles',
    mood: 'background'
  },
  {
    id: 'dinner-friendly',
    title: 'Watch While Eating Dinner',
    subtitle: 'Brisk, mouthwatering, and easy to follow between bites',
    icon: 'Utensils',
    mood: 'cozy'
  },
  {
    id: 'mind-benders',
    title: 'Deep Focus & Mind-Benders',
    subtitle: 'Complex puzzles, paradoxes, and razor-sharp chamber dramas that reward attention',
    icon: 'Brain',
    mood: 'mind-bending'
  },
  {
    id: 'weekend-epics',
    title: 'Critically Acclaimed Weekend Epics',
    subtitle: 'Expansive 2.5-hour cinematic journeys with monumental world-building',
    icon: 'Film',
    mood: 'prestige'
  },
  {
    id: 'fast-laughs',
    title: 'Quick Bites & Fast Laughs (Under 30m)',
    subtitle: 'High joke-density sitcoms and crisp 20-minute breaks',
    icon: 'Smile',
    mood: 'laugh'
  }
];

