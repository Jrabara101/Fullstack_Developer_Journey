import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { INITIAL_USERS } from '../data/initialUsers';
import { INITIAL_RELATIONSHIPS, INITIAL_REQUESTS, INITIAL_MUTES } from '../data/initialRelationships';
import { INITIAL_POSTS } from '../data/initialPosts';
import { SOCIAL_EVENTS } from '../types';
import { isFollowing, isMutual } from '../utils/graphAlgorithms';
import { fireMutualConfetti } from '../utils/confetti';

const SocialGraphContext = createContext(null);

export function SocialGraphProvider({ children }) {
  // Graph persistent state (synced with localStorage for persistent experimentation)
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('nexus_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [relationships, setRelationships] = useState(() => {
    const saved = localStorage.getItem('nexus_relationships');
    return saved ? JSON.parse(saved) : INITIAL_RELATIONSHIPS;
  });

  const [requests, setRequests] = useState(() => {
    const saved = localStorage.getItem('nexus_requests');
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  const [mutes, setMutes] = useState(() => {
    const saved = localStorage.getItem('nexus_mutes');
    return saved ? JSON.parse(saved) : INITIAL_MUTES;
  });

  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('nexus_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [currentUserId, setCurrentUserId] = useState(() => {
    return localStorage.getItem('nexus_current_user') || 'user-alex';
  });

  // Real-time Event Stream / Ticker Log
  const [eventLogs, setEventLogs] = useState([
    {
      id: 'evt-init-1',
      type: SOCIAL_EVENTS.MUTUAL_UNLOCKED,
      title: 'Mutual Connection Confirmed',
      details: 'alex_rivera ⟷ sarah_chen unlocked mutual status',
      timestamp: 'Just now',
      color: 'gold',
    },
    {
      id: 'evt-init-2',
      type: SOCIAL_EVENTS.FOLLOW_CREATED,
      title: 'Asymmetrical Edge Ingested',
      details: 'marcus_vance followed alex_rivera (Awaiting reciprocity)',
      timestamp: '2m ago',
      color: 'cyan',
    }
  ]);

  // Active Celebratory Modal State
  const [celebrationData, setCelebrationData] = useState(null);

  // Network Simulation Toggles
  const [simulateNetworkFailure, setSimulateNetworkFailure] = useState(false);
  const [networkLatencyMs, setNetworkLatencyMs] = useState(300);

  // Ref to track broadcast channel
  const channelRef = useRef(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('nexus_relationships', JSON.stringify(relationships));
  }, [relationships]);

  useEffect(() => {
    localStorage.setItem('nexus_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('nexus_mutes', JSON.stringify(mutes));
  }, [mutes]);

  useEffect(() => {
    localStorage.setItem('nexus_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('nexus_current_user', currentUserId);
  }, [currentUserId]);

  // Broadcast Channel for Multi-Tab / WebSocket Real-Time Simulation
  useEffect(() => {
    try {
      const channel = new BroadcastChannel('nexus_social_events');
      channelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === 'SYNC_STATE') {
          if (payload.relationships) setRelationships(payload.relationships);
          if (payload.requests) setRequests(payload.requests);
          if (payload.mutes) setMutes(payload.mutes);
        } else if (type === 'NEW_EVENT_LOG') {
          setEventLogs(prev => [payload, ...prev.slice(0, 49)]);
        }
      };

      return () => {
        channel.close();
      };
    } catch {
      // Fallback if BroadcastChannel is unavailable in certain sandboxes
    }
  }, []);

  const broadcastEvent = useCallback((logItem) => {
    setEventLogs(prev => [logItem, ...prev.slice(0, 49)]);
    if (channelRef.current) {
      try {
        channelRef.current.postMessage({ type: 'NEW_EVENT_LOG', payload: logItem });
      } catch {
        // channel error
      }
    }
  }, []);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  // Helper: Find user by ID
  const getUser = useCallback((id) => {
    return users.find(u => u.id === id);
  }, [users]);

  // --------------------------------------------------------------------------
  // CORE GRAPH MUTATIONS (Emulating Postgres Transactions & Triggers)
  // --------------------------------------------------------------------------

  /**
   * Follow Action:
   * A follows B.
   * If B is private AND B does not already follow A -> create pending follow request.
   * If B already follows A -> instant reciprocity -> trigger FRIENDSHIP_CONFIRMED!
   */
  const followUser = useCallback(async (followerId, followingId) => {
    if (followerId === followingId) return { success: false, error: 'Self-follow prohibited' };

    const targetUser = users.find(u => u.id === followingId);
    const followerUser = users.find(u => u.id === followerId);
    const targetFollowsMe = isFollowing(relationships, followingId, followerId);

    // Simulated network delay
    await new Promise(r => setTimeout(r, networkLatencyMs));

    if (simulateNetworkFailure) {
      throw new Error('NETWORK_TIMEOUT: Postgres write connection timed out (Simulated)');
    }

    // If target is private and does NOT follow me yet -> enter REQUESTED state
    if (targetUser?.isPrivate && !targetFollowsMe) {
      const newRequest = {
        id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        requesterId: followerId,
        targetId: followingId,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      setRequests(prev => {
        const filtered = prev.filter(r => !(r.requesterId === followerId && r.targetId === followingId));
        return [...filtered, newRequest];
      });

      broadcastEvent({
        id: `evt-${Date.now()}`,
        type: SOCIAL_EVENTS.FOLLOW_REQUESTED,
        title: 'Follow Request Sent (Private Gate)',
        details: `${followerUser?.username} requested to follow protected account ${targetUser?.username}`,
        timestamp: 'Just now',
        color: 'amber',
      });

      return { success: true, state: 'REQUESTED' };
    }

    // Add directional edge
    const newEdge = {
      followerId,
      followingId,
      createdAt: new Date().toISOString(),
    };

    setRelationships(prev => {
      const exists = prev.some(r => r.followerId === followerId && r.followingId === followingId);
      if (exists) return prev;
      return [...prev, newEdge];
    });

    // Remove any pending request
    setRequests(prev => prev.filter(r => !(r.requesterId === followerId && r.targetId === followingId)));

    // CHECK POST-INSERT TRIGGER: Did this action complete the mutual circle?
    if (targetFollowsMe) {
      // CELEBRATION! Mutual status confirmed
      fireMutualConfetti();

      const celebrationPayload = {
        initiator: followerUser,
        target: targetUser,
        establishedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };

      setCelebrationData(celebrationPayload);

      broadcastEvent({
        id: `evt-${Date.now()}`,
        type: SOCIAL_EVENTS.MUTUAL_UNLOCKED,
        title: '✨ FRIENDSHIP_CONFIRMED (Mutual Loop Completed)',
        details: `${followerUser?.displayName} & ${targetUser?.displayName} are now Mutual Friends!`,
        timestamp: 'Just now',
        color: 'gold',
      });

      return { success: true, state: 'MUTUAL', isMutualUnlock: true };
    } else {
      broadcastEvent({
        id: `evt-${Date.now()}`,
        type: SOCIAL_EVENTS.FOLLOW_CREATED,
        title: 'Asymmetrical Edge Ingested',
        details: `${followerUser?.displayName} is now following ${targetUser?.displayName}`,
        timestamp: 'Just now',
        color: 'cyan',
      });

      return { success: true, state: 'FOLLOWING', isMutualUnlock: false };
    }
  }, [users, relationships, networkLatencyMs, simulateNetworkFailure, broadcastEvent]);

  /**
   * Unfollow Action:
   * Sever directional edge (followerId -> followingId).
   * If it was mutual, drops connection back to one-way or none.
   */
  const unfollowUser = useCallback(async (followerId, followingId) => {
    // Simulated network delay
    await new Promise(r => setTimeout(r, networkLatencyMs));

    if (simulateNetworkFailure) {
      throw new Error('NETWORK_TIMEOUT: Postgres write connection timed out (Simulated)');
    }

    const wasMutual = isMutual(relationships, followerId, followingId);
    const followerUser = users.find(u => u.id === followerId);
    const targetUser = users.find(u => u.id === followingId);

    setRelationships(prev => 
      prev.filter(r => !(r.followerId === followerId && r.followingId === followingId))
    );

    // Also remove any pending request if existed
    setRequests(prev => 
      prev.filter(r => !(r.requesterId === followerId && r.targetId === followingId))
    );

    if (wasMutual) {
      broadcastEvent({
        id: `evt-${Date.now()}`,
        type: SOCIAL_EVENTS.MUTUAL_BROKEN,
        title: 'Mutual Status Demoted',
        details: `${followerUser?.username} unfollowed ${targetUser?.username} (Mutual status dissolved)`,
        timestamp: 'Just now',
        color: 'rose',
      });
    } else {
      broadcastEvent({
        id: `evt-${Date.now()}`,
        type: SOCIAL_EVENTS.FOLLOW_REMOVED,
        title: 'Subscription Severed',
        details: `${followerUser?.username} unfollowed ${targetUser?.username}`,
        timestamp: 'Just now',
        color: 'slate',
      });
    }

    return { success: true };
  }, [relationships, users, networkLatencyMs, simulateNetworkFailure, broadcastEvent]);

  /**
   * Silent Uncoupling / Soft-Block:
   * Remove a follower without blocking them entirely.
   * If B follows A, A removes B as follower (dropping connection without notifying B).
   */
  const removeFollowerSoftBlock = useCallback(async (userId, followerToRemoveId) => {
    await new Promise(r => setTimeout(r, networkLatencyMs));

    if (simulateNetworkFailure) {
      throw new Error('NETWORK_TIMEOUT: Soft-block mutation rejected (Simulated)');
    }

    const currentUserObj = users.find(u => u.id === userId);
    const removedUser = users.find(u => u.id === followerToRemoveId);

    // Sever the incoming edge: (followerToRemoveId -> userId)
    setRelationships(prev => 
      prev.filter(r => !(r.followerId === followerToRemoveId && r.followingId === userId))
    );

    broadcastEvent({
      id: `evt-${Date.now()}`,
      type: SOCIAL_EVENTS.FOLLOWER_REMOVED_SOFT_BLOCK,
      title: 'Silent Uncoupling (Soft Block Applied)',
      details: `${currentUserObj?.displayName} removed follower @${removedUser?.username} silently with no notification.`,
      timestamp: 'Just now',
      color: 'purple',
    });

    return { success: true };
  }, [users, networkLatencyMs, simulateNetworkFailure, broadcastEvent]);

  /**
   * Mute Without Severing:
   * Hide target's posts from feed while preserving mutual badge and public status.
   */
  const toggleMuteUser = useCallback(async (userId, targetUserId) => {
    const isMuted = mutes.some(m => m.userId === userId && m.mutedUserId === targetUserId);
    const targetUser = users.find(u => u.id === targetUserId);

    if (isMuted) {
      setMutes(prev => prev.filter(m => !(m.userId === userId && m.mutedUserId === targetUserId)));
      broadcastEvent({
        id: `evt-${Date.now()}`,
        type: SOCIAL_EVENTS.MUTE_TOGGLED,
        title: 'Mute Removed',
        details: `Unmuted @${targetUser?.username}. Activity restored to feed.`,
        timestamp: 'Just now',
        color: 'slate',
      });
    } else {
      setMutes(prev => [...prev, { userId, mutedUserId: targetUserId, createdAt: new Date().toISOString() }]);
      broadcastEvent({
        id: `evt-${Date.now()}`,
        type: SOCIAL_EVENTS.MUTE_TOGGLED,
        title: 'Muted Disengagement Enabled',
        details: `Muted posts from @${targetUser?.username} while preserving mutual friendship status.`,
        timestamp: 'Just now',
        color: 'amber',
      });
    }

    return { success: true, isMuted: !isMuted };
  }, [mutes, users, broadcastEvent]);

  /**
   * Approve a pending follow request (Private account)
   */
  const approveRequest = useCallback(async (requestId) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    // Add edge: req.requesterId -> req.targetId
    await followUser(req.requesterId, req.targetId);

    // Remove request
    setRequests(prev => prev.filter(r => r.id !== requestId));
  }, [requests, followUser]);

  /**
   * Reject a pending follow request
   */
  const rejectRequest = useCallback(async (requestId) => {
    setRequests(prev => prev.filter(r => r.id !== requestId));
    broadcastEvent({
      id: `evt-${Date.now()}`,
      type: SOCIAL_EVENTS.REQUEST_REJECTED,
      title: 'Follow Request Declined',
      details: 'Request was quietly removed.',
      timestamp: 'Just now',
      color: 'slate',
    });
  }, [requests, broadcastEvent]);

  /**
   * Add a new post with audience gating (public | followers | mutuals)
   */
  const createPost = useCallback((content, audience = 'public', mediaUrl = null, tags = []) => {
    const newPost = {
      id: `post-${Date.now()}`,
      authorId: currentUserId,
      content,
      mediaUrl,
      audience,
      tags: tags.length ? tags : ['Update'],
      likesCount: 0,
      commentsCount: 0,
      createdAt: 'Just now',
      timestamp: new Date().toISOString(),
    };

    setPosts(prev => [newPost, ...prev]);

    broadcastEvent({
      id: `evt-${Date.now()}`,
      type: 'post.created',
      title: `New Post Published (${audience.toUpperCase()})`,
      details: `@${currentUser.username} posted with [${audience}] audience gate.`,
      timestamp: 'Just now',
      color: audience === 'mutuals' ? 'gold' : audience === 'followers' ? 'indigo' : 'cyan',
    });

    return newPost;
  }, [currentUserId, currentUser, broadcastEvent]);

  /**
   * Reset graph to default factory state
   */
  const resetGraphData = useCallback(() => {
    localStorage.removeItem('nexus_users');
    localStorage.removeItem('nexus_relationships');
    localStorage.removeItem('nexus_requests');
    localStorage.removeItem('nexus_mutes');
    localStorage.removeItem('nexus_posts');
    localStorage.removeItem('nexus_current_user');

    setUsers(INITIAL_USERS);
    setRelationships(INITIAL_RELATIONSHIPS);
    setRequests(INITIAL_REQUESTS);
    setMutes(INITIAL_MUTES);
    setPosts(INITIAL_POSTS);
    setCurrentUserId('user-alex');

    broadcastEvent({
      id: `evt-${Date.now()}`,
      type: 'graph.reset',
      title: 'Graph Seed State Restored',
      details: 'All relationships and test scenarios restored to default demonstration baseline.',
      timestamp: 'Just now',
      color: 'slate',
    });
  }, [broadcastEvent]);

  const value = {
    users,
    relationships,
    requests,
    mutes,
    posts,
    currentUserId,
    currentUser,
    getUser,
    setCurrentUserId,
    followUser,
    unfollowUser,
    removeFollowerSoftBlock,
    toggleMuteUser,
    approveRequest,
    rejectRequest,
    createPost,
    resetGraphData,
    celebrationData,
    closeCelebration: () => setCelebrationData(null),
    eventLogs,
    simulateNetworkFailure,
    setSimulateNetworkFailure,
    networkLatencyMs,
    setNetworkLatencyMs,
  };

  return (
    <SocialGraphContext.Provider value={value}>
      {children}
    </SocialGraphContext.Provider>
  );
}

export function useSocialGraph() {
  const context = useContext(SocialGraphContext);
  if (!context) {
    throw new Error('useSocialGraph must be used within a SocialGraphProvider');
  }
  return context;
}
