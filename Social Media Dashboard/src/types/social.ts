export type AudienceTier = 'public' | 'followers' | 'close_friends';
export type ReplyPolicy = 'everyone' | 'mutuals';
export type RelationshipState =
  | 'self'
  | 'mutual_friends'
  | 'following'
  | 'follow_back'
  | 'requested'
  | 'none';

export type FeedLens = 'for_you' | 'following' | 'close_friends' | 'media';
export type AppView =
  | 'feed'
  | 'explore'
  | 'reels'
  | 'messages'
  | 'notifications'
  | 'bookmarks'
  | 'profile';

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  pronouns: string;
  website: string;
  location: string;
  status_emoji: string;
  status_text: string;
  avatar_url: string;
  banner_url: string;
  is_private: boolean;
  read_receipts_enabled: boolean;
  followers_count: number;
  following_count: number;
  created_at: string;
}

export interface ProfileSummary extends Profile {
  relationship_state: RelationshipState;
  is_close_friend: boolean;
  mutuals_count: number;
  mutual_preview: Array<{
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  }>;
  has_active_story: boolean;
  has_unseen_story: boolean;
  has_close_friend_story: boolean;
  story_segments_count: number;
  story_seen_segments: number;
  is_online: boolean;
  current_activity: string | null;
}

export interface MediaTag {
  username: string;
  display_name: string;
  x: number;
  y: number;
}

export interface MediaItem {
  url: string;
  type: 'image' | 'video';
  width: number;
  height: number;
  alt: string;
  blurhash?: string;
  tagged_users?: MediaTag[];
}

export interface VoiceNote {
  url: string;
  duration_ms: number;
  waveform: number[];
  title?: string;
}

export interface QuoteCard {
  text: string;
  accent: 'cobalt' | 'sunset' | 'emerald' | 'obsidian';
  attribution?: string;
}

export interface PostPollOption {
  id: string;
  label: string;
  votes: number;
}

export interface PostPoll {
  question: string;
  options: PostPollOption[];
  user_voted_option_id?: string | null;
}

export interface PostComment {
  id: string;
  post_id: string;
  author: ProfileSummary;
  content: string;
  is_pinned: boolean;
  likes_count: number;
  created_at: string;
}

export interface FeedPost {
  id: string;
  author: ProfileSummary;
  co_author: ProfileSummary | null;
  caption: string;
  media_items: MediaItem[];
  quote_card: QuoteCard | null;
  voice_note: VoiceNote | null;
  poll: PostPoll | null;
  tags: string[];
  location: string;
  audio_title: string;
  audience: AudienceTier;
  reply_policy: ReplyPolicy;
  hide_like_count: boolean;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  is_pinned: boolean;
  is_liked: boolean;
  is_bookmarked: boolean;
  bookmark_collection_id: string | null;
  top_comments: PostComment[];
  can_viewer_reply: boolean;
  created_at: string;
}

export type StoryWidget =
  | {
      kind: 'poll';
      question: string;
      options: Array<{ id: string; label: string; votes: number }>;
      user_vote?: string | null;
    }
  | {
      kind: 'slider';
      prompt: string;
      emoji: string;
      average: number;
      votes: number;
      user_value?: number | null;
    }
  | {
      kind: 'add_yours';
      prompt: string;
      chain_id: string;
      participants: Array<{ username: string; avatar_url: string }>;
      total_count: number;
    };

export interface StorySlide {
  id: string;
  author_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  duration_ms: number;
  audience: 'public' | 'close_friends';
  caption: string;
  music_track: { title: string; artist: string } | null;
  interactive_widget: StoryWidget | null;
  highlight_title: string | null;
  expires_at: string;
  is_highlighted: boolean;
  is_archived: boolean;
  is_viewed: boolean;
  viewer_reaction: string | null;
  view_count: number;
  created_at: string;
}

export interface StoryAuthorGroup {
  author: ProfileSummary;
  slides: StorySlide[];
  has_unseen: boolean;
  has_close_friends: boolean;
}

export interface StoryHighlightCapsule {
  title: string;
  cover_url: string;
  slides: StorySlide[];
}

export interface StorySnapshot {
  story_id: string;
  author_username: string;
  media_url: string;
  caption?: string;
  expired?: boolean;
}

export interface Message {
  id: string;
  client_msg_id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  media_url: string | null;
  media_type: 'image' | 'video' | 'audio' | null;
  voice_duration_ms: number | null;
  voice_waveform: number[] | null;
  reply_to_message_id: string | null;
  reply_to_message: {
    id: string;
    sender_name: string;
    content: string;
  } | null;
  reply_to_story_id: string | null;
  story_snapshot: StorySnapshot | null;
  shared_post_id: string | null;
  shared_post: FeedPost | null;
  reactions: Record<string, string[]>;
  read_at: string | null;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  created_at: string;
}

export interface ConversationSummary {
  id: string;
  participant: ProfileSummary;
  theme_accent: 'cobalt' | 'sunset' | 'emerald' | 'violet';
  is_request: boolean;
  is_muted: boolean;
  unread_count: number;
  last_message: Message | null;
  updated_at: string;
}

export interface SavedCollection {
  id: string;
  owner_id: string;
  name: string;
  is_public: boolean;
  post_count: number;
  cover_urls: string[];
  created_at: string;
}

export interface NotificationItem {
  id: string;
  recipient_id: string;
  actor: ProfileSummary;
  type:
    | 'like'
    | 'comment'
    | 'follow'
    | 'follow_request'
    | 'story_reaction'
    | 'co_author'
    | 'mention';
  entity_id: string | null;
  preview_text: string;
  is_read: boolean;
  created_at: string;
}

export interface FeedPageResponse {
  items: FeedPost[];
  nextCursor: string | null;
}

export interface MessagesPageResponse {
  items: Message[];
  nextCursor: string | null;
}

export interface PresenceInfo {
  userId: string;
  isOnline: boolean;
  activity: string | null;
}

export interface WsServerEvent {
  type:
    | 'PRESENCE_SNAPSHOT'
    | 'PRESENCE_UPDATE'
    | 'TYPING'
    | 'MESSAGE_NEW'
    | 'MESSAGE_READ'
    | 'MESSAGE_REACTION'
    | 'NOTIFICATION_NEW';
  payload: Record<string, unknown>;
}

