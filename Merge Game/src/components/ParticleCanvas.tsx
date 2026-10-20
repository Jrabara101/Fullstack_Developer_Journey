// ----------------------------------------------------
// 60fps Radial Shockwave & Elemental Particle Canvas
// ----------------------------------------------------

import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  decay: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface ParticleCanvasProps {
  shockwave?: { x: number; y: number; tier: number } | null;
  boardRect?: DOMRect | null;
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ shockwave }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);

  // Trigger high-tier celebrations
  useEffect(() => {
    if (!shockwave) return;

    if (shockwave.tier >= 8) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#06B6D4', '#A855F7', '#F59E0B', '#10B981'],
      });
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert grid coordinates (0..6) to canvas pixels
    const cellWidth = canvas.width / 7;
    const cellHeight = canvas.height / 7;
    const px = (shockwave.x + 0.5) * cellWidth;
    const py = (shockwave.y + 0.5) * cellHeight;

    // Determine color by tier
    let color = '#B45309';
    if (shockwave.tier >= 12) color = '#F59E0B';
    else if (shockwave.tier >= 10) color = '#A855F7';
    else if (shockwave.tier >= 7) color = '#06B6D4';
    else if (shockwave.tier >= 4) color = '#94A3B8';

    // Add shockwave ring
    shockwavesRef.current.push({
      x: px,
      y: py,
      radius: 10,
      maxRadius: Math.min(canvas.width, canvas.height) * 0.35,
      alpha: 0.8,
      color,
    });

    // Add radial spark particles
    const particleCount = shockwave.tier >= 5 ? 28 : 16;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 4;
      particlesRef.current.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 3,
        alpha: 1,
        color,
        decay: 0.02 + Math.random() * 0.025,
      });
    }
  }, [shockwave]);

  // Main 60fps render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Render & update shockwaves
      for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
        const sw = shockwavesRef.current[i];
        sw.radius += 5.5;
        sw.alpha -= 0.025;

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          shockwavesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x / window.devicePixelRatio, sw.y / window.devicePixelRatio, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 3.5;
        ctx.globalAlpha = sw.alpha;
        ctx.shadowBlur = 15;
        ctx.shadowColor = sw.color;
        ctx.stroke();
        ctx.restore();
      }

      // Render & update particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.size *= 0.96;

        if (p.alpha <= 0 || p.size <= 0.2) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x / window.devicePixelRatio, p.y / window.devicePixelRatio, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-30"
    />
  );
};
