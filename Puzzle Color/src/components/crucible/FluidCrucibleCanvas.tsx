import React, { useRef, useEffect } from 'react';
import { ColorData, PatternTexture } from '../../types/color';

interface Droplet {
  x: number;
  y: number;
  vy: number;
  radius: number;
  colorHex: string;
  reagentId: string;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  colorHex: string;
}

interface PigmentBlob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  colorHex: string;
  rotation: number;
  rotSpeed: number;
}

interface FluidCrucibleCanvasProps {
  currentColor: ColorData;
  targetColor: ColorData;
  currentVolumeMl: number;
  maxVolumeMl: number;
  status: 'IDLE' | 'DISPENSING' | 'STIRRING' | 'ANALYZING' | 'COMPLETED' | 'FAILED';
  patternsEnabled: boolean;
  activePattern?: PatternTexture;
  onDropComplete?: () => void;
}

export const FluidCrucibleCanvas: React.FC<FluidCrucibleCanvasProps> = ({
  currentColor,
  currentVolumeMl,
  maxVolumeMl,
  status,
  patternsEnabled,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simulation physics state refs
  const dropletsRef = useRef<Droplet[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const pigmentBlobsRef = useRef<PigmentBlob[]>([]);
  const meniscusSpringRef = useRef({ pos: 0, vel: 0, target: 0 });
  const vortexAngleRef = useRef(0);
  const animFrameIdRef = useRef<number>(0);

  // Trigger a physical droplet from nozzle
  const spawnDroplet = (colorHex: string, reagentId: string) => {
    dropletsRef.current.push({
      x: 150,
      y: 10,
      vy: 2.5,
      radius: 5,
      colorHex,
      reagentId,
    });
  };

  // Expose trigger method via custom event or when status changes to DISPENSING
  useEffect(() => {
    const handleReagentDispensed = (e: CustomEvent<{ colorHex: string; reagentId: string }>) => {
      spawnDroplet(e.detail.colorHex, e.detail.reagentId);
    };

    window.addEventListener('reagent-dispensed' as any, handleReagentDispensed as any);
    return () => {
      window.removeEventListener('reagent-dispensed' as any, handleReagentDispensed as any);
    };
  }, []);

  // Update target meniscus height based on volume
  useEffect(() => {
    const volFraction = Math.min(1.0, currentVolumeMl / maxVolumeMl);
    // Liquid level fills crucible from bottom (y=270) up to y=50
    const targetHeight = volFraction * 180;
    meniscusSpringRef.current.target = targetHeight;
  }, [currentVolumeMl, maxVolumeMl]);

  // Main Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI display
    const dpr = window.devicePixelRatio || 1;
    const width = 300;
    const height = 300;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2 + 10;
      const flaskRadius = 110;

      // 1. Spring physics for meniscus bounce
      const springK = 60.0;
      const damping = 7.0;
      const diff = meniscusSpringRef.current.target - meniscusSpringRef.current.pos;
      const force = diff * springK;
      meniscusSpringRef.current.vel += (force - meniscusSpringRef.current.vel * damping) * dt;
      meniscusSpringRef.current.pos += meniscusSpringRef.current.vel * dt;

      // 2. Stirring vortex rotation speed
      const isStirring = status === 'STIRRING';
      const vortexSpeed = isStirring ? 8.0 : 0.6;
      vortexAngleRef.current += vortexSpeed * dt;

      // 3. Draw Cleanroom Calibration Grid & Reticle
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Outer targeting circles
      ctx.beginPath();
      ctx.arc(centerX, centerY, flaskRadius + 18, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, flaskRadius + 32, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(centerX - flaskRadius - 40, centerY);
      ctx.lineTo(centerX + flaskRadius + 40, centerY);
      ctx.moveTo(centerX, centerY - flaskRadius - 40);
      ctx.lineTo(centerX, centerY + flaskRadius + 40);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 4. Draw Crucible Flask Back Wall & Liquid clipping region
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, flaskRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.fill();

      // Clip to interior of crucible
      ctx.clip();

      // Compute liquid surface level Y
      const currentLiquidY = centerY + flaskRadius - 10 - meniscusSpringRef.current.pos;

      // Liquid base fill
      const liquidGrad = ctx.createRadialGradient(
        centerX,
        centerY + (isStirring ? 0 : 20),
        10,
        centerX,
        centerY,
        flaskRadius
      );
      liquidGrad.addColorStop(0, currentColor.hex);
      liquidGrad.addColorStop(0.7, currentColor.hex);
      liquidGrad.addColorStop(1.0, '#0a0d14');

      ctx.fillStyle = liquidGrad;
      ctx.beginPath();
      ctx.rect(centerX - flaskRadius, currentLiquidY, flaskRadius * 2, height);
      ctx.fill();

      // 5. Draw Dynamic Swirling Pigment Blobs
      pigmentBlobsRef.current.forEach((blob, idx) => {
        // Rotational motion around center
        const dx = blob.x - centerX;
        const dy = blob.y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const curAngle = Math.atan2(dy, dx);
        const newAngle = curAngle + (vortexSpeed * 0.4 * (120 / Math.max(20, dist))) * dt;

        // Inward pull during stirring
        const inwardRate = isStirring ? 25 * dt : 0;
        const newDist = Math.max(5, dist - inwardRate);

        blob.x = centerX + Math.cos(newAngle) * newDist;
        blob.y = centerY + Math.sin(newAngle) * newDist;
        blob.radius = Math.min(blob.maxRadius, blob.radius + 8 * dt);
        blob.alpha -= (isStirring ? 0.35 : 0.08) * dt;

        // Render pigment swirl
        ctx.save();
        ctx.globalAlpha = Math.max(0, blob.alpha);
        const blobGrad = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius);
        blobGrad.addColorStop(0, blob.colorHex);
        blobGrad.addColorStop(0.6, blob.colorHex);
        blobGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = blobGrad;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Filter out dead blobs
      pigmentBlobsRef.current = pigmentBlobsRef.current.filter((b) => b.alpha > 0.02);

      // 6. Draw Concentric Ripples
      ripplesRef.current.forEach((rip) => {
        rip.radius += 55 * dt;
        rip.alpha -= 0.7 * dt;

        ctx.save();
        ctx.globalAlpha = Math.max(0, rip.alpha);
        ctx.strokeStyle = rip.colorHex;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });
      ripplesRef.current = ripplesRef.current.filter((r) => r.alpha > 0);

      // 7. Stirring vortex central eye effect
      if (isStirring) {
        ctx.save();
        ctx.fillStyle = 'rgba(10, 15, 25, 0.4)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 24, 0, Math.PI * 2);
        ctx.filter = 'blur(6px)';
        ctx.fill();
        ctx.restore();
      }

      // 8. Accessibility Tactile Pattern Overlay (if enabled)
      if (patternsEnabled) {
        ctx.save();
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = '#ffffff';
        // Polka dot grid pattern over fluid
        for (let px = centerX - flaskRadius; px < centerX + flaskRadius; px += 14) {
          for (let py = currentLiquidY; py < centerY + flaskRadius; py += 14) {
            ctx.beginPath();
            ctx.arc(px, py, 1.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }

      ctx.restore(); // End flask clip

      // 9. Draw Falling Droplets
      dropletsRef.current.forEach((drop) => {
        drop.vy += 180 * dt; // Gravity acceleration
        drop.y += drop.vy * dt;

        // Droplet render with tear-drop shape
        ctx.save();
        ctx.fillStyle = drop.colorHex;
        ctx.shadowColor = drop.colorHex;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Check impact with liquid surface or crucible bottom
        const impactY = Math.min(centerY + flaskRadius - 10, currentLiquidY);
        if (drop.y >= impactY) {
          // Splash down! Trigger ripples & pigment diffusion
          ripplesRef.current.push({
            x: drop.x,
            y: impactY,
            radius: 4,
            maxRadius: 40,
            alpha: 0.9,
            colorHex: drop.colorHex,
          });

          // Meniscus impulse bounce
          meniscusSpringRef.current.vel += 25;

          // Spawn unhomogenized pigment swirls
          for (let b = 0; b < 3; b++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 5 + Math.random() * 20;
            pigmentBlobsRef.current.push({
              x: drop.x + Math.cos(angle) * dist,
              y: impactY + Math.sin(angle) * dist * 0.4,
              vx: Math.cos(angle) * 10,
              vy: Math.sin(angle) * 10,
              radius: 6,
              maxRadius: 28 + Math.random() * 15,
              alpha: 0.85,
              colorHex: drop.colorHex,
              rotation: Math.random() * Math.PI,
              rotSpeed: (Math.random() - 0.5) * 2,
            });
          }
        }
      });

      // Filter out collided droplets
      dropletsRef.current = dropletsRef.current.filter((d) => {
        const impactY = Math.min(centerY + flaskRadius - 10, currentLiquidY);
        return d.y < impactY;
      });

      // 10. Crucible Glass Chassis & Specular Rim Reflections
      ctx.save();
      // Outer Glass Bezel
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, flaskRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Specular highlight crescent
      const rimGrad = ctx.createLinearGradient(
        centerX - flaskRadius,
        centerY - flaskRadius,
        centerX + flaskRadius,
        centerY + flaskRadius
      );
      rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      rimGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.2)');
      rimGrad.addColorStop(0.6, 'transparent');
      rimGrad.addColorStop(1, 'rgba(255, 255, 255, 0.15)');

      ctx.strokeStyle = rimGrad;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, flaskRadius - 2, -Math.PI * 0.75, Math.PI * 0.25);
      ctx.stroke();

      // Meniscus Measurement Graduations Scale (10ml - 50ml)
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';

      for (let mark = 10; mark <= 50; mark += 10) {
        const fraction = mark / 50;
        const markY = centerY + flaskRadius - 10 - fraction * 180;
        const markX = centerX + flaskRadius - 10;

        ctx.fillRect(markX, markY, 6, 1);
        ctx.fillText(`${mark}ml`, markX - 8, markY + 3);
      }
      ctx.restore();

      // 11. Overhead Titration Nozzle
      ctx.save();
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(centerX - 8, 0, 16, 10);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(centerX - 3, 10, 6, 8);
      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [currentColor, currentVolumeMl, maxVolumeMl, status, patternsEnabled]);

  return (
    <div className="relative flex items-center justify-center w-full max-w-[320px] aspect-square mx-auto">
      <canvas
        ref={canvasRef}
        className="w-full h-full drop-shadow-[0_10px_35px_rgba(0,0,0,0.8)] pointer-events-none"
      />
    </div>
  );
};
