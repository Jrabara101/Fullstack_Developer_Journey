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
  // Extra telemetry for rich UX
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

export interface ClientToServerEvents {
  join_room: (data: { roomCode?: string; username: string; avatarUrl?: string; sessionToken?: string; isController?: boolean }, callback?: (res: { success: boolean; error?: string; roomId?: string; roomCode?: string; playerId?: string; token?: string }) => void) => void;
  start_game: () => void;
  play_card: (data: { cardId: string; declaredColor?: CardColor; isBluff?: boolean; meldCardIds?: string[] }) => void;
  draw_card: () => void;
  bet_ante: (data: { amount: number }) => void;
  call_bluff: () => void;
  concede_bluff: () => void;
  pass_turn: () => void;
  next_round: () => void;
  send_emote: (data: { emote: 'tomato' | 'chips' | 'slam' | 'fire' | 'clapping' }) => void;
  add_bot: () => void;
}

export interface ServerToClientEvents {
  game_state: (state: CardGameState) => void;
  tick: (data: { turnTimeRemainingMs: number; phase: GamePhase; bluffTimeLeftMs?: number }) => void;
  session_token: (token: string) => void;
  table_alert: (alert: { type: 'info' | 'bluff' | 'action' | 'win' | 'penalty'; message: string; subText?: string }) => void;
  emote_broadcast: (data: { senderId: string; senderName: string; emote: string }) => void;
  error_message: (message: string) => void;
}

export interface InternalPlayer extends TablePlayer {
  socketId: string;
  actualHand: Card[]; // Authoritative unmasked hand
  token: string;
  connected: boolean;
}
