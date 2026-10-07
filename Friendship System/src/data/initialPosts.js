export const INITIAL_POSTS = [
  {
    id: 'post-1',
    authorId: 'user-sarah',
    audience: 'mutuals', // Mutuals only!
    content: '🎉 Confirmed our seed round term sheet! Keeping this strictly between mutuals until our official press release next Tuesday. Thank you all for the early architecture feedback!',
    tags: ['Founder', 'Milestone', 'Database'],
    likesCount: 14,
    commentsCount: 5,
    createdAt: '2 hours ago',
    timestamp: '2025-02-28T14:30:00Z',
  },
  {
    id: 'post-2',
    authorId: 'user-elena',
    audience: 'followers', // Followers only!
    content: 'Just uploaded our new benchmark results for sub-millisecond graph triangle enumeration on NVMe-oF clusters. Code is in the pre-print repo.',
    mediaUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&auto=format&fit=crop&q=80',
    tags: ['GraphAI', 'Research', 'Benchmarks'],
    likesCount: 38,
    commentsCount: 9,
    createdAt: '4 hours ago',
    timestamp: '2025-02-28T12:00:00Z',
  },
  {
    id: 'post-3',
    authorId: 'user-marcus',
    audience: 'public', // Public
    content: 'The most underrated UX metric is cognitive friction during social discovery. Asymmetry allows boundless curiosity; symmetry preserves psychological safety.',
    tags: ['ProductDesign', 'SocialGraph', 'Philosophy'],
    likesCount: 142,
    commentsCount: 23,
    createdAt: '6 hours ago',
    timestamp: '2025-02-28T10:15:00Z',
  },
  {
    id: 'post-4',
    authorId: 'user-david',
    audience: 'followers', // Followers only
    content: 'Vite 6 + React 19 server actions in local dev feeling shockingly fast. Zero bundle overhead when tree-shaking the social state machine.',
    mediaUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=700&auto=format&fit=crop&q=80',
    tags: ['Frontend', 'Vite', 'React19'],
    likesCount: 65,
    commentsCount: 12,
    createdAt: '8 hours ago',
    timestamp: '2025-02-28T08:00:00Z',
  },
  {
    id: 'post-5',
    authorId: 'user-alex',
    audience: 'mutuals', // Mutuals only
    content: 'Casual dinner + rooftop synthesis jam session at our studio this Friday at 7pm! Drop a comment if you want the calendar invite & gate code.',
    tags: ['IRL', 'SanFrancisco', 'Community'],
    likesCount: 19,
    commentsCount: 7,
    createdAt: '12 hours ago',
    timestamp: '2025-02-27T22:00:00Z',
  },
  {
    id: 'post-6',
    authorId: 'user-chloe',
    audience: 'mutuals', // Private account + Mutuals only!
    content: 'First contact sheets from the Kyoto tea garden series (Shot on Hasselblad 500C / Kodak Tri-X 400). Very thankful for this quiet space.',
    mediaUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=700&auto=format&fit=crop&q=80',
    tags: ['FilmPhotography', 'Kyoto', 'Art'],
    likesCount: 52,
    commentsCount: 16,
    createdAt: '1 day ago',
    timestamp: '2025-02-27T14:00:00Z',
  },
  {
    id: 'post-7',
    authorId: 'user-maya',
    audience: 'public', // Public
    content: 'Why bidirectional graph consensus matters: asymmetrical subscriptions optimize for content distribution, while symmetrical mutual graphs power end-to-end encrypted messaging channels.',
    tags: ['Cryptography', 'Identity', 'Web3'],
    likesCount: 88,
    commentsCount: 14,
    createdAt: '1 day ago',
    timestamp: '2025-02-27T09:30:00Z',
  },
  {
    id: 'post-8',
    authorId: 'user-jordan',
    audience: 'public', // Public
    content: 'Streaming 100k graph mutations/sec through our materialized view engine. The trick is maintaining canonical ordering (LEAST(u1, u2), GREATEST(u1, u2)).',
    tags: ['Databases', 'Kafka', 'PostgreSQL'],
    likesCount: 94,
    commentsCount: 18,
    createdAt: '2 days ago',
    timestamp: '2025-02-26T17:00:00Z',
  }
];
