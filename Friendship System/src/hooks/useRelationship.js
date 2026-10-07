import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSocialGraph } from '../context/SocialGraphContext';
import { 
  getRelationshipState, 
  getMutualTenure, 
  getSharedConnections, 
  getContextualOverlap 
} from '../utils/graphAlgorithms';

/**
 * useRelationship:
 * Encapsulated Finite State Machine with Optimistic UI updates,
 * sub-millisecond local transition, and instant rollback on network failure.
 */
export function useRelationship(targetUserId) {
  const {
    currentUserId,
    relationships,
    requests,
    mutes,
    users,
    followUser,
    unfollowUser,
    removeFollowerSoftBlock,
    toggleMuteUser,
  } = useSocialGraph();

  const targetUser = useMemo(() => {
    return users.find(u => u.id === targetUserId);
  }, [users, targetUserId]);

  // Derived actual state from authoritative graph
  const authoritativeState = useMemo(() => {
    if (!targetUser) return 'NONE';
    return getRelationshipState(
      relationships, 
      requests, 
      currentUserId, 
      targetUserId, 
      targetUser.isPrivate
    );
  }, [relationships, requests, currentUserId, targetUserId, targetUser]);

  // Optimistic state override (if in flight)
  const [optimisticState, setOptimisticState] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [lastError, setLastError] = useState(null);

  // Sync optimistic state if authoritative state updates
  useEffect(() => {
    setOptimisticState(null);
  }, [authoritativeState]);

  // Active rendered state
  const state = optimisticState || authoritativeState;

  // Check if target is muted by viewer
  const isMuted = useMemo(() => {
    return mutes.some(m => m.userId === currentUserId && m.mutedUserId === targetUserId);
  }, [mutes, currentUserId, targetUserId]);

  // Computed metrics
  const mutualTenure = useMemo(() => {
    return getMutualTenure(relationships, currentUserId, targetUserId);
  }, [relationships, currentUserId, targetUserId]);

  const sharedConnections = useMemo(() => {
    return getSharedConnections(relationships, users, currentUserId, targetUserId);
  }, [relationships, users, currentUserId, targetUserId]);

  const overlapRadar = useMemo(() => {
    return getContextualOverlap(relationships, users, currentUserId, targetUserId);
  }, [relationships, users, currentUserId, targetUserId]);

  // Actions with Optimistic UI & Automatic Rollback
  const handleFollow = useCallback(async () => {
    if (isPending) return;
    setLastError(null);

    // Snapshot for rollback
    const previousState = state;

    // Optimistic Prediction:
    // If target follows viewer -> instant MUTUAL!
    // Else if target is private -> REQUESTED
    // Else -> FOLLOWING
    let nextOptimistic = 'FOLLOWING';
    if (previousState === 'FOLLOW_BACK') {
      nextOptimistic = 'MUTUAL';
    } else if (targetUser?.isPrivate) {
      nextOptimistic = 'REQUESTED';
    }

    setOptimisticState(nextOptimistic);
    setIsPending(true);

    try {
      await followUser(currentUserId, targetUserId);
    } catch (err) {
      // ROLLBACK to previous state
      setOptimisticState(previousState);
      setLastError(err.message || 'Action failed. Rolling back.');
      console.error('Optimistic follow rollback:', err);
    } finally {
      setIsPending(false);
    }
  }, [isPending, state, targetUser, followUser, currentUserId, targetUserId]);

  const handleUnfollow = useCallback(async () => {
    if (isPending) return;
    setLastError(null);

    const previousState = state;
    // Optimistic prediction:
    // If it was MUTUAL, target still follows viewer -> drops to FOLLOW_BACK
    // Otherwise -> drops to NONE
    const nextOptimistic = previousState === 'MUTUAL' ? 'FOLLOW_BACK' : 'NONE';

    setOptimisticState(nextOptimistic);
    setIsPending(true);

    try {
      await unfollowUser(currentUserId, targetUserId);
    } catch (err) {
      // ROLLBACK
      setOptimisticState(previousState);
      setLastError(err.message || 'Action failed. Rolling back.');
      console.error('Optimistic unfollow rollback:', err);
    } finally {
      setIsPending(false);
    }
  }, [isPending, state, unfollowUser, currentUserId, targetUserId]);

  const handleFollowBack = useCallback(async () => {
    return handleFollow();
  }, [handleFollow]);

  const handleSoftBlock = useCallback(async () => {
    if (isPending) return;
    setLastError(null);

    const previousState = state;
    // Removing follower drops MUTUAL to FOLLOWING, or FOLLOW_BACK to NONE
    const nextOptimistic = previousState === 'MUTUAL' ? 'FOLLOWING' : 'NONE';

    setOptimisticState(nextOptimistic);
    setIsPending(true);

    try {
      await removeFollowerSoftBlock(currentUserId, targetUserId);
    } catch (err) {
      setOptimisticState(previousState);
      setLastError(err.message || 'Failed to remove follower.');
    } finally {
      setIsPending(false);
    }
  }, [isPending, state, removeFollowerSoftBlock, currentUserId, targetUserId]);

  const handleToggleMute = useCallback(async () => {
    try {
      await toggleMuteUser(currentUserId, targetUserId);
    } catch (err) {
      setLastError(err.message || 'Failed to toggle mute.');
    }
  }, [toggleMuteUser, currentUserId, targetUserId]);

  return {
    state,
    authoritativeState,
    isPending,
    isMuted,
    lastError,
    mutualTenure,
    sharedConnections,
    overlapRadar,
    targetUser,
    handleFollow,
    handleUnfollow,
    handleFollowBack,
    handleSoftBlock,
    handleToggleMute,
    clearError: () => setLastError(null),
  };
}
