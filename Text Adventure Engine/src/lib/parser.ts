import { ActionVerb, Direction, ParsedCommand, RoomNode, StoryCartridge, WorldEntity } from '../types/engine';

// Direction abbreviations & synonyms
export const DIRECTION_SYNONYMS: Record<string, Direction> = {
  n: 'north',
  north: 'north',
  s: 'south',
  south: 'south',
  e: 'east',
  east: 'east',
  w: 'west',
  west: 'west',
  u: 'up',
  up: 'up',
  ascend: 'up',
  d: 'down',
  down: 'down',
  descend: 'down',
};

// Verb synonyms dictionary mapping input words to normalized ActionVerb
export const VERB_DICTIONARY: Record<string, ActionVerb> = {
  // Navigation
  go: 'ACTION_GO',
  walk: 'ACTION_GO',
  travel: 'ACTION_GO',
  move: 'ACTION_GO',
  head: 'ACTION_GO',
  proceed: 'ACTION_GO',
  step: 'ACTION_GO',
  enter: 'ACTION_GO',
  climb: 'ACTION_GO',
  n: 'ACTION_GO',
  north: 'ACTION_GO',
  s: 'ACTION_GO',
  south: 'ACTION_GO',
  e: 'ACTION_GO',
  east: 'ACTION_GO',
  w: 'ACTION_GO',
  west: 'ACTION_GO',
  u: 'ACTION_GO',
  up: 'ACTION_GO',
  d: 'ACTION_GO',
  down: 'ACTION_GO',

  // Inspection
  look: 'ACTION_LOOK',
  l: 'ACTION_LOOK',
  survey: 'ACTION_LOOK',
  examine: 'ACTION_INSPECT',
  x: 'ACTION_INSPECT',
  inspect: 'ACTION_INSPECT',
  check: 'ACTION_INSPECT',
  read: 'ACTION_INSPECT',
  study: 'ACTION_INSPECT',
  peer: 'ACTION_INSPECT',
  view: 'ACTION_INSPECT',

  // Collection
  take: 'ACTION_TAKE',
  get: 'ACTION_TAKE',
  grab: 'ACTION_TAKE',
  pick: 'ACTION_TAKE', // handles "pick up"
  collect: 'ACTION_TAKE',
  retrieve: 'ACTION_TAKE',
  pocket: 'ACTION_TAKE',
  acquire: 'ACTION_TAKE',

  // Interaction
  use: 'ACTION_USE',
  apply: 'ACTION_USE',
  ignite: 'ACTION_USE',
  light: 'ACTION_USE',
  activate: 'ACTION_USE',
  press: 'ACTION_USE',
  pull: 'ACTION_USE',
  strike: 'ACTION_USE',
  turn: 'ACTION_USE',

  // Combination
  combine: 'ACTION_COMBINE',
  merge: 'ACTION_COMBINE',
  fit: 'ACTION_COMBINE',
  assemble: 'ACTION_COMBINE',
  craft: 'ACTION_COMBINE',
  attach: 'ACTION_COMBINE',
  insert: 'ACTION_COMBINE',

  // Unlocking
  unlock: 'ACTION_UNLOCK',
  open: 'ACTION_UNLOCK',
  unseal: 'ACTION_UNLOCK',

  // Dialogue
  talk: 'ACTION_TALK',
  speak: 'ACTION_TALK',
  converse: 'ACTION_TALK',
  ask: 'ACTION_TALK',
  chat: 'ACTION_TALK',
  greet: 'ACTION_TALK',

  // Inventory
  inventory: 'ACTION_INVENTORY',
  inv: 'ACTION_INVENTORY',
  i: 'ACTION_INVENTORY',
  satchel: 'ACTION_INVENTORY',
  bag: 'ACTION_INVENTORY',
  items: 'ACTION_INVENTORY',

  // Help
  help: 'ACTION_HELP',
  hint: 'ACTION_HELP',
  commands: 'ACTION_HELP',
  guide: 'ACTION_HELP',
  '?': 'ACTION_HELP',
};

const PREPOSITIONS = new Set(['with', 'in', 'into', 'on', 'onto', 'to', 'using', 'at', 'through', 'under', 'from']);
const ARTICLES = new Set(['the', 'a', 'an', 'some', 'my', 'this', 'that', 'these', 'those', 'up']);

// Clean filler words from phrase
function cleanPhrase(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(word => !ARTICLES.has(word))
    .join(' ');
}

// Fuzzy string match helper
function fuzzyMatch(candidate: string, query: string): boolean {
  const c = candidate.toLowerCase().trim();
  const q = query.toLowerCase().trim();
  if (c === q) return true;
  if (c.includes(q) || q.includes(c)) return true;

  // Word token overlap
  const cTokens = c.split(/\s+/);
  const qTokens = q.split(/\s+/);
  return qTokens.every(qt => cTokens.some(ct => ct.startsWith(qt) || ct.includes(qt)));
}

