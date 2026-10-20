import { GameCatalogItem, CriticProfile, GameReview, QuestList, PillarBreakdown } from '../../src/types';

export const INITIAL_GAMES: GameCatalogItem[] = [
  {
    id: 'elden-ring',
    slug: 'elden-ring',
    title: 'Elden Ring',
    developer: 'FromSoftware',
    publisher: 'Bandai Namco',
    releaseYear: 2022,
    platforms: ['PC', 'PS5', 'XBOX', 'DECK'],
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    genres: ['Action RPG', 'Open World', 'Dark Fantasy', 'Souls-like'],
    tagline: 'Rise, Tarnished, and be guided by grace to brandish the Elden Ring.',
    synopsis: 'A sprawling fantasy open world directed by Hidetaka Miyazaki in collaboration with George R.R. Martin. Venture across the Lands Between, vanquish demigods, and shape the destiny of an unhinged cosmic realm.',
    metrics: {
      averageRating: 4.8,
      totalReviews: 842,
      completionRatePercent: 44,
      medianHoursToBeat: 86.5,
      communityPillars: {
        gameplay: 4.9,
        narrative: 4.5,
        visuals: 4.8,
        audio: 4.8,
        polish: 4.4,
      },
      ratingHistogram: [2, 3, 5, 8, 14, 25, 48, 120, 265, 352],
    },
    playtimeHorizon: [
      { bracket: '< 8 hrs', minHours: 0, maxHours: 8, ratingAvg: 3.4, sampleCount: 142, dropRatePercent: 28, sentimentSummary: 'Steep Tree Sentinel filter & Margit onboarding wall; high drop rate among newcomers.' },
      { bracket: '8-25 hrs', minHours: 8, maxHours: 25, ratingAvg: 4.4, sampleCount: 220, dropRatePercent: 12, sentimentSummary: 'Stormveil Castle & Liurnia exploration click; sheer scale dazzles players.' },
      { bracket: '25-60 hrs', minHours: 25, maxHours: 60, ratingAvg: 4.9, sampleCount: 290, dropRatePercent: 6, sentimentSummary: 'Peak mid-game synergy: Leyndell, Radahn festival, subterranean cities.' },
      { bracket: '60-110 hrs', minHours: 60, maxHours: 110, ratingAvg: 4.8, sampleCount: 190, dropRatePercent: 4, sentimentSummary: 'Late game boss encounters divide purists, but climax cements legacy.' },
    ],
    anomaly: {
      isAnomalous: true,
      zScore: 3.4,
      quarantinedCount: 18,
      patchVersion: 'v1.03',
    },
  },
  {
    id: 'baldurs-gate-3',
    slug: 'baldurs-gate-3',
    title: "Baldur's Gate 3",
    developer: 'Larian Studios',
    publisher: 'Larian Studios',
    releaseYear: 2023,
    platforms: ['PC', 'PS5', 'XBOX', 'DECK'],
    coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600&auto=format&fit=crop',
    genres: ['CRPG', 'Turn-Based Tactics', 'High Fantasy', 'Choices Matter'],
    tagline: 'Gather your party, and return to the Forgotten Realms.',
    synopsis: 'Abducted, infected, lost. You are turning into a monster, but as the corruption inside you grows, so does your power. An uncompromised celebration of reactive tabletop storytelling and systemic freedom.',
    metrics: {
      averageRating: 4.9,
      totalReviews: 910,
      completionRatePercent: 39,
      medianHoursToBeat: 104.0,
      communityPillars: {
        gameplay: 4.8,
        narrative: 5.0,
        visuals: 4.7,
        audio: 4.9,
        polish: 4.5,
      },
      ratingHistogram: [1, 2, 4, 6, 12, 20, 42, 105, 290, 428],
    },
    playtimeHorizon: [
      { bracket: '< 10 hrs', minHours: 0, maxHours: 10, ratingAvg: 4.5, sampleCount: 130, dropRatePercent: 11, sentimentSummary: 'Mind flayer nautiloid crash and emerald grove politics set dizzying bar.' },
      { bracket: '10-35 hrs', minHours: 10, maxHours: 35, ratingAvg: 4.9, sampleCount: 310, dropRatePercent: 5, sentimentSummary: 'Underdark and Underdark forge showcase unprecedented mechanical depth.' },
      { bracket: '35-75 hrs', minHours: 35, maxHours: 75, ratingAvg: 4.9, sampleCount: 280, dropRatePercent: 7, sentimentSummary: 'Act II Shadow-Cursed Lands delivers emotionally devastating story beats.' },
      { bracket: '75+ hrs', minHours: 75, maxHours: 150, ratingAvg: 4.8, sampleCount: 190, dropRatePercent: 3, sentimentSummary: 'Lower city of Baldurs Gate is dense; narrative resolution leaves critics stunned.' },
    ],
  },
  {
    id: 'cyberpunk-2077',
    slug: 'cyberpunk-2077',
    title: 'Cyberpunk 2077: Phantom Liberty',
    developer: 'CD PROJEKT RED',
    publisher: 'CD PROJEKT RED',
    releaseYear: 2023,
    platforms: ['PC', 'PS5', 'XBOX'],
    coverUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1600&auto=format&fit=crop',
    genres: ['Action RPG', 'Sci-Fi', 'Cyberpunk', 'First-Person'],
    tagline: 'Freedom always comes at a price in Dogtown.',
    synopsis: 'Step into the combat boots of V, a mercenary thrust into a high-stakes espionage thriller across Dogtown alongside sleeper agent Solomon Reed (Idris Elba). Completely overhauls core mechanics into a masterclass in urban immersion.',
    metrics: {
      averageRating: 4.6,
      totalReviews: 654,
      completionRatePercent: 58,
      medianHoursToBeat: 38.0,
      communityPillars: {
        gameplay: 4.6,
        narrative: 4.8,
        visuals: 5.0,
        audio: 4.9,
        polish: 4.3,
      },
      ratingHistogram: [5, 6, 12, 18, 30, 48, 88, 140, 185, 122],
    },
    playtimeHorizon: [
      { bracket: '< 5 hrs', minHours: 0, maxHours: 5, ratingAvg: 4.1, sampleCount: 80, dropRatePercent: 9, sentimentSummary: 'Explosive entrance to Dogtown and President Myers extraction.' },
      { bracket: '5-20 hrs', minHours: 5, maxHours: 20, ratingAvg: 4.7, sampleCount: 290, dropRatePercent: 4, sentimentSummary: 'Black Sapphire infiltration and moral dilemmas shine.' },
      { bracket: '20-45 hrs', minHours: 20, maxHours: 45, ratingAvg: 4.8, sampleCount: 220, dropRatePercent: 3, sentimentSummary: 'The Cynosure bunker sequence stands as legendary horror/sci-fi hybrid.' },
    ],
  },
  {
    id: 'hades-2',
    slug: 'hades-2',
    title: 'Hades II',
    developer: 'Supergiant Games',
    publisher: 'Supergiant Games',
    releaseYear: 2024,
    platforms: ['PC', 'DECK'],
    coverUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1600&auto=format&fit=crop',
    genres: ['Roguelike', 'Action', 'Mythology', 'Hack and Slash'],
    tagline: 'Death to Chronos. Battle beyond the Underworld using dark sorcery.',
    synopsis: 'As Melinoë, Princess of the Underworld and immortal witch, explore a bigger, deeper mythic world, vanquishing the forces of the Titan of Time with the full might of Olympus behind you.',
    metrics: {
      averageRating: 4.7,
      totalReviews: 489,
      completionRatePercent: 52,
      medianHoursToBeat: 42.0,
      communityPillars: {
        gameplay: 4.9,
        narrative: 4.7,
        visuals: 4.9,
        audio: 5.0,
        polish: 4.8,
      },
      ratingHistogram: [1, 2, 4, 8, 14, 28, 62, 115, 145, 110],
    },
    playtimeHorizon: [
      { bracket: '< 6 hrs', minHours: 0, maxHours: 6, ratingAvg: 4.4, sampleCount: 95, dropRatePercent: 7, sentimentSummary: 'Hecate test and learning omega magics; noticeably demanding.' },
      { bracket: '6-25 hrs', minHours: 6, maxHours: 25, ratingAvg: 4.8, sampleCount: 230, dropRatePercent: 3, sentimentSummary: 'Unlocking surface route to Mount Olympus multiplies build diversity.' },
      { bracket: '25-70 hrs', minHours: 25, maxHours: 70, ratingAvg: 4.9, sampleCount: 164, dropRatePercent: 2, sentimentSummary: 'High-fear heat runs, Darren Korb sirens score cements timeless status.' },
    ],
  },
  {
    id: 'the-witcher-3',
    slug: 'the-witcher-3',
    title: 'The Witcher 3: Wild Hunt',
    developer: 'CD PROJEKT RED',
    publisher: 'CD PROJEKT RED',
    releaseYear: 2015,
    platforms: ['PC', 'PS5', 'XBOX', 'SWITCH', 'DECK'],
    coverUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    genres: ['RPG', 'Open World', 'Dark Fantasy', 'Story Rich'],
    tagline: 'Track down the Child of Prophecy across a war-torn continent.',
    synopsis: 'You are Geralt of Rivia, mercenary monster slayer. A monumental narrative achievement filled with morally ambiguous contracts, unforgettable side quests, and unmatched European folklore worldbuilding.',
    metrics: {
      averageRating: 4.8,
      totalReviews: 1205,
      completionRatePercent: 41,
      medianHoursToBeat: 72.0,
      communityPillars: {
        gameplay: 4.2,
        narrative: 5.0,
        visuals: 4.7,
        audio: 4.9,
        polish: 4.5,
      },
      ratingHistogram: [2, 3, 7, 12, 28, 55, 110, 220, 390, 378],
    },
    playtimeHorizon: [
      { bracket: '< 10 hrs', minHours: 0, maxHours: 10, ratingAvg: 4.2, sampleCount: 180, dropRatePercent: 19, sentimentSummary: 'White Orchard tutorial pacing and floaty sword controls trigger early drop-offs.' },
      { bracket: '10-30 hrs', minHours: 10, maxHours: 30, ratingAvg: 4.9, sampleCount: 420, dropRatePercent: 5, sentimentSummary: 'Bloody Baron questline in Velen is universally hailed as masterwork.' },
      { bracket: '30-80 hrs', minHours: 30, maxHours: 80, ratingAvg: 4.8, sampleCount: 410, dropRatePercent: 4, sentimentSummary: 'Novigrad intrigue and Skellige sea shanties keep players hooked.' },
      { bracket: '80+ hrs', minHours: 80, maxHours: 140, ratingAvg: 5.0, sampleCount: 195, dropRatePercent: 1, sentimentSummary: 'Hearts of Stone and Blood and Wine elevate game to highest tier in medium history.' },
    ],
  },
  {
    id: 'hollow-knight',
    slug: 'hollow-knight',
    title: 'Hollow Knight',
    developer: 'Team Cherry',
    publisher: 'Team Cherry',
    releaseYear: 2017,
    platforms: ['PC', 'PS5', 'XBOX', 'SWITCH', 'DECK'],
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?q=80&w=1600&auto=format&fit=crop',
    genres: ['Metroidvania', 'Souls-like', '2D', 'Atmospheric', 'Challenging'],
    tagline: 'Forge your own path in Hallownest: an ancient, ruined kingdom of insects.',
    synopsis: 'Descend into the melancholy subterranean depths of Hallownest. Team Cherry delivered an uncompromising 2D masterpiece of razor-sharp combat, intricate map exploration, and haunting Christopher Larkin orchestral melodies.',
    metrics: {
      averageRating: 4.9,
      totalReviews: 830,
      completionRatePercent: 32,
      medianHoursToBeat: 36.5,
      communityPillars: {
        gameplay: 5.0,
        narrative: 4.7,
        visuals: 4.9,
        audio: 5.0,
        polish: 4.9,
      },
      ratingHistogram: [1, 1, 3, 5, 11, 22, 54, 110, 273, 350],
    },
    playtimeHorizon: [
      { bracket: '< 4 hrs', minHours: 0, maxHours: 4, ratingAvg: 4.2, sampleCount: 110, dropRatePercent: 21, sentimentSummary: 'Forgotten Crossroads wandering without compass creates friction for casuals.' },
      { bracket: '4-15 hrs', minHours: 4, maxHours: 15, ratingAvg: 4.8, sampleCount: 310, dropRatePercent: 7, sentimentSummary: 'Greenpath, Mantis Lords fight, and City of Tears reveal transcendent beauty.' },
      { bracket: '15-45 hrs', minHours: 15, maxHours: 45, ratingAvg: 5.0, sampleCount: 280, dropRatePercent: 3, sentimentSummary: 'Kingdoms Edge, Deepnest, and Path of Pain reward dedicated mastery.' },
      { bracket: '45+ hrs', minHours: 45, maxHours: 90, ratingAvg: 4.9, sampleCount: 130, dropRatePercent: 1, sentimentSummary: 'Godhome Pantheon 5 is ultimate test of 2D combat dexterity.' },
    ],
  },
  {
    id: 'disco-elysium',
    slug: 'disco-elysium',
    title: 'Disco Elysium - The Final Cut',
    developer: 'ZA/UM',
    publisher: 'ZA/UM',
    releaseYear: 2021,
    platforms: ['PC', 'PS5', 'XBOX', 'SWITCH', 'DECK'],
    coverUrl: 'https://images.unsplash.com/photo-1533158307587-828f0a76ef46?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    genres: ['CRPG', 'Narrative', 'Detective', 'Literary', 'Psychological'],
    tagline: 'You are a detective with a unique skill system and a whole city block to interrogate.',
    synopsis: 'A groundbreaking literary role playing game where your psyche is fractured into 24 distinct, argumentative voices. Solve a murder in the ruined district of Revachol or succumb to existential delirium.',
    metrics: {
      averageRating: 4.8,
      totalReviews: 612,
      completionRatePercent: 47,
      medianHoursToBeat: 32.0,
      communityPillars: {
        gameplay: 4.1,
        narrative: 5.0,
        visuals: 4.8,
        audio: 4.9,
        polish: 4.4,
      },
      ratingHistogram: [3, 4, 8, 12, 19, 31, 52, 94, 185, 204],
    },
    playtimeHorizon: [
      { bracket: '< 3 hrs', minHours: 0, maxHours: 3, ratingAvg: 4.0, sampleCount: 90, dropRatePercent: 18, sentimentSummary: 'Dense prose wall and failing ceiling fan check weeds out impatient players.' },
      { bracket: '3-15 hrs', minHours: 3, maxHours: 15, ratingAvg: 4.8, sampleCount: 260, dropRatePercent: 5, sentimentSummary: 'Kim Kitsuragi dynamic and Whirling-in-Rags investigation grip the reader.' },
      { bracket: '15-35 hrs', minHours: 15, maxHours: 35, ratingAvg: 5.0, sampleCount: 262, dropRatePercent: 2, sentimentSummary: 'The tribunal and the island phasmids encounter redefine interactive writing.' },
    ],
  },
  {
    id: 'persona-5-royal',
    slug: 'persona-5-royal',
    title: 'Persona 5 Royal',
    developer: 'ATLUS',
    publisher: 'SEGA',
    releaseYear: 2020,
    platforms: ['PC', 'PS5', 'XBOX', 'SWITCH', 'DECK'],
    coverUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1600&auto=format&fit=crop',
    genres: ['JRPG', 'Anime', 'Social Sim', 'Turn-Based', 'Urban Fantasy'],
    tagline: 'Steal back your future. Wear the mask and reveal your truth.',
    synopsis: 'Transfer to Shujin Academy in Tokyo, awaken your Persona, and lead the Phantom Thieves of Hearts into surreal cognitive palaces to reform corrupted adults in stylish, acid-jazz steeped turn-based combat.',
    metrics: {
      averageRating: 4.8,
      totalReviews: 730,
      completionRatePercent: 36,
      medianHoursToBeat: 122.0,
      communityPillars: {
        gameplay: 4.7,
        narrative: 4.8,
        visuals: 5.0,
        audio: 5.0,
        polish: 4.8,
      },
      ratingHistogram: [2, 3, 5, 9, 15, 34, 68, 130, 244, 220],
    },
    playtimeHorizon: [
      { bracket: '< 15 hrs', minHours: 0, maxHours: 15, ratingAvg: 4.3, sampleCount: 110, dropRatePercent: 16, sentimentSummary: 'Extended Kamoshida palace tutorial demands patience before daily life opens up.' },
      { bracket: '15-50 hrs', minHours: 15, maxHours: 50, ratingAvg: 4.7, sampleCount: 290, dropRatePercent: 8, sentimentSummary: 'Addictive calendar loop, confidant dates, and Tokyo exploration blossom.' },
      { bracket: '50-100 hrs', minHours: 50, maxHours: 100, ratingAvg: 4.8, sampleCount: 210, dropRatePercent: 4, sentimentSummary: 'Okumura palace test is contentious, but Sae Niijima casino reaches fever pitch.' },
      { bracket: '100+ hrs', minHours: 100, maxHours: 140, ratingAvg: 5.0, sampleCount: 120, dropRatePercent: 1, sentimentSummary: 'Royal-exclusive third semester with Maruki delivers one of gaming best antagonists.' },
    ],
  },
  {
    id: 'outer-wilds',
    slug: 'outer-wilds',
    title: 'Outer Wilds',
    developer: 'Mobius Digital',
    publisher: 'Annapurna Interactive',
    releaseYear: 2019,
    platforms: ['PC', 'PS5', 'XBOX', 'SWITCH', 'DECK'],
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1600&auto=format&fit=crop',
    genres: ['Exploration', 'Sci-Fi', 'Mystery', 'Physics', 'Space'],
    tagline: 'Named Game of the Year 2019 by Giant Bomb, Polygon, and Eurogamer.',
    synopsis: 'Trapped in an unyielding 22-minute time loop, strap yourself into a wooden spaceship and decipher the remnants of an extinct alien civilization across a miniature, physics-accurate solar system before the sun explodes.',
    metrics: {
      averageRating: 4.9,
      totalReviews: 760,
      completionRatePercent: 49,
      medianHoursToBeat: 22.5,
      communityPillars: {
        gameplay: 4.8,
        narrative: 5.0,
        visuals: 4.6,
        audio: 5.0,
        polish: 4.7,
      },
      ratingHistogram: [1, 2, 3, 5, 10, 18, 45, 95, 230, 351],
    },
    playtimeHorizon: [
      { bracket: '< 3 hrs', minHours: 0, maxHours: 3, ratingAvg: 4.2, sampleCount: 90, dropRatePercent: 14, sentimentSummary: 'Zero-g ship navigation learning curve causes disorientation.' },
      { bracket: '3-12 hrs', minHours: 3, maxHours: 12, ratingAvg: 4.9, sampleCount: 320, dropRatePercent: 4, sentimentSummary: 'Translating Nomai logs across Brittle Hollow and Giants Deep sparks profound awe.' },
      { bracket: '12-25 hrs', minHours: 12, maxHours: 25, ratingAvg: 5.0, sampleCount: 350, dropRatePercent: 1, sentimentSummary: 'The quantum moon and final run to the Eye of the Universe create life-altering catharsis.' },
    ],
  },
  {
    id: 'alan-wake-2',
    slug: 'alan-wake-2',
    title: 'Alan Wake 2',
    developer: 'Remedy Entertainment',
    publisher: 'Epic Games Publishing',
    releaseYear: 2023,
    platforms: ['PC', 'PS5', 'XBOX'],
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1600&auto=format&fit=crop',
    genres: ['Survival Horror', 'Psychological', 'Action', 'Cinematic', 'Mystery'],
    tagline: 'Monsters wear many faces in the Pacific Northwest.',
    synopsis: 'A dual-protagonist psychological survival horror tour de force. Alternate between FBI investigator Saga Anderson solving ritualistic murders in Bright Falls, and tortured writer Alan Wake rewriting his reality from the Dark Place.',
    metrics: {
      averageRating: 4.7,
      totalReviews: 540,
      completionRatePercent: 54,
      medianHoursToBeat: 24.0,
      communityPillars: {
        gameplay: 4.2,
        narrative: 4.9,
        visuals: 5.0,
        audio: 5.0,
        polish: 4.6,
      },
      ratingHistogram: [2, 3, 6, 12, 18, 32, 60, 110, 160, 137],
    },
    playtimeHorizon: [
      { bracket: '< 4 hrs', minHours: 0, maxHours: 4, ratingAvg: 4.3, sampleCount: 80, dropRatePercent: 10, sentimentSummary: 'Cauldron Lake forensic case board onboarding is deliberate and slow-paced.' },
      { bracket: '4-12 hrs', minHours: 4, maxHours: 12, ratingAvg: 4.9, sampleCount: 260, dropRatePercent: 4, sentimentSummary: 'Herald of Darkness musical chapter stands as high-water mark of live-action gaming art.' },
      { bracket: '12-26 hrs', minHours: 12, maxHours: 26, ratingAvg: 4.7, sampleCount: 200, dropRatePercent: 3, sentimentSummary: 'Mind Place deductions and mind-bending meta conclusion stun Remedy fans.' },
    ],
  },
  {
    id: 'zelda-totk',
    slug: 'zelda-totk',
    title: 'The Legend of Zelda: Tears of the Kingdom',
    developer: 'Nintendo EPD',
    publisher: 'Nintendo',
    releaseYear: 2023,
    platforms: ['SWITCH'],
    coverUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    genres: ['Action-Adventure', 'Open World', 'Physics', 'Sandbox', 'Fantasy'],
    tagline: 'An epic adventure across the land, skies, and depths of Hyrule.',
    synopsis: 'Harness the Ultrahand, Fuse, and Recall abilities to engineer custom war machines and solve physical dilemmas across sky islands, a scarred Hyrule, and a vast subterranean gloom.',
    metrics: {
      averageRating: 4.8,
      totalReviews: 890,
      completionRatePercent: 38,
      medianHoursToBeat: 78.0,
      communityPillars: {
        gameplay: 5.0,
        narrative: 4.4,
        visuals: 4.6,
        audio: 4.8,
        polish: 4.9,
      },
      ratingHistogram: [1, 2, 4, 8, 18, 35, 78, 160, 310, 274],
    },
    playtimeHorizon: [
      { bracket: '< 8 hrs', minHours: 0, maxHours: 8, ratingAvg: 4.5, sampleCount: 120, dropRatePercent: 8, sentimentSummary: 'Great Sky Island tutorial is comprehensive masterclass in physics sandbox.' },
      { bracket: '8-40 hrs', minHours: 8, maxHours: 40, ratingAvg: 4.9, sampleCount: 380, dropRatePercent: 4, sentimentSummary: 'Wind Temple sky ascent and Depths mining keep imagination on fire.' },
      { bracket: '40-100 hrs', minHours: 40, maxHours: 100, ratingAvg: 4.8, sampleCount: 390, dropRatePercent: 3, sentimentSummary: 'Ultrahand contraptions go viral; Demon King finale is grand spectacle.' },
    ],
  },
  {
    id: 'bloodborne',
    slug: 'bloodborne',
    title: 'Bloodborne',
    developer: 'FromSoftware',
    publisher: 'Sony Interactive Entertainment',
    releaseYear: 2015,
    platforms: ['PS5'],
    coverUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    genres: ['Action RPG', 'Gothic Horror', 'Cosmic Horror', 'Souls-like'],
    tagline: 'Hunt your nightmares in the cursed Victorian city of Yharnam.',
    synopsis: 'Arm yourself with trick weapons and a firearm. FromSoftware finest gothic horror masterpiece punishes timidity and rewards aggressive rally-based combat as a blood-borne affliction transforms citizens into beasts.',
    metrics: {
      averageRating: 4.9,
      totalReviews: 980,
      completionRatePercent: 37,
      medianHoursToBeat: 38.0,
      communityPillars: {
        gameplay: 4.9,
        narrative: 4.9,
        visuals: 4.9,
        audio: 5.0,
        polish: 4.3,
      },
      ratingHistogram: [1, 2, 3, 7, 12, 24, 62, 134, 340, 395],
    },
    playtimeHorizon: [
      { bracket: '< 4 hrs', minHours: 0, maxHours: 4, ratingAvg: 3.6, sampleCount: 150, dropRatePercent: 31, sentimentSummary: 'Central Yharnam bonfire street mob and Father Gascoigne cause brutal filtering.' },
      { bracket: '4-18 hrs', minHours: 4, maxHours: 18, ratingAvg: 4.9, sampleCount: 390, dropRatePercent: 6, sentimentSummary: 'Cathedral Ward and Old Yharnam establish unparalleled gothic dread.' },
      { bracket: '18-45 hrs', minHours: 18, maxHours: 45, ratingAvg: 5.0, sampleCount: 440, dropRatePercent: 2, sentimentSummary: 'Blood moon descent and Byrgenwerth cosmic turn seal its mythic status.' },
    ],
  },
  {
    id: 'sekiro',
    slug: 'sekiro',
    title: 'Sekiro: Shadows Die Twice',
    developer: 'FromSoftware',
    publisher: 'Activision',
    releaseYear: 2019,
    platforms: ['PC', 'PS5', 'XBOX', 'DECK'],
    coverUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    genres: ['Action', 'Souls-like', 'Stealth', 'Historical Fantasy', 'Difficult'],
    tagline: 'Carve your path to vengeance in late 1500s Sengoku Japan.',
    synopsis: 'As the one-armed wolf, employ prosthetic shinobi gadgets and lethal katana deflections. A rhythmic, uncompromising dance of steel clashing where posture is life and hesitation is defeat.',
    metrics: {
      averageRating: 4.8,
      totalReviews: 690,
      completionRatePercent: 30,
      medianHoursToBeat: 32.0,
      communityPillars: {
        gameplay: 5.0,
        narrative: 4.5,
        visuals: 4.8,
        audio: 4.8,
        polish: 4.9,
      },
      ratingHistogram: [2, 3, 5, 8, 14, 25, 54, 115, 234, 230],
    },
    playtimeHorizon: [
      { bracket: '< 5 hrs', minHours: 0, maxHours: 5, ratingAvg: 3.5, sampleCount: 130, dropRatePercent: 35, sentimentSummary: 'Chained Ogre and Shinobi Hunter deflecting filter causes high early dropout.' },
      { bracket: '5-15 hrs', minHours: 5, maxHours: 15, ratingAvg: 4.8, sampleCount: 260, dropRatePercent: 8, sentimentSummary: 'Genichiro Ashina rooftop showdown: the moment swordplay mechanics truly click.' },
      { bracket: '15-40 hrs', minHours: 15, maxHours: 40, ratingAvg: 5.0, sampleCount: 300, dropRatePercent: 2, sentimentSummary: 'Guardian Ape, Owl, and Sword Saint Isshin crown it as pure action perfection.' },
    ],
  },
  {
    id: 'red-dead-redemption-2',
    slug: 'red-dead-redemption-2',
    title: 'Red Dead Redemption 2',
    developer: 'Rockstar Games',
    publisher: 'Rockstar Games',
    releaseYear: 2018,
    platforms: ['PC', 'PS5', 'XBOX', 'DECK'],
    coverUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    genres: ['Open World', 'Western', 'Story Rich', 'Action-Adventure'],
    tagline: 'Outlaws for life. America, 1899.',
    synopsis: 'Follow Arthur Morgan and the Van der Linde gang as the era of the wild west comes to an end. Unsurpassed environmental simulation, staggering emotional depth, and peerless cinematic character arcs.',
    metrics: {
      averageRating: 4.9,
      totalReviews: 1340,
      completionRatePercent: 35,
      medianHoursToBeat: 60.0,
      communityPillars: {
        gameplay: 4.2,
        narrative: 5.0,
        visuals: 5.0,
        audio: 5.0,
        polish: 4.8,
      },
      ratingHistogram: [3, 4, 8, 14, 25, 52, 98, 210, 440, 486],
    },
    playtimeHorizon: [
      { bracket: '< 6 hrs', minHours: 0, maxHours: 6, ratingAvg: 3.9, sampleCount: 160, dropRatePercent: 22, sentimentSummary: 'Colter snow prologue is glacial in tempo; heavy animation inertia divides action gamers.' },
      { bracket: '6-30 hrs', minHours: 6, maxHours: 30, ratingAvg: 4.9, sampleCount: 480, dropRatePercent: 5, sentimentSummary: 'Horseshoe Overlook camp life and Valentine saloon brawl immerse completely.' },
      { bracket: '30-75 hrs', minHours: 30, maxHours: 75, ratingAvg: 5.0, sampleCount: 700, dropRatePercent: 2, sentimentSummary: 'Saint Denis robbery and Chapter 6 climax leave players in genuine tears.' },
    ],
  },
  {
    id: 'metaphor-refantazio',
    slug: 'metaphor-refantazio',
    title: 'Metaphor: ReFantazio',
    developer: 'Studio Zero / ATLUS',
    publisher: 'SEGA',
    releaseYear: 2024,
    platforms: ['PC', 'PS5', 'XBOX', 'DECK'],
    coverUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1600&auto=format&fit=crop',
    genres: ['JRPG', 'Fantasy', 'Turn-Based', 'Political Intrigue'],
    tagline: 'Participate in the Royal Tournament for the throne of Euchronia.',
    synopsis: 'From the creative minds behind Persona 3, 4, and 5. Travel through the United Kingdom of Euchronia in your gauntlet runner, commanding archetypes in hybrid real-time and turn-based battles to win the people hearts.',
    metrics: {
      averageRating: 4.8,
      totalReviews: 430,
      completionRatePercent: 42,
      medianHoursToBeat: 84.0,
      communityPillars: {
        gameplay: 4.9,
        narrative: 4.7,
        visuals: 4.9,
        audio: 4.9,
        polish: 4.7,
      },
      ratingHistogram: [1, 2, 4, 7, 12, 22, 50, 95, 145, 92],
    },
    playtimeHorizon: [
      { bracket: '< 8 hrs', minHours: 0, maxHours: 8, ratingAvg: 4.5, sampleCount: 80, dropRatePercent: 8, sentimentSummary: 'Regicide opening and archetype awakening show immediate flair.' },
      { bracket: '8-35 hrs', minHours: 8, maxHours: 35, ratingAvg: 4.9, sampleCount: 210, dropRatePercent: 4, sentimentSummary: 'Martira town intrigue and Shoji Meguro buddhist choir score stun.' },
      { bracket: '35-85 hrs', minHours: 35, maxHours: 85, ratingAvg: 4.8, sampleCount: 140, dropRatePercent: 2, sentimentSummary: 'Tournament arc reaches peak philosophical conflict; brilliant JRPG triumph.' },
    ],
  },
  {
    id: 'silent-hill-2',
    slug: 'silent-hill-2',
    title: 'Silent Hill 2 (2024)',
    developer: 'Bloober Team',
    publisher: 'KONAMI',
    releaseYear: 2024,
    platforms: ['PC', 'PS5'],
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1600&auto=format&fit=crop',
    genres: ['Psychological Horror', 'Survival Horror', 'Atmospheric', 'Remake'],
    tagline: 'In my restless dreams, I see that town. Silent Hill.',
    synopsis: 'A faithful and visually staggering reimagining of the definitive psychological horror game. Follow James Sunderland into the fog-shrouded town after receiving a letter from his deceased wife Mary.',
    metrics: {
      averageRating: 4.7,
      totalReviews: 380,
      completionRatePercent: 61,
      medianHoursToBeat: 16.5,
      communityPillars: {
        gameplay: 4.4,
        narrative: 4.9,
        visuals: 4.8,
        audio: 5.0,
        polish: 4.6,
      },
      ratingHistogram: [2, 3, 5, 8, 14, 24, 46, 88, 110, 80],
    },
    playtimeHorizon: [
      { bracket: '< 3 hrs', minHours: 0, maxHours: 3, ratingAvg: 4.4, sampleCount: 70, dropRatePercent: 6, sentimentSummary: 'Graveyard walk and Wood Side Apartments fog create suffocating tension.' },
      { bracket: '3-10 hrs', minHours: 3, maxHours: 10, ratingAvg: 4.8, sampleCount: 190, dropRatePercent: 3, sentimentSummary: 'Brookhaven Hospital and Pyramid Head encounters are masterfully restored.' },
      { bracket: '10-18 hrs', minHours: 10, maxHours: 18, ratingAvg: 4.9, sampleCount: 120, dropRatePercent: 2, sentimentSummary: 'Lakeview Hotel videotape climax leaves long-time skeptics in reverence.' },
    ],
  },
  {
    id: 'resident-evil-4',
    slug: 'resident-evil-4',
    title: 'Resident Evil 4 (Remake)',
    developer: 'CAPCOM',
    publisher: 'CAPCOM',
    releaseYear: 2023,
    platforms: ['PC', 'PS5', 'XBOX'],
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    genres: ['Action Horror', 'Survival Horror', 'Third-Person Shooter'],
    tagline: 'Survival is only the beginning in this Spanish village nightmare.',
    synopsis: 'Six years after the Raccoon City catastrophe, agent Leon S. Kennedy is sent on a mission to rescue the president kidnapped daughter from a secluded European village governed by a sinister parasite cult.',
    metrics: {
      averageRating: 4.8,
      totalReviews: 720,
      completionRatePercent: 66,
      medianHoursToBeat: 16.0,
      communityPillars: {
        gameplay: 5.0,
        narrative: 4.3,
        visuals: 4.9,
        audio: 4.7,
        polish: 4.9,
      },
      ratingHistogram: [1, 2, 4, 7, 15, 30, 68, 145, 260, 188],
    },
    playtimeHorizon: [
      { bracket: '< 2 hrs', minHours: 0, maxHours: 2, ratingAvg: 4.6, sampleCount: 80, dropRatePercent: 5, sentimentSummary: 'Iconic village square chainsaw fight tests knife-parry mechanics immediately.' },
      { bracket: '2-10 hrs', minHours: 2, maxHours: 10, ratingAvg: 4.9, sampleCount: 360, dropRatePercent: 2, sentimentSummary: 'Salazar castle and Garrador labyrinth maintain relentless momentum.' },
      { bracket: '10-18 hrs', minHours: 10, maxHours: 18, ratingAvg: 4.8, sampleCount: 280, dropRatePercent: 1, sentimentSummary: 'Regenerador thermal scope encounters and Krauser duel cement perfection.' },
    ],
  },
  {
    id: 'final-fantasy-vii-rebirth',
    slug: 'final-fantasy-vii-rebirth',
    title: 'Final Fantasy VII Rebirth',
    developer: 'Square Enix',
    publisher: 'Square Enix',
    releaseYear: 2024,
    platforms: ['PS5', 'PC'],
    coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600&auto=format&fit=crop',
    genres: ['Action RPG', 'Fantasy', 'Open World', 'Party-Based'],
    tagline: 'The unknown journey continues beyond Midgar.',
    synopsis: 'Cloud and his comrades escape the dystopian city of Midgar and pursue Sephiroth across the planet. Boasting an expansive open world, Queen Blood card game, and breathtaking synergy battle mechanics.',
    metrics: {
      averageRating: 4.7,
      totalReviews: 580,
      completionRatePercent: 43,
      medianHoursToBeat: 68.0,
      communityPillars: {
        gameplay: 4.9,
        narrative: 4.6,
        visuals: 4.8,
        audio: 5.0,
        polish: 4.5,
      },
      ratingHistogram: [2, 3, 6, 10, 18, 36, 70, 130, 180, 125],
    },
    playtimeHorizon: [
      { bracket: '< 6 hrs', minHours: 0, maxHours: 6, ratingAvg: 4.5, sampleCount: 90, dropRatePercent: 7, sentimentSummary: 'Kalm flashback and Grasslands open world onboarding.' },
      { bracket: '6-30 hrs', minHours: 6, maxHours: 30, ratingAvg: 4.8, sampleCount: 270, dropRatePercent: 4, sentimentSummary: 'Junon parade and Golden Saucer date chapters deliver unmatched joy.' },
      { bracket: '30-75 hrs', minHours: 30, maxHours: 75, ratingAvg: 4.7, sampleCount: 220, dropRatePercent: 3, sentimentSummary: 'Cosmo Canyon lore and Forgotten Capital climax resonate deeply.' },
    ],
  },
  {
    id: 'armored-core-vi',
    slug: 'armored-core-vi',
    title: 'Armored Core VI: Fires of Rubicon',
    developer: 'FromSoftware',
    publisher: 'Bandai Namco',
    releaseYear: 2023,
    platforms: ['PC', 'PS5', 'XBOX', 'DECK'],
    coverUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1600&auto=format&fit=crop',
    genres: ['Mecha', 'Action', 'Sci-Fi', 'Customization', 'Fast-Paced'],
    tagline: 'Feed the fire. Let the last cinders burn on Rubicon 3.',
    synopsis: 'Pilot your customized Armored Core in omnidirectional 3D mech combat. Take contracts from ruthless corporations, outmaneuver PCA battleships, and make tragic geopolitical choices on an ash-choked planet.',
    metrics: {
      averageRating: 4.7,
      totalReviews: 490,
      completionRatePercent: 51,
      medianHoursToBeat: 21.0,
      communityPillars: {
        gameplay: 5.0,
        narrative: 4.6,
        visuals: 4.8,
        audio: 4.7,
        polish: 4.9,
      },
      ratingHistogram: [1, 2, 4, 7, 14, 26, 55, 110, 160, 111],
    },
    playtimeHorizon: [
      { bracket: '< 3 hrs', minHours: 0, maxHours: 3, ratingAvg: 3.8, sampleCount: 110, dropRatePercent: 24, sentimentSummary: 'Filter helicopter in tutorial weeded out thousands of non-mech enthusiasts.' },
      { bracket: '3-12 hrs', minHours: 3, maxHours: 12, ratingAvg: 4.8, sampleCount: 220, dropRatePercent: 4, sentimentSummary: 'BALTEUS missile storm forces players to rethink assembly builds.' },
      { bracket: '12-30 hrs', minHours: 12, maxHours: 30, ratingAvg: 5.0, sampleCount: 160, dropRatePercent: 1, sentimentSummary: 'Triple playthrough NG++ true ending rewards absolute assembly mastery.' },
    ],
  },
  {
    id: 'god-of-war-ragnarok',
    slug: 'god-of-war-ragnarok',
    title: 'God of War Ragnarök',
    developer: 'Santa Monica Studio',
    publisher: 'Sony Interactive Entertainment',
    releaseYear: 2022,
    platforms: ['PS5', 'PC'],
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    genres: ['Action-Adventure', 'Mythology', 'Cinematic', 'Story Rich'],
    tagline: 'Embark on an epic and heartfelt journey as Kratos and Atreus struggle with holding on and letting go.',
    synopsis: 'Fimbulwinter is well underway. Kratos and Atreus must journey to each of the Nine Realms in search of answers as Asgardian forces prepare for a prophesied battle that will end the world.',
    metrics: {
      averageRating: 4.8,
      totalReviews: 810,
      completionRatePercent: 57,
      medianHoursToBeat: 38.0,
      communityPillars: {
        gameplay: 4.7,
        narrative: 4.9,
        visuals: 5.0,
        audio: 4.9,
        polish: 4.8,
      },
      ratingHistogram: [1, 2, 4, 9, 18, 38, 72, 160, 280, 226],
    },
    playtimeHorizon: [
      { bracket: '< 5 hrs', minHours: 0, maxHours: 5, ratingAvg: 4.6, sampleCount: 90, dropRatePercent: 5, sentimentSummary: 'Thor sledgehammer brawl at the cabin sets earth-shattering standard.' },
      { bracket: '5-20 hrs', minHours: 5, maxHours: 20, ratingAvg: 4.8, sampleCount: 380, dropRatePercent: 3, sentimentSummary: 'Draupnir spear acquisition and Vanaheim jungle exploration stun.' },
      { bracket: '20-45 hrs', minHours: 20, maxHours: 45, ratingAvg: 4.9, sampleCount: 340, dropRatePercent: 1, sentimentSummary: 'Odin showdown and Kratos final shrine realization provide tearful closure.' },
    ],
  },
  {
    id: 'celeste',
    slug: 'celeste',
    title: 'Celeste',
    developer: 'Maddy Makes Games',
    publisher: 'Maddy Makes Games',
    releaseYear: 2018,
    platforms: ['PC', 'PS5', 'XBOX', 'SWITCH', 'DECK'],
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?q=80&w=1600&auto=format&fit=crop',
    genres: ['Platformer', 'Precision', 'Indie', 'Pixel Graphics', 'Mental Health'],
    tagline: 'Help Madeline survive her inner demons on her journey to the top of Celeste Mountain.',
    synopsis: 'A tight, hand-crafted precision platformer where every jump, dash, and climb mirrors Madeline internal struggle with anxiety and self-acceptance. Scored by Lena Raine immortal synth soundtrack.',
    metrics: {
      averageRating: 4.9,
      totalReviews: 680,
      completionRatePercent: 48,
      medianHoursToBeat: 12.0,
      communityPillars: {
        gameplay: 5.0,
        narrative: 4.9,
        visuals: 4.7,
        audio: 5.0,
        polish: 5.0,
      },
      ratingHistogram: [1, 1, 2, 4, 8, 16, 42, 90, 230, 286],
    },
    playtimeHorizon: [
      { bracket: '< 2 hrs', minHours: 0, maxHours: 2, ratingAvg: 4.5, sampleCount: 80, dropRatePercent: 8, sentimentSummary: 'City and Celestial Resort introduce tight dash mechanics.' },
      { bracket: '2-8 hrs', minHours: 2, maxHours: 8, ratingAvg: 4.9, sampleCount: 340, dropRatePercent: 3, sentimentSummary: 'Mirror Temple and breathing feather exercise strike emotional chord.' },
      { bracket: '8-20 hrs', minHours: 8, maxHours: 20, ratingAvg: 5.0, sampleCount: 260, dropRatePercent: 1, sentimentSummary: 'Summit ascent and Farewell DLC stand as gold standard of 2D game feel.' },
    ],
  },
  {
    id: 'slay-the-spire',
    slug: 'slay-the-spire',
    title: 'Slay the Spire',
    developer: 'Mega Crit Games',
    publisher: 'Humble Games',
    releaseYear: 2019,
    platforms: ['PC', 'PS5', 'XBOX', 'SWITCH', 'DECK'],
    coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600&auto=format&fit=crop',
    genres: ['Roguelike Deckbuilder', 'Card Battler', 'Strategy', 'Turn-Based'],
    tagline: 'Craft a unique deck, encounter bizarre creatures, and discover relics of immense power.',
    synopsis: 'The progenitor and crowning monarch of the roguelike deckbuilding revolution. Fuse card synergies, calculate enemy intents, and climb the spire across four brilliantly asymmetric character archetypes.',
    metrics: {
      averageRating: 4.9,
      totalReviews: 920,
      completionRatePercent: 62,
      medianHoursToBeat: 45.0,
      communityPillars: {
        gameplay: 5.0,
        narrative: 3.8,
        visuals: 4.3,
        audio: 4.5,
        polish: 5.0,
      },
      ratingHistogram: [1, 1, 3, 6, 12, 22, 54, 110, 310, 401],
    },
    playtimeHorizon: [
      { bracket: '< 5 hrs', minHours: 0, maxHours: 5, ratingAvg: 4.5, sampleCount: 90, dropRatePercent: 6, sentimentSummary: 'First victory with Ironclad strength builds creates immediate obsession.' },
      { bracket: '5-30 hrs', minHours: 5, maxHours: 30, ratingAvg: 4.9, sampleCount: 380, dropRatePercent: 2, sentimentSummary: 'Silent poison/shiv synergies and Defect lightning orbs multiply depth.' },
      { bracket: '30-100+ hrs', minHours: 30, maxHours: 200, ratingAvg: 5.0, sampleCount: 450, dropRatePercent: 0, sentimentSummary: 'Ascension 20 heart runs represent mathematical perfection in game design.' },
    ],
  },
  {
    id: 'stardew-valley',
    slug: 'stardew-valley',
    title: 'Stardew Valley',
    developer: 'ConcernedApe',
    publisher: 'ConcernedApe',
    releaseYear: 2016,
    platforms: ['PC', 'PS5', 'XBOX', 'SWITCH', 'DECK'],
    coverUrl: 'https://images.unsplash.com/photo-1533158307587-828f0a76ef46?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    genres: ['Farming Sim', 'Life Sim', 'RPG', 'Co-op', 'Relaxing'],
    tagline: 'You have inherited your grandfather old farm plot in Stardew Valley.',
    synopsis: 'Armed with hand-me-down tools and a few coins, set out to begin your new life. Turn overgrown fields into a thriving pastoral paradise, befriend townsfolk, uncover secrets in the mines, and escape corporate burnout.',
    metrics: {
      averageRating: 4.9,
      totalReviews: 1100,
      completionRatePercent: 68,
      medianHoursToBeat: 54.0,
      communityPillars: {
        gameplay: 4.9,
        narrative: 4.7,
        visuals: 4.8,
        audio: 5.0,
        polish: 5.0,
      },
      ratingHistogram: [1, 1, 2, 4, 8, 18, 48, 120, 360, 538],
    },
    playtimeHorizon: [
      { bracket: '< 10 hrs', minHours: 0, maxHours: 10, ratingAvg: 4.6, sampleCount: 120, dropRatePercent: 4, sentimentSummary: 'First spring planting parsnips and meeting Pelican Town residents.' },
      { bracket: '10-40 hrs', minHours: 10, maxHours: 40, ratingAvg: 4.9, sampleCount: 460, dropRatePercent: 1, sentimentSummary: 'Community center bundles completed, greenhouse unlocked, true comfort.' },
      { bracket: '40-100+ hrs', minHours: 40, maxHours: 250, ratingAvg: 5.0, sampleCount: 520, dropRatePercent: 0, sentimentSummary: 'Ginger Island expansion and perfection tracker make it forever game.' },
    ],
  },
  {
    id: 'mass-effect-legendary',
    slug: 'mass-effect-legendary',
    title: 'Mass Effect Legendary Edition',
    developer: 'BioWare',
    publisher: 'Electronic Arts',
    releaseYear: 2021,
    platforms: ['PC', 'PS5', 'XBOX', 'DECK'],
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1600&auto=format&fit=crop',
    genres: ['Sci-Fi', 'RPG', 'Third-Person Shooter', 'Story Rich', 'Space'],
    tagline: 'Relive the cinematic space opera saga of Commander Shepard.',
    synopsis: 'Experience the entire unforgettable sci-fi trilogy remastered in 4K. Command the Normandy, unite alien civilizations against the cosmic Reaper threat, and make choices that echo across three full games.',
    metrics: {
      averageRating: 4.9,
      totalReviews: 870,
      completionRatePercent: 59,
      medianHoursToBeat: 65.0,
      communityPillars: {
        gameplay: 4.4,
        narrative: 5.0,
        visuals: 4.7,
        audio: 4.9,
        polish: 4.6,
      },
      ratingHistogram: [1, 2, 4, 7, 14, 28, 58, 140, 290, 326],
    },
    playtimeHorizon: [
      { bracket: '< 10 hrs', minHours: 0, maxHours: 10, ratingAvg: 4.4, sampleCount: 110, dropRatePercent: 9, sentimentSummary: 'Citadel political exposition in ME1 requires patience before space opera ignites.' },
      { bracket: '10-35 hrs', minHours: 10, maxHours: 35, ratingAvg: 4.9, sampleCount: 390, dropRatePercent: 3, sentimentSummary: 'Mass Effect 2 suicide mission is widely considered one of the greatest climaxes in video games.' },
      { bracket: '35-70 hrs', minHours: 35, maxHours: 70, ratingAvg: 4.9, sampleCount: 370, dropRatePercent: 2, sentimentSummary: 'Tuchanka genophage cure and Rannoch resolution leave unforgettable marks.' },
    ],
  },
  {
    id: 'half-life-alyx',
    slug: 'half-life-alyx',
    title: 'Half-Life: Alyx',
    developer: 'Valve',
    publisher: 'Valve',
    releaseYear: 2020,
    platforms: ['PC'],
    coverUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1600&auto=format&fit=crop',
    genres: ['VR', 'Sci-Fi', 'FPS', 'Horror', 'Physics'],
    tagline: 'Valve return to the Half-Life series in virtual reality.',
    synopsis: 'Set between Half-Life and Half-Life 2, Alyx Vance and her father Eli mount an early resistance to the Combine brutal occupation of Earth. Gravity gloves, visceral headcrab horror, and unsurpassed physical tactile interaction.',
    metrics: {
      averageRating: 4.9,
      totalReviews: 540,
      completionRatePercent: 71,
      medianHoursToBeat: 14.5,
      communityPillars: {
        gameplay: 5.0,
        narrative: 4.8,
        visuals: 5.0,
        audio: 5.0,
        polish: 5.0,
      },
      ratingHistogram: [1, 1, 2, 4, 8, 15, 34, 75, 170, 230],
    },
    playtimeHorizon: [
      { bracket: '< 3 hrs', minHours: 0, maxHours: 3, ratingAvg: 4.7, sampleCount: 70, dropRatePercent: 4, sentimentSummary: 'City 17 balcony interaction and gravity gloves instantly demonstrate VR apex.' },
      { bracket: '3-8 hrs', minHours: 3, maxHours: 8, ratingAvg: 5.0, sampleCount: 240, dropRatePercent: 2, sentimentSummary: 'The Jeff stealth distillery chapter is a masterwork in terrifying sound design.' },
      { bracket: '8-15 hrs', minHours: 8, maxHours: 15, ratingAvg: 5.0, sampleCount: 230, dropRatePercent: 1, sentimentSummary: 'The Vault finale and post-credits stinger rewrote Half-Life lore forever.' },
    ],
  },
];

