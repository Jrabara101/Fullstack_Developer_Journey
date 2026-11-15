import React, { useEffect, useState } from 'react';
import {
  Compass,
  Film,
  Home,
  MessageCircle,
  Moon,
  Plus,
  Search,
  Sparkles,
  Sun,
  UserCheck,
  X,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../../stores/useAppStore';
import { useMe } from '../../hooks/useSocialQueries';
import { getActiveUserId, setActiveUserId } from '../../lib/api';
import { StoryAvatar } from './StoryAvatar';

export const CommandPalette: React.FC = () => {
  const isOpen = useAppStore((s) => s.isCommandPaletteOpen);
  const setOpen = useAppStore((s) => s.setCommandPaletteOpen);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const setActiveLens = useAppStore((s) => s.setActiveLens);
  const navigateToProfile = useAppStore((s) => s.navigateToProfile);
  const openCreateModal = useAppStore((s) => s.openCreateModal);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const theme = useAppStore((s) => s.theme);
  const pushToast = useAppStore((s) => s.pushToast);

  const [query, setQuery] = useState('');
  const { data: meData } = useMe();
  const queryClient = useQueryClient();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(!useAppStore.getState().isCommandPaletteOpen);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        openCreateModal('post');
      } else if (e.key === 'Escape' && useAppStore.getState().isCommandPaletteOpen) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpen, openCreateModal]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();
  const personas = (meData?.personas || []).filter(
    (p) =>
      !q ||
      p.display_name.toLowerCase().includes(q) ||
      p.username.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q)
  );

  const quickActions = [
    {
      id: 'home',
      label: 'Go to Home Feed',
      icon: Home,
      run: () => setActiveView('feed'),
    },
    {
      id: 'lens-cf',
      label: 'Switch Lens: Close Friends 💚',
      icon: Sparkles,
      run: () => {
        setActiveView('feed');
        setActiveLens('close_friends');
      },
    },
    {
      id: 'explore',
      label: 'Open Explore & Topics',
      icon: Compass,
      run: () => setActiveView('explore'),
    },
    {
      id: 'reels',
      label: 'Open Reels & Video',
      icon: Film,
      run: () => setActiveView('reels'),
    },
    {
      id: 'messages',
      label: 'Open Direct Messages Studio',
      icon: MessageCircle,
      run: () => setActiveView('messages'),
    },
    {
      id: 'create',
      label: 'Create New Post or Story',
      icon: Plus,
      run: () => openCreateModal('post'),
    },
    {
      id: 'theme',
      label: theme === 'dark' ? 'Switch to Alabaster Light' : 'Switch to Obsidian Dark',
      icon: theme === 'dark' ? Sun : Moon,
      run: () => toggleTheme(),
    },
  ].filter((a) => !q || a.label.toLowerCase().includes(q));

  const switchAccount = (userId: string, username: string) => {
    setActiveUserId(userId);
    queryClient.invalidateQueries();
    setOpen(false);
    pushToast(`Switched active account to @${username}`, 'cobalt');
  };

  return (
    <div
      className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[12vh] px-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-surface-elevated border border-divider shadow-2xl overflow-hidden animate-msg-spring"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-divider">
          <Search className="w-4 h-4 text-muted-ink shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to creator, switch lens, or change active persona..."
            className="flex-1 bg-transparent text-sm text-primary-ink placeholder:text-muted-ink outline-none"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-1 rounded-lg hover:bg-surface-secondary text-muted-ink cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-3">
          {quickActions.length > 0 && (
            <div>
              <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-ink">
                Actions & Views
              </div>
              <div className="space-y-0.5">
                {quickActions.map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => {
                      act.run();
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-primary-ink hover:bg-surface-secondary transition-colors text-left cursor-pointer"
                  >
                    <act.icon className="w-4 h-4 text-muted-ink" />
                    <span>{act.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {personas.length > 0 && (
            <div>
              <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-ink">
                Creators & Demo Persona Switcher
              </div>
              <div className="space-y-1">
                {personas.map((p) => {
                  const isCurrent = getActiveUserId() === p.id;
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-surface-secondary transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          navigateToProfile(p.username);
                          setOpen(false);
                        }}
                        className="flex items-center gap-2.5 text-left flex-1 min-w-0 cursor-pointer"
                      >
                        <StoryAvatar
                          src={p.avatar_url}
                          alt={p.display_name}
                          size="sm"
                          hasActiveStory={p.has_active_story}
                          hasUnseenStory={p.has_unseen_story}
                          hasCloseFriendStory={p.has_close_friend_story}
                          isOnline={p.is_online}
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-primary-ink truncate">
                            {p.display_name}
                          </div>
                          <div className="text-xs text-muted-ink truncate">
                            @{p.username} • {p.location}
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => switchAccount(p.id, p.username)}
                        disabled={isCurrent}
                        className={
                          isCurrent
                            ? 'px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-[#10B981] flex items-center gap-1'
                            : 'px-2.5 py-1 rounded-full text-[11px] font-semibold bg-surface-elevated border border-divider text-primary-ink hover:border-[#2563EB] cursor-pointer'
                        }
                      >
                        {isCurrent ? (
                          <>
                            <UserCheck className="w-3 h-3" /> Active
                          </>
                        ) : (
                          'Sign in as'
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-divider bg-surface-secondary/50 flex items-center justify-between text-[11px] text-muted-ink">
          <span>Tip: Switch personas to verify Close Friends & Mutuals-only RLS</span>
          <span className="font-mono-tabular">⌘K • Esc</span>
        </div>
      </div>
    </div>
  );
};

