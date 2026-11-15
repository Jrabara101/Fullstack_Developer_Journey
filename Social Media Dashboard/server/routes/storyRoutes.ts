import type { FastifyInstance } from 'fastify';
import type { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import type { VisibilityService } from '../services/visibility.ts';
import { safeJsonParse } from '../services/visibility.ts';
import type { RealtimeHub } from '../websocket.ts';
import { getViewerId } from './feedRoutes.ts';
import type { StoryAuthorGroup, StoryWidget } from '../../src/types/social.ts';

export function registerStoryRoutes(
  app: FastifyInstance,
  db: DatabaseSync,
  visibility: VisibilityService,
  hub: RealtimeHub
) {
  // Get active story groups (filters by 24h TTL and Close Friends RLS)
  app.get('/api/stories', async (req) => {
    const viewerId = getViewerId(req);
    const nowIso = new Date().toISOString();

    const rows = db
      .prepare(
        `SELECT * FROM stories
         WHERE expires_at > ? AND is_archived = 0
         ORDER BY created_at ASC`
      )
      .all(nowIso) as Array<Record<string, unknown>>;

    const visible = rows.filter((r) => visibility.canViewStory(viewerId, r));
    const byAuthor = new Map<string, Array<Record<string, unknown>>>();

    for (const row of visible) {
      const aid = String(row.author_id);
      if (!byAuthor.has(aid)) byAuthor.set(aid, []);
      byAuthor.get(aid)!.push(row);
    }

    const groups: StoryAuthorGroup[] = [];
    for (const [authorId, authorRows] of byAuthor.entries()) {
      const author = visibility.getProfileById(authorId, viewerId);
      if (!author) continue;
      const slides = authorRows.map((r) => visibility.hydrateStorySlide(r, viewerId));
      const hasUnseen = slides.some((s) => !s.is_viewed);
      const hasCloseFriends = slides.some((s) => s.audience === 'close_friends');
      groups.push({
        author,
        slides,
        has_unseen: hasUnseen,
        has_close_friends: hasCloseFriends,
      });
    }

    // Sort: current user first (if active), then unseen stories, then seen stories
    groups.sort((a, b) => {
      if (a.author.id === viewerId) return -1;
      if (b.author.id === viewerId) return 1;
      if (a.has_unseen !== b.has_unseen) return a.has_unseen ? -1 : 1;
      return 0;
    });

    return { groups };
  });

  // Create a 24h Ephemeral Story
  app.post('/api/stories', async (req, reply) => {
    const viewerId = getViewerId(req);
    const body = req.body as {
      media_url: string;
      media_type?: 'image' | 'video';
      duration_ms?: number;
      audience?: 'public' | 'close_friends';
      caption?: string;
      music_track?: { title: string; artist: string } | null;
      interactive_widget?: StoryWidget | null;
      highlight_title?: string | null;
    };

    if (!body.media_url) return reply.code(400).send({ error: 'media_url is required' });

    const id = `story-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 3600_000).toISOString();

    db.prepare(
      `INSERT INTO stories (
        id, author_id, media_url, media_type, duration_ms, audience, caption,
        music_track, interactive_widget, highlight_title, expires_at,
        is_highlighted, is_archived, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`
    ).run(
      id,
      viewerId,
      body.media_url,
      body.media_type || 'image',
      body.duration_ms || 5500,
      body.audience || 'public',
      body.caption?.trim() || '',
      body.music_track ? JSON.stringify(body.music_track) : null,
      body.interactive_widget ? JSON.stringify(body.interactive_widget) : null,
      body.highlight_title || null,
      expiresAt,
      body.highlight_title ? 1 : 0,
      now.toISOString()
    );

    const row = db.prepare(`SELECT * FROM stories WHERE id = ?`).get(id) as Record<string, unknown>;
    return reply.code(201).send(visibility.hydrateStorySlide(row, viewerId));
  });

  // Mark Story Slide as Viewed
  app.post('/api/stories/:id/view', async (req, reply) => {
    const viewerId = getViewerId(req);
    const { id } = req.params as { id: string };
    const row = db.prepare(`SELECT * FROM stories WHERE id = ?`).get(id) as
      | Record<string, unknown>
      | undefined;

    if (!row || !visibility.canViewStory(viewerId, row)) {
      return reply.code(404).send({ error: 'Story not found' });
    }

    db.prepare(
      `INSERT INTO story_views (story_id, viewer_id, viewed_at)
       VALUES (?, ?, ?)
       ON CONFLICT(story_id, viewer_id) DO NOTHING`
    ).run(id, viewerId, new Date().toISOString());

    const updated = db.prepare(`SELECT * FROM stories WHERE id = ?`).get(id) as Record<
      string,
      unknown
    >;
    return visibility.hydrateStorySlide(updated, viewerId);
  });

  // Interact with Story Widget (Poll vote or Emoji Slider)
  app.post('/api/stories/:id/interact', async (req, reply) => {
    const viewerId = getViewerId(req);
    const { id } = req.params as { id: string };
    const body = req.body as { optionId?: string; sliderValue?: number };

    const row = db.prepare(`SELECT * FROM stories WHERE id = ?`).get(id) as
      | Record<string, unknown>
      | undefined;
    if (!row || !visibility.canViewStory(viewerId, row)) {
      return reply.code(404).send({ error: 'Story not found' });
    }

    const widget = safeJsonParse<StoryWidget | null>(row.interactive_widget, null);
    if (!widget) return reply.code(400).send({ error: 'Story has no interactive widget' });

    const prev = db
      .prepare(`SELECT payload FROM story_interactions WHERE story_id = ? AND user_id = ?`)
      .get(id, viewerId) as { payload: string } | undefined;
    const prevPayload = safeJsonParse<{ optionId?: string; sliderValue?: number }>(
      prev?.payload,
      {}
    );

    if (widget.kind === 'poll' && body.optionId) {
      if (prevPayload.optionId) {
        for (const opt of widget.options) {
          if (opt.id === prevPayload.optionId && opt.votes > 0) opt.votes -= 1;
        }
      }
      for (const opt of widget.options) {
        if (opt.id === body.optionId) opt.votes += 1;
      }
      db.prepare(
        `INSERT INTO story_interactions (story_id, user_id, payload, created_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(story_id, user_id) DO UPDATE SET payload = excluded.payload`
      ).run(id, viewerId, JSON.stringify({ optionId: body.optionId }), new Date().toISOString());
    } else if (widget.kind === 'slider' && typeof body.sliderValue === 'number') {
      const clamped = Math.max(0, Math.min(100, Math.round(body.sliderValue)));
      if (typeof prevPayload.sliderValue === 'number') {
        const total = widget.average * widget.votes - prevPayload.sliderValue + clamped;
        widget.average = Math.round(total / Math.max(1, widget.votes));
      } else {
        const total = widget.average * widget.votes + clamped;
        widget.votes += 1;
        widget.average = Math.round(total / widget.votes);
      }
      db.prepare(
        `INSERT INTO story_interactions (story_id, user_id, payload, created_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(story_id, user_id) DO UPDATE SET payload = excluded.payload`
      ).run(id, viewerId, JSON.stringify({ sliderValue: clamped }), new Date().toISOString());
    }

    db.prepare(`UPDATE stories SET interactive_widget = ? WHERE id = ?`).run(
      JSON.stringify(widget),
      id
    );

    const updated = db.prepare(`SELECT * FROM stories WHERE id = ?`).get(id) as Record<
      string,
      unknown
    >;
    return visibility.hydrateStorySlide(updated, viewerId);
  });

  // Contextual Story-to-DM Bridge: dispatches permanent mini-thumbnail snapshot into 1-on-1 DM
  app.post('/api/stories/:id/reply', async (req, reply) => {
    const viewerId = getViewerId(req);
    const { id } = req.params as { id: string };
    const body = req.body as {
      content?: string;
      reaction_emoji?: string;
      client_msg_id?: string;
    };

    const storyRow = db.prepare(`SELECT * FROM stories WHERE id = ?`).get(id) as
      | Record<string, unknown>
      | undefined;
    if (!storyRow || !visibility.canViewStory(viewerId, storyRow)) {
      return reply.code(404).send({ error: 'Story not found' });
    }

    const authorId = String(storyRow.author_id);
    if (authorId === viewerId) {
      return reply.code(400).send({ error: 'Cannot send story reply DM to yourself' });
    }

    const authorProfile = db
      .prepare(`SELECT username FROM profiles WHERE id = ?`)
      .get(authorId) as { username: string };

    // Record reaction on story_views if emoji supplied
    const nowIso = new Date().toISOString();
    db.prepare(
      `INSERT INTO story_views (story_id, viewer_id, reaction_emoji, viewed_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(story_id, viewer_id) DO UPDATE SET reaction_emoji = COALESCE(excluded.reaction_emoji, story_views.reaction_emoji)`
    ).run(id, viewerId, body.reaction_emoji || null, nowIso);

    // Find or create 1-on-1 conversation between viewerId and authorId
    const convRow = db
      .prepare(
        `SELECT cp1.conversation_id as id
         FROM conversation_participants cp1
         JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
         WHERE cp1.user_id = ? AND cp2.user_id = ?
         LIMIT 1`
      )
      .get(viewerId, authorId) as { id: string } | undefined;

    let conversationId = convRow?.id;
    if (!conversationId) {
      conversationId = `conv-${crypto.randomUUID().slice(0, 8)}`;
      db.prepare(
        `INSERT INTO conversations (id, theme_accent, is_request, created_at, updated_at) VALUES (?, 'cobalt', 0, ?, ?)`
      ).run(conversationId, nowIso, nowIso);
      db.prepare(
        `INSERT INTO conversation_participants (conversation_id, user_id, is_muted) VALUES (?, ?, 0)`
      ).run(conversationId, viewerId);
      db.prepare(
        `INSERT INTO conversation_participants (conversation_id, user_id, is_muted) VALUES (?, ?, 0)`
      ).run(conversationId, authorId);
    }

    const msgText =
      body.content?.trim() ||
      (body.reaction_emoji ? `Reacted ${body.reaction_emoji} to your story` : 'Replied to your story');

    const msgId = `msg-${crypto.randomUUID().slice(0, 8)}`;
    const clientMsgId = body.client_msg_id || crypto.randomUUID();
    const snapshot = {
      story_id: id,
      author_username: authorProfile.username,
      media_url: String(storyRow.media_url),
      caption: String(storyRow.caption || ''),
      expired: false,
    };

    db.prepare(
      `INSERT INTO messages (
        id, client_msg_id, conversation_id, sender_id, content, reply_to_story_id,
        story_snapshot, reactions, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, '{}', ?)`
    ).run(
      msgId,
      clientMsgId,
      conversationId,
      viewerId,
      msgText,
      id,
      JSON.stringify(snapshot),
      nowIso
    );

    db.prepare(`UPDATE conversations SET updated_at = ?, is_request = 0 WHERE id = ?`).run(
      nowIso,
      conversationId
    );

    const notifId = `notif-${crypto.randomUUID().slice(0, 8)}`;
    db.prepare(
      `INSERT INTO notifications (id, recipient_id, actor_id, type, entity_id, preview_text, is_read, created_at)
       VALUES (?, ?, ?, 'story_reaction', ?, ?, 0, ?)`
    ).run(notifId, authorId, viewerId, id, msgText, nowIso);

    const payloadMsg = {
      id: msgId,
      client_msg_id: clientMsgId,
      conversation_id: conversationId,
      sender_id: viewerId,
      content: msgText,
      media_url: null,
      media_type: null,
      voice_duration_ms: null,
      voice_waveform: null,
      reply_to_message_id: null,
      reply_to_message: null,
      reply_to_story_id: id,
      story_snapshot: snapshot,
      shared_post_id: null,
      shared_post: null,
      reactions: {},
      read_at: null,
      status: 'delivered',
      created_at: nowIso,
    };

    hub.broadcastToConversation(conversationId, {
      type: 'MESSAGE_NEW',
      payload: payloadMsg,
    });
    hub.sendToUser(authorId, { type: 'NOTIFICATION_NEW', payload: { id: notifId } });

    return reply.code(201).send({
      conversation_id: conversationId,
      message: payloadMsg,
    });
  });

  // Pin / Highlight a story to Profile Highlights
  app.patch('/api/stories/:id/highlight', async (req, reply) => {
    const viewerId = getViewerId(req);
    const { id } = req.params as { id: string };
    const body = req.body as { highlight_title?: string; is_highlighted?: boolean };

    const row = db.prepare(`SELECT * FROM stories WHERE id = ?`).get(id) as
      | Record<string, unknown>
      | undefined;
    if (!row) return reply.code(404).send({ error: 'Story not found' });
    if (String(row.author_id) !== viewerId) {
      return reply.code(403).send({ error: 'Only author can highlight stories' });
    }

    const nextHl = body.is_highlighted ?? true;
    db.prepare(`UPDATE stories SET is_highlighted = ?, highlight_title = ? WHERE id = ?`).run(
      nextHl ? 1 : 0,
      String(body.highlight_title || row.highlight_title || 'Highlights'),
      id
    );

    const updated = db.prepare(`SELECT * FROM stories WHERE id = ?`).get(id) as Record<
      string,
      unknown
    >;
    return visibility.hydrateStorySlide(updated, viewerId);
  });
}
