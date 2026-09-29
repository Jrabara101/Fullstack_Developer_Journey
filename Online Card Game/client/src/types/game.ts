export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
export type CardType = 'number' | 'skip' | 'reverse' | 'draw_two' | 'wild' | 'wild_ante';

export interface Card {
  id: string;
  color: CardColor;
  value: number; // 0-9 for numbers; special codes for action cards
  type: CardType;
  isFaceDown?: boolean;
}

export interface TablePlayer {
  id: string;
  username: string;
  avatarUrl: string;
  chips: number;
  currentBet: number;
  cardCount: number;
  isTurn: boolean;
  hasPassed: boolean;
  isHost: boolean;
  isBot?: boolean;
  hand?: Card[]; // Populated ONLY for the local client's own session
}

export type GamePhase = 'LOBBY' | 'DEALING' | 'PLAYER_TURN' | 'BLUFF_CHALLENGE' | 'ROUND_RESOLVE' | 'SHOWDOWN_PAYOUT';

export interface CardGameState {
  roomId: string;
  roomCode: string;
  phase: GamePhase;
  activeColor: CardColor;
  topDiscard: Card | null;
  drawDeckCount: number;
  potChips: number;
  currentAnte: number;
  currentTurnPlayerId: string;
  turnTimeRemainingMs: number;
  bluffChallenge?: {
    initiatorPlayerId: string;
    playedCardMasked: boolean;
    timeLeftMs: number;
  };
  players: TablePlayer[];
  myPlayerId: string;
  lastAction?: {
    playerId: string;
    playerName: string;
    action: string;
    details?: string;
  };
  roundWinner?: {
    playerId: string;
    playerName: string;
    comboName: string;
    potWon: number;
  };
  turnDirection: 1 | -1;
}

export interface TableAlert {
  id: string;
  type: 'info' | 'bluff' | 'action' | 'win' | 'penalty';
  message: string;
  subText?: string;
}

export interface TableEmote {
  id: string;
  senderId: string;
  senderName: string;
  emote: string;
  x?: number;
  y?: number;
}
