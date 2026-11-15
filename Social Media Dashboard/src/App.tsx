import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from './stores/useAppStore';
import { useMessengerStore } from './stores/useMessengerStore';
import { useConversations, useMe } from './hooks/useSocialQueries';
import { SocialDashboardLayout } from './components/layout/SocialDashboardLayout';
import { StoryViewerModal } from './components/stories/StoryViewerModal';
import { FloatingDmDock } from './components/messages/FloatingDmDock';
import { CreateModal } from './components/feed/CreateModal';
import { CommandPalette } from './components/common/CommandPalette';
import { ToastStack } from './components/common/ToastStack';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
  },
});

const DashboardRoot: React.FC = () => {
  const theme = useAppStore((s) => s.theme);
  const { data: meData } = useMe();
  const { data: convData } = useConversations();
  const connectWs = useMessengerStore((s) => s.connectWs);
  const setUnreadCount = useMessengerStore((s) => s.setUnreadCount);
  const qc = useQueryClient();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    if (meData?.user?.id) {
      connectWs(meData.user.id, qc);
    }
  }, [meData?.user?.id, connectWs, qc]);

  useEffect(() => {
    if (convData) {
      setUnreadCount(convData.totalUnread);
    }
  }, [convData, setUnreadCount]);

  return (
    <>
      <SocialDashboardLayout />
      <StoryViewerModal />
      <FloatingDmDock />
      <CreateModal />
      <CommandPalette />
      <ToastStack />
    </>
  );
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardRoot />
    </QueryClientProvider>
  );
}

export default App;

