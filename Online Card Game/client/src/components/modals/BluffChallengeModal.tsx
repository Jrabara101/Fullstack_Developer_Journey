import React, { useEffect } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '../ui/Dialog.js';
import { Button } from '../ui/Button.js';
import { ShieldAlert, AlertTriangle, Eye, Flame } from 'lucide-react';
import { CardGameState } from '../../types/game.js';
import { Avatar } from '../ui/Avatar.js';

interface BluffChallengeModalProps {
  gameState: CardGameState;
  onCallBluff: () => void;
  onConcedeBluff: () => void;
  playSiren?: () => void;
}

export const BluffChallengeModal: React.FC<BluffChallengeModalProps> = ({
  gameState,
  onCallBluff,
  onConcedeBluff,
  playSiren
}) => {
  const challenge = gameState.bluffChallenge;
  const isChallengeActive = gameState.phase === 'BLUFF_CHALLENGE' && !!challenge;

  const initiator = challenge
    ? gameState.players.find(p => p.id === challenge.initiatorPlayerId)
    : null;

  const isLocalInitiator = challenge?.initiatorPlayerId === gameState.myPlayerId;
  const timeLeftMs = challenge?.timeLeftMs ?? 5000;
  const totalTimeMs = 5000;
  const progressPercent = Math.max(0, Math.min(100, (timeLeftMs / totalTimeMs) * 100));

  useEffect(() => {
    if (isChallengeActive) {
      playSiren?.();
    }
  }, [isChallengeActive, playSiren]);

  if (!isChallengeActive || !challenge) return null;

  return (
    <Dialog open={isChallengeActive}>
      <div className="flex flex-col items-center text-center p-2">
        {/* Urgent Warning Header */}
        <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center mb-3 animate-pulse shadow-[0_0_30px_rgba(239,35,60,0.8)]">
          <ShieldAlert className="w-9 h-9 text-red-500" />
        </div>

        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-black uppercase tracking-wider text-red-500 font-mono flex items-center justify-center gap-2">
            <Flame className="w-6 h-6 fill-current" />
            BLUFF CHALLENGE!
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-300 font-medium">
            A card was played face down! Is it genuine or an illegal bluff?
          </DialogDescription>
        </DialogHeader>

        {/* Initiator Card Box */}
        <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 p-3 rounded-2xl w-full my-4">
          <Avatar
            src={initiator?.avatarUrl}
            fallback={initiator?.username || 'P'}
            size="md"
          />
          <div className="flex flex-col text-left truncate flex-1">
            <span className="text-sm font-bold text-white truncate">
              {initiator?.username}
            </span>
            <span className="text-xs text-amber-400 font-mono">
              Played Face-Down Card
            </span>
          </div>
          <div className="w-10 h-14 rounded-lg bg-slate-900 border-2 border-amber-500/60 flex items-center justify-center shadow-md">
            <span className="text-[10px] font-black text-amber-400 font-mono">?</span>
          </div>
        </div>

        {/* Dynamic 5-Second Escalating Countdown Bar */}
        <div className="w-full my-2">
          <div className="flex justify-between items-center text-xs font-mono font-bold mb-1.5">
            <span className="text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              WINDOW CLOSING:
            </span>
            <span className="text-xl text-red-400 font-black">
              {(timeLeftMs / 1000).toFixed(1)}s
            </span>
          </div>

          <div className="h-3.5 w-full bg-slate-950 rounded-full border border-red-900/60 overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 rounded-full transition-all duration-200 shadow-[0_0_15px_rgba(239,35,60,0.8)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="w-full mt-6 flex flex-col gap-2.5">
          {isLocalInitiator ? (
            <div className="bg-purple-950/60 border border-purple-500/40 p-4 rounded-2xl text-center">
              <span className="text-sm font-bold text-purple-200 block">
                You laid down the bluff!
              </span>
              <span className="text-xs text-purple-300/80 mt-1 block">
                Hold your breath... If opponents don&apos;t challenge in {(timeLeftMs / 1000).toFixed(0)}s, you get away with it!
              </span>
            </div>
          ) : (
            <>
              <Button
                variant="crimson"
                size="lg"
                onClick={onCallBluff}
                className="w-full text-base font-black tracking-widest uppercase gap-2 py-6 animate-pulse"
              >
                <Eye className="w-6 h-6 stroke-[2.5]" />
                CALL BLUFF! (Catch Them)
              </Button>

              <Button
                variant="ghost"
                onClick={onConcedeBluff}
                className="text-xs text-slate-400 hover:text-white"
              >
                Let it pass / Believe the play
              </Button>
            </>
          )}
        </div>

        {/* Stakes Info Note */}
        <p className="text-[10px] text-slate-400 mt-4 leading-tight font-mono">
          ⚖️ If caught bluffing: Player draws 3 cards & pays 100 chips penalty.
          If falsely accused: Challenger draws 2 cards & pays double ante.
        </p>
      </div>
    </Dialog>
  );
};
