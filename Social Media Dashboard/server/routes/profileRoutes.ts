import type { FastifyInstance } from 'fastify';
import type { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import type { VisibilityService } from '../services/visibility.ts';
import type { RealtimeHub } from '../websocket.ts';
import { getViewerId } from './feedRoutes.ts';
import type { StoryHighlightCapsule, StorySlide } from '../../src/types/social.ts';

export function registerProfileRoutes(
  app: FastifyInstance,
  db: DatabaseSync,
  visibility: VisibilityService,
  hub: RealtimeHub
) {
  // Get current active user + list of available demo personas (for instant persona switching)
  app.get('/api/me', async (req) => {
    const viewerId = getViewerId(req);
    const me = visibility.getProfileById(viewerId, viewerId);
    const allRows = db.prepare(`SELECT * FROM profiles ORDER BY created_at ASC`).all() as Array<
      Record<string, unknown>
    >;
    const personas = allRows.map((r) => visibility.hydrateProfileSummary(r, viewerId));
    return { user: me, personas };
  });

  // Update active user's profile, status pill, or privacy settings
  app.patch('/api/me', async (req, reply) => {
    const viewerId = getViewerId(req);
    const body = req.body as {
      display_name?: string;
      bio?: string;
      pronouns?: string;
      website?: string;
      location?: string;
      status_emoji?: string;
      status_text?: string;
      is_private?: boolean;
      read_receipts_enabled?: boolean;
    };

    const existing = db.prepare(`SELECT * FROM profiles WHERE id = ?`).get(viewerId) as
      | Record<string, unknown>
      | undefined;
    if (!existing) return reply.code(404).send({ error: 'Profile not found' });

    db.prepare(
      `UPDATE profiles SET
        display_name = ?,
        bio = ?,
        pronouns = ?,
        website = ?,
        location = ?,
        status_emoji = ?,
        status_text = ?,
        is_private = ?,
        read_receipts_enabled = ?
       WHERE id = ?`
    ).run(
      String(body.display_name ?? existing.display_name ?? ''),
      String(body.bio ?? existing.bio ?? ''),
      String(body.pronouns ?? existing.pronouns ?? ''),
      String(body.website ?? existing.website ?? ''),
      String(body.location ?? existing.location ?? ''),
      String(body.status_emoji ?? existing.status_emoji ?? '✨'),
      String(body.status_text ?? existing.status_text ?? ''),
      typeof body.is_private === 'boolean'
        ? body.is_private
          ? 1
          : 0
        : Number(existing.is_private || 0),
      typeof body.read_receipts_enabled === 'boolean'
        ? body.read_receipts_enabled
          ? 1
          : 0
        : Number(existing.read_receipts_enabled ?? 1),
      viewerId
    );

    return visibility.getProfileById(viewerId, viewerId);
  });

  // Full Creator Profile Studio endpoint
  app.get('/api/profiles/:username', async (req, reply) => {
    const viewerId = getViewerId(req);
    const { username } = req.params as { username: string };
    const profileRow = db
      .prepare(`SELECT * FROM profiles WHERE username = ?`)
      .get(username) as Record<string, unknown> | undefined;

    if (!profileRow) return reply.code(404).send({ error: 'Profile not found' });

    const profile = visibility.hydrateProfileSummary(profileRow, viewerId);
    const targetId = profile.id;

    // Fetch posts authored OR co-authored by targetId
    const postRows = db
      .prepare(
        `SELECT * FROM posts
         WHERE author_id = ? OR co_author_id = ?
         ORDER BY is_pinned DESC, created_at DESC`
      )
      .all(targetId, targetId) as Array<Record<string, unknown>>;

    const posts = postRows
      .filter((r) => visibility.canViewPost(viewerId, r))
      .map((r) => visibility.hydratePost(r, viewerId));

    // Fetch tagged posts (where target's username appears in media_items tagged_users)
    const allPublicRows = db
      .prepare(`SELECT * FROM posts WHERE author_id <> ? ORDER BY created_at DESC`)
      .all(targetId) as Array<Record<string, unknown>>;
    const taggedPosts = allPublicRows
      .filter((r) => visibility.canViewPost(viewerId, r))
      .filter((r) => String(r.media_items).includes(`"${username}"`))
      .map((r) => visibility.hydratePost(r, viewerId));

    // Fetch Story Highlights grouped by highlight_title
    const hlRows = db
      .prepare(
        `SELECT * FROM stories
         WHERE author_id = ? AND is_highlighted = 1
         ORDER BY created_at ASC`
      )
      .all(targetId) as Array<Record<string, unknown>>;

    const hlMap = new Map<string, StorySlide[]>();
    for (const r of hlRows) {
      if (!visibility.canViewStory(viewerId, r)) continue;
      const hydrated = visibility.hydrateStorySlide(r, viewerId);
      const title = hydrated.highlight_title || 'Highlights';
      if (!hlMap.has(title)) hlMap.set(title, []);
      hlMap.get(title)!.push(hydrated);
    }

    const highlights: StoryHighlightCapsule[] = Array.from(hlMap.entries()).map(
      ([title, slides]) => ({
        title,
        cover_url: slides[0]?.media_url || profile.avatar_url,
        slides,
      })
    );

    // Fetch own or public collections
    const collectionRows = db
      .prepare(
        `SELECT * FROM saved_collections WHERE owner_id = ? AND (is_public = 1 OR owner_id = ?) ORDER BY created_at DESC`
      )
      .all(targetId, viewerId) as Array<Record<string, unknown>>;

    const collections = collectionRows.map((c) => {
      const colId = String(c.id);
      const bookmarkedPosts = db
        .prepare(
          `SELECT p.* FROM posts p
           JOIN post_bookmarks pb ON pb.post_id = p.id
           WHERE pb.collection_id = ? AND pb.user_id = ?`
        )
        .all(colId, targetId) as Array<Record<string, unknown>>;
      const hydrated = bookmarkedPosts
        .filter((p) => visibility.canViewPost(viewerId, p))
        .map((p) => visibility.hydratePost(p, viewerId));
      return {
        id: colId,
        owner_id: String(c.owner_id),
        name: String(c.name),
        is_public: Boolean(c.is_public),
        post_count: hydrated.length,
        cover_urls: hydrated.flatMap((p) => p.media_items.map((m) => m.url)).slice(0, 4),
        created_at: String(c.created_at),
        posts: hydrated,
      };
    });

    return {
      profile,
      posts,
      tagged_posts: taggedPosts,
      highlights,
      collections,
    };
  });

  // Social Graph Modal: followers, following, mutuals, close_friends
  app.get('/api/profiles/:username/graph', async (req, reply) => {
    const viewerId = getViewerId(req);
    const { username } = req.params as { username: string };
    const q = req.query as { tab?: 'followers' | 'following' | 'mutuals' | 'close_friends' };

    const target = db
      .prepare(`SELECT id FROM profiles WHERE username = ?`)
      .get(username) as { id: string } | undefined;
    if (!target) return reply.code(404).send({ error: 'Profile not found' });

    const targetId = target.id;
    let rows: Array<Record<string, unknown>> = [];

    if (q.tab === 'following') {
      rows = db
        .prepare(
          `SELECT p.* FROM profiles p
           JOIN relationships r ON r.following_id = p.id
           WHERE r.follower_id = ? AND r.status = 'accepted'`
        )
        .all(targetId) as Array<Record<string, unknown>>;
    } else if (q.tab === 'mutuals') {
      rows = db
        .prepare(
          `SELECT p.* FROM profiles p
           JOIN relationships r1 ON r1.following_id = p.id AND r1.follower_id = ? AND r1.status = 'accepted'
           JOIN relationships r2 ON r2.follower_id = p.id AND r2.following_id = ? AND r2.status = 'accepted'
           WHERE p.id <> ?`
        )
        .all(viewerId, targetId, viewerId) as Array<Record<string, unknown>>;
    } else if (q.tab === 'close_friends') {
      rows = db
        .prepare(
          `SELECT p.* FROM profiles p
           JOIN relationships r ON r.follower_id = p.id
           WHERE r.following_id = ? AND r.status = 'accepted' AND r.is_close_friend = 1`
        )
        .all(targetId) as Array<Record<string, unknown>>;
    } else {
      rows = db
        .prepare(
          `SELECT p.* FROM profiles p
           JOIN relationships r ON r.follower_id = p.id
           WHERE r.following_id = ? AND r.status = 'accepted'`
        )
        .all(targetId) as Array<Record<string, unknown>>;
    }

    return {
      items: rows.map((r) => visibility.hydrateProfileSummary(r, viewerId)),
    };
  });

  // Follow / Unfollow / Cancel Request
  app.post('/api/relationships/:targetId/toggle', async (req, reply) => {
    const viewerId = getViewerId(req);
    const { targetId } = req.params as { targetId: string };
    if (viewerId === targetId) return reply.code(400).send({ error: 'Cannot follow yourself' });

    const target = db.prepare(`SELECT * FROM profiles WHERE id = ?`).get(targetId) as
      | Record<string, unknown>
      | undefined;
    if (!target) return reply.code(404).send({ error: 'Target user not found' });

    const existing = db
      .prepare(`SELECT status FROM relationships WHERE follower_id = ? AND following_id = ?`)
      .get(viewerId, targetId) as { status: string } | undefined;

    if (existing) {
      db.prepare(`DELETE FROM relationships WHERE follower_id = ? AND following_id = ?`).run(
        viewerId,
        targetId
      );
      if (existing.status === 'accepted') {
        db.prepare(`UPDATE profiles SET following_count = MAX(0, following_count - 1) WHERE id = ?`).run(
          viewerId
        );
        db.prepare(`UPDATE profiles SET followers_count = MAX(0, followers_count - 1) WHERE id = ?`).run(
          targetId
        );
      }
    } else {
      const status = target.is_private ? 'pending' : 'accepted';
      const nowIso = new Date().toISOString();
      db.prepare(
        `INSERT INTO relationships (follower_id, following_id, status, is_close_friend, created_at)
         VALUES (?, ?, ?, 0, ?)`
      ).run(viewerId, targetId, status, nowIso);

      if (status === 'accepted') {
        db.prepare(`UPDATE profiles SET following_count = following_count + 1 WHERE id = ?`).run(
          viewerId
        );
        db.prepare(`UPDATE profiles SET followers_count = followers_count + 1 WHERE id = ?`).run(
          targetId
        );
      }

      const notifId = `notif-${crypto.randomUUID().slice(0, 8)}`;
      db.prepare(
        `INSERT INTO notifications (id, recipient_id, actor_id, type, entity_id, preview_text, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 0, ?)`
      ).run(
        notifId,
        targetId,
        viewerId,
        status === 'pending' ? 'follow_request' : 'follow',
        null,
        status === 'pending' ? 'requested to follow you' : 'started following you',
        nowIso
      );
      hub.sendToUser(targetId, { type: 'NOTIFICATION_NEW', payload: { id: notifId } });
    }

    return visibility.getProfileById(targetId, viewerId);
  });

  // Toggle Close Friend inner circle membership (viewer grants/revokes targetId access to viewer's Close Friends)
  app.post('/api/relationships/:targetId/close-friend', async (req, reply) => {
    const viewerId = getViewerId(req);
    const { targetId } = req.params as { targetId: string };
    if (viewerId === targetId) return reply.code(400).send({ error: 'Invalid target' });

    const rel = db
      .prepare(`SELECT status, is_close_friend FROM relationships WHERE follower_id = ? AND following_id = ?`)
      .get(targetId, viewerId) as { status: string; is_close_friend: number } | undefined;

    if (!rel) {
      db.prepare(
        `INSERT INTO relationships (follower_id, following_id, status, is_close_friend, created_at)
         VALUES (?, ?, 'accepted', 1, ?)`
      ).run(targetId, viewerId, new Date().toISOString());
    } else {
      const next = rel.is_close_friend ? 0 : 1;
      db.prepare(
        `UPDATE relationships SET is_close_friend = ?, status = 'accepted' WHERE follower_id = ? AND following_id = ?`
      ).run(next, targetId, viewerId);
    }

    return visibility.getProfileById(targetId, viewerId);
  });

  // Discovery Sidebar ("Active Friends" + "Who to Follow" + "Trending Tags")
  app.get('/api/discovery', async (req) => {
    const viewerId = getViewerId(req);
    const allRows = db.prepare(`SELECT * FROM profiles`).all() as Array<Record<string, unknown>>;
    const hydrated = allRows
      .filter((r) => String(r.id) !== viewerId)
      .map((r) => visibility.hydrateProfileSummary(r, viewerId));

    const activeFriends = hydrated.filter((p) => p.is_online).slice(0, 6);
    const suggestions = hydrated
      .filter((p) => p.relationship_state === 'none' || p.relationship_state === 'follow_back')
      .sort((a, b) => b.mutuals_count - a.mutuals_count)
      .slice(0, 4);

    const postRows = db.prepare(`SELECT tags FROM posts`).all() as Array<{ tags: string }>;
    const tagCounts = new Map<string, number>();
    for (const pr of postRows) {
      try {
        const arr = JSON.parse(pr.tags) as string[];
        for (const t of arr) {
          tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
        }
      } catch {}
    }

    const trendingTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, posts_count: count * 180 + 240 }))
      .sort((a, b) => b.posts_count - a.posts_count)
      .slice(0, 5);

    return { activeFriends, suggestions, trendingTags };
  });

  // Explore search & tag filter
  app.get('/api/explore', async (req) => {
    const viewerId = getViewerId(req);
    const q = req.query as { q?: string; tag?: string };
    const search = q.q?.trim().toLowerCase() || '';
    const tag = q.tag?.trim().toLowerCase() || '';

    const postRows = db
      .prepare(`SELECT * FROM posts ORDER BY likes_count DESC, created_at DESC`)
      .all() as Array<Record<string, unknown>>;

    const visiblePosts = postRows
      .filter((r) => visibility.canViewPost(viewerId, r))
      .map((r) => visibility.hydratePost(r, viewerId))
      .filter((p) => {
        if (tag && !p.tags.some((t) => t.toLowerCase() === tag)) return false;
        if (search) {
          const blob = `${p.caption} ${p.author.display_name} ${p.author.username} ${p.tags.join(' ')} ${p.location}`.toLowerCase();
          return blob.includes(search);
        }
        return true;
      });

    const profileRows = db.prepare(`SELECT * FROM profiles`).all() as Array<Record<string, unknown>>;
    const people = profileRows
      .map((r) => visibility.hydrateProfileSummary(r, viewerId))
      .filter((p) => {
        if (!search) return p.id !== viewerId;
        return (
          p.username.toLowerCase().includes(search) ||
          p.display_name.toLowerCase().includes(search) ||
          p.bio.toLowerCase().includes(search)
        );
      });

    return { posts: visiblePosts, people };
  });

  // Saved Collections & Bookmarks
  app.get('/api/collections', async (req) => {
    const viewerId = getViewerId(req);
    const cols = db
      .prepare(`SELECT * FROM saved_collections WHERE owner_id = ? ORDER BY created_at DESC`)
      .all(viewerId) as Array<Record<string, unknown>>;

    const allBookmarked = db
      .prepare(
        `SELECT p.*, pb.collection_id FROM posts p
         JOIN post_bookmarks pb ON pb.post_id = p.id
         WHERE pb.user_id = ?
         ORDER BY pb.created_at DESC`
      )
      .all(viewerId) as Array<Record<string, unknown>>;

    const hydratedBookmarks = allBookmarked
      .filter((r) => visibility.canViewPost(viewerId, r))
      .map((r) => visibility.hydratePost(r, viewerId));

    const collections = cols.map((c) => {
      const colId = String(c.id);
      const matching = hydratedBookmarks.filter((p) => p.bookmark_collection_id === colId);
      return {
        id: colId,
        owner_id: String(c.owner_id),
        name: String(c.name),
        is_public: Boolean(c.is_public),
        post_count: matching.length,
        cover_urls: matching.flatMap((p) => p.media_items.map((m) => m.url)).slice(0, 4),
        created_at: String(c.created_at),
      };
    });

    return { collections, bookmarks: hydratedBookmarks };
  });

  app.post('/api/collections', async (req, reply) => {
    const viewerId = getViewerId(req);
    const { name, is_public } = req.body as { name: string; is_public?: boolean };
    if (!name?.trim()) return reply.code(400).send({ error: 'Collection name is required' });

    const id = `col-${crypto.randomUUID().slice(0, 8)}`;
    const nowIso = new Date().toISOString();
    db.prepare(
      `INSERT INTO saved_collections (id, owner_id, name, is_public, created_at) VALUES (?, ?, ?, ?, ?)`
    ).run(id, viewerId, name.trim(), is_public ? 1 : 0, nowIso);

    return reply.code(201).send({
      id,
      owner_id: viewerId,
      name: name.trim(),
      is_public: Boolean(is_public),
      post_count: 0,
      cover_urls: [],
      created_at: nowIso,
    });
  });

  // Notifications
  app.get('/api/notifications', async (req) => {
    const viewerId = getViewerId(req);
    const rows = db
      .prepare(`SELECT * FROM notifications WHERE recipient_id = ? ORDER BY created_at DESC LIMIT 40`)
      .all(viewerId) as Array<Record<string, unknown>>;

    const items = rows.map((r) => ({
      id: String(r.id),
      recipient_id: String(r.recipient_id),
      actor: visibility.getProfileById(String(r.actor_id), viewerId)!,
      type: String(r.type),
      entity_id: r.entity_id ? String(r.entity_id) : null,
      preview_text: String(r.preview_text || ''),
      is_read: Boolean(r.is_read),
      created_at: String(r.created_at),
    }));

    const unreadCount = items.filter((n) => !n.is_read).length;
    return { items, unreadCount };
  });

  app.post('/api/notifications/read', async (req) => {
    const viewerId = getViewerId(req);
    db.prepare(`UPDATE notifications SET is_read = 1 WHERE recipient_id = ?`).run(viewerId);
    return { ok: true };
  });
}
