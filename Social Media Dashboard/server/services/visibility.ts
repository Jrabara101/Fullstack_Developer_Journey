import type { DatabaseSync } from 'node:sqlite';
import type {
  AudienceTier,
  FeedPost,
  MediaItem,
  PostComment,
  PostPoll,
  ProfileSummary,
  QuoteCard,
  RelationshipState,
  ReplyPolicy,
  StorySlide,
  StoryWidget,
  VoiceNote,
} from '../../src/types/social.ts';

export interface PresenceMap {
  get(userId: string): { isOnline: boolean; activity: string | null } | undefined;
}

export function safeJsonParse<T>(raw: unknown, fallback: T): T {
  if (typeof raw !== 'string' || !raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export class VisibilityService {
  private readonly db: DatabaseSync;
  private readonly presenceMap?: PresenceMap;

  constructor(db: DatabaseSync, presenceMap?: PresenceMap) {
    this.db = db;
    this.presenceMap = presenceMap;
  }

  isAcceptedFollower(viewerId: string, targetId: string): boolean {
    if (viewerId === targetId) return true;
    const row = this.db
      .prepare(
        `SELECT 1 FROM relationships WHERE follower_id = ? AND following_id = ? AND status = 'accepted'`
      )
      .get(viewerId, targetId);
    return Boolean(row);
  }

  isCloseFriend(viewerId: string, authorId: string): boolean {
    if (viewerId === authorId) return true;
    const row = this.db
      .prepare(
        `SELECT 1 FROM relationships WHERE follower_id = ? AND following_id = ? AND status = 'accepted' AND is_close_friend = 1`
      )
      .get(viewerId, authorId);
    return Boolean(row);
  }

  isMutualFriend(userA: string, userB: string): boolean {
    if (userA === userB) return true;
    return this.isAcceptedFollower(userA, userB) && this.isAcceptedFollower(userB, userA);
  }

  getRelationshipState(viewerId: string, targetId: string): RelationshipState {
    if (viewerId === targetId) return 'self';

    const outgoing = this.db
      .prepare(`SELECT status FROM relationships WHERE follower_id = ? AND following_id = ?`)
      .get(viewerId, targetId) as { status: string } | undefined;
    const incoming = this.db
      .prepare(`SELECT status FROM relationships WHERE follower_id = ? AND following_id = ?`)
      .get(targetId, viewerId) as { status: string } | undefined;

    if (outgoing?.status === 'pending') return 'requested';
    if (outgoing?.status === 'accepted' && incoming?.status === 'accepted') {
      return 'mutual_friends';
    }
    if (outgoing?.status === 'accepted') return 'following';
    if (incoming?.status === 'accepted') return 'follow_back';
    return 'none';
  }

  canViewStory(viewerId: string, storyRow: Record<string, unknown>): boolean {
    const authorId = String(storyRow.author_id);
    if (viewerId === authorId) return true;

    const nowIso = new Date().toISOString();
    const isArchived = Boolean(storyRow.is_archived);
    const isHighlighted = Boolean(storyRow.is_highlighted);
    const isActive = String(storyRow.expires_at) > nowIso && !isArchived;

    if (!isActive && !isHighlighted) return false;

    const audience = String(storyRow.audience);
    if (audience === 'close_friends') {
      return this.isCloseFriend(viewerId, authorId);
    }

    const authorProfile = this.db
      .prepare(`SELECT is_private FROM profiles WHERE id = ?`)
      .get(authorId) as { is_private: number } | undefined;
    if (authorProfile?.is_private) {
      return this.isAcceptedFollower(viewerId, authorId);
    }
    return true;
  }

  canViewPost(viewerId: string, postRow: Record<string, unknown>): boolean {
    const authorId = String(postRow.author_id);
    const coAuthorId = postRow.co_author_id ? String(postRow.co_author_id) : null;
    if (viewerId === authorId || (coAuthorId && viewerId === coAuthorId)) return true;

    const audience = String(postRow.audience) as AudienceTier;
    if (audience === 'close_friends') {
      return this.isCloseFriend(viewerId, authorId);
    }
    if (audience === 'followers') {
      return this.isAcceptedFollower(viewerId, authorId);
    }

    const authorProfile = this.db
      .prepare(`SELECT is_private FROM profiles WHERE id = ?`)
      .get(authorId) as { is_private: number } | undefined;
    if (authorProfile?.is_private) {
      return this.isAcceptedFollower(viewerId, authorId);
    }
    return true;
  }

  canReplyToPost(viewerId: string, postRow: Record<string, unknown>): boolean {
    if (!this.canViewPost(viewerId, postRow)) return false;
    const replyPolicy = String(postRow.reply_policy) as ReplyPolicy;
    if (replyPolicy === 'everyone') return true;
    const authorId = String(postRow.author_id);
    const coAuthorId = postRow.co_author_id ? String(postRow.co_author_id) : null;
    return (
      viewerId === authorId ||
      (coAuthorId !== null && viewerId === coAuthorId) ||
      this.isMutualFriend(viewerId, authorId)
    );
  }

  hydrateProfileSummary(profileRow: Record<string, unknown>, viewerId: string): ProfileSummary {
    const targetId = String(profileRow.id);
    const relState = this.getRelationshipState(viewerId, targetId);

    const closeFriendRow = this.db
      .prepare(
        `SELECT is_close_friend FROM relationships WHERE follower_id = ? AND following_id = ? AND status = 'accepted'`
      )
      .get(targetId, viewerId) as { is_close_friend: number } | undefined;

    // Mutuals: accounts that viewer follows AND that follow targetId
    const mutualRows = this.db
      .prepare(
        `SELECT p.id, p.username, p.display_name, p.avatar_url
         FROM profiles p
         JOIN relationships r1 ON r1.following_id = p.id AND r1.follower_id = ? AND r1.status = 'accepted'
         JOIN relationships r2 ON r2.follower_id = p.id AND r2.following_id = ? AND r2.status = 'accepted'
         WHERE p.id <> ? AND p.id <> ?
         LIMIT 3`
      )
      .all(viewerId, targetId, viewerId, targetId) as Array<{
      id: string;
      username: string;
      display_name: string;
      avatar_url: string;
    }>;

    const mutualCountRow = this.db
      .prepare(
        `SELECT COUNT(*) as cnt
         FROM relationships r1
         JOIN relationships r2 ON r1.following_id = r2.follower_id
         WHERE r1.follower_id = ? AND r1.status = 'accepted'
           AND r2.following_id = ? AND r2.status = 'accepted'
           AND r1.following_id <> ? AND r1.following_id <> ?`
      )
      .get(viewerId, targetId, viewerId, targetId) as { cnt: number } | undefined;

    // Active story segments visible to viewerId
    const nowIso = new Date().toISOString();
    const activeStoryRows = this.db
      .prepare(
        `SELECT s.*, CASE WHEN sv.viewer_id IS NOT NULL THEN 1 ELSE 0 END as is_viewed
         FROM stories s
         LEFT JOIN story_views sv ON sv.story_id = s.id AND sv.viewer_id = ?
         WHERE s.author_id = ? AND s.expires_at > ? AND s.is_archived = 0
         ORDER BY s.created_at ASC`
      )
      .all(viewerId, targetId, nowIso) as Array<Record<string, unknown>>;

    const visibleStories = activeStoryRows.filter((s) => this.canViewStory(viewerId, s));
    const seenCount = visibleStories.filter((s) => Boolean(s.is_viewed)).length;
    const hasUnseen = visibleStories.some((s) => !s.is_viewed);
    const hasCloseFriendStory = visibleStories.some(
      (s) => s.audience === 'close_friends' && !s.is_viewed
    );

    const presence = this.presenceMap?.get(targetId);

    return {
      id: targetId,
      username: String(profileRow.username),
      display_name: String(profileRow.display_name),
      bio: String(profileRow.bio || ''),
      pronouns: String(profileRow.pronouns || ''),
      website: String(profileRow.website || ''),
      location: String(profileRow.location || ''),
      status_emoji: String(profileRow.status_emoji || '✨'),
      status_text: String(profileRow.status_text || ''),
      avatar_url: String(profileRow.avatar_url),
      banner_url: String(profileRow.banner_url || ''),
      is_private: Boolean(profileRow.is_private),
      read_receipts_enabled: Boolean(profileRow.read_receipts_enabled),
      followers_count: Number(profileRow.followers_count || 0),
      following_count: Number(profileRow.following_count || 0),
      created_at: String(profileRow.created_at),
      relationship_state: relState,
      is_close_friend: Boolean(closeFriendRow?.is_close_friend),
      mutuals_count: Number(mutualCountRow?.cnt || 0),
      mutual_preview: mutualRows,
      has_active_story: visibleStories.length > 0,
      has_unseen_story: hasUnseen,
      has_close_friend_story: hasCloseFriendStory,
      story_segments_count: visibleStories.length,
      story_seen_segments: seenCount,
      is_online: presence?.isOnline ?? false,
      current_activity: presence?.activity ?? null,
    };
  }

  getProfileById(id: string, viewerId: string): ProfileSummary | null {
    const row = this.db.prepare(`SELECT * FROM profiles WHERE id = ?`).get(id) as
      | Record<string, unknown>
      | undefined;
    if (!row) return null;
    return this.hydrateProfileSummary(row, viewerId);
  }

  hydrateComment(row: Record<string, unknown>, viewerId: string): PostComment {
    const author = this.getProfileById(String(row.author_id), viewerId)!;
    return {
      id: String(row.id),
      post_id: String(row.post_id),
      author,
      content: String(row.content),
      is_pinned: Boolean(row.is_pinned),
      likes_count: Number(row.likes_count || 0),
      created_at: String(row.created_at),
    };
  }

  hydratePost(postRow: Record<string, unknown>, viewerId: string): FeedPost {
    const postId = String(postRow.id);
    const author = this.getProfileById(String(postRow.author_id), viewerId)!;
    const coAuthor = postRow.co_author_id
      ? this.getProfileById(String(postRow.co_author_id), viewerId)
      : null;

    const liked = Boolean(
      this.db
        .prepare(`SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?`)
        .get(postId, viewerId)
    );
    const bookmark = this.db
      .prepare(`SELECT collection_id FROM post_bookmarks WHERE post_id = ? AND user_id = ?`)
      .get(postId, viewerId) as { collection_id: string | null } | undefined;

    const poll = safeJsonParse<PostPoll | null>(postRow.poll, null);
    if (poll) {
      const voteRow = this.db
        .prepare(`SELECT option_id FROM post_poll_votes WHERE post_id = ? AND user_id = ?`)
        .get(postId, viewerId) as { option_id: string } | undefined;
      poll.user_voted_option_id = voteRow?.option_id ?? null;
    }

    const commentRows = this.db
      .prepare(
        `SELECT * FROM comments WHERE post_id = ? ORDER BY is_pinned DESC, created_at ASC LIMIT 2`
      )
      .all(postId) as Array<Record<string, unknown>>;

    return {
      id: postId,
      author,
      co_author: coAuthor,
      caption: String(postRow.caption || ''),
      media_items: safeJsonParse<MediaItem[]>(postRow.media_items, []),
      quote_card: safeJsonParse<QuoteCard | null>(postRow.quote_card, null),
      voice_note: safeJsonParse<VoiceNote | null>(postRow.voice_note, null),
      poll,
      tags: safeJsonParse<string[]>(postRow.tags, []),
      location: String(postRow.location || ''),
      audio_title: String(postRow.audio_title || ''),
      audience: String(postRow.audience) as AudienceTier,
      reply_policy: String(postRow.reply_policy) as ReplyPolicy,
      hide_like_count: Boolean(postRow.hide_like_count),
      likes_count: Number(postRow.likes_count || 0),
      comments_count: Number(postRow.comments_count || 0),
      reposts_count: Number(postRow.reposts_count || 0),
      is_pinned: Boolean(postRow.is_pinned),
      is_liked: liked,
      is_bookmarked: Boolean(bookmark),
      bookmark_collection_id: bookmark?.collection_id ?? null,
      top_comments: commentRows.map((c) => this.hydrateComment(c, viewerId)),
      can_viewer_reply: this.canReplyToPost(viewerId, postRow),
      created_at: String(postRow.created_at),
    };
  }

  hydrateStorySlide(row: Record<string, unknown>, viewerId: string): StorySlide {
    const storyId = String(row.id);
    const viewRow = this.db
      .prepare(`SELECT reaction_emoji FROM story_views WHERE story_id = ? AND viewer_id = ?`)
      .get(storyId, viewerId) as { reaction_emoji: string | null } | undefined;
    const viewCountRow = this.db
      .prepare(`SELECT COUNT(*) as cnt FROM story_views WHERE story_id = ?`)
      .get(storyId) as { cnt: number };

    const widget = safeJsonParse<StoryWidget | null>(row.interactive_widget, null);
    if (widget) {
      const interactionRow = this.db
        .prepare(`SELECT payload FROM story_interactions WHERE story_id = ? AND user_id = ?`)
        .get(storyId, viewerId) as { payload: string } | undefined;
      if (interactionRow) {
        const parsed = safeJsonParse<{ optionId?: string; sliderValue?: number }>(
          interactionRow.payload,
          {}
        );
        if (widget.kind === 'poll' && parsed.optionId) {
          widget.user_vote = parsed.optionId;
        }
        if (widget.kind === 'slider' && typeof parsed.sliderValue === 'number') {
          widget.user_value = parsed.sliderValue;
        }
      }
    }

    return {
      id: storyId,
      author_id: String(row.author_id),
      media_url: String(row.media_url),
      media_type: String(row.media_type) as 'image' | 'video',
      duration_ms: Number(row.duration_ms || 5000),
      audience: String(row.audience) as 'public' | 'close_friends',
      caption: String(row.caption || ''),
      music_track: safeJsonParse<{ title: string; artist: string } | null>(row.music_track, null),
      interactive_widget: widget,
      highlight_title: row.highlight_title ? String(row.highlight_title) : null,
      expires_at: String(row.expires_at),
      is_highlighted: Boolean(row.is_highlighted),
      is_archived: Boolean(row.is_archived),
      is_viewed: Boolean(viewRow),
      viewer_reaction: viewRow?.reaction_emoji ?? null,
      view_count: Number(viewCountRow?.cnt || 0),
      created_at: String(row.created_at),
    };
  }
}
