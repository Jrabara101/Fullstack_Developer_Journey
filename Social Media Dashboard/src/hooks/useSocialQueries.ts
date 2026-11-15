import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { api, getActiveUserId } from '../lib/api';
import type {
  FeedLens,
  FeedPageResponse,
  FeedPost,
  Message,
  MessagesPageResponse,
} from '../types/social';
import { generateClientUuid } from '../lib/utils';

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.getMe(),
  });
}

export function useFeedInfinite(lens: FeedLens) {
  return useInfiniteQuery({
    queryKey: ['feed', lens],
    queryFn: ({ pageParam }) => api.getFeed(lens, pageParam, 6),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useStories() {
  return useQuery({
    queryKey: ['stories'],
    queryFn: () => api.getStories(),
  });
}

export function useDiscovery() {
  return useQuery({
    queryKey: ['discovery'],
    queryFn: () => api.getDiscovery(),
  });
}

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.getConversations(),
    refetchInterval: 15_000,
  });
}

export function useMessagesInfinite(conversationId: string | null) {
  return useInfiniteQuery({
    queryKey: ['messages', conversationId],
    queryFn: ({ pageParam }) => api.getMessages(conversationId!, pageParam, 25),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: Boolean(conversationId),
  });
}

export function useProfileStudio(username: string) {
  return useQuery({
    queryKey: ['profile', username],
    queryFn: () => api.getProfile(username),
    enabled: Boolean(username),
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.getNotifications(),
    refetchInterval: 20_000,
  });
}

export function useCollections() {
  return useQuery({
    queryKey: ['collections'],
    queryFn: () => api.getCollections(),
  });
}

function updatePostAcrossCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: string,
  updater: (p: FeedPost) => FeedPost
) {
  queryClient.setQueriesData<InfiniteData<FeedPageResponse>>(
    { queryKey: ['feed'] },
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          items: page.items.map((item) => (item.id === postId ? updater(item) : item)),
        })),
      };
    }
  );
}

// Optimistic Like with automatic rollback on network failure
export function useToggleLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => api.toggleLike(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      const prev = queryClient.getQueriesData<InfiniteData<FeedPageResponse>>({
        queryKey: ['feed'],
      });
      updatePostAcrossCaches(queryClient, postId, (p) => ({
        ...p,
        is_liked: !p.is_liked,
        likes_count: p.is_liked ? Math.max(0, p.likes_count - 1) : p.likes_count + 1,
      }));
      return { prev };
    },
    onError: (_err, _postId, ctx) => {
      if (ctx?.prev) {
        for (const [key, data] of ctx.prev) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSuccess: (updated) => {
      updatePostAcrossCaches(queryClient, updated.id, () => updated);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// Optimistic Bookmark with automatic rollback
export function useToggleBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, collection_id }: { postId: string; collection_id?: string | null }) =>
      api.toggleBookmark(postId, collection_id),
    onMutate: async ({ postId, collection_id }) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      const prev = queryClient.getQueriesData<InfiniteData<FeedPageResponse>>({
        queryKey: ['feed'],
      });
      updatePostAcrossCaches(queryClient, postId, (p) => ({
        ...p,
        is_bookmarked: collection_id !== undefined ? true : !p.is_bookmarked,
        bookmark_collection_id:
          collection_id !== undefined ? collection_id : p.is_bookmarked ? null : p.bookmark_collection_id,
      }));
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        for (const [key, data] of ctx.prev) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSuccess: (updated) => {
      updatePostAcrossCaches(queryClient, updated.id, () => updated);
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

// Optimistic Follow Toggle
export function useToggleFollow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetId: string) => api.toggleFollow(targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discovery'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useToggleCloseFriend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetId: string) => api.toggleCloseFriend(targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['discovery'] });
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    },
  });
}

// Optimistic Message Dispatch (mounts outbound bubble immediately with spring status)
export function useSendMessage(conversationId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      content?: string;
      media_url?: string | null;
      media_type?: 'image' | 'video' | 'audio' | null;
      voice_duration_ms?: number | null;
      voice_waveform?: number[] | null;
      reply_to_message_id?: string | null;
      shared_post_id?: string | null;
      client_msg_id?: string;
    }) =>
      api.sendMessage(conversationId!, {
        ...payload,
        client_msg_id: payload.client_msg_id || generateClientUuid(),
      }),
    onMutate: async (payload) => {
      if (!conversationId) return {};
      const clientMsgId = payload.client_msg_id || generateClientUuid();
      payload.client_msg_id = clientMsgId;
      await queryClient.cancelQueries({ queryKey: ['messages', conversationId] });
      const prev = queryClient.getQueryData<InfiniteData<MessagesPageResponse>>([
        'messages',
        conversationId,
      ]);

      const optimistic: Message = {
        id: `temp-${clientMsgId}`,
        client_msg_id: clientMsgId,
        conversation_id: conversationId,
        sender_id: getActiveUserId(),
        content: payload.content || '',
        media_url: payload.media_url ?? null,
        media_type: payload.media_type ?? null,
        voice_duration_ms: payload.voice_duration_ms ?? null,
        voice_waveform: payload.voice_waveform ?? null,
        reply_to_message_id: payload.reply_to_message_id ?? null,
        reply_to_message: null,
        reply_to_story_id: null,
        story_snapshot: null,
        shared_post_id: payload.shared_post_id ?? null,
        shared_post: null,
        reactions: {},
        read_at: null,
        status: 'sending',
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<InfiniteData<MessagesPageResponse>>(
        ['messages', conversationId],
        (old) => {
          if (!old || old.pages.length === 0) {
            return { pageParams: [null], pages: [{ items: [optimistic], nextCursor: null }] };
          }
          const pages = [...old.pages];
          const first = pages[0];
          pages[0] = { ...first, items: [...first.items, optimistic] };
          return { ...old, pages };
        }
      );

      return { prev, clientMsgId };
    },
    onError: (_err, _vars, ctx) => {
      if (conversationId && ctx?.prev) {
        queryClient.setQueryData(['messages', conversationId], ctx.prev);
      }
    },
    onSuccess: () => {
      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

