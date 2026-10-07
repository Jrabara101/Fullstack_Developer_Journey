import { useState, useEffect, useRef, useCallback } from 'react';
import type { PeerPetState, HybridSeed } from '../types/pet';

export function usePlaydateWs(petId?: string, petName?: string, speciesId?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [peers, setPeers] = useState<PeerPetState[]>([]);
  const [ballSync, setBallSync] = useState<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const [newSeedAlert, setNewSeedAlert] = useState<HybridSeed | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connectToRoom = useCallback(
    (targetRoomId: string) => {
      if (!petId) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // In dev with proxy or direct
      const host = window.location.port === '5173' ? '127.0.0.1:3001' : window.location.host;
      const wsUrl = `${protocol}//${host}/ws/playdate`;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          ws.send(
            JSON.stringify({
              type: 'JOIN_ROOM',
              roomId: targetRoomId.toUpperCase(),
              petInfo: {
                petId,
                petName: petName || 'Playful Pal',
                speciesId: speciesId || 'blobkin',
                mood: 'CONTENT',
              },
            })
          );
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            switch (data.type) {
              case 'ROOM_JOINED':
                setRoomId(data.roomId);
                setPeers(
                  data.peers
                    .filter((p: PeerPetState) => p.petId !== petId)
                    .map((p: PeerPetState) => ({ ...p, lastUpdate: Date.now() }))
                );
                if (data.ball) {
                  setBallSync(data.ball);
                }
                break;

              case 'PEER_JOINED':
                if (data.peer.petId !== petId) {
                  setPeers((prev) => [
                    ...prev.filter((p) => p.petId !== data.peer.petId),
                    { ...data.peer, lastUpdate: Date.now() },
                  ]);
                }
                break;

              case 'PEER_LEFT':
                setPeers((prev) => prev.filter((p) => p.petId !== data.petId));
                break;

              case 'PEER_MOVED':
                setPeers((prev) =>
                  prev.map((p) =>
                    p.petId === data.petId
                      ? { ...p, x: data.x, y: data.y, mood: data.mood || p.mood, lastUpdate: Date.now() }
                      : p
                  )
                );
                break;

              case 'PEER_EMOTE':
                setPeers((prev) =>
                  prev.map((p) =>
                    p.petId === data.petId
                      ? { ...p, emote: data.emote, lastUpdate: Date.now() }
                      : p
                  )
                );
                break;

              case 'BALL_SYNC':
                setBallSync(data.ball);
                break;

              case 'POLLEN_SWAP_SUCCESS':
                setNewSeedAlert(data.seed);
                break;
            }
          } catch (e) {
            console.error('[WS] Parse error:', e);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          setRoomId(null);
          setPeers([]);
        };
      } catch (err) {
        console.error('[WS] Connection failed:', err);
      }
    },
    [petId, petName, speciesId]
  );

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setRoomId(null);
    setPeers([]);
  }, []);

  const sendMove = useCallback(
    (x: number, y: number, mood: string) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && roomId && petId) {
        wsRef.current.send(
          JSON.stringify({
            type: 'PET_MOVE',
            roomId,
            petId,
            x,
            y,
            mood,
          })
        );
      }
    },
    [roomId, petId]
  );

  const sendEmote = useCallback(
    (emote: string) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && roomId && petId) {
        wsRef.current.send(
          JSON.stringify({
            type: 'PET_EMOTE',
            roomId,
            petId,
            emote,
          })
        );
      }
    },
    [roomId, petId]
  );

  const sendBallKick = useCallback(
    (ballX: number, ballY: number, vx: number, vy: number) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && roomId && petId) {
        wsRef.current.send(
          JSON.stringify({
            type: 'BALL_KICK',
            roomId,
            petId,
            ballX,
            ballY,
            vx,
            vy,
          })
        );
      }
    },
    [roomId, petId]
  );

  const requestPollenSwap = useCallback(
    (targetPetId: string) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && roomId && petId) {
        wsRef.current.send(
          JSON.stringify({
            type: 'POLLEN_SWAP_REQUEST',
            roomId,
            petId,
            targetPetId,
          })
        );
      }
    },
    [roomId, petId]
  );

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    roomId,
    peers,
    ballSync,
    newSeedAlert,
    setNewSeedAlert,
    connectToRoom,
    disconnect,
    sendMove,
    sendEmote,
    sendBallKick,
    requestPollenSwap,
  };
}
