import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { db } from './db.js';
import { reconcileOfflineDecay, resolveAuthoritativeMood } from './metabolism.js';
import { evaluateEpigeneticEvolution } from './epigenetics.js';
import { playdateRelay } from './websocket.js';
import { INITIAL_FOODS, SPECIES_CATALOG } from '../src/lib/speciesData.js';
import { PetEntity, FoodItem } from '../src/types/pet.js';

const fastify = Fastify({ logger: true });

await fastify.register(cors, { origin: true });
await fastify.register(websocket);

// In-memory action cooldown tracking (prevents macro / spam automation)
const lastActionTimes = new Map<string, number>();

function mapDbRowToPet(row: Record<string, unknown>): PetEntity {
  let lineage: string[] = ['egg'];
  try {
    lineage = JSON.parse(row.lineage_json as string);
  } catch {
    lineage = ['egg'];
  }

  return {
    id: row.id as string,
    name: row.name as string,
    speciesId: row.species_id as string,
    stage: row.stage as PetEntity['stage'],
    mood: row.mood as PetEntity['mood'],
    vitals: {
      hunger: Number(row.hunger),
      hygiene: Number(row.hygiene),
      happiness: Number(row.happiness),
      energy: Number(row.energy),
    },
    ageDays: Number(row.age_days),
    experience: Number(row.experience),
    wasteCount: Number(row.waste_count),
    isSleeping: Boolean(row.is_sleeping),
    epigenetics: {
      sugarIntake: Number(row.sugar_intake),
      proteinIntake: Number(row.protein_intake),
      hygieneCareAverage: Number(row.hygiene_care_avg),
      playDisciplineRatio: Number(row.play_discipline_ratio),
    },
    bornAt: row.born_at as string,
    lastTickAt: row.last_tick_at as string,
    lineagePath: lineage,
    careActionsTotal: Number(row.care_actions_total || 0),
  };
}

function savePetToDb(pet: PetEntity) {
  const stmt = db.prepare(`
    UPDATE pets SET
      name = ?,
      species_id = ?,
      stage = ?,
      mood = ?,
      hunger = ?,
      hygiene = ?,
      happiness = ?,
      energy = ?,
      age_days = ?,
      experience = ?,
      waste_count = ?,
      is_sleeping = ?,
      sugar_intake = ?,
      protein_intake = ?,
      hygiene_care_avg = ?,
      play_discipline_ratio = ?,
      last_tick_at = ?,
      lineage_json = ?,
      care_actions_total = ?
    WHERE id = ?
  `);

  stmt.run(
    pet.name,
    pet.speciesId,
    pet.stage,
    pet.mood,
    pet.vitals.hunger,
    pet.vitals.hygiene,
    pet.vitals.happiness,
    pet.vitals.energy,
    pet.ageDays,
    pet.experience,
    pet.wasteCount,
    pet.isSleeping ? 1 : 0,
    pet.epigenetics.sugarIntake,
    pet.epigenetics.proteinIntake,
    pet.epigenetics.hygieneCareAverage,
    pet.epigenetics.playDisciplineRatio,
    pet.lastTickAt,
    JSON.stringify(pet.lineagePath || [pet.speciesId]),
    pet.careActionsTotal || 0,
    pet.id
  );
}

