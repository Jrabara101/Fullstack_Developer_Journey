import { useState, useEffect, useCallback, useRef } from 'react';
import { graphEngine } from '../engine/relationshipEngine.js';
import { RelationshipState } from '../types/index.js';

/**
 * Custom Hook: useRelationship
 * Encapsulates the finite state machine, optimistic updates, and instant rollback.
 */
export function useRelationship(targetUserId) {
  const activeUser = graphEngine.getActiveUser();
  const currentUserId = activeUser?.id;

  const [state, setState] = useState(() =>
    currentUserId && targetUserId
      ? graphEngine.getRelationshipState(currentUserId, targetUserId)
      : RelationshipState.NONE
  );

  const [isPending, setIsPending] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isMuted, setIsMuted] = useState(() =>
    currentUserId && targetUserId
      ? graphEngine.isMuted(currentUserId, targetUserId)
      : false
  );

  const previousStateRef = useRef(state);

  // Synchronize state whenever graph engine updates
  const syncState = useCallback(() => {
    if (!currentUserId || !targetUserId) return;
    const freshState = graphEngine.getRelationshipState(currentUserId, targetUserId);
    setState(freshState);
    previousStateRef.current = freshState;
    setIsMuted(graphEngine.isMuted(currentUserId, targetUserId));
  }, [currentUserId, targetUserId]);

  useEffect(() => {
    syncState();
    const unsubscribe = graphEngine.subscribe((event) => {
      syncState();
      if (
        event?.type === 'ROLLBACK_TRIGGERED' &&
        event?.targetUserId === targetUserId
      ) {
        // Trigger error shake animation
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }
    });
    return unsubscribe;
  }, [syncState, targetUserId]);

  /**
   * Universal Action Button Trigger with Optimistic Update & Instant Rollback
   */
  const handleFollowAction = useCallback(async () => {
    if (!currentUserId || !targetUserId || isPending) return;

    // Snapshot previous state for rollback
    const rollbackState = state;
    previousStateRef.current = rollbackState;

    // Compute optimistic next state immediately
    const targetUser = graphEngine.getUserById(targetUserId);
    const theyFollowMe = graphEngine.hasEdge(targetUserId, currentUserId);
    let optimisticNextState = rollbackState;

    if (rollbackState === RelationshipState.NONE || rollbackState === RelationshipState.FOLLOW_BACK) {
      if (targetUser?.isPrivate && !theyFollowMe) {
        optimisticNextState = RelationshipState.REQUESTED;
      } else if (theyFollowMe) {
        optimisticNextState = RelationshipState.MUTUAL;
      } else {
        optimisticNextState = RelationshipState.FOLLOWING;
      }
    } else if (rollbackState === RelationshipState.FOLLOWING || rollbackState === RelationshipState.MUTUAL) {
      optimisticNextState = rollbackState === RelationshipState.MUTUAL
        ? RelationshipState.FOLLOW_BACK
        : RelationshipState.NONE;
    } else if (rollbackState === RelationshipState.REQUESTED) {
      optimisticNextState = RelationshipState.NONE;
    }

    // Apply immediate optimistic state
    setState(optimisticNextState);
    setIsPending(true);

    try {
      await graphEngine.executeFollowAction(currentUserId, targetUserId);
      setIsPending(false);
    } catch (err) {
      // Network failure / rollback triggered!
      setIsPending(false);
      setState(rollbackState);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      throw err;
    }
  }, [currentUserId, targetUserId, state, isPending]);

  /**
   * Silent Uncoupling / Soft Block
   */
  const handleSoftBlock = useCallback(async () => {
    if (!currentUserId || !targetUserId) return;
    try {
      await graphEngine.softBlockFollower(currentUserId, targetUserId);
    } catch (err) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      throw err;
    }
  }, [currentUserId, targetUserId]);

  /**
   * Mute Without Severing
   */
  const handleToggleMute = useCallback(() => {
    if (!currentUserId || !targetUserId) return;
    const result = graphEngine.toggleMute(currentUserId, targetUserId);
    setIsMuted(result);
  }, [currentUserId, targetUserId]);

  const mutualMilestone = currentUserId && targetUserId
    ? graphEngine.getMutualMilestone(currentUserId, targetUserId)
    : null;

  const contextualOverlap = currentUserId && targetUserId
    ? graphEngine.getContextualOverlap(currentUserId, targetUserId)
    : { overlapUsers: [], sharedMutuals: [], count: 0 };

  return {
    state,
    isPending,
    isShaking,
    isMuted,
    executeFollowAction: handleFollowAction,
    softBlock: handleSoftBlock,
    toggleMute: handleToggleMute,
    mutualMilestone,
    contextualOverlap,
    isMutual: state === RelationshipState.MUTUAL,
  };
}