export const INITIAL_PROFILES: CriticProfile[] = [
  {
    id: 'user-valkyrie',
    username: 'Elena "Valkyrie" Vance',
    bio: 'Archivist of Dark Fantasy and narrative architecture. Seeking games where environmental design tells the unspoken history of dying worlds.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    criticTier: 'TOP_CRITIC',
    topFourGameIds: ['elden-ring', 'bloodborne', 'baldurs-gate-3', 'disco-elysium'],
    stats: {
      totalGamesLogged: 218,
      totalReviewsWritten: 64,
      hoursLoggedThisYear: 894,
      meanRating: 4.4,
      signaturePillar: 'narrative',
    },
    tasteVector: {
      gameplay: 4.4,
      narrative: 5.0,
      visuals: 4.8,
      audio: 4.6,
      polish: 4.2,
    },
    activityHeatmap: generateSeedHeatmap(0.85),
    shelves: {
      'elden-ring': 'MASTERED_100',
      'bloodborne': 'MASTERED_100',
      'baldurs-gate-3': 'BEATEN',
      'disco-elysium': 'BEATEN',
      'hades-2': 'PLAYING',
      'cyberpunk-2077': 'BEATEN',
      'alan-wake-2': 'BEATEN',
      'sekiro': 'BEATEN',
    },
  },
  {
    id: 'user-frameperfect',
    username: 'Marcus "FramePerfect" Chen',
    bio: 'Hitbox snob, parry timing obsessive, and frame data analyst. If the input latency is sloppy, no amount of narrative prose will save it.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1600&auto=format&fit=crop',
    criticTier: 'TOP_CRITIC',
    topFourGameIds: ['sekiro', 'hollow-knight', 'celeste', 'armored-core-vi'],
    stats: {
      totalGamesLogged: 342,
      totalReviewsWritten: 88,
      hoursLoggedThisYear: 1120,
      meanRating: 4.1,
      signaturePillar: 'gameplay',
    },
    tasteVector: {
      gameplay: 5.0,
      narrative: 3.5,
      visuals: 4.2,
      audio: 4.5,
      polish: 5.0,
    },
    activityHeatmap: generateSeedHeatmap(0.92),
    shelves: {
      'sekiro': 'MASTERED_100',
      'hollow-knight': 'MASTERED_100',
      'celeste': 'MASTERED_100',
      'armored-core-vi': 'MASTERED_100',
      'slay-the-spire': 'BEATEN',
      'resident-evil-4': 'BEATEN',
      'elden-ring': 'BEATEN',
      'the-witcher-3': 'DROPPED',
    },
  },
  {
    id: 'user-aesthetic',
    username: 'Sophia "AestheticDream" Laurent',
    bio: 'Former architectural lighting designer turned video game art critic. Obsessed with color grading, specular illumination, and surrealist art direction.',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1600&auto=format&fit=crop',
    criticTier: 'VETERAN',
    topFourGameIds: ['cyberpunk-2077', 'alan-wake-2', 'outer-wilds', 'persona-5-royal'],
    stats: {
      totalGamesLogged: 164,
      totalReviewsWritten: 45,
      hoursLoggedThisYear: 610,
      meanRating: 4.3,
      signaturePillar: 'visuals',
    },
    tasteVector: {
      gameplay: 4.0,
      narrative: 4.6,
      visuals: 5.0,
      audio: 4.8,
      polish: 4.5,
    },
    activityHeatmap: generateSeedHeatmap(0.74),
    shelves: {
      'cyberpunk-2077': 'MASTERED_100',
      'alan-wake-2': 'BEATEN',
      'outer-wilds': 'BEATEN',
      'persona-5-royal': 'BEATEN',
      'silent-hill-2': 'PLAYING',
      'zelda-totk': 'BEATEN',
    },
  },
  {
    id: 'user-synthwave',
    username: 'Dax "SynthWave" Thorne',
    bio: 'Modular synth musician and game audio nerd. Can tell a sound designer emotional intent through a single low-pass filter sweep.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?q=80&w=1600&auto=format&fit=crop',
    criticTier: 'VETERAN',
    topFourGameIds: ['hades-2', 'silent-hill-2', 'outer-wilds', 'bloodborne'],
    stats: {
      totalGamesLogged: 195,
      totalReviewsWritten: 52,
      hoursLoggedThisYear: 740,
      meanRating: 4.5,
      signaturePillar: 'audio',
    },
    tasteVector: {
      gameplay: 4.3,
      narrative: 4.4,
      visuals: 4.5,
      audio: 5.0,
      polish: 4.6,
    },
    activityHeatmap: generateSeedHeatmap(0.81),
    shelves: {
      'hades-2': 'PLAYING',
      'silent-hill-2': 'BEATEN',
      'outer-wilds': 'MASTERED_100',
      'bloodborne': 'BEATEN',
      'celeste': 'BEATEN',
      'stardew-valley': 'BEATEN',
    },
  },
  {
    id: 'user-bughunter',
    username: 'Riley "BugHunter" Miller',
    bio: 'Systems software engineer & QA evangelist. I stress-test boundary physics, inspect GPU frame pacing spikes, and critique UI responsiveness.',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=400&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1600&auto=format&fit=crop',
    criticTier: 'NOVICE',
    topFourGameIds: ['half-life-alyx', 'slay-the-spire', 'stardew-valley', 'zelda-totk'],
    stats: {
      totalGamesLogged: 140,
      totalReviewsWritten: 38,
      hoursLoggedThisYear: 530,
      meanRating: 4.0,
      signaturePillar: 'polish',
    },
    tasteVector: {
      gameplay: 4.6,
      narrative: 3.8,
      visuals: 4.4,
      audio: 4.3,
      polish: 5.0,
    },
    activityHeatmap: generateSeedHeatmap(0.68),
    shelves: {
      'half-life-alyx': 'MASTERED_100',
      'slay-the-spire': 'BEATEN',
      'stardew-valley': 'MASTERED_100',
      'zelda-totk': 'BEATEN',
      'cyberpunk-2077': 'DROPPED',
      'elden-ring': 'BEATEN',
    },
  },
];

