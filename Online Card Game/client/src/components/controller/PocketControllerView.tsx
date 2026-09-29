import React, { useState } from 'react';
import { Card, CardColor, CardGameState } from '../../types/game.js';
import { Card3D } from '../3d/Card3D.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import {
  Smartphone,
  EyeOff,
  Play,
  Layers,
  Coins,
  FastForward,
  Flame,
  RotateCw,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils.js';

interface PocketControllerViewProps {
  gameState: CardGameState;
  onPlayCard: (cardId: string, declaredColor?: CardColor, isBluff?: boolean, meldCardIds?: string[]) => void;
  onDrawCard: () => void;
  onPassTurn: () => void;
  onOpenWager: () => void;
  onSendEmote: (emote: 'tomato' | 'chips' | 'slam' | 'fire' | 'clapping') => void;
}

export const PocketControllerView: React.FC<PocketControllerViewProps> = ({
  gameState,
  onPlayCard,
  onDrawCard,
  onPassTurn,
  onOpenWager,
  onSendEmote
}) => {
  const { topDiscard, activeColor, potChips, currentAnte, currentTurnPlayerId, myPlayerId, players, turnTimeRemainingMs } = gameState;
  const localPlayer = players.find(p => p.id === myPlayerId);
  const hand = localPlayer?.hand || [];
  const isMyTurn = currentTurnPlayerId === myPlayerId;
  const isUrgent = isMyTurn && turnTimeRemainingMs < 5000;

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isBluffMode, setIsBluffMode] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingCard, setPendingCard] = useState<Card | null>(null);

  // Haptic feedback trigger
  const triggerHaptic = (ms: number | number[] = 40) => {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(ms);
      } catch (e) {
        // Ignored if unsupported
      }
    }
  };

  const isCardPlayable = (card: Card) => {
    if (!isMyTurn) return false;
    if (isBluffMode) return true;
    if (card.color === 'wild' || card.type === 'wild' || card.type === 'wild_ante') return true;
    if (!topDiscard) return true;
    return card.color === activeColor || card.value === topDiscard.value || (card.type !== 'number' && card.type === topDiscard.type);
  };

  const handlePlaySelected = (card: Card, isBluff: boolean) => {
    triggerHaptic([30, 20, 50]);
    if (card.color === 'wild' || card.type === 'wild' || card.type === 'wild_ante') {
      setPendingCard(card);
      setShowColorPicker(true);
      return;
    }
    onPlayCard(card.id, undefined, isBluff || isBluffMode);
    setSelectedCardId(null);
  };

  const handleColorChoice = (color: CardColor) => {
    triggerHaptic(50);
    if (!pendingCard) return;
    onPlayCard(pendingCard.id, color, isBluffMode);
    setPendingCard(null);
    setShowColorPicker(false);
    setSelectedCardId(null);
  };

  return (
    <div className="w-full min-h-[90vh] max-w-md mx-auto flex flex-col justify-between p-3 select-none pb-8">
      {/* Wild Color Choice Modal */}
      {showColorPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border-2 border-purple-500/80 p-5 rounded-3xl w-full text-center shadow-2xl">
            <h3 className="text-lg font-black text-white font-mono uppercase">Choose Suit</h3>
            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <button
                onClick={() => handleColorChoice('red')}
                className="py-4 rounded-xl bg-red-600 font-black text-white uppercase text-sm"
              >
                Red
              </button>
              <button
                onClick={() => handleColorChoice('blue')}
                className="py-4 rounded-xl bg-blue-600 font-black text-white uppercase text-sm"
              >
                Blue
              </button>
              <button
                onClick={() => handleColorChoice('green')}
                className="py-4 rounded-xl bg-emerald-600 font-black text-white uppercase text-sm"
              >
                Green
              </button>
              <button
                onClick={() => handleColorChoice('yellow')}
                className="py-4 rounded-xl bg-amber-500 font-black text-slate-950 uppercase text-sm"
              >
                Yellow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Controller HUD */}
      <div className={cn(
        'w-full bg-slate-900/90 border-2 rounded-2xl p-3 shadow-lg flex items-center justify-between backdrop-blur-md',
        isMyTurn
          ? isUrgent
            ? 'border-red-500 shadow-red-950/50 animate-pulse'
            : 'border-emerald-500/80 shadow-emerald-950/40'
          : 'border-slate-800'
      )}>
        {/* Table Pot & Ante */}
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1">
            <Coins className="w-3 h-3" /> POT: {potChips}
          </span>
          <span className="text-xs font-bold text-slate-300 font-mono">
            Ante: {currentAnte} chips
          </span>
        </div>

        {/* Turn Status Badge */}
        <div className="flex flex-col items-center">
          <Badge
            variant={isMyTurn ? (isUrgent ? "destructive" : "felt") : "secondary"}
            className="text-xs font-black uppercase tracking-wider px-3 py-1 font-mono"
          >
            {isMyTurn ? `YOUR TURN (${(turnTimeRemainingMs / 1000).toFixed(0)}s)` : 'WAITING...'}
          </Badge>
        </div>

        {/* Active Discard Mini-Summary */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col text-right">
            <span className="text-[9px] uppercase font-bold text-slate-400">ACTIVE</span>
            <span className="text-xs font-black uppercase font-mono text-white">
              {activeColor}
            </span>
          </div>
          <div className={cn(
            'w-4 h-4 rounded-full border-2',
            activeColor === 'red' && 'bg-red-500 border-red-300',
            activeColor === 'blue' && 'bg-blue-500 border-blue-300',
            activeColor === 'green' && 'bg-emerald-500 border-emerald-300',
            activeColor === 'yellow' && 'bg-amber-400 border-amber-200',
            activeColor === 'wild' && 'bg-purple-500 border-purple-300'
          )} />
        </div>
      </div>

      {/* Pocket Hand Viewport (Horizontal Scrollable Arc) */}
      <div className="w-full my-auto py-6">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            Your Hand ({hand.length} Cards)
          </span>
          <span className="text-[10px] text-amber-400 font-mono">
            Balance: {localPlayer?.chips} Chips
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 pt-2 px-2 scrollbar-none perspective-800 items-center min-h-[190px]">
          {hand.map((card) => {
            const playable = isCardPlayable(card);
            const isSelected = selectedCardId === card.id;

            return (
              <div
                key={card.id}
                onClick={() => {
                  triggerHaptic(25);
                  setSelectedCardId(card.id);
                }}
                className={cn(
                  'shrink-0 transition-transform duration-200',
                  isSelected && '-translate-y-4 scale-105'
                )}
              >
                <Card3D
                  card={card}
                  isPlayable={playable}
                  isSelectedForMeld={isSelected}
                  onPlay={(c, bluff) => handlePlaySelected(c, bluff)}
                  interactive={true}
                  size="sm"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Thumb-Accessible Action Triggers */}
      <div className="flex flex-col gap-2.5 w-full">
        {/* Row 1: Bluff Toggle & Play */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={isBluffMode ? "crimson" : "outline"}
            onClick={() => {
              triggerHaptic(40);
              setIsBluffMode(prev => !prev);
            }}
            className="h-14 font-black uppercase text-xs tracking-wider gap-2 rounded-2xl"
          >
            <EyeOff className="w-5 h-5" />
            {isBluffMode ? "Bluff ARMED" : "Face-Down Bluff"}
          </Button>

          <Button
            variant={isMyTurn && selectedCardId ? "felt" : "secondary"}
            disabled={!isMyTurn || !selectedCardId}
            onClick={() => {
              if (selectedCardId) {
                const card = hand.find(c => c.id === selectedCardId);
                if (card) handlePlaySelected(card, isBluffMode);
              }
            }}
            className="h-14 font-black uppercase text-xs tracking-wider gap-2 rounded-2xl"
          >
            <Play className="w-5 h-5 fill-current" />
            Play Card
          </Button>
        </div>

        {/* Row 2: Draw Card & Wager */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            disabled={!isMyTurn}
            onClick={() => {
              triggerHaptic(30);
              onDrawCard();
            }}
            className="h-12 border-amber-500/50 text-amber-300 font-bold text-xs uppercase tracking-wider gap-2 rounded-xl"
          >
            <Layers className="w-4 h-4" />
            Draw (+1)
          </Button>

          <Button
            variant="gold"
            onClick={() => {
              triggerHaptic(30);
              onOpenWager();
            }}
            className="h-12 font-black text-xs uppercase tracking-wider gap-2 rounded-xl"
          >
            <Coins className="w-4 h-4" />
            Wager Ante
          </Button>
        </div>

        {/* Row 3: Quick Emote Bar & Pass */}
        <div className="flex items-center justify-between gap-1.5 pt-1">
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-2 py-1">
            <button
              onClick={() => { triggerHaptic(20); onSendEmote('tomato'); }}
              className="text-lg hover:scale-125 active:scale-95 transition"
              title="Throw Tomato"
            >
              🍅
            </button>
            <button
              onClick={() => { triggerHaptic(20); onSendEmote('chips'); }}
              className="text-lg hover:scale-125 active:scale-95 transition"
              title="Clink Chips"
            >
              🪙
            </button>
            <button
              onClick={() => { triggerHaptic(50); onSendEmote('slam'); }}
              className="text-lg hover:scale-125 active:scale-95 transition"
              title="Slam Table"
            >
              💥
            </button>
            <button
              onClick={() => { triggerHaptic(20); onSendEmote('fire'); }}
              className="text-lg hover:scale-125 active:scale-95 transition"
              title="Fire"
            >
              🔥
            </button>
          </div>

          <Button
            size="sm"
            variant="ghost"
            disabled={!isMyTurn}
            onClick={() => {
              triggerHaptic(20);
              onPassTurn();
            }}
            className="text-xs text-slate-400 hover:text-white"
          >
            <FastForward className="w-3.5 h-3.5 mr-1" />
            Pass Turn
          </Button>
        </div>
      </div>
    </div>
  );
};
