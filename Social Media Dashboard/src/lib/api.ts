import type {
  ConversationSummary,
  FeedLens,
  FeedPageResponse,
  FeedPost,
  Message,
  MessagesPageResponse,
  NotificationItem,
  PostComment,
  ProfileSummary,
  SavedCollection,
  StoryAuthorGroup,
  StoryHighlightCapsule,
  StorySlide,
  StoryWidget,
} from '../types/social';

let currentUserId =
  (typeof window !== 'undefined' && localStorage.getItem('lumen_active_user_id')) || 'user-alex';

export function getActiveUserId(): string {
  return currentUserId;
}

export function setActiveUserId(userId: string) {
  currentUserId = userId;
  if (typeof window !== 'undefined') {
    localStorage.setItem('lumen_active_user_id', userId);
  }
}

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers || {});
  headers.set('x-user-id', currentUserId);
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errBody.error || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getMe: () => apiFetch<{ user: ProfileSummary; personas: ProfileSummary[] }>('/api/me'),

  updateMe: (payload: Partial<ProfileSummary>) =>
    apiFetch<ProfileSummary>('/api/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  getFeed: (lens: FeedLens, cursor?: string | null, limit = 6) => {
    const params = new URLSearchParams({ lens, limit: String(limit) });
    if (cursor) params.set('cursor', cursor);
    return apiFetch<FeedPageResponse>(`/api/feed?${params.toString()}`);
  },

  createPost: (payload: {
    caption: string;
    co_author_id?: string | null;
    media_items?: unknown[];
    quote_card?: unknown;
    voice_note?: unknown;
    poll?: { question: string; options: string[] } | null;
    tags?: string[];
    location?: string;
    audio_title?: string;
    audience?: 'public' | 'followers' | 'close_friends';
    reply_policy?: 'everyone' | 'mutuals';
    hide_like_count?: boolean;
  }) =>
    apiFetch<FeedPost>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updatePostSettings: (
    postId: string,
    payload: { hide_like_count?: boolean; reply_policy?: 'everyone' | 'mutuals'; is_pinned?: boolean }
  ) =>
    apiFetch<FeedPost>(`/api/posts/${postId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  toggleLike: (postId: string) =>
    apiFetch<FeedPost>(`/api/posts/${postId}/like`, { method: 'POST' }),

  toggleBookmark: (postId: string, collection_id?: string | null) =>
    apiFetch<FeedPost>(`/api/posts/${postId}/bookmark`, {
      method: 'POST',
      body: JSON.stringify(collection_id !== undefined ? { collection_id } : {}),
    }),

  votePostPoll: (postId: string, optionId: string) =>
    apiFetch<FeedPost>(`/api/posts/${postId}/poll-vote`, {
      method: 'POST',
      body: JSON.stringify({ optionId }),
    }),

  getComments: (postId: string) =>
    apiFetch<{ items: PostComment[]; can_reply: boolean; reply_policy: string }>(
      `/api/posts/${postId}/comments`
    ),

  addComment: (postId: string, content: string) =>
    apiFetch<PostComment>(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  pinComment: (commentId: string) =>
    apiFetch<PostComment>(`/api/comments/${commentId}/pin`, { method: 'PATCH' }),

  getStories: () => apiFetch<{ groups: StoryAuthorGroup[] }>('/api/stories'),

  createStory: (payload: {
    media_url: string;
    media_type?: 'image' | 'video';
    duration_ms?: number;
    audience?: 'public' | 'close_friends';
    caption?: string;
    music_track?: { title: string; artist: string } | null;
    interactive_widget?: StoryWidget | null;
    highlight_title?: string | null;
  }) =>
    apiFetch<StorySlide>('/api/stories', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  viewStory: (storyId: string) =>
    apiFetch<StorySlide>(`/api/stories/${storyId}/view`, { method: 'POST' }),

  interactStory: (storyId: string, payload: { optionId?: string; sliderValue?: number }) =>
    apiFetch<StorySlide>(`/api/stories/${storyId}/interact`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  replyToStory: (
    storyId: string,
    payload: { content?: string; reaction_emoji?: string; client_msg_id?: string }
  ) =>
    apiFetch<{ conversation_id: string; message: Message }>(`/api/stories/${storyId}/reply`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  highlightStory: (storyId: string, payload: { highlight_title?: string; is_highlighted?: boolean }) =>
    apiFetch<StorySlide>(`/api/stories/${storyId}/highlight`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  getProfile: (username: string) =>
    apiFetch<{
      profile: ProfileSummary;
      posts: FeedPost[];
      tagged_posts: FeedPost[];
      highlights: StoryHighlightCapsule[];
      collections: Array<SavedCollection & { posts: FeedPost[] }>;
    }>(`/api/profiles/${encodeURIComponent(username)}`),

  getProfileGraph: (
    username: string,
    tab: 'followers' | 'following' | 'mutuals' | 'close_friends'
  ) =>
    apiFetch<{ items: ProfileSummary[] }>(
      `/api/profiles/${encodeURIComponent(username)}/graph?tab=${tab}`
    ),

  toggleFollow: (targetId: string) =>
    apiFetch<ProfileSummary>(`/api/relationships/${targetId}/toggle`, { method: 'POST' }),

  toggleCloseFriend: (targetId: string) =>
    apiFetch<ProfileSummary>(`/api/relationships/${targetId}/close-friend`, { method: 'POST' }),

  getDiscovery: () =>
    apiFetch<{
      activeFriends: ProfileSummary[];
      suggestions: ProfileSummary[];
      trendingTags: Array<{ tag: string; posts_count: number }>;
    }>('/api/discovery'),

  explore: (params: { q?: string; tag?: string }) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set('q', params.q);
    if (params.tag) sp.set('tag', params.tag);
    return apiFetch<{ posts: FeedPost[]; people: ProfileSummary[] }>(
      `/api/explore?${sp.toString()}`
    );
  },

  getCollections: () =>
    apiFetch<{ collections: SavedCollection[]; bookmarks: FeedPost[] }>('/api/collections'),

  createCollection: (name: string, is_public: boolean) =>
    apiFetch<SavedCollection>('/api/collections', {
      method: 'POST',
      body: JSON.stringify({ name, is_public }),
    }),

  getNotifications: () =>
    apiFetch<{ items: NotificationItem[]; unreadCount: number }>('/api/notifications'),

  markNotificationsRead: () =>
    apiFetch<{ ok: boolean }>('/api/notifications/read', { method: 'POST' }),

  getConversations: () =>
    apiFetch<{ conversations: ConversationSummary[]; totalUnread: number }>('/api/conversations'),

  openConversationWith: (participantId: string) =>
    apiFetch<{ id: string }>('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({ participantId }),
    }),

  getMessages: (conversationId: string, cursor?: string | null, limit = 25) => {
    const sp = new URLSearchParams({ limit: String(limit) });
    if (cursor) sp.set('cursor', cursor);
    return apiFetch<MessagesPageResponse>(
      `/api/conversations/${conversationId}/messages?${sp.toString()}`
    );
  },

  sendMessage: (
    conversationId: string,
    payload: {
      client_msg_id: string;
      content?: string;
      media_url?: string | null;
      media_type?: 'image' | 'video' | 'audio' | null;
      voice_duration_ms?: number | null;
      voice_waveform?: number[] | null;
      reply_to_message_id?: string | null;
      shared_post_id?: string | null;
    }
  ) =>
    apiFetch<Message>(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  markConversationRead: (conversationId: string) =>
    apiFetch<{ ok: boolean; read_receipt_sent: boolean }>(
      `/api/conversations/${conversationId}/read`,
      { method: 'POST' }
    ),

  reactToMessage: (messageId: string, emoji: string) =>
    apiFetch<Message>(`/api/messages/${messageId}/react`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    }),

  updateConversationSettings: (
    conversationId: string,
    payload: {
      theme_accent?: 'cobalt' | 'sunset' | 'emerald' | 'violet';
      is_muted?: boolean;
      accept_request?: boolean;
    }
  ) =>
    apiFetch<{ ok: boolean }>(`/api/conversations/${conversationId}/settings`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  uploadMedia: (dataUrl: string, filename?: string, mimeType?: string) =>
    apiFetch<{ url: string; key: string; mimeType: string; sizeBytes: number }>(
      '/api/media/upload',
      {
        method: 'POST',
        body: JSON.stringify({ dataUrl, filename, mimeType }),
      }
    ),
};

