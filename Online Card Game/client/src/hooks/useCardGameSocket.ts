import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Card, CardColor, CardGameState, TableAlert, TableEmote } from '../types/game.js';

const TOKEN_KEY = 'card_arena_session_token';

export function useCardGameSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState<CardGameState | null>(null);
  const [alerts, setAlerts] = useState<TableAlert[]>([]);
  const [activeEmotes, setActiveEmotes] = useState<TableEmote[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Store pre-optimistic state snapshot for rollback
  const optimisticSnapshotRef = useRef<CardGameState | null>(null);

  useEffect(() => {
    // Connect to server (either via proxy / port 3001)
    const socketInstance: Socket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      console.log('🔌 Connected to Card Arena Server:', socketInstance.id);
      setIsConnected(true);

      // Attempt automatic session recovery if stored token exists
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (savedToken) {
        socketInstance.emit('join_room', {
          username: '',
          sessionToken: savedToken
        }, (res: { success: boolean; token?: string }) => {
          if (!res.success) {
            localStorage.removeItem(TOKEN_KEY);
          }
        });
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Disconnected from Card Arena Server');
      setIsConnected(false);
    });

    socketInstance.on('session_token', (token: string) => {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      }
    });

    socketInstance.on('game_state', (incomingState: CardGameState) => {
      optimisticSnapshotRef.current = null; // Reconciled with authoritative server state
      setGameState(incomingState);
    });

    socketInstance.on('tick', (tickData: { turnTimeRemainingMs: number; phase: string; bluffTimeLeftMs?: number }) => {
      setGameState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          turnTimeRemainingMs: tickData.turnTimeRemainingMs,
          bluffChallenge: prev.bluffChallenge ? {
            ...prev.bluffChallenge,
            timeLeftMs: tickData.bluffTimeLeftMs ?? prev.bluffChallenge.timeLeftMs
          } : undefined
        };
      });
    });

    socketInstance.on('table_alert', (alert: { type: 'info' | 'bluff' | 'action' | 'win' | 'penalty'; message: string; subText?: string }) => {
      const alertId = `alert_${Date.now()}_${Math.random()}`;
      setAlerts(prev => [...prev.slice(-3), { id: alertId, ...alert }]);

      // Auto-dismiss alert after 4.5 seconds
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
      }, 4500);
    });

    socketInstance.on('emote_broadcast', (data: { senderId: string; senderName: string; emote: string }) => {
      const emoteId = `emote_${Date.now()}_${Math.random()}`;
      setActiveEmotes(prev => [...prev.slice(-4), { id: emoteId, ...data }]);

      setTimeout(() => {
        setActiveEmotes(prev => prev.filter(e => e.id !== emoteId));
      }, 2000);
    });

    socketInstance.on('error_message', (msg: string) => {
      console.warn('⚠️ Server Alert:', msg);
      setErrorMessage(msg);

      // Rollback optimistic state if an error occurred during play
      if (optimisticSnapshotRef.current) {
        setGameState(optimisticSnapshotRef.current);
        optimisticSnapshotRef.current = null;
      }

      setTimeout(() => setErrorMessage(null), 4000);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Public Methods
  const joinRoom = useCallback((username: string, roomCode?: string, avatarUrl?: string) => {
    if (!socket) return;
    const token = localStorage.getItem(TOKEN_KEY) || undefined;

    socket.emit('join_room', {
      username: username.trim(),
      roomCode: roomCode ? roomCode.trim().toUpperCase() : undefined,
      avatarUrl,
      sessionToken: token
    }, (res: { success: boolean; error?: string; token?: string }) => {
      if (res && res.success && res.token) {
        localStorage.setItem(TOKEN_KEY, res.token);
      } else if (res && !res.success && res.error) {
        setErrorMessage(res.error);
      }
    });
  }, [socket]);

  const startGame = useCallback(() => {
    socket?.emit('start_game');
  }, [socket]);

  const playCard = useCallback((
    cardId: string,
    declaredColor?: CardColor,
    isBluff = false,
    meldCardIds?: string[]
  ) => {
    if (!socket || !gameState) return;

    // Save snapshot for optimistic rollback
    optimisticSnapshotRef.current = gameState;

    // Optimistically remove card from local hand and update top discard
    setGameState(prev => {
      if (!prev) return prev;
      const myPlayer = prev.players.find(p => p.id === prev.myPlayerId);
      if (!myPlayer || !myPlayer.hand) return prev;

      const playedCard = myPlayer.hand.find(c => c.id === cardId);
      if (!playedCard) return prev;

      const meldSet = new Set(meldCardIds || []);
      meldSet.add(cardId);

      const updatedHand = myPlayer.hand.filter(c => !meldSet.has(c.id));

      const updatedPlayers = prev.players.map(p =>
        p.id === prev.myPlayerId
          ? { ...p, hand: updatedHand, cardCount: updatedHand.length }
          : p
      );

      return {
        ...prev,
        topDiscard: { ...playedCard, isFaceDown: isBluff },
        activeColor: declaredColor && declaredColor !== 'wild' ? declaredColor : (playedCard.color === 'wild' ? 'red' : playedCard.color),
        players: updatedPlayers
      };
    });

    socket.emit('play_card', { cardId, declaredColor, isBluff, meldCardIds });
  }, [socket, gameState]);

  const drawCard = useCallback(() => {
    if (!socket || !gameState) return;
    optimisticSnapshotRef.current = gameState;
    socket.emit('draw_card');
  }, [socket, gameState]);

  const betAnte = useCallback((amount: number) => {
    socket?.emit('bet_ante', { amount });
  }, [socket]);

  const callBluff = useCallback(() => {
    socket?.emit('call_bluff');
  }, [socket]);

  const concedeBluff = useCallback(() => {
    socket?.emit('concede_bluff');
  }, [socket]);

  const passTurn = useCallback(() => {
    socket?.emit('pass_turn');
  }, [socket]);

  const nextRound = useCallback(() => {
    socket?.emit('next_round');
  }, [socket]);

  const addBot = useCallback(() => {
    socket?.emit('add_bot');
  }, [socket]);

  const sendEmote = useCallback((emote: 'tomato' | 'chips' | 'slam' | 'fire' | 'clapping') => {
    socket?.emit('send_emote', { emote });
  }, [socket]);

  const leaveRoom = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setGameState(null);
    window.location.reload();
  }, []);

  return {
    socket,
    isConnected,
    gameState,
    alerts,
    activeEmotes,
    errorMessage,
    joinRoom,
    startGame,
    playCard,
    drawCard,
    betAnte,
    callBluff,
    concedeBluff,
    passTurn,
    nextRound,
    addBot,
    sendEmote,
    leaveRoom
  };
}
