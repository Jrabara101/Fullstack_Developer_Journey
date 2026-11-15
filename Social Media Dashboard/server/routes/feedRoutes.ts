import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import type { VisibilityService } from '../services/visibility.ts';
import { safeJsonParse } from '../services/visibility.ts';
import type { RealtimeHub } from '../websocket.ts';
import type { FeedLens, PostPoll } from '../../src/types/social.ts';

export function getViewerId(req: FastifyRequest): string {
  const header = req.headers['x-user-id'];
  if (typeof header === 'string' && header.trim()) return header.trim();
  const q = req.query as Record<string, string | undefined>;
  if (q?.viewerId && q.viewerId.trim()) return q.viewerId.trim();
  return 'user-alex';
}

export function registerFeedRoutes(
  app: FastifyInstance,
  db: DatabaseSync,
  visibility: VisibilityService,
  hub: RealtimeHub
) {
  // Cursor-based Feed across lenses: for_you | following | close_friends | media
  app.get('/api/feed', async (req) => {
    const viewerId = getViewerId(req);
    const q = req.query as { lens?: FeedLens; cursor?: string; limit?: string };
    const lens: FeedLens = q.lens ?? 'for_you';
    const limit = Math.min(Math.max(Number(q.limit || 6), 1), 30);

    const allRows = db
      .prepare(`SELECT * FROM posts ORDER BY created_at DESC, id DESC`)
      .all() as Array<Record<string, unknown>>;

    // Filter strictly by RLS / visibility rules
    let visible = allRows.filter((row) => visibility.canViewPost(viewerId, row));

    if (lens === 'following') {
      visible = visible.filter((row) => {
        const authorId = String(row.author_id);
        return authorId === viewerId || visibility.isAcceptedFollower(viewerId, authorId);
      });
    } else if (lens === 'close_friends') {
      visible = visible.filter((row) => {
        const authorId = String(row.author_id);
        return (
          String(row.audience) === 'close_friends' ||
          authorId === viewerId ||
          visibility.isCloseFriend(viewerId, authorId)
        );
      });
    } else if (lens === 'media') {
      visible = visible.filter((row) => {
        const items = safeJsonParse<unknown[]>(row.media_items, []);
        return items.length > 0;
      });
    } else if (lens === 'for_you') {
      // Algorithmic scoring combining freshness, engagement, and social affinity
      const now = Date.now();
      visible.sort((a, b) => {
        const score = (r: Record<string, unknown>) => {
          const ageHours = Math.max(0.2, (now - Date.parse(String(r.created_at))) / 3600_000);
          const affinityBoost = visibility.isCloseFriend(viewerId, String(r.author_id))
            ? 2.2
            : visibility.isAcceptedFollower(viewerId, String(r.author_id))
              ? 1.5
              : 1.0;
          const engagement =
            Number(r.likes_count || 0) * 0.4 +
            Number(r.comments_count || 0) * 2.5 +
            Number(r.reposts_count || 0) * 1.5;
          return ((engagement + 40) * affinityBoost) / Math.pow(ageHours + 2, 1.15);
        };
        return score(b) - score(a);
      });
    }

    // Apply cursor offset (cursor encodes the ID of the last returned item for stable ordering)
    let startIndex = 0;
    if (q.cursor) {
      const idx = visible.findIndex((r) => String(r.id) === q.cursor);
      if (idx >= 0) startIndex = idx + 1;
    }

    const pageRows = visible.slice(startIndex, startIndex + limit);
    const nextCursor =
      startIndex + limit < visible.length ? String(pageRows[pageRows.length - 1]?.id ?? '') : null;

    return {
      items: pageRows.map((row) => visibility.hydratePost(row, viewerId)),
      nextCursor: nextCursor || null,
    };
  });

  // Create Post (supports carousels, voice notes, polls, quote cards, co-authors, safety controls)
  app.post('/api/posts', async (req, reply) => {
    const viewerId = getViewerId(req);
    const body = req.body as {
      caption?: string;
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
    };

    const id = `post-${crypto.randomUUID().slice(0, 8)}`;
    const nowIso = new Date().toISOString();

    let pollJson: string | null = null;
    if (body.poll && body.poll.question?.trim() && body.poll.options?.length >= 2) {
      const pollObj: PostPoll = {
        question: body.poll.question.trim(),
        options: body.poll.options
          .filter((o) => o.trim())
          .map((label, idx) => ({ id: `opt-${idx + 1}`, label: label.trim(), votes: 0 })),
      };
      pollJson = JSON.stringify(pollObj);
    }

    db.prepare(
      `INSERT INTO posts (
        id, author_id, co_author_id, caption, media_items, quote_card, voice_note,
        poll, tags, location, audio_title, audience, reply_policy, hide_like_count,
        likes_count, comments_count, reposts_count, is_pinned, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, ?)`
    ).run(
      id,
      viewerId,
      body.co_author_id || null,
      body.caption?.trim() || '',
      JSON.stringify(body.media_items || []),
      body.quote_card ? JSON.stringify(body.quote_card) : null,
      body.voice_note ? JSON.stringify(body.voice_note) : null,
      pollJson,
      JSON.stringify(body.tags || []),
      body.location || '',
      body.audio_title || '',
      body.audience || 'public',
      body.reply_policy || 'everyone',
      body.hide_like_count ? 1 : 0,
      nowIso
    );

    if (body.co_author_id && body.co_author_id !== viewerId) {
      const notifId = `notif-${crypto.randomUUID().slice(0, 8)}`;
      db.prepare(
        `INSERT INTO notifications (id, recipient_id, actor_id, type, entity_id, preview_text, is_read, created_at)
         VALUES (?, ?, ?, 'co_author', ?, ?, 0, ?)`
      ).run(
        notifId,
        body.co_author_id,
        viewerId,
        id,
        'co-authored a new post with you',
        nowIso
      );
      hub.sendToUser(body.co_author_id, {
        type: 'NOTIFICATION_NEW',
        payload: { id: notifId },
      });
    }

    const row = db.prepare(`SELECT * FROM posts WHERE id = ?`).get(id) as Record<string, unknown>;
    return reply.code(201).send(visibility.hydratePost(row, viewerId));
  });

  // Update Post psychological safety controls or pin status
  app.patch('/api/posts/:id', async (req, reply) => {
    const viewerId = getViewerId(req);
    const { id } = req.params as { id: string };
    const row = db.prepare(`SELECT * FROM posts WHERE id = ?`).get(id) as
      | Record<string, unknown>
      | undefined;
    if (!row) return reply.code(404).send({ error: 'Post not found' });
    if (String(row.author_id) !== viewerId && String(row.co_author_id) !== viewerId) {
      return reply.code(403).send({ error: 'Only authors can update post settings' });
    }

    const body = req.body as {
      hide_like_count?: boolean;
      reply_policy?: 'everyone' | 'mutuals';
      is_pinned?: boolean;
    };

    if (typeof body.hide_like_count === 'boolean') {
      db.prepare(`UPDATE posts SET hide_like_count = ? WHERE id = ?`).run(
        body.hide_like_count ? 1 : 0,
        id
      );
    }
    if (body.reply_policy === 'everyone' || body.reply_policy === 'mutuals') {
      db.prepare(`UPDATE posts SET reply_policy = ? WHERE id = ?`).run(body.reply_policy, id);
    }
    if (typeof body.is_pinned === 'boolean') {
      db.prepare(`UPDATE posts SET is_pinned = ? WHERE id = ?`).run(body.is_pinned ? 1 : 0, id);
    }

    const updated = db.prepare(`SELECT * FROM posts WHERE id = ?`).get(id) as Record<string, unknown>;
    return visibility.hydratePost(updated, viewerId);
  });

  // Toggle Like
  app.post('/api/posts/:id/like', async (req, reply) => {
    const viewerId = getViewerId(req);
    const { id } = req.params as { id: string };
    const row = db.prepare(`SELECT * FROM posts WHERE id = ?`).get(id) as
      | Record<string, unknown>
      | undefined;
    if (!row || !visibility.canViewPost(viewerId, row)) {
      return reply.code(404).send({ error: 'Post not found' });
    }

    const existing = db
      .prepare(`SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?`)
      .get(id, viewerId);

    if (existing) {
      db.prepare(`DELETE FROM post_likes WHERE post_id = ? AND user_id = ?`).run(id, viewerId);
      db.prepare(`UPDATE posts SET likes_count = MAX(0, likes_count - 1) WHERE id = ?`).run(id);
    } else {
      const nowIso = new Date().toISOString();
      db.prepare(`INSERT INTO post_likes (post_id, user_id, created_at) VALUES (?, ?, ?)`).run(
        id,
        viewerId,
        nowIso
      );
      db.prepare(`UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?`).run(id);
      const authorId = String(row.author_id);
      if (authorId !== viewerId) {
        const notifId = `notif-${crypto.randomUUID().slice(0, 8)}`;
        db.prepare(
          `INSERT INTO notifications (id, recipient_id, actor_id, type, entity_id, preview_text, is_read, created_at)
           VALUES (?, ?, ?, 'like', ?, 'liked your post', 0, ?)`
        ).run(notifId, authorId, viewerId, id, nowIso);
        hub.sendToUser(authorId, { type: 'NOTIFICATION_NEW', payload: { id: notifId } });
      }
    }

    const updated = db.prepare(`SELECT * FROM posts WHERE id = ?`).get(id) as Record<string, unknown>;
    return visibility.hydratePost(updated, viewerId);
  });

  // Toggle Bookmark (optionally into a named collection)
  app.post('/api/posts/:id/bookmark', async (req, reply) => {
    const viewerId = getViewerId(req);
    const { id } = req.params as { id: string };
    const body = (req.body || {}) as { collection_id?: string | null };

    const row = db.prepare(`SELECT * FROM posts WHERE id = ?`).get(id) as
      | Record<string, unknown>
      | undefined;
    if (!row || !visibility.canViewPost(viewerId, row)) {
      return reply.code(404).send({ error: 'Post not found' });
    }

    const existing = db
      .prepare(`SELECT collection_id FROM post_bookmarks WHERE post_id = ? AND user_id = ?`)
      .get(id, viewerId) as { collection_id: string | null } | undefined;

    if (existing && body.collection_id === undefined) {
      db.prepare(`DELETE FROM post_bookmarks WHERE post_id = ? AND user_id = ?`).run(id, viewerId);
    } else if (existing && body.collection_id !== undefined) {
      db.prepare(
        `UPDATE post_bookmarks SET collection_id = ? WHERE post_id = ? AND user_id = ?`
      ).run(body.collection_id, id, viewerId);
    } else {
      db.prepare(
        `INSERT INTO post_bookmarks (post_id, user_id, collection_id, created_at) VALUES (?, ?, ?, ?)`
      ).run(id, viewerId, body.collection_id ?? null, new Date().toISOString());
    }

    const updated = db.prepare(`SELECT * FROM posts WHERE id = ?`).get(id) as Record<string, unknown>;
    return visibility.hydratePost(updated, viewerId);
  });

  // Vote on Post Poll
  app.post('/api/posts/:id/poll-vote', async (req, reply) => {
    const viewerId = getViewerId(req);
    const { id } = req.params as { id: string };
    const { optionId } = req.body as { optionId: string };

    const row = db.prepare(`SELECT * FROM posts WHERE id = ?`).get(id) as
      | Record<string, unknown>
      | undefined;
    if (!row || !visibility.canViewPost(viewerId, row)) {
      return reply.code(404).send({ error: 'Post not found' });
    }

    const poll = safeJsonParse<PostPoll | null>(row.poll, null);
    if (!poll) return reply.code(400).send({ error: 'Post has no poll' });

    const prevVote = db
      .prepare(`SELECT option_id FROM post_poll_votes WHERE post_id = ? AND user_id = ?`)
      .get(id, viewerId) as { option_id: string } | undefined;

    if (prevVote) {
      for (const opt of poll.options) {
        if (opt.id === prevVote.option_id && opt.votes > 0) opt.votes -= 1;
      }
    }

    for (const opt of poll.options) {
      if (opt.id === optionId) opt.votes += 1;
    }

    db.prepare(
      `INSERT INTO post_poll_votes (post_id, user_id, option_id, created_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(post_id, user_id) DO UPDATE SET option_id = excluded.option_id`
    ).run(id, viewerId, optionId, new Date().toISOString());

    db.prepare(`UPDATE posts SET poll = ? WHERE id = ?`).run(JSON.stringify(poll), id);
    const updated = db.prepare(`SELECT * FROM posts WHERE id = ?`).get(id) as Record<string, unknown>;
    return visibility.hydratePost(updated, viewerId);
  });

  // Comments List
  app.get('/api/posts/:id/comments', async (req, reply) => {
    const viewerId = getViewerId(req);
    const { id } = req.params as { id: string };
    const row = db.prepare(`SELECT * FROM posts WHERE id = ?`).get(id) as
      | Record<string, unknown>
      | undefined;
    if (!row || !visibility.canViewPost(viewerId, row)) {
      return reply.code(404).send({ error: 'Post not found' });
    }

    const rows = db
      .prepare(
        `SELECT * FROM comments WHERE post_id = ? ORDER BY is_pinned DESC, created_at ASC`
      )
      .all(id) as Array<Record<string, unknown>>;

    return {
      items: rows.map((c) => visibility.hydrateComment(c, viewerId)),
      can_reply: visibility.canReplyToPost(viewerId, row),
      reply_policy: String(row.reply_policy),
    };
  });

  // Add Comment (enforces mutuals-only reply policy)
  app.post('/api/posts/:id/comments', async (req, reply) => {
    const viewerId = getViewerId(req);
    const { id } = req.params as { id: string };
    const { content } = req.body as { content: string };

    if (!content?.trim()) return reply.code(400).send({ error: 'Comment content required' });

    const row = db.prepare(`SELECT * FROM posts WHERE id = ?`).get(id) as
      | Record<string, unknown>
      | undefined;
    if (!row || !visibility.canViewPost(viewerId, row)) {
      return reply.code(404).send({ error: 'Post not found' });
    }
    if (!visibility.canReplyToPost(viewerId, row)) {
      return reply.code(403).send({
        error: 'Only mutual friends can reply to this post',
      });
    }

    const commentId = `cmt-${crypto.randomUUID().slice(0, 8)}`;
    const nowIso = new Date().toISOString();

    db.prepare(
      `INSERT INTO comments (id, post_id, author_id, content, is_pinned, likes_count, created_at)
       VALUES (?, ?, ?, ?, 0, 0, ?)`
    ).run(commentId, id, viewerId, content.trim(), nowIso);

    db.prepare(`UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?`).run(id);

    const authorId = String(row.author_id);
    if (authorId !== viewerId) {
      const notifId = `notif-${crypto.randomUUID().slice(0, 8)}`;
      db.prepare(
        `INSERT INTO notifications (id, recipient_id, actor_id, type, entity_id, preview_text, is_read, created_at)
         VALUES (?, ?, ?, 'comment', ?, ?, 0, ?)`
      ).run(notifId, authorId, viewerId, id, `commented: "${content.trim().slice(0, 80)}"`, nowIso);
      hub.sendToUser(authorId, { type: 'NOTIFICATION_NEW', payload: { id: notifId } });
    }

    const commentRow = db.prepare(`SELECT * FROM comments WHERE id = ?`).get(commentId) as Record<
      string,
      unknown
    >;
    return reply.code(201).send(visibility.hydrateComment(commentRow, viewerId));
  });

  // Pin / Unpin Top Comment (Max 3 pinned comments per post!)
  app.patch('/api/comments/:id/pin', async (req, reply) => {
    const viewerId = getViewerId(req);
    const { id } = req.params as { id: string };

    const commentRow = db.prepare(`SELECT * FROM comments WHERE id = ?`).get(id) as
      | Record<string, unknown>
      | undefined;
    if (!commentRow) return reply.code(404).send({ error: 'Comment not found' });

    const postRow = db
      .prepare(`SELECT * FROM posts WHERE id = ?`)
      .get(String(commentRow.post_id)) as Record<string, unknown>;
    if (String(postRow.author_id) !== viewerId && String(postRow.co_author_id) !== viewerId) {
      return reply.code(403).send({ error: 'Only post authors can pin comments' });
    }

    const currentlyPinned = Boolean(commentRow.is_pinned);
    if (!currentlyPinned) {
      const countRow = db
        .prepare(`SELECT COUNT(*) as cnt FROM comments WHERE post_id = ? AND is_pinned = 1`)
        .get(String(commentRow.post_id)) as { cnt: number };
      if (countRow.cnt >= 3) {
        return reply.code(400).send({ error: 'Maximum of 3 pinned comments allowed per post' });
      }
    }

    db.prepare(`UPDATE comments SET is_pinned = ? WHERE id = ?`).run(currentlyPinned ? 0 : 1, id);
    const updated = db.prepare(`SELECT * FROM comments WHERE id = ?`).get(id) as Record<
      string,
      unknown
    >;
    return visibility.hydrateComment(updated, viewerId);
  });
}