export const INITIAL_LISTS: QuestList[] = [
  {
    id: 'list-detective-no-handholding',
    title: "Detective Games That Don't Hold Your Hand",
    description: "No yellow paint, no glowing detective visions, no automated deduction prompts. Pure deductive inference where the player alone bridges the logical chasm.",
    curator: {
      id: 'user-valkyrie',
      username: 'Elena "Valkyrie" Vance',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
      criticTier: 'TOP_CRITIC',
    },
    gameIds: ['disco-elysium', 'outer-wilds', 'alan-wake-2'],
    notes: {
      'disco-elysium': 'The thought cabinet turns your own political and psychological neuroses into clues. Trust no internal voice without cross-referencing Kim notes.',
      'outer-wilds': 'Your ship computer rumor map is your only persistent save file. Progression is pure organic epistemic discovery.',
      'alan-wake-2': 'The Mind Place case board gives you the physical joy of pinning polaroids and linking twine across cold case murders.',
    },
    likesCount: 184,
    tags: ['Detective', 'Investigation', 'Hardcore', 'Mystery'],
    createdAt: '2024-02-14T10:00:00Z',
  },
  {
    id: 'list-precision-combat-apex',
    title: 'The Steel Symphony: God-Tier Parry & Combat Loops',
    description: 'Games where combat is elevated to an interactive percussive dance. One frame late is instant defeat; rhythmic perfection brings absolute mastery.',
    curator: {
      id: 'user-frameperfect',
      username: 'Marcus "FramePerfect" Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
      criticTier: 'TOP_CRITIC',
    },
    gameIds: ['sekiro', 'hollow-knight', 'armored-core-vi', 'bloodborne'],
    notes: {
      'sekiro': 'Deflection sound cues are tuned so crisply you could beat Genichiro blindfolded purely by the acoustic resonance of clashing steel.',
      'hollow-knight': 'Nail pogoing across spikes and mantis scythes feels like wielding surgical precision in 2D space.',
      'armored-core-vi': 'Stagger accumulation and reverse-joint boost kicking rewrite 3D spatial awareness.',
      'bloodborne': 'Rally mechanic weaponizes instinct: when struck, strike back twice as hard before your blood coagulates.',
    },
    likesCount: 246,
    tags: ['Combat Mechanics', 'Skill Ceiling', 'Parry', 'Precision'],
    createdAt: '2024-03-01T15:30:00Z',
  },
  {
    id: 'list-sublime-atmospheres',
    title: 'Cinematic Obsidian: Uncompromising Visual & Audio Moods',
    description: 'When games transcend conventional entertainment and deliver sensory experiences so potent they linger in your thoughts for years.',
    curator: {
      id: 'user-aesthetic',
      username: 'Sophia "AestheticDream" Laurent',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop',
      criticTier: 'VETERAN',
    },
    gameIds: ['cyberpunk-2077', 'silent-hill-2', 'alan-wake-2', 'persona-5-royal'],
    notes: {
      'cyberpunk-2077': 'Full path tracing in Night City rainy backalleys is currently the apex of computer graphics artistry.',
      'silent-hill-2': 'Akira Yamaoka reworked score coupled with volumetric fog makes every apartment hallway an exercise in slow breathing.',
      'alan-wake-2': 'Remedy blends live-action film projections into dark place alleyways with breathtaking surreal audacity.',
      'persona-5-royal': 'Every UI menu transition, battle results screen, and jazz saxophone flourish exudes liquid style.',
    },
    likesCount: 158,
    tags: ['Atmosphere', 'Visual Direction', 'Audio Design', 'Immersion'],
    createdAt: '2024-04-12T18:00:00Z',
  },
];

