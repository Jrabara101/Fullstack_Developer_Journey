import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Cleaning previous records ---');
  await prisma.feedbackPin.deleteMany({});
  await prisma.playtestSession.deleteMany({});
  await prisma.devLogEntry.deleteMany({});
  await prisma.mechanicBreakdown.deleteMany({});
  await prisma.trailerChapter.deleteMany({});
  await prisma.project.deleteMany({});

  console.log('--- Seeding Projects ---');

  // 1. CHRONOSHIFT: PROTOCOL 8
  const chronoshift = await prisma.project.create({
    data: {
      slug: 'chronoshift-protocol-8',
      title: 'ChronoShift: Protocol 8',
      tagline: 'High-octane time-dilation kinetic action roguelike with sub-tick physics & state machine prediction.',
      releaseStatus: 'Shipped',
      engine: 'Godot',
      role: 'Lead Gameplay & Systems Architect',
      teamSize: 3,
      developmentDuration: '18 Months',
      heroTrailerUrl: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-flying-cars-and-skyscrapers-41551-large.mp4',
      playableDemoUrl: '/demo/chronoshift',
      externalLinksJson: JSON.stringify({
        steam: 'https://store.steampowered.com/app/chronoshift',
        itch: 'https://gamedev.itch.io/chronoshift',
        github: 'https://github.com/lead-dev/chronoshift-core-systems',
        pressKit: '/api/projects/chronoshift-protocol-8/presskit',
      }),
      pressKitJson: JSON.stringify({
        developerBio: 'Alex Vance — Senior Systems & Combat Engineer with 8+ years crafting responsive action feel and custom engine tools.',
        factSheet: {
          releaseDate: 'October 2025',
          platforms: ['PC (Steam)', 'SteamDeck Verified', 'Web Slice'],
          regularPrice: '$14.99 USD',
          website: 'https://chronoshift-game.com',
        },
        awardsAndHonors: [
          '🏆 Winner: Best Game Feel — Indie Game Cup 2025',
          '⭐ IGF 2025 Honorable Mention: Excellence in Design',
          '🔥 Steam Next Fest Trending Top 50 Demo',
        ],
        selectedArticles: [
          {
            quote: 'A masterclass in kinetic friction and hit-stop weight. Every dash feels surgically precise.',
            publication: 'PC Gamer Hardware & Mechanics',
          },
          {
            quote: 'The rollback state machine handles 60fps micro-dashes without a single dropped input frame.',
            publication: 'Game Developer Magazine',
          },
        ],
        assets: [
          { label: 'Key Art 4K', category: 'Key Art', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format', resolution: '3840x2160', fileSize: '14.2 MB' },
          { label: 'Logo Transparent PNG', category: 'Logos', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format', resolution: '2048x1024', fileSize: '2.1 MB' },
          { label: 'Combat Action Screenshot', category: 'Screenshots', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format', resolution: '2560x1440', fileSize: '6.4 MB' },
        ],
      }),
      featuredOrder: 1,
      chapters: {
        create: [
          { title: '0:00 Core Kinetic Loop & Micro-Dashes', timestampSec: 0, description: 'Sub-pixel kinematic acceleration, custom friction curves, and directional air-dashing with ghost trails.', orderIndex: 0 },
          { title: '0:18 Boss Encounter: Aegis Overseer', timestampSec: 18, description: 'Hierarchical Finite State Machine handling dynamic telegraphing, telegraph beam raymarching, and phase transitions.', orderIndex: 1 },
          { title: '0:35 Time-Dilation Shader Pipeline', timestampSec: 35, description: 'Screen-space chromatic aberration, radial blur, and global timescale matrix manipulation on hit-confirm.', orderIndex: 2 },
          { title: '0:52 Particle Pooling & Vector Fields', timestampSec: 52, description: 'Zero-allocation particle emitter caching sustaining 10,000 active sparks at 144 FPS locked.', orderIndex: 3 },
        ],
      },
      mechanics: {
        create: [
          {
            title: 'Kinetic Movement & Coyote Jump Buffer',
            summary: 'A responsive character controller integrating 150ms coyote time, jump intent buffering, variable jump height cutoff, and squash-and-stretch procedural bone squash.',
            discipline: 'Gameplay Systems',
            greyboxMediaUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format',
            polishedMediaUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format',
            interactiveParamsJson: JSON.stringify([
              { key: 'coyoteTimeMs', label: 'Coyote Time Window', defaultValue: 150, impactDescription: 'Allows jumping up to 150ms after walking off platform edges.' },
              { key: 'jumpBufferMs', label: 'Jump Input Buffer', defaultValue: 120, impactDescription: 'Queues jump command if pressed right before touching ground.' },
              { key: 'hitStopMs', label: 'Hit-Stop Freeze Frame', defaultValue: 80, impactDescription: 'Freezes character and target for 80ms on impactful hit for visceral weight.' },
              { key: 'screenShakeIntensity', label: 'Trauma Screen Shake', defaultValue: 75, impactDescription: 'Non-linear polynomial screen trauma shake with high-frequency rotational decay.' },
              { key: 'squashStretch', label: 'Squash & Stretch Mesh Juice', defaultValue: true, impactDescription: 'Procedurally deforms sprite/capsule scale along velocity vector.' },
              { key: 'raycastDebug', label: 'Draw Ground Raycast Vectors', defaultValue: true, impactDescription: 'Renders downward surface normal and slope alignment probes.' },
            ]),
            codeSnippetJson: JSON.stringify({
              language: 'csharp',
              code: `// Sub-pixel Kinematic Move & Coyote Buffer in Godot 4 C#
public override void _PhysicsProcess(double delta) {
    bool isGrounded = IsOnFloor();
    if (isGrounded) {
        _coyoteTimer = CoyoteTimeThreshold; // 0.15s grace window
    } else {
        _coyoteTimer -= (float)delta;
    }

    if (Input.IsActionJustPressed("jump")) {
        _jumpBufferTimer = JumpBufferThreshold; // 0.12s intent buffer
    } else {
        _jumpBufferTimer -= (float)delta;
    }

    if (_jumpBufferTimer > 0f && _coyoteTimer > 0f) {
        ExecuteJump();
        _jumpBufferTimer = 0f;
        _coyoteTimer = 0f;
    }
}`,
              explanation: 'Decoupling raw input polling from ground state checks completely eliminates the "eaten jump" frustration common in precision platformers.'
            }),
            telemetryStatsJson: JSON.stringify({
              frameBudgetMs: 1.45,
              drawCalls: 18,
              memoryFootprintMb: 4.2,
            }),
            orderIndex: 0,
          },
          {
            title: 'Time-Dilation & Hit-Stop Shockwave',
            summary: 'Engine-wide temporal dilation system using a localized timescale stack. Prevents audio desync while freezing animation ticks and driving full-screen lens distortion.',
            discipline: 'Technical Art',
            greyboxMediaUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format',
            polishedMediaUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format',
            interactiveParamsJson: JSON.stringify([
              { key: 'hitStopMs', label: 'Hit-Stop Freeze', defaultValue: 90, impactDescription: 'Global freeze frame upon critical strike.' },
              { key: 'screenShakeIntensity', label: 'Impulse Shake Decay', defaultValue: 80, impactDescription: 'Rotational camera trauma.' },
              { key: 'particlePooling', label: 'Recycle Spark Pool', defaultValue: true, impactDescription: 'Pre-allocates 2,048 sparks to avoid garbage collection spikes.' },
            ]),
            codeSnippetJson: JSON.stringify({
              language: 'csharp',
              code: `public void TriggerHitStop(float durationMs, float traumaAmount) {
    if (_activeFreezeCoroutine != null) StopCoroutine(_activeFreezeCoroutine);
    _activeFreezeCoroutine = StartCoroutine(HitStopRoutine(durationMs / 1000f));
    CameraRig.Instance.AddTrauma(traumaAmount);
}

private IEnumerator HitStopRoutine(float duration) {
    Engine.TimeScale = 0.05f; // Near instant freeze
    yield return new WaitForSecondsRealtime(duration);
    Engine.TimeScale = 1.0f;
}`,
              explanation: 'Using unscaled real-time delta ensures smooth timer counting during near-zero engine timescale values.'
            }),
            telemetryStatsJson: JSON.stringify({
              frameBudgetMs: 0.82,
              drawCalls: 8,
              memoryFootprintMb: 2.1,
            }),
            orderIndex: 1,
          },
        ],
      },
      devLogs: {
        create: [
          {
            slug: 'v05-physics-rewrite-tunneling',
            versionTag: 'v0.5 - Physics Engine Rewrite',
            title: 'Eliminating Sub-Pixel Collision Tunneling in High-Speed Kinematics',
            publishedAt: new Date('2025-08-14T10:00:00Z'),
            readingTimeMinutes: 7,
            tagsJson: JSON.stringify(['Gameplay Systems', 'Technical Art']),
            summary: 'How migrating from discrete collision sweeps to Continuous Collision Detection (CCD) with swept AABB boxes stopped our 1,400 px/sec air-dash from clipping through 8px thin steel platforms.',
            contentMarkdown: `### The Problem: High-Speed Wall Tunneling
During our internal playtest of ChronoShift build v0.4, players discovering the double-dash cancel technique reached instantaneous horizontal velocities exceeding **1,450 px/second**. At a fixed physics tick rate of 60Hz, the character moved up to **24.1 pixels per single physics sub-step**.

Because our platform tiles were standard 16x16 geometry with 8px thin collision dividers, the player would occasionally start a frame at \`x = 100\` (in front of the wall) and land at \`x = 124.1\` (inside or past the wall), bypassing the overlap query completely.

\`\`\`
Discrete Step (v0.4):
[Frame N: pos=100] ---- (24px leap) ----> [Frame N+1: pos=124] 
                               ^
                          [Wall at 112: SKIPPED!]
\`\`\`

### The Solution: Swept AABB & Speculative Contacts
Instead of testing instantaneous point intersections at \`t + dt\`, we integrated a continuous swept AABB bounding volume calculation:

1. Calculate the Minkowski difference between the moving player bounding box and static obstacle colliders.
2. Solve the linear entry and exit time fractions $t_{entry}, t_{exit} \\in [0, 1]$.
3. Clamp motion at $t_{entry} - \\epsilon$ and project the remaining velocity vector along the contact plane normal via standard dot-product deflection.

\`\`\`csharp
public static bool SweptAABB(Rect2 b1, Vector2 vel, Rect2 b2, out Vector2 normal, out float hitTime) {
    // Minkowski collision distance solver
    Vector2 invEntry, invExit;
    // Calculate entry / exit points along both X & Y axes...
    // Returns normalized hit fraction along movement trajectory
}
\`\`\`

### Benchmark Results
Below is the telemetry captured before and after the Continuous Collision rewrite:`,
            benchmarksJson: JSON.stringify([
              { metric: 'Collision Tunneling Incidents / 10k dashes', before: '142 glitches', after: '0 glitches', improvementPercent: 100 },
              { metric: 'Physics Sub-step Processing Time', before: '3.82 ms', after: '1.45 ms', improvementPercent: 62 },
              { metric: 'Peak Memory Allocation per Step', before: '48.2 KB (GC Pressure)', after: '0 KB (Zero-Alloc)', improvementPercent: 100 },
            ]),
            interactiveWidgetType: 'collision-tunneling',
          },
          {
            slug: 'v08-hierarchical-fsm-boss-ai',
            versionTag: 'v0.8 - Deterministic Boss State Machine',
            title: 'Hierarchical State Machines & Telegraph Teardown for Boss Encounters',
            publishedAt: new Date('2025-09-22T14:30:00Z'),
            readingTimeMinutes: 5,
            tagsJson: JSON.stringify(['AI & Pathfinding', 'Gameplay Systems']),
            summary: 'Architecting an event-driven Hierarchical Finite State Machine (HFSM) with interruptible telegraph windows, dynamic distance weighting, and zero-allocation node recycling.',
            contentMarkdown: `### Designing Boss AI for Fair Combat
When fighting the Aegis Overseer, players must be able to read visual and auditory cues before taking 60 damage. In traditional monolithic state machines, transition logic gets tangled with animation callbacks and spatial queries.

We decoupled the AI into three clear tiers:
1. **Strategic Brain (Root)**: Evaluates player distance, recent damage output, and phase transitions.
2. **Behavior Sub-States**: \`Patrol\`, \`TargetAcquisition\`, \`TelegraphCharge\`, \`ActiveAttack\`, \`Recovery\`.
3. **Execution Context**: Holds blackboard values (target coordinates, cooldown counters, raycast hits).

### Interruptible Telegraph Architecture
By passing a cancellation token to attack states, if the player successfully triggers a parry or stagger threshold during the telegraph phase, the boss immediately enters \`StunnedRecovery\` with zero state corruption.`,
            benchmarksJson: JSON.stringify([
              { metric: 'State Transition Latency', before: '4.2 ms', after: '0.08 ms', improvementPercent: 98 },
              { metric: 'AI Tick Overhead on 12 Mini-Bosses', before: '8.4 ms', after: '1.9 ms', improvementPercent: 77 },
            ]),
            interactiveWidgetType: 'spring-camera',
          },
        ],
      },
      telemetrySessions: {
        create: [
          { durationSeconds: 342, averageFps: 59.8, hardwareRenderer: 'NVIDIA RTX 4070 Direct3D 12' },
          { durationSeconds: 512, averageFps: 60.0, hardwareRenderer: 'Apple M3 Pro Metal' },
          { durationSeconds: 210, averageFps: 58.4, hardwareRenderer: 'AMD Radeon RX 6700 XT Vulkan' },
          { durationSeconds: 678, averageFps: 59.9, hardwareRenderer: 'Intel Iris Xe Graphics WebGL 2.0' },
        ],
      },
      feedbackPins: {
        create: [
          { targetType: 'trailer', timestampSec: 18.5, authorName: 'GameFeelGuru', feedbackText: 'The boss wind-up telegraph flash at 0:18 is super clear! Maybe boost the audio low-end hum right before the strike.', rating: 5 },
          { targetType: 'trailer', timestampSec: 36.0, authorName: 'TechArtLead_Lucas', feedbackText: 'That radial chromatic aberration during hitstop looks incredible. Is it a full-screen quad or computed in a post-process pass?', rating: 5 },
          { targetType: 'devlog', devlogSectionId: 'benchmarks', authorName: 'IndieDevSam', feedbackText: 'Going from 48KB GC alloc down to 0KB per sub-step is such an inspiring optimization. Great writeup on Swept AABB!', rating: 5 },
        ],
      },
    },
  });

  // 2. NEON RONIN: ZERO
  await prisma.project.create({
    data: {
      slug: 'neon-ronin-zero',
      title: 'Neon Ronin: Zero',
      tagline: 'Frame-perfect cyberpunk hack-and-slash featuring deterministic parry windows and custom GPU blade trails.',
      releaseStatus: 'Vertical Slice',
      engine: 'Unity',
      role: 'Technical Combat & Animation Engineer',
      teamSize: 2,
      developmentDuration: '10 Months',
      heroTrailerUrl: 'https://assets.mixkit.co/videos/preview/mixkit-animation-of-futuristic-devices-99786-large.mp4',
      playableDemoUrl: '/demo/neon-ronin',
      externalLinksJson: JSON.stringify({
        itch: 'https://gamedev.itch.io/neon-ronin',
        github: 'https://github.com/lead-dev/neon-ronin-combat-math',
        pressKit: '/api/projects/neon-ronin-zero/presskit',
      }),
      pressKitJson: JSON.stringify({
        developerBio: 'Alex Vance — Specializing in deterministic combat animation, input queuing, and shader art.',
        factSheet: {
          releaseDate: 'Q1 2026 (Demo Available)',
          platforms: ['PC (Steam)', 'PlayStation 5', 'Nintendo Switch 2'],
          regularPrice: '$19.99 USD',
          website: 'https://neonronin.dev',
        },
        awardsAndHonors: ['🏆 Best Technical Innovation — Cyberpunk Jam 2024'],
        selectedArticles: [{ quote: 'Deflecting a storm of sniper rounds with your katana feels like pure digital poetry.', publication: 'GamerFocus' }],
        assets: [
          { label: 'Key Art Blade Arc', category: 'Key Art', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format', resolution: '3840x2160', fileSize: '11.8 MB' },
          { label: 'Parry Spark VFX', category: 'Screenshots', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format', resolution: '2560x1440', fileSize: '5.2 MB' },
        ],
      }),
      featuredOrder: 2,
      chapters: {
        create: [
          { title: '0:00 Katana Parry Cadence & Sparks', timestampSec: 0, description: '4-frame parry window with procedural spark scattering and camera snap.', orderIndex: 0 },
          { title: '0:22 Boss Stagger & Kinetic Finisher', timestampSec: 22, description: 'Posture depletion bar triggering slow-motion cinematic blade slice.', orderIndex: 1 },
          { title: '0:45 Compute Shader Ribbon Trails', timestampSec: 45, description: 'GPU instanced triangle strips with emissive bloom and distortion.', orderIndex: 2 },
        ],
      },
      mechanics: {
        create: [
          {
            title: 'Deterministic Frame-Perfect Parry Matrix',
            summary: 'A sub-tick combat resolution system that measures input reception relative to enemy hit frames with visual spark scattering and time dilation feedback.',
            discipline: 'Gameplay Systems',
            greyboxMediaUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format',
            polishedMediaUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format',
            interactiveParamsJson: JSON.stringify([
              { key: 'coyoteTimeMs', label: 'Parry Window (Frames)', defaultValue: 4, impactDescription: 'Grants 4 active frames (66ms) to parry incoming enemy slashes.' },
              { key: 'hitStopMs', label: 'Parry Freeze Frame', defaultValue: 120, impactDescription: 'Dramatically freezes the encounter when a perfect parry connects.' },
              { key: 'screenShakeIntensity', label: 'Sparks & Impact Shock', defaultValue: 90, impactDescription: 'Triggers radial shockwave and camera trauma impulse.' },
              { key: 'raycastDebug', label: 'Show Weapon Arc Hurtboxes', defaultValue: true, impactDescription: 'Overlays wireframe weapon hit arcs and hurtbox capsules.' },
            ]),
            codeSnippetJson: JSON.stringify({
              language: 'csharp',
              code: `public bool EvaluateParry(AttackHitbox incomingHit, int currentTick) {
    int deltaTicks = incomingHit.AnticipatedContactTick - currentTick;
    if (deltaTicks >= -1 && deltaTicks <= ParryToleranceTicks) {
        TriggerPerfectParry(incomingHit.SourceActor);
        return true;
    }
    return false;
}`,
              explanation: 'Tick-indexed parry validation guarantees consistent behavior across fluctuating monitor refresh rates (60Hz, 144Hz, 240Hz).'
            }),
            telemetryStatsJson: JSON.stringify({
              frameBudgetMs: 0.95,
              drawCalls: 12,
              memoryFootprintMb: 3.8,
            }),
            orderIndex: 0,
          },
        ],
      },
      devLogs: {
        create: [
          {
            slug: 'v03-microsecond-animation-events',
            versionTag: 'v0.3 - Combat Animation Dispatcher',
            title: 'Microsecond Animation Event Dispatching & Hitbox Polling in Unity',
            publishedAt: new Date('2025-07-02T16:00:00Z'),
            readingTimeMinutes: 6,
            tagsJson: JSON.stringify(['Gameplay Systems', 'Technical Art']),
            summary: 'Replacing Mecanim animation event strings with baked byte-encoded timeline curves for zero garbage collection and frame-accurate combat dispatch.',
            contentMarkdown: `### The Inherent Flaw with Standard Animation Events
In Unity, default \`AnimationEvent\` callbacks use reflection with string method names. This introduces 0.2ms reflection lookup overhead per swing and causes memory allocations.

### The Solution: Baked Bitmask Curves
We baked our combat phases (\`Windup\`, \`ActiveHit\`, \`Recovery\`, \`CancelableWindow\`) into single float curves sampled via custom jobified playable graphs.`,
            benchmarksJson: JSON.stringify([
              { metric: 'Combat Event Dispatch Latency', before: '0.24 ms', after: '0.003 ms', improvementPercent: 98 },
              { metric: 'GC Allocations on 100 Combo Hits', before: '32.4 KB', after: '0 Bytes', improvementPercent: 100 },
            ]),
          },
        ],
      },
      telemetrySessions: {
        create: [
          { durationSeconds: 280, averageFps: 60.0, hardwareRenderer: 'NVIDIA RTX 3080' },
          { durationSeconds: 420, averageFps: 59.9, hardwareRenderer: 'Apple M2 Metal' },
        ],
      },
    },
  });

  // 3. AETHERIAL: SKYBORNE DOMINION
  await prisma.project.create({
    data: {
      slug: 'aetherial-skyborne-dominion',
      title: 'Aetherial: Skyborne Dominion',
      tagline: 'Atmospheric flight combat sandbox featuring GPU-accelerated cloud volumetric raymarching & aerodynamic drag simulation.',
      releaseStatus: 'In Development',
      engine: 'WebGL / TypeScript',
      role: 'Solo Engine & Graphics Developer',
      teamSize: 1,
      developmentDuration: '14 Months',
      heroTrailerUrl: 'https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4',
      playableDemoUrl: '/demo/aetherial',
      externalLinksJson: JSON.stringify({
        github: 'https://github.com/lead-dev/aetherial-webgl-raymarcher',
        pressKit: '/api/projects/aetherial-skyborne-dominion/presskit',
      }),
      pressKitJson: JSON.stringify({
        developerBio: 'Alex Vance — Interactive graphics engineer pushing browser-native WebGL and WebGPU frontiers.',
        factSheet: {
          releaseDate: 'Late 2026',
          platforms: ['Browser (WebGL2 / WebGPU)', 'PC'],
          regularPrice: 'Free Interactive Alpha',
          website: 'https://aetherial.graphics',
        },
        awardsAndHonors: ['⭐ Featured on Chrome Experiments & Three.js Showcase'],
        selectedArticles: [{ quote: 'Running volumetric clouds with Beer-Lambert light scattering at 60 FPS in a web browser is jaw-dropping.', publication: 'Creative Tech Weekly' }],
        assets: [
          { label: 'Volumetric Cloud Vista', category: 'Screenshots', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format', resolution: '3840x2160', fileSize: '8.4 MB' },
        ],
      }),
      featuredOrder: 3,
      chapters: {
        create: [
          { title: '0:00 Aerodynamic Lift & Induced Drag', timestampSec: 0, description: 'Non-linear angle of attack calculation and wingtip vortex generation.', orderIndex: 0 },
          { title: '0:28 Volumetric Cloud Penetration', timestampSec: 28, description: 'Raymarching 3D Worley noise textures with powder sugar light attenuation.', orderIndex: 1 },
          { title: '0:50 Target Tracking & Guidance Math', timestampSec: 50, description: 'Proportional navigation missile intercept guidance in 3D vector space.', orderIndex: 2 },
        ],
      },
      mechanics: {
        create: [
          {
            title: 'Volumetric Cloud Raymarcher with Beer-Lambert Scattering',
            summary: 'A real-time WebGL2 volumetric atmosphere shader combining 3D Perlin-Worley noise sampling, directional phase functions (Henyey-Greenstein), and adaptive step sizing.',
            discipline: 'Technical Art',
            greyboxMediaUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format',
            polishedMediaUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format',
            interactiveParamsJson: JSON.stringify([
              { key: 'particlePooling', label: 'Cloud Density Multiplier', defaultValue: true, impactDescription: 'Controls optical depth and shadow penetration through cloud volumes.' },
              { key: 'raycastDebug', label: 'Visualize Light Marching Steps', defaultValue: false, impactDescription: 'Overlays secondary shadow ray vectors towards the sun.' },
            ]),
            codeSnippetJson: JSON.stringify({
              language: 'glsl',
              code: `// Beer-Lambert law with Henyey-Greenstein phase function
float PhaseHenyeyGreenstein(float cosTheta, float g) {
    float g2 = g * g;
    return (1.0 - g2) / (4.0 * PI * pow(1.0 + g2 - 2.0 * g * cosTheta, 1.5));
}

vec3 SampleCloudLight(vec3 rayPos, vec3 sunDir, float density) {
    float sunRayDensity = MarchLightRay(rayPos, sunDir);
    float transmittance = exp(-sunRayDensity * ABSORPTION_COEFF);
    return sunColor * transmittance * PhaseHenyeyGreenstein(dot(rayDir, sunDir), 0.6);
}`,
              explanation: 'Combines multiple forward-scattering approximations with dual cone steps for realistic silver-lining cloud edges.'
            }),
            telemetryStatsJson: JSON.stringify({
              frameBudgetMs: 4.8,
              drawCalls: 4,
              memoryFootprintMb: 64.0,
            }),
            orderIndex: 0,
          },
        ],
      },
      devLogs: {
        create: [
          {
            slug: 'v02-custom-webgl-raymarcher-60fps',
            versionTag: 'v0.2 - Volumetric Performance Pass',
            title: 'Writing a Custom WebGL Cloud Raymarcher: From 18 to 60 FPS on Laptops',
            publishedAt: new Date('2025-06-19T09:15:00Z'),
            readingTimeMinutes: 8,
            tagsJson: JSON.stringify(['Technical Art', 'Gameplay Systems']),
            summary: 'How temporal reprojection, checkerboard raymarching, and half-resolution bilateral upsampling unlocked 60 FPS volumetric rendering in browser tabs.',
            contentMarkdown: `### The Challenge of Real-Time Raymarching in WebGL
Full-resolution 1080p raymarching requires 128 primary steps plus 6 secondary shadow steps per pixel. At $1920 \\times 1080$, that is over **1.6 billion texture samples per second**, dropping integrated GPUs to an unplayable 18 FPS.

### The 3 Optimization Pillars:
1. **Half-Resolution Render Target**: Raymarch to an offscreen $960 \\times 540$ texture.
2. **Temporal Reprojection**: Jitter ray origins with a $2 \\times 2$ Bayer matrix and blend with previous frame depth reprojection.
3. **Depth-Aware Bilateral Upsample**: Prevent cloud edges from bleeding over cockpit geometry.`,
            benchmarksJson: JSON.stringify([
              { metric: 'Frame Rendering Time (1080p)', before: '55.6 ms (18 FPS)', after: '16.1 ms (62 FPS)', improvementPercent: 71 },
              { metric: 'Ray Steps per Pixel', before: '134 steps', after: '32 adaptive steps', improvementPercent: 76 },
            ]),
          },
        ],
      },
      telemetrySessions: {
        create: [
          { durationSeconds: 410, averageFps: 61.2, hardwareRenderer: 'NVIDIA RTX 4080' },
          { durationSeconds: 195, averageFps: 58.7, hardwareRenderer: 'Apple M1 Metal' },
        ],
      },
    },
  });

  // 4. VOXEL ABYSS: DEEP EXTRACTION
  await prisma.project.create({
    data: {
      slug: 'voxel-abyss-deep-extraction',
      title: 'Voxel Abyss: Deep Extraction',
      tagline: 'Subterranean extraction horror with real-time procedural voxel destruction and fluid pressure simulation.',
      releaseStatus: 'Game Jam Winner',
      engine: 'Unreal',
      role: 'Technical Art & Optimization Lead',
      teamSize: 4,
      developmentDuration: '4 Months',
      heroTrailerUrl: 'https://assets.mixkit.co/videos/preview/mixkit-underground-tunnel-with-red-lights-42998-large.mp4',
      externalLinksJson: JSON.stringify({
        itch: 'https://gamedev.itch.io/voxel-abyss',
        github: 'https://github.com/lead-dev/voxel-dual-contouring',
      }),
      pressKitJson: JSON.stringify({
        developerBio: 'Alex Vance — Technical Lead on high-throughput voxel geometry and fluid compute pipelines.',
        factSheet: {
          releaseDate: 'Jam Winner (Expanded Vertical Slice)',
          platforms: ['PC (Steam)'],
          regularPrice: 'Free Prototype',
          website: 'https://voxelabyss.dev',
        },
        awardsAndHonors: ['🏆 1st Place Overall: Unreal Engine Global MegaJam 2024'],
        selectedArticles: [{ quote: 'The real-time tunnel collapses create claustrophobic dread like nothing else.', publication: 'IndieGames+' }],
        assets: [],
      }),
      featuredOrder: 4,
      chapters: {
        create: [
          { title: '0:00 Dual-Contouring Cave Generation', timestampSec: 0, description: 'Hermite data extraction and QEF surface solver producing sharp geological ridges.', orderIndex: 0 },
          { title: '0:30 Structural Stress Collapses', timestampSec: 30, description: 'Finite element voxel stress propagation causing real-time tunnel cave-ins.', orderIndex: 1 },
        ],
      },
      mechanics: {
        create: [
          {
            title: 'Real-time Dual Contouring Mesh Generation',
            summary: 'An asynchronous multithreaded voxel mesher generating manifold isosurfaces with sharp corners from Hermite distance field data.',
            discipline: 'Technical Art',
            greyboxMediaUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format',
            polishedMediaUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format',
            interactiveParamsJson: JSON.stringify([
              { key: 'raycastDebug', label: 'Draw Octree Voxel Grid', defaultValue: true, impactDescription: 'Visualizes the adaptive sparse octree bounding boxes.' },
            ]),
            telemetryStatsJson: JSON.stringify({
              frameBudgetMs: 3.2,
              drawCalls: 24,
              memoryFootprintMb: 88.0,
            }),
            orderIndex: 0,
          },
        ],
      },
      devLogs: {
        create: [
          {
            slug: 'v04-async-taskgraph-voxel-rebuilds',
            versionTag: 'v0.4 - Asynchronous Voxel Meshing',
            title: 'Minimizing Mesh Allocation Spikes During Explosive Excavations',
            publishedAt: new Date('2024-11-10T12:00:00Z'),
            readingTimeMinutes: 5,
            tagsJson: JSON.stringify(['Technical Art', 'Gameplay Systems']),
            summary: 'Using Unreal TaskGraph multithreading to offload QEF solvers and vertex buffer updates away from the game render thread.',
            contentMarkdown: `### The Problem with Real-Time Destruction
Whenever a grenade detonated, 64 voxel chunks within the blast radius requested immediate mesh recalculations. In single-threaded execution, this generated a 42ms stutter that dropped frame rates.

### The Solution: Asynchronous TaskGraph Pipeline
We restructured the meshing pipeline into lock-free worker thread pools that calculate vertex buffers in parallel and double-buffer GPU vertex stream transfers.`,
            benchmarksJson: JSON.stringify([
              { metric: 'Explosion Frame Time Spike', before: '42.8 ms (Drop to 23 FPS)', after: '1.2 ms (Solid 60 FPS)', improvementPercent: 97 },
            ]),
          },
        ],
      },
    },
  });

  console.log('--- Database seeding completed successfully! ---');
}

main()
  .catch((e) => {
    console.error('Error seeding DB:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
