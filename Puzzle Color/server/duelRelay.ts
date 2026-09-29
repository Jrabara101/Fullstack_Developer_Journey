import { WebSocket } from 'ws';

interface DuelPlayer {
  id: string;
  name: string;
  ws: WebSocket;
  deltaE: number;
  colorHex: string;
  moves: number;
  isFinished: boolean;
}

interface DuelRoom {
  roomId: string;
  puzzleId: string;
  players: Map<string, DuelPlayer>;
}

class DuelRelay {
  private rooms: Map<string, DuelRoom> = new Map();
  private waitingPlayer: { ws: WebSocket; playerName: string } | null = null;

  public handleConnection(ws: WebSocket) {
    let playerId = `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    let currentRoomId: string | null = null;

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());

        switch (data.type) {
          case 'join_queue': {
            const playerName = data.playerName || 'Alchemist';
            if (this.waitingPlayer && this.waitingPlayer.ws.readyState === WebSocket.OPEN) {
              // Match found! Create room
              const room: DuelRoom = {
                roomId: `duel_${Date.now()}`,
                puzzleId: data.puzzleId || 'DAILY',
                players: new Map(),
              };

              const p1: DuelPlayer = {
                id: `p_host_${Date.now()}`,
                name: this.waitingPlayer.playerName,
                ws: this.waitingPlayer.ws,
                deltaE: 18.0,
                colorHex: '#C3C6D0',
                moves: 0,
                isFinished: false,
              };

              const p2: DuelPlayer = {
                id: playerId,
                name: playerName,
                ws,
                deltaE: 18.0,
                colorHex: '#C3C6D0',
                moves: 0,
                isFinished: false,
              };

              room.players.set(p1.id, p1);
              room.players.set(p2.id, p2);
              this.rooms.set(room.roomId, room);
              currentRoomId = room.roomId;

              // Notify both players
              p1.ws.send(
                JSON.stringify({
                  type: 'match_start',
                  roomId: room.roomId,
                  opponent: { id: p2.id, name: p2.name },
                })
              );
              p2.ws.send(
                JSON.stringify({
                  type: 'match_start',
                  roomId: room.roomId,
                  opponent: { id: p1.id, name: p1.name },
                })
              );

              this.waitingPlayer = null;
            } else {
              // Wait in queue
              this.waitingPlayer = { ws, playerName };
              ws.send(JSON.stringify({ type: 'queued', message: 'Seeking opponent in optical bay...' }));
            }
            break;
          }

          case 'update_progress': {
            if (!currentRoomId) return;
            const room = this.rooms.get(currentRoomId);
            if (!room) return;

            // Update player state and broadcast to opponent
            room.players.forEach((player) => {
              if (player.id === playerId) {
                player.deltaE = data.deltaE;
                player.colorHex = data.colorHex;
                player.moves = data.moves;
              } else if (player.ws.readyState === WebSocket.OPEN) {
                player.ws.send(
                  JSON.stringify({
                    type: 'opponent_update',
                    deltaE: data.deltaE,
                    colorHex: data.colorHex,
                    moves: data.moves,
                  })
                );
              }
            });
            break;
          }

          case 'player_finish': {
            if (!currentRoomId) return;
            const room = this.rooms.get(currentRoomId);
            if (!room) return;

            room.players.forEach((player) => {
              if (player.ws.readyState === WebSocket.OPEN) {
                player.ws.send(
                  JSON.stringify({
                    type: 'match_end',
                    winnerId: playerId,
                    winnerDeltaE: data.deltaE,
                  })
                );
              }
            });
            break;
          }
        }
      } catch (err) {
        console.error('WebSocket message parsing error', err);
      }
    });

    ws.on('close', () => {
      if (this.waitingPlayer?.ws === ws) {
        this.waitingPlayer = null;
      }
      if (currentRoomId) {
        const room = this.rooms.get(currentRoomId);
        if (room) {
          room.players.forEach((p) => {
            if (p.id !== playerId && p.ws.readyState === WebSocket.OPEN) {
              p.ws.send(JSON.stringify({ type: 'opponent_disconnected' }));
            }
          });
          this.rooms.delete(currentRoomId);
        }
      }
    });
  }
}

export const duelRelay = new DuelRelay();
