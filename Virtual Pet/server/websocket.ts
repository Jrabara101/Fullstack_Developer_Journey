import { WebSocket } from 'ws';
import { db } from './db.js';

interface ClientSession {
  ws: WebSocket;
  petId: string;
  petName: string;
  speciesId: string;
  roomId: string;
  x: number;
  y: number;
  mood: string;
}

interface Room {
  id: string;
  clients: Map<string, ClientSession>;
  ball: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    lastUpdate: number;
  };
}

class PlaydateRelayService {
  private rooms: Map<string, Room> = new Map();

  public joinRoom(
    roomId: string,
    ws: WebSocket,
    petInfo: { petId: string; petName: string; speciesId: string; mood: string; x?: number; y?: number }
  ): string {
    const code = roomId.toUpperCase().trim();
    let room = this.rooms.get(code);

    if (!room) {
      room = {
        id: code,
        clients: new Map(),
        ball: {
          x: 400,
          y: 200,
          vx: 0,
          vy: 0,
          lastUpdate: Date.now(),
        },
      };
      this.rooms.set(code, room);
    }

    if (room.clients.size >= 4) {
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Playdate room is full (maximum 4 pets).' }));
      return code;
    }

    const session: ClientSession = {
      ws,
      petId: petInfo.petId,
      petName: petInfo.petName || 'Visitor Pet',
      speciesId: petInfo.speciesId || 'blobkin',
      roomId: code,
      x: petInfo.x || 200 + Math.random() * 200,
      y: petInfo.y || 300,
      mood: petInfo.mood || 'CONTENT',
    };

    room.clients.set(petInfo.petId, session);

    // Send room welcome packet with peers and current ball state
    const peerList = Array.from(room.clients.values()).map((c) => ({
      petId: c.petId,
      name: c.petName,
      speciesId: c.speciesId,
      x: c.x,
      y: c.y,
      mood: c.mood,
    }));

    ws.send(
      JSON.stringify({
        type: 'ROOM_JOINED',
        roomId: code,
        peers: peerList,
        ball: room.ball,
      })
    );

    // Broadcast new peer arrival to other participants
    this.broadcastToRoom(
      code,
      {
        type: 'PEER_JOINED',
        peer: {
          petId: session.petId,
          name: session.petName,
          speciesId: session.speciesId,
          x: session.x,
          y: session.y,
          mood: session.mood,
        },
      },
      petInfo.petId
    );

    return code;
  }

  public leaveRoom(roomId: string, petId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.clients.delete(petId);
    if (room.clients.size === 0) {
      this.rooms.delete(roomId);
    } else {
      this.broadcastToRoom(roomId, {
        type: 'PEER_LEFT',
        petId,
      });
    }
  }

  public handleMessage(ws: WebSocket, rawData: string) {
    try {
      const packet = JSON.parse(rawData);
      const { type, roomId, petId } = packet;
      const room = this.rooms.get(roomId);
      if (!room) return;

      const sender = room.clients.get(petId);

      switch (type) {
        case 'PET_MOVE': {
          if (sender) {
            sender.x = packet.x;
            sender.y = packet.y;
            sender.mood = packet.mood || sender.mood;
            this.broadcastToRoom(
              roomId,
              {
                type: 'PEER_MOVED',
                petId,
                x: packet.x,
                y: packet.y,
                mood: packet.mood,
              },
              petId
            );
          }
          break;
        }

        case 'PET_EMOTE': {
          this.broadcastToRoom(
            roomId,
            {
              type: 'PEER_EMOTE',
              petId,
              emote: packet.emote,
            },
            petId
          );
          break;
        }

        case 'BALL_KICK': {
          room.ball.x = packet.ballX;
          room.ball.y = packet.ballY;
          room.ball.vx = packet.vx;
          room.ball.vy = packet.vy;
          room.ball.lastUpdate = Date.now();

          this.broadcastToRoom(roomId, {
            type: 'BALL_SYNC',
            ball: room.ball,
            kickerId: petId,
          });
          break;
        }

        case 'POLLEN_SWAP_REQUEST': {
          const targetPeer = room.clients.get(packet.targetPetId);
          if (targetPeer && sender) {
            // Generate non-fungible hybrid seed
            const seedId = `seed_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            const traits = [
              `${sender.speciesId} Resonant Core`,
              `${targetPeer.speciesId} Epigenetic Mark`,
              'Pollen Infused Vitality',
            ];
            const rarities: ('COMMON' | 'RARE' | 'MYTHIC' | 'CELESTIAL')[] = ['COMMON', 'RARE', 'MYTHIC'];
            const rarity = rarities[Math.floor(Math.random() * rarities.length)];

            try {
              db.prepare(
                `INSERT INTO seed_vault (id, pet_id, donor_pet_name, donor_species, rarity, traits_json, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`
              ).run(
                seedId,
                sender.petId,
                targetPeer.petName,
                targetPeer.speciesId,
                rarity,
                JSON.stringify(traits),
                new Date().toISOString()
              );
            } catch (err) {
              console.error('[SQLite] Seed vault insert err:', err);
            }

            const responsePayload = {
              type: 'POLLEN_SWAP_SUCCESS',
              seed: {
                id: seedId,
                donorPetName: targetPeer.petName,
                donorSpecies: targetPeer.speciesId,
                rarity,
                traits,
                createdAt: new Date().toISOString(),
              },
            };

            ws.send(JSON.stringify(responsePayload));
            targetPeer.ws.send(JSON.stringify(responsePayload));
          }
          break;
        }
      }
    } catch (e) {
      console.error('[WS] Packet parse error:', e);
    }
  }

  public broadcastToRoom(roomId: string, payload: unknown, excludePetId?: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const data = JSON.stringify(payload);
    for (const [id, client] of room.clients.entries()) {
      if (excludePetId && id === excludePetId) continue;
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    }
  }
}

export const playdateRelay = new PlaydateRelayService();
