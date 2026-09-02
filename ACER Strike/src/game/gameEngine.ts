import * as THREE from 'three';
import {
  HitboxZone,
  InventoryItem,
  KillFeedEntry,
  MovementState,
  ParallaxDebugInfo,
  PlayerInventory,
  PlayerStats,
  RoundState,
  Team,
  WeaponDef,
} from '../types/game';
import { soundEngine } from '../audio/SoundEngine';
import { MapBuilder, MapCollider } from './mapBuilder';
import { CharacterRig } from './characterRig';
import { WEAPON_REGISTRY } from './weapons';
import { BallisticsEngine, ShotResult } from './ballistics';
import { BotDamageTarget, TacticalBot } from './botAI';

export interface VisualTracer {
  line: THREE.Line;
  startTime: number;
  duration: number;
}

export interface ParticleEffect {
  mesh: THREE.Points | THREE.Mesh;
  velocity: THREE.Vector3[];
  lifetime: number;
  maxLife: number;
}

/** Transient crosshair confirmation that a shot connected. */
export interface HitMarker {
  id: string;
  damage: number;
  isHeadshot: boolean;
  isFatal: boolean;
  createdAt: number;
}

/** Directional arc showing which way incoming damage came from. */
export interface DamageIndicator {
  id: string;
  /** Yaw of the attacker relative to the player, in radians. */
  angle: number;
  createdAt: number;
}

export class GameEngine {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public mapBuilder: MapBuilder;
  public ballistics: BallisticsEngine;

  // Player state
  public playerTeam: Team = 'CT';
  public playerStats: PlayerStats;
  public playerRig: CharacterRig;
  public playerInventory: PlayerInventory;
  public activeWeapon: WeaponDef;

  // Movement physics
  public playerPos: THREE.Vector3 = new THREE.Vector3(0, 0, -28);
  public playerVel: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public playerYaw: number = 0;
  public playerPitch: number = 0;
  public isGrounded: boolean = true;
  public isCrouching: boolean = false;
  public isWalking: boolean = false;
  public movementState: MovementState = 'IDLE';

  // Camera & OTS Shoulder Setup
  public shoulderSide: number = 1; // 1 = Right shoulder (+0.55m), -1 = Left shoulder (-0.55m)
  public targetShoulderSide: number = 1;
  public currentShoulderOffset: number = 0.55;
  public cameraDistance: number = 2.4;
  public cameraHeight: number = 1.65;
  public currentCameraPos: THREE.Vector3 = new THREE.Vector3();

  // Weapon & Recoil state
  public isShooting: boolean = false;
  public lastShotTime: number = 0;
  public sprayIndex: number = 0;
  public recoilRecoveryTimer: number = 0;
  public isReloading: boolean = false;
  public reloadTimer: number = 0;
  public currentDynamicSpread: number = 0.002;
  public currentRecoilOffset: { x: number; y: number } = { x: 0, y: 0 };

  // Tactical Bomb & Round State
  public roundState: RoundState = 'FREEZE_TIME';
  public roundTimeRemaining: number = 15; // 15s freeze time then 1:45
  public roundNumber: number = 1;
  public maxRounds: number = 15;
  public roundsToWin: number = 8; // First to 8 of 15 takes the match
  public halftimeRound: number = 8; // Sides swap at the start of this round
  public ctScore: number = 0;
  public tScore: number = 0;
  public matchWinner: Team | null = null;
  public isDraw: boolean = false;
  /** Set for the duration of ROUND_END so the UI can caption the outcome. */
  public lastRoundWinner: Team | null = null;
  public lastRoundReason: string = '';
  /** Counts consecutive round losses per side to drive the loss-bonus ladder. */
  public lossStreak: Record<Team, number> = { CT: 0, T: 0 };
  /** Counts down during ROUND_END, then starts the next round from the update loop. */
  private roundEndTimer: number = 0;
  private pendingMatchEnd: boolean = false;
  public bombPlanted: boolean = false;
  public bombTimer: number = 45;
  public bombPosition: THREE.Vector3 = new THREE.Vector3(0, 0.4, 0);
  public bombMesh: THREE.Group | null = null;
  public bombBeepTimer: number = 0;
  public bombPlantProgress: number = 0; // 0 to 5s
  public isPlantingBomb: boolean = false;
  public bombDefuseProgress: number = 0; // 0 to 5s
  public isDefusingBomb: boolean = false;

  // Tactical Bots
  public bots: TacticalBot[] = [];

  // Match killfeed & event callbacks
  public killFeed: KillFeedEntry[] = [];
  public onStateUpdate?: () => void;
  public onMatchEnd?: (winner: Team | null) => void;
  public lastParallaxDebug: ParallaxDebugInfo | null = null;

  // Pause (menu open) — freezes simulation without tearing down the scene
  public isPaused: boolean = false;

  // Hit feedback
  public hitMarkers: HitMarker[] = [];
  public damageIndicators: DamageIndicator[] = [];
  public lastDamageFlash: number = 0;

  // Visual Effects (Tracers, Particles, Muzzle Flashes)
  private tracers: VisualTracer[] = [];
  private particles: ParticleEffect[] = [];
  private muzzleFlashLight: THREE.PointLight;
  private footstepTimer: number = 0;

  // Debug settings
  public debugDrawRays: boolean = false;
  public debugDrawHitboxes: boolean = false;
  public godMode: boolean = false;
  public unlimitedAmmo: boolean = false;
  public noRecoil: boolean = false;
  private debugCameraRayMesh: THREE.Line | null = null;
  private debugMuzzleRayMesh: THREE.Line | null = null;

  constructor(canvas: HTMLCanvasElement) {
    // 1. Initialize Three.js WebGL Scene & Renderer
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1e24);
    this.scene.fog = new THREE.FogExp2(0x1a1e24, 0.008);

    this.camera = new THREE.PerspectiveCamera(72, canvas.clientWidth / canvas.clientHeight, 0.1, 300);
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 2. Initialize Subsystems
    this.mapBuilder = new MapBuilder(this.scene);
    this.mapBuilder.buildMap();

    this.ballistics = new BallisticsEngine(this.scene);

    // 3. Setup Player
    this.playerStats = {
      id: 'player_1',
      name: 'Operator (You)',
      team: this.playerTeam,
      isBot: false,
      health: 100,
      armor: 100,
      hasHelmet: true,
      isAlive: true,
      kills: 0,
      deaths: 0,
      assists: 0,
      money: 16000, // Generous test economy
      score: 0,
      damageDealt: 0,
    };

