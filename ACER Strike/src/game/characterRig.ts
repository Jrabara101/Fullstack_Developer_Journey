import * as THREE from 'three';
import { HitboxZone, MovementState, Team } from '../types/game';

export interface HitboxComponent {
  zone: HitboxZone;
  mesh: THREE.Mesh;
  worldBox: THREE.Box3;
  multiplier: number;
}

export class CharacterRig {
  public root: THREE.Group;
  public team: Team;
  public isPlayer: boolean;

  // Rig Hierarchy
  public pelvisGroup: THREE.Group;
  public upperBodyGroup: THREE.Group; // Upper-body decoupled aim offset
  public headMesh: THREE.Mesh;
  public torsoMesh: THREE.Mesh;
  public leftLeg: THREE.Group;
  public rightLeg: THREE.Group;
  public leftArm: THREE.Group;
  public rightArm: THREE.Group;
  public weaponSocket: THREE.Group;
  public muzzlePoint: THREE.Object3D;
  public activeWeaponMesh: THREE.Group | null = null;

  // Hitbox detection
  public hitboxes: HitboxComponent[] = [];
  public hitboxWireframeGroup: THREE.Group;

  // Animation State
  public walkTime: number = 0;
  public aimPitch: number = 0; // -Math.PI/2 to Math.PI/2
  public aimYaw: number = 0;
  public bodyFacingYaw: number = 0;
  public crouchFraction: number = 0; // 0 = standing, 1 = fully crouched
  public isDead: boolean = false;
  public deathTimer: number = 0;

  constructor(team: Team, isPlayer: boolean = false) {
    this.team = team;
    this.isPlayer = isPlayer;
    this.root = new THREE.Group();

    // Palettes based on team
    const ctColors = {
      suit: 0x223046, // Navy SWAT
      vest: 0x181e29, // Dark ballistic vest
      skin: 0xd4a373,
      helmet: 0x1b2330,
      boots: 0x111317,
      trim: 0x3d5a80,
    };

    const tColors = {
      suit: 0x544738, // Tan/Khaki camo
      vest: 0x2e2924, // Tactical harness
      skin: 0xbc8a5f,
      helmet: 0x362c22, // Balaclava/cap
      boots: 0x1f1a14,
      trim: 0x8a382b,
    };

    const col = team === 'CT' ? ctColors : tColors;

    const suitMat = new THREE.MeshStandardMaterial({ color: col.suit, roughness: 0.8 });
    const vestMat = new THREE.MeshStandardMaterial({ color: col.vest, roughness: 0.6, metalness: 0.2 });
    const skinMat = new THREE.MeshStandardMaterial({ color: col.skin, roughness: 0.7 });
    const helmetMat = new THREE.MeshStandardMaterial({ color: col.helmet, roughness: 0.5, metalness: 0.3 });
    const bootMat = new THREE.MeshStandardMaterial({ color: col.boots, roughness: 0.9 });
    const trimMat = new THREE.MeshStandardMaterial({ color: col.trim, roughness: 0.4 });

    // 1. Pelvis / Lower Body Group
    this.pelvisGroup = new THREE.Group();
    this.pelvisGroup.position.set(0, 0.85, 0);
    this.root.add(this.pelvisGroup);

    // Pelvis mesh
    const pelvisGeo = new THREE.BoxGeometry(0.38, 0.2, 0.26);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, suitMat);
    pelvisMesh.castShadow = true;
    this.pelvisGroup.add(pelvisMesh);

