import * as THREE from 'three';
import { BotStateDebug, HitboxZone, MovementState, PlayerStats, Team, WeaponDef } from '../types/game';
import { CharacterRig } from './characterRig';
import { MapBuilder, MapCollider } from './mapBuilder';
import { WEAPON_REGISTRY } from './weapons';
import { BallisticsEngine } from './ballistics';
import { soundEngine } from '../audio/SoundEngine';

export type BotActionState = 'ROUTING' | 'HOLDING_ANGLE' | 'ENGAGING' | 'PLANTING' | 'DEFUSING';

/** A rig a bot's bullet can resolve against, tagged with who owns it. */
export interface BotDamageTarget {
  rig: CharacterRig;
  isPlayer: boolean;
  bot?: TacticalBot;
}

export type PlayerDamageHandler = (
  damage: number,
  isHeadshot: boolean,
  attackerPos: THREE.Vector3,
  attacker: PlayerStats,
  weaponName: string
) => void;

export class TacticalBot {
  public id: string;
  public name: string;
  public team: Team;
  public rig: CharacterRig;
  public stats: PlayerStats;
  public weapon: WeaponDef;

  public currentWaypointIndex: number = 0;
  public targetWaypoints: THREE.Vector3[] = [];
  public actionState: BotActionState = 'ROUTING';

  public aimTarget: THREE.Vector3 = new THREE.Vector3();
  public currentAimEuler: { pitch: number; yaw: number } = { pitch: 0, yaw: 0 };
  public targetAimEuler: { pitch: number; yaw: number } = { pitch: 0, yaw: 0 };

  // Tactical combat timers
  public reactionTimer: number = 0;
  public burstTimer: number = 0;
  public shotsFiredInBurst: number = 0;
  public burstCoolDown: number = 0;
  public sprayIndex: number = 0;
  public targetEnemy: { id: string; pos: THREE.Vector3; rig: CharacterRig } | null = null;
  public holdTimer: number = 0;
  public interactionTimer: number = 0; // 5s for plant / defuse

  public velocity: THREE.Vector3 = new THREE.Vector3();
  public isCrouched: boolean = false;
  public hasC4: boolean = false;

  constructor(id: string, name: string, team: Team, scene: THREE.Scene) {
    this.id = id;
    this.name = name;
    this.team = team;
    this.rig = new CharacterRig(team, false);
    scene.add(this.rig.root);

    this.stats = {
      id,
      name,
      team,
      isBot: true,
      health: 100,
      armor: 100,
      hasHelmet: true,
      isAlive: true,
      kills: 0,
      deaths: 0,
      assists: 0,
      money: 800,
      score: 0,
      damageDealt: 0,
    };

    this.weapon = team === 'T' ? WEAPON_REGISTRY.ak47 : WEAPON_REGISTRY.m4a1;
    this.rig.setWeapon(this.weapon.id);
  }

  /**
   * Reassign this bot's side at halftime. Team colours are baked into the rig's
   * materials at construction, so the rig is rebuilt rather than recoloured.
   */
  public setTeam(team: Team, scene: THREE.Scene) {
    this.team = team;
    this.stats.team = team;

    scene.remove(this.rig.root);
    this.rig = new CharacterRig(team, false);
    scene.add(this.rig.root);

    this.weapon = team === 'T' ? WEAPON_REGISTRY.ak47 : WEAPON_REGISTRY.m4a1;
    this.rig.setWeapon(this.weapon.id);
  }

  public initRound(spawnPos: THREE.Vector3, map: MapBuilder, isBombCarrier: boolean = false) {
    this.stats.health = 100;
    this.stats.armor = 100;
    this.stats.hasHelmet = true;
    this.stats.isAlive = true;
    this.hasC4 = isBombCarrier;
    this.actionState = 'ROUTING';
    this.targetEnemy = null;
    this.reactionTimer = 0;
    this.burstTimer = 0;
    this.shotsFiredInBurst = 0;
    this.interactionTimer = 0;
    this.velocity.set(0, 0, 0);

    const initialFacingYaw = this.team === 'T' ? Math.PI : 0;
    this.rig.reset(spawnPos, initialFacingYaw);

    // Build tactical waypoint route
    this.buildRoute(map);
  }

