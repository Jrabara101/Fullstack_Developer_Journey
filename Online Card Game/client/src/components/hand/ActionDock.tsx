import React, { useState } from 'react';
import { Card, CardColor, CardGameState } from '../../types/game.js';
import { Card3D } from '../3d/Card3D.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { EyeOff, Play, Layers, Sparkles, Coins, FastForward, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils.js';

interface ActionDockProps {
  gameState: CardGameState;
  onPlayCard: (cardId: string, declaredColor?: CardColor, isBluff?: boolean, meldCardIds?: string[]) => void;
  onDrawCard: () => void;
  onPassTurn: () => void;
  onOpenWager: () => void;
  className?: string;
}

export const ActionDock: React.FC<ActionDockProps> = ({
  gameState,
  onPlayCard,
  onDrawCard,
  onPassTurn,
  onOpenWager,
  className
}) => {
  const { topDiscard, activeColor, currentTurnPlayerId, myPlayerId, players } = gameState;
  const localPlayer = players.find(p => p.id === myPlayerId);
  const hand = localPlayer?.hand || [];

  const isMyTurn = currentTurnPlayerId === myPlayerId;

  // Selected card(s) state
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [meldCardIds, setMeldCardIds] = useState<string[]>([]);
  const [isBluffMode, setIsBluffMode] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingCardToPlay, setPendingCardToPlay] = useState<Card | null>(null);

  // Check legality of a card
  const isCardPlayable = (card: Card) => {
    if (!isMyTurn) return false;
    if (isBluffMode) return true; // Can play any card in bluff mode face down
    if (card.color === 'wild' || card.type === 'wild' || card.type === 'wild_ante') return true;
    if (!topDiscard) return true;
    return card.color === activeColor || card.value === topDiscard.value || (card.type !== 'number' && card.type === topDiscard.type);
  };

  // Toggle selection for Poker-Uno Meld
  const handleToggleMeld = (cardId: string) => {
    setMeldCardIds(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId);
      } else {
        return [...prev, cardId];
      }
    });
    setSelectedCardId(cardId);
  };

  const handleCardClickOrFlick = (card: Card, isBluff: boolean) => {
    if (!isMyTurn) return;

    if (card.color === 'wild' || card.type === 'wild' || card.type === 'wild_ante') {
      setPendingCardToPlay(card);
      setShowColorPicker(true);
      return;
    }

    const extraMelds = meldCardIds.filter(id => id !== card.id);
    onPlayCard(card.id, undefined, isBluff || isBluffMode, extraMelds.length > 0 ? meldCardIds : undefined);
    setSelectedCardId(null);
    setMeldCardIds([]);
  };

  const handleColorSelected = (color: CardColor) => {
    if (!pendingCardToPlay) return;
    const extraMelds = meldCardIds.filter(id => id !== pendingCardToPlay.id);
    onPlayCard(pendingCardToPlay.id, color, isBluffMode, extraMelds.length > 0 ? meldCardIds : undefined);
    setPendingCardToPlay(null);
    setShowColorPicker(false);
    setSelectedCardId(null);
    setMeldCardIds([]);
  };

  // Fan spreading calculations
  const count = hand.length;
  const maxSpan = Math.min(50, count * 7);
  const angleStep = count > 1 ? maxSpan / (count - 1) : 0;
  const offsetStep = count > 1 ? Math.min(38, 550 / count) : 0;

  return (
    <div className={cn('relative w-full flex flex-col items-center select-none pt-4 pb-2', className)}>
      {/* Wild Color Selection Overlay Modal */}
      {showColorPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border-2 border-purple-500/60 p-6 rounded-3xl max-w-sm w-full text-center shadow-2xl">
            <h3 className="text-xl font-black text-white tracking-wide uppercase font-mono">
              Declare Suit Color
            </h3>
            <p className="text-xs text-slate-300 mt-1 mb-5">
              Choose the active color to control the table flow!
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleColorSelected('red')}
                className="h-16 rounded-2xl bg-gradient-to-br from-red-600 to-rose-800 font-extrabold text-white text-base tracking-widest uppercase shadow-lg shadow-red-900/50 hover:scale-105 active:scale-95 transition"
              >
                Crimson Red
              </button>
              <button
                onClick={() => handleColorSelected('blue')}
                className="h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-800 font-extrabold text-white text-base tracking-widest uppercase shadow-lg shadow-blue-900/50 hover:scale-105 active:scale-95 transition"
              >
                Sapphire Blue
              </button>
              <button
                onClick={() => handleColorSelected('green')}
                className="h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 font-extrabold text-white text-base tracking-widest uppercase shadow-lg shadow-emerald-900/50 hover:scale-105 active:scale-95 transition"
              >
                Emerald Green
              </button>
              <button
                onClick={() => handleColorSelected('yellow')}
                className="h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 font-extrabold text-slate-950 text-base tracking-widest uppercase shadow-lg shadow-amber-500/40 hover:scale-105 active:scale-95 transition"
              >
                Amber Gold
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Card Meld Indicator Bar (if multiple cards selected) */}
      {meldCardIds.length >= 2 && (
        <div className="mb-2 bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 border border-amber-400/50 px-5 py-2 rounded-full flex items-center gap-3 backdrop-blur-md animate-bounce shadow-lg">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span className="text-xs font-black text-amber-200 uppercase tracking-wider font-mono">
            {meldCardIds.length}-Card Poker Meld Selected
          </span>
          <Button
            size="sm"
            variant="gold"
            onClick={() => {
              const mainId = meldCardIds[0];
              const card = hand.find(c => c.id === mainId);
              if (card) handleCardClickOrFlick(card, isBluffMode);
            }}
            className="h-7 text-xs font-black px-3"
          >
            Play Combo
          </Button>
          <button
            onClick={() => setMeldCardIds([])}
            className="text-[11px] text-slate-400 hover:text-white underline ml-1"
          >
            Clear
          </button>
        </div>
      )}

      {/* Dynamic Fan-Shaped Hand Rack */}
      <div className="relative h-48 w-full max-w-4xl flex items-center justify-center perspective-1000 mb-2">
        {hand.length === 0 ? (
          <div className="text-sm font-bold text-slate-400 italic">
            Hand empty. Click &apos;Draw Card&apos; or wait for round resolve.
          </div>
        ) : (
          hand.map((card, idx) => {
            const fanAngle = -maxSpan / 2 + idx * angleStep;
            const fanOffset = (idx - (count - 1) / 2) * offsetStep;
            const playable = isCardPlayable(card);
            const isSelected = meldCardIds.includes(card.id) || selectedCardId === card.id;

            return (
              <div
                key={card.id}
                className="absolute"
                style={{ zIndex: idx + 10 }}
              >
                <Card3D
                  card={card}
                  isPlayable={playable}
                  isSelectedForMeld={isSelected}
                  onSelectForMeld={handleToggleMeld}
                  onPlay={(c, bluff) => handleCardClickOrFlick(c, bluff)}
                  fanAngle={fanAngle}
                  fanOffset={fanOffset}
                  zIndex={idx + 10}
                  size="md"
                />
              </div>
            );
          })
        )}
      </div>

      {/* Action Control Dock (Turn Triggers, Bluff Mode, Wagering Drawer Button) */}
      <div className="relative z-30 flex flex-wrap items-center justify-center gap-3 bg-slate-900/90 border border-slate-700/80 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-xl max-w-2xl w-full">
        {/* Bluff Mode Switch */}
        <button
          onClick={() => setIsBluffMode(prev => !prev)}
          className={cn(
            'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 border',
            isBluffMode
              ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.7)] animate-pulse'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          )}
          title="Play next card face-down! Opponents get 5s to call your bluff."
        >
          <EyeOff className="w-4 h-4" />
          <span>{isBluffMode ? 'Bluff Active' : 'Face-Down Bluff'}</span>
        </button>

        {/* Play Selected Card Button */}
        <Button
          variant={isMyTurn ? "felt" : "secondary"}
          disabled={!isMyTurn || (!selectedCardId && meldCardIds.length === 0)}
          onClick={() => {
            const cardToPlayId = selectedCardId || meldCardIds[0];
            const card = hand.find(c => c.id === cardToPlayId);
            if (card) handleCardClickOrFlick(card, isBluffMode);
          }}
          className="gap-2 text-xs font-black uppercase tracking-wider"
        >
          <Play className="w-4 h-4 fill-current" />
          Play Selected
        </Button>

        {/* Draw Card Button */}
        <Button
          variant="outline"
          disabled={!isMyTurn}
          onClick={onDrawCard}
          className="gap-2 text-xs font-black uppercase tracking-wider border-amber-500/50 text-amber-300 hover:bg-amber-950/40"
        >
          <Layers className="w-4 h-4" />
          Draw (+1)
        </Button>

        {/* Wagering / Ante Raise Button */}
        <Button
          variant="gold"
          onClick={onOpenWager}
          className="gap-2 text-xs font-black uppercase tracking-wider"
        >
          <Coins className="w-4 h-4" />
          Wager / Ante
        </Button>

        {/* Pass Turn Button */}
        <Button
          variant="ghost"
          disabled={!isMyTurn}
          onClick={onPassTurn}
          className="gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200"
        >
          <FastForward className="w-3.5 h-3.5" />
          Pass
        </Button>
      </div>

      {/* Tactile Gesture Help Tip */}
      <span className="text-[11px] text-slate-400 mt-2 font-mono flex items-center gap-1.5 opacity-80">
        <span>💡 Tip:</span>
        <span>Drag card corner to <strong>peek</strong> in 3D. <strong>Flick upward</strong> with velocity to discard instantly!</span>
      </span>
    </div>
  );
};
