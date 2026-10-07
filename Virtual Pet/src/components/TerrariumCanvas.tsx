import React, { useRef, useEffect, useState } from 'react';
import type { PetEntity, FoodItem, PeerPetState } from '../types/pet';
import { SquashAndStretch } from '../engine/Kinematics';
import { SteeringSystem, type WasteEntity } from '../engine/Steering';
import { ParticleManager } from '../engine/Particles';
import { PetBrain } from '../engine/PetBrain';
import { SPECIES_CATALOG } from '../lib/speciesData';
import { sound } from '../lib/sound';

interface TerrariumCanvasProps {
  pet: PetEntity;
  activeTool: 'HAND' | 'SPONGE' | 'FOOD_DROPPER' | 'BALL' | null;
  selectedFood: FoodItem | null;
  dayNightPhase: 'DAWN' | 'DAY' | 'DUSK' | 'NIGHT';
  peers?: PeerPetState[];
  onFeedBite?: (foodId: string, biteNumber: number) => void;
  onCleanWaste?: () => void;
  onPetTouch?: () => void;
  onBallKick?: (ballX: number, ballY: number, vx: number, vy: number) => void;
  onPeerUpdate?: (x: number, y: number, mood: string) => void;
}

export const TerrariumCanvas: React.FC<TerrariumCanvasProps> = ({
  pet,
  activeTool,
  selectedFood,
  dayNightPhase,
  peers = [],
  onFeedBite,
  onCleanWaste,
  onPetTouch,
  onBallKick,
  onPeerUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Feeding bite deformation state: 0 (100%), 1 (66%), 2 (33%), 3 (gulped)
  const [foodBiteStage, setFoodBiteStage] = useState(0);

  // Engine references persistent across renders
  const kinematicsRef = useRef<SquashAndStretch>(new SquashAndStretch());
  const steeringRef = useRef<SteeringSystem>(new SteeringSystem());
  const particlesRef = useRef<ParticleManager>(new ParticleManager());
  const brainRef = useRef<PetBrain>(new PetBrain());

  // Pet physical transform in canvas space
  const petTransformRef = useRef({
    x: 400,
    y: 350,
    vx: 0,
    vy: 0,
    radius: 46,
  });

  // Cursor tracking
  const cursorRef = useRef<{
    x: number;
    y: number;
    prevX: number;
    prevY: number;
    isDown: boolean;
    speed: number;
    active: boolean;
  }>({
    x: -999,
    y: -999,
    prevX: -999,
    prevY: -999,
    isDown: false,
    speed: 0,
    active: false,
  });

  // Droppings entities in canvas
  const wasteListRef = useRef<WasteEntity[]>([]);

  // Lather foam meter for sponge scrub mechanic
  const scrubLatherRef = useRef<number>(0);
  const biteCooldownRef = useRef<number>(0);

  // Sync waste count from pet entity to physical canvas waste entities
  useEffect(() => {
    const currentCount = wasteListRef.current.length;
    const targetCount = pet.wasteCount;

    if (targetCount > currentCount) {
      for (let i = currentCount; i < targetCount; i++) {
        wasteListRef.current.push({
          id: `waste_${Date.now()}_${i}`,
          x: 120 + Math.random() * 560,
          y: 440 + Math.random() * 30,
          radius: 14,
        });
      }
    } else if (targetCount < currentCount) {
      wasteListRef.current = wasteListRef.current.slice(0, targetCount);
    }
  }, [pet.wasteCount]);

  // Spawn toy ball when BALL tool is activated
  useEffect(() => {
    if (activeTool === 'BALL') {
      const canvas = canvasRef.current;
      const groundY = canvas ? canvas.getBoundingClientRect().height - 85 : 400;
      particlesRef.current.spawnBall(
        petTransformRef.current.x + (Math.random() > 0.5 ? 100 : -100),
        groundY
      );
      sound.playBallBounce(1.2);
    }
  }, [activeTool]);

  // Main high-performance Canvas Animation Loop (Decoupled from React state)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const renderLoop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      const rect = canvas.getBoundingClientRect();
      const bounds = {
        width: rect.width,
        height: rect.height,
        groundY: rect.height - 85,
      };

      // 1. UPDATE KINEMATICS & PHYSICS
      const kinematics = kinematicsRef.current;
      kinematics.update(dt);

      const petTrans = petTransformRef.current;
      const steering = steeringRef.current;
      const particles = particlesRef.current;
      const brain = brainRef.current;
      const cursor = cursorRef.current;

      // Mouse speed calculation for scrub lather
      const cursorDx = cursor.x - cursor.prevX;
      const cursorDy = cursor.y - cursor.prevY;
      cursor.speed = Math.hypot(cursorDx, cursorDy) / Math.max(dt, 0.001);
      cursor.prevX = cursor.x;
      cursor.prevY = cursor.y;

      const distToCursor = Math.hypot(cursor.x - petTrans.x, cursor.y - petTrans.y);
      const isCursorOverPet = distToCursor < petTrans.radius * 1.35;

      // Tactile Interaction checks
      let isFeeding = false;
      let isScrubbing = false;

      // Feeding Proximity Check (Dragging food to pet's mouth)
      if (activeTool === 'FOOD_DROPPER' && selectedFood && distToCursor < 80) {
        isFeeding = true;
        biteCooldownRef.current -= dt;

        if (biteCooldownRef.current <= 0) {
          // Take a bite!
          biteCooldownRef.current = 0.55; // 550ms per bite
          kinematics.squish(0.4);
          sound.playBiteCrunch();
          particles.spawnCrumbs(petTrans.x, petTrans.y + 10, selectedFood.color, 8);

          setFoodBiteStage((stage) => {
            const nextStage = stage + 1;
            if (onFeedBite) {
              onFeedBite(selectedFood.id, nextStage);
            }
            if (nextStage >= 3) {
              sound.playChirp(true);
              particles.spawnEmote(petTrans.x, petTrans.y - 40, '😋 DELICIOUS!');
              return 0; // reset for next item
            }
            return nextStage;
          });
        }
      }

      // Sponge Scrub Mechanic: Rubbing sponge vigorously over pet spawns lather and cleans
      if (activeTool === 'SPONGE' && isCursorOverPet && cursor.speed > 50) {
        isScrubbing = true;
        scrubLatherRef.current += dt * 3.5;
        particles.spawnFoam(cursor.x, cursor.y, 2);

        if (Math.random() < 0.2) {
          sound.playBubbleScrub();
        }

        // Fade away dirt decals
        for (const decal of particles.dirtDecals) {
          decal.opacity = Math.max(0, decal.opacity - dt * 0.8);
        }

        // Once lather threshold reached, trigger clean action
        if (scrubLatherRef.current >= 4.0) {
          scrubLatherRef.current = 0;
          particles.resetDirtDecals(0);
          particles.spawnEmote(petTrans.x, petTrans.y - 50, '✨ SPOTLESS!');
          sound.playChirp(true);
          if (onCleanWaste) {
            onCleanWaste();
          }
        }
      }

      // Petting squish & purr mechanic
      if (activeTool === 'HAND' && cursor.isDown && isCursorOverPet) {
        kinematics.squish(0.18);
        if (Math.random() < 0.12) {
          sound.playPurr();
          particles.spawnEmote(petTrans.x, petTrans.y - 40, '❤️');
          if (onPetTouch) onPetTouch();
        }
      }

      // Autonomous Brain Update
      brain.update(dt, pet, {
        isFeeding,
        isScrubbing,
        isEvolving: false,
        cursorDist: distToCursor,
        cursorX: cursor.x,
        petX: petTrans.x,
      });

      // Locomotion & Steering Forces (Only move if awake and not being groomed/fed)
      if (!pet.isSleeping && brain.currentState !== 'BATHING' && pet.stage !== 'EGG') {
        const wallForce = steering.getWallAvoidanceForce(petTrans, bounds);
        const wanderForce = steering.getWanderForce(brain.currentState === 'BEGGING' ? 65 : 35);
        const curiosityForce =
          activeTool === 'FOOD_DROPPER' || activeTool === 'HAND'
            ? steering.getCuriosityForce(petTrans, cursor.active ? cursor : null)
            : { x: 0, y: 0 };
        const wasteRepulsion = steering.getWasteRepulsionForce(petTrans, wasteListRef.current);

        const totalFx = wallForce.x + wanderForce.x + curiosityForce.x + wasteRepulsion.x;
        const totalFy = wallForce.y + wanderForce.y + curiosityForce.y + wasteRepulsion.y;

        petTrans.vx += totalFx * dt;
        petTrans.vy += totalFy * dt;

        // Friction damping
        petTrans.vx *= 0.92;
        petTrans.vy *= 0.88;

        petTrans.x += petTrans.vx * dt;
        petTrans.y += petTrans.vy * dt;

        // Keep pet within bottom ground zone
        const minGround = bounds.groundY - petTrans.radius;
        if (petTrans.y > minGround) {
          petTrans.y = minGround;
          petTrans.vy = 0;
          // Natural walk squish
          if (Math.abs(petTrans.vx) > 15 && Math.random() < 0.05) {
            kinematics.squish(0.12);
          }
        }

        // Broadcast peer update to WebSocket if attached
        if (onPeerUpdate && Math.random() < 0.1) {
          onPeerUpdate(petTrans.x, petTrans.y, pet.mood);
        }
      }

      // Ball toy collision with pet
      if (particles.ball.active) {
        const ball = particles.ball;
        const dx = ball.x - petTrans.x;
        const dy = ball.y - petTrans.y;
        const dist = Math.hypot(dx, dy);
        const minDist = petTrans.radius + ball.radius;

        if (dist < minDist && dist > 0) {
          // Pet kicks ball!
          const kickStrength = 240 + Math.random() * 120;
          ball.vx = (dx / dist) * kickStrength;
          ball.vy = -180 - Math.random() * 100;
          kinematics.stretch(0.3);
          sound.playBallBounce(1.5);
          particles.spawnEmote(petTrans.x, petTrans.y - 40, '⚽ GOAL!');

          if (onBallKick) {
            onBallKick(ball.x, ball.y, ball.vx, ball.vy);
          }
        }
      }

      // Update particles
      particles.update(dt, bounds, (vel) => sound.playBallBounce(vel));

      // 2. RENDER STAGE TO CANVAS
      ctx.clearRect(0, 0, bounds.width, bounds.height);

      // (A) Draw Sky Gradient & Celestial Body
      drawEnvironmentSky(ctx, bounds, dayNightPhase);

      // (B) Draw Terrarium Terraces & Ground
      drawTerrariumGround(ctx, bounds);

      // (C) Draw Physical Waste Droppings
      drawWasteDroppings(ctx, wasteListRef.current);

      // (D) Draw Toy Ball if active
      if (particles.ball.active) {
        drawToyBall(ctx, particles.ball);
      }

      // (E) Draw Peer Pets (Multiplayer Playdate Park)
      for (const peer of peers) {
        drawPeerPet(ctx, peer);
      }

      // (F) Draw Main Pet with Squash & Stretch Kinematics
      ctx.save();
      ctx.translate(petTrans.x, petTrans.y);
      ctx.scale(kinematics.scaleX.value * brain.lookDirection, kinematics.scaleY.value);
      ctx.rotate(kinematics.rotation.value);

      drawPetAvatar(ctx, pet, brain, particles.dirtDecals);
      ctx.restore();

      // (G) Draw Emote Particles & Soap Foam
      drawParticles(ctx, particles);

      // (H) Draw Floating Drag-and-Drop Tool (Sponge lather, Food bites)
      if (cursor.active && cursor.x > 0) {
        drawActiveToolOverlay(ctx, cursor, activeTool, selectedFood, foodBiteStage);
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [
    pet,
    activeTool,
    selectedFood,
    dayNightPhase,
    peers,
    onFeedBite,
    onCleanWaste,
    onPetTouch,
    onBallKick,
    onPeerUpdate,
  ]);

  // Pointer / Touch Event Handlers for universal desktop and mobile parity
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cursorRef.current.x = x;
    cursorRef.current.y = y;
    cursorRef.current.prevX = x;
    cursorRef.current.prevY = y;
    cursorRef.current.isDown = true;
    cursorRef.current.active = true;

    // Check if clicked toy ball to kick it
    const ball = particlesRef.current.ball;
    if (ball.active && Math.hypot(x - ball.x, y - ball.y) < ball.radius * 2) {
      ball.vx = (Math.random() - 0.5) * 260;
      ball.vy = -260;
      sound.playBallBounce(1.5);
      kinematicsRef.current.stretch(0.25);
    }

    // Check if clicked waste droppings to clean them
    const wasteList = wasteListRef.current;
    for (let i = 0; i < wasteList.length; i++) {
      if (Math.hypot(x - wasteList[i].x, y - wasteList[i].y) < 25) {
        wasteList.splice(i, 1);
        sound.playBubbleScrub();
        particlesRef.current.spawnFoam(x, y, 4);
        if (onCleanWaste) onCleanWaste();
        break;
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    cursorRef.current.x = e.clientX - rect.left;
    cursorRef.current.y = e.clientY - rect.top;
    cursorRef.current.active = true;
  };

  const handlePointerUp = () => {
    cursorRef.current.isDown = false;
  };

  const handlePointerLeave = () => {
    cursorRef.current.isDown = false;
    cursorRef.current.active = false;
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden touch-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair block"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      />
    </div>
  );
};

// Canvas Sub-renderers

function drawEnvironmentSky(
  ctx: CanvasRenderingContext2D,
  bounds: { width: number; height: number; groundY: number },
  phase: 'DAWN' | 'DAY' | 'DUSK' | 'NIGHT'
) {
  const gradient = ctx.createLinearGradient(0, 0, 0, bounds.groundY);

  if (phase === 'DAWN') {
    gradient.addColorStop(0, '#312e81');
    gradient.addColorStop(0.4, '#831843');
    gradient.addColorStop(0.7, '#fb7185');
    gradient.addColorStop(1, '#fed7aa');
  } else if (phase === 'DAY') {
    gradient.addColorStop(0, '#0284c7');
    gradient.addColorStop(0.4, '#38bdf8');
    gradient.addColorStop(0.75, '#bae6fd');
    gradient.addColorStop(1, '#e0f2fe');
  } else if (phase === 'DUSK') {
    gradient.addColorStop(0, '#1e1b4b');
    gradient.addColorStop(0.35, '#4c1d95');
    gradient.addColorStop(0.65, '#e11d48');
    gradient.addColorStop(1, '#fbbf24');
  } else {
    // NIGHT
    gradient.addColorStop(0, '#030712');
    gradient.addColorStop(0.4, '#0f172a');
    gradient.addColorStop(0.8, '#1e1b4b');
    gradient.addColorStop(1, '#111827');
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, bounds.width, bounds.height);

  // Celestial Body (Sun or Moon)
  ctx.save();
  if (phase === 'NIGHT' || phase === 'DUSK') {
    // Crescent Moon
    const moonX = bounds.width * 0.8;
    const moonY = 85;
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = 'rgba(254, 240, 138, 0.6)';
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 26, 0, Math.PI * 2);
    ctx.fill();

    // Dark eclipse cutout for crescent shape
    ctx.fillStyle = phase === 'NIGHT' ? '#0f172a' : '#1e1b4b';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(moonX + 10, moonY - 6, 22, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Golden Sun
    const sunX = bounds.width * 0.75;
    const sunY = 90;
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = 'rgba(251, 191, 36, 0.7)';
    ctx.shadowBlur = 35;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 32, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawTerrariumGround(
  ctx: CanvasRenderingContext2D,
  bounds: { width: number; height: number; groundY: number }
) {
  // Deep soil layer
  const soilGradient = ctx.createLinearGradient(0, bounds.groundY, 0, bounds.height);
  soilGradient.addColorStop(0, '#15803d');
  soilGradient.addColorStop(0.08, '#166534');
  soilGradient.addColorStop(0.2, '#3f2b1d');
  soilGradient.addColorStop(1, '#1c130d');

  ctx.fillStyle = soilGradient;
  ctx.beginPath();
  ctx.rect(0, bounds.groundY, bounds.width, bounds.height - bounds.groundY);
  ctx.fill();

  // Vibrant moss grass trim
  ctx.fillStyle = '#4ade80';
  ctx.beginPath();
  for (let x = 0; x < bounds.width; x += 18) {
    ctx.lineTo(x, bounds.groundY - 5);
    ctx.lineTo(x + 9, bounds.groundY - 14);
    ctx.lineTo(x + 18, bounds.groundY - 5);
  }
  ctx.lineTo(bounds.width, bounds.groundY + 10);
  ctx.lineTo(0, bounds.groundY + 10);
  ctx.closePath();
  ctx.fill();
}

function drawWasteDroppings(ctx: CanvasRenderingContext2D, wasteList: WasteEntity[]) {
  for (const waste of wasteList) {
    ctx.save();
    ctx.translate(waste.x, waste.y);

    // Dropping swirl shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 8, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Swirl layers
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(0, 3, 12, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.ellipse(0, -3, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(0, -8, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Buzzing fly dot
    const flyOffset = Math.sin(Date.now() * 0.01 + waste.x) * 12;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(flyOffset, -18 + Math.cos(Date.now() * 0.012) * 5, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

function drawToyBall(ctx: CanvasRenderingContext2D, ball: { x: number; y: number; radius: number; rotation: number }) {
  ctx.save();
  ctx.translate(ball.x, ball.y);
  ctx.rotate(ball.rotation);

  // Ball shadow on ground
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(0, ball.radius + 3, ball.radius * 0.9, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Multi-color beach ball / soccer ball stripes
  ctx.beginPath();
  ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#f43f5e';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 0, ball.radius, 0, Math.PI);
  ctx.fillStyle = '#38bdf8';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 0, ball.radius, Math.PI * 0.5, Math.PI * 1.5);
  ctx.fillStyle = '#facc15';
  ctx.fill();

  // White highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(-ball.radius * 0.35, -ball.radius * 0.35, ball.radius * 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawPeerPet(ctx: CanvasRenderingContext2D, peer: PeerPetState) {
  ctx.save();
  ctx.translate(peer.x, peer.y);

  // Name tag badge
  ctx.font = '600 11px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(-45, -60, 90, 20);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.strokeRect(-45, -60, 90, 20);

  ctx.fillStyle = '#38bdf8';
  ctx.fillText(peer.name, 0, -46);

  // Translucent ghost-like peer representation
  ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
  ctx.beginPath();
  ctx.arc(0, 0, 36, 0, Math.PI * 2);
  ctx.fill();

  // Emote if present
  if (peer.emote) {
    ctx.font = '20px serif';
    ctx.fillText(peer.emote, 0, -68);
  }

  ctx.restore();
}

function drawPetAvatar(
  ctx: CanvasRenderingContext2D,
  pet: PetEntity,
  brain: PetBrain,
  dirtDecals: { id: string; relX: number; relY: number; radius: number; opacity: number }[]
) {
  const species = SPECIES_CATALOG[pet.speciesId] || SPECIES_CATALOG.blobkin;
  const isEgg = pet.stage === 'EGG';

  // Ground drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
  ctx.beginPath();
  ctx.ellipse(0, 38, 36, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  if (isEgg) {
    // EGG STAGE: Iridescent pearlescent egg
    const eggGrad = ctx.createLinearGradient(-30, -50, 30, 40);
    eggGrad.addColorStop(0, '#f8fafc');
    eggGrad.addColorStop(0.4, '#e2e8f0');
    eggGrad.addColorStop(0.7, '#cbd5e1');
    eggGrad.addColorStop(1, '#94a3b8');

    ctx.fillStyle = eggGrad;
    ctx.beginPath();
    ctx.ellipse(0, -5, 34, 46, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cosmic rune vein
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(-10, -25);
    ctx.lineTo(5, -10);
    ctx.lineTo(-6, 5);
    ctx.lineTo(8, 20);
    ctx.stroke();
    ctx.shadowBlur = 0;
    return;
  }

  // LIVING PET BODY
  const bodyGrad = ctx.createRadialGradient(-10, -15, 8, 0, 0, 48);
  bodyGrad.addColorStop(0, species.primaryColor);
  bodyGrad.addColorStop(0.7, species.secondaryColor);
  bodyGrad.addColorStop(1, '#0f172a');

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 42, 0, Math.PI * 2);
  ctx.fill();

  // Species-specific accents (Horns, Wings, Leaves, Ears)
  if (species.id === 'chibi_sprout' || species.id === 'verdant_cub') {
    // Photosynthetic leaf antenna
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.ellipse(0, -48, 12, 6, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (species.id === 'cyber_drake' || species.id === 'pyro_fang') {
    // Cyber / Dragon horn
    ctx.fillStyle = species.accentColor;
    ctx.beginPath();
    ctx.moveTo(-15, -35);
    ctx.lineTo(-24, -58);
    ctx.lineTo(-5, -40);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(15, -35);
    ctx.lineTo(24, -58);
    ctx.lineTo(5, -40);
    ctx.closePath();
    ctx.fill();
  } else if (species.id === 'astral_wisp' || species.id === 'glimmer_sprite') {
    // Ethereal wings
    ctx.fillStyle = 'rgba(232, 121, 249, 0.45)';
    ctx.beginPath();
    ctx.ellipse(-42, -10, 22, 12, -Math.PI / 6, 0, Math.PI * 2);
    ctx.ellipse(42, -10, 22, 12, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cheek blushes
  ctx.fillStyle = 'rgba(251, 113, 133, 0.45)';
  ctx.beginPath();
  ctx.ellipse(-22, 10, 7, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(22, 10, 7, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (With animated blinks and direction tracking)
  const eyeY = -4;
  const leftEyeX = -15;
  const rightEyeX = 15;

  if (pet.isSleeping) {
    // Closed curved sleeping eyes (^_^)
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, 6, Math.PI, 0);
    ctx.arc(rightEyeX, eyeY, 6, Math.PI, 0);
    ctx.stroke();
  } else if (brain.isBlinking) {
    // Blink line
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(leftEyeX - 6, eyeY);
    ctx.lineTo(leftEyeX + 6, eyeY);
    ctx.moveTo(rightEyeX - 6, eyeY);
    ctx.lineTo(rightEyeX + 6, eyeY);
    ctx.stroke();
  } else {
    // Big curious shiny eyes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(leftEyeX, eyeY, 8, 11, 0, 0, Math.PI * 2);
    ctx.ellipse(rightEyeX, eyeY, 8, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye catchlights (Sparkles)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(leftEyeX - 2.5, eyeY - 3.5, 3.5, 0, Math.PI * 2);
    ctx.arc(rightEyeX - 2.5, eyeY - 3.5, 3.5, 0, Math.PI * 2);
    ctx.arc(leftEyeX + 3, eyeY + 3, 1.8, 0, Math.PI * 2);
    ctx.arc(rightEyeX + 3, eyeY + 3, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mouth (snaps open dynamically during feeding!)
  ctx.save();
  ctx.translate(0, 16);
  if (brain.mouthOpenAmount > 0.1) {
    // Open mouth
    const openH = brain.mouthOpenAmount * 16;
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, openH, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cute pink tongue
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.ellipse(0, openH * 0.45, 6, openH * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Gentle smile
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, -2, 7, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  }
  ctx.restore();

  // Dirt decals on body that erase as sponge suds scrub over them
  for (const decal of dirtDecals) {
    if (decal.opacity <= 0.05) continue;
    ctx.fillStyle = `rgba(120, 53, 15, ${decal.opacity})`;
    ctx.beginPath();
    ctx.arc(decal.relX * 60, decal.relY * 60, decal.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: ParticleManager) {
  // Bubbles
  for (const b of particles.bubbles) {
    ctx.save();
    ctx.fillStyle = `hsla(${b.hue}, 85%, 65%, ${b.alpha})`;
    ctx.strokeStyle = `hsla(${b.hue}, 90%, 80%, ${b.alpha * 1.2})`;
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bubble specular reflection
    ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha * 0.8})`;
    ctx.beginPath();
    ctx.arc(b.x - b.radius * 0.35, b.y - b.radius * 0.35, b.radius * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Crumbs
  for (const c of particles.crumbs) {
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.size * c.life, 0, Math.PI * 2);
    ctx.fill();
  }

  // Floating Emotes
  for (const e of particles.emotes) {
    ctx.save();
    ctx.font = `bold ${Math.round(20 * e.scale)}px Plus Jakarta Sans, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(255, 255, 255, ${e.alpha})`;
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 8;
    ctx.fillText(e.text, e.x, e.y);
    ctx.restore();
  }
}

function drawActiveToolOverlay(
  ctx: CanvasRenderingContext2D,
  cursor: { x: number; y: number },
  activeTool: 'HAND' | 'SPONGE' | 'FOOD_DROPPER' | 'BALL' | null,
  selectedFood: FoodItem | null,
  biteStage: number
) {
  ctx.save();
  ctx.translate(cursor.x, cursor.y);

  if (activeTool === 'SPONGE') {
    // Sponge scrubber icon with suds
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-20, -15, 40, 30, 8);
    ctx.fill();
    ctx.stroke();

    // Suds dots on sponge
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-8, -4, 4, 0, Math.PI * 2);
    ctx.arc(5, 3, 3, 0, Math.PI * 2);
    ctx.arc(10, -6, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (activeTool === 'FOOD_DROPPER' && selectedFood) {
    // Draw food with multi-stage bite deformation
    // 0 = full, 1 = 66% (one bite taken), 2 = 33% (two bites taken)
    ctx.font = '28px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(selectedFood.icon, 0, 0);

    if (biteStage > 0) {
      // Bite cutout circles subtracting volume from food item
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.beginPath();
      ctx.arc(8, -8, 12 * (biteStage / 2), 0, Math.PI * 2);
      if (biteStage >= 2) {
        ctx.arc(-8, 6, 14, 0, Math.PI * 2);
      }
      ctx.fill();
    }
  }

  ctx.restore();
}
