import { generateDailyArenaData } from './prng.js';

export interface TelemetryEvent {
  timeMs: number;
  action: 'MOVE' | 'SLASH' | 'PARRY' | 'DASH' | 'FROST_NOVA' | 'FLAME_SWEEP' | 'OVERDRIVE' | 'DAMAGE_DEALT' | 'DAMAGE_TAKEN' | 'POSTURE_BREAK';
  x: number;
  y: number;
  targetId?: string;
  damageTaken?: number;
  damageDealt?: number;
}

export interface VerificationPayload {
  seed: string;
  callsign: string;
  fighterClass: 'WARRIOR' | 'BATTLE_MAGE' | 'ROGUE';
  durationMs: number;
  waveReached: number;
  wavesCleared: number;
  totalParries: number;
  postureBreaks: number;
  telemetry: TelemetryEvent[];
}

export interface VerificationResult {
  verified: boolean;
  score: number;
  reason?: string;
  scorecardEmoji: string;
  stats: {
    totalDamageDealt: number;
    totalDamageTaken: number;
    totalParries: number;
    postureBreaks: number;
    clearTimeMs: number;
    wavesCleared: number;
  };
}

export function verifyCombatTelemetry(payload: VerificationPayload): VerificationResult {
  const {
    seed,
    durationMs,
    waveReached,
    wavesCleared,
    totalParries,
    postureBreaks,
    telemetry,
    fighterClass
  } = payload;

  const arenaConfig = generateDailyArenaData(seed);

  // 1. Sanity check on basic parameters
  if (durationMs < 2000) {
    return {
      verified: false,
      score: 0,
      reason: 'Match duration too short to be physically valid (< 2000ms).',
      scorecardEmoji: '❌ CHEAT DETECTED',
      stats: { totalDamageDealt: 0, totalDamageTaken: 0, totalParries, postureBreaks, clearTimeMs: durationMs, wavesCleared }
    };
  }

  if (waveReached < 1 || waveReached > arenaConfig.totalWaves + 1) {
    return {
      verified: false,
      score: 0,
      reason: `Invalid wave count ${waveReached} (total waves: ${arenaConfig.totalWaves}).`,
      scorecardEmoji: '❌ CHEAT DETECTED',
      stats: { totalDamageDealt: 0, totalDamageTaken: 0, totalParries, postureBreaks, clearTimeMs: durationMs, wavesCleared }
    };
  }

  // 2. Telemetry sequence and physics boundary checks
  let lastTimeMs = -1;
  let lastX = 0;
  let lastY = 0;
  let hasLastPos = false;

  const lastAbilityTime: Record<string, number> = {
    DASH: -99999,
    PARRY: -99999,
    FROST_NOVA: -99999,
    FLAME_SWEEP: -99999,
    OVERDRIVE: -99999,
  };

  const minCooldowns: Record<string, number> = {
    DASH: 600,
    PARRY: 700,
    FROST_NOVA: 3500,
    FLAME_SWEEP: 2800,
    OVERDRIVE: 10000,
  };

  let accumulatedDamageDealt = 0;
  let accumulatedDamageTaken = 0;
  let verifiedParries = 0;
  let verifiedPostureBreaks = 0;

  const maxArenaDistSq = (arenaConfig.arenaRadius + 60) ** 2;

  // Max velocity: 300 px/sec regular, 750 px/sec dash burst
  const maxVelocity = 900; // px/sec

  for (let i = 0; i < telemetry.length; i++) {
    const t = telemetry[i];

    // Monotonic timestamps
    if (t.timeMs < lastTimeMs) {
      return {
        verified: false,
        score: 0,
        reason: `Non-monotonic telemetry timestamp detected at step ${i} (${t.timeMs} < ${lastTimeMs}).`,
        scorecardEmoji: '❌ TELEMETRY CORRUPTED',
        stats: { totalDamageDealt: accumulatedDamageDealt, totalDamageTaken: accumulatedDamageTaken, totalParries, postureBreaks, clearTimeMs: durationMs, wavesCleared }
      };
    }

    // Arena boundary containment check
    const distSq = t.x * t.x + t.y * t.y;
    if (distSq > maxArenaDistSq) {
      return {
        verified: false,
        score: 0,
        reason: `Gladiator out of arena bounds at step ${i} (r=${Math.round(Math.sqrt(distSq))}).`,
        scorecardEmoji: '❌ BOUNDARY EXPLOIT',
        stats: { totalDamageDealt: accumulatedDamageDealt, totalDamageTaken: accumulatedDamageTaken, totalParries, postureBreaks, clearTimeMs: durationMs, wavesCleared }
      };
    }

    // Velocity / Speedhack check
    if (hasLastPos) {
      const dt = (t.timeMs - lastTimeMs) / 1000;
      if (dt > 0.016) {
        const dx = t.x - lastX;
        const dy = t.y - lastY;
        const speed = Math.sqrt(dx * dx + dy * dy) / dt;
        if (speed > maxVelocity) {
          return {
            verified: false,
            score: 0,
            reason: `Movement velocity violation (${Math.round(speed)} px/s exceeded ${maxVelocity} px/s max).`,
            scorecardEmoji: '❌ SPEED HACK DETECTED',
            stats: { totalDamageDealt: accumulatedDamageDealt, totalDamageTaken: accumulatedDamageTaken, totalParries, postureBreaks, clearTimeMs: durationMs, wavesCleared }
          };
        }
      }
    }

    // Cooldown checks
    if (minCooldowns[t.action]) {
      const cd = minCooldowns[t.action];
      if (t.timeMs - lastAbilityTime[t.action] < cd) {
        return {
          verified: false,
          score: 0,
          reason: `Ability cooldown exploit for ${t.action} (fired after ${t.timeMs - lastAbilityTime[t.action]}ms, min is ${cd}ms).`,
          scorecardEmoji: '❌ COOLDOWN EXPLOIT',
          stats: { totalDamageDealt: accumulatedDamageDealt, totalDamageTaken: accumulatedDamageTaken, totalParries, postureBreaks, clearTimeMs: durationMs, wavesCleared }
        };
      }
      lastAbilityTime[t.action] = t.timeMs;
    }

    // Action tracking
    if (t.action === 'PARRY') {
      verifiedParries++;
    }
    if (t.action === 'POSTURE_BREAK') {
      verifiedPostureBreaks++;
    }
    if (t.action === 'DAMAGE_DEALT' && t.damageDealt) {
      if (t.damageDealt > 2500) {
        return {
          verified: false,
          score: 0,
          reason: `Impossible single strike damage value (${t.damageDealt}).`,
          scorecardEmoji: '❌ DAMAGE HACK DETECTED',
          stats: { totalDamageDealt: accumulatedDamageDealt, totalDamageTaken: accumulatedDamageTaken, totalParries, postureBreaks, clearTimeMs: durationMs, wavesCleared }
        };
      }
      accumulatedDamageDealt += t.damageDealt;
    }
    if (t.action === 'DAMAGE_TAKEN' && t.damageTaken) {
      accumulatedDamageTaken += t.damageTaken;
    }

    lastTimeMs = t.timeMs;
    lastX = t.x;
    lastY = t.y;
    hasLastPos = true;
  }

  // 3. Score calculation
  // Base points per wave cleared + parry mastery + posture breaks - time penalty
  const wavePoints = wavesCleared * 3000;
  const parryPoints = totalParries * 180;
  const postureBreakPoints = postureBreaks * 400;
  const timeSeconds = Math.max(1, Math.floor(durationMs / 1000));
  const timePenalty = Math.min(wavePoints + parryPoints, timeSeconds * 12);
  const classBonus = fighterClass === 'ROGUE' ? 250 : fighterClass === 'BATTLE_MAGE' ? 200 : 150;

  const score = Math.max(100, wavePoints + parryPoints + postureBreakPoints - timePenalty + classBonus);

  // Generate shareable emoji scorecard format specified in prompt:
  // e.g., ⚔️ 🛡️ 💀 [Wave 5 Cleared // 3m 42s // 12 Parries]
  const mins = Math.floor(timeSeconds / 60);
  const secs = timeSeconds % 60;
  const timeFormatted = `${mins}m ${secs.toString().padStart(2, '0')}s`;
  const waveStatus = wavesCleared >= 5 ? 'VICTORY' : `Wave ${wavesCleared} Cleared`;
  const scorecardEmoji = `⚔️ 🛡️ 💀 [${waveStatus} // ${timeFormatted} // ${totalParries} Parries // ${score} Pts]`;

  return {
    verified: true,
    score,
    scorecardEmoji,
    stats: {
      totalDamageDealt: accumulatedDamageDealt,
      totalDamageTaken: accumulatedDamageTaken,
      totalParries,
      postureBreaks,
      clearTimeMs: durationMs,
      wavesCleared
    }
  };
}
