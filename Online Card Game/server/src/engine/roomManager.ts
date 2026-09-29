import crypto from 'crypto';
import { Server } from 'socket.io';
import {
  Card,
  CardColor,
  CardGameState,
  GamePhase,
  InternalPlayer,
  TablePlayer
} from '../types.js';
import { generateShuffledDeck, isPlayLegal } from './deck.js';
import { evaluateMeld } from './combos.js';
import { generateSessionToken } from '../session.js';

const TURN_TIME_LIMIT_MS = 15000;
const BLUFF_TIME_LIMIT_MS = 5000;
const TICK_INTERVAL_MS = 500;

export interface InternalRoom {
  id: string;
  code: string;
  phase: GamePhase;
  activeColor: CardColor;
  topDiscard: Card | null;
  previousTopDiscard: Card | null;
  deck: Card[];
  discardPile: Card[];
  potChips: number;
  currentAnte: number;
  currentTurnPlayerId: string;
  turnDirection: 1 | -1;
  turnTimeRemainingMs: number;
  bluffChallenge?: {
    initiatorPlayerId: string;
    playedCardMasked: boolean;
    timeLeftMs: number;
    playedCard: Card;
    declaredColor?: CardColor;
    meldCards?: Card[];
  };
  players: InternalPlayer[];
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
  turnTimer?: NodeJS.Timeout;
  tickTimer?: NodeJS.Timeout;
}

export class RoomManager {
  private rooms: Map<string, InternalRoom> = new Map();
  private codeToRoomId: Map<string, string> = new Map();
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  public createRoom(hostUsername: string, avatarUrl?: string): { room: InternalRoom; host: InternalPlayer } {
    const roomId = `room_${crypto.randomUUID().slice(0, 8)}`;
    let code = '';
    // Generate unique 4-character alphanumeric uppercase code
    do {
      code = Math.random().toString(36).substring(2, 6).toUpperCase();
    } while (this.codeToRoomId.has(code));

    const hostId = `p_${crypto.randomUUID().slice(0, 8)}`;
    const token = generateSessionToken({ playerId: hostId, roomId, username: hostUsername, isHost: true });

    const host: InternalPlayer = {
      id: hostId,
      socketId: '',
      username: hostUsername || 'Player 1',
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${hostId}`,
      chips: 1000,
      currentBet: 0,
      cardCount: 0,
      isTurn: false,
      hasPassed: false,
      isHost: true,
      token,
      connected: true,
      actualHand: []
    };

    const room: InternalRoom = {
      id: roomId,
      code,
      phase: 'LOBBY',
      activeColor: 'red',
      topDiscard: null,
      previousTopDiscard: null,
      deck: [],
      discardPile: [],
      potChips: 0,
      currentAnte: 20,
      currentTurnPlayerId: hostId,
      turnDirection: 1,
      turnTimeRemainingMs: TURN_TIME_LIMIT_MS,
      players: [host]
    };

    this.rooms.set(roomId, room);
    this.codeToRoomId.set(code, roomId);
    return { room, host };
  }

  public getRoom(roomId: string): InternalRoom | undefined {
    return this.rooms.get(roomId);
  }

  public getRoomByCode(code: string): InternalRoom | undefined {
    const roomId = this.codeToRoomId.get(code.toUpperCase());
    return roomId ? this.rooms.get(roomId) : undefined;
  }

  public joinRoom(
    room: InternalRoom,
    username: string,
    avatarUrl?: string
  ): InternalPlayer {
    const playerId = `p_${crypto.randomUUID().slice(0, 8)}`;
    const token = generateSessionToken({ playerId, roomId: room.id, username, isHost: false });

    const player: InternalPlayer = {
      id: playerId,
      socketId: '',
      username: username || `Guest ${room.players.length + 1}`,
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${playerId}`,
      chips: 1000,
      currentBet: 0,
      cardCount: 0,
      isTurn: false,
      hasPassed: false,
      isHost: false,
      token,
      connected: true,
      actualHand: []
    };

    room.players.push(player);
    return player;
  }