    this.playerInventory = {
      primary: { weaponId: 'ak47', clip: 30, reserve: 90 },
      secondary: { weaponId: 'usp', clip: 12, reserve: 24 },
      knife: { weaponId: 'knife', clip: 1, reserve: 0 },
      c4: null,
      hasKevlar: true,
      hasHelmet: true,
      hasDefuseKit: true,
      activeSlot: 1,
    };

    this.activeWeapon = WEAPON_REGISTRY.ak47;

    this.playerRig = new CharacterRig(this.playerTeam, true);
    this.scene.add(this.playerRig.root);
    this.playerRig.setWeapon(this.activeWeapon.id);

    // Muzzle Flash Light
    this.muzzleFlashLight = new THREE.PointLight(0xffcc44, 0, 8);
    this.scene.add(this.muzzleFlashLight);

    // 4. Spawn Tactical Bots (3 CT vs 3 T)
    this.initBots();

    // 5. Start Round 1
    this.startNewRound();
  }

  private initBots() {
    this.bots.forEach((b) => this.scene.remove(b.rig.root));
    this.bots = [];

    // 2 T Bots
    this.bots.push(new TacticalBot('bot_t1', 'Terrorist Rex', 'T', this.scene));
    this.bots.push(new TacticalBot('bot_t2', 'Terrorist Viper', 'T', this.scene));

    // 2 CT Bots
    this.bots.push(new TacticalBot('bot_ct1', 'CT Bravo', 'CT', this.scene));
    this.bots.push(new TacticalBot('bot_ct2', 'CT Delta', 'CT', this.scene));
  }

  public setPlayerTeam(team: Team) {
    this.playerTeam = team;
    this.playerStats.team = team;
    this.scene.remove(this.playerRig.root);
    this.playerRig = new CharacterRig(team, true);
    this.scene.add(this.playerRig.root);
    this.playerRig.setWeapon(this.activeWeapon.id);
    this.startNewRound();
  }

  public startNewRound() {
    this.roundState = 'FREEZE_TIME';
    this.roundTimeRemaining = 15; // 15-second freeze-time / buy period
    this.bombPlanted = false;
    this.bombTimer = 45;
    this.bombPlantProgress = 0;
    this.bombDefuseProgress = 0;
    this.isPlantingBomb = false;
    this.isDefusingBomb = false;

    if (this.bombMesh) {
      this.scene.remove(this.bombMesh);
      this.bombMesh = null;
    }

    // Reset Player position & state
    this.playerStats.health = 100;
    this.playerStats.armor = this.playerInventory.hasKevlar ? 100 : 0;
    this.playerStats.isAlive = true;

    // Reset player ammo
    if (this.playerInventory.primary) {
      this.playerInventory.primary.clip = WEAPON_REGISTRY[this.playerInventory.primary.weaponId].clipSize;
    }
    this.playerInventory.secondary.clip = WEAPON_REGISTRY[this.playerInventory.secondary.weaponId].clipSize;

    // Spawn point based on team
    const spawns = this.playerTeam === 'CT' ? this.mapBuilder.ctSpawns : this.mapBuilder.tSpawns;
    const spawnPos = spawns[0].clone();
    this.playerPos.copy(spawnPos);
    this.playerVel.set(0, 0, 0);
    this.playerYaw = this.playerTeam === 'CT' ? 0 : Math.PI;
    this.playerPitch = 0;
    this.playerRig.reset(spawnPos, this.playerYaw);

    // Assign C4 to player if T team, or to a T bot
    if (this.playerTeam === 'T') {
      this.playerInventory.c4 = { weaponId: 'c4', clip: 1, reserve: 0 };
    } else {
      this.playerInventory.c4 = null;
    }

    // Reset Bots
    const tSpawns = [...this.mapBuilder.tSpawns].slice(1);
    const ctSpawns = [...this.mapBuilder.ctSpawns].slice(1);

    let tIndex = 0;
    let ctIndex = 0;

    this.bots.forEach((bot) => {
      const isBombCarrier = this.playerTeam !== 'T' && bot.team === 'T' && tIndex === 0;
      if (bot.team === 'T') {
        const sp = tSpawns[tIndex % tSpawns.length];
        bot.initRound(sp, this.mapBuilder, isBombCarrier);
        tIndex++;
      } else {
        const sp = ctSpawns[ctIndex % ctSpawns.length];
        bot.initRound(sp, this.mapBuilder, false);
        ctIndex++;
      }
    });

    soundEngine.playRadio('Prepare to fight.');
  }

  // --- WEAPON & INVENTORY MANAGEMENT ---

  public selectWeaponSlot(slot: 1 | 2 | 3 | 5) {
    if (this.isReloading) {
      this.isReloading = false;
    }

    if (slot === 1 && this.playerInventory.primary) {
      this.playerInventory.activeSlot = 1;
      this.activeWeapon = WEAPON_REGISTRY[this.playerInventory.primary.weaponId];
    } else if (slot === 2) {
      this.playerInventory.activeSlot = 2;
      this.activeWeapon = WEAPON_REGISTRY[this.playerInventory.secondary.weaponId];
    } else if (slot === 3) {
      this.playerInventory.activeSlot = 3;
      this.activeWeapon = WEAPON_REGISTRY.knife;
    } else if (slot === 5 && this.playerInventory.c4) {
      this.playerInventory.activeSlot = 5;
      this.activeWeapon = WEAPON_REGISTRY.c4;
    }

    this.playerRig.setWeapon(this.activeWeapon.id);
    this.sprayIndex = 0;
  }

  public buyWeapon(weaponId: string): boolean {
    const weapon = WEAPON_REGISTRY[weaponId];
    if (!weapon) return false;

    if (this.playerStats.money < weapon.price) {
      soundEngine.playEmptyClick();
      return false;
    }

    this.playerStats.money -= weapon.price;
    soundEngine.playBuySound();

    if (weapon.category === 'RIFLE' || weapon.category === 'SNIPER') {
      this.playerInventory.primary = { weaponId, clip: weapon.clipSize, reserve: weapon.maxReserve };
      this.selectWeaponSlot(1);
    } else if (weapon.category === 'PISTOL') {
      this.playerInventory.secondary = { weaponId, clip: weapon.clipSize, reserve: weapon.maxReserve };
      this.selectWeaponSlot(2);
    }
    return true;
  }

  public buyEquipment(itemType: 'kevlar' | 'helmet' | 'kit'): boolean {
    if (itemType === 'kevlar') {
      if (this.playerStats.money < 650) return false;
      this.playerStats.money -= 650;
      this.playerInventory.hasKevlar = true;
      this.playerStats.armor = 100;
    } else if (itemType === 'helmet') {
      if (this.playerStats.money < 1000) return false;
      this.playerStats.money -= 1000;
      this.playerInventory.hasKevlar = true;
      this.playerInventory.hasHelmet = true;
      this.playerStats.armor = 100;
      this.playerStats.hasHelmet = true;
    } else if (itemType === 'kit' && this.playerTeam === 'CT') {
      if (this.playerStats.money < 400) return false;
      this.playerStats.money -= 400;
      this.playerInventory.hasDefuseKit = true;
    }
    soundEngine.playBuySound();
    return true;
  }

  public toggleShoulderSwap() {
    this.targetShoulderSide = this.targetShoulderSide === 1 ? -1 : 1;
    soundEngine.playShoulderSwap();
  }

  public reload() {
    if (this.isReloading) return;
    const activeItem =
      this.playerInventory.activeSlot === 1
        ? this.playerInventory.primary
        : this.playerInventory.activeSlot === 2
        ? this.playerInventory.secondary
        : null;

    if (!activeItem) return;
    if (activeItem.clip >= this.activeWeapon.clipSize || activeItem.reserve <= 0) return;

    this.isReloading = true;
    this.reloadTimer = this.activeWeapon.reloadTime;
    soundEngine.playReload('mag_out');
    setTimeout(() => soundEngine.playReload('mag_in'), 800);
    setTimeout(() => soundEngine.playReload('slide_pull'), 1500);
  }

  // --- SHOOTING & BALLISTICS EXECUTION ---

  public handlePrimaryFire() {
    if (!this.playerStats.isAlive || this.roundState === 'FREEZE_TIME' || this.isReloading) return;

    const now = performance.now() / 1000;
    if (now - this.lastShotTime < this.activeWeapon.cycleTime) return;

    // Check C4 plant interaction
    if (this.activeWeapon.id === 'c4') {
      this.startPlantingBomb();
      return;
    }

    const activeItem =
      this.playerInventory.activeSlot === 1
        ? this.playerInventory.primary
        : this.playerInventory.activeSlot === 2
        ? this.playerInventory.secondary
        : this.playerInventory.knife;

    if (activeItem && activeItem.clip <= 0 && this.activeWeapon.category !== 'MELEE') {
      soundEngine.playEmptyClick();
      this.reload();
      return;
    }

    if (activeItem && !this.unlimitedAmmo && this.activeWeapon.category !== 'MELEE') {
      activeItem.clip--;
    }

    this.lastShotTime = now;
    this.sprayIndex++;
    this.recoilRecoveryTimer = 0.35;

    // Recoil Camera Kick (CS style upward climb with pattern)
    const patternStep = Math.min(this.sprayIndex, this.activeWeapon.recoilPattern.length - 1);
    const patternOffset = this.activeWeapon.recoilPattern[patternStep] || { x: 0, y: 0 };
    if (!this.noRecoil) {
      this.playerPitch += 0.008 + (patternOffset.y || 0) * 0.15;
      this.playerYaw += (patternOffset.x || 0) * 0.12;
      this.currentRecoilOffset = patternOffset;
    }

    // Play Sound
    const muzzleWorld = this.playerRig.getMuzzleWorldPosition();
    soundEngine.playGunshot(this.activeWeapon.id, [muzzleWorld.x, muzzleWorld.y, muzzleWorld.z], true);

    // Muzzle Flash Light
    this.muzzleFlashLight.position.copy(muzzleWorld);
    this.muzzleFlashLight.intensity = 3.5;
    setTimeout(() => {
      this.muzzleFlashLight.intensity = 0;
    }, 45);

    // Execute Parallax Hitscan Ballistics Raycast
    const cameraForward = new THREE.Vector3();
    this.camera.getWorldDirection(cameraForward);

    const isMoving = this.playerVel.length() > 0.8;
    const isInAir = !this.isGrounded;

    const botTargets = this.bots.map((b) => ({
      rig: b.rig,
      isAlive: b.stats.isAlive,
      id: b.id,
    }));

    const shotResult = this.ballistics.fireShot(
      this.camera.position,
      cameraForward,
      muzzleWorld,
      this.activeWeapon,
      this.noRecoil ? 0 : this.sprayIndex,
      isMoving,
      this.isCrouching,
      isInAir,
      this.mapBuilder.colliders,
      botTargets,
      this.playerStats.id
    );

    this.lastParallaxDebug = shotResult.debugInfo;

    // Spawn Visual 3D Bullet Tracer
    this.spawnTracer(shotResult.tracerOrigin, shotResult.tracerEnd);

    // Spawn Impact Debris or Hit Effects
    if (shotResult.hitSomething) {
      if (shotResult.hitCharacter && shotResult.hitboxZone) {
        // Hit Bot!
        const hitBot = this.bots.find((b) => b.rig === shotResult.hitCharacter);
        if (hitBot && hitBot.stats.isAlive) {
          const fatal = hitBot.takeDamage(shotResult.finalDamage, shotResult.isHeadshot, hitBot.stats.hasHelmet);
          this.playerStats.damageDealt += shotResult.finalDamage;
          this.playerStats.score += shotResult.isHeadshot ? 150 : 100;
          this.pushHitMarker(shotResult.finalDamage, shotResult.isHeadshot, fatal);

          if (shotResult.isHeadshot) {
            soundEngine.playHeadshotDink([shotResult.hitPoint.x, shotResult.hitPoint.y, shotResult.hitPoint.z]);
            this.spawnHeadshotSparks(shotResult.hitPoint);
          } else {
            soundEngine.playBodyHit([shotResult.hitPoint.x, shotResult.hitPoint.y, shotResult.hitPoint.z], hitBot.stats.armor > 0);
            this.spawnBloodSplatter(shotResult.hitPoint);
          }

          if (fatal) {
            this.playerStats.kills++;
            this.playerStats.money += this.activeWeapon.killReward;
            this.addKillFeed(this.playerStats.name, this.playerTeam, hitBot.name, hitBot.team, this.activeWeapon.name, shotResult.isHeadshot);
            this.checkRoundWinConditions();
          }
        }
      } else {
        // Hit Wall or Cover
        this.spawnWallSparks(shotResult.hitPoint, shotResult.hitNormal);
      }
    }

    // Update debug rays if enabled
    if (this.debugDrawRays) {
      this.updateDebugRays(shotResult.debugInfo);
    }
  }

  // --- TRACERS & VISUAL FX ---

  private spawnTracer(origin: THREE.Vector3, target: THREE.Vector3) {
    const points = [origin, target];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: 0xffd277,
      linewidth: 2,
      transparent: true,
      opacity: 0.9,
    });
    const line = new THREE.Line(geo, mat);
    this.scene.add(line);

    this.tracers.push({
      line,
      startTime: performance.now(),
      duration: 120, // 120ms tracer beam
    });
  }

  private spawnWallSparks(pos: THREE.Vector3, normal: THREE.Vector3) {
    const count = 8;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities: THREE.Vector3[] = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;

      const spread = new THREE.Vector3(
        (Math.random() - 0.5) * 4 + normal.x * 3,
        Math.random() * 4 + normal.y * 3,
        (Math.random() - 0.5) * 4 + normal.z * 3
      );
      velocities.push(spread);
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffcc44,
      size: 0.12,
      transparent: true,
      opacity: 0.9,
    });
    const points = new THREE.Points(geo, mat);
    this.scene.add(points);

    this.particles.push({
      mesh: points,
      velocity: velocities,
      lifetime: 0,
      maxLife: 0.25,
    });
  }

  private spawnHeadshotSparks(pos: THREE.Vector3) {
    const count = 16;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities: THREE.Vector3[] = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;

      velocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 6,
          Math.random() * 6 + 2,
          (Math.random() - 0.5) * 6
        )
      );
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xff4422,
      size: 0.18,
      transparent: true,
      opacity: 1.0,
    });
    const points = new THREE.Points(geo, mat);
    this.scene.add(points);

    this.particles.push({
      mesh: points,
      velocity: velocities,
      lifetime: 0,
      maxLife: 0.4,
    });
  }

  private spawnBloodSplatter(pos: THREE.Vector3) {
    const count = 10;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities: THREE.Vector3[] = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;

      velocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          Math.random() * 2,
          (Math.random() - 0.5) * 3
        )
      );
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x8a0303,
      size: 0.15,
      transparent: true,
      opacity: 0.85,
    });
    const points = new THREE.Points(geo, mat);
    this.scene.add(points);

    this.particles.push({
      mesh: points,
      velocity: velocities,
      lifetime: 0,
      maxLife: 0.3,
    });
  }

  // --- BOMB PLANT & DEFUSAL LOGIC ---

  public startPlantingBomb() {
    if (this.roundState === 'FREEZE_TIME' || this.bombPlanted) return;
    if (!this.mapBuilder.isInsideBombSite(this.playerPos)) {
      soundEngine.playRadio('Need to be on Bombsite A to plant.');
      return;
    }
    this.isPlantingBomb = true;
  }

  public stopPlantingBomb() {
    this.isPlantingBomb = false;
    this.bombPlantProgress = 0;
  }

  public startDefusingBomb() {
    if (!this.bombPlanted || this.playerTeam !== 'CT') return;
    const distToBomb = this.playerPos.distanceTo(this.bombPosition);
    if (distToBomb > 3.0) return;
    this.isDefusingBomb = true;
  }

  public stopDefusingBomb() {
    this.isDefusingBomb = false;
    this.bombDefuseProgress = 0;
  }

  private completeBombPlant(plantedBy: string) {
    this.bombPlanted = true;
    this.roundState = 'BOMB_PLANTED';
    this.bombTimer = 45;
    this.isPlantingBomb = false;
    this.bombPlantProgress = 0;
    this.bombPosition.copy(this.playerPos);

    // Spawn 3D C4 Bomb Mesh on ground
    const bombGroup = new THREE.Group();
    const c4Mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.15, 0.25),
      new THREE.MeshStandardMaterial({ color: 0x82542a, roughness: 0.8 })
    );
    bombGroup.add(c4Mesh);

    const ledMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    ledMesh.position.set(0, 0.1, 0);
    bombGroup.add(ledMesh);

    bombGroup.position.copy(this.bombPosition);
    bombGroup.position.y = 0.1;
    this.scene.add(bombGroup);
    this.bombMesh = bombGroup;

    // Planting pays the T side even if the round is later lost.
    if (plantedBy === this.playerStats.name) {
      this.playerStats.money = Math.min(16000, this.playerStats.money + 300);
      this.playerStats.score += 50;
    }

    soundEngine.playRadio('The bomb has been planted!');
  }

  private completeBombDefuse(defusedBy: string) {
    this.bombPlanted = false;
    this.isDefusingBomb = false;

    // Defuser bonus, paid on top of the round win.
    if (defusedBy === this.playerStats.name) {
      this.playerStats.money = Math.min(16000, this.playerStats.money + 300);
      this.playerStats.score += 50;
    }

    this.endRound('CT', 'Bomb has been defused. Counter-Terrorists Win!');
  }

  private checkRoundWinConditions() {
    if (this.roundState === 'ROUND_END' || this.roundState === 'MATCH_END') return;

    // Count alive players on each team
    const ctAlive = (this.playerTeam === 'CT' && this.playerStats.isAlive ? 1 : 0) +
      this.bots.filter((b) => b.team === 'CT' && b.stats.isAlive).length;

    const tAlive = (this.playerTeam === 'T' && this.playerStats.isAlive ? 1 : 0) +
      this.bots.filter((b) => b.team === 'T' && b.stats.isAlive).length;

    if (tAlive === 0 && !this.bombPlanted) {
      this.endRound('CT', 'Terrorists eliminated. Counter-Terrorists Win!');
    } else if (ctAlive === 0) {
      this.endRound('T', 'Counter-Terrorists eliminated. Terrorists Win!');
    }
  }

  /**
   * Single exit point for every round outcome. Handles score, economy, streaks,
   * match-end detection and scheduling the next round, so win paths can't drift
   * apart from each other.
   */
  private endRound(winner: Team, reason: string, delaySeconds: number = 4.5) {
    if (this.roundState === 'ROUND_END' || this.roundState === 'MATCH_END') return;

    this.roundState = 'ROUND_END';
    this.lastRoundWinner = winner;
    this.lastRoundReason = reason;

    if (winner === 'CT') this.ctScore++;
    else this.tScore++;

    const loser: Team = winner === 'CT' ? 'T' : 'CT';
    this.awardRoundMoney(winner, loser);

    this.lossStreak[winner] = 0;
    this.lossStreak[loser] = Math.min(4, this.lossStreak[loser] + 1);

    soundEngine.playRadio(reason);

    // Match point reached, or all 15 rounds played out.
    const decided = this.ctScore >= this.roundsToWin || this.tScore >= this.roundsToWin;
    const exhausted = this.roundNumber >= this.maxRounds;

    if (decided || exhausted) {
      this.roundEndTimer = delaySeconds;
      this.pendingMatchEnd = true;
      return;
    }

    this.roundEndTimer = delaySeconds;
    this.pendingMatchEnd = false;
  }

  private concludeMatch() {
    this.roundState = 'MATCH_END';
    if (this.ctScore > this.tScore) this.matchWinner = 'CT';
    else if (this.tScore > this.ctScore) this.matchWinner = 'T';
    else {
      this.matchWinner = null;
      this.isDraw = true;
    }
    this.isShooting = false;
    this.onMatchEnd?.(this.matchWinner);
    this.onStateUpdate?.();
  }

  /**
   * CS-style economy: winners take a flat reward, losers climb a consolation
   * ladder the longer their streak runs, so a losing side can rearm.
   */
  private awardRoundMoney(winner: Team, loser: Team) {
    const LOSS_LADDER = [1400, 1900, 2400, 2900, 3400];
    const MONEY_CAP = 16000;

    const winAmount = 3250;
    const lossAmount = LOSS_LADDER[Math.min(LOSS_LADDER.length - 1, this.lossStreak[loser])];

    const grant = (stats: PlayerStats) => {
      const amount = stats.team === winner ? winAmount : lossAmount;
      stats.money = Math.min(MONEY_CAP, stats.money + amount);
    };

    grant(this.playerStats);
    this.bots.forEach((b) => grant(b.stats));
  }

  /** Swap sides at halftime and reset both economies, as CS does. */
  private performHalftimeSwap() {
    const swapped: Team = this.playerTeam === 'CT' ? 'T' : 'CT';

    const swappedScore = this.ctScore;
    this.ctScore = this.tScore;
    this.tScore = swappedScore;
    this.lossStreak = { CT: 0, T: 0 };

    this.bots.forEach((bot) => {
      bot.setTeam(bot.team === 'CT' ? 'T' : 'CT', this.scene);
      bot.stats.money = 800;
    });

    this.playerStats.money = 800;
    this.playerInventory.primary = null;
    this.playerInventory.secondary = { weaponId: 'usp', clip: 12, reserve: 24 };
    this.playerInventory.hasKevlar = false;
    this.playerInventory.hasHelmet = false;
    this.playerInventory.hasDefuseKit = false;
    this.playerInventory.activeSlot = 2;

    this.playerTeam = swapped;
    this.playerStats.team = swapped;
    this.scene.remove(this.playerRig.root);
    this.playerRig = new CharacterRig(swapped, true);
    this.scene.add(this.playerRig.root);
    this.activeWeapon = WEAPON_REGISTRY.usp;
    this.playerRig.setWeapon(this.activeWeapon.id);

    soundEngine.playRadio('Halftime. Switching sides.');
  }

  /** Restart the whole match from round 1, keeping the current side. */
  public restartMatch() {
    this.ctScore = 0;
    this.tScore = 0;
    this.roundNumber = 1;
    this.matchWinner = null;
    this.isDraw = false;
    this.lastRoundWinner = null;
    this.lastRoundReason = '';
    this.lossStreak = { CT: 0, T: 0 };
    this.pendingMatchEnd = false;
    this.roundEndTimer = 0;
    this.killFeed = [];
    this.hitMarkers = [];
    this.damageIndicators = [];

    this.playerStats.kills = 0;
    this.playerStats.deaths = 0;
    this.playerStats.assists = 0;
    this.playerStats.score = 0;
    this.playerStats.damageDealt = 0;
    this.playerStats.money = 800;

    this.playerInventory.primary = null;
    this.playerInventory.secondary = { weaponId: 'usp', clip: 12, reserve: 24 };
    this.playerInventory.hasKevlar = false;
    this.playerInventory.hasHelmet = false;
    this.playerInventory.hasDefuseKit = false;
    this.playerInventory.activeSlot = 2;
    this.activeWeapon = WEAPON_REGISTRY.usp;

    this.bots.forEach((b) => {
      b.stats.kills = 0;
      b.stats.deaths = 0;
      b.stats.assists = 0;
      b.stats.score = 0;
      b.stats.damageDealt = 0;
      b.stats.money = 800;
    });

    this.startNewRound();
  }

  // --- HIT FEEDBACK ---

  private static readonly HIT_MARKER_MS = 420;
  private static readonly DAMAGE_INDICATOR_MS = 1300;

  private expireHitFeedback() {
    const now = performance.now();
    if (this.hitMarkers.length) {
      this.hitMarkers = this.hitMarkers.filter((m) => now - m.createdAt < GameEngine.HIT_MARKER_MS);
    }
    if (this.damageIndicators.length) {
      this.damageIndicators = this.damageIndicators.filter(
        (d) => now - d.createdAt < GameEngine.DAMAGE_INDICATOR_MS
      );
    }
  }

  private pushHitMarker(damage: number, isHeadshot: boolean, isFatal: boolean) {
    this.hitMarkers.push({
      id: `${performance.now()}_${Math.random()}`,
      damage: Math.round(damage),
      isHeadshot,
      isFatal,
      createdAt: performance.now(),
    });
    if (this.hitMarkers.length > 8) this.hitMarkers.shift();
  }

  /**
   * Damage dealt to the local player by a bot. Mirrors TacticalBot.takeDamage
   * so both sides of a firefight resolve armor identically.
   */
  public applyPlayerDamage(
    damage: number,
    isHeadshot: boolean,
    attackerPos: THREE.Vector3,
    attacker: PlayerStats,
    weaponName: string
  ): boolean {
    if (!this.playerStats.isAlive || this.godMode) return false;
    if (this.roundState === 'ROUND_END' || this.roundState === 'MATCH_END') return false;

    let finalDmg = damage;
    if (this.playerStats.armor > 0) {
      if (isHeadshot && this.playerStats.hasHelmet) {
        finalDmg *= 0.5;
      } else if (!isHeadshot) {
        finalDmg *= 0.66;
      }
      this.playerStats.armor = Math.max(0, this.playerStats.armor - damage * 0.5);
    }

    finalDmg = Math.round(finalDmg);
    this.playerStats.health = Math.max(0, this.playerStats.health - finalDmg);
    attacker.damageDealt += finalDmg;
    this.lastDamageFlash = performance.now();

    // Directional indicator: attacker bearing relative to where the player faces.
    const toAttacker = new THREE.Vector3().subVectors(attackerPos, this.playerPos);
    const worldAngle = Math.atan2(toAttacker.x, toAttacker.z);
    this.damageIndicators.push({
      id: `${performance.now()}_${Math.random()}`,
      angle: worldAngle - this.playerYaw,
      createdAt: performance.now(),
    });
    if (this.damageIndicators.length > 6) this.damageIndicators.shift();

    if (this.playerStats.health <= 0) {
      this.playerStats.isAlive = false;
      this.playerStats.deaths++;
      this.isShooting = false;
      this.isPlantingBomb = false;
      this.isDefusingBomb = false;
      this.playerRig.triggerDeath();

      attacker.kills++;
      attacker.money = Math.min(16000, attacker.money + 300);
      attacker.score += isHeadshot ? 150 : 100;

      this.addKillFeed(attacker.name, attacker.team, this.playerStats.name, this.playerTeam, weaponName, isHeadshot);
      this.checkRoundWinConditions();
      this.onStateUpdate?.();
      return true;
    }

    this.onStateUpdate?.();
    return false;
  }

  // --- SETTINGS ---

  public applySettings(settings: { fov: number; masterVolume: number; sfxVolume: number }) {
    this.camera.fov = settings.fov;
    this.camera.updateProjectionMatrix();
    soundEngine.setMasterVolume(settings.masterVolume * settings.sfxVolume);
  }

  public addKillFeed(
    killerName: string,
    killerTeam: Team,
    victimName: string,
    victimTeam: Team,
    weaponName: string,
    isHeadshot: boolean
  ) {
    const entry: KillFeedEntry = {
      id: Math.random().toString(),
      killerName,
      killerTeam,
      victimName,
      victimTeam,
      weaponName,
      isHeadshot,
      timestamp: Date.now(),
    };
    this.killFeed.unshift(entry);
    if (this.killFeed.length > 6) {
      this.killFeed.pop();
    }
  }

  // --- MASTER UPDATE LOOP ---

  public update(delta: number, input: {
    moveForward: boolean;
    moveBackward: boolean;
    moveLeft: boolean;
    moveRight: boolean;
    jump: boolean;
    crouch: boolean;
    walk: boolean;
  }) {
    // Paused: keep rendering the frozen scene so the menu has a backdrop,
    // but advance no simulation state.
    if (this.isPaused) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    this.expireHitFeedback();

    // 1. Round Timer Countdown
    this.updateTimers(delta);

    // 2. Player Movement Physics (CS 1.6 Acceleration / Friction / Counter-strafing)
    if (this.playerStats.isAlive) {
      this.updatePlayerMovement(delta, input);
    }

    // 3. Update Camera & Over-The-Shoulder Spring Arm
    this.updateCamera(delta);

    // 4. Update Weapon Recoil Recovery & Spread
    this.updateWeaponState(delta);

    // 5. Update Player Rig
    const speedRatio = this.playerVel.length() / 5.2;
    this.playerRig.root.position.copy(this.playerPos);
    this.playerRig.root.rotation.y = this.playerYaw;
    this.playerRig.updateAnimation(
      delta,
      this.movementState,
      speedRatio,
      this.playerPitch,
      0,
      this.isCrouching
    );

    // 6. Update Tactical Bot AI
    this.updateBots(delta);

    // 7. Update Tracers and Particles
    this.updateEffects(delta);

    // 8. Render WebGL Frame
    this.renderer.render(this.scene, this.camera);

    this.onStateUpdate?.();
  }

  private updateTimers(delta: number) {
    // Round-end intermission, driven in-loop so it pauses with the game.
    if (this.roundState === 'ROUND_END') {
      this.roundEndTimer -= delta;
      if (this.roundEndTimer <= 0) {
        if (this.pendingMatchEnd) {
          this.pendingMatchEnd = false;
          this.concludeMatch();
        } else {
          this.roundNumber++;
          if (this.roundNumber === this.halftimeRound) {
            this.performHalftimeSwap();
          }
          this.startNewRound();
        }
      }
      return;
    }

    if (this.roundState === 'MATCH_END') return;

    if (this.roundState === 'FREEZE_TIME') {
      this.roundTimeRemaining -= delta;
      if (this.roundTimeRemaining <= 0) {
        this.roundState = 'IN_PROGRESS';
        this.roundTimeRemaining = 105; // 1:45 round time
        soundEngine.playRadio('Go go go!');
      }
    } else if (this.roundState === 'IN_PROGRESS') {
      this.roundTimeRemaining -= delta;
      if (this.roundTimeRemaining <= 0) {
        // Round Time Over -> CT wins if bomb not planted
        this.endRound('CT', 'Target preserved. Counter-Terrorists Win!');
      }
    } else if (this.roundState === 'BOMB_PLANTED') {
      this.bombTimer -= delta;

      // Accelerating rhythmic beep tempo
      const tempoRatio = Math.max(0.1, this.bombTimer / 45);
      this.bombBeepTimer += delta;
      if (this.bombBeepTimer >= tempoRatio * 1.2) {
        this.bombBeepTimer = 0;
        soundEngine.playBombBeep(tempoRatio, [this.bombPosition.x, this.bombPosition.y, this.bombPosition.z]);
      }

      if (this.bombTimer <= 0) {
        // Detonation!
        soundEngine.playExplosion([this.bombPosition.x, this.bombPosition.y, this.bombPosition.z]);
        this.endRound('T', 'Target successfully detonated. Terrorists Win!', 5.5);
      }
    }

    // Plant / Defuse Progress Bars
    if (this.isPlantingBomb) {
      this.bombPlantProgress += delta;
      soundEngine.playBombPlanting();
      if (this.bombPlantProgress >= 4.5) {
        this.completeBombPlant(this.playerStats.name);
      }
    }
    if (this.isDefusingBomb) {
      this.bombDefuseProgress += delta;
      soundEngine.playBombDefusing();
      const requiredTime = this.playerInventory.hasDefuseKit ? 4.5 : 8.0;
      if (this.bombDefuseProgress >= requiredTime) {
        this.completeBombDefuse(this.playerStats.name);
      }
    }
  }

  private updatePlayerMovement(delta: number, input: {
    moveForward: boolean;
    moveBackward: boolean;
    moveLeft: boolean;
    moveRight: boolean;
    jump: boolean;
    crouch: boolean;
    walk: boolean;
  }) {
    if (this.roundState === 'FREEZE_TIME') {
      this.playerVel.set(0, 0, 0);
      this.movementState = 'IDLE';
      return;
    }

    this.isCrouching = input.crouch;
    this.isWalking = input.walk;

    // Movement Direction based on Player Yaw
    const wishDir = new THREE.Vector3();
    const forward = new THREE.Vector3(Math.sin(this.playerYaw), 0, Math.cos(this.playerYaw));
    const right = new THREE.Vector3(forward.z, 0, -forward.x);

    if (input.moveForward) wishDir.add(forward);
    if (input.moveBackward) wishDir.sub(forward);
    if (input.moveRight) wishDir.add(right);
    if (input.moveLeft) wishDir.sub(right);

    const hasInput = wishDir.lengthSq() > 0.001;
    if (hasInput) wishDir.normalize();

    // Speed caps (CS 1.6 speeds)
    let maxSpeed = 5.2 * this.activeWeapon.moveSpeedRatio; // Base run speed
    if (this.isCrouching) maxSpeed *= 0.35;
    else if (this.isWalking) maxSpeed *= 0.52;

    const sv_accelerate = 7.5;
    const sv_friction = 5.5;

    // Ground Physics vs Air Physics
    if (this.isGrounded) {
      // Apply Friction & Counter-Strafing
      const speed = this.playerVel.length();
      if (speed > 0.001) {
        const drop = speed * sv_friction * delta;
        const newSpeed = Math.max(0, speed - drop);
        this.playerVel.multiplyScalar(newSpeed / speed);
      }

      // Acceleration
      if (hasInput) {
        const currentSpeedInWishDir = this.playerVel.dot(wishDir);
        const addSpeed = maxSpeed - currentSpeedInWishDir;
        if (addSpeed > 0) {
          const accelSpeed = Math.min(addSpeed, sv_accelerate * maxSpeed * delta);
          this.playerVel.addScaledVector(wishDir, accelSpeed);
        }
      }

      // Jump
      if (input.jump) {
        this.playerVel.y = 5.8;
        this.isGrounded = false;
      }
    } else {
      // Air acceleration & gravity
      this.playerVel.y -= 16.0 * delta; // Gravity

      if (hasInput) {
        const airAccel = 12.0;
        const currentSpeedInWishDir = this.playerVel.dot(wishDir);
        const addSpeed = maxSpeed * 0.4 - currentSpeedInWishDir;
        if (addSpeed > 0) {
          const accelSpeed = Math.min(addSpeed, airAccel * maxSpeed * delta);
          this.playerVel.addScaledVector(wishDir, accelSpeed);
        }
      }
    }

    // Apply Velocity to Position with Collision Resolution
    const nextPos = this.playerPos.clone().addScaledVector(this.playerVel, delta);

    // Floor collision
    if (nextPos.y <= 0) {
      nextPos.y = 0;
      this.playerVel.y = 0;
      this.isGrounded = true;
    }

    // Map AABB Box Collisions
    const playerRadius = 0.45;
    const playerHeight = this.isCrouching ? 1.2 : 1.8;
    const playerBox = new THREE.Box3(
      new THREE.Vector3(nextPos.x - playerRadius, nextPos.y, nextPos.z - playerRadius),
      new THREE.Vector3(nextPos.x + playerRadius, nextPos.y + playerHeight, nextPos.z + playerRadius)
    );

    for (const collider of this.mapBuilder.colliders) {
      if (collider.type === 'FLOOR') continue;
      if (playerBox.intersectsBox(collider.box)) {
        // Push out on x and z axes
        const overlapX = Math.min(playerBox.max.x - collider.box.min.x, collider.box.max.x - playerBox.min.x);
        const overlapZ = Math.min(playerBox.max.z - collider.box.min.z, collider.box.max.z - playerBox.min.z);

        if (overlapX < overlapZ) {
          if (nextPos.x < collider.box.getCenter(new THREE.Vector3()).x) {
            nextPos.x -= overlapX;
          } else {
            nextPos.x += overlapX;
          }
          this.playerVel.x = 0;
        } else {
          if (nextPos.z < collider.box.getCenter(new THREE.Vector3()).z) {
            nextPos.z -= overlapZ;
          } else {
            nextPos.z += overlapZ;
          }
          this.playerVel.z = 0;
        }
      }
    }

    this.playerPos.copy(nextPos);

    // Footstep Sound Generation
    if (this.isGrounded && hasInput && !this.isWalking && !this.isCrouching) {
      this.footstepTimer += delta * 12;
      if (this.footstepTimer >= 3.2) {
        this.footstepTimer = 0;
        soundEngine.playFootstep([this.playerPos.x, this.playerPos.y, this.playerPos.z], true);
      }
    }

    // Determine Movement State for Animations
    if (!this.isGrounded) this.movementState = 'JUMPING';
    else if (this.isCrouching) this.movementState = 'CROUCHING';
    else if (this.isWalking && hasInput) this.movementState = 'WALKING';
    else if (hasInput) this.movementState = 'RUNNING';
    else this.movementState = 'IDLE';
  }

  private updateCamera(delta: number) {
    // Smooth shoulder swap transition (interpolate offset from left to right)
    const targetOffset = this.targetShoulderSide * 0.55;
    this.currentShoulderOffset += (targetOffset - this.currentShoulderOffset) * Math.min(1, delta * 12);

    // Eye target position
    const eyeHeight = this.isCrouching ? 1.15 : 1.65;
    const targetLookAt = new THREE.Vector3(this.playerPos.x, this.playerPos.y + eyeHeight, this.playerPos.z);

    // Camera Rotation Matrix from Yaw and Pitch
    const euler = new THREE.Euler(this.playerPitch, this.playerYaw, 0, 'YXZ');
    const rotQuat = new THREE.Quaternion().setFromEuler(euler);

    // Calculate desired third-person camera position
    const forwardVec = new THREE.Vector3(0, 0, -1).applyQuaternion(rotQuat);
    const rightVec = new THREE.Vector3(1, 0, 0).applyQuaternion(rotQuat);

    // Offset camera behind and to shoulder
    const desiredCamPos = targetLookAt.clone()
      .addScaledVector(forwardVec, -this.cameraDistance)
      .addScaledVector(rightVec, this.currentShoulderOffset);

    // Camera Collision Avoidance (Prevent clipping through walls)
    const camRayDir = new THREE.Vector3().subVectors(desiredCamPos, targetLookAt);
    const maxDist = camRayDir.length();
    camRayDir.normalize();

    const raycaster = new THREE.Raycaster(targetLookAt, camRayDir, 0.1, maxDist);
    const envMeshes = this.mapBuilder.colliders.map((c) => c.mesh);
    const hits = raycaster.intersectObjects(envMeshes, false);

    if (hits.length > 0) {
      // Pull camera closer to target to avoid wall clipping
      const safeDist = Math.max(0.4, hits[0].distance - 0.2);
      this.currentCameraPos.copy(targetLookAt).addScaledVector(camRayDir, safeDist);
    } else {
      this.currentCameraPos.copy(desiredCamPos);
    }

    this.camera.position.copy(this.currentCameraPos);
    this.camera.quaternion.copy(rotQuat);
  }

  private updateWeaponState(delta: number) {
    // Reload timer
    if (this.isReloading) {
      this.reloadTimer -= delta;
      if (this.reloadTimer <= 0) {
        this.isReloading = false;
        const activeItem =
          this.playerInventory.activeSlot === 1
            ? this.playerInventory.primary
            : this.playerInventory.activeSlot === 2
            ? this.playerInventory.secondary
            : null;

        if (activeItem) {
          const needed = this.activeWeapon.clipSize - activeItem.clip;
          const transfer = Math.min(needed, activeItem.reserve);
          activeItem.clip += transfer;
          if (!this.unlimitedAmmo) {
            activeItem.reserve -= transfer;
          }
        }
      }
    }

    // Recoil recovery
    this.recoilRecoveryTimer -= delta;
    if (this.recoilRecoveryTimer <= 0 && this.sprayIndex > 0) {
      this.sprayIndex = Math.max(0, this.sprayIndex - delta * this.activeWeapon.recoilRecoveryRate * 6);
    }

    // Dynamic Spread calculation for Crosshair HUD
    let spread = this.activeWeapon.spreadBase;
    if (this.isCrouching) spread = this.activeWeapon.spreadCrouch;
    if (this.playerVel.length() > 0.8) spread += this.activeWeapon.spreadMove;
    if (!this.isGrounded) spread += this.activeWeapon.spreadAir;
    spread += (this.sprayIndex / 10) * 0.015;
    this.currentDynamicSpread = spread;
  }

  private updateBots(delta: number) {
    const charactersForRaycast = [
      { rig: this.playerRig, isAlive: this.playerStats.isAlive, id: this.playerStats.id },
      ...this.bots.map((b) => ({ rig: b.rig, isAlive: b.stats.isAlive, id: b.id })),
    ];

    // Lets a bot's bullet resolve back to whoever owns the rig it struck.
    const damageTargets: BotDamageTarget[] = [
      { rig: this.playerRig, isPlayer: true },
      ...this.bots.map((b) => ({ rig: b.rig, isPlayer: false, bot: b })),
    ];

    this.bots.forEach((bot) => {
      // Find enemies for this bot
      const enemies = [];
      if (this.playerTeam !== bot.team && this.playerStats.isAlive) {
        enemies.push({
          id: this.playerStats.id,
          pos: this.playerPos,
          rig: this.playerRig,
          isAlive: this.playerStats.isAlive,
          stats: this.playerStats,
        });
      }
      this.bots.forEach((other) => {
        if (other.team !== bot.team && other.stats.isAlive) {
          enemies.push({
            id: other.id,
            pos: other.rig.root.position,
            rig: other.rig,
            isAlive: other.stats.isAlive,
            stats: other.stats,
          });
        }
      });

      bot.update(
        delta,
        this.mapBuilder,
        enemies,
        this.ballistics,
        this.mapBuilder.colliders,
        charactersForRaycast,
        this.bombPlanted,
        this.bombPosition,
        damageTargets,
        (damage, isHeadshot, attackerPos, attacker, weaponName) => {
          this.applyPlayerDamage(damage, isHeadshot, attackerPos, attacker, weaponName);
        },
        (killer, victim, isHeadshot, weapon) => {
          this.addKillFeed(killer.name, killer.team, victim.name, victim.team, weapon, isHeadshot);
          this.checkRoundWinConditions();
        },
        () => {
          this.completeBombPlant(bot.name);
        },
        () => {
          this.completeBombDefuse(bot.name);
        }
      );
    });
  }

  private updateEffects(delta: number) {
    const now = performance.now();

    // Tracers cleanup
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const t = this.tracers[i];
      if (now - t.startTime > t.duration) {
        this.scene.remove(t.line);
        t.line.geometry.dispose();
        this.tracers.splice(i, 1);
      }
    }

    // Particles update
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.lifetime += delta;

      if (p.lifetime >= p.maxLife) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        this.particles.splice(i, 1);
      } else {
        const geo = p.mesh.geometry as THREE.BufferGeometry;
        const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;
        const positions = posAttr.array as Float32Array;

        for (let j = 0; j < p.velocity.length; j++) {
          positions[j * 3] += p.velocity[j].x * delta;
          positions[j * 3 + 1] += p.velocity[j].y * delta;
          positions[j * 3 + 2] += p.velocity[j].z * delta;
          p.velocity[j].y -= 9.8 * delta; // Gravity on particles
        }
        posAttr.needsUpdate = true;
      }
    }
  }

  // --- DEBUG TOOLS ---

  public updateDebugRays(debug: ParallaxDebugInfo) {
    if (this.debugCameraRayMesh) {
      this.scene.remove(this.debugCameraRayMesh);
    }
    if (this.debugMuzzleRayMesh) {
      this.scene.remove(this.debugMuzzleRayMesh);
    }

    // Camera Ray (Yellow)
    const camGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...debug.cameraOrigin),
      new THREE.Vector3(...debug.cameraTarget),
    ]);
    this.debugCameraRayMesh = new THREE.Line(
      camGeo,
      new THREE.LineBasicMaterial({ color: 0xffea00, linewidth: 2 })
    );
    this.scene.add(this.debugCameraRayMesh);

    // Muzzle Ray (Cyan)
    const muzzleGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...debug.muzzleOrigin),
      new THREE.Vector3(...debug.actualHitPoint),
    ]);
    this.debugMuzzleRayMesh = new THREE.Line(
      muzzleGeo,
      new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 2 })
    );
    this.scene.add(this.debugMuzzleRayMesh);
  }

  public setHitboxDebug(enabled: boolean) {
    this.debugDrawHitboxes = enabled;
    this.playerRig.setHitboxVisibility(enabled);
    this.bots.forEach((b) => b.rig.setHitboxVisibility(enabled));
  }
}
