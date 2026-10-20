import React from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useAppStore } from './store';
import { ReviewPlatformShell } from './components/ReviewPlatformShell';
import { CommandPalette } from './components/CommandPalette';
import { ReviewComposerModal } from './components/ReviewComposerModal';
import { GameCatalogView } from './views/GameCatalogView';
import { GameDetailStage } from './views/GameDetailStage';
import { CriticProfileHub } from './views/CriticProfileHub';
import { QuestListsView } from './views/QuestListsView';
import { TasteMatchDiscoveryView } from './views/TasteMatchDiscoveryView';
import { fetchGames } from './lib/api';
import { ShieldCheck, Sparkles, Terminal } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent: React.FC = () => {
  const { currentView, selectedGameId, selectedProfileId, isComposerOpen, setComposerOpen } =
    useAppStore();

  const { data: catalogData } = useQuery({
    queryKey: ['games'],
    queryFn: () => fetchGames(),
  });

  const games = catalogData?.games || [];

  return (
    <div className="min-h-screen bg-[#07090E] text-[#E2E8F0] flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
      {/* Top Command Shell Navigation */}
      <ReviewPlatformShell />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'catalog' && <GameCatalogView />}
        {currentView === 'game-detail' && <GameDetailStage gameId={selectedGameId} />}
        {currentView === 'profile' && <CriticProfileHub profileId={selectedProfileId} />}
        {currentView === 'lists' && <QuestListsView />}
        {currentView === 'taste-discover' && <TasteMatchDiscoveryView />}
      </main>

      {/* Global Modals */}
      <CommandPalette />
      <ReviewComposerModal
        games={games}
        isOpen={isComposerOpen}
        onClose={() => setComposerOpen(false)}
      />

      {/* Footer */}
      <footer className="w-full bg-[#04060A] border-t border-slate-900 py-10 mt-20 text-xs font-mono text-slate-500">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-[10px]">
              CV
            </div>
            <span className="text-slate-300 font-bold">CRITIC.VAULT</span>
            <span>— Game Criticism Sanctuary & Taste-Matching Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-cyan-400/90">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Anti-Brigading Quarantine Active</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-400/90">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cosine Taste Vector Engine v2.4</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