  public addBot(roomId: string): InternalPlayer | null {
    const room = this.rooms.get(roomId);
    if (!room || room.players.length >= 6) return null;

    const botNames = ['CyberAce', 'NeonBluff', 'Viper7', 'MatrixChip', 'RogueQueen', 'QuantumKing'];
    const botName = botNames[room.players.length % botNames.length];
    const botId = `bot_${crypto.randomUUID().slice(0, 6)}`;

    const bot: InternalPlayer = {
      id: botId,
      socketId: `socket_${botId}`,
      username: `${botName} (AI)`,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${botId}`,
      chips: 1000,
      currentBet: 0,
      cardCount: 0,
      isTurn: false,
      hasPassed: false,
      isHost: false,
      isBot: true,
      token: 'bot-token',
      connected: true,
      actualHand: []
    };

    room.players.push(bot);
    this.broadcastState(room);
    return bot;
  }

  public startGame(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.players.length < 2) return false;

    room.phase = 'DEALING';
    room.deck = generateShuffledDeck();
    room.discardPile = [];
    room.potChips = 0;
    room.currentAnte = 20;
    room.turnDirection = 1;
    room.roundWinner = undefined;

    // Deduct initial ante from each player and deal 7 cards
    for (const player of room.players) {
      const anteDeduction = Math.min(player.chips, room.currentAnte);
      player.chips -= anteDeduction;
      player.currentBet = anteDeduction;
      room.potChips += anteDeduction;
      player.actualHand = room.deck.splice(0, 7);
      player.cardCount = player.actualHand.length;
      player.hasPassed = false;
      player.isTurn = false;
    }

    // Flip first card for top discard (repeat until non-wild if possible)
    let firstCard = room.deck.shift()!;
    while (firstCard.color === 'wild' && room.deck.length > 0) {
      room.deck.push(firstCard);
      firstCard = room.deck.shift()!;
    }

    room.topDiscard = firstCard;
    room.previousTopDiscard = null;
    room.activeColor = firstCard.color === 'wild' ? 'red' : firstCard.color;

    // Select first player
    const hostIdx = room.players.findIndex(p => p.isHost);
    const startIdx = hostIdx >= 0 ? hostIdx : 0;
    room.currentTurnPlayerId = room.players[startIdx].id;
    room.players[startIdx].isTurn = true;

    room.lastAction = {
      playerId: 'system',
      playerName: 'Dealer',
      action: 'Game Started',
      details: `Ante of 20 chips placed in pot (${room.potChips} chips total). First card is ${firstCard.color.toUpperCase()} ${firstCard.value}.`
    };

    this.broadcastState(room);

    // Transition to PLAYER_TURN after short dealing delay
    setTimeout(() => {
      if (room.phase === 'DEALING') {
        room.phase = 'PLAYER_TURN';
        this.startTurnTimer(room);
        this.broadcastState(room);
        this.checkBotTurn(room);
      }
    }, 1200);

    return true;
  }

  public playCard(
    roomId: string,
    playerId: string,
    cardId: string,
    declaredColor?: CardColor,
    isBluff = false,
    meldCardIds?: string[]
  ): { success: boolean; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room) return { success: false, error: 'Room not found' };
    if (room.phase !== 'PLAYER_TURN') return { success: false, error: 'Not currently player turn' };
    if (room.currentTurnPlayerId !== playerId) return { success: false, error: 'Not your turn' };

    const player = room.players.find(p => p.id === playerId);
    if (!player) return { success: false, error: 'Player not found' };

    // Find main card
    const cardIndex = player.actualHand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return { success: false, error: 'Card not in hand' };

    const mainCard = player.actualHand[cardIndex];

    // Check legality if not bluffing
    const legal = isPlayLegal(mainCard, room.topDiscard, room.activeColor);
    if (!isBluff && !legal) {
      return { success: false, error: 'Illegal play: Color or value does not match current discard pile' };
    }

    // Handle melds if provided
    let meldCards: Card[] = [mainCard];
    if (meldCardIds && meldCardIds.length > 0) {
      for (const mId of meldCardIds) {
        if (mId === cardId) continue;
        const extraCard = player.actualHand.find(c => c.id === mId);
        if (extraCard) meldCards.push(extraCard);
      }
    }

    // Remove played cards from player's hand
    const playedIds = new Set(meldCards.map(c => c.id));
    player.actualHand = player.actualHand.filter(c => !playedIds.has(c.id));
    player.cardCount = player.actualHand.length;

    // Check if played face-down (Bluff Challenge Mechanic)
    if (isBluff) {
      this.clearTimers(room);
      room.phase = 'BLUFF_CHALLENGE';
      room.previousTopDiscard = room.topDiscard;
      // Mark top discard as face down
      room.topDiscard = { ...mainCard, isFaceDown: true };
      room.bluffChallenge = {
        initiatorPlayerId: playerId,
        playedCardMasked: true,
        timeLeftMs: BLUFF_TIME_LIMIT_MS,
        playedCard: mainCard,
        declaredColor: declaredColor || room.activeColor,
        meldCards
      };

      room.lastAction = {
        playerId,
        playerName: player.username,
        action: 'Played Face-Down Bluff!',
        details: `${player.username} played a card face-down! 5 seconds for opponents to Call Bluff!`
      };

      this.startBluffTimer(room);
      this.broadcastState(room);
      return { success: true };
    }

    // Standard legal play or declared wild
    this.resolveCardPlay(room, player, mainCard, declaredColor, meldCards);
    return { success: true };
  }

  private resolveCardPlay(
    room: InternalRoom,
    player: InternalPlayer,
    mainCard: Card,
    declaredColor?: CardColor,
    meldCards?: Card[]
  ) {
    this.clearTimers(room);

    // Save previous discard
    if (room.topDiscard) {
      room.discardPile.push(room.topDiscard);
    }
    room.previousTopDiscard = room.topDiscard;
    room.topDiscard = { ...mainCard, isFaceDown: false };

    // Update active color
    if (mainCard.color === 'wild' || mainCard.type === 'wild' || mainCard.type === 'wild_ante') {
      room.activeColor = declaredColor && declaredColor !== 'wild' ? declaredColor : 'red';
    } else {
      room.activeColor = mainCard.color;
    }

    // Evaluate meld payoff if multiple cards
    let comboBanner = '';
    if (meldCards && meldCards.length > 1) {
      const evaluation = evaluateMeld(meldCards);
      if (evaluation.isMeld) {
        const bonusFromPot = Math.min(room.potChips, evaluation.bonusChips);
        room.potChips -= bonusFromPot;
        player.chips += bonusFromPot;
        comboBanner = ` [Combo: ${evaluation.name} +${bonusFromPot} chips!]`;
      }
    }

    // Apply special card effects
    let skipCount = 1;
    let effectDetails = '';

    if (mainCard.type === 'skip') {
      skipCount = 2;
      effectDetails = 'Next player is skipped!';
    } else if (mainCard.type === 'reverse') {
      room.turnDirection = (room.turnDirection * -1) as 1 | -1;
      effectDetails = `Direction reversed! Now ${room.turnDirection === 1 ? 'Clockwise' : 'Counter-Clockwise'}.`;
      if (room.players.length === 2) {
        skipCount = 2; // In 2-player Uno, reverse acts as a skip
      }
    } else if (mainCard.type === 'draw_two') {
      const nextP = this.getNextPlayer(room, 1);
      if (nextP) {
        const drawn = room.deck.splice(0, 2);
        nextP.actualHand.push(...drawn);
        nextP.cardCount = nextP.actualHand.length;
        // Escalate ante into pot
        const penaltyChips = Math.min(nextP.chips, 40);
        nextP.chips -= penaltyChips;
        room.potChips += penaltyChips;
        effectDetails = `${nextP.username} draws 2 cards and paid 40 chips into pot!`;
        skipCount = 2; // Skip their turn
      }
    } else if (mainCard.type === 'wild_ante') {
      room.currentAnte += 50;
      effectDetails = `Wild Ante! Round stakes raised by +50 chips! Active color is ${room.activeColor.toUpperCase()}.`;
    } else if (mainCard.type === 'wild') {
      effectDetails = `Color Shift! Active color is now ${room.activeColor.toUpperCase()}.`;
    }

    room.lastAction = {
      playerId: player.id,
      playerName: player.username,
      action: `Played ${mainCard.color.toUpperCase()} ${mainCard.type === 'number' ? mainCard.value : mainCard.type}${comboBanner}`,
      details: effectDetails || undefined
    };

    // Check Win Condition: player emptied their hand!
    if (player.actualHand.length === 0) {
      this.handleRoundVictory(room, player, comboBanner || 'Hand Cleared');
      return;
    }

    // Advance to next player
    this.advanceTurn(room, skipCount);
  }

  public callBluff(roomId: string, challengerId: string): { success: boolean; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room || room.phase !== 'BLUFF_CHALLENGE' || !room.bluffChallenge) {
      return { success: false, error: 'No active bluff challenge' };
    }

    if (room.bluffChallenge.initiatorPlayerId === challengerId) {
      return { success: false, error: 'Cannot challenge your own play' };
    }

    const challenger = room.players.find(p => p.id === challengerId);
    const bluffer = room.players.find(p => p.id === room.bluffChallenge!.initiatorPlayerId);
    if (!challenger || !bluffer) return { success: false, error: 'Players not found' };

    this.clearTimers(room);
    const { playedCard, declaredColor, meldCards } = room.bluffChallenge;
    const wasLegal = isPlayLegal(playedCard, room.previousTopDiscard, room.activeColor);

    // Reveal the card
    room.topDiscard = { ...playedCard, isFaceDown: false };
    room.bluffChallenge = undefined;

    if (!wasLegal) {
      // SUCCESSFUL CHALLENGE: The player bluffed with an illegal card!
      // Bluffer draws 3 cards penalty & pays 100 chips into the pot
      const penaltyCards = room.deck.splice(0, 3);
      bluffer.actualHand.push(...penaltyCards);
      bluffer.cardCount = bluffer.actualHand.length;

      const chipPenalty = Math.min(bluffer.chips, 100);
      bluffer.chips -= chipPenalty;
      room.potChips += chipPenalty;

      // Challenger receives 50 reward chips from pot
      const reward = Math.min(room.potChips, 50);
      room.potChips -= reward;
      challenger.chips += reward;

      room.lastAction = {
        playerId: challenger.id,
        playerName: challenger.username,
        action: 'BLUFF CAUGHT!',
        details: `${bluffer.username} bluffed with illegal ${playedCard.color.toUpperCase()} ${playedCard.value}! Draws 3 cards & pays 100 chips.`
      };

      this.io.to(room.id).emit('table_alert', {
        type: 'bluff',
        message: `BLUFF CAUGHT!`,
        subText: `${bluffer.username}'s bluff was exposed by ${challenger.username}! +3 Cards Penalty.`
      });

