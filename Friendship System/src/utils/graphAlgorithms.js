/**
 * Check if user A directly follows user B (directed edge: A -> B)
 */
export function isFollowing(relationships, followerId, followingId) {
  if (!relationships || !followerId || !followingId) return false;
  return relationships.some(
    r => r.followerId === followerId && r.followingId === followingId
  );
}

/**
 * Check if user A and user B have a confirmed mutual friendship (bidirectional edges)
 */
export function isMutual(relationships, userAId, userBId) {
  if (!relationships || !userAId || !userBId || userAId === userBId) return false;
  const aFollowsB = isFollowing(relationships, userAId, userBId);
  const bFollowsA = isFollowing(relationships, userBId, userAId);
  return aFollowsB && bFollowsA;
}

/**
 * Determine the discrete relationship state between viewer and target
 */
export function getRelationshipState(relationships, requests, viewerId, targetId, isTargetPrivate = false) {
  if (!viewerId || !targetId || viewerId === targetId) return 'NONE';

  const viewerFollowsTarget = isFollowing(relationships, viewerId, targetId);
  const targetFollowsViewer = isFollowing(relationships, targetId, viewerId);

  if (viewerFollowsTarget && targetFollowsViewer) {
    return 'MUTUAL';
  }

  if (viewerFollowsTarget && !targetFollowsViewer) {
    return 'FOLLOWING';
  }

  if (!viewerFollowsTarget && targetFollowsViewer) {
    return 'FOLLOW_BACK';
  }

  // Check if there is a pending follow request
  if (requests && requests.some(req => req.requesterId === viewerId && req.targetId === targetId && req.status === 'pending')) {
    return 'REQUESTED';
  }

  return 'NONE';
}

/**
 * Calculate mutual tenure milestone chip (e.g. "Mutuals since October 2024 • 4 Shared Connections")
 */
export function getMutualTenure(relationships, userAId, userBId) {
  if (!isMutual(relationships, userAId, userBId)) return null;

  const edge1 = relationships.find(r => r.followerId === userAId && r.followingId === userBId);
  const edge2 = relationships.find(r => r.followerId === userBId && r.followingId === userAId);

  if (!edge1 || !edge2) return null;

  // Established when the second follow edge was created (the reciprocation date)
  const establishedTimestamp = Math.max(
    new Date(edge1.createdAt).getTime(),
    new Date(edge2.createdAt).getTime()
  );

  const establishedDate = new Date(establishedTimestamp);
  const monthName = establishedDate.toLocaleString('default', { month: 'long' });
  const year = establishedDate.getFullYear();

  return `Mutuals since ${monthName} ${year}`;
}

/**
 * Compute shared mutual connections between viewer and target
 */
export function getSharedConnections(relationships, users, viewerId, targetId) {
  if (!relationships || !viewerId || !targetId) return [];

  // Find all mutual friends of viewer
  const viewerMutualIds = users
    .filter(u => u.id !== viewerId && isMutual(relationships, viewerId, u.id))
    .map(u => u.id);

  // Find all mutual friends of target
  const targetMutualIds = users
    .filter(u => u.id !== targetId && isMutual(relationships, targetId, u.id))
    .map(u => u.id);

  // Intersect
  const sharedIds = viewerMutualIds.filter(id => targetMutualIds.includes(id));
  return users.filter(u => sharedIds.includes(u.id));
}

/**
 * Contextual Overlap Radar: Computes social proof text & avatars
 * e.g., "Followed by Sarah, Alex, and 2 other mutual friends"
 */
