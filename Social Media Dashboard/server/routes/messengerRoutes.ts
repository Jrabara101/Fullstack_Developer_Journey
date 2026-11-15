import type { FastifyInstance } from 'fastify';
import type { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import type { VisibilityService } from '../services/visibility.ts';
import { safeJsonParse } from '../services/visibility.ts';
import type { RealtimeHub } from '../websocket.ts';
import { getViewerId } from './feedRoutes.ts';
import type { ConversationSummary, Message, StorySnapshot } from '../../src/types/social.ts';

function hydrateMessage(
  db: DatabaseSync,
  visibility: VisibilityService,
  row: Record<string, unknown>,
  viewerId: string
): Message {
  const replyMsgId = row.reply_to_message_id ? String(row.reply_to_message_id) : null;
  let replyToMessage: Message['reply_to_message'] = null;
  if (replyMsgId) {
    const ref = db
      .prepare(
        `SELECT m.id, m.content, p.display_name as sender_name
         FROM messages m JOIN profiles p ON p.id = m.sender_id
         WHERE m.id = ?`
      )
      .get(replyMsgId) as { id: string; content: string; sender_name: string } | undefined;
    if (ref) replyToMessage = ref;
  }

  const sharedPostId = row.shared_post_id ? String(row.shared_post_id) : null;
  let sharedPost = null;
  if (sharedPostId) {
    const postRow = db.prepare(`SELECT * FROM posts WHERE id = ?`).get(sharedPostId) as
      | Record<string, unknown>
      | undefined;
    if (postRow && visibility.canViewPost(viewerId, postRow)) {
      sharedPost = visibility.hydratePost(postRow, viewerId);
    }
  }

  const storySnapshot = safeJsonParse<StorySnapshot | null>(row.story_snapshot, null);
  if (storySnapshot && row.reply_to_story_id) {
    const st = db
      .prepare(`SELECT expires_at, is_archived FROM stories WHERE id = ?`)
      .get(String(row.reply_to_story_id)) as { expires_at: string; is_archived: number } | undefined;
    if (st) {
      storySnapshot.expired = Boolean(st.is_archived) || st.expires_at <= new Date().toISOString();
    }
  }

  return {
    id: String(row.id),
    client_msg_id: String(row.client_msg_id),
    conversation_id: String(row.conversation_id),
    sender_id: String(row.sender_id),
    content: String(row.content || ''),
    media_url: row.media_url ? String(row.media_url) : null,
    media_type: row.media_type ? (String(row.media_type) as Message['media_type']) : null,
    voice_duration_ms:
      typeof row.voice_duration_ms === 'number' ? row.voice_duration_ms : null,
    voice_waveform: safeJsonParse<number[] | null>(row.voice_waveform, null),
    reply_to_message_id: replyMsgId,
    reply_to_message: replyToMessage,
    reply_to_story_id: row.reply_to_story_id ? String(row.reply_to_story_id) : null,
    story_snapshot: storySnapshot,
    shared_post_id: sharedPostId,
    shared_post: sharedPost,
    reactions: safeJsonParse<Record<string, string[]>>(row.reactions, {}),
    read_at: row.read_at ? String(row.read_at) : null,
    status: row.read_at ? 'read' : 'delivered',
    created_at: String(row.created_at),
  };
}

export function registerMessengerRoutes(
  app: FastifyInstance,
  db: DatabaseSync,
  visibility: VisibilityService,
  hub: RealtimeHub
) {
  // List all conversations for current viewer with unread badge totals
  app.get('/api/conversations', async (req) => {
    const viewerId = getViewerId(req);

    const convRows = db
      .prepare(
        `SELECT c.*, cp.is_muted, cp.last_read_at
         FROM conversations c
         JOIN conversation_participants cp ON cp.conversation_id = c.id
         WHERE cp.user_id = ?
         ORDER BY c.updated_at DESC`
      )
      .all(viewerId) as Array<Record<string, unknown>>;

    const conversations: ConversationSummary[] = [];

    for (const c of convRows) {
      const convId = String(c.id);
      const otherRow = db
        .prepare(
          `SELECT p.* FROM profiles p
           JOIN conversation_participants cp ON cp.user_id = p.id
           WHERE cp.conversation_id = ? AND p.id <> ?
           LIMIT 1`
        )
        .get(convId, viewerId) as Record<string, unknown> | undefined;

      if (!otherRow) continue;

      const participant = visibility.hydrateProfileSummary(otherRow, viewerId);
      const lastMsgRow = db
        .prepare(`SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 1`)
        .get(convId) as Record<string, unknown> | undefined;

      const unreadRow = db
        .prepare(
          `SELECT COUNT(*) as cnt FROM messages
           WHERE conversation_id = ? AND sender_id <> ? AND read_at IS NULL`
        )
        .get(convId, viewerId) as { cnt: number };

      conversations.push({
        id: convId,
        participant,
        theme_accent: String(c.theme_accent || 'cobalt') as ConversationSummary['theme_accent'],
        is_request: Boolean(c.is_request),
        is_muted: Boolean(c.is_muted),
        unread_count: Number(unreadRow?.cnt || 0),
        last_message: lastMsgRow ? hydrateMessage(db, visibility, lastMsgRow, viewerId) : null,
        updated_at: String(c.updated_at),
      });
    }

    const totalUnread = conversations
      .filter((c) => !c.is_request && !c.is_muted)
      .reduce((acc, c) => acc + c.unread_count, 0);

    return { conversations, totalUnread };
  });

  // Find or create a 1-on-1 conversation with participantId
  app.post('/api/conversations', async (req, reply) => {
    const viewerId = getViewerId(req);
    const { participantId } = req.body as { participantId: string };
    if (!participantId || participantId === viewerId) {
      return reply.code(400).send({ error: 'Valid participantId is required' });
    }

    const existing = db
      .prepare(
        `SELECT cp1.conversation_id as id
         FROM conversation_participants cp1
         JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
         WHERE cp1.user_id = ? AND cp2.user_id = ?
         LIMIT 1`
      )
      .get(viewerId, participantId) as { id: string } | undefined;

    if (existing) {
      return { id: existing.id };
    }

    const convId = `conv-${crypto.randomUUID().slice(0, 8)}`;
    const nowIso = new Date().toISOString();
    db.prepare(
      `INSERT INTO conversations (id, theme_accent, is_request, created_at, updated_at) VALUES (?, 'cobalt', 0, ?, ?)`
    ).run(convId, nowIso, nowIso);
    db.prepare(
      `INSERT INTO conversation_participants (conversation_id, user_id, is_muted) VALUES (?, ?, 0)`
    ).run(convId, viewerId);
    db.prepare(
      `INSERT INTO conversation_participants (conversation_id, user_id, is_muted) VALUES (?, ?, 0)`
    ).run(convId, participantId);

    return reply.code(201).send({ id: convId });
  });

  // Cursor-based messages history for a conversation
  app.get('/api/conversations/:id/messages', async (req, reply) => {
    const viewerId = getViewerId(req);
    const { id } = req.params as { id: string };
    const q = req.query as { cursor?: string; limit?: string };
    const limit = Math.min(Math.max(Number(q.limit || 25), 1), 60);

    const participant = db
      .prepare(`SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ?`)
      .get(id, viewerId);
    if (!participant) return reply.code(403).send({ error: 'Not a participant' });

    const allRows = db
      .prepare(`SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC, id DESC`)
      .all(id) as Array<Record<string, unknown>>;

    let startIndex = 0;
    if (q.cursor) {
      const idx = allRows.findIndex((r) => String(r.id) === q.cursor);
      if (idx >= 0) startIndex = idx + 1;
    }

    const slice = allRows.slice(startIndex, startIndex + limit);
    const nextCursor =
      startIndex + limit < allRows.length ? String(slice[slice.length - 1]?.id ?? '') : null;

    // Return chronologically oldest -> newest for chat stream rendering
    const chronological = slice.reverse().map((r) => hydrateMessage(db, visibility, r, viewerId));

    return {
      items: chronological,
      nextCursor,
    };
  });

  // Idempotent message send (supports text, media, voice clips, quote reply, shared playable post)
  app.post('/api/conversations/:id/messages', async (req, reply) => {
    const viewerId = getViewerId(req);
    const { id: convId } = req.params as { id: string };
    const body = req.body as {
      client_msg_id?: string;
      content?: string;
      media_url?: string | null;
      media_type?: 'image' | 'video' | 'audio' | null;
      voice_duration_ms?: number | null;
      voice_waveform?: number[] | null;
      reply_to_message_id?: string | null;
      shared_post_id?: string | null;
    };

    const participant = db
      .prepare(`SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ?`)
      .get(convId, viewerId);
    if (!participant) return reply.code(403).send({ error: 'Not a participant' });

    const clientMsgId = body.client_msg_id || crypto.randomUUID();
    const duplicate = db
      .prepare(`SELECT * FROM messages WHERE client_msg_id = ?`)
      .get(clientMsgId) as Record<string, unknown> | undefined;
    if (duplicate) {
      return hydrateMessage(db, visibility, duplicate, viewerId);
    }

    const msgId = `msg-${crypto.randomUUID().slice(0, 8)}`;
    const nowIso = new Date().toISOString();

    db.prepare(
      `INSERT INTO messages (
        id, client_msg_id, conversation_id, sender_id, content, media_url, media_type,
        voice_duration_ms, voice_waveform, reply_to_message_id, shared_post_id, reactions, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '{}', ?)`
    ).run(
      msgId,
      clientMsgId,
      convId,
      viewerId,
      body.content?.trim() || '',
      body.media_url || null,
      body.media_type || null,
      body.voice_duration_ms ?? null,
      body.voice_waveform ? JSON.stringify(body.voice_waveform) : null,
      body.reply_to_message_id || null,
      body.shared_post_id || null,
      nowIso
    );

    db.prepare(`UPDATE conversations SET updated_at = ?, is_request = 0 WHERE id = ?`).run(
      nowIso,
      convId
    );

    const row = db.prepare(`SELECT * FROM messages WHERE id = ?`).get(msgId) as Record<
      string,
      unknown
    >;
    const hydrated = hydrateMessage(db, visibility, row, viewerId);

    hub.broadcastToConversation(convId, {
      type: 'MESSAGE_NEW',
      payload: hydrated,
    });

    return reply.code(201).send(hydrated);
  });

  // Mark messages read (honors user's configurable read-receipts privacy flag)
  app.post('/api/conversations/:id/read', async (req, reply) => {
    const viewerId = getViewerId(req);
    const { id: convId } = req.params as { id: string };

    const participant = db
      .prepare(`SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ?`)
      .get(convId, viewerId);
    if (!participant) return reply.code(403).send({ error: 'Not a participant' });

    const profile = db
      .prepare(`SELECT read_receipts_enabled FROM profiles WHERE id = ?`)
      .get(viewerId) as { read_receipts_enabled: number } | undefined;

    const nowIso = new Date().toISOString();
    db.prepare(
      `UPDATE conversation_participants SET last_read_at = ? WHERE conversation_id = ? AND user_id = ?`
    ).run(nowIso, convId, viewerId);

    if (profile?.read_receipts_enabled) {
      db.prepare(
        `UPDATE messages SET read_at = ? WHERE conversation_id = ? AND sender_id <> ? AND read_at IS NULL`
      ).run(nowIso, convId, viewerId);

      hub.broadcastToConversation(convId, {
        type: 'MESSAGE_READ',
        payload: { conversationId: convId, readerId: viewerId, readAt: nowIso },
      });
    }

    return { ok: true, read_receipt_sent: Boolean(profile?.read_receipts_enabled) };
  });

  // Toggle emoji reaction on a DM bubble
  app.post('/api/messages/:id/react', async (req, reply) => {
    const viewerId = getViewerId(req);
    const { id: msgId } = req.params as { id: string };
    const { emoji } = req.body as { emoji: string };
    if (!emoji) return reply.code(400).send({ error: 'Emoji required' });

    const row = db.prepare(`SELECT * FROM messages WHERE id = ?`).get(msgId) as
      | Record<string, unknown>
      | undefined;
    if (!row) return reply.code(404).send({ error: 'Message not found' });

    const convId = String(row.conversation_id);
    const participant = db
      .prepare(`SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ?`)
      .get(convId, viewerId);
    if (!participant) return reply.code(403).send({ error: 'Not a participant' });

    const reactions = safeJsonParse<Record<string, string[]>>(row.reactions, {});
    const list = new Set(reactions[emoji] || []);
    if (list.has(viewerId)) {
      list.delete(viewerId);
    } else {
      list.add(viewerId);
    }
    if (list.size === 0) {
      delete reactions[emoji];
    } else {
      reactions[emoji] = Array.from(list);
    }

    db.prepare(`UPDATE messages SET reactions = ? WHERE id = ?`).run(
      JSON.stringify(reactions),
      msgId
    );

    hub.broadcastToConversation(convId, {
      type: 'MESSAGE_REACTION',
      payload: { messageId: msgId, conversationId: convId, reactions },
    });

    const updated = db.prepare(`SELECT * FROM messages WHERE id = ?`).get(msgId) as Record<
      string,
      unknown
    >;
    return hydrateMessage(db, visibility, updated, viewerId);
  });

  // Update conversation theme accent, mute switch, or accept request
  app.patch('/api/conversations/:id/settings', async (req, reply) => {
    const viewerId = getViewerId(req);
    const { id: convId } = req.params as { id: string };
    const body = req.body as {
      theme_accent?: 'cobalt' | 'sunset' | 'emerald' | 'violet';
      is_muted?: boolean;
      accept_request?: boolean;
    };

    const participant = db
      .prepare(`SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ?`)
      .get(convId, viewerId);
    if (!participant) return reply.code(403).send({ error: 'Not a participant' });

    if (body.theme_accent) {
      db.prepare(`UPDATE conversations SET theme_accent = ? WHERE id = ?`).run(
        body.theme_accent,
        convId
      );
    }
    if (typeof body.is_muted === 'boolean') {
      db.prepare(
        `UPDATE conversation_participants SET is_muted = ? WHERE conversation_id = ? AND user_id = ?`
      ).run(body.is_muted ? 1 : 0, convId, viewerId);
    }
    if (body.accept_request) {
      db.prepare(`UPDATE conversations SET is_request = 0 WHERE id = ?`).run(convId);
    }

    return { ok: true };
  });
}

