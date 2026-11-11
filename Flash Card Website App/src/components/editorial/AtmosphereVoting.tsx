import React, { useState } from 'react';
import { ThumbsUp, Music, MessageSquare, Plus, Check } from 'lucide-react';
import { VotingItem } from '../../types/editorial';
import { sounds } from '../../services/soundEffects';

interface AtmosphereVotingProps {
  items: VotingItem[];
  themeType: 'wedding' | 'birthday' | 'conference';
}

export const AtmosphereVoting: React.FC<AtmosphereVotingProps> = ({
  items: initialItems,
  themeType,
}) => {
  const [items, setItems] = useState<VotingItem[]>(initialItems);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Guest Choice');

  const isConference = themeType === 'conference';

  const handleVote = (id: string) => {
    sounds.playCardSnap();
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const hasVoted = item.hasUserVoted;
          return {
            ...item,
            votes: hasVoted ? item.votes - 1 : item.votes + 1,
            hasUserVoted: !hasVoted,
          };
        }
        return item;
      })
    );
  };

  const handleAddSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: VotingItem = {
      id: `vote-${Date.now()}`,
      title: newTitle.trim(),
      submittedBy: 'You',
      votes: 1,
      category: newCategory || 'Guest Request',
      hasUserVoted: true,
    };

    setItems([newItem, ...items]);
    sounds.playMasteredSound();
    setNewTitle('');
  };

  const sortedItems = [...items].sort((a, b) => b.votes - a.votes);

  return (
    <section className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-amber-700 font-bold block">
            CROWD-SOURCED ATMOSPHERE
          </span>
          <h3 className="text-2xl font-serif text-stone-900 mt-1">
            {isConference ? 'Panel Q&A Topic Voting' : 'Reception DJ Playlist Voting'}
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-lg">
            {isConference
              ? 'Upvote pressing questions for keynote speakers and AI panel sessions.'
              : 'Suggest songs and upvote your favorite anthems for the late-night dance floor.'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-xs font-mono">
          {isConference ? <MessageSquare className="w-3.5 h-3.5 text-indigo-600" /> : <Music className="w-3.5 h-3.5 text-amber-600" />}
          <span>{items.length} Submissions</span>
        </div>
      </div>

      {/* Suggestion Submission Form */}
      <form onSubmit={handleAddSubmission} className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder={
            isConference
              ? 'Propose a topic or question for the AI Systems panel...'
              : 'Suggest a track for the reception DJ playlist (Song — Artist)...'
          }
          className="flex-1 px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800"
        />

        <button
          type="submit"
          disabled={!newTitle.trim()}
          className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{isConference ? 'Submit Topic' : 'Add Track'}</span>
        </button>
      </form>

      {/* Upvoting List */}
      <div className="space-y-3">
        {sortedItems.map((item, idx) => (
          <div
            key={item.id}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
              item.hasUserVoted
                ? 'bg-amber-50/60 border-amber-300 shadow-2xs'
                : 'bg-white border-stone-200/90 shadow-2xs hover:border-stone-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-stone-400 w-5 text-right">
                #{idx + 1}
              </span>

              <div>
                <div className="text-xs font-semibold text-stone-900 font-serif sm:text-sm">
                  {item.title}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-stone-400 font-mono">
                  <span>Category: {item.category}</span>
                  <span>•</span>
                  <span>Submitted by: {item.submittedBy}</span>
                </div>
              </div>
            </div>

            {/* Upvote Pill Button */}
            <button
              onClick={() => handleVote(item.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                item.hasUserVoted
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${item.hasUserVoted ? 'fill-white' : ''}`} />
              <span>{item.votes}</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

