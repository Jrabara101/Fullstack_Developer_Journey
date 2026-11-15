import type { WebSocket } from 'ws';
import type { DatabaseSync } from 'node:sqlite';
import type { PresenceMap } from './services/visibility.ts';

interface ConnectedSocket {
  ws: WebSocket;
  userId: string;
  activity: string | null;
}

export class RealtimeHub implements PresenceMap {
  private readonly connections = new Set<ConnectedSocket>();
  private readonly userSockets = new Map<string, Set<ConnectedSocket>>();

  // Ambient seeded presence for demo friends so the dashboard feels alive on first load
  private readonly ambientOnlineUsers = new Map<string, string | null>([
    ['user-maya', 'Active now'],
    ['user-elena', 'Viewing your story 👀'],
    ['user-marcus', 'Active now'],
    ['user-sora', 'Listening to Fred again..'],
  ]);

  private readonly db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  get(userId: string): { isOnline: boolean; activity: string | null } | undefined {
    const activeSet = this.userSockets.get(userId);
    if (activeSet && activeSet.size > 0) {
      const first = activeSet.values().next().value;
      return { isOnline: true, activity: first?.activity ?? 'Active now' };
    }
    if (this.ambientOnlineUsers.has(userId)) {
      return {
        isOnline: true,
        activity: this.ambientOnlineUsers.get(userId) ?? 'Active now',
      };
    }
    return undefined;
  }

  getPresenceSnapshot(): Array<{ userId: string; isOnline: boolean; activity: string | null }> {
    const merged = new Map<string, { isOnline: boolean; activity: string | null }>();
    for (const [userId, activity] of this.ambientOnlineUsers.entries()) {
      merged.set(userId, { isOnline: true, activity });
    }
    for (const [userId, set] of this.userSockets.entries()) {
      if (set.size > 0) {
        const first = set.values().next().value;
        merged.set(userId, { isOnline: true, activity: first?.activity ?? 'Active now' });
      }
    }
    return Array.from(merged.entries()).map(([userId, val]) => ({
      userId,
      isOnline: val.isOnline,
      activity: val.activity,
    }));
  }

  register(ws: WebSocket, userId: string) {
    const conn: ConnectedSocket = { ws, userId, activity: 'Active now' };
    this.connections.add(conn);

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(conn);

    // Send initial presence snapshot to connecting client
    this.sendToSocket(ws, {
      type: 'PRESENCE_SNAPSHOT',
      payload: { users: this.getPresenceSnapshot() },
    });

    // Broadcast presence update across presence:global
    this.broadcastAll({
      type: 'PRESENCE_UPDATE',
      payload: { userId, isOnline: true, activity: 'Active now' },
    });

    ws.on('message', (raw) => {
      try {
        const parsed = JSON.parse(String(raw)) as {
          type: string;
          payload?: Record<string, unknown>;
        };
        this.handleClientMessage(conn, parsed);
      } catch {
        // Ignore malformed packets
      }
    });

    ws.on('close', () => {
      this.connections.delete(conn);
      const set = this.userSockets.get(userId);
      if (set) {
        set.delete(conn);
        if (set.size === 0) {
          this.userSockets.delete(userId);
          this.broadcastAll({
            type: 'PRESENCE_UPDATE',
            payload: {
              userId,
              isOnline: this.ambientOnlineUsers.has(userId),
              activity: this.ambientOnlineUsers.get(userId) ?? null,
            },
          });
        }
      }
    });
  }

  private handleClientMessage(
    conn: ConnectedSocket,
    msg: { type: string; payload?: Record<string, unknown> }
  ) {
    const payload = msg.payload ?? {};

    if (msg.type === 'ACTIVITY_UPDATE') {
      conn.activity = typeof payload.activity === 'string' ? payload.activity : 'Active now';
      this.broadcastAll({
        type: 'PRESENCE_UPDATE',
        payload: { userId: conn.userId, isOnline: true, activity: conn.activity },
      });
      return;
    }

    if (msg.type === 'TYPING') {
      const conversationId = String(payload.conversationId || '');
      const isTyping = Boolean(payload.isTyping);
      if (!conversationId) return;

      const participants = this.getConversationParticipants(conversationId);
      for (const pid of participants) {
        if (pid === conn.userId) continue;
        this.sendToUser(pid, {
          type: 'TYPING',
          payload: {
            conversationId,
            userId: conn.userId,
            isTyping,
          },
        });
      }
    }
  }

  getConversationParticipants(conversationId: string): string[] {
    const rows = this.db
      .prepare(`SELECT user_id FROM conversation_participants WHERE conversation_id = ?`)
      .all(conversationId) as Array<{ user_id: string }>;
    return rows.map((r) => r.user_id);
  }

  broadcastToConversation(conversationId: string, event: { type: string; payload: unknown }) {
    const participants = this.getConversationParticipants(conversationId);
    for (const pid of participants) {
      this.sendToUser(pid, event);
    }
  }

  sendToUser(userId: string, event: { type: string; payload: unknown }) {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return;
    for (const conn of sockets) {
      this.sendToSocket(conn.ws, event);
    }
  }

  broadcastAll(event: { type: string; payload: unknown }) {
    for (const conn of this.connections) {
      this.sendToSocket(conn.ws, event);
    }
  }

  private sendToSocket(ws: WebSocket, event: { type: string; payload: unknown }) {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify(event));
    }
  }
}
