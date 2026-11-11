import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Copy,
  GitFork,
  Flame,
  Award,
  Play,
  Share2,
  Check,
  Eye,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Deck, CrunchRoomParticipant } from '../../types/flashcards';
import { sounds } from '../../services/soundEffects';

interface MultiplayerCrunchRoomProps {
  deck: Deck;
  onForkDeck: (deck: Deck) => void;
}

const INITIAL_PEERS: CrunchRoomParticipant[] = [
  {
    id: 'user-self',
    name: 'You (Studying)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    score: 320,
    streak: 3,
    isCurrentUser: true,
    status: 'ready',
  },
  {
    id: 'peer-elena',
    name: 'Elena Vance',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    score: 410,
    streak: 4,
    status: 'streak_fire',
  },
  {
    id: 'peer-marcus',
    name: 'Dr. Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    score: 380,
    streak: 2,
    status: 'ready',
  },
  {
    id: 'peer-alex',
    name: 'Alex Chen',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
    score: 290,
    streak: 1,
    status: 'answering',
  },
];

export const MultiplayerCrunchRoom: React.FC<MultiplayerCrunchRoomProps> = ({
  deck,
  onForkDeck,
}) => {
  const [roomCode] = useState<string>('CRUNCH-8842');
  const [participants, setParticipants] = useState<CrunchRoomParticipant[]>(INITIAL_PEERS);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isForked, setIsForked] = useState<boolean>(false);
  const [isRoomActive, setIsRoomActive] = useState<boolean>(false);
  const [roundSeconds, setRoundSeconds] = useState<number>(15);
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);
  const [hasAnsweredRound, setHasAnsweredRound] = useState<boolean>(false);

  const roundTimerRef = useRef<number | null>(null);
  const card = deck.cards[cardIndex % deck.cards.length];

  const handleCopyLink = () => {
    const url = `${window.location.origin}/crunch/${roomCode}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setIsCopied(true);
    sounds.playCardSnap();
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleFork = () => {
    onForkDeck(deck);
    setIsForked(true);
    sounds.playMasteredSound();
    confetti({ particleCount: 40, spread: 60 });
    setTimeout(() => setIsForked(false), 3000);
  };

  const startLiveRoom = () => {
    setIsRoomActive(true);
    setCardIndex(0);
    setRoundSeconds(15);
    setIsCardFlipped(false);
    setHasAnsweredRound(false);
    sounds.playMasteredSound();
  };

  // Live round countdown loop & simulated peer answering
  useEffect(() => {
    if (!isRoomActive) return;

    roundTimerRef.current = window.setInterval(() => {
      setRoundSeconds((prev) => {
        if (prev <= 1) {
          // Round finished: simulate peer score updates & next card
          setParticipants((oldPeers) =>
            oldPeers
              .map((p) => {
                if (!p.isCurrentUser) {
                  const gained = Math.random() > 0.25 ? 100 : 0;
                  const newStreak = gained > 0 ? p.streak + 1 : 0;
                  const statusVal: 'answering' | 'ready' | 'streak_fire' = newStreak >= 3 ? 'streak_fire' : 'ready';
                  return {
                    ...p,
                    score: p.score + gained,
                    streak: newStreak,
                    status: statusVal,
                  };
                }
                return p;
              })
              .sort((a, b) => b.score - a.score)
          );

          // Advance to next card
          setCardIndex((c) => (c + 1) % deck.cards.length);
          setIsCardFlipped(false);
          setHasAnsweredRound(false);
          sounds.playCardFlip();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (roundTimerRef.current) clearInterval(roundTimerRef.current);
    };
  }, [isRoomActive, deck.cards.length]);

  const submitUserAnswer = (correct: boolean) => {
    if (hasAnsweredRound) return;
    setHasAnsweredRound(true);
    setIsCardFlipped(true);

    if (correct) {
      sounds.playMasteredSound();
      setParticipants((old) =>
        old
          .map((p) => {
            if (p.isCurrentUser) {
              const gained = 100 + roundSeconds * 10;
              const statusVal: 'answering' | 'ready' | 'streak_fire' = 'ready';
              return {
                ...p,
                score: p.score + gained,
                streak: p.streak + 1,
                status: statusVal,
              };
            }
            return p;
          })
          .sort((a, b) => b.score - a.score)
      );
    } else {
      sounds.playCardSnap();
      setParticipants((old) =>
        old.map((p) => (p.isCurrentUser ? { ...p, streak: 0, status: 'ready' as const } : p))
      );
    }
  };

  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner with Room Code, Share URL & Fork Deck */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-100 text-rose-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              LIVE CRUNCH ROOM
            </span>
            <span className="text-xs font-mono text-stone-500">#{roomCode}</span>
          </div>
          <h2 className="text-xl font-bold text-stone-900 mt-1">{deck.title}</h2>
          <p className="text-xs text-stone-500">
            Synchronized live race with real-time peer leaderboard. Test your active recall under timed pressure!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{isCopied ? 'Link Copied!' : 'Share Room Link'}</span>
          </button>

          <button
            onClick={handleFork}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <GitFork className="w-4 h-4 text-indigo-600" />
            <span>{isForked ? 'Deck Forked to Library!' : 'Fork Deck'}</span>
          </button>
        </div>
      </div>

      {/* Main Study Arena or Lobby */}
      {!isRoomActive ? (
        <div className="p-12 text-center bg-stone-50 rounded-3xl border border-dashed border-stone-300 space-y-4">
          <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-stone-900">4 Participants Connected in Lobby</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Elena Vance, Dr. Marcus Vance, Alex Chen, and You are ready to start. Each round lasts 15 seconds. Points are rewarded for speed and streak consistency.
          </p>
          <button
            onClick={startLiveRoom}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Live Crunch Session</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card Racing Arena (2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Live Round Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="text-xs font-mono font-bold text-stone-500">
                ROUND {cardIndex + 1} OF {deck.cards.length}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-600">Round Clock:</span>
                <span
                  className={`font-mono text-base font-extrabold px-3 py-0.5 rounded-full ${
                    roundSeconds <= 5
                      ? 'bg-rose-100 text-rose-600 animate-pulse'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {roundSeconds}s
                </span>
              </div>
            </div>

            {/* Timed Live Card */}
            <div
              onClick={() => {
                sounds.playCardFlip();
                setIsCardFlipped(!isCardFlipped);
              }}
              className={`p-8 rounded-3xl border-2 transition-all min-h-[260px] flex flex-col justify-between cursor-pointer select-none shadow-sm ${
                isCardFlipped
                  ? 'bg-emerald-50/50 border-emerald-300'
                  : 'bg-white border-stone-200 hover:border-indigo-400'
              }`}
            >
              <div className="text-xs font-mono uppercase tracking-wider text-stone-400 font-bold flex items-center justify-between">
                <span>{isCardFlipped ? 'REVEALED ANSWER' : 'SYNCHRONIZED QUESTION'}</span>
                <span className="flex items-center gap-1 text-stone-400">
                  <Eye className="w-3.5 h-3.5" /> Tap to toggle
                </span>
              </div>

              <div className="py-4 text-xl font-bold text-stone-900 leading-snug">
                {isCardFlipped ? card.back : card.front}
              </div>

              <div className="text-xs text-stone-400 font-mono flex items-center justify-between">
                <span>Speed bonus active: +{roundSeconds * 10} pts</span>
                <span>{hasAnsweredRound ? '✓ Round Answer Submitted' : 'Choose your outcome below'}</span>
              </div>
            </div>

            {/* Answer buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => submitUserAnswer(false)}
                disabled={hasAnsweredRound}
                className="py-3 rounded-2xl bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 font-bold text-xs border border-stone-200 transition-all cursor-pointer disabled:opacity-40"
              >
                Missed / Forgotten (0 pts)
              </button>

              <button
                onClick={() => submitUserAnswer(true)}
                disabled={hasAnsweredRound}
                className="py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-40"
              >
                Recall Mastered (+{100 + roundSeconds * 10} pts)
              </button>
            </div>
          </div>

          {/* Live Leaderboard (1 Column) */}
          <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-stone-900">Live Room Leaderboard</h3>
              </div>
              <span className="text-[10px] font-mono text-stone-400 uppercase">Updating</span>
            </div>

            <div className="space-y-2.5">
              {sortedParticipants.map((p, idx) => (
                <div
                  key={p.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                    p.isCurrentUser
                      ? 'bg-indigo-50/80 border-indigo-200 ring-2 ring-indigo-500/20'
                      : 'bg-stone-50 border-stone-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                        idx === 0
                          ? 'bg-amber-400 text-amber-950'
                          : idx === 1
                          ? 'bg-stone-300 text-stone-800'
                          : idx === 2
                          ? 'bg-amber-700 text-amber-100'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {idx + 1}
                    </span>

                    <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover" />

                    <div>
                      <div className="text-xs font-bold text-stone-900 flex items-center gap-1">
                        <span>{p.name}</span>
                        {p.streak >= 3 && (
                          <span className="text-amber-500 text-[10px] font-mono font-bold flex items-center">
                            <Flame className="w-3 h-3 fill-amber-500" />
                            {p.streak}x
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-stone-400 font-mono">
                        {p.isCurrentUser ? 'Active participant' : 'Real-time peer'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-sm font-extrabold text-stone-900">{p.score}</span>
                    <span className="block text-[9px] text-stone-400 font-mono">PTS</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
