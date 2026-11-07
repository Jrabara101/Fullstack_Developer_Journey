import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FileText, Bookmark, MessageSquare, Scissors, 
  Search, ArrowUpRight, ThumbsUp, Send, Clock, Play, 
  Plus, Check, Trash2, Share2, Sparkles
} from 'lucide-react';
import { Video, TranscriptSegment, VideoChapter, TimedComment, UserNote, VideoClip } from '../../types/video';

interface InteractiveTranscriptAndDiscourseRailProps {
  video: Video;
  currentTime: number;
  onSeek: (seconds: number) => void;
  onSearchMatchesChange: (timestampsMs: number[]) => void;
  onOpenClipModal: () => void;
}

export const InteractiveTranscriptAndDiscourseRail: React.FC<InteractiveTranscriptAndDiscourseRailProps> = ({
  video,
  currentTime,
  onSeek,
  onSearchMatchesChange,
  onOpenClipModal
}) => {
  const [activeTab, setActiveTab] = useState<'transcript' | 'chapters' | 'comments' | 'notes'>('transcript');
  
  // Transcript search state
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [autoScrollSync, setAutoScrollSync] = useState(true);
  const transcriptContainerRef = useRef<HTMLDivElement | null>(null);
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  // Comments state
  const [commentsList, setCommentsList] = useState<TimedComment[]>(video.comments || []);
  const [newCommentText, setNewCommentText] = useState('');
  const [lockToCurrentTime, setLockToCurrentTime] = useState(true);

  // Personal notes state
  const [notesList, setNotesList] = useState<UserNote[]>([
    {
      id: 'n-1',
      videoId: video.id,
      timestampMs: 148000,
      content: 'Important: SHA-256 multipart verification prevents silent S3 corruption.',
      createdAt: 'Just now'
    }
  ]);
  const [newNoteText, setNewNoteText] = useState('');

  // Current time in milliseconds
  const currentMs = currentTime * 1000;

  // Format mm:ss helper
  const formatTimecode = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Filtered transcript & search matches calculation
  const { filteredTranscript, searchMatchTimestamps } = useMemo(() => {
    if (!video.transcript) return { filteredTranscript: [], searchMatchTimestamps: [] };
    if (!transcriptSearch.trim()) {
      return { 
        filteredTranscript: video.transcript, 
        searchMatchTimestamps: [] 
      };
    }

    const query = transcriptSearch.toLowerCase();
    const matches: TranscriptSegment[] = [];
    const timestamps: number[] = [];

    for (const segment of video.transcript) {
      if (
        segment.textContent.toLowerCase().includes(query) || 
        segment.speakerLabel?.toLowerCase().includes(query)
      ) {
        matches.push(segment);
        timestamps.push(segment.startMs);
      }
    }

    return { filteredTranscript: matches, searchMatchTimestamps: timestamps };
  }, [video.transcript, transcriptSearch]);

  // Notify parent of search matches for timeline pin dots
  useEffect(() => {
    onSearchMatchesChange(searchMatchTimestamps);
  }, [searchMatchTimestamps, onSearchMatchesChange]);

  // Auto-scroll transcript container to active spoken sentence
  useEffect(() => {
    if (autoScrollSync && activeLineRef.current && activeTab === 'transcript') {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentTime, autoScrollSync, activeTab]);

  // Handle post new comment
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: TimedComment = {
      id: `c-local-${Date.now()}`,
      videoId: video.id,
      userId: 'current-user',
      userName: 'You (Software Engineer)',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      timestampMs: lockToCurrentTime ? Math.floor(currentMs) : 0,
      body: newCommentText.trim(),
      upvotesCount: 1,
      createdAt: 'Just now'
    };

    setCommentsList([newComment, ...commentsList]);
    setNewCommentText('');
  };

  // Handle add note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote: UserNote = {
      id: `n-${Date.now()}`,
      videoId: video.id,
      timestampMs: Math.floor(currentMs),
      content: newNoteText.trim(),
      createdAt: 'Just now'
    };

    setNotesList([newNote, ...notesList]);
    setNewNoteText('');
  };

  // Global keydown shortcut 'N' for dropping a quick timestamped note
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.key === 'n' || e.key === 'N') {
        setActiveTab('notes');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-full h-[620px] rounded-2xl border border-white/10 bg-[#101217] flex flex-col overflow-hidden shadow-2xl relative">
      {/* Segmented Header Navigation Tabs */}
      <div className="p-1.5 bg-black/50 border-b border-white/10 grid grid-cols-4 text-xs font-semibold select-none">
        <button
          onClick={() => setActiveTab('transcript')}
          className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 transition ${
            activeTab === 'transcript' ? 'bg-white/15 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText size={13} />
          <span>Transcript</span>
        </button>

        <button
          onClick={() => setActiveTab('chapters')}
          className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 transition ${
            activeTab === 'chapters' ? 'bg-white/15 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bookmark size={13} />
          <span>Chapters ({video.chapters?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 transition ${
            activeTab === 'comments' ? 'bg-white/15 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare size={13} />
          <span>Comments ({commentsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 transition ${
            activeTab === 'notes' ? 'bg-white/15 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Scissors size={13} />
          <span>Notes & Clips</span>
        </button>
      </div>

      {/* TAB 1: INTERACTIVE TRANSCRIPT WITH REAL-TIME SYNC & SEARCH */}
      {activeTab === 'transcript' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Transcript Search Bar */}
          <div className="p-3 border-b border-white/10 bg-[#12151c]/60 flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search spoken dialogue (e.g., 'chunked', 'ladder')..."
                value={transcriptSearch}
                onChange={(e) => setTranscriptSearch(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
              {transcriptSearch && (
                <button
                  onClick={() => setTranscriptSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white px-1 bg-white/10 rounded"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Auto-Scroll Toggle Button */}
            <button
              onClick={() => setAutoScrollSync(!autoScrollSync)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border flex items-center gap-1 transition ${
                autoScrollSync 
                  ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
              title="Automatically keep currently spoken sentence centered"
            >
              <ArrowUpRight size={12} className={autoScrollSync ? 'animate-bounce' : ''} />
              <span>Sync</span>
            </button>
          </div>

          {/* Search Hits Counter Banner */}
          {transcriptSearch && (
            <div className="px-3 py-1.5 bg-amber-500/10 border-b border-amber-500/20 text-[11px] text-amber-300 flex items-center justify-between">
              <span>{filteredTranscript.length} dialogue matches found</span>
              <span className="font-mono text-[10px] text-amber-400">Marked on timeline</span>
            </div>
          )}

          {/* Scrollable Transcript Rows */}
          <div 
            ref={transcriptContainerRef}
            className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-white/5"
            onScroll={() => {
              // If user scrolls manually away, we allow them to explore freely
            }}
          >
            {filteredTranscript.map((segment) => {
              const isActive = currentMs >= segment.startMs && currentMs <= segment.endMs;
              return (
                <div
                  key={segment.id}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => onSeek(segment.startMs / 1000)}
                  className={`pt-2.5 first:pt-0 group/line cursor-pointer rounded-xl p-2 transition ${
                    isActive 
                      ? 'bg-indigo-600/15 border-l-2 border-indigo-400 text-white shadow-sm' 
                      : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono tabular-nums text-[11px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 group-hover/line:bg-indigo-600 group-hover/line:text-white transition">
                      {formatTimecode(segment.startMs)}
                    </span>
                    {segment.speakerLabel && (
                      <span className="text-[10px] font-semibold text-slate-400 tracking-wide">
                        {segment.speakerLabel}
                      </span>
                    )}
                  </div>

                  {/* Sentence with Word-by-Word Active Highlighting */}
                  <p className="text-xs leading-relaxed">
                    {segment.words ? (
                      segment.words.map((w, wIdx) => {
                        const isWordActive = currentMs >= w.startMs && currentMs <= w.endMs;
                        return (
                          <span
                            key={wIdx}
                            className={`inline-block mr-1 transition-colors ${
                              isWordActive 
                                ? 'bg-amber-400/40 text-white font-bold px-1 rounded shadow' 
                                : isActive 
                                  ? 'text-white' 
                                  : 'text-slate-300'
                            }`}
                          >
                            {w.text}
                          </span>
                        );
                      })
                    ) : (
                      segment.textContent
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CHAPTERS LIST VIEW */}
      {activeTab === 'chapters' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {video.chapters?.map((ch, idx) => {
            const isChapterActive = currentMs >= ch.startMs && currentMs <= ch.endMs;
            const chapterDuration = formatTimecode(ch.endMs - ch.startMs);
            return (
              <div
                key={ch.id}
                onClick={() => onSeek(ch.startMs / 1000)}
                className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                  isChapterActive 
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow' 
                    : 'bg-white/5 border-white/5 hover:border-white/20 text-slate-300'
                }`}
              >
                {/* Thumbnail Preview */}
                <div className="w-16 h-10 rounded-lg overflow-hidden bg-black/60 relative shrink-0">
                  <img 
                    src={ch.thumbnailUrl || video.posterUrl} 
                    alt={ch.title}
                    className="w-full h-full object-cover" 
                  />
                  {isChapterActive && (
                    <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center">
                      <Play size={12} fill="white" className="text-white ml-0.5" />
                    </div>
                  )}
                </div>

                {/* Chapter Metadata */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-indigo-400 font-bold">
                      CH {idx + 1}
                    </span>
                    <span className="text-[10px] font-mono tabular-nums text-slate-400">
                      {formatTimecode(ch.startMs)}
                    </span>
                  </div>
                  <h4 className="text-xs font-medium text-slate-200 truncate mt-0.5">
                    {ch.title}
                  </h4>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Duration: {chapterDuration}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: TIMED COMMENTS & TIMELINE PIN DISCOURSE */}
      {activeTab === 'comments' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Scrollable Comments Stream */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {commentsList.map((comm) => (
              <div 
                key={comm.id}
                className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 transition space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img 
                      src={comm.userAvatar} 
                      alt={comm.userName}
                      className="w-6 h-6 rounded-full object-cover border border-white/20" 
                    />
                    <span className="text-xs font-semibold text-slate-200">{comm.userName}</span>
                    {comm.isCreatorPinned && (
                      <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[9px] rounded font-semibold border border-amber-500/30">
                        PINNED
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{comm.createdAt}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pl-8">
                  {comm.body}
                </p>

                {/* Action Bar with Clickable Timestamp Chip */}
                <div className="flex items-center justify-between pl-8 pt-1">
                  {comm.timestampMs > 0 && (
                    <button
                      onClick={() => onSeek(comm.timestampMs / 1000)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono font-medium transition"
                    >
                      <Clock size={10} />
                      <span>▶ {formatTimecode(comm.timestampMs)}</span>
                    </button>
                  )}

                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <button 
                      onClick={() => {
                        setCommentsList(commentsList.map(c => c.id === comm.id ? { ...c, upvotesCount: c.upvotesCount + 1 } : c));
                      }}
                      className="flex items-center gap-1 hover:text-white transition"
                    >
                      <ThumbsUp size={12} />
                      <span className="text-[11px] font-mono">{comm.upvotesCount}</span>
                    </button>
                  </div>
                </div>

                {/* Nested Creator Reply if available */}
                {comm.replies && comm.replies.map(rep => (
                  <div key={rep.id} className="ml-8 mt-2 p-2.5 rounded-lg bg-black/40 border-l-2 border-indigo-500 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300 mb-1">
                      <span>{rep.userName}</span>
                    </div>
                    <p className="text-[11px] text-slate-300">{rep.body}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Pinned Bottom Comment Composer */}
          <form onSubmit={handlePostComment} className="p-3 border-t border-white/10 bg-black/60">
            <div className="flex items-center justify-between mb-1.5">
              <button
                type="button"
                onClick={() => setLockToCurrentTime(!lockToCurrentTime)}
                className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full flex items-center gap-1 transition ${
                  lockToCurrentTime 
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' 
                    : 'bg-white/10 text-slate-400'
                }`}
              >
                <span>📌 Pinned @ {formatTimecode(currentMs)}</span>
              </button>
              <span className="text-[10px] text-slate-500">Press Enter to post</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask a question or comment at this exact moment..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition"
              >
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: PERSONAL NOTES & DEEP-LINKED CLIP SNIPPER */}
      {activeTab === 'notes' && (
        <div className="flex-1 flex flex-col overflow-hidden p-3 space-y-3">
          {/* Clip Snipper CTA Banner */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-900/40 to-violet-900/30 border border-indigo-500/30 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Scissors size={14} className="text-indigo-400" />
                <span>Deep-Linked Clip Snipper</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Trim a highlight segment to auto-loop & share with peers.
              </p>
            </div>
            <button
              onClick={onOpenClipModal}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow"
            >
              Snip Clip
            </button>
          </div>

          {/* Quick Note Input */}
          <form onSubmit={handleAddNote} className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono">Drop Note @ {formatTimecode(currentMs)} (or press 'N')</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Write a private study note..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
              <button
                type="submit"
                disabled={!newNoteText.trim()}
                className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 text-xs text-white font-medium transition flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Add</span>
              </button>
            </div>
          </form>

          {/* Saved Notes Stream */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {notesList.map((note) => (
              <div 
                key={note.id}
                className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 transition flex items-start justify-between gap-3"
              >
                <div className="flex-1">
                  <button
                    onClick={() => onSeek(note.timestampMs / 1000)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-600/20 text-indigo-300 font-mono text-[10px] mb-1.5 hover:bg-indigo-600/40 transition"
                  >
                    <Clock size={10} />
                    <span>{formatTimecode(note.timestampMs)}</span>
                  </button>
                  <p className="text-xs text-slate-200 leading-relaxed">{note.content}</p>
                </div>
                <button
                  onClick={() => setNotesList(notesList.filter(n => n.id !== note.id))}
                  className="text-slate-500 hover:text-red-400 transition p-1"
                  title="Delete note"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
