/**
 * Discrete Relationship States in the Finite State Machine
 */
export const RELATIONSHIP_STATES = {
  NONE: 'NONE',               // Neither follows each other
  FOLLOWING: 'FOLLOWING',     // Current user follows target (asymmetrical)
  FOLLOW_BACK: 'FOLLOW_BACK', // Target follows current user, current user has not reciprocated
  MUTUAL: 'MUTUAL',           // Bidirectional confirmed friendship
  REQUESTED: 'REQUESTED',     // Follow request pending approval (for private accounts)
};

/**
 * Audience visibility tiers for tiered intimacy content gating
 */
export const AUDIENCE_TIERS = {
  PUBLIC: 'public',
  FOLLOWERS: 'followers',
  MUTUALS: 'mutuals',
};

/**
 * Event types dispatched across the social graph bus & real-time channel
 */
export const SOCIAL_EVENTS = {
  FOLLOW_CREATED: 'relationship.follow_created',
  FOLLOW_REMOVED: 'relationship.follow_removed',
  FOLLOW_REQUESTED: 'relationship.follow_requested',
  REQUEST_APPROVED: 'relationship.request_approved',
  REQUEST_REJECTED: 'relationship.request_rejected',
  MUTUAL_UNLOCKED: 'relationship.mutual_unlocked',
  MUTUAL_BROKEN: 'relationship.mutual_broken',
  FOLLOWER_REMOVED_SOFT_BLOCK: 'relationship.soft_blocked',
  MUTE_TOGGLED: 'relationship.mute_toggled',
};
