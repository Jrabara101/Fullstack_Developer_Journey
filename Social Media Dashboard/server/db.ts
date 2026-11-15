import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

export function createDatabase(dbPath?: string): DatabaseSync {
  const resolvedPath =
    dbPath ??
    (() => {
      const dataDir = path.resolve(process.cwd(), 'data');
      fs.mkdirSync(dataDir, { recursive: true });
      return path.join(dataDir, 'social_dashboard.db');
    })();

  const database = new DatabaseSync(resolvedPath);
  database.exec('PRAGMA journal_mode = WAL;');
  database.exec('PRAGMA foreign_keys = ON;');

  database.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      bio TEXT NOT NULL DEFAULT '',
      pronouns TEXT NOT NULL DEFAULT '',
      website TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL DEFAULT '',
      status_emoji TEXT NOT NULL DEFAULT '✨',
      status_text TEXT NOT NULL DEFAULT '',
      avatar_url TEXT NOT NULL,
      banner_url TEXT NOT NULL DEFAULT '',
      is_private INTEGER NOT NULL DEFAULT 0,
      read_receipts_enabled INTEGER NOT NULL DEFAULT 1,
      followers_count INTEGER NOT NULL DEFAULT 0,
      following_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS relationships (
      follower_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      following_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      status TEXT NOT NULL CHECK (status IN ('accepted', 'pending')) DEFAULT 'accepted',
      is_close_friend INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      PRIMARY KEY (follower_id, following_id)
    );

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      co_author_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
      caption TEXT NOT NULL DEFAULT '',
      media_items TEXT NOT NULL DEFAULT '[]',
      quote_card TEXT,
      voice_note TEXT,
      poll TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      location TEXT NOT NULL DEFAULT '',
      audio_title TEXT NOT NULL DEFAULT '',
      audience TEXT NOT NULL CHECK (audience IN ('public', 'followers', 'close_friends')) DEFAULT 'public',
      reply_policy TEXT NOT NULL CHECK (reply_policy IN ('everyone', 'mutuals')) DEFAULT 'everyone',
      hide_like_count INTEGER NOT NULL DEFAULT 0,
      likes_count INTEGER NOT NULL DEFAULT 0,
      comments_count INTEGER NOT NULL DEFAULT 0,
      reposts_count INTEGER NOT NULL DEFAULT 0,
      is_pinned INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS post_likes (
      post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      PRIMARY KEY (post_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS saved_collections (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      is_public INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS post_bookmarks (
      post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      collection_id TEXT REFERENCES saved_collections(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (post_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS post_poll_votes (
      post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      option_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (post_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      author_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      is_pinned INTEGER NOT NULL DEFAULT 0,
      likes_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stories (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      media_url TEXT NOT NULL,
      media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')) DEFAULT 'image',
      duration_ms INTEGER NOT NULL DEFAULT 5000,
      audience TEXT NOT NULL CHECK (audience IN ('public', 'close_friends')) DEFAULT 'public',
      caption TEXT NOT NULL DEFAULT '',
      music_track TEXT,
      interactive_widget TEXT,
      highlight_title TEXT,
      expires_at TEXT NOT NULL,
      is_highlighted INTEGER NOT NULL DEFAULT 0,
      is_archived INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS story_views (
      story_id TEXT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
      viewer_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      reaction_emoji TEXT,
      viewed_at TEXT NOT NULL,
      PRIMARY KEY (story_id, viewer_id)
    );

    CREATE TABLE IF NOT EXISTS story_interactions (
      story_id TEXT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (story_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      theme_accent TEXT NOT NULL DEFAULT 'cobalt',
      is_request INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS conversation_participants (
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      is_muted INTEGER NOT NULL DEFAULT 0,
      last_read_at TEXT,
      PRIMARY KEY (conversation_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      client_msg_id TEXT UNIQUE NOT NULL,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      content TEXT NOT NULL DEFAULT '',
      media_url TEXT,
      media_type TEXT,
      voice_duration_ms INTEGER,
      voice_waveform TEXT,
      reply_to_message_id TEXT REFERENCES messages(id) ON DELETE SET NULL,
      reply_to_story_id TEXT REFERENCES stories(id) ON DELETE SET NULL,
      story_snapshot TEXT,
      shared_post_id TEXT REFERENCES posts(id) ON DELETE SET NULL,
      reactions TEXT NOT NULL DEFAULT '{}',
      read_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      recipient_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      actor_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'follow_request', 'story_reaction', 'co_author', 'mention')),
      entity_id TEXT,
      preview_text TEXT NOT NULL DEFAULT '',
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC, id DESC);
    CREATE INDEX IF NOT EXISTS idx_stories_author_exp ON stories(author_id, expires_at DESC);
    CREATE INDEX IF NOT EXISTS idx_messages_conv_created ON messages(conversation_id, created_at DESC, id DESC);
  `);

  return database;
}

export const db = createDatabase();