  public buildRoute(map: MapBuilder, forceDefuseRoute = false) {
    this.targetWaypoints = [];
    this.currentWaypointIndex = 0;

    if (this.team === 'T') {
      const takeLong = Math.random() > 0.5;
      if (takeLong) {
        this.targetWaypoints = [
          new THREE.Vector3(22, 0, 24),
          new THREE.Vector3(25, 0, 5),
          new THREE.Vector3(20, 0, -8),
          new THREE.Vector3(0, 0.4, 0), // Bombsite A
        ];
      } else {
        this.targetWaypoints = [
          new THREE.Vector3(-22, 0, 24),
          new THREE.Vector3(-20, 0, 4),
          new THREE.Vector3(-8, 0, 0),
          new THREE.Vector3(0, 0.4, 0),
        ];
      }
    } else {
      // CT Route: Defend site or rotate to defuse
      if (forceDefuseRoute) {
        this.targetWaypoints = [
          new THREE.Vector3(0, 0, -14),
          new THREE.Vector3(0, 0.4, 0),
        ];
      } else {
        const defenseSpots = [
          [new THREE.Vector3(12, 0, -14), new THREE.Vector3(20, 0, -8)], // Hold Long
          [new THREE.Vector3(-10, 0, -14), new THREE.Vector3(-8, 0, 0)], // Hold Short
          [new THREE.Vector3(0, 3.2, -17)], // Hold Catwalk
          [new THREE.Vector3(4.2, 0.4, -4.5)], // Ninja site box
        ];
        const chosen = defenseSpots[Math.floor(Math.random() * defenseSpots.length)];
        this.targetWaypoints = [...chosen];
      }
    }
  }

  public update(
    delta: number,
    map: MapBuilder,
    allEnemies: { id: string; pos: THREE.Vector3; rig: CharacterRig; isAlive: boolean; stats: PlayerStats }[],
    ballistics: BallisticsEngine,
    mapColliders: MapCollider[],
    charactersForRaycast: { rig: CharacterRig; isAlive: boolean; id: string }[],
    bombPlanted: boolean,
    bombPos: THREE.Vector3 | undefined,
    allTargets: BotDamageTarget[],
    onPlayerDamaged?: PlayerDamageHandler,
    onBotKilled?: (killer: PlayerStats, victim: PlayerStats, isHeadshot: boolean, weapon: string) => void,
    onBombPlantedByBot?: () => void,
    onBombDefusedByBot?: () => void
  ) {
    if (!this.stats.isAlive) {
      this.rig.updateAnimation(delta, 'IDLE', 0, 0, 0, false);
      return;
    }

    const currentPos = this.rig.root.position;

    // 1. Enemy Perception & Line of Sight Scanning
    this.scanForEnemies(currentPos, allEnemies, mapColliders);

    // 2. State Machine Execution
    if (this.targetEnemy && this.targetEnemy.rig) {
      this.actionState = 'ENGAGING';
      this.handleCombat(
        delta,
        ballistics,
        mapColliders,
        charactersForRaycast,
        allTargets,
        onPlayerDamaged,
        onBotKilled
      );
    } else if (bombPlanted && this.team === 'CT') {
      // Bomb is ticking! Rotate to bomb site and defuse!
      if (bombPos) {
        const distToBomb = currentPos.distanceTo(bombPos);
        if (distToBomb < 2.2) {
          this.actionState = 'DEFUSING';
          this.interactionTimer += delta;
          soundEngine.playBombDefusing();
          if (this.interactionTimer >= 5.0) {
            onBombDefusedByBot?.();
          }
        } else {
          this.actionState = 'ROUTING';
          this.targetWaypoints = [bombPos.clone()];
          this.currentWaypointIndex = 0;
          this.moveToTarget(delta, bombPos);
        }
      }
    } else if (this.team === 'T' && this.hasC4 && !bombPlanted && map.isInsideBombSite(currentPos)) {
      // Inside bomb site with C4! Plant the bomb!
      this.actionState = 'PLANTING';
      this.interactionTimer += delta;
      this.isCrouched = true;
      this.velocity.set(0, 0, 0);
      soundEngine.playBombPlanting();
      if (this.interactionTimer >= 4.5) {
        this.hasC4 = false;
        onBombPlantedByBot?.();
      }
    } else {
      // Tactical Movement along waypoints
      if (this.currentWaypointIndex < this.targetWaypoints.length) {
        const wp = this.targetWaypoints[this.currentWaypointIndex];
        const dist = currentPos.distanceTo(wp);
        if (dist < 1.4) {
          this.currentWaypointIndex++;
          if (this.currentWaypointIndex >= this.targetWaypoints.length) {
            this.actionState = 'HOLDING_ANGLE';
            this.holdTimer = 3.0 + Math.random() * 4.0;
          }
        } else {
          this.actionState = 'ROUTING';
          this.moveToTarget(delta, wp);
        }
      } else {
        // Holding Angle behind cover
        this.actionState = 'HOLDING_ANGLE';
        this.velocity.set(0, 0, 0);
        this.holdTimer -= delta;
        if (this.holdTimer <= 0) {
          // Re-pick a nearby tactical vantage point
          this.buildRoute(map);
        }
      }
    }

    // 3. Update character rig animations & aim angles
    const speedRatio = this.velocity.length() / 4.5;
    let moveState: MovementState = 'IDLE';
    if (this.isCrouched) moveState = 'CROUCHING';
    else if (speedRatio > 0.4) moveState = 'RUNNING';
    else if (speedRatio > 0.05) moveState = 'WALKING';

    this.rig.updateAnimation(
      delta,
      moveState,
      speedRatio,
      this.currentAimEuler.pitch,
      this.currentAimEuler.yaw,
      this.isCrouched
    );
  }

