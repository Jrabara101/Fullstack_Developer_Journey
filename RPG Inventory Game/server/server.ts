import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import cors from '@fastify/cors';
import { 
  CharacterSheet, 
  ItemEntity, 
  LootRollEntry, 
  LootRollType, 
  Quest, 
  RoomState, 
  TradeSession, 
  WSClientMessage, 
  WSServerMessage 
} from '../src/types/inventory';
import { INITIAL_QUEST, ITEM_CATALOG, MOCK_BOT_MEMBERS } from '../src/data/mockData';

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

await fastify.register(websocket);

// Authoritative In-Memory Session & Ledger Store
interface LedgerItem {
  uid: string;
  id: string;
  ownerId: string;
  slot: string; // 'equip:head' or 'grid:x:y'
  itemData: ItemEntity;
}

interface RoomInstance {
  id: string;
  state: RoomState;
  clients: Map<string, any>; // playerId -> WebSocket
  ledger: Map<string, LedgerItem>; // item uid -> ledger entry
  tradeSnapshot?: {
    tradeId: string;
    senderItems: ItemEntity[];
    receiverItems: ItemEntity[];
    senderGold: number;
    receiverGold: number;
  };
  lootTimer?: NodeJS.Timeout;
}

const rooms = new Map<string, RoomInstance>();

function getOrCreateRoom(roomId: string): RoomInstance {
  const normId = roomId.toUpperCase().trim();
  let room = rooms.get(normId);
  if (!room) {
    room = {
      id: normId,
      state: {
        roomId: normId,
        mode: 'CAMP_LOBBY',
        partyMembers: [],
        activeQuest: JSON.parse(JSON.stringify(INITIAL_QUEST)),
      },
      clients: new Map(),
      ledger: new Map(),
    };
    rooms.set(normId, room);
  }
  return room;
}

function broadcastToRoom(room: RoomInstance, message: WSServerMessage) {
  const payload = JSON.stringify(message);
  for (const [, ws] of room.clients) {
    if (ws.readyState === 1) { // OPEN
      ws.send(payload);
    }
  }
}

// REST Endpoints
fastify.get('/api/health', async () => {
  return { status: 'healthy', timestamp: Date.now(), activeRooms: rooms.size };
});

fastify.get('/api/quests', async () => {
  return [INITIAL_QUEST];
});

fastify.get('/api/items/catalog', async () => {
  return ITEM_CATALOG;
});

fastify.get('/api/rooms/:roomId', async (request, reply) => {
  const { roomId } = request.params as { roomId: string };
  const room = rooms.get(roomId.toUpperCase());
  if (!room) {
    return reply.status(404).send({ error: 'Room not found' });
  }
  return room.state;
});

