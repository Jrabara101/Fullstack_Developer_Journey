import * as THREE from 'three';
import { HitboxZone, ParallaxDebugInfo, WeaponDef } from '../types/game';
import { MapCollider } from './mapBuilder';
import { CharacterRig } from './characterRig';

export interface ShotResult {
  hitSomething: boolean;
  hitCharacter: CharacterRig | null;
  hitboxZone: HitboxZone | null;
  rawDamage: number;
  finalDamage: number;
  isHeadshot: boolean;
  hitPoint: THREE.Vector3;
  hitNormal: THREE.Vector3;
  tracerOrigin: THREE.Vector3;
  tracerEnd: THREE.Vector3;
  hasObstruction: boolean;
  debugInfo: ParallaxDebugInfo;
}

export class BallisticsEngine {
  private raycaster: THREE.Raycaster;
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.raycaster = new THREE.Raycaster();
  }

  /**
   * Fires a parallax-corrected shot from camera aim through weapon muzzle
   */
  public fireShot(
    cameraPos: THREE.Vector3,
    cameraForward: THREE.Vector3,
    muzzlePos: THREE.Vector3,
    weapon: WeaponDef,
    sprayIndex: number,
    isMoving: boolean,
    isCrouching: boolean,
    isInAir: boolean,
    mapColliders: MapCollider[],
    characters: { rig: CharacterRig; isAlive: boolean; id: string }[],
    shooterId: string
  ): ShotResult {
    // 1. Calculate Dynamic Inaccuracy Spread
    let spreadAngle = weapon.spreadBase;
    if (isCrouching) {
      spreadAngle = weapon.spreadCrouch;
    }
    if (isMoving) {
      spreadAngle += weapon.spreadMove;
    }
    if (isInAir) {
      spreadAngle += weapon.spreadAir;
    }

    // Recoil offset from pattern
    const patternStep = Math.min(sprayIndex, weapon.recoilPattern.length - 1);
    const recoilOffset = weapon.recoilPattern[patternStep] || { x: 0, y: 0 };

    // Apply recoil pitch & yaw to camera forward vector
    const aimDir = cameraForward.clone();

    // Create orthonormal basis for spread and recoil deflection
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(aimDir, up).normalize();
    const correctedUp = new THREE.Vector3().crossVectors(right, aimDir).normalize();

    // Add Recoil deflection
    aimDir.addScaledVector(right, recoilOffset.x);
    aimDir.addScaledVector(correctedUp, recoilOffset.y);

    // Add Random Cone Spread (Gaussian-like dispersion)
    const randomAngle = Math.random() * Math.PI * 2;
    const randomRadius = Math.random() * spreadAngle;
    aimDir.addScaledVector(right, Math.cos(randomAngle) * randomRadius);
    aimDir.addScaledVector(correctedUp, Math.sin(randomAngle) * randomRadius);
    aimDir.normalize();

    // 2. PARALLAX STEP 1: Trace from Camera Center to Find World Target
    const MAX_RAY_DIST = 150;
    this.raycaster.set(cameraPos, aimDir);
    this.raycaster.far = MAX_RAY_DIST;

    let targetPoint = cameraPos.clone().addScaledVector(aimDir, MAX_RAY_DIST);
    let cameraHitDistance = MAX_RAY_DIST;

    // Check environment meshes
    const environmentMeshes = mapColliders.map((c) => c.mesh);
    const camEnvHits = this.raycaster.intersectObjects(environmentMeshes, false);
    if (camEnvHits.length > 0) {
      targetPoint = camEnvHits[0].point;
      cameraHitDistance = camEnvHits[0].distance;
    }

    // A character standing in front of that wall is the real aim point. Without
    // this the muzzle is aimed at the geometry behind the target and the shot
    // sails past them — which is what happens whenever the eye and the muzzle
    // are offset from each other.
    for (const char of characters) {
      if (!char.isAlive || char.id === shooterId) continue;
      for (const hb of char.rig.hitboxes) {
        const camCharHits = this.raycaster.intersectObject(hb.mesh, false);
        if (camCharHits.length > 0 && camCharHits[0].distance < cameraHitDistance) {
          targetPoint = camCharHits[0].point;
          cameraHitDistance = camCharHits[0].distance;
        }
      }
    }

    // 3. PARALLAX STEP 2: Cast Secondary Trajectory from Weapon Muzzle to Target Point
    const muzzleDir = new THREE.Vector3().subVectors(targetPoint, muzzlePos).normalize();
    const muzzleToTargetDist = muzzlePos.distanceTo(targetPoint);

    this.raycaster.set(muzzlePos, muzzleDir);
    this.raycaster.far = Math.max(MAX_RAY_DIST, muzzleToTargetDist + 2);

    let actualHitPoint = targetPoint.clone();
    let hitNormal = new THREE.Vector3(0, 1, 0);
    let hasObstruction = false;
    let hitSomething = false;
    let hitCharacter: CharacterRig | null = null;
    let hitZone: HitboxZone | null = null;
    let isHeadshot = false;

    // Check if muzzle trajectory hits environment wall BEFORE reaching target point (low cover obstruction)
    const muzzleEnvHits = this.raycaster.intersectObjects(environmentMeshes, false);
    let firstEnvDist = Infinity;
    if (muzzleEnvHits.length > 0) {
      firstEnvDist = muzzleEnvHits[0].distance;
      actualHitPoint = muzzleEnvHits[0].point;
      if (muzzleEnvHits[0].face) {
        hitNormal = muzzleEnvHits[0].face.normal.clone();
      }
      hitSomething = true;
      if (firstEnvDist < muzzleToTargetDist - 0.2) {
        hasObstruction = true; // Muzzle was blocked by low cover!
      }
    }

    // 4. Hitbox Collision Testing with other Characters
    // Trace through character hitbox volumes along muzzle trajectory
    let closestCharDist = firstEnvDist;

    for (const char of characters) {
      if (!char.isAlive || char.id === shooterId) continue;

      const hitboxes = char.rig.hitboxes;
      // Test Head first for precision 4x multiplier
      for (const hb of hitboxes) {
        const hbMeshes = [hb.mesh];
        const charHits = this.raycaster.intersectObjects(hbMeshes, false);
        if (charHits.length > 0) {
          const hit = charHits[0];
          if (hit.distance < closestCharDist) {
            closestCharDist = hit.distance;
            actualHitPoint = hit.point;
            hitCharacter = char.rig;
            hitZone = hb.zone;
            isHeadshot = hb.zone === 'HEAD';
            hitSomething = true;
            hasObstruction = false;
          }
        }
      }
    }

    // 5. Calculate Damage Multipliers & CS 1.6 Armor Penetration
    let rawDamage = weapon.damage;
    let finalDamage = 0;

    if (hitCharacter && hitZone) {
      let multiplier = 1.0;
      if (hitZone === 'HEAD') multiplier = weapon.headshotMultiplier;
      else if (hitZone === 'LEGS') multiplier = weapon.legMultiplier;

      rawDamage *= multiplier;
      finalDamage = rawDamage;
    }

    const debugInfo: ParallaxDebugInfo = {
      cameraOrigin: [cameraPos.x, cameraPos.y, cameraPos.z],
      cameraTarget: [targetPoint.x, targetPoint.y, targetPoint.z],
      muzzleOrigin: [muzzlePos.x, muzzlePos.y, muzzlePos.z],
      actualHitPoint: [actualHitPoint.x, actualHitPoint.y, actualHitPoint.z],
      hasObstruction,
      spreadAngle,
    };

    return {
      hitSomething,
      hitCharacter,
      hitboxZone: hitZone,
      rawDamage,
      finalDamage,
      isHeadshot,
      hitPoint: actualHitPoint,
      hitNormal,
      tracerOrigin: muzzlePos.clone(),
      tracerEnd: actualHitPoint.clone(),
      hasObstruction,
      debugInfo,
    };
  }
}