      // Bluffer's turn ends; advance to next player
      this.advanceTurn(room, 1);
    } else {
      // FALSE ACCUSATION: The player was NOT bluffing (it was a legal play)!
      // Challenger draws 2 cards penalty & pays double current ante into the pot
      const penaltyCards = room.deck.splice(0, 2);
      challenger.actualHand.push(...penaltyCards);
      challenger.cardCount = challenger.actualHand.length;

      const penalty = Math.min(challenger.chips, room.currentAnte * 2);
      challenger.chips -= penalty;
      bluffer.chips += penalty; // Awarded directly to the honest player

      room.lastAction = {
        playerId: bluffer.id,
        playerName: bluffer.username,
        action: 'HONEST PLAY VINDICATED!',
        details: `${challenger.username} falsely challenged! ${playedCard.color.toUpperCase()} ${playedCard.value} was legal. Challenger drew 2 cards & paid ${penalty} chips!`
      };

      this.io.to(room.id).emit('table_alert', {
        type: 'action',
        message: `HONEST PLAY VINDICATED!`,
        subText: `${challenger.username}'s challenge failed! Legal play confirmed.`
      });

      // Now resolve the card effects
      this.resolveCardPlay(room, bluffer, playedCard, declaredColor, meldCards);
    }

    return { success: true };
  }

  public concedeBluff(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room || room.phase !== 'BLUFF_CHALLENGE' || !room.bluffChallenge) return;

    this.clearTimers(room);
    const { initiatorPlayerId, playedCard, declaredColor, meldCards } = room.bluffChallenge;
    const player = room.players.find(p => p.id === initiatorPlayerId);
    room.bluffChallenge = undefined;

    if (player) {
      room.lastAction = {
        playerId: player.id,
        playerName: player.username,
        action: 'Bluff Succeeded!',
        details: `No one challenged! ${player.username} got away with the face-down play.`
      };
      this.resolveCardPlay(room, player, playedCard, declaredColor, meldCards);
    } else {
      this.advanceTurn(room, 1);
    }
  }

  public drawCard(roomId: string, playerId: string): { success: boolean; card?: Card; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room) return { success: false, error: 'Room not found' };
    if (room.phase !== 'PLAYER_TURN') return { success: false, error: 'Not currently player turn' };
    if (room.currentTurnPlayerId !== playerId) return { success: false, error: 'Not your turn' };

    const player = room.players.find(p => p.id === playerId);
    if (!player) return { success: false, error: 'Player not found' };

    // Replenish deck from discard pile if empty
    if (room.deck.length === 0) {
      this.recycleDiscards(room);
    }

    if (room.deck.length === 0) {
      return { success: false, error: 'No cards left in deck' };
    }

    const drawnCard = room.deck.shift()!;
    player.actualHand.push(drawnCard);
    player.cardCount = player.actualHand.length;

    room.lastAction = {
      playerId: player.id,
      playerName: player.username,
      action: 'Drew a Card',
      details: `${player.username} drew from the deck.`
    };

    // Auto-advance turn after drawing
    this.advanceTurn(room, 1);
    return { success: true, card: drawnCard };
  }

  public betAnte(roomId: string, playerId: string, amount: number): { success: boolean; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room) return { success: false, error: 'Room not found' };
    const player = room.players.find(p => p.id === playerId);
    if (!player) return { success: false, error: 'Player not found' };

    const actualAmount = Math.min(player.chips, Math.max(10, amount));
    player.chips -= actualAmount;
    player.currentBet += actualAmount;
    room.potChips += actualAmount;
    room.currentAnte = Math.max(room.currentAnte, player.currentBet);

    room.lastAction = {
      playerId: player.id,
      playerName: player.username,
      action: `Raised Pot (+${actualAmount} chips)`,
      details: `${player.username} raised the stakes! Pot is now ${room.potChips} chips.`
    };

    this.broadcastState(room);
    return { success: true };
  }

  public passTurn(roomId: string, playerId: string): { success: boolean; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room) return { success: false, error: 'Room not found' };
    if (room.currentTurnPlayerId !== playerId) return { success: false, error: 'Not your turn' };

    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.hasPassed = true;
      room.lastAction = {
        playerId: player.id,
        playerName: player.username,
        action: 'Passed Turn',
        details: `${player.username} passed.`
      };
    }

    this.advanceTurn(room, 1);
    return { success: true };
  }

  private advanceTurn(room: InternalRoom, steps = 1): void {
    this.clearTimers(room);

    // Check if only 1 player remains with chips or cards
    const activePlayers = room.players.filter(p => p.chips > 0 || p.cardCount > 0);
    if (activePlayers.length <= 1 && room.players.length > 1) {
      this.handleRoundVictory(room, activePlayers[0] || room.players[0], 'Last Standing Player');
      return;
    }

    // Determine next player index based on turnDirection
    const curIdx = room.players.findIndex(p => p.id === room.currentTurnPlayerId);
    let nextIdx = curIdx >= 0 ? curIdx : 0;
    const len = room.players.length;

    for (let s = 0; s < steps; s++) {
      nextIdx = (nextIdx + room.turnDirection + len) % len;
    }

    for (const p of room.players) {
      p.isTurn = false;
    }

    const nextPlayer = room.players[nextIdx];
    room.currentTurnPlayerId = nextPlayer.id;
    nextPlayer.isTurn = true;
    room.phase = 'PLAYER_TURN';
    room.turnTimeRemainingMs = TURN_TIME_LIMIT_MS;

    this.startTurnTimer(room);
    this.broadcastState(room);
    this.checkBotTurn(room);
  }

  private handleRoundVictory(room: InternalRoom, winner: InternalPlayer, comboName: string): void {
    this.clearTimers(room);
    room.phase = 'SHOWDOWN_PAYOUT';

    const potWon = room.potChips;
    winner.chips += potWon;
    room.potChips = 0;

    room.roundWinner = {
      playerId: winner.id,
      playerName: winner.username,
      comboName,
      potWon
    };

    room.lastAction = {
      playerId: winner.id,
      playerName: winner.username,
      action: '🏆 ROUND WON!',
      details: `${winner.username} won the pot of ${potWon} chips with ${comboName}!`
    };

    this.io.to(room.id).emit('table_alert', {
      type: 'win',
      message: `${winner.username} WINS THE POT!`,
      subText: `Claimed ${potWon} chips with ${comboName}!`
    });

    this.broadcastState(room);
  }

  public nextRound(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    return this.startGame(roomId);
  }

  private recycleDiscards(room: InternalRoom): void {
    if (room.discardPile.length === 0) return;
    const top = room.topDiscard;
    room.deck = [...room.discardPile];
    room.discardPile = [];
    // Shuffle recycled deck
    for (let i = room.deck.length - 1; i > 0; i--) {
      const j = crypto.randomInt(i + 1);
      const temp = room.deck[i];
      room.deck[i] = room.deck[j];
      room.deck[j] = temp;
    }
  }

  private getNextPlayer(room: InternalRoom, offset = 1): InternalPlayer | undefined {
    const curIdx = room.players.findIndex(p => p.id === room.currentTurnPlayerId);
    if (curIdx === -1) return undefined;
    const nextIdx = (curIdx + (offset * room.turnDirection) + room.players.length) % room.players.length;
    return room.players[nextIdx];
  }

  private startTurnTimer(room: InternalRoom): void {
    this.clearTimers(room);
    room.turnTimeRemainingMs = TURN_TIME_LIMIT_MS;

    // Periodic tick packet to neutralize client clock drift
    room.tickTimer = setInterval(() => {
      room.turnTimeRemainingMs -= TICK_INTERVAL_MS;
      if (room.turnTimeRemainingMs <= 0) {
        room.turnTimeRemainingMs = 0;
      }
      this.io.to(room.id).emit('tick', {
        turnTimeRemainingMs: room.turnTimeRemainingMs,
        phase: room.phase
      });
    }, TICK_INTERVAL_MS);

    // Timeout fallback for idling or disconnected players (Auto-draw / pass)
    room.turnTimer = setTimeout(() => {
      if (room.phase === 'PLAYER_TURN') {
        const curPlayer = room.players.find(p => p.id === room.currentTurnPlayerId);
        if (curPlayer) {
          // Auto draw fallback
          if (room.deck.length > 0) {
            const card = room.deck.shift()!;
            curPlayer.actualHand.push(card);
            curPlayer.cardCount = curPlayer.actualHand.length;
          }
          room.lastAction = {
            playerId: curPlayer.id,
            playerName: curPlayer.username,
            action: 'Turn Timed Out (Auto-Draw)',
            details: 'Player turn timed out; card automatically drawn.'
          };
        }
        this.advanceTurn(room, 1);
      }
    }, TURN_TIME_LIMIT_MS);
  }

  private startBluffTimer(room: InternalRoom): void {
    if (!room.bluffChallenge) return;
    const startTime = Date.now();

    room.tickTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, BLUFF_TIME_LIMIT_MS - elapsed);
      if (room.bluffChallenge) {
        room.bluffChallenge.timeLeftMs = remaining;
      }
      this.io.to(room.id).emit('tick', {
        turnTimeRemainingMs: remaining,
        phase: room.phase,
        bluffTimeLeftMs: remaining
      });
    }, TICK_INTERVAL_MS);

    room.turnTimer = setTimeout(() => {
      if (room.phase === 'BLUFF_CHALLENGE') {
        this.concedeBluff(room.id);
      }
    }, BLUFF_TIME_LIMIT_MS);

    // Let AI bots consider challenging if any bot is in the room
    const bots = room.players.filter(p => p.isBot && p.id !== room.bluffChallenge?.initiatorPlayerId);
    if (bots.length > 0) {
      const randomBot = bots[Math.floor(Math.random() * bots.length)];
      // 35% chance bot challenges bluff within 2-3 seconds
      if (Math.random() < 0.35) {
        setTimeout(() => {
          if (room.phase === 'BLUFF_CHALLENGE' && room.bluffChallenge) {
            this.callBluff(room.id, randomBot.id);
          }
        }, 1500 + Math.random() * 1500);
      }
    }
  }

  private clearTimers(room: InternalRoom): void {
    if (room.turnTimer) {
      clearTimeout(room.turnTimer);
      room.turnTimer = undefined;
    }
    if (room.tickTimer) {
      clearInterval(room.tickTimer);
      room.tickTimer = undefined;
    }
  }

  private checkBotTurn(room: InternalRoom): void {
    if (room.phase !== 'PLAYER_TURN') return;
    const curPlayer = room.players.find(p => p.id === room.currentTurnPlayerId);
    if (!curPlayer || !curPlayer.isBot) return;

    // Simulate bot thinking time (1.2s - 2.5s)
    setTimeout(() => {
      if (room.phase !== 'PLAYER_TURN' || room.currentTurnPlayerId !== curPlayer.id) return;

      // Find playable cards
      const playableCards = curPlayer.actualHand.filter(c =>
        isPlayLegal(c, room.topDiscard, room.activeColor)
      );

      if (playableCards.length > 0) {
        // Pick best playable card (prioritize action or number)
        const chosenCard = playableCards[Math.floor(Math.random() * playableCards.length)];
        const declaredColor: CardColor = ['red', 'blue', 'green', 'yellow'][Math.floor(Math.random() * 4)] as CardColor;
        this.playCard(room.id, curPlayer.id, chosenCard.id, declaredColor, false);
      } else {
        // Bot bluffs 20% of the time with an illegal card face-down!
        if (Math.random() < 0.20 && curPlayer.actualHand.length > 0) {
          const bluffCard = curPlayer.actualHand[0];
          this.playCard(room.id, curPlayer.id, bluffCard.id, room.activeColor, true);
        } else {
          // Otherwise draw a card
          this.drawCard(room.id, curPlayer.id);
        }
      }
    }, 1500 + Math.random() * 1000);
  }

  /**
   * Cryptographic Fog of War: Masks cards of all opponents.
   * Only the local player receives their actual hand; everyone else receives only card counts.
   */
  public getMaskedStateForPlayer(roomId: string, targetPlayerId: string): CardGameState | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const maskedPlayers: TablePlayer[] = room.players.map(p => {
      const isTarget = p.id === targetPlayerId;
      return {
        id: p.id,
        username: p.username,
        avatarUrl: p.avatarUrl,
        chips: p.chips,
        currentBet: p.currentBet,
        cardCount: p.actualHand.length,
        isTurn: p.id === room.currentTurnPlayerId,
        hasPassed: p.hasPassed,
        isHost: p.isHost,
        isBot: p.isBot,
        // Hand is populated ONLY for the local client's own session!
        hand: isTarget ? [...p.actualHand] : undefined
      };
    });

    return {
      roomId: room.id,
      roomCode: room.code,
      phase: room.phase,
      activeColor: room.activeColor,
      topDiscard: room.topDiscard,
      drawDeckCount: room.deck.length,
      potChips: room.potChips,
      currentAnte: room.currentAnte,
      currentTurnPlayerId: room.currentTurnPlayerId,
      turnTimeRemainingMs: room.turnTimeRemainingMs,
      bluffChallenge: room.bluffChallenge ? {
        initiatorPlayerId: room.bluffChallenge.initiatorPlayerId,
        playedCardMasked: room.bluffChallenge.playedCardMasked,
        timeLeftMs: room.bluffChallenge.timeLeftMs
      } : undefined,
      players: maskedPlayers,
      myPlayerId: targetPlayerId,
      lastAction: room.lastAction,
      roundWinner: room.roundWinner,
      turnDirection: room.turnDirection
    };
  }

  public broadcastState(room: InternalRoom): void {
    for (const player of room.players) {
      if (player.isBot) continue;
      const state = this.getMaskedStateForPlayer(room.id, player.id);
      if (state && player.socketId) {
        this.io.to(player.socketId).emit('game_state', state);
      }
    }
  }

  public handleDisconnect(socketId: string): void {
    for (const room of this.rooms.values()) {
      const player = room.players.find(p => p.socketId === socketId);
      if (player) {
        player.connected = false;
        // If room is in lobby and player isn't host, can clean up or keep for reconnect
        this.broadcastState(room);
        break;
      }
    }
  }
}
