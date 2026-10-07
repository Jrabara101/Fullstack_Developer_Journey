export const INITIAL_RELATIONSHIPS = [
  // Mutual connection: Alex & Sarah (tenure since October 2024)
  { followerId: 'user-alex', followingId: 'user-sarah', createdAt: '2024-10-14T10:30:00Z' },
  { followerId: 'user-sarah', followingId: 'user-alex', createdAt: '2024-10-14T14:45:00Z' },

  // Mutual connection: Alex & Elena (tenure since January 2025)
  { followerId: 'user-alex', followingId: 'user-elena', createdAt: '2025-01-18T09:15:00Z' },
  { followerId: 'user-elena', followingId: 'user-alex', createdAt: '2025-01-20T16:20:00Z' },

  // Mutual connection: Sarah & Elena
  { followerId: 'user-sarah', followingId: 'user-elena', createdAt: '2024-11-05T12:00:00Z' },
  { followerId: 'user-elena', followingId: 'user-sarah', createdAt: '2024-11-06T08:30:00Z' },

  // Mutual connection: Sarah & Marcus
  { followerId: 'user-sarah', followingId: 'user-marcus', createdAt: '2024-12-01T15:00:00Z' },
  { followerId: 'user-marcus', followingId: 'user-sarah', createdAt: '2024-12-02T11:20:00Z' },

  // One-way follow: Marcus follows Alex (Alex has NOT followed back -> shows "Follow Back" to Alex!)
  { followerId: 'user-marcus', followingId: 'user-alex', createdAt: '2025-02-10T19:40:00Z' },

  // One-way follow: Alex follows David (David has NOT followed back -> shows "Following" to Alex)
  { followerId: 'user-alex', followingId: 'user-david', createdAt: '2025-02-15T11:00:00Z' },

  // Triangle completions for Alex:
  // Maya follows Sarah and Marcus (both are Alex's mutuals), but Alex and Maya don't follow each other!
  { followerId: 'user-maya', followingId: 'user-sarah', createdAt: '2025-01-10T14:00:00Z' },
  { followerId: 'user-maya', followingId: 'user-marcus', createdAt: '2025-01-12T16:30:00Z' },

  // Jordan follows David and Elena
  { followerId: 'user-jordan', followingId: 'user-david', createdAt: '2025-02-01T18:10:00Z' },
  { followerId: 'user-jordan', followingId: 'user-elena', createdAt: '2025-02-05T13:45:00Z' },
];

export const INITIAL_REQUESTS = [
  // Alex sent a follow request to Chloe (private account)
  {
    id: 'req-alex-chloe',
    requesterId: 'user-alex',
    targetId: 'user-chloe',
    status: 'pending',
    createdAt: '2025-02-20T10:00:00Z',
  }
];

export const INITIAL_MUTES = [
  // Alex muted Jordan's posts
  { userId: 'user-alex', mutedUserId: 'user-jordan', createdAt: '2025-02-18T12:00:00Z' }
];
