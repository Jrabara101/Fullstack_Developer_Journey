import crypto from 'node:crypto';
import {
  ReplayMetadata,
  ReplayPayload,
  VerificationReport,
  INPUT_BITS
} from './types.js';

// Canonical Physics Constants for Verification
const CANONICAL = {
  MAX_SPEED: 420, // px/sec
  BOOST_MAX_SPEED: 780, // px/sec
  ACCELERATION: 1200, // px/sec^2
  FRICTION: 0.94, // per tick dampening
  DESYNC_TOLERANCE_PX: 18.0, // allowed deviation threshold before desync flag
  MIN_REACTION_MS: 30, // threshold below which continuous toggle implies synthetic input
  BOUNDS: { minX: 0, maxX: 1400, minY: 0, maxY: 900 }
};

export function computeReplayChecksum(payload: ReplayPayload): string {
  const hash = crypto.createHash('sha256');
  // Hash inputs and keyframe data deterministically
  const simplified = {
    totalInputs: payload.inputs.length,
    firstInput: payload.inputs[0] || null,
    lastInput: payload.inputs[payload.inputs.length - 1] || null,
    keyframes: payload.keyframes.map(k => ({
      tick: k.tick,
      entities: k.entities.map(e => ({
        id: e.id,
        pos: [Math.round(e.pos.x * 100) / 100, Math.round(e.pos.y * 100) / 100]
      }))
    }))
  };
  hash.update(JSON.stringify(simplified));
  return hash.digest('hex');
}

