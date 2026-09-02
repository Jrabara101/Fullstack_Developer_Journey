import * as THREE from 'three';

export interface MapCollider {
  box: THREE.Box3;
  mesh: THREE.Mesh;
  type: 'WALL' | 'COVER' | 'FLOOR' | 'CRATE';
}

export interface BombSiteZone {
  center: THREE.Vector3;
  radius: number;
  min: THREE.Vector3;
  max: THREE.Vector3;
}

export class MapBuilder {
  public scene: THREE.Scene;
  public colliders: MapCollider[] = [];
  public bombSiteA: BombSiteZone;
  public tSpawns: THREE.Vector3[] = [];
  public ctSpawns: THREE.Vector3[] = [];
  public waypoints: { name: string; pos: THREE.Vector3; tags: string[] }[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.bombSiteA = {
      center: new THREE.Vector3(0, 0, 0),
      radius: 8.5,
      min: new THREE.Vector3(-8, 0, -8),
      max: new THREE.Vector3(8, 5, 8),
    };
  }

  public buildMap(): void {
    // Textures & Procedural Materials
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x2b2f36,
      roughness: 0.85,
      metalness: 0.1,
    });

    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x4a515e,
      roughness: 0.9,
      metalness: 0.05,
    });

    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x1f2329,
      roughness: 0.7,
      metalness: 0.3,
    });

    const crateMat = new THREE.MeshStandardMaterial({
      color: 0x8a6a43,
      roughness: 0.8,
      metalness: 0.05,
    });

    const greenCrateMat = new THREE.MeshStandardMaterial({
      color: 0x3d5440,
      roughness: 0.75,
      metalness: 0.2,
    });

    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x6e7580,
      roughness: 0.95,
      metalness: 0.05,
    });

    const sitePlatformMat = new THREE.MeshStandardMaterial({
      color: 0x3a404a,
      roughness: 0.8,
    });

    // 1. Main Floor
    const floorGeo = new THREE.PlaneGeometry(120, 120);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Floor grid lines for tactical greybox aesthetic
    const gridHelper = new THREE.GridHelper(120, 60, 0x5d6878, 0x343a45);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);

    // 2. Central Bombsite A Zone
    const siteGeo = new THREE.BoxGeometry(16, 0.4, 16);
    const siteMesh = new THREE.Mesh(siteGeo, sitePlatformMat);
    siteMesh.position.set(0, 0.2, 0);
    siteMesh.receiveShadow = true;
    siteMesh.castShadow = true;
    this.scene.add(siteMesh);
    this.addCollider(siteMesh, 'FLOOR');

    // Hazard Stripes & Bomb Site Decal Border
    const borderGeo = new THREE.RingGeometry(6.5, 7.2, 32);
    const borderMat = new THREE.MeshBasicMaterial({
      color: 0xe69500,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const borderMesh = new THREE.Mesh(borderGeo, borderMat);
    borderMesh.rotation.x = -Math.PI / 2;
    borderMesh.position.set(0, 0.41, 0);
    this.scene.add(borderMesh);

    // Giant "A" Decal on site
    const aGeo = new THREE.PlaneGeometry(3.5, 3.5);
    const aCanvas = document.createElement('canvas');
    aCanvas.width = 256;
    aCanvas.height = 256;
    const ctx = aCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ff2222';
      ctx.font = 'bold 200px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('A', 128, 128);
    }
    const aTex = new THREE.CanvasTexture(aCanvas);
    const aMat = new THREE.MeshBasicMaterial({
      map: aTex,
      transparent: true,
      opacity: 0.85,
    });
    const aMesh = new THREE.Mesh(aGeo, aMat);
    aMesh.rotation.x = -Math.PI / 2;
    aMesh.position.set(0, 0.42, 0);
    this.scene.add(aMesh);

    // 3. Perimeter Enclosure Walls (60m x 60m playable arena)
    const wallH = 6;
    this.createWall(0, wallH / 2, -35, 70, wallH, 2, wallMat); // North wall
    this.createWall(0, wallH / 2, 35, 70, wallH, 2, wallMat);  // South wall
    this.createWall(-35, wallH / 2, 0, 2, wallH, 70, wallMat); // West wall
    this.createWall(35, wallH / 2, 0, 2, wallH, 70, wallMat);  // East wall

    // 4. Interior Corridors & Structural Buildings

    // Long A Corridor (East side partition)
    this.createWall(16, wallH / 2, -10, 2, wallH, 30, wallMat);
    this.createWall(16, wallH / 2, 20, 2, wallH, 18, wallMat);
    // Pillar in Long A for cover
    this.createWall(25, wallH / 2, 5, 2.5, wallH, 2.5, concreteMat);
    this.createWall(25, wallH / 2, -18, 2.5, wallH, 2.5, concreteMat);

    // Double Doors Connector Corridor (West side)
    this.createWall(-16, wallH / 2, -12, 2, wallH, 24, wallMat);
    this.createWall(-16, wallH / 2, 18, 2, wallH, 20, wallMat);
    // Double door frames
    this.createWall(-16, wallH / 2, 3.5, 1.8, wallH, 0.6, trimMat);
    this.createWall(-16, wallH / 2, -2.5, 1.8, wallH, 0.6, trimMat);

    // Catwalk / Balcony (North Elevated Platform overlooking Site A)
    const catwalkGeo = new THREE.BoxGeometry(22, 0.6, 6);
    const catwalk = new THREE.Mesh(catwalkGeo, concreteMat);
    catwalk.position.set(0, 3.0, -18);
    catwalk.receiveShadow = true;
    catwalk.castShadow = true;
    this.scene.add(catwalk);
    this.addCollider(catwalk, 'FLOOR');

    // Catwalk railing (cover)
    this.createWall(0, 3.8, -15.2, 20, 1.0, 0.4, trimMat);

    // Stairs / Ramp up to Catwalk
    const rampGeo = new THREE.BoxGeometry(4, 0.5, 9);
    const ramp = new THREE.Mesh(rampGeo, concreteMat);
    ramp.position.set(12, 1.5, -18);
    ramp.rotation.x = Math.PI / 9;
    ramp.receiveShadow = true;
    ramp.castShadow = true;
    this.scene.add(ramp);
    this.addCollider(ramp, 'FLOOR');

    // 5. Tactical Cover & Crate Stacks around Bombsite A

    // Default CS "Triple Box" on site
    this.createCrate(-3.5, 1.0, -2.5, 2.0, 2.0, 2.0, crateMat);
    this.createCrate(-3.5, 1.0, -0.5, 2.0, 2.0, 2.0, crateMat);
    this.createCrate(-3.5, 2.8, -1.5, 1.8, 1.8, 1.8, greenCrateMat);

    // "Ninja" Box in corner of site
    this.createCrate(4.2, 1.1, -4.5, 2.2, 2.2, 2.2, crateMat);
    this.createCrate(4.2, 1.1, -2.3, 2.2, 2.2, 2.2, crateMat);

    // Site entrance barrier (headshot peek height ~1.3m)
    this.createCrate(0, 0.7, 4.8, 4.0, 1.4, 1.2, concreteMat);

    // Long A corner box stack
    this.createCrate(22, 1.0, 18, 2.0, 2.0, 2.0, crateMat);
    this.createCrate(22, 2.8, 18, 1.8, 1.8, 1.8, greenCrateMat);
    this.createCrate(24, 1.0, 18, 2.0, 2.0, 2.0, crateMat);

    // Double Doors approach barriers
    this.createCrate(-24, 0.9, 8, 3.5, 1.8, 1.5, concreteMat);
    this.createCrate(-26, 1.0, -12, 2.2, 2.2, 2.2, greenCrateMat);

    // 6. Spawn Locations
    // CT Spawn (North defense side)
    this.ctSpawns = [
      new THREE.Vector3(0, 0.5, -28),
      new THREE.Vector3(3, 0.5, -28),
      new THREE.Vector3(-3, 0.5, -28),
      new THREE.Vector3(6, 0.5, -30),
      new THREE.Vector3(-6, 0.5, -30),
    ];

    // T Spawn (South attack side)
    this.tSpawns = [
      new THREE.Vector3(0, 0.5, 28),
      new THREE.Vector3(3, 0.5, 28),
      new THREE.Vector3(-3, 0.5, 28),
      new THREE.Vector3(6, 0.5, 30),
      new THREE.Vector3(-6, 0.5, 30),
    ];

    // 7. Navigation Waypoints for Tactical Bot AI
    this.waypoints = [
      { name: 'T_SPAWN', pos: new THREE.Vector3(0, 0, 28), tags: ['SPAWN_T'] },
      { name: 'T_RAMP_LONG', pos: new THREE.Vector3(22, 0, 24), tags: ['ROUTE_LONG'] },
      { name: 'T_RAMP_SHORT', pos: new THREE.Vector3(-22, 0, 24), tags: ['ROUTE_SHORT'] },
      { name: 'LONG_A_CHOKE', pos: new THREE.Vector3(25, 0, 5), tags: ['LONG_A', 'COVER'] },
      { name: 'LONG_A_CORNER', pos: new THREE.Vector3(20, 0, -8), tags: ['LONG_A', 'PEEK'] },
      { name: 'DOUBLE_DOORS_ENTRY', pos: new THREE.Vector3(-20, 0, 4), tags: ['SHORT_A'] },
      { name: 'DOUBLE_DOORS_EXIT', pos: new THREE.Vector3(-8, 0, 0), tags: ['SHORT_A', 'PEEK'] },
      { name: 'SITE_A_DEFAULT', pos: new THREE.Vector3(0, 0.4, 0), tags: ['SITE_A', 'PLANT'] },
      { name: 'SITE_A_TRIPLE', pos: new THREE.Vector3(-3.5, 0.4, -2.5), tags: ['SITE_A', 'COVER'] },
      { name: 'SITE_A_NINJA', pos: new THREE.Vector3(4.2, 0.4, -4.5), tags: ['SITE_A', 'COVER'] },
      { name: 'CATWALK_OVERLOOK', pos: new THREE.Vector3(0, 3.2, -17), tags: ['CATWALK', 'HIGH_GROUND'] },
      { name: 'CT_SPAWN', pos: new THREE.Vector3(0, 0, -28), tags: ['SPAWN_CT'] },
      { name: 'CT_LONG_DEFENSE', pos: new THREE.Vector3(12, 0, -14), tags: ['DEFEND_LONG'] },
      { name: 'CT_SHORT_DEFENSE', pos: new THREE.Vector3(-10, 0, -14), tags: ['DEFEND_SHORT'] },
    ];

    // 8. Visual Lighting & Ambience
    const hemiLight = new THREE.HemisphereLight(0xdde8f5, 0x242830, 0.7);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff3db, 1.2);
    dirLight.position.set(30, 45, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 120;
    dirLight.shadow.camera.left = -40;
    dirLight.shadow.camera.right = 40;
    dirLight.shadow.camera.top = 40;
    dirLight.shadow.camera.bottom = -40;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);

    // Tactical site beacon light (subtle amber glow on site)
    const siteBeacon = new THREE.PointLight(0xffaa22, 0.8, 15);
    siteBeacon.position.set(0, 4, 0);
    this.scene.add(siteBeacon);
  }

  private createWall(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    mat: THREE.Material
  ): THREE.Mesh {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    this.scene.add(mesh);
    this.addCollider(mesh, 'WALL');
    return mesh;
  }

  private createCrate(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    mat: THREE.Material
  ): THREE.Mesh {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    this.scene.add(mesh);
    this.addCollider(mesh, 'CRATE');
    return mesh;
  }

  private addCollider(mesh: THREE.Mesh, type: 'WALL' | 'COVER' | 'FLOOR' | 'CRATE') {
    mesh.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(mesh);
    this.colliders.push({ box, mesh, type });
  }

  public isInsideBombSite(pos: THREE.Vector3): boolean {
    const distSq = pos.x * pos.x + pos.z * pos.z;
    return distSq <= this.bombSiteA.radius * this.bombSiteA.radius && pos.y < 3.0;
  }
}
