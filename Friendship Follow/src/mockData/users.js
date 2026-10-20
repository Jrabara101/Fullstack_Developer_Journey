export const INITIAL_USERS = [
  {
    id: 'user_maya',
    username: 'mayalin',
    displayName: 'Maya Lin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=400&q=80',
    bio: 'Product Designer & Design Systems Architect. Exploring asymmetrical relationship dynamics & high-intimacy social interfaces.',
    isPrivate: false,
    activityStatus: 'Active now',
    location: 'San Francisco, CA',
    website: 'https://mayalin.design',
    email: 'maya.lin@socialgraph.dev',
    phoneNumber: '+1 (415) 890-4421',
    createdAt: '2024-01-15T00:00:00Z',
    joinedDate: 'Joined January 2024',
  },
  {
    id: 'user_alex',
    username: 'alexchen',
    displayName: 'Alex Chen',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&h=400&q=80',
    bio: 'Distributed Systems & Graph Database Engineer @ Nexus Core. Scaling bidirectional materialized views & sub-millisecond edge lookups.',
    isPrivate: false,
    activityStatus: 'Coding in Rust',
    location: 'Seattle, WA',
    website: 'https://alexchen.io',
    email: 'alex.chen@infra.net',
    phoneNumber: '+1 (206) 555-0199',
    createdAt: '2024-02-10T00:00:00Z',
    joinedDate: 'Joined February 2024',
  },
  {
    id: 'user_sarah',
    username: 'sarahj',
    displayName: 'Sarah Jenkins',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&h=400&q=80',
    bio: 'Applied AI Researcher & generative interface thinker. Co-host of "Latent Intimacy" podcast. Always up for filter coffee ☕',
    isPrivate: false,
    activityStatus: 'Listening to Spotify',
    location: 'Brooklyn, NY',
    website: 'https://sarahj.ai',
    email: 'sarah.jenkins@latent.ai',
    phoneNumber: '+1 (917) 555-3810',
    createdAt: '2024-03-01T00:00:00Z',
    joinedDate: 'Joined March 2024',
  },
  {
    id: 'user_liam',
    username: 'liamtorres',
    displayName: 'Liam Torres',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&h=400&q=80',
    bio: 'Fullstack tinkerer, typography nerd, and photographer. Building tactile micro-interactions that feel physically alive.',
    isPrivate: false,
    activityStatus: 'In darkroom 📸',
    location: 'Austin, TX',
    website: 'https://liam.photo',
    email: 'liam@torres.studio',
    phoneNumber: '+1 (512) 555-8820',
    createdAt: '2024-04-12T00:00:00Z',
    joinedDate: 'Joined April 2024',
  },
  {
    id: 'user_elena',
    username: 'elenarostova',
    displayName: 'Elena Rostova',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=400&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&h=400&q=80',
    bio: 'Security & cryptographic protocol architect. Private profile by design. Requests approved selectively for verified mutuals.',
    isPrivate: true, // Private account to demonstrate follow request gate!
    activityStatus: 'Offline',
    location: 'Zurich, Switzerland',
    website: 'https://rostova.ch',
    email: 'elena@crypto-mesh.org',
    phoneNumber: '+41 44 668 2011',
    createdAt: '2024-05-20T00:00:00Z',
    joinedDate: 'Joined May 2024',
  },
  {
    id: 'user_marcus',
    username: 'marcusv',
    displayName: 'Marcus Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&h=400&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&h=400&q=80',
    bio: 'Creative Technologist & 3D Web artisan. Obsessed with shaders, spring physics, and high-frequency community graphs.',
    isPrivate: false,
    activityStatus: 'Streaming 3D shaders',
    location: 'Berlin, Germany',
    website: 'https://marcusvance.art',
    email: 'marcus@vance.design',
    phoneNumber: '+49 30 8920119',
    createdAt: '2024-06-01T00:00:00Z',
    joinedDate: 'Joined June 2024',
  },
];

/**
 * Initial Directed Edges (Relationships):
 * followerId -> followingId
 * 
 * Let's create an interesting initial topology for Maya (active user):
 * - Maya and Alex: Mutual Friends (Maya follows Alex, Alex follows Maya) - mutual since Oct 14, 2024
 * - Maya and Sarah: Mutual Friends (Maya follows Sarah, Sarah follows Maya) - mutual since Nov 02, 2024
 * - Liam follows Maya (Inbound one-way: Maya sees "Follow Back ⮂" on Liam!)
 * - Maya follows Marcus (Outbound one-way: Maya sees "Following" on Marcus, Marcus hasn't followed back yet)
 * - Elena is Private and not connected yet (Maya sees "+ Follow", which switches to "Requested ⏳" on click!)
 * - Alex & Sarah also follow Liam and Marcus, creating rich contextual overlap and triangle completion!
 */
export const INITIAL_RELATIONSHIPS = [
  // Mutual pair: Maya <-> Alex
  { followerId: 'user_maya', followingId: 'user_alex', createdAt: '2024-10-14T10:00:00Z' },
  { followerId: 'user_alex', followingId: 'user_maya', createdAt: '2024-10-14T11:30:00Z' },

  // Mutual pair: Maya <-> Sarah
  { followerId: 'user_maya', followingId: 'user_sarah', createdAt: '2024-11-02T14:20:00Z' },
  { followerId: 'user_sarah', followingId: 'user_maya', createdAt: '2024-11-02T15:10:00Z' },

  // Inbound follow: Liam follows Maya (Maya sees "Follow Back ⮂")
  { followerId: 'user_liam', followingId: 'user_maya', createdAt: '2024-12-05T09:00:00Z' },

  // Outbound follow: Maya follows Marcus (Maya sees "Following")
  { followerId: 'user_maya', followingId: 'user_marcus', createdAt: '2024-12-10T16:00:00Z' },

  // Graph triangle overlaps:
  // Alex <-> Sarah are also mutuals
  { followerId: 'user_alex', followingId: 'user_sarah', createdAt: '2024-09-10T08:00:00Z' },
  { followerId: 'user_sarah', followingId: 'user_alex', createdAt: '2024-09-10T08:30:00Z' },

  // Alex & Sarah also follow Liam
  { followerId: 'user_alex', followingId: 'user_liam', createdAt: '2024-10-20T12:00:00Z' },
  { followerId: 'user_sarah', followingId: 'user_liam', createdAt: '2024-10-22T13:00:00Z' },
  { followerId: 'user_liam', followingId: 'user_alex', createdAt: '2024-10-21T09:00:00Z' }, // Liam <-> Alex mutual

  // Marcus follows Sarah
  { followerId: 'user_marcus', followingId: 'user_sarah', createdAt: '2024-11-15T10:00:00Z' },

  // Elena follows Alex
  { followerId: 'user_elena', followingId: 'user_alex', createdAt: '2024-12-01T11:00:00Z' },
];

export const INITIAL_REQUESTS = [];

export const INITIAL_MUTES = [];