// Find entity matching a noun query within visible entities
export function findMatchingEntity(
  query: string,
  candidateEntities: WorldEntity[]
): WorldEntity | null {
  const cleanedQuery = cleanPhrase(query);
  if (!cleanedQuery) return null;

  // 1. Exact ID or Name match
  for (const ent of candidateEntities) {
    if (ent.id.toLowerCase() === cleanedQuery || ent.name.toLowerCase() === cleanedQuery) {
      return ent;
    }
  }

  // 2. Exact alias match
  for (const ent of candidateEntities) {
    if (ent.aliases.some(a => a.toLowerCase() === cleanedQuery)) {
      return ent;
    }
  }

  // 3. Fuzzy name or alias match
  for (const ent of candidateEntities) {
    if (fuzzyMatch(ent.name, cleanedQuery)) {
      return ent;
    }
    if (ent.aliases.some(a => fuzzyMatch(a, cleanedQuery))) {
      return ent;
    }
  }

  return null;
}

// Parse natural language player input
export function parseNaturalLanguageCommand(
  rawInput: string,
  currentRoom: RoomNode,
  cartridge: StoryCartridge,
  playerInventoryIds: string[]
): ParsedCommand {
  const raw = rawInput.trim();
  if (!raw) {
    return {
      raw,
      verb: '',
      normalizedAction: 'ACTION_UNKNOWN',
      isValid: false,
      errorMessage: 'Type a command, e.g. "look", "go north", "take lantern", or "examine astrolabe".',
    };
  }

  // Available visible entities: items in current room + items in player inventory
  const visibleEntities: WorldEntity[] = [
    ...currentRoom.entityIds.map(id => cartridge.entities[id]).filter(Boolean),
    ...playerInventoryIds.map(id => cartridge.entities[id]).filter(Boolean),
  ];

  // Tokenize
  const rawTokens = raw.split(/\s+/);
  const firstWord = rawTokens[0].toLowerCase();

  // Standalone direction shortcut (e.g. "north", "n", "u", "south")
  if (DIRECTION_SYNONYMS[firstWord] && rawTokens.length === 1) {
    const dir = DIRECTION_SYNONYMS[firstWord];
    return {
      raw,
      verb: firstWord,
      normalizedAction: 'ACTION_GO',
      directObject: dir,
      matchedExitDirection: dir,
      isValid: true,
    };
  }

  // Check compound verbs like "look at", "pick up"
  let verbWord = firstWord;
  let remainingTokens = rawTokens.slice(1);

  if (firstWord === 'look' && remainingTokens.length > 0 && remainingTokens[0].toLowerCase() === 'at') {
    verbWord = 'examine';
    remainingTokens = remainingTokens.slice(1);
  } else if (firstWord === 'pick' && remainingTokens.length > 0 && remainingTokens[0].toLowerCase() === 'up') {
    verbWord = 'take';
    remainingTokens = remainingTokens.slice(1);
  }

  const normalizedAction = VERB_DICTIONARY[verbWord] || 'ACTION_UNKNOWN';

  // Handle simple single-word commands
  if (normalizedAction === 'ACTION_LOOK' && remainingTokens.length === 0) {
    return {
      raw,
      verb: verbWord,
      normalizedAction: 'ACTION_LOOK',
      isValid: true,
    };
  }

  if (normalizedAction === 'ACTION_INVENTORY' && remainingTokens.length === 0) {
    return {
      raw,
      verb: verbWord,
      normalizedAction: 'ACTION_INVENTORY',
      isValid: true,
    };
  }

  if (normalizedAction === 'ACTION_HELP') {
    return {
      raw,
      verb: verbWord,
      normalizedAction: 'ACTION_HELP',
      isValid: true,
    };
  }

  // Split remaining tokens by preposition (e.g. "unlock door WITH silver key", "use oil ON lantern")
  let preposition: string | undefined;
  let directTokens: string[] = [];
  let indirectTokens: string[] = [];
  let foundPreposition = false;

  for (const token of remainingTokens) {
    const lower = token.toLowerCase();
    if (!foundPreposition && PREPOSITIONS.has(lower)) {
      preposition = lower;
      foundPreposition = true;
    } else if (!foundPreposition) {
      directTokens.push(token);
    } else {
      indirectTokens.push(token);
    }
  }

  const directObject = directTokens.join(' ').trim();
  const indirectObject = indirectTokens.join(' ').trim();

  // Navigation handling: "go north", "travel east", "walk to the archive"
  if (normalizedAction === 'ACTION_GO') {
    const cleanedDir = cleanPhrase(directObject);
    const matchedDir = DIRECTION_SYNONYMS[cleanedDir] || DIRECTION_SYNONYMS[firstWord];

    if (matchedDir) {
      return {
        raw,
        verb: verbWord,
        normalizedAction: 'ACTION_GO',
        directObject: matchedDir,
        matchedExitDirection: matchedDir,
        isValid: true,
      };
    }

    // Try matching room title exit
    const targetExit = currentRoom.exits.find(ex => {
      const targetRoom = cartridge.rooms[ex.targetRoomId];
      return targetRoom && fuzzyMatch(targetRoom.title, cleanedDir);
    });

    if (targetExit) {
      return {
        raw,
        verb: verbWord,
        normalizedAction: 'ACTION_GO',
        directObject: targetExit.direction,
        matchedExitDirection: targetExit.direction,
        isValid: true,
      };
    }

    return {
      raw,
      verb: verbWord,
      normalizedAction: 'ACTION_GO',
      directObject,
      isValid: false,
      errorMessage: `You cannot go '${directObject}'. Available exits: ${currentRoom.exits.map(e => e.direction.toUpperCase()).join(', ') || 'none'}.`,
    };
  }

  // Object-based actions: inspect, take, use, combine, unlock, talk
  if (['ACTION_INSPECT', 'ACTION_TAKE', 'ACTION_USE', 'ACTION_COMBINE', 'ACTION_UNLOCK', 'ACTION_TALK'].includes(normalizedAction)) {
    if (!directObject) {
      return {
        raw,
        verb: verbWord,
        normalizedAction,
        isValid: false,
        errorMessage: `What would you like to ${verbWord}?`,
      };
    }

    // Match direct entity
    const matchedEntity = findMatchingEntity(directObject, visibleEntities);

    // Also match direction for unlock/open (e.g. "open north door")
    const dirForDoor = DIRECTION_SYNONYMS[cleanPhrase(directObject)];

    return {
      raw,
      verb: verbWord,
      normalizedAction,
      directObject,
      preposition,
      indirectObject,
      matchedEntityId: matchedEntity?.id,
      matchedExitDirection: dirForDoor,
      isValid: true,
    };
  }

  // Unknown verb
  return {
    raw,
    verb: verbWord,
    normalizedAction: 'ACTION_UNKNOWN',
    directObject,
    isValid: false,
    errorMessage: `I don't understand the command '${verbWord}'. Type 'help' for a list of available actions.`,
  };
}