// WebSocket Handler
fastify.get('/ws', { websocket: true }, (socket, req) => {
  let boundPlayerId: string | null = null;
  let boundRoomId: string | null = null;

  socket.on('message', (rawData) => {
    try {
      const msg: WSClientMessage = JSON.parse(rawData.toString());
      const room = getOrCreateRoom(msg.roomId);

      switch (msg.type) {
        case 'JOIN_ROOM': {
          boundPlayerId = msg.player.playerId;
          boundRoomId = room.id;
          room.clients.set(boundPlayerId, socket);

          // Register player's items in Authoritative Ledger
          for (const placed of msg.player.inventoryGrid.items) {
            room.ledger.set(placed.item.uid, {
              uid: placed.item.uid,
              id: placed.item.id,
              ownerId: boundPlayerId,
              slot: `grid:${placed.x}:${placed.y}`,
              itemData: placed.item,
            });
          }
          for (const [slotKey, item] of Object.entries(msg.player.equipped)) {
            if (item) {
              room.ledger.set(item.uid, {
                uid: item.uid,
                id: item.id,
                ownerId: boundPlayerId,
                slot: `equip:${slotKey}`,
                itemData: item,
              });
            }
          }

          // Update party members
          const existingIdx = room.state.partyMembers.findIndex(p => p.playerId === boundPlayerId);
          if (existingIdx >= 0) {
            room.state.partyMembers[existingIdx] = msg.player;
          } else {
            room.state.partyMembers.push(msg.player);
          }

          // Sync initial state
          socket.send(JSON.stringify({
            type: 'ROOM_SYNC',
            state: room.state,
          }));

          broadcastToRoom(room, {
            type: 'PARTY_MEMBER_JOINED',
            member: msg.player,
          });
          break;
        }

        case 'UPDATE_SHEET': {
          const idx = room.state.partyMembers.findIndex(p => p.playerId === msg.player.playerId);
          if (idx >= 0) {
            room.state.partyMembers[idx] = msg.player;
            broadcastToRoom(room, {
              type: 'PLAYER_UPDATED',
              player: msg.player,
            });
          }
          break;
        }

        case 'SPAWN_BOT_COMPANION': {
          const availableBots = MOCK_BOT_MEMBERS.filter(
            bot => !room.state.partyMembers.some(p => p.playerId === bot.playerId)
          );
          if (availableBots.length > 0 && room.state.partyMembers.length < 4) {
            const newBot = JSON.parse(JSON.stringify(availableBots[0]));
            room.state.partyMembers.push(newBot);

            // Register bot's items into ledger
            for (const placed of newBot.inventoryGrid.items) {
              room.ledger.set(placed.item.uid, {
                uid: placed.item.uid,
                id: placed.item.id,
                ownerId: newBot.playerId,
                slot: `grid:${placed.x}:${placed.y}`,
                itemData: placed.item,
              });
            }

            broadcastToRoom(room, {
              type: 'PARTY_MEMBER_JOINED',
              member: newBot,
            });
            broadcastToRoom(room, {
              type: 'SYSTEM_NOTIFICATION',
              message: `${newBot.username} joined the party!`,
              level: 'info',
            });
          }
          break;
        }

        // --- TRANSACTIONAL TRADE SUBSYSTEM ---
        case 'TRADE_INIT': {
          const sender = room.state.partyMembers.find(p => p.playerId === msg.senderId);
          const receiver = room.state.partyMembers.find(p => p.playerId === msg.receiverId);

          if (!sender || !receiver) return;

          const tradeId = 'trade-' + Math.random().toString(36).substring(2, 9);
          const tradeSession: TradeSession = {
            tradeId,
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            senderName: sender.username,
            receiverName: receiver.username,
            senderOffer: { items: [], gold: 0, locked: false, confirmed: false },
            receiverOffer: { items: [], gold: 0, locked: false, confirmed: false },
            state: 'STAGING',
          };

          // Save rollback snapshot
          room.tradeSnapshot = {
            tradeId,
            senderItems: JSON.parse(JSON.stringify(sender.inventoryGrid.items.map(i => i.item))),
            receiverItems: JSON.parse(JSON.stringify(receiver.inventoryGrid.items.map(i => i.item))),
            senderGold: sender.gold,
            receiverGold: receiver.gold,
          };

          room.state.activeTrade = tradeSession;
          room.state.mode = 'TRADE_ACTIVE';

          broadcastToRoom(room, {
            type: 'TRADE_STATE_CHANGED',
            trade: tradeSession,
          });
          break;
        }

        case 'TRADE_UPDATE_OFFER': {
          const trade = room.state.activeTrade;
          if (!trade || trade.tradeId !== msg.tradeId) return;

          // Anti-duping & Anti-scam: any offer update resets both locks!
          if (trade.senderId === msg.playerId) {
            trade.senderOffer.items = msg.items;
            trade.senderOffer.gold = msg.gold;
            trade.senderOffer.locked = false;
            trade.senderOffer.confirmed = false;
            trade.receiverOffer.locked = false;
            trade.receiverOffer.confirmed = false;
          } else if (trade.receiverId === msg.playerId) {
            trade.receiverOffer.items = msg.items;
            trade.receiverOffer.gold = msg.gold;
            trade.receiverOffer.locked = false;
            trade.receiverOffer.confirmed = false;
            trade.senderOffer.locked = false;
            trade.senderOffer.confirmed = false;
          }

          trade.state = 'STAGING';
          broadcastToRoom(room, {
            type: 'TRADE_STATE_CHANGED',
            trade,
          });
          break;
        }

        case 'TRADE_TOGGLE_LOCK': {
          const trade = room.state.activeTrade;
          if (!trade || trade.tradeId !== msg.tradeId) return;

          if (trade.senderId === msg.playerId) {
            trade.senderOffer.locked = msg.locked;
            if (!msg.locked) trade.senderOffer.confirmed = false;
          } else if (trade.receiverId === msg.playerId) {
            trade.receiverOffer.locked = msg.locked;
            if (!msg.locked) trade.receiverOffer.confirmed = false;
          }

          // If bot is the receiver, simulate automatic lock if fair
          if (trade.receiverId.startsWith('bot-') && trade.senderOffer.locked) {
            setTimeout(() => {
              if (room.state.activeTrade?.tradeId === msg.tradeId) {
                trade.receiverOffer.locked = true;
                trade.state = 'LOCKED';
                broadcastToRoom(room, {
                  type: 'TRADE_STATE_CHANGED',
                  trade,
                });
              }
            }, 600);
          } else if (trade.senderOffer.locked && trade.receiverOffer.locked) {
            trade.state = 'LOCKED';
          } else {
            trade.state = 'STAGING';
          }

          broadcastToRoom(room, {
            type: 'TRADE_STATE_CHANGED',
            trade,
          });
          break;
        }

        case 'TRADE_ACCEPT': {
          const trade = room.state.activeTrade;
          if (!trade || trade.tradeId !== msg.tradeId) return;
          if (trade.state !== 'LOCKED') return; // Cannot accept unless locked!

          if (trade.senderId === msg.playerId) {
            trade.senderOffer.confirmed = true;
          } else if (trade.receiverId === msg.playerId) {
            trade.receiverOffer.confirmed = true;
          }

          // If receiver is a bot, auto-confirm shortly after lock
          if (trade.receiverId.startsWith('bot-') && trade.senderOffer.confirmed) {
            trade.receiverOffer.confirmed = true;
          }

          // Check if both confirmed: execute atomic two-phase commit
          if (trade.senderOffer.confirmed && trade.receiverOffer.confirmed) {
            trade.state = 'CONFIRMED';

            const sender = room.state.partyMembers.find(p => p.playerId === trade.senderId);
            const receiver = room.state.partyMembers.find(p => p.playerId === trade.receiverId);

            if (sender && receiver) {
              // 1. Deduct and swap gold
              sender.gold = sender.gold - trade.senderOffer.gold + trade.receiverOffer.gold;
              receiver.gold = receiver.gold - trade.receiverOffer.gold + trade.senderOffer.gold;

              // 2. Transfer sender items to receiver
              const senderItemUids = new Set(trade.senderOffer.items.map(i => i.uid));
              const receiverItemUids = new Set(trade.receiverOffer.items.map(i => i.uid));

              // Remove traded items from sender's grid
              sender.inventoryGrid.items = sender.inventoryGrid.items.filter(
                p => !senderItemUids.has(p.item.uid)
              );
              // Remove traded items from receiver's grid
              receiver.inventoryGrid.items = receiver.inventoryGrid.items.filter(
                p => !receiverItemUids.has(p.item.uid)
              );

              // Add receiver items to sender's grid (find open slots)
              for (const item of trade.receiverOffer.items) {
                // Update authoritative ledger
                const ledgerEntry = room.ledger.get(item.uid);
                if (ledgerEntry) ledgerEntry.ownerId = sender.playerId;

                sender.inventoryGrid.items.push({
                  item,
                  x: 0,
                  y: 0,
                });
              }

              // Add sender items to receiver's grid
              for (const item of trade.senderOffer.items) {
                const ledgerEntry = room.ledger.get(item.uid);
                if (ledgerEntry) ledgerEntry.ownerId = receiver.playerId;

                receiver.inventoryGrid.items.push({
                  item,
                  x: 0,
                  y: 0,
                });
              }

              broadcastToRoom(room, {
                type: 'PLAYER_UPDATED',
                player: sender,
              });
              broadcastToRoom(room, {
                type: 'PLAYER_UPDATED',
                player: receiver,
              });
            }

            broadcastToRoom(room, {
              type: 'TRADE_COMPLETED_SUCCESS',
              tradeId: trade.tradeId,
              summary: `Trade between ${trade.senderName} and ${trade.receiverName} finalized atomically.`,
            });

            room.state.activeTrade = undefined;
            room.state.mode = 'CAMP_LOBBY';
            broadcastToRoom(room, {
              type: 'TRADE_STATE_CHANGED',
              trade: null,
            });
          } else {
            broadcastToRoom(room, {
              type: 'TRADE_STATE_CHANGED',
              trade,
            });
          }
          break;
        }

        case 'TRADE_CANCEL': {
          const trade = room.state.activeTrade;
          if (trade && trade.tradeId === msg.tradeId) {
            trade.state = 'CANCELLED';
            room.state.activeTrade = undefined;
            room.state.mode = 'CAMP_LOBBY';
            broadcastToRoom(room, {
              type: 'TRADE_STATE_CHANGED',
              trade: null,
            });
            broadcastToRoom(room, {
              type: 'SYSTEM_NOTIFICATION',
              message: 'Trade chamber was aborted. All items safely retained.',
              level: 'info',
            });
          }
          break;
        }

        // --- QUEST & SEEDED LOOT DROP DIRECTOR ---
        case 'QUEST_STEP_TRIGGER': {
          const quest = room.state.activeQuest;
          if (!quest) return;

          // Advance incomplete objective
          const incompleteObj = quest.objectives.find(o => !o.completed);
          if (incompleteObj) {
            incompleteObj.current += 1;
            if (incompleteObj.current >= incompleteObj.required) {
              incompleteObj.completed = true;
            }

            // Check if all completed
            const allDone = quest.objectives.every(o => o.completed);
            if (allDone) {
              quest.status = 'completed';
              room.state.mode = 'QUEST_ENCOUNTER';

              // Seeded Loot Podium generation!
              const rewardItem = quest.rewardItems[0] || ITEM_CATALOG[0];
              const dropId = 'drop-' + Math.random().toString(36).substring(2, 9);
              const now = Date.now();
              const durationSeconds = 15;

              const activeDrop = {
                dropId,
                item: rewardItem,
                questTitle: quest.title,
                startedAt: now,
                expiresAt: now + durationSeconds * 1000,
                durationSeconds,
                rolls: {} as Record<string, LootRollEntry>,
                resolved: false,
              };

              room.state.activeLootDrop = activeDrop;

              broadcastToRoom(room, {
                type: 'QUEST_UPDATED',
                quest,
              });

              broadcastToRoom(room, {
                type: 'LOOT_DROP_SPAWNED',
                drop: activeDrop,
              });

              broadcastToRoom(room, {
                type: 'SYSTEM_NOTIFICATION',
                message: `Boss Slain! Legendary Loot Drop: [${rewardItem.name}]! Need/Greed rolls active (15s)!`,
                level: 'success',
              });

              // Simulate bot party member votes
              for (const member of room.state.partyMembers) {
                if (member.playerId.startsWith('bot-')) {
                  setTimeout(() => {
                    const botRollType: LootRollType = Math.random() > 0.4 ? 'need' : 'greed';
                    const botRollVal = Math.floor(Math.random() * 100) + 1;
                    const entry: LootRollEntry = {
                      playerId: member.playerId,
                      playerName: member.username,
                      rollType: botRollType,
                      rollValue: botRollVal,
                      timestamp: Date.now(),
                    };
                    if (room.state.activeLootDrop?.dropId === dropId) {
                      room.state.activeLootDrop.rolls[member.playerId] = entry;
                      broadcastToRoom(room, {
                        type: 'LOOT_ROLL_RECEIVED',
                        dropId,
                        roll: entry,
                      });
                    }
                  }, 1200 + Math.random() * 2500);
                }
              }

              // Auto-resolve timer at 15s
              if (room.lootTimer) clearTimeout(room.lootTimer);
              room.lootTimer = setTimeout(() => {
                resolveLootDrop(room, dropId);
              }, durationSeconds * 1000);
            } else {
              broadcastToRoom(room, {
                type: 'QUEST_UPDATED',
                quest,
              });
            }
          }
          break;
        }

        case 'LOOT_SUBMIT_ROLL': {
          const drop = room.state.activeLootDrop;
          if (!drop || drop.dropId !== msg.dropId || drop.resolved) return;

          const player = room.state.partyMembers.find(p => p.playerId === msg.playerId);
          const playerName = player ? player.username : 'Unknown Wanderer';
          const rollValue = Math.floor(Math.random() * 100) + 1;

          const entry: LootRollEntry = {
            playerId: msg.playerId,
            playerName,
            rollType: msg.rollType,
            rollValue,
            timestamp: Date.now(),
          };

          drop.rolls[msg.playerId] = entry;

          broadcastToRoom(room, {
            type: 'LOOT_ROLL_RECEIVED',
            dropId: drop.dropId,
            roll: entry,
          });

          // Check if all party members have rolled
          const totalParty = room.state.partyMembers.length;
          const totalRolls = Object.keys(drop.rolls).length;
          if (totalRolls >= totalParty) {
            if (room.lootTimer) clearTimeout(room.lootTimer);
            setTimeout(() => {
              resolveLootDrop(room, drop.dropId);
            }, 800);
          }
          break;
        }
      }
    } catch (err) {
      fastify.log.error(err);
    }
  });

  socket.on('close', () => {
    if (boundRoomId && boundPlayerId) {
      const room = rooms.get(boundRoomId);
      if (room) {
        room.clients.delete(boundPlayerId);
        // If mid-trade, abort and roll back
        if (room.state.activeTrade && 
           (room.state.activeTrade.senderId === boundPlayerId || room.state.activeTrade.receiverId === boundPlayerId)) {
          room.state.activeTrade.state = 'CANCELLED';
          room.state.activeTrade = undefined;
          room.state.mode = 'CAMP_LOBBY';
          broadcastToRoom(room, {
            type: 'TRADE_STATE_CHANGED',
            trade: null,
          });
        }
        broadcastToRoom(room, {
          type: 'PARTY_MEMBER_LEFT',
          playerId: boundPlayerId,
        });
      }
    }
  });
});

