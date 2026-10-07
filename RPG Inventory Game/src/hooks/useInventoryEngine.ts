import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  CharacterSheet, 
  EquipSlot, 
  ItemEntity, 
  PlacedItem, 
  RoomState, 
  TradeSession, 
  LootRollType, 
  ActiveLootDrop,
  WSServerMessage,
  WSClientMessage
} from '../types/inventory';
import { INITIAL_PLAYER_SHEET, INITIAL_QUEST, ITEM_CATALOG, MOCK_BOT_MEMBERS } from '../data/mockData';
import { computeCharacterStats } from '../engine/statCalculator';
import { autoSort2DBinPacking, canPlaceItem, findAvailableSlot } from '../engine/spatialGrid';
import { 
  playDropSound, 
  playEquipSound, 
  playErrorSound, 
  playFanfareSound, 
  playPickupSound, 
  playRotateSound 
} from '../engine/audioEngine';
import confetti from 'canvas-confetti';

export interface DraggedItemState {
  item: ItemEntity;
  origin: 'grid' | 'equipment';
  originX?: number;
  originY?: number;
  originSlot?: EquipSlot;
}

export function useInventoryEngine(defaultRoomId: string = 'VALK') {
  const [roomId, setRoomId] = useState(defaultRoomId);
  const [playerSheet, setPlayerSheet] = useState<CharacterSheet>(INITIAL_PLAYER_SHEET);
  const [roomState, setRoomState] = useState<RoomState>({
    roomId: defaultRoomId,
    mode: 'CAMP_LOBBY',
    partyMembers: [INITIAL_PLAYER_SHEET, ...MOCK_BOT_MEMBERS],
    activeQuest: INITIAL_QUEST,
  });

  const [draggedItem, setDraggedItem] = useState<DraggedItemState | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const [hoveredEquipSlot, setHoveredEquipSlot] = useState<EquipSlot | null>(null);
  const [hoveredItemForTooltip, setHoveredItemForTooltip] = useState<{ item: ItemEntity; rect?: DOMRect } | null>(null);
  const [inspectTarget, setInspectTarget] = useState<CharacterSheet | null>(null);
  const [notification, setNotification] = useState<{ text: string; level: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Show auto-dismiss notification
  const showNotification = useCallback((text: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setNotification({ text, level });
    setTimeout(() => {
      setNotification(prev => (prev?.text === text ? null : prev));
    }, 4000);
  }, []);

  // Send message over WebSocket
  const sendWSMessage = useCallback((msg: WSClientMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  // Connect to WebSocket Server
  useEffect(() => {
    const wsUrl = `ws://${window.location.hostname}:3008/ws`;
    let ws: WebSocket;

    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        ws.send(JSON.stringify({
          type: 'JOIN_ROOM',
          roomId,
          player: playerSheet,
        } as WSClientMessage));
      };

      ws.onmessage = (event) => {
        try {
          const msg: WSServerMessage = JSON.parse(event.data);

          switch (msg.type) {
            case 'ROOM_SYNC':
              setRoomState(msg.state);
              // Also ensure local player matches if authoritative
              const remoteSelf = msg.state.partyMembers.find(p => p.playerId === playerSheet.playerId);
              if (remoteSelf) {
                setPlayerSheet(remoteSelf);
              }
              break;

            case 'PARTY_MEMBER_JOINED':
              setRoomState(prev => {
                const filtered = prev.partyMembers.filter(p => p.playerId !== msg.member.playerId);
                return { ...prev, partyMembers: [...filtered, msg.member] };
              });
              break;

            case 'PARTY_MEMBER_LEFT':
              setRoomState(prev => ({
                ...prev,
                partyMembers: prev.partyMembers.filter(p => p.playerId !== msg.playerId),
              }));
              break;

            case 'PLAYER_UPDATED':
              setRoomState(prev => ({
                ...prev,
                partyMembers: prev.partyMembers.map(p => p.playerId === msg.player.playerId ? msg.player : p),
              }));
              if (msg.player.playerId === playerSheet.playerId) {
                setPlayerSheet(msg.player);
              }
              break;

            case 'TRADE_STATE_CHANGED':
              setRoomState(prev => ({
                ...prev,
                activeTrade: msg.trade || undefined,
                mode: msg.trade ? 'TRADE_ACTIVE' : 'CAMP_LOBBY',
              }));
              break;

            case 'TRADE_COMPLETED_SUCCESS':
              playFanfareSound();
              confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
              showNotification(msg.summary, 'success');
              break;

            case 'QUEST_UPDATED':
              setRoomState(prev => ({ ...prev, activeQuest: msg.quest }));
              break;

            case 'LOOT_DROP_SPAWNED':
              playFanfareSound();
              setRoomState(prev => ({ ...prev, activeLootDrop: msg.drop, mode: 'QUEST_ENCOUNTER' }));
              showNotification(`Epic Drop: ${msg.drop.item.name}! Roll Need/Greed!`, 'success');
              break;

            case 'LOOT_ROLL_RECEIVED':
              setRoomState(prev => {
                if (!prev.activeLootDrop || prev.activeLootDrop.dropId !== msg.dropId) return prev;
                return {
                  ...prev,
                  activeLootDrop: {
                    ...prev.activeLootDrop,
                    rolls: {
                      ...prev.activeLootDrop.rolls,
                      [msg.roll.playerId]: msg.roll,
                    },
                  },
                };
              });
              break;

            case 'LOOT_DROP_RESOLVED':
              if (msg.drop.winnerId === playerSheet.playerId) {
                playFanfareSound();
                confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
                showNotification(`You won [${msg.drop.item.name}]!`, 'success');
              }
              setRoomState(prev => ({
                ...prev,
                activeLootDrop: msg.drop,
              }));
              break;

            case 'SYSTEM_NOTIFICATION':
              showNotification(msg.message, msg.level);
              break;
          }
        } catch (err) {
          console.error('Failed to parse WS message', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
      };

      ws.onerror = () => {
        setIsConnected(false);
      };
    } catch (err) {
      console.warn('WebSocket server unavailable, running in local simulated mode.', err);
    }

    return () => {
      if (ws) ws.close();
    };
  }, [roomId, showNotification]);

  // Sync sheet state changes to WS backend
  const syncSheetToServer = useCallback((newSheet: CharacterSheet) => {
    sendWSMessage({
      type: 'UPDATE_SHEET',
      roomId,
      player: newSheet,
    });
  }, [roomId, sendWSMessage]);

  // Computed live stats
  const computedStats = computeCharacterStats(playerSheet);

  // --- GRID & EQUIPMENT ACTIONS ---

  /**
   * Begin Dragging an item from grid or equipment
   */
  const handleStartDrag = useCallback((
    item: ItemEntity, 
    origin: 'grid' | 'equipment', 
    originX?: number, 
    originY?: number, 
    originSlot?: EquipSlot
  ) => {
    playPickupSound();
    setDraggedItem({ item, origin, originX, originY, originSlot });
  }, []);

  /**
   * Rotate currently dragged item
   */
  const handleRotateDragged = useCallback(() => {
    if (!draggedItem) return;
    playRotateSound();
    setDraggedItem(prev => {
      if (!prev) return null;
      return {
        ...prev,
        item: {
          ...prev.item,
          isRotated: !prev.item.isRotated,
        },
      };
    });
  }, [draggedItem]);

  /**
   * Cancel or Drop drag operation
   */
  const handleCancelDrag = useCallback(() => {
    setDraggedItem(null);
    setHoveredCell(null);
    setHoveredEquipSlot(null);
  }, []);

  /**
   * Place dragged item into bag grid at (targetX, targetY)
   */
  const handleDropOnGrid = useCallback((targetX: number, targetY: number) => {
    if (!draggedItem) return;

    const { item, origin, originSlot } = draggedItem;
    const itemsWithoutDragged = playerSheet.inventoryGrid.items.filter(
      p => p.item.uid !== item.uid
    );

    const valid = canPlaceItem(
      itemsWithoutDragged,
      item,
      targetX,
      targetY,
      item.isRotated,
      playerSheet.inventoryGrid.cols,
      playerSheet.inventoryGrid.rows
    );

    if (!valid) {
      playErrorSound();
      showNotification('Cannot place item here: Obstacle or out of grid bounds!', 'warning');
      setDraggedItem(null);
      return;
    }

    playDropSound();

    let newEquipped = { ...playerSheet.equipped };
    if (origin === 'equipment' && originSlot) {
      delete newEquipped[originSlot];
    }

    const newPlacedItem: PlacedItem = {
      item,
      x: targetX,
      y: targetY,
    };

    const newSheet: CharacterSheet = {
      ...playerSheet,
      equipped: newEquipped,
      inventoryGrid: {
        ...playerSheet.inventoryGrid,
        items: [...itemsWithoutDragged, newPlacedItem],
      },
    };

    setPlayerSheet(newSheet);
    syncSheetToServer(newSheet);
    setDraggedItem(null);
    setHoveredCell(null);
  }, [draggedItem, playerSheet, showNotification, syncSheetToServer]);

  /**
   * Equip an item to a specific paper doll slot
   */
  const handleEquipItem = useCallback((item: ItemEntity, targetSlot?: EquipSlot) => {
    const slotToUse = targetSlot || item.equipSlot;
    if (!slotToUse) {
      playErrorSound();
      showNotification('This item cannot be equipped.', 'warning');
      return;
    }

    // Check slot compatibility
    const validArmorSlots: EquipSlot[] = ['head', 'chest', 'hands', 'legs', 'feet'];
    if (item.category === 'armor' && !validArmorSlots.includes(slotToUse) && slotToUse !== 'off_hand') {
      playErrorSound();
      showNotification(`Cannot equip ${item.name} to ${slotToUse}.`, 'warning');
      return;
    }

    if (item.category === 'weapon' && slotToUse !== 'main_hand' && slotToUse !== 'off_hand') {
      playErrorSound();
      showNotification('Weapons can only be equipped in Main Hand or Off Hand.', 'warning');
      return;
    }

    playEquipSound();

    let newEquipped = { ...playerSheet.equipped };
    let itemsInBag = playerSheet.inventoryGrid.items.filter(p => p.item.uid !== item.uid);
    const existingEquipped = newEquipped[slotToUse];

    // Handle Two-Handed Weapons: If 2H weapon equipped in main hand, off_hand shield must unequip to bag
    if (item.isTwoHanded && slotToUse === 'main_hand') {
      const existingOffHand = newEquipped['off_hand'];
      if (existingOffHand) {
        const slot = findAvailableSlot(itemsInBag, existingOffHand, playerSheet.inventoryGrid.cols, playerSheet.inventoryGrid.rows);
        if (slot) {
          itemsInBag.push({ item: existingOffHand, x: slot.x, y: slot.y });
          delete newEquipped['off_hand'];
          showNotification(`Unequipped ${existingOffHand.name} because ${item.name} is Two-Handed.`, 'info');
        } else {
          playErrorSound();
          showNotification('No inventory space to unequip off-hand item for Two-Handed weapon!', 'error');
          return;
        }
      }
    }

    // If equipping in off_hand, check if current main_hand is Two-Handed
    if (slotToUse === 'off_hand' && newEquipped['main_hand']?.isTwoHanded) {
      playErrorSound();
      showNotification('Cannot equip shield while wielding a Two-Handed weapon!', 'warning');
      return;
    }

    // Swap existing item back to bag if slot occupied
    if (existingEquipped) {
      const openSlot = findAvailableSlot(itemsInBag, existingEquipped, playerSheet.inventoryGrid.cols, playerSheet.inventoryGrid.rows);
      if (openSlot) {
        itemsInBag.push({ item: existingEquipped, x: openSlot.x, y: openSlot.y });
      } else {
        playErrorSound();
        showNotification('No inventory space to swap equipped item!', 'error');
        return;
      }
    }

    newEquipped[slotToUse] = item;

    const newSheet: CharacterSheet = {
      ...playerSheet,
      equipped: newEquipped,
      inventoryGrid: {
        ...playerSheet.inventoryGrid,
        items: itemsInBag,
      },
    };

    setPlayerSheet(newSheet);
    syncSheetToServer(newSheet);
    setDraggedItem(null);
    setHoveredEquipSlot(null);
    showNotification(`Equipped [${item.name}] into ${slotToUse.toUpperCase()}!`, 'success');
  }, [playerSheet, showNotification, syncSheetToServer]);

  /**
   * Unequip an item from paper doll slot back into bag
   */
  const handleUnequipItem = useCallback((slot: EquipSlot) => {
    const item = playerSheet.equipped[slot];
    if (!item) return;

    const openSlot = findAvailableSlot(
      playerSheet.inventoryGrid.items, 
      item, 
      playerSheet.inventoryGrid.cols, 
      playerSheet.inventoryGrid.rows
    );

    if (!openSlot) {
      playErrorSound();
      showNotification('Inventory full! Cannot unequip item.', 'error');
      return;
    }

    playPickupSound();

    let newEquipped = { ...playerSheet.equipped };
    delete newEquipped[slot];

    const newSheet: CharacterSheet = {
      ...playerSheet,
      equipped: newEquipped,
      inventoryGrid: {
        ...playerSheet.inventoryGrid,
        items: [
          ...playerSheet.inventoryGrid.items,
          { item: { ...item, isRotated: openSlot.isRotated }, x: openSlot.x, y: openSlot.y }
        ],
      },
    };

    setPlayerSheet(newSheet);
    syncSheetToServer(newSheet);
    showNotification(`Unequipped [${item.name}].`, 'info');
  }, [playerSheet, showNotification, syncSheetToServer]);

  /**
   * Drop item from inventory onto ground
   */
  const handleDropItem = useCallback((itemUid: string) => {
    playDropSound();
    const newItems = playerSheet.inventoryGrid.items.filter(p => p.item.uid !== itemUid);
    const newSheet: CharacterSheet = {
      ...playerSheet,
      inventoryGrid: {
        ...playerSheet.inventoryGrid,
        items: newItems,
      },
    };
    setPlayerSheet(newSheet);
    syncSheetToServer(newSheet);
    showNotification('Item dropped to the ground.', 'info');
  }, [playerSheet, showNotification, syncSheetToServer]);

  /**
   * Quick Sort bag items using 2D Bin Packing
   */
  const handleQuickSort = useCallback(() => {
    playRotateSound();
    const { packedItems, overflowItems } = autoSort2DBinPacking(
      playerSheet.inventoryGrid.items,
      playerSheet.inventoryGrid.cols,
      playerSheet.inventoryGrid.rows
    );

    const newSheet: CharacterSheet = {
      ...playerSheet,
      inventoryGrid: {
        ...playerSheet.inventoryGrid,
        items: packedItems,
      },
    };

    setPlayerSheet(newSheet);
    syncSheetToServer(newSheet);

    if (overflowItems.length > 0) {
      showNotification(`Sorted! ${overflowItems.length} items couldn't fit into optimal slots.`, 'warning');
    } else {
      showNotification('Inventory auto-packed with 2D Bin Packing!', 'success');
    }
  }, [playerSheet, showNotification, syncSheetToServer]);

  /**
   * Add Item to bag (e.g. from cheat menu / drop)
   */
  const handleAddItemToBag = useCallback((itemTemplate: ItemEntity) => {
    const newItem: ItemEntity = {
      ...itemTemplate,
      uid: 'item-' + Math.random().toString(36).substring(2, 9),
    };

    const slot = findAvailableSlot(
      playerSheet.inventoryGrid.items,
      newItem,
      playerSheet.inventoryGrid.cols,
      playerSheet.inventoryGrid.rows
    );

    if (!slot) {
      playErrorSound();
      showNotification('Inventory is full! Cannot add item.', 'error');
      return;
    }

    playPickupSound();
    const newSheet: CharacterSheet = {
      ...playerSheet,
      inventoryGrid: {
        ...playerSheet.inventoryGrid,
        items: [
          ...playerSheet.inventoryGrid.items,
          { item: { ...newItem, isRotated: slot.isRotated }, x: slot.x, y: slot.y },
        ],
      },
    };

    setPlayerSheet(newSheet);
    syncSheetToServer(newSheet);
    showNotification(`Received [${newItem.name}]!`, 'success');
  }, [playerSheet, showNotification, syncSheetToServer]);

  // --- TRADE CHAMBER ACTIONS ---

  const handleInitiateTrade = useCallback((partnerId: string) => {
    sendWSMessage({
      type: 'TRADE_INIT',
      roomId,
      senderId: playerSheet.playerId,
      receiverId: partnerId,
    });
  }, [playerSheet.playerId, roomId, sendWSMessage]);

  const handleUpdateTradeOffer = useCallback((tradeId: string, items: ItemEntity[], gold: number) => {
    sendWSMessage({
      type: 'TRADE_UPDATE_OFFER',
      roomId,
      tradeId,
      playerId: playerSheet.playerId,
      items,
      gold,
    });
  }, [playerSheet.playerId, roomId, sendWSMessage]);

  const handleToggleTradeLock = useCallback((tradeId: string, locked: boolean) => {
    sendWSMessage({
      type: 'TRADE_TOGGLE_LOCK',
      roomId,
      tradeId,
      playerId: playerSheet.playerId,
      locked,
    });
  }, [playerSheet.playerId, roomId, sendWSMessage]);

  const handleAcceptTrade = useCallback((tradeId: string) => {
    sendWSMessage({
      type: 'TRADE_ACCEPT',
      roomId,
      tradeId,
      playerId: playerSheet.playerId,
    });
  }, [playerSheet.playerId, roomId, sendWSMessage]);

  const handleCancelTrade = useCallback((tradeId: string) => {
    sendWSMessage({
      type: 'TRADE_CANCEL',
      roomId,
      tradeId,
      playerId: playerSheet.playerId,
    });
  }, [playerSheet.playerId, roomId, sendWSMessage]);

  // --- QUEST & LOOT ROLLS ---

  const handleTriggerQuestStep = useCallback((questId: string) => {
    sendWSMessage({
      type: 'QUEST_STEP_TRIGGER',
      roomId,
      questId,
    });
  }, [roomId, sendWSMessage]);

  const handleSubmitLootRoll = useCallback((dropId: string, rollType: LootRollType) => {
    sendWSMessage({
      type: 'LOOT_SUBMIT_ROLL',
      roomId,
      dropId,
      playerId: playerSheet.playerId,
      rollType,
    });
  }, [playerSheet.playerId, roomId, sendWSMessage]);

  const handleDismissLootDrop = useCallback(() => {
    setRoomState(prev => ({
      ...prev,
      activeLootDrop: undefined,
      mode: 'CAMP_LOBBY',
    }));
  }, []);

  const handleSpawnBotCompanion = useCallback(() => {
    sendWSMessage({
      type: 'SPAWN_BOT_COMPANION',
      roomId,
    });
  }, [roomId, sendWSMessage]);

  // Global key listener for [R] rotation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'r' || e.key === 'R') && draggedItem) {
        e.preventDefault();
        handleRotateDragged();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [draggedItem, handleRotateDragged]);

  return {
    roomId,
    setRoomId,
    isConnected,
    playerSheet,
    setPlayerSheet,
    computedStats,
    roomState,
    draggedItem,
    hoveredCell,
    setHoveredCell,
    hoveredEquipSlot,
    setHoveredEquipSlot,
    hoveredItemForTooltip,
    setHoveredItemForTooltip,
    inspectTarget,
    setInspectTarget,
    notification,
    handleStartDrag,
    handleRotateDragged,
    handleCancelDrag,
    handleDropOnGrid,
    handleEquipItem,
    handleUnequipItem,
    handleDropItem,
    handleQuickSort,
    handleAddItemToBag,
    handleInitiateTrade,
    handleUpdateTradeOffer,
    handleToggleTradeLock,
    handleAcceptTrade,
    handleCancelTrade,
    handleTriggerQuestStep,
    handleSubmitLootRoll,
    handleDismissLootDrop,
    handleSpawnBotCompanion,
  };
}
