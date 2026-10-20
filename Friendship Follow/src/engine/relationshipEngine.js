import { INITIAL_USERS, INITIAL_RELATIONSHIPS, INITIAL_REQUESTS, INITIAL_MUTES } from '../mockData/users.js';
import { INITIAL_POSTS } from '../mockData/posts.js';
import { RelationshipState, AudienceGate } from '../types/index.js';

const STORAGE_KEY_PREFIX = 'nexus_graph_v1_';

class RelationshipEngine {
  constructor() {
    this.subscribers = new Set();
    this.simulateNetworkError = false;
    this.loadState();
  }

  loadState() {
    try {
      const usersData = localStorage.getItem(STORAGE_KEY_PREFIX + 'users');
      const relsData = localStorage.getItem(STORAGE_KEY_PREFIX + 'relationships');
      const reqsData = localStorage.getItem(STORAGE_KEY_PREFIX + 'requests');
      const mutesData = localStorage.getItem(STORAGE_KEY_PREFIX + 'mutes');
      const postsData = localStorage.getItem(STORAGE_KEY_PREFIX + 'posts');
      const dmsData = localStorage.getItem(STORAGE_KEY_PREFIX + 'dms');
      const activeUser = localStorage.getItem(STORAGE_KEY_PREFIX + 'active_user');

      this.users = usersData ? JSON.parse(usersData) : [...INITIAL_USERS];
      this.relationships = relsData ? JSON.parse(relsData) : [...INITIAL_RELATIONSHIPS];
      this.requests = reqsData ? JSON.parse(reqsData) : [...INITIAL_REQUESTS];
      this.mutes = mutesData ? JSON.parse(mutesData) : [...INITIAL_MUTES];
      this.posts = postsData ? JSON.parse(postsData) : [...INITIAL_POSTS];
      this.directMessages = dmsData ? JSON.parse(dmsData) : [
        {
          id: 'dm_1',
          senderId: 'user_alex',
          receiverId: 'user_maya',
          content: 'Hey Maya! Glad we are mutual friends now. Check out the latest design token draft for the graph engine!',
          createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        },
        {
          id: 'dm_2',
          senderId: 'user_maya',
          receiverId: 'user_alex',
          content: 'Love it Alex! The animated continuous gradient border looks super crisp with the new electric violet & pink tokens.',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        }
      ];
      this.activeUserId = activeUser || 'user_maya';
    } catch {
      this.resetToDefaults();
    }
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'users', JSON.stringify(this.users));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'relationships', JSON.stringify(this.relationships));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'requests', JSON.stringify(this.requests));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'mutes', JSON.stringify(this.mutes));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'posts', JSON.stringify(this.posts));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'dms', JSON.stringify(this.directMessages));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'active_user', this.activeUserId);
    } catch {
      // ignore quota errors
    }
    this.notifySubscribers();
  }

  resetToDefaults() {
    this.users = [...INITIAL_USERS];
    this.relationships = [...INITIAL_RELATIONSHIPS];
    this.requests = [...INITIAL_REQUESTS];
    this.mutes = [...INITIAL_MUTES];
    this.posts = [...INITIAL_POSTS];
    this.directMessages = [
      {
        id: 'dm_1',
        senderId: 'user_alex',
        receiverId: 'user_maya',
        content: 'Hey Maya! Glad we are mutual friends now. Check out the latest design token draft for the graph engine!',
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        id: 'dm_2',
        senderId: 'user_maya',
        receiverId: 'user_alex',
        content: 'Love it Alex! The animated continuous gradient border looks super crisp with the new electric violet & pink tokens.',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      }
    ];
    this.activeUserId = 'user_maya';
    this.saveState();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers(eventPayload = null) {
    for (const callback of this.subscribers) {
      try {
        callback(eventPayload);
      } catch (err) {
        console.error('Subscriber error:', err);
      }
    }
  }

  setSimulateNetworkError(val) {
    this.simulateNetworkError = val;
    this.notifySubscribers({ type: 'SIMULATION_TOGGLED', value: val });
  }

  setActiveUser(userId) {
    if (this.users.some(u => u.id === userId)) {
      this.activeUserId = userId;
      this.saveState();
      this.notifySubscribers({ type: 'ACTIVE_USER_CHANGED', userId });
    }
  }

  getActiveUser() {
    return this.users.find(u => u.id === this.activeUserId) || this.users[0];
  }

  getUserById(id) {
    return this.users.find(u => u.id === id);
  }

  // --- Graph Traversal Queries ---

  hasEdge(followerId, followingId) {
    return this.relationships.some(
      r => r.followerId === followerId && r.followingId === followingId
    );
  }

  isMutual(userAId, userBId) {
    return this.hasEdge(userAId, userBId) && this.hasEdge(userBId, userAId);
  }

  isPendingRequest(requesterId, targetId) {
    return this.requests.some(
      r => r.requesterId === requesterId && r.targetId === targetId && r.status === 'pending'
    );
  }

  isMuted(userId, targetId) {
    return this.mutes.some(m => m.userId === userId && m.mutedUserId === targetId);
  }

  /**
   * Finite State Machine: Evaluates the exact relationship state between two users
   */
  getRelationshipState(currentUserId, targetUserId) {
    if (currentUserId === targetUserId) {
      return 'SELF';
    }

    if (this.isPendingRequest(currentUserId, targetUserId)) {
      return RelationshipState.REQUESTED;
    }

    const iFollowThem = this.hasEdge(currentUserId, targetUserId);
    const theyFollowMe = this.hasEdge(targetUserId, currentUserId);

    if (iFollowThem && theyFollowMe) {
      return RelationshipState.MUTUAL;
    }
    if (iFollowThem && !theyFollowMe) {
      return RelationshipState.FOLLOWING;
    }
    if (!iFollowThem && theyFollowMe) {
      return RelationshipState.FOLLOW_BACK;
    }
    return RelationshipState.NONE;
  }

  /**
   * Followers list for a user
   */
  getFollowers(userId) {
    const followerIds = this.relationships
      .filter(r => r.followingId === userId)
      .map(r => r.followerId);
    return this.users.filter(u => followerIds.includes(u.id));
  }

  /**
   * Following list for a user
   */
  getFollowing(userId) {
    const followingIds = this.relationships
      .filter(r => r.followerId === userId)
      .map(r => r.followingId);
    return this.users.filter(u => followingIds.includes(u.id));
  }

  /**
   * Mutual Friends for a user (Bidirectional intersection)
   */
  getMutualFriends(userId) {
    const followingIds = new Set(
      this.relationships.filter(r => r.followerId === userId).map(r => r.followingId)
    );
    const followerIds = new Set(
      this.relationships.filter(r => r.followingId === userId).map(r => r.followerId)
    );

    const mutualIds = [...followingIds].filter(id => followerIds.has(id));
    return this.users.filter(u => mutualIds.includes(u.id));
  }

  /**
   * Shared Mutual Friends between User A and User B
   */
  getSharedMutuals(userAId, userBId) {
    const mutualsA = new Set(this.getMutualFriends(userAId).map(u => u.id));
    const mutualsB = new Set(this.getMutualFriends(userBId).map(u => u.id));

    const sharedIds = [...mutualsA].filter(id => mutualsB.has(id) && id !== userAId && id !== userBId);
    return this.users.filter(u => sharedIds.includes(u.id));
  }

  /**
   * Contextual Overlap Radar:
   * Finds accounts that viewer follows who also follow the target, or mutual connections
   */
  getContextualOverlap(viewerId, targetId) {
    const viewerFollowing = new Set(
      this.relationships.filter(r => r.followerId === viewerId).map(r => r.followingId)
    );
    const targetFollowers = new Set(
      this.relationships.filter(r => r.followingId === targetId).map(r => r.followerId)
    );

    // Accounts that viewer follows who also follow target
    const overlapIds = [...viewerFollowing].filter(id => targetFollowers.has(id) && id !== targetId && id !== viewerId);
    const overlapUsers = this.users.filter(u => overlapIds.includes(u.id));

    // Also get shared mutuals
    const sharedMutuals = this.getSharedMutuals(viewerId, targetId);

    return {
      overlapUsers,
      sharedMutuals,
      count: Math.max(overlapUsers.length, sharedMutuals.length),
    };
  }

  /**
   * Graph Triangle Completion Suggestions:
   * Users who follow your mutuals, but whom you haven't followed yet.
   */
  getTriangleSuggestions(currentUserId, limit = 5) {
    const myMutuals = this.getMutualFriends(currentUserId);
    const myFollowingIds = new Set(
      this.relationships.filter(r => r.followerId === currentUserId).map(r => r.followingId)
    );

    const candidateScores = new Map();

    for (const mutual of myMutuals) {
      // People that this mutual follows
      const theirFollowing = this.relationships
        .filter(r => r.followerId === mutual.id)
        .map(r => r.followingId);

      for (const candidateId of theirFollowing) {
        if (candidateId === currentUserId || myFollowingIds.has(candidateId)) {
          continue;
        }
        if (!candidateScores.has(candidateId)) {
          candidateScores.set(candidateId, { count: 0, via: [] });
        }
        const data = candidateScores.get(candidateId);
        data.count += 1;
        if (!data.via.includes(mutual.displayName)) {
          data.via.push(mutual.displayName);
        }
      }
    }

    const sorted = [...candidateScores.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, limit);

    return sorted.map(([id, scoreData]) => ({
      user: this.getUserById(id),
      score: scoreData.count,
      viaMutuals: scoreData.via,
    })).filter(item => item.user !== undefined);
  }

  /**
   * Relationship Timeline Milestone:
   * Returns tenure string and shared count
   */
  getMutualMilestone(userAId, userBId) {
    const edgeA = this.relationships.find(r => r.followerId === userAId && r.followingId === userBId);
    const edgeB = this.relationships.find(r => r.followerId === userBId && r.followingId === userAId);

    if (!edgeA || !edgeB) return null;

    const dateA = new Date(edgeA.createdAt);
    const dateB = new Date(edgeB.createdAt);
    const mutualDate = dateA > dateB ? dateA : dateB;

    const options = { month: 'long', year: 'numeric' };
    const dateStr = mutualDate.toLocaleDateString('en-US', options);

    const sharedCount = this.getSharedMutuals(userAId, userBId).length;

    return {
      dateStr,
      sharedCount,
      tenureLabel: `Mutuals since ${dateStr} • ${sharedCount} Shared Connection${sharedCount === 1 ? '' : 's'}`
    };
  }

  // --- State Transition Actions (with Optimistic Rollback Support) ---

  /**
   * Core Universal Follow Action:
   * Handles 0-friction follows, private request gates, and automated mutual elevation!
   */
  async executeFollowAction(currentUserId, targetUserId) {
    if (currentUserId === targetUserId) return;

    // Snapshot state for potential rollback
    const snapshot = {
      relationships: [...this.relationships],
      requests: [...this.requests],
      mutes: [...this.mutes],
    };

    const targetUser = this.getUserById(targetUserId);
    const currentState = this.getRelationshipState(currentUserId, targetUserId);
    const theyFollowMe = this.hasEdge(targetUserId, currentUserId);

    let nextState = currentState;
    let eventType = '';

    // Apply optimistic updates locally
    if (currentState === RelationshipState.NONE || currentState === RelationshipState.FOLLOW_BACK) {
      if (targetUser?.isPrivate && !theyFollowMe) {
        // Target is private and hasn't followed active user yet -> pending request
        this.requests.push({
          requesterId: currentUserId,
          targetId: targetUserId,
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
        nextState = RelationshipState.REQUESTED;
        eventType = 'REQUEST_SENT';
      } else {
        // Target is public OR target already follows active user -> instant follow!
        const newEdge = {
          followerId: currentUserId,
          followingId: targetUserId,
          createdAt: new Date().toISOString(),
        };
        this.relationships.push(newEdge);

        // Remove any lingering requests
        this.requests = this.requests.filter(
          r => !(r.requesterId === currentUserId && r.targetId === targetUserId)
        );

        if (theyFollowMe) {
          // Reciprocal loop completed! Elevated to MUTUAL FRIENDSHIP!
          nextState = RelationshipState.MUTUAL;
          eventType = 'FRIENDSHIP_CONFIRMED';
        } else {
          nextState = RelationshipState.FOLLOWING;
          eventType = 'FOLLOW_ADDED';
        }
      }
    } else if (currentState === RelationshipState.FOLLOWING || currentState === RelationshipState.MUTUAL) {
      // Unfollow action
      this.relationships = this.relationships.filter(
        r => !(r.followerId === currentUserId && r.followingId === targetUserId)
      );

      if (currentState === RelationshipState.MUTUAL) {
        // Was mutual, now drops back to one-way inbound from their side
        nextState = RelationshipState.FOLLOW_BACK;
        eventType = 'MUTUAL_SEVERED';
      } else {
        nextState = RelationshipState.NONE;
        eventType = 'UNFOLLOWED';
      }
    } else if (currentState === RelationshipState.REQUESTED) {
      // Cancel pending request
      this.requests = this.requests.filter(
        r => !(r.requesterId === currentUserId && r.targetId === targetUserId)
      );
      nextState = RelationshipState.NONE;
      eventType = 'REQUEST_CANCELLED';
    }

    // Save and notify optimistic state immediately
    this.saveState();
    this.notifySubscribers({
      type: eventType,
      currentUserId,
      targetUserId,
      targetUser,
      nextState,
      isOptimistic: true,
    });

    // Simulate backend network latency
    await new Promise(resolve => setTimeout(resolve, 250));

    // If network failure simulation is on, ROLL BACK!
    if (this.simulateNetworkError) {
      this.relationships = snapshot.relationships;
      this.requests = snapshot.requests;
      this.mutes = snapshot.mutes;
      this.saveState();

      const rollbackError = new Error('Network timeout: Operation rolled back.');
      this.notifySubscribers({
        type: 'ROLLBACK_TRIGGERED',
        currentUserId,
        targetUserId,
        error: rollbackError.message,
      });
      throw rollbackError;
    }

    return nextState;
  }

  /**
   * Silent Uncoupling ("Soft Block"):
   * Silently removes a follower without alerting them or blocking their account.
   */
  async softBlockFollower(currentUserId, followerId) {
    const snapshot = [...this.relationships];
    
    // Remove the incoming edge (followerId -> currentUserId)
    this.relationships = this.relationships.filter(
      r => !(r.followerId === followerId && r.followingId === currentUserId)
    );

    this.saveState();
    this.notifySubscribers({
      type: 'SOFT_BLOCKED',
      currentUserId,
      followerId,
      isSilent: true,
    });

    await new Promise(resolve => setTimeout(resolve, 200));

    if (this.simulateNetworkError) {
      this.relationships = snapshot;
      this.saveState();
      throw new Error('Network error: Soft-block failed, state reverted.');
    }
  }

  /**
   * Mute Without Severing:
   * Users can mute posts & activity while preserving public mutual status.
   */
  toggleMute(currentUserId, targetId) {
    const existingIndex = this.mutes.findIndex(
      m => m.userId === currentUserId && m.mutedUserId === targetId
    );

    let isMuted = false;
    if (existingIndex >= 0) {
      this.mutes.splice(existingIndex, 1);
      isMuted = false;
    } else {
      this.mutes.push({
        userId: currentUserId,
        mutedUserId: targetId,
        createdAt: new Date().toISOString(),
      });
      isMuted = true;
    }

    this.saveState();
    this.notifySubscribers({
      type: 'MUTE_TOGGLED',
      currentUserId,
      targetId,
      isMuted,
    });
    return isMuted;
  }

  /**
   * Approve a follow request on a private account:
   * If requester is approved, checks if target already follows them; if so, triggers MUTUAL!
   */
  approveRequest(targetId, requesterId) {
    this.requests = this.requests.filter(
      r => !(r.requesterId === requesterId && r.targetId === targetId)
    );

    this.relationships.push({
      followerId: requesterId,
      followingId: targetId,
      createdAt: new Date().toISOString(),
    });

    const isNowMutual = this.hasEdge(targetId, requesterId);

    this.saveState();
    this.notifySubscribers({
      type: isNowMutual ? 'FRIENDSHIP_CONFIRMED' : 'REQUEST_APPROVED',
      currentUserId: targetId,
      targetUserId: requesterId,
    });
  }

  rejectRequest(targetId, requesterId) {
    this.requests = this.requests.filter(
      r => !(r.requesterId === requesterId && r.targetId === targetId)
    );
    this.saveState();
    this.notifySubscribers({
      type: 'REQUEST_REJECTED',
      currentUserId: targetId,
      targetUserId: requesterId,
    });
  }

  /**
   * Tiered Content Gating:
   * Evaluates if viewer can view an item with audience: 'public' | 'followers' | 'mutuals'
   */
  canViewContent(viewerId, authorId, audience) {
    if (viewerId === authorId) return true;
    if (audience === AudienceGate.PUBLIC) return true;

    if (audience === AudienceGate.FOLLOWERS) {
      return this.hasEdge(viewerId, authorId);
    }

    if (audience === AudienceGate.MUTUALS) {
      return this.isMutual(viewerId, authorId);
    }

    return false;
  }

  /**
   * Direct Messages (Mutual Friends Only)
   */
  getDirectMessagesBetween(userAId, userBId) {
    return this.directMessages.filter(
      m => (m.senderId === userAId && m.receiverId === userBId) ||
           (m.senderId === userBId && m.receiverId === userAId)
    ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  sendDirectMessage(senderId, receiverId, content) {
    if (!this.isMutual(senderId, receiverId)) {
      throw new Error('Direct Messaging is strictly restricted to Mutual Friends.');
    }

    const newDm = {
      id: 'dm_' + Date.now(),
      senderId,
      receiverId,
      content,
      createdAt: new Date().toISOString(),
    };

    this.directMessages.push(newDm);
    this.saveState();
    this.notifySubscribers({
      type: 'DIRECT_MESSAGE_SENT',
      message: newDm,
    });
    return newDm;
  }

  /**
   * Publish a new post with audience gating
   */
  createPost(authorId, content, audience = AudienceGate.PUBLIC, mediaUrl = null) {
    const newPost = {
      id: 'post_' + Date.now(),
      authorId,
      content,
      audience,
      likesCount: 0,
      commentsCount: 0,
      createdAt: 'Just now',
      mediaUrl,
    };
    this.posts.unshift(newPost);
    this.saveState();
    this.notifySubscribers({
      type: 'POST_CREATED',
      post: newPost,
    });
    return newPost;
  }
}

export const graphEngine = new RelationshipEngine();