    // Left Leg
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.12, -0.1, 0);
    const thighGeo = new THREE.BoxGeometry(0.16, 0.42, 0.18);
    const leftThigh = new THREE.Mesh(thighGeo, suitMat);
    leftThigh.position.y = -0.21;
    leftThigh.castShadow = true;
    this.leftLeg.add(leftThigh);

    const bootGeo = new THREE.BoxGeometry(0.17, 0.42, 0.24);
    const leftBoot = new THREE.Mesh(bootGeo, bootMat);
    leftBoot.position.set(0, -0.58, 0.02);
    leftBoot.castShadow = true;
    this.leftLeg.add(leftBoot);
    this.pelvisGroup.add(this.leftLeg);

    // Right Leg
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.12, -0.1, 0);
    const rightThigh = new THREE.Mesh(thighGeo, suitMat);
    rightThigh.position.y = -0.21;
    rightThigh.castShadow = true;
    this.rightLeg.add(rightThigh);

    const rightBoot = new THREE.Mesh(bootGeo, bootMat);
    rightBoot.position.set(0, -0.58, 0.02);
    rightBoot.castShadow = true;
    this.rightLeg.add(rightBoot);
    this.pelvisGroup.add(this.rightLeg);

    // 2. Upper Body Group (Decoupled Aim Offset)
    this.upperBodyGroup = new THREE.Group();
    this.upperBodyGroup.position.set(0, 0.1, 0);
    this.pelvisGroup.add(this.upperBodyGroup);

    // Torso / Chest
    const torsoGeo = new THREE.BoxGeometry(0.44, 0.52, 0.28);
    this.torsoMesh = new THREE.Mesh(torsoGeo, suitMat);
    this.torsoMesh.position.set(0, 0.26, 0);
    this.torsoMesh.castShadow = true;
    this.upperBodyGroup.add(this.torsoMesh);

    // Tactical Vest & Pouches
    const vestGeo = new THREE.BoxGeometry(0.46, 0.44, 0.32);
    const vestMesh = new THREE.Mesh(vestGeo, vestMat);
    vestMesh.position.set(0, 0.24, 0);
    vestMesh.castShadow = true;
    this.upperBodyGroup.add(vestMesh);

    // Team arm band / badge
    const badgeGeo = new THREE.BoxGeometry(0.47, 0.08, 0.33);
    const badgeMesh = new THREE.Mesh(badgeGeo, trimMat);
    badgeMesh.position.set(0, 0.36, 0);
    this.upperBodyGroup.add(badgeMesh);

    // Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.58, 0);
    this.upperBodyGroup.add(headGroup);

    const headGeo = new THREE.BoxGeometry(0.24, 0.26, 0.24);
    this.headMesh = new THREE.Mesh(headGeo, skinMat);
    this.headMesh.castShadow = true;
    headGroup.add(this.headMesh);

    // Helmet / Cap / Goggles
    const helmetGeo = new THREE.BoxGeometry(0.27, 0.14, 0.27);
    const helmet = new THREE.Mesh(helmetGeo, helmetMat);
    helmet.position.set(0, 0.08, 0);
    helmet.castShadow = true;
    headGroup.add(helmet);

    if (team === 'CT') {
      const visorGeo = new THREE.BoxGeometry(0.22, 0.06, 0.08);
      const visorMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.9 });
      const visor = new THREE.Mesh(visorGeo, visorMat);
      visor.position.set(0, 0.02, 0.13);
      headGroup.add(visor);
    }

    // Right Arm (Aiming weapon)
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.28, 0.44, 0);
    const armGeo = new THREE.BoxGeometry(0.12, 0.38, 0.12);
    const rUpperArm = new THREE.Mesh(armGeo, suitMat);
    rUpperArm.position.set(0, -0.16, 0);
    rUpperArm.castShadow = true;
    this.rightArm.add(rUpperArm);

    // Hand & Weapon Socket
    this.weaponSocket = new THREE.Group();
    this.weaponSocket.position.set(0.04, -0.32, 0.15);
    this.weaponSocket.rotation.set(0, 0, 0);
    this.rightArm.add(this.weaponSocket);
    this.upperBodyGroup.add(this.rightArm);

    // Left Arm (Foregrip support)
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.28, 0.44, 0);
    const lUpperArm = new THREE.Mesh(armGeo, suitMat);
    lUpperArm.position.set(0, -0.16, 0);
    lUpperArm.castShadow = true;
    this.leftArm.add(lUpperArm);
    this.upperBodyGroup.add(this.leftArm);

    // Muzzle object placeholder
    this.muzzlePoint = new THREE.Object3D();
    this.muzzlePoint.position.set(0, 0, 0.6);
    this.weaponSocket.add(this.muzzlePoint);

    // 3. Setup Hitbox Volumes (Head, Torso, Legs) for Precision Multipliers
    this.hitboxWireframeGroup = new THREE.Group();
    this.hitboxWireframeGroup.visible = false;
    this.root.add(this.hitboxWireframeGroup);

    this.createHitboxes();

    // Default weapon mesh
    this.setWeapon('ak47');
  }

  private createHitboxes() {
    // Head Hitbox (4.0x) - Sphere/Box
    const headBoxGeo = new THREE.BoxGeometry(0.32, 0.32, 0.32);
    const headBoxMat = new THREE.MeshBasicMaterial({ color: 0xff0044, wireframe: true });
    const headHitboxMesh = new THREE.Mesh(headBoxGeo, headBoxMat);
    headHitboxMesh.position.set(0, 1.65, 0);
    this.hitboxWireframeGroup.add(headHitboxMesh);
    this.hitboxes.push({
      zone: 'HEAD',
      mesh: headHitboxMesh,
      worldBox: new THREE.Box3(),
      multiplier: 4.0,
    });

    // Torso Hitbox (1.0x)
    const torsoBoxGeo = new THREE.BoxGeometry(0.52, 0.65, 0.38);
    const torsoBoxMat = new THREE.MeshBasicMaterial({ color: 0x0088ff, wireframe: true });
    const torsoHitboxMesh = new THREE.Mesh(torsoBoxGeo, torsoBoxMat);
    torsoHitboxMesh.position.set(0, 1.1, 0);
    this.hitboxWireframeGroup.add(torsoHitboxMesh);
    this.hitboxes.push({
      zone: 'TORSO',
      mesh: torsoHitboxMesh,
      worldBox: new THREE.Box3(),
      multiplier: 1.0,
    });

    // Legs Hitbox (0.75x)
    const legsBoxGeo = new THREE.BoxGeometry(0.48, 0.75, 0.38);
    const legsBoxMat = new THREE.MeshBasicMaterial({ color: 0x00ff66, wireframe: true });
    const legsHitboxMesh = new THREE.Mesh(legsBoxGeo, legsBoxMat);
    legsHitboxMesh.position.set(0, 0.42, 0);
    this.hitboxWireframeGroup.add(legsHitboxMesh);
    this.hitboxes.push({
      zone: 'LEGS',
      mesh: legsHitboxMesh,
      worldBox: new THREE.Box3(),
      multiplier: 0.75,
    });
  }

  public setWeapon(weaponId: string) {
    if (this.activeWeaponMesh) {
      this.weaponSocket.remove(this.activeWeaponMesh);
      this.activeWeaponMesh = null;
    }

    const gunGroup = new THREE.Group();
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1e2024, roughness: 0.3, metalness: 0.8 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x7c4722, roughness: 0.7 });

    if (weaponId === 'ak47') {
      // AK-47 3D Model Construction
      const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.35), metalMat);
      receiver.position.set(0, 0.02, 0.1);
      gunGroup.add(receiver);

      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 8), metalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.05, 0.42);
      gunGroup.add(barrel);

      const woodStock = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.11, 0.25), woodMat);
      woodStock.position.set(0, -0.02, -0.15);
      gunGroup.add(woodStock);

      const woodHandguard = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.07, 0.2), woodMat);
      woodHandguard.position.set(0, 0.03, 0.32);
      gunGroup.add(woodHandguard);

      // Curved Banana Magazine
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.09), metalMat);
      mag.position.set(0, -0.12, 0.16);
      mag.rotation.x = -0.3;
      gunGroup.add(mag);

      this.muzzlePoint.position.set(0, 0.05, 0.68);
    } else if (weaponId === 'usp' || weaponId === 'deagle') {
      // Pistol Model
      const slide = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.065, 0.22), metalMat);
      slide.position.set(0, 0.04, 0.08);
      gunGroup.add(slide);

      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.07), metalMat);
      grip.position.set(0, -0.06, 0.02);
      grip.rotation.x = 0.2;
      gunGroup.add(grip);

      if (weaponId === 'usp') {
        // Silencer barrel
        const silencer = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8), metalMat);
        silencer.rotation.x = Math.PI / 2;
        silencer.position.set(0, 0.04, 0.28);
        gunGroup.add(silencer);
        this.muzzlePoint.position.set(0, 0.04, 0.38);
      } else {
        this.muzzlePoint.position.set(0, 0.04, 0.2);
      }
    } else if (weaponId === 'knife') {
      // Combat Knife Model
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.14), metalMat);
      handle.position.set(0, 0, 0);
      gunGroup.add(handle);

      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.045, 0.2), metalMat);
      blade.position.set(0, 0.01, 0.16);
      gunGroup.add(blade);

      this.muzzlePoint.position.set(0, 0, 0.26);
    } else if (weaponId === 'c4') {
      // C4 Bomb Model
      const c4Brick = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.09, 0.22), woodMat);
      c4Brick.position.set(0, 0, 0.08);
      gunGroup.add(c4Brick);

      const keypad = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.1), metalMat);
      keypad.position.set(0, 0.05, 0.08);
      gunGroup.add(keypad);

      this.muzzlePoint.position.set(0, 0, 0.2);
    }

    this.activeWeaponMesh = gunGroup;
    this.weaponSocket.add(gunGroup);
  }

  public updateAnimation(
    delta: number,
    movementState: MovementState,
    speedRatio: number,
    aimPitch: number,
    aimYaw: number,
    crouching: boolean
  ) {
    if (this.isDead) {
      this.deathTimer += delta;
      // Smooth dynamic ragdoll death collapse
      if (this.root.rotation.x > -Math.PI / 2) {
        this.root.rotation.x = Math.max(-Math.PI / 2, this.root.rotation.x - delta * 4.5);
      }
      this.root.position.y = Math.max(0.15, this.root.position.y - delta * 3.0);
      return;
    }

    this.aimPitch = aimPitch;
    this.aimYaw = aimYaw;

    // 1. Crouch interpolation (smooth camera and rig height)
    const targetCrouch = crouching ? 1 : 0;
    this.crouchFraction += (targetCrouch - this.crouchFraction) * Math.min(1, delta * 14);

    this.pelvisGroup.position.y = 0.85 - this.crouchFraction * 0.45;

    // 2. Decoupled Upper-Body Aim Offset
    // The spine and arms aim smoothly along the camera vector independently of lower-body running!
    this.upperBodyGroup.rotation.x = this.aimPitch;
    this.upperBodyGroup.rotation.y = 0; // Torso stays aligned with body yaw

    // Arm positioning for rifle grip
    this.rightArm.rotation.set(-0.6 + this.aimPitch * 0.2, 0.25, 0);
    this.leftArm.rotation.set(-0.7 + this.aimPitch * 0.2, -0.45, 0.3);

    // 3. Lower Body Leg Swings (CS walk cycle)
    const isMoving = movementState === 'RUNNING' || movementState === 'WALKING';
    if (isMoving) {
      const stepFreq = movementState === 'WALKING' ? 8 : 14;
      this.walkTime += delta * stepFreq * Math.max(0.2, speedRatio);

      const legSwing = Math.sin(this.walkTime) * (movementState === 'WALKING' ? 0.35 : 0.65);
      this.leftLeg.rotation.x = legSwing;
      this.rightLeg.rotation.x = -legSwing;

      // Subtle hip bobbing
      this.pelvisGroup.position.y += Math.abs(Math.cos(this.walkTime)) * 0.04;
    } else {
      // Return legs to neutral standing
      this.leftLeg.rotation.x *= 0.8;
      this.rightLeg.rotation.x *= 0.8;
    }

    // 4. Update Hitbox world matrices
    this.updateHitboxWorldBounds();
  }

  private updateHitboxWorldBounds() {
    // Update head hitbox position according to crouch & animation
    const headHitbox = this.hitboxes.find((h) => h.zone === 'HEAD');
    const torsoHitbox = this.hitboxes.find((h) => h.zone === 'TORSO');
    const legsHitbox = this.hitboxes.find((h) => h.zone === 'LEGS');

    const yOffset = -this.crouchFraction * 0.45;

    if (headHitbox) {
      headHitbox.mesh.position.y = 1.65 + yOffset;
      headHitbox.mesh.updateMatrixWorld(true);
      headHitbox.worldBox.setFromObject(headHitbox.mesh);
    }
    if (torsoHitbox) {
      torsoHitbox.mesh.position.y = 1.1 + yOffset * 0.7;
      torsoHitbox.mesh.updateMatrixWorld(true);
      torsoHitbox.worldBox.setFromObject(torsoHitbox.mesh);
    }
    if (legsHitbox) {
      legsHitbox.mesh.position.y = 0.42 + yOffset * 0.3;
      legsHitbox.mesh.updateMatrixWorld(true);
      legsHitbox.worldBox.setFromObject(legsHitbox.mesh);
    }
  }

  public getMuzzleWorldPosition(): THREE.Vector3 {
    const muzzleVec = new THREE.Vector3();
    this.muzzlePoint.getWorldPosition(muzzleVec);
    return muzzleVec;
  }

  public setHitboxVisibility(visible: boolean) {
    this.hitboxWireframeGroup.visible = visible;
  }

  public triggerDeath() {
    this.isDead = true;
    this.deathTimer = 0;
  }

  public reset(spawnPos: THREE.Vector3, yaw: number) {
    this.isDead = false;
    this.deathTimer = 0;
    this.crouchFraction = 0;
    this.root.position.copy(spawnPos);
    this.root.rotation.set(0, yaw, 0);
    this.bodyFacingYaw = yaw;
    this.updateHitboxWorldBounds();
  }
}