export function getContextualOverlap(relationships, users, viewerId, targetId) {
  const shared = getSharedConnections(relationships, users, viewerId, targetId);
  
  if (shared.length === 0) {
    // Fallback: check if anyone the viewer follows also follows the target
    const viewerFollowing = relationships
      .filter(r => r.followerId === viewerId)
      .map(r => r.followingId);

    const commonFollowers = users.filter(u => 
      viewerFollowing.includes(u.id) && 
      isFollowing(relationships, u.id, targetId) &&
      u.id !== viewerId && u.id !== targetId
    );

    if (commonFollowers.length === 0) {
      return { count: 0, previewUsers: [], text: 'No shared connections yet' };
    }

    const previewUsers = commonFollowers.slice(0, 3);
    const names = previewUsers.map(u => u.displayName.split(' ')[0]);
    let text = `Followed by ${names.join(', ')}`;
    if (commonFollowers.length > 3) {
      text += ` and ${commonFollowers.length - 3} others you follow`;
    }
    return { count: commonFollowers.length, previewUsers, text };
  }

  const previewUsers = shared.slice(0, 3);
  const names = previewUsers.map(u => u.displayName.split(' ')[0]);
  let text = '';
  if (names.length === 1) {
    text = `Followed by ${names[0]} (Mutual Friend)`;
  } else if (names.length === 2) {
    text = `Followed by ${names[0]} and ${names[1]} (Mutual Friends)`;
  } else {
    text = `Followed by ${names[0]}, ${names[1]}, and ${shared.length - 2} other mutuals`;
  }

  return {
    count: shared.length,
    previewUsers,
    text,
  };
}

/**
 * Smart Suggestions Based on Network Density & Graph Triangle Completion:
 * Recommends accounts based on graph triangle completions:
 * (Candidates who follow your mutuals, or who your mutuals follow, but whom you haven't followed yet).
 */
export function getTriangleSuggestions(relationships, users, viewerId) {
  if (!relationships || !users || !viewerId) return [];

  // Viewer's mutual friends
  const viewerMutuals = users.filter(u => isMutual(relationships, viewerId, u.id));
  const viewerFollowing = relationships
    .filter(r => r.followerId === viewerId)
    .map(r => r.followingId);

  const candidatesMap = new Map();

  // For each mutual friend M of viewer:
  viewerMutuals.forEach(mutual => {
    // Candidates who mutual M follows or who follow M
    relationships.forEach(rel => {
      let candidateId = null;
      let connectionType = '';

      if (rel.followerId === mutual.id && rel.followingId !== viewerId && !viewerFollowing.includes(rel.followingId)) {
        candidateId = rel.followingId;
        connectionType = `Followed by your mutual friend ${mutual.displayName}`;
      } else if (rel.followingId === mutual.id && rel.followerId !== viewerId && !viewerFollowing.includes(rel.followerId)) {
        candidateId = rel.followerId;
        connectionType = `Follows your mutual friend ${mutual.displayName}`;
      }

      if (candidateId && candidateId !== viewerId) {
        if (!candidatesMap.has(candidateId)) {
          candidatesMap.set(candidateId, {
            user: users.find(u => u.id === candidateId),
            sharedMutuals: [mutual],
            reasons: [connectionType],
            densityScore: 1,
          });
        } else {
          const entry = candidatesMap.get(candidateId);
          if (!entry.sharedMutuals.some(m => m.id === mutual.id)) {
            entry.sharedMutuals.push(mutual);
            entry.reasons.push(connectionType);
            entry.densityScore += 1;
          }
        }
      }
    });
  });

  return Array.from(candidatesMap.values())
    .filter(item => item.user !== undefined)
    .sort((a, b) => b.densityScore - a.densityScore);
}

/**
 * Get follower list for a user
 */
export function getUserFollowers(relationships, users, targetId) {
  const followerIds = relationships
    .filter(r => r.followingId === targetId)
    .map(r => r.followerId);
  return users.filter(u => followerIds.includes(u.id));
}

/**
 * Get following list for a user
 */
export function getUserFollowing(relationships, users, targetId) {
  const followingIds = relationships
    .filter(r => r.followerId === targetId)
    .map(r => r.followingId);
  return users.filter(u => followingIds.includes(u.id));
}

/**
 * Get mutual friends list for a user
 */
export function getUserMutuals(relationships, users, targetId) {
  return users.filter(u => isMutual(relationships, targetId, u.id));
}