// Generate smart real-time autocomplete suggestions based on current room context
export interface AutocompleteSuggestion {
  label: string;
  command: string;
  category: 'EXIT' | 'INSPECT' | 'TAKE' | 'USE' | 'SYSTEM';
  badge?: string;
}

export function generateAutocompleteSuggestions(
  input: string,
  currentRoom: RoomNode,
  cartridge: StoryCartridge,
  inventoryIds: string[]
): AutocompleteSuggestion[] {
  const query = input.toLowerCase().trim();
  const suggestions: AutocompleteSuggestion[] = [];

  const roomEntities = currentRoom.entityIds
    .map(id => cartridge.entities[id])
    .filter(Boolean);

  const inventoryEntities = inventoryIds
    .map(id => cartridge.entities[id])
    .filter(Boolean);

  // Direction exits
  for (const exit of currentRoom.exits) {
    const targetRoom = cartridge.rooms[exit.targetRoomId];
    const cmd = `go ${exit.direction}`;
    const label = `Go ${exit.direction.toUpperCase()}${targetRoom ? ` (${targetRoom.title})` : ''}${exit.isLocked ? ' 🔒' : ''}`;
    if (!query || cmd.includes(query) || exit.direction.includes(query) || (targetRoom && targetRoom.title.toLowerCase().includes(query))) {
      suggestions.push({
        label,
        command: cmd,
        category: 'EXIT',
        badge: exit.direction.toUpperCase(),
      });
    }
  }

  // Takeable items in room
  for (const ent of roomEntities) {
    if (ent.isTakeable) {
      const cmd = `take ${ent.name.toLowerCase()}`;
      if (!query || cmd.includes(query) || ent.name.toLowerCase().includes(query)) {
        suggestions.push({
          label: `Take ${ent.name}`,
          command: cmd,
          category: 'TAKE',
          badge: 'ITEM',
        });
      }
    }
  }

  // Inspectable items in room or inventory
  for (const ent of [...roomEntities, ...inventoryEntities]) {
    const cmd = `examine ${ent.name.toLowerCase()}`;
    if (!query || cmd.includes(query) || ent.name.toLowerCase().includes(query)) {
      suggestions.push({
        label: `Examine ${ent.name}`,
        command: cmd,
        category: 'INSPECT',
        badge: inventoryIds.includes(ent.id) ? 'SATCHEL' : 'ROOM',
      });
    }
  }

  // Usable items
  for (const ent of [...roomEntities, ...inventoryEntities]) {
    if (ent.isUsable) {
      const cmd = `use ${ent.name.toLowerCase()}`;
      if (!query || cmd.includes(query) || ent.name.toLowerCase().includes(query)) {
        suggestions.push({
          label: `Use ${ent.name}`,
          command: cmd,
          category: 'USE',
          badge: 'ACTION',
        });
      }
    }
  }

  // Common quick commands
  const sysCommands: [string, string][] = [
    ['look', 'Survey room surroundings'],
    ['inventory', 'Inspect items in your satchel'],
    ['help', 'View list of commands and guide'],
  ];

  for (const [cmd, desc] of sysCommands) {
    if (!query || cmd.startsWith(query) || desc.toLowerCase().includes(query)) {
      suggestions.push({
        label: `${cmd} — ${desc}`,
        command: cmd,
        category: 'SYSTEM',
        badge: 'CMD',
      });
    }
  }

  return suggestions.slice(0, 7);
}
