import React, { useState } from 'react';
import { Bookmark, Globe, Lock, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useCollections } from '../../hooks/useSocialQueries';
import { FeedPostCard } from '../feed/FeedPostCard';
import { api } from '../../lib/api';
import { useAppStore } from '../../stores/useAppStore';
import { cn } from '../../lib/utils';

export const BookmarksView: React.FC = () => {
  const { data, isLoading } = useCollections();
  const queryClient = useQueryClient();
  const pushToast = useAppStore((s) => s.pushToast);

  const [activeColId, setActiveColId] = useState<string>('all');
  const [newColName, setNewColName] = useState('');
  const [newColPublic, setNewColPublic] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);

  const collections = data?.collections || [];
  const bookmarks = data?.bookmarks || [];

  const filteredBookmarks =
    activeColId === 'all'
      ? bookmarks
      : bookmarks.filter((b) => b.bookmark_collection_id === activeColId);

  const handleCreateCol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    await api.createCollection(newColName.trim(), newColPublic);
    setNewColName('');
    setShowNewForm(false);
    queryClient.invalidateQueries({ queryKey: ['collections'] });
    pushToast('Created new saved collection', 'emerald');
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-2 pb-24 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
            <Bookmark className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-primary-ink">
              Saved Collections
            </h1>
            <p className="text-xs text-muted-ink">
              Private &amp; public inspiration boards
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowNewForm((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-elevated border border-divider text-xs font-semibold text-primary-ink hover:border-[#2563EB] cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> New Collection
        </button>
      </div>

      {showNewForm && (
        <form
          onSubmit={handleCreateCol}
          className="rounded-2xl border border-divider bg-surface-elevated p-4 flex flex-wrap items-center gap-2.5"
        >
          <input
            value={newColName}
            onChange={(e) => setNewColName(e.target.value)}
            placeholder="Collection name (e.g. Architecture 2026)"
            className="flex-1 min-w-[200px] h-9 rounded-xl bg-surface-secondary border border-divider px-3 text-xs text-primary-ink outline-none"
          />
          <button
            type="button"
            onClick={() => setNewColPublic((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-secondary border border-divider text-xs font-semibold cursor-pointer"
          >
            {newColPublic ? (
              <>
                <Globe className="w-3.5 h-3.5 text-[#10B981]" /> Public
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-muted-ink" /> Private
              </>
            )}
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 rounded-xl bg-[#2563EB] text-white text-xs font-bold cursor-pointer"
          >
            Create
          </button>
        </form>
      )}

      {/* Collection Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveColId('all')}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap cursor-pointer',
            activeColId === 'all'
              ? 'bg-[#2563EB] text-white border-[#2563EB]'
              : 'bg-surface-elevated border-divider text-muted-ink hover:text-primary-ink'
          )}
        >
          All Saved ({bookmarks.length})
        </button>
        {collections.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveColId(c.id)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap cursor-pointer',
              activeColId === c.id
                ? 'bg-[#2563EB] text-white border-[#2563EB]'
                : 'bg-surface-elevated border-divider text-primary-ink hover:border-[#2563EB]'
            )}
          >
            {c.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            <span>
              {c.name} ({c.post_count})
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="p-10 text-center text-xs text-muted-ink">Loading bookmarks...</div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="rounded-2xl border border-divider bg-surface-elevated p-10 text-center text-xs text-muted-ink">
          No saved posts in this collection yet. Click the bookmark icon on any post!
        </div>
      ) : (
        filteredBookmarks.map((p) => <FeedPostCard key={p.id} post={p} />)
      )}
    </div>
  );
};