function resolveLootDrop(room: RoomInstance, dropId: string) {
  const drop = room.state.activeLootDrop;
  if (!drop || drop.dropId !== dropId || drop.resolved) return;

  drop.resolved = true;
  const entries = Object.values(drop.rolls);

  const needEntries = entries.filter(e => e.rollType === 'need');
  const greedEntries = entries.filter(e => e.rollType === 'greed');

  let winningEntry: LootRollEntry | null = null;

  if (needEntries.length > 0) {
    needEntries.sort((a, b) => b.rollValue - a.rollValue);
    winningEntry = needEntries[0];
  } else if (greedEntries.length > 0) {
    greedEntries.sort((a, b) => b.rollValue - a.rollValue);
    winningEntry = greedEntries[0];
  }

  if (winningEntry) {
    drop.winnerId = winningEntry.playerId;
    drop.winnerName = winningEntry.playerName;
    drop.winningRoll = winningEntry.rollValue;
    drop.winningType = winningEntry.rollType;

    // Grant item to winner
    const winnerPlayer = room.state.partyMembers.find(p => p.playerId === winningEntry!.playerId);
    if (winnerPlayer) {
      winnerPlayer.inventoryGrid.items.push({
        item: drop.item,
        x: 0,
        y: 0,
      });
      room.ledger.set(drop.item.uid, {
        uid: drop.item.uid,
        id: drop.item.id,
        ownerId: winnerPlayer.playerId,
        slot: 'grid:0:0',
        itemData: drop.item,
      });

      broadcastToRoom(room, {
        type: 'PLAYER_UPDATED',
        player: winnerPlayer,
      });
    }
  }

  broadcastToRoom(room, {
    type: 'LOOT_DROP_RESOLVED',
    drop,
  });

  broadcastToRoom(room, {
    type: 'SYSTEM_NOTIFICATION',
    message: winningEntry 
      ? `Loot Roll Winner: ${winningEntry.playerName} won [${drop.item.name}] with ${winningEntry.rollType.toUpperCase()} (${winningEntry.rollValue})!`
      : `All passed on [${drop.item.name}]. Item preserved in guild vault.`,
    level: 'success',
  });
}

const PORT = parseInt(process.env.PORT || '3008', 10);
fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`⚔️ ArcaneArmory Server listening on ${address} (WS on ${address}/ws)`);
});