function initDefaultPet(): PetEntity {
  const petId = 'pet_main';
  const now = new Date().toISOString();

  const newPet: PetEntity = {
    id: petId,
    name: 'Aetheria',
    speciesId: 'egg',
    stage: 'EGG',
    mood: 'CONTENT',
    vitals: { hunger: 90, hygiene: 100, happiness: 100, energy: 100 },
    ageDays: 0,
    experience: 0,
    wasteCount: 0,
    isSleeping: false,
    epigenetics: {
      sugarIntake: 0,
      proteinIntake: 0,
      hygieneCareAverage: 1.0,
      playDisciplineRatio: 0.5,
    },
    bornAt: now,
    lastTickAt: now,
    lineagePath: ['egg'],
    careActionsTotal: 0,
  };

  db.prepare(`
    INSERT INTO pets (
      id, name, species_id, stage, mood, hunger, hygiene, happiness, energy,
      age_days, experience, waste_count, is_sleeping, sugar_intake, protein_intake,
      hygiene_care_avg, play_discipline_ratio, born_at, last_tick_at, lineage_json, care_actions_total
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    newPet.id,
    newPet.name,
    newPet.speciesId,
    newPet.stage,
    newPet.mood,
    newPet.vitals.hunger,
    newPet.vitals.hygiene,
    newPet.vitals.happiness,
    newPet.vitals.energy,
    newPet.ageDays,
    newPet.experience,
    newPet.wasteCount,
    newPet.isSleeping ? 1 : 0,
    newPet.epigenetics.sugarIntake,
    newPet.epigenetics.proteinIntake,
    newPet.epigenetics.hygieneCareAverage,
    newPet.epigenetics.playDisciplineRatio,
    newPet.bornAt,
    newPet.lastTickAt,
    JSON.stringify(newPet.lineagePath),
    0
  );

  // Seed Initial Foods into Inventory
  for (const food of INITIAL_FOODS) {
    db.prepare(`
      INSERT OR REPLACE INTO inventory (pet_id, food_id, quantity)
      VALUES (?, ?, ?)
    `).run(petId, food.id, food.quantity);
  }

  return newPet;
}

// REST Routes

// 1. Get current pet
fastify.get('/api/pet/current', async () => {
  const row = db.prepare('SELECT * FROM pets ORDER BY born_at ASC LIMIT 1').get() as Record<string, unknown> | undefined;
  if (!row) {
    const freshPet = initDefaultPet();
    return { pet: freshPet };
  }
  const pet = mapDbRowToPet(row);
  return { pet };
});

// 2. Authoritative Monotonic Offline Decay Reconciliation Sync
fastify.get<{ Params: { id: string } }>('/api/pet/:id/sync', async (request, reply) => {
  const { id } = request.params;
  const row = db.prepare('SELECT * FROM pets WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!row) {
    reply.status(404).send({ error: 'Pet not found' });
    return;
  }

  const pet = mapDbRowToPet(row);
  const now = new Date().toISOString();
  const reconciliation = reconcileOfflineDecay(pet, now);

  pet.vitals = reconciliation.updatedVitals;
  pet.mood = reconciliation.newMood;
  pet.wasteCount = reconciliation.newWasteCount;
  pet.ageDays = reconciliation.newAgeDays;
  pet.lastTickAt = now;

  savePetToDb(pet);

  return {
    pet,
    serverTime: now,
    elapsedSeconds: reconciliation.elapsedSeconds,
    offlineReport: reconciliation.report,
  };
});

// 3. Get Food Inventory
fastify.get<{ Querystring: { petId?: string } }>('/api/foods', async (request) => {
  const petId = request.query.petId || 'pet_main';
  const invRows = db.prepare('SELECT food_id, quantity FROM inventory WHERE pet_id = ?').all(petId) as { food_id: string; quantity: number }[];
  const invMap = new Map(invRows.map((r) => [r.food_id, r.quantity]));

  const inventory: FoodItem[] = INITIAL_FOODS.map((food) => ({
    ...food,
    quantity: invMap.has(food.id) ? invMap.get(food.id)! : 0,
  }));

  return { inventory };
});

// 4. Action Dispatch with Anti-Macro Verification
fastify.post<{
  Body: {
    petId: string;
    action: 'HATCH' | 'FEED' | 'CLEAN' | 'PET' | 'PLAY' | 'SLEEP_TOGGLE' | 'MEDICINE';
    foodId?: string;
  };
}>('/api/pet/action', async (request, reply) => {
  const { petId, action, foodId } = request.body;

  // Rate limiting to block automated macro spamming
  const now = Date.now();
  const cooldownKey = `${petId}_${action}`;
  const lastTime = lastActionTimes.get(cooldownKey) || 0;
  const cooldownMs = action === 'PET' ? 250 : action === 'CLEAN' ? 400 : 500;

  if (now - lastTime < cooldownMs) {
    reply.status(429).send({ error: 'Action on cooldown' });
    return;
  }
  lastActionTimes.set(cooldownKey, now);

  const row = db.prepare('SELECT * FROM pets WHERE id = ?').get(petId) as Record<string, unknown> | undefined;
  if (!row) {
    reply.status(404).send({ error: 'Pet not found' });
    return;
  }

  const pet = mapDbRowToPet(row);
  pet.careActionsTotal = (pet.careActionsTotal || 0) + 1;

  switch (action) {
    case 'HATCH': {
      if (pet.stage === 'EGG') {
        pet.stage = 'BABY';
        pet.speciesId = 'blobkin';
        pet.lineagePath = ['egg', 'blobkin'];
        pet.experience += 25;
        pet.vitals.happiness = 100;
        pet.vitals.hunger = 80;
      }
      break;
    }

    case 'FEED': {
      if (!foodId) {
        reply.status(400).send({ error: 'foodId is required' });
        return;
      }

      // Check inventory
      const inv = db.prepare('SELECT quantity FROM inventory WHERE pet_id = ? AND food_id = ?').get(petId, foodId) as { quantity: number } | undefined;
      if (!inv || inv.quantity <= 0) {
        reply.status(400).send({ error: 'Out of stock' });
        return;
      }

      // Decrement inventory
      db.prepare('UPDATE inventory SET quantity = quantity - 1 WHERE pet_id = ? AND food_id = ?').run(petId, foodId);

      const foodDef = INITIAL_FOODS.find((f) => f.id === foodId);
      if (foodDef) {
        pet.vitals.hunger = Math.min(100, pet.vitals.hunger + foodDef.hungerRestore);
        pet.vitals.happiness = Math.min(100, pet.vitals.happiness + foodDef.happinessRestore);
        pet.experience += 12;

        if (foodDef.epigeneticModifiers.sugarIntake) {
          pet.epigenetics.sugarIntake += foodDef.epigeneticModifiers.sugarIntake;
        }
        if (foodDef.epigeneticModifiers.proteinIntake) {
          pet.epigenetics.proteinIntake += foodDef.epigeneticModifiers.proteinIntake;
        }
      }
      break;
    }

    case 'CLEAN': {
      // Cleans waste piles or scrubs pet
      pet.wasteCount = 0;
      pet.vitals.hygiene = Math.min(100, pet.vitals.hygiene + 40);
      pet.experience += 10;
      // Moving average update for hygiene rating
      pet.epigenetics.hygieneCareAverage = Math.min(1.0, pet.epigenetics.hygieneCareAverage * 0.9 + 0.1);
      break;
    }

    case 'PET': {
      pet.vitals.happiness = Math.min(100, pet.vitals.happiness + 8);
      pet.experience += 4;
      break;
    }

    case 'PLAY': {
      if (pet.vitals.energy < 10) {
        reply.status(400).send({ error: 'Pet is too tired to play. Let them rest!' });
        return;
      }
      pet.vitals.energy = Math.max(0, pet.vitals.energy - 12);
      pet.vitals.happiness = Math.min(100, pet.vitals.happiness + 20);
      pet.experience += 16;
      pet.epigenetics.playDisciplineRatio = Math.min(1.0, pet.epigenetics.playDisciplineRatio * 0.92 + 0.08);
      break;
    }

    case 'SLEEP_TOGGLE': {
      pet.isSleeping = !pet.isSleeping;
      break;
    }

    case 'MEDICINE': {
      pet.vitals.hygiene = Math.max(50, pet.vitals.hygiene);
      pet.vitals.hunger = Math.max(50, pet.vitals.hunger);
      pet.vitals.energy = Math.max(50, pet.vitals.energy);
      pet.vitals.happiness = Math.max(50, pet.vitals.happiness);
      break;
    }
  }

  // Update authoritative mood
  pet.mood = resolveAuthoritativeMood(pet.vitals);
  pet.lastTickAt = new Date().toISOString();

  savePetToDb(pet);

  // Return updated pet + updated inventory
  const invRows = db.prepare('SELECT food_id, quantity FROM inventory WHERE pet_id = ?').all(petId) as { food_id: string; quantity: number }[];
  const invMap = new Map(invRows.map((r) => [r.food_id, r.quantity]));
  const updatedInventory: FoodItem[] = INITIAL_FOODS.map((food) => ({
    ...food,
    quantity: invMap.has(food.id) ? invMap.get(food.id)! : 0,
  }));

  return {
    pet,
    inventory: updatedInventory,
    evolutionStatus: evaluateEpigeneticEvolution(pet),
  };
});

// 5. Trigger Epigenetic Mutation / Evolution
fastify.post<{ Body: { petId: string } }>('/api/pet/evolve', async (request, reply) => {
  const { petId } = request.body;
  const row = db.prepare('SELECT * FROM pets WHERE id = ?').get(petId) as Record<string, unknown> | undefined;
  if (!row) {
    reply.status(404).send({ error: 'Pet not found' });
    return;
  }

  const pet = mapDbRowToPet(row);
  const evolutionCheck = evaluateEpigeneticEvolution(pet);

  if (!evolutionCheck.canEvolve || !evolutionCheck.nextSpeciesId || !evolutionCheck.nextStage) {
    reply.status(400).send({
      error: 'Evolution prerequisites not met',
      explanation: evolutionCheck.prerequisiteExplanation,
    });
    return;
  }

  // Apply mutation
  pet.speciesId = evolutionCheck.nextSpeciesId;
  pet.stage = evolutionCheck.nextStage;
  if (!pet.lineagePath) pet.lineagePath = ['egg'];
  pet.lineagePath.push(pet.speciesId);

  // Evolution boosts vitals & morale
  pet.vitals.hunger = 100;
  pet.vitals.hygiene = 100;
  pet.vitals.happiness = 100;
  pet.vitals.energy = 100;
  pet.mood = 'ECSTATIC';
  pet.lastTickAt = new Date().toISOString();

  savePetToDb(pet);

  return {
    pet,
    evolvedSpecies: SPECIES_CATALOG[pet.speciesId],
    message: evolutionCheck.prerequisiteExplanation,
  };
});

// 6. Rename Pet
fastify.post<{ Body: { petId: string; name: string } }>('/api/pet/rename', async (request, reply) => {
  const { petId, name } = request.body;
  if (!name || name.trim().length === 0) {
    reply.status(400).send({ error: 'Name cannot be empty' });
    return;
  }

  db.prepare('UPDATE pets SET name = ? WHERE id = ?').run(name.trim(), petId);
  return { success: true, name: name.trim() };
});

// 7. Seed Vault / Hybrid Genetic Seeds
fastify.get<{ Params: { petId: string } }>('/api/vault/:petId', async (request) => {
  const { petId } = request.params;
  const rows = db.prepare('SELECT * FROM seed_vault WHERE pet_id = ? ORDER BY created_at DESC').all(petId) as {
    id: string;
    donor_pet_name: string;
    donor_species: string;
    rarity: 'COMMON' | 'RARE' | 'MYTHIC' | 'CELESTIAL';
    traits_json: string;
    created_at: string;
  }[];

  const seeds = rows.map((r) => ({
    id: r.id,
    donorPetName: r.donor_pet_name,
    donorSpecies: r.donor_species,
    rarity: r.rarity,
    traits: JSON.parse(r.traits_json || '[]') as string[],
    createdAt: r.created_at,
  }));

  return { seeds };
});

// WebSocket Server Endpoint for Playdate Park
fastify.get('/ws/playdate', { websocket: true }, (socket, req) => {
  let joinedRoomId: string | null = null;
  let clientPetId: string | null = null;

  socket.on('message', (message: string) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'JOIN_ROOM') {
        clientPetId = data.petInfo.petId;
        joinedRoomId = playdateRelay.joinRoom(data.roomId, socket, data.petInfo);
      } else {
        playdateRelay.handleMessage(socket, message.toString());
      }
    } catch (e) {
      console.error('[WS] Message error:', e);
    }
  });

  socket.on('close', () => {
    if (joinedRoomId && clientPetId) {
      playdateRelay.leaveRoom(joinedRoomId, clientPetId);
    }
  });
});

const PORT = 3001;
try {
  await fastify.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`[Fastify] Virtual Pet backend server listening on http://localhost:${PORT}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