  private scanForEnemies(
    currentPos: THREE.Vector3,
    allEnemies: { id: string; pos: THREE.Vector3; rig: CharacterRig; isAlive: boolean; stats: PlayerStats }[],
    mapColliders: MapCollider[]
  ) {
    let closestEnemy: { id: string; pos: THREE.Vector3; rig: CharacterRig } | null = null;
    // Engagement range. The map is 120m end to end with an open centre corridor,
    // so a range near that span let bots at opposite spawns lock onto each other
    // and stall at waypoint 0 instead of ever taking the site.
    let closestDist = 32;

    const botEyePos = currentPos.clone().add(new THREE.Vector3(0, 1.5, 0));
    const envMeshes = mapColliders.map((c) => c.mesh);
    const losRaycaster = new THREE.Raycaster();

    for (const enemy of allEnemies) {
      if (!enemy.isAlive) continue;
      const enemyEyePos = enemy.pos.clone().add(new THREE.Vector3(0, 1.5, 0));
      const dist = botEyePos.distanceTo(enemyEyePos);

      if (dist < closestDist) {
        // Line of sight is checked along the same line the bullet will take
        // (muzzle to torso), so a bot never engages a target it cannot hit.
        const aimPoint = enemy.pos.clone().add(new THREE.Vector3(0, 1.1, 0));
        const dir = new THREE.Vector3().subVectors(aimPoint, botEyePos).normalize();
        losRaycaster.set(botEyePos, dir);
        losRaycaster.far = botEyePos.distanceTo(aimPoint) - 0.35;

        const hits = losRaycaster.intersectObjects(envMeshes, false);
        if (hits.length === 0) {
          // Clear line of sight!
          closestDist = dist;
          closestEnemy = { id: enemy.id, pos: enemy.pos, rig: enemy.rig };
        }
      }
    }

    this.targetEnemy = closestEnemy;
  }

  private moveToTarget(delta: number, target: THREE.Vector3) {
    const currentPos = this.rig.root.position;
    const moveDir = new THREE.Vector3().subVectors(target, currentPos);
    moveDir.y = 0;
    const dist = moveDir.length();

    if (dist > 0.1) {
      moveDir.normalize();
      const moveSpeed = 4.2; // ~220 units CS run speed
      this.velocity.copy(moveDir).multiplyScalar(moveSpeed);
      currentPos.addScaledVector(this.velocity, delta);

      // Rotate body toward move direction
      const targetYaw = Math.atan2(moveDir.x, moveDir.z);
      this.rig.root.rotation.y = targetYaw;
      this.currentAimEuler.yaw = targetYaw;
    }
  }

