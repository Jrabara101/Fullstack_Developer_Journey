import { create } from 'zustand';
import type { QueryClient } from '@tanstack/react-query';
import type { PresenceInfo, WsServerEvent } from '../types/social';
import { useAppStore } from './useAppStore';

interface MessengerState {
  isDockOpen: boolean;
  activeDockConversationId: string | null;
  activeStudioConversationId: string | null;
  unreadCount: number;
  presenceByUser: Record<string, PresenceInfo>;
  typingByConversation: Record<string, string[]>;
  wsStatus: 'connecting' | 'connected' | 'disconnected';

  setDockOpen: (open: boolean) => void;
  toggleDock: () => void;
  openQuickChat: (conversationId: string) => void;
  setActiveStudioConversation: (conversationId: string | null) => void;
  setUnreadCount: (count: number) => void;
  connectWs: (userId: string, queryClient: QueryClient) => void;
  disconnectWs: () => void;
  sendTyping: (conversationId: string, isTyping: boolean) => void;
  sendActivity: (activity: string) => void;
}

let activeWs: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let connectedUserId: string | null = null;

export const useMessengerStore = create<MessengerState>((set, get) => ({
  isDockOpen: false,
  activeDockConversationId: 'conv-maya',
  activeStudioConversationId: 'conv-maya',
  unreadCount: 0,
  presenceByUser: {},
  typingByConversation: {},
  wsStatus: 'disconnected',

  setDockOpen: (isDockOpen) => set({ isDockOpen }),
  toggleDock: () => set((s) => ({ isDockOpen: !s.isDockOpen })),

  openQuickChat: (conversationId) =>
    set({
      isDockOpen: true,
      activeDockConversationId: conversationId,
      activeStudioConversationId: conversationId,
    }),

  setActiveStudioConversation: (conversationId) =>
    set({ activeStudioConversationId: conversationId }),

  setUnreadCount: (unreadCount) => set({ unreadCount }),

  connectWs: (userId, queryClient) => {
    if (typeof window === 'undefined') return;
    if (activeWs && connectedUserId === userId && activeWs.readyState <= 1) return;

    get().disconnectWs();
    connectedUserId = userId;
    set({ wsStatus: 'connecting' });

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?userId=${encodeURIComponent(userId)}`;
    const ws = new WebSocket(wsUrl);
    activeWs = ws;

    ws.onopen = () => {
      set({ wsStatus: 'connected' });
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as WsServerEvent;

        if (msg.type === 'PRESENCE_SNAPSHOT') {
          const users = (msg.payload.users || []) as PresenceInfo[];
          const map: Record<string, PresenceInfo> = {};
          for (const u of users) map[u.userId] = u;
          set({ presenceByUser: map });
        } else if (msg.type === 'PRESENCE_UPDATE') {
          const info = msg.payload as unknown as PresenceInfo;
          set((s) => ({
            presenceByUser: { ...s.presenceByUser, [info.userId]: info },
          }));
        } else if (msg.type === 'TYPING') {
          const { conversationId, userId: typerId, isTyping } = msg.payload as {
            conversationId: string;
            userId: string;
            isTyping: boolean;
          };
          set((s) => {
            const current = new Set(s.typingByConversation[conversationId] || []);
            if (isTyping) current.add(typerId);
            else current.delete(typerId);
            return {
              typingByConversation: {
                ...s.typingByConversation,
                [conversationId]: Array.from(current),
              },
            };
          });
        } else if (msg.type === 'MESSAGE_NEW') {
          const convId = String(msg.payload.conversation_id || '');
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          if (convId) {
            queryClient.invalidateQueries({ queryKey: ['messages', convId] });
          }
        } else if (msg.type === 'MESSAGE_READ' || msg.type === 'MESSAGE_REACTION') {
          const convId = String(msg.payload.conversationId || '');
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          if (convId) {
            queryClient.invalidateQueries({ queryKey: ['messages', convId] });
          }
        } else if (msg.type === 'NOTIFICATION_NEW') {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      set({ wsStatus: 'disconnected' });
      if (connectedUserId === userId) {
        reconnectTimer = setTimeout(() => {
          get().connectWs(userId, queryClient);
        }, 2500);
      }
    };
  },

  disconnectWs: () => {
    connectedUserId = null;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (activeWs) {
      activeWs.close();
      activeWs = null;
    }
    set({ wsStatus: 'disconnected' });
  },

  sendTyping: (conversationId, isTyping) => {
    if (activeWs && activeWs.readyState === WebSocket.OPEN) {
      activeWs.send(
        JSON.stringify({
          type: 'TYPING',
          payload: { conversationId, isTyping },
        })
      );
    }
  },

  sendActivity: (activity) => {
    if (activeWs && activeWs.readyState === WebSocket.OPEN) {
      activeWs.send(
        JSON.stringify({
          type: 'ACTIVITY_UPDATE',
          payload: { activity },
        })
      );
    }
  },
}));

export function triggerQuickOpenDm(
  targetUserId: string,
  openConversationFn: (id: string) => Promise<{ id: string }>,
  mode: 'dock' | 'studio' = 'dock'
) {
  openConversationFn(targetUserId).then(({ id }) => {
    if (mode === 'dock') {
      useMessengerStore.getState().openQuickChat(id);
    } else {
      useMessengerStore.getState().setActiveStudioConversation(id);
      useAppStore.getState().setActiveView('messages');
    }
  });
}

