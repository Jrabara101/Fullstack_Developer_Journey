/**
 * Relationship State Machine Types
 */
export const RelationshipState = {
  NONE: 'NONE',                 // Not following, stranger (+ Follow)
  REQUESTED: 'REQUESTED',       // Pending approval for private account (Requested ⏳)
  FOLLOWING: 'FOLLOWING',       // One-way outbound following (Following -> Unfollow)
  FOLLOW_BACK: 'FOLLOW_BACK',   // Inbound follow, not reciprocated (Follow Back ⮂)
  MUTUAL: 'MUTUAL',             // Bidirectional reciprocated friendship (Friends ✨)
};

export const AudienceGate = {
  PUBLIC: 'public',
  FOLLOWERS: 'followers',
  MUTUALS: 'mutuals',
};