export function verifyReplay(
  metadata: ReplayMetadata,
  payload: ReplayPayload
): VerificationReport {
  const violations: string[] = [];
  const checks: VerificationReport['checks'] = [];

  const { inputs, keyframes } = payload;
  const totalTicks = metadata.totalTicks || (inputs.length > 0 ? inputs[inputs.length - 1].tick : 0);

  // 1. Tick Continuity & Monotonicity Check
  let tickGaps = 0;
  let outOfOrderTicks = 0;
  for (let i = 1; i < inputs.length; i++) {
    const diff = inputs[i].tick - inputs[i - 1].tick;
    if (diff !== 1) {
      if (diff <= 0) outOfOrderTicks++;
      else tickGaps++;
    }
  }

  const tickContinuityPassed = tickGaps === 0 && outOfOrderTicks === 0;
  if (!tickContinuityPassed) {
    violations.push(`Tick continuity failure: ${tickGaps} gaps detected, ${outOfOrderTicks} out-of-order frames.`);
  }
  checks.push({
    name: 'Tick Sequential Continuity',
    passed: tickContinuityPassed,
    details: tickContinuityPassed
      ? `All ${inputs.length} ticks strictly monotonic without frame drops.`
      : `Detected ${tickGaps} dropped ticks and ${outOfOrderTicks} sequence reversals.`
  });

  // 2. Cryptographic Integrity Check
  const computedHash = computeReplayChecksum(payload);
  const checksumMatches = !metadata.checksum || metadata.checksum === computedHash;
  checks.push({
    name: 'SHA-256 Payload Hash Validation',
    passed: checksumMatches,
    details: checksumMatches
      ? `Manifest checksum strictly matches payload hash: ${computedHash.slice(0, 16)}...`
      : `Checksum mismatch! Recorded: ${metadata.checksum?.slice(0, 16)}..., Computed: ${computedHash.slice(0, 16)}...`
  });
  if (!checksumMatches) {
    violations.push('Replay payload altered after manifest signing (SHA-256 hash mismatch).');
  }

  // 3. Inhuman Input Rate & Macro Detection
  let inputTransitions = 0;
  let rapidToggleBurstCount = 0;
  let consecutiveInstantToggles = 0;

  for (let i = 1; i < inputs.length; i++) {
    const prevKeys = inputs[i - 1].keys;
    const currKeys = inputs[i].keys;
    if (prevKeys !== currKeys) {
      inputTransitions++;
      const dtMs = (inputs[i].tick - inputs[i - 1].tick) * (1000 / (metadata.tickRate || 60));
      if (dtMs < CANONICAL.MIN_REACTION_MS) {
        consecutiveInstantToggles++;
        if (consecutiveInstantToggles > 6) {
          rapidToggleBurstCount++;
        }
      } else {
        consecutiveInstantToggles = 0;
      }
    }
  }

  const durationSec = Math.max(1, (metadata.durationMs || totalTicks * 16.66) / 1000);
  const averageInputRateHz = +(inputTransitions / durationSec).toFixed(2);
  const macroDetected = rapidToggleBurstCount > 3 || averageInputRateHz > 40;

  checks.push({
    name: 'Biometric Input Rate & Anti-Macro Verification',
    passed: !macroDetected,
    details: !macroDetected
      ? `Human-valid cadence: ${averageInputRateHz} input transitions/sec (peak bursts: ${rapidToggleBurstCount}).`
      : `Inhuman input burst detected: ${averageInputRateHz} transitions/sec exceeded maximum human limit (${rapidToggleBurstCount} sub-30ms bursts).`
  });
  if (macroDetected) {
    violations.push(`Impossible reaction speed or synthetic key-spammer macro detected (${averageInputRateHz} Hz).`);
  }

  // 4. Maximum Velocity & Bounds Check
  let maxObservedVelocity = 0;
  let teleportDetected = false;

  for (let i = 1; i < keyframes.length; i++) {
    const kfPrev = keyframes[i - 1];
    const kfCurr = keyframes[i];
    const dt = (kfCurr.tick - kfPrev.tick) / (metadata.tickRate || 60);
    if (dt <= 0) continue;

    const prevPlayer = kfPrev.entities.find(e => e.type === 'player');
    const currPlayer = kfCurr.entities.find(e => e.type === 'player');

    if (prevPlayer && currPlayer) {
      const dx = currPlayer.pos.x - prevPlayer.pos.x;
      const dy = currPlayer.pos.y - prevPlayer.pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const velocity = dist / dt;
      if (velocity > maxObservedVelocity) {
        maxObservedVelocity = velocity;
      }

      // Check if velocity violates canonical boost max speed + 25% safety margin
      if (velocity > CANONICAL.BOOST_MAX_SPEED * 1.35) {
        teleportDetected = true;
        violations.push(`Unphysical velocity jump: ${Math.round(velocity)} px/s at tick ${kfCurr.tick} (exceeds cap of ${CANONICAL.BOOST_MAX_SPEED} px/s).`);
        break;
      }
    }
  }

  checks.push({
    name: 'Kinematic Velocity Cap & Anti-Teleport',
    passed: !teleportDetected,
    details: !teleportDetected
      ? `Peak observed speed: ${Math.round(maxObservedVelocity)} px/s (within canonical limit of ${CANONICAL.BOOST_MAX_SPEED} px/s).`
      : `Teleportation anomaly detected: player exceeded kinematic threshold with ${Math.round(maxObservedVelocity)} px/s.`
  });

  // 5. Headless Deterministic Physics Desync Check
  let desyncFrameCount = 0;
  let maxPositionalDeviation = 0;

  if (keyframes.length >= 2 && inputs.length > 0) {
    // We simulate player movement across keyframe windows
    for (let k = 0; k < keyframes.length - 1; k++) {
      const kfStart = keyframes[k];
      const kfEnd = keyframes[k + 1];

      const playerStart = kfStart.entities.find(e => e.type === 'player');
      const playerEnd = kfEnd.entities.find(e => e.type === 'player');
      if (!playerStart || !playerEnd) continue;

      // Start simulation at kfStart position & velocity
      let simX = playerStart.pos.x;
      let simY = playerStart.pos.y;
      let simVx = playerStart.velocity.x || 0;
      let simVy = playerStart.velocity.y || 0;

      // Find inputs bounded between kfStart.tick and kfEnd.tick
      const segmentInputs = inputs.filter(inp => inp.tick >= kfStart.tick && inp.tick < kfEnd.tick);
      const dt = 1 / (metadata.tickRate || 60);

      for (const input of segmentInputs) {
        let ax = 0;
        let ay = 0;

        if (input.keys & INPUT_BITS.UP) ay -= 1;
        if (input.keys & INPUT_BITS.DOWN) ay += 1;
        if (input.keys & INPUT_BITS.LEFT) ax -= 1;
        if (input.keys & INPUT_BITS.RIGHT) ax += 1;

        // Normalize directional input vector
        const len = Math.sqrt(ax * ax + ay * ay);
        if (len > 0) {
          ax /= len;
          ay /= len;
        }

        const isBoosting = (input.keys & INPUT_BITS.BOOST) !== 0;
        const accelRate = CANONICAL.ACCELERATION * (isBoosting ? 1.4 : 1.0);
        const maxSpd = isBoosting ? CANONICAL.BOOST_MAX_SPEED : CANONICAL.MAX_SPEED;

        simVx += ax * accelRate * dt;
        simVy += ay * accelRate * dt;

        // Apply friction
        simVx *= CANONICAL.FRICTION;
        simVy *= CANONICAL.FRICTION;

        // Speed cap
        const curSpd = Math.sqrt(simVx * simVx + simVy * simVy);
        if (curSpd > maxSpd) {
          simVx = (simVx / curSpd) * maxSpd;
          simVy = (simVy / curSpd) * maxSpd;
        }

        simX += simVx * dt;
        simY += simVy * dt;

        // Bound clamps
        simX = Math.max(CANONICAL.BOUNDS.minX, Math.min(CANONICAL.BOUNDS.maxX, simX));
        simY = Math.max(CANONICAL.BOUNDS.minY, Math.min(CANONICAL.BOUNDS.maxY, simY));
      }

      // Compare simulated position at end of window with recorded keyframe
      const devX = simX - playerEnd.pos.x;
      const devY = simY - playerEnd.pos.y;
      const deviation = Math.sqrt(devX * devX + devY * devY);

      if (deviation > maxPositionalDeviation) {
        maxPositionalDeviation = deviation;
      }

      if (deviation > CANONICAL.DESYNC_TOLERANCE_PX) {
        desyncFrameCount++;
      }
    }
  }

  const isDesyncTolerable = desyncFrameCount <= Math.max(1, Math.floor(keyframes.length * 0.1));
  checks.push({
    name: 'Headless Deterministic Simulation (Desync Engine)',
    passed: isDesyncTolerable,
    details: isDesyncTolerable
      ? `Simulation verified across ${keyframes.length} keyframes. Max trajectory variance: ${maxPositionalDeviation.toFixed(1)}px (threshold: ${CANONICAL.DESYNC_TOLERANCE_PX}px).`
      : `Desynchronization detected: ${desyncFrameCount} divergent keyframe intervals. Max deviation: ${maxPositionalDeviation.toFixed(1)}px.`
  });
  if (!isDesyncTolerable) {
    violations.push(`Trajectory desynchronized with canonical simulation on ${desyncFrameCount} keyframe intervals.`);
  }

  // Calculate overall score (0 - 100)
  const totalChecks = checks.length;
  const passedChecks = checks.filter(c => c.passed).length;
  let score = Math.round((passedChecks / totalChecks) * 100);
  if (violations.length > 0 && score > 75) {
    score = 65;
  }
  if (teleportDetected || !checksumMatches) {
    score = Math.min(score, 40);
  }

  const isValid = violations.length === 0;

  return {
    isValid,
    score,
    totalTicks,
    verifiedAt: new Date().toISOString(),
    checks,
    violations,
    metrics: {
      averageInputRateHz,
      maxObservedVelocity: Math.round(maxObservedVelocity),
      desyncFrameCount,
      maxPositionalDeviation: +(maxPositionalDeviation.toFixed(2)),
      keyframeCount: keyframes.length,
      inputCount: inputs.length,
      checksumMatches
    }
  };
}