  private handleCombat(
    delta: number,
    ballistics: BallisticsEngine,
    mapColliders: MapCollider[],
    charactersForRaycast: { rig: CharacterRig; isAlive: boolean; id: string }[],
    allTargets: BotDamageTarget[],
    onPlayerDamaged?: PlayerDamageHandler,
    onBotKilled?: (killer: PlayerStats, victim: PlayerStats, isHeadshot: boolean, weapon: string) => void
  ) {
    if (!this.targetEnemy) return;

    // 1. Counter-Strafe to zero velocity for pinpoint CS accuracy
    this.velocity.set(0, 0, 0);

    const botEyePos = this.rig.root.position.clone().add(new THREE.Vector3(0, 1.5, 0));
    // Aim centre mass (torso hitbox sits at y=1.1). Aiming at the head's lower
    // edge made every landed shot a headshot once recoil lifted the muzzle.
    const aimTarget = this.targetEnemy.pos.clone().add(new THREE.Vector3(0, 1.1, 0));

    const aimDir = new THREE.Vector3().subVectors(aimTarget, botEyePos).normalize();
    const yaw = Math.atan2(aimDir.x, aimDir.z);
    const pitch = Math.asin(aimDir.y);

    this.rig.root.rotation.y = yaw;
    this.currentAimEuler.yaw = yaw;
    this.currentAimEuler.pitch = pitch;

    // 2. Reaction Delay (human-like 250ms reaction before firing)
    this.reactionTimer += delta;
    if (this.reactionTimer < 0.25) return;

    // 3. Burst Fire Mechanics (2-4 bullet bursts with pause)
    this.burstCoolDown -= delta;
    if (this.burstCoolDown > 0) return;

    this.burstTimer += delta;
    if (this.burstTimer >= this.weapon.cycleTime) {
      this.burstTimer = 0;
      this.shotsFiredInBurst++;
      this.sprayIndex++;

      // Fire weapon with ballistics
      const muzzlePos = this.rig.getMuzzleWorldPosition();
      soundEngine.playGunshot(this.weapon.id, [muzzlePos.x, muzzlePos.y, muzzlePos.z], false);

      const shot = ballistics.fireShot(
        botEyePos,
        aimDir,
        muzzlePos,
        this.weapon,
        this.sprayIndex,
        false, // Stopped moving (counter-strafed)
        this.isCrouched,
        false,
        mapColliders,
        charactersForRaycast,
        this.id
      );

      if (shot.hitCharacter && shot.hitboxZone) {
        const isHeadshot = shot.isHeadshot;
        if (isHeadshot) {
          soundEngine.playHeadshotDink([shot.hitPoint.x, shot.hitPoint.y, shot.hitPoint.z]);
        } else {
          soundEngine.playBodyHit([shot.hitPoint.x, shot.hitPoint.y, shot.hitPoint.z], true);
        }

        // Resolve the hit against whoever owns the rig that was struck.
        const victim = allTargets.find((t) => t.rig === shot.hitCharacter);
        if (victim) {
          if (victim.isPlayer) {
            onPlayerDamaged?.(
              shot.finalDamage,
              isHeadshot,
              this.rig.root.position.clone(),
              this.stats,
              this.weapon.name
            );
          } else if (victim.bot && victim.bot.stats.isAlive) {
            const fatal = victim.bot.takeDamage(shot.finalDamage, isHeadshot, victim.bot.stats.hasHelmet);
            this.stats.damageDealt += shot.finalDamage;
            if (fatal) {
              this.stats.kills++;
              this.stats.money = Math.min(16000, this.stats.money + this.weapon.killReward);
              this.stats.score += isHeadshot ? 150 : 100;
              onBotKilled?.(this.stats, victim.bot.stats, isHeadshot, this.weapon.name);
            }
          }
        }
      }

      if (this.shotsFiredInBurst >= 3) {
        // End of burst, wait for recoil reset
        this.shotsFiredInBurst = 0;
        this.sprayIndex = 0;
        this.burstCoolDown = 0.35 + Math.random() * 0.2;
      }
    }
  }

  public takeDamage(damage: number, isHeadshot: boolean, hasHelmet: boolean): boolean {
    if (!this.stats.isAlive) return false;

    let finalDmg = damage;
    if (this.stats.armor > 0) {
      if (isHeadshot && !this.stats.hasHelmet) {
        // Unarmored headshot is lethal
        finalDmg = damage;
      } else {
        // Armor absorbs 50%
        const absorbed = damage * 0.5;
        this.stats.armor = Math.max(0, this.stats.armor - absorbed * 0.5);
        finalDmg = damage - absorbed;
      }
    }

    this.stats.health = Math.max(0, this.stats.health - finalDmg);
    if (this.stats.health <= 0) {
      this.stats.isAlive = false;
      this.stats.deaths++;
      this.rig.triggerDeath();
      return true; // Fatal blow
    }
    return false;
  }

  public getDebugState(): BotStateDebug {
    return {
      id: this.id,
      name: this.name,
      state: this.actionState,
      targetDistance: this.targetEnemy ? this.rig.root.position.distanceTo(this.targetEnemy.pos) : 0,
      currentObjective: this.team === 'T' ? (this.hasC4 ? 'Plant C4 Bomb' : 'Assault Site A') : 'Defend Site A',
      reactionTimer: Number(this.reactionTimer.toFixed(2)),
    };
  }
}