// Helper to generate a realistic 365-day play diary heatmap
function generateSeedHeatmap(density: number) {
  const result: { date: string; hoursPlayed: number; reviewCount: number }[] = [];
  const today = new Date();
  
  for (let i = 365; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Pseudo-random distribution based on day of week and density
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseChance = isWeekend ? density * 1.3 : density * 0.7;
    
    if (Math.random() < baseChance) {
      const hours = Math.round((Math.random() * (isWeekend ? 8 : 4) + 0.5) * 10) / 10;
      const reviewCount = Math.random() < 0.08 ? 1 : 0;
      result.push({ date: dateStr, hoursPlayed: hours, reviewCount });
    } else {
      result.push({ date: dateStr, hoursPlayed: 0, reviewCount: 0 });
    }
  }
  return result;
}

// Function to generate 150+ realistic multi-pillar reviews with spoiler blocks, completion stamps, and telemetry
export function generateInitialReviews(): GameReview[] {
  const reviews: GameReview[] = [];
  let reviewIdCounter = 1;

  const criticPool = INITIAL_PROFILES;
  const extraNoviceCritics = [
    { id: 'user-novice-1', username: 'Kaelen_Echo', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop', criticTier: 'NOVICE' as const },
    { id: 'user-novice-2', username: 'PixelKnight99', avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=400&auto=format&fit=crop', criticTier: 'NOVICE' as const },
    { id: 'user-novice-3', username: 'Aria_Solstice', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop', criticTier: 'VETERAN' as const },
    { id: 'user-novice-4', username: 'GamerGrave', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop', criticTier: 'NOVICE' as const },
    { id: 'user-novice-5', username: 'LoreKeeper_Dan', avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=400&auto=format&fit=crop', criticTier: 'VETERAN' as const },
  ];
  const allAuthors = [...criticPool, ...extraNoviceCritics];

  // Specific bespoke flagship reviews by our named critics
  const flagshipReviews: Partial<GameReview>[] = [
    {
      gameId: 'elden-ring',
      author: {
        id: criticPool[0].id,
        username: criticPool[0].username,
        avatarUrl: criticPool[0].avatarUrl,
        criticTier: criticPool[0].criticTier,
        tasteMatchPercent: 96,
      },
      starRating: 5.0,
      isMasterpiece: true,
      pillars: { gameplay: 5.0, narrative: 4.8, visuals: 5.0, audio: 4.8, polish: 4.4 },
      completionStatus: 'MASTERED_100',
      playtimeHours: 148.5,
      platformPlayed: 'PC',
      patchVersion: 'v1.08',
      bodyMarkdown: `Elden Ring is not merely an evolution of the Souls formula; it is FromSoftware crowning cosmological achievement. What makes the Lands Between so astonishing is how spatial revelation mirrors narrative archaeology. Every subterranean elevator shaft plunging into the Siofra River under a faux-nebula ceiling resets your comprehension of the game scale.

>!The narrative turning point at Leyndell, when you set the Erdtree ablaze and walk through the ash-buried capital, recontextualizes Marika fractured family as victims of outer will tyranny rather than simple tyrannical gods.!<

The combat loop accommodates hundreds of distinct builds without diluting boss majesty. While late-game balance around the Haligtree occasionally relies on aggressive tracking, the sheer ambition and atmospheric gravity make this an undeniable milestone in gaming history.`,
      likedCount: 88,
      createdAt: '2024-01-15T14:20:00Z',
    },
    {
      gameId: 'sekiro',
      author: {
        id: criticPool[1].id,
        username: criticPool[1].username,
        avatarUrl: criticPool[1].avatarUrl,
        criticTier: criticPool[1].criticTier,
        tasteMatchPercent: 94,
      },
      starRating: 5.0,
      isMasterpiece: true,
      pillars: { gameplay: 5.0, narrative: 4.4, visuals: 4.8, audio: 4.8, polish: 5.0 },
      completionStatus: 'MASTERED_100',
      playtimeHours: 92.0,
      platformPlayed: 'PC',
      patchVersion: 'v1.06',
      bodyMarkdown: `Pure kinetic truth. Sekiro removes the crutches of stat grinding, armor optimization, and summon assistance, forcing you to look your opponent in the eyes and trade rhythmic parries. The posture bar is the greatest mechanical invention in modern third-person melee design.

>!When Sword Saint Isshin pulls out a spear and automatic pistol in Phase 2 in the silvergrass field, it should feel ridiculous, but instead it stands as the ultimate test of every mechanical discipline the game taught you.!<

There is zero latency bloat or visual clutter. A locked 60fps surgical combat engine that ruined lesser action games for me permanently.`,
      likedCount: 114,
      createdAt: '2024-02-10T19:45:00Z',
    },
    {
      gameId: 'cyberpunk-2077',
      author: {
        id: criticPool[2].id,
        username: criticPool[2].username,
        avatarUrl: criticPool[2].avatarUrl,
        criticTier: criticPool[2].criticTier,
        tasteMatchPercent: 91,
      },
      starRating: 5.0,
      isMasterpiece: true,
      pillars: { gameplay: 4.6, narrative: 5.0, visuals: 5.0, audio: 5.0, polish: 4.6 },
      completionStatus: 'MASTERED_100',
      playtimeHours: 84.0,
      platformPlayed: 'PC',
      patchVersion: 'v2.1',
      bodyMarkdown: `With the 2.0 overhaul and the Phantom Liberty expansion, Cyberpunk 2077 has fulfilled its destiny as the definitive modern cyberpunk opus. Night City is an architectural miracle—the vertical density, brutalist mega-structures, and ray-traced neon mist create a suffocating, intoxicating sensory immersion.

>!The betrayal at the spaceport launchpad with Songbird and Solomon Reed broke me. Choosing to put Songbird on the shuttle to the moon while executing Reed in the rain is one of the most morally crushing moments in contemporary storytelling.!<

Idris Elba performance grounds Dogtown in heavy political melancholy. An absolute triumph of world design and audiovisual craft.`,
      likedCount: 76,
      createdAt: '2024-03-05T11:15:00Z',
    },
    {
      gameId: 'hollow-knight',
      author: {
        id: criticPool[1].id,
        username: criticPool[1].username,
        avatarUrl: criticPool[1].avatarUrl,
        criticTier: criticPool[1].criticTier,
        tasteMatchPercent: 95,
      },
      starRating: 5.0,
      isMasterpiece: true,
      pillars: { gameplay: 5.0, narrative: 4.8, visuals: 5.0, audio: 5.0, polish: 4.9 },
      completionStatus: 'MASTERED_100',
      playtimeHours: 68.0,
      platformPlayed: 'DECK',
      patchVersion: 'v1.5',
      bodyMarkdown: `Hallownest is the crown jewel of the Metroidvania genre. What Team Cherry achieved with a three-person team defies industry logic. Every room possesses distinctive acoustic identity and hand-drawn micro-detail.

>!Stumbling into the Abyss and discovering thousands of discarded sibling shells, then ascending with the Void Heart to confront the Radiance within the Hollow Knight mind, delivers mythological storytelling at its purest.!<

The tight jump physics, zero inertia turnaround, and charm badge build customization set the gold standard for 2D platforming feel.`,
      likedCount: 92,
      createdAt: '2024-01-20T16:00:00Z',
    },
    {
      gameId: 'disco-elysium',
      author: {
        id: criticPool[0].id,
        username: criticPool[0].username,
        avatarUrl: criticPool[0].avatarUrl,
        criticTier: criticPool[0].criticTier,
        tasteMatchPercent: 97,
      },
      starRating: 5.0,
      isMasterpiece: true,
      pillars: { gameplay: 4.2, narrative: 5.0, visuals: 4.9, audio: 5.0, polish: 4.4 },
      completionStatus: 'BEATEN',
      playtimeHours: 41.5,
      platformPlayed: 'PC',
      patchVersion: 'v1.4',
      bodyMarkdown: `A staggering literary monument masquerading as a computer role-playing game. ZA/UM transformed internal monologue into a sprawling dialogue tree where your own Encyclopedia, Conceptualization, and Inland Empire bicker like disgraced academics in a dive bar.

>!The communion with the Insulindian Phasmid in the coastal reeds, combined with British Sea Power delicate horns, is a sublime meditation on human grief, ecological loss, and persistent wonder in the face of political despair.!<

Lieutenant Kim Kitsuragi is simply the finest companion character ever written for a video game. Read every word.`,
      likedCount: 130,
      createdAt: '2024-02-18T22:10:00Z',
    },
    {
      gameId: 'outer-wilds',
      author: {
        id: criticPool[3].id,
        username: criticPool[3].username,
        avatarUrl: criticPool[3].avatarUrl,
        criticTier: criticPool[3].criticTier,
        tasteMatchPercent: 93,
      },
      starRating: 5.0,
      isMasterpiece: true,
      pillars: { gameplay: 4.9, narrative: 5.0, visuals: 4.7, audio: 5.0, polish: 4.8 },
      completionStatus: 'MASTERED_100',
      playtimeHours: 28.0,
      platformPlayed: 'PC',
      patchVersion: 'v1.1',
      bodyMarkdown: `Outer Wilds cannot be replayed. Once you possess the knowledge of the universe, you can reach the ending within twenty minutes. This singular design philosophy makes it a once-in-a-lifetime experience.

>!Roasting a marshmallow around the quantum campfire at the Eye of the Universe with the projections of your traveler friends playing banjo, harmonica, and cello as a new cosmos is born brought tears to my eyes.!<

The banjo theme by Andrew Prahlow remains permanently etched in my soul. Play this completely blind.`,
      likedCount: 104,
      createdAt: '2024-03-22T09:30:00Z',
    },
  ];

  // Insert bespoke reviews
  flagshipReviews.forEach((r) => {
    reviews.push({
      id: `rev-${reviewIdCounter++}`,
      gameId: r.gameId!,
      author: r.author!,
      starRating: r.starRating!,
      isMasterpiece: r.isMasterpiece!,
      pillars: r.pillars!,
      completionStatus: r.completionStatus!,
      playtimeHours: r.playtimeHours!,
      platformPlayed: r.platformPlayed!,
      patchVersion: r.patchVersion!,
      bodyMarkdown: r.bodyMarkdown!,
      likedCount: r.likedCount!,
      createdAt: r.createdAt!,
    });
  });

  // Now procedurally generate diverse reviews across all 25+ games to exceed 160 total reviews
  const platforms = ['PC', 'PS5', 'XBOX', 'SWITCH', 'DECK'];
  const shelfStatuses = ['BEATEN', 'MASTERED_100', 'DROPPED', 'PLAYING', 'BACKLOG'] as const;

  INITIAL_GAMES.forEach((game) => {
    // Generate between 5 to 9 reviews per game
    const reviewsForThisGame = Math.floor(Math.random() * 4) + 6;

    for (let i = 0; i < reviewsForThisGame; i++) {
      const author = allAuthors[(reviewIdCounter + i) % allAuthors.length];
      
      // Determine star rating around game's average
      const baseRating = game.metrics.averageRating;
      const variation = (Math.random() * 1.5 - 0.7);
      let starRating = Math.round((baseRating + variation) * 2) / 2;
      starRating = Math.max(0.5, Math.min(5.0, starRating));

      const isMasterpiece = starRating === 5.0 && Math.random() < 0.4;
      const completionStatus = starRating < 3.0 ? 'DROPPED' : (Math.random() < 0.35 ? 'MASTERED_100' : 'BEATEN');
      
      const playtimeHours = completionStatus === 'DROPPED' 
        ? Math.round((Math.random() * 8 + 1.5) * 10) / 10
        : Math.round((game.metrics.medianHoursToBeat * (0.6 + Math.random() * 0.8)) * 10) / 10;

      const platformPlayed = game.platforms[Math.floor(Math.random() * game.platforms.length)];
      const patchVersion = `v1.0${Math.floor(Math.random() * 6)}`;

      // Generate 5-pillar scores centered around game community pillars
      const p = game.metrics.communityPillars;
      const pillars: PillarBreakdown = {
        gameplay: clampPillar(p.gameplay + (Math.random() * 1.0 - 0.5)),
        narrative: clampPillar(p.narrative + (Math.random() * 1.0 - 0.5)),
        visuals: clampPillar(p.visuals + (Math.random() * 1.0 - 0.5)),
        audio: clampPillar(p.audio + (Math.random() * 1.0 - 0.5)),
        polish: clampPillar(p.polish + (Math.random() * 1.0 - 0.5)),
      };

      const hasSpoiler = Math.random() < 0.45;
      const spoilerContent = hasSpoiler 
        ? `\n\n>!The mid-game twist regarding ${game.title}'s core mystery completely subverts player expectations and upends the political status quo.!<`
        : '';

      const proseTemplates = [
        `After ${playtimeHours} hours on ${platformPlayed}, I can definitively say ${game.title} succeeds by doubling down on its creative convictions. The interplay between systemic mechanics and atmospheric art direction creates memorable momentum.${spoilerContent}\n\nA rewarding experience that respects player intelligence.`,
        `Few titles execute on their design brief with this degree of confidence. The ${pillars.gameplay >= 4.5 ? 'combat mechanics are remarkably tactile' : 'narrative framing carries the slower moments'}. Encounter design keeps boredom completely at bay.${spoilerContent}\n\nWorth every second invested.`,
        completionStatus === 'DROPPED'
          ? `I dropped this at ${playtimeHours} hours. While the technical polish and visuals are undeniably competent, the pacing in the opening chapters created too much mechanical friction for me.${spoilerContent}\n\nMight revisit on a future patch, but currently shelving.`
          : `An absolute standout in its genre. The soundscapes and lighting alone justify a playthrough with high-end headphones. Performance on ${platformPlayed} remained rock-solid.${spoilerContent}\n\nStrongly recommended for anyone seeking thoughtful game design.`,
      ];

      const bodyMarkdown = proseTemplates[reviewIdCounter % proseTemplates.length];
      const likedCount = Math.floor(Math.random() * 45) + 2;

      // Create random date in past 180 days
      const d = new Date();
      d.setDate(d.getDate() - Math.floor(Math.random() * 180));

      // Introduce an intentional review-bomb spike for Elden Ring patch v1.03 to test Anti-Brigading Ledger
      const isBombSpike = game.id === 'elden-ring' && i >= reviewsForThisGame - 3;
      const finalRating = isBombSpike ? 1.0 : starRating;

      reviews.push({
        id: `rev-${reviewIdCounter++}`,
        gameId: game.id,
        author: {
          id: author.id,
          username: author.username,
          avatarUrl: author.avatarUrl,
          criticTier: author.criticTier,
          tasteMatchPercent: Math.floor(Math.random() * 30) + 70,
        },
        starRating: finalRating,
        isMasterpiece: isBombSpike ? false : isMasterpiece,
        pillars: isBombSpike 
          ? { gameplay: 1.5, narrative: 2.0, visuals: 3.0, audio: 3.0, polish: 1.0 }
          : pillars,
        completionStatus: isBombSpike ? 'DROPPED' : completionStatus,
        playtimeHours: isBombSpike ? 2.5 : playtimeHours,
        platformPlayed,
        patchVersion: isBombSpike ? 'v1.03' : patchVersion,
        bodyMarkdown: isBombSpike
          ? 'They nerfed my build and the stuttering on PC is unplayable! Total garbage patch, dropping the game.'
          : bodyMarkdown,
        likedCount: isBombSpike ? 0 : likedCount,
        createdAt: isBombSpike ? '2024-03-18T10:00:00Z' : d.toISOString(),
        isFlaggedBrigade: isBombSpike,
      });
    }
  });

  return reviews;
}

function clampPillar(val: number): number {
  return Math.round(Math.max(1.0, Math.min(5.0, val)) * 10) / 10;
}
