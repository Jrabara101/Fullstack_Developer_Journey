import React, { useEffect, useRef } from 'react';

interface GenerativeTrailerCanvasProps {
  title?: string;
  engine?: string;
  chapterTitle?: string;
  timestampSec?: number;
}

export const GenerativeTrailerCanvas: React.FC<GenerativeTrailerCanvasProps> = ({
  title = 'Gameplay Micro-Reel',
  engine = 'Godot 4',
  chapterTitle,
  timestampSec = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 640;
    const height = 360;
    canvas.width = width;
    canvas.height = height;

    let animId: number;
    let t = 0;

    const particles: { x: number; y: number; speed: number; size: number; color: string }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: Math.random() * 2 + 1,
        size: Math.random() * 2 + 1,
        color: i % 2 === 0 ? '#06b6d4' : '#10b981',
      });
    }

    const render = () => {
      t += 0.02;

      // Dark futuristic background
      ctx.fillStyle = '#06080e';
      ctx.fillRect(0, 0, width, height);

      // Perspective 3D Grid Floor
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.lineWidth = 1;
      const horizon = height * 0.55;

      for (let x = -width; x < width * 2; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x + (x - width / 2) * 1.5, height);
        ctx.lineTo(width / 2, horizon);
        ctx.stroke();
      }

      for (let y = horizon + 8; y < height; y += (y - horizon) * 0.35 + 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Starfield / floating sparks
      particles.forEach((p) => {
        p.x -= p.speed;
        if (p.x < 0) p.x = width;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });

      // Animated Player Drone Silhouette
      const droneX = 140;
      const droneY = horizon - 20 + Math.sin(t * 3) * 14;

      // Laser blade trail
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(droneX - 50, droneY + 6);
      ctx.lineTo(droneX + 20, droneY);
      ctx.stroke();

      // Drone Body
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(droneX + 24, droneY);
      ctx.lineTo(droneX - 16, droneY - 10);
      ctx.lineTo(droneX - 10, droneY);
      ctx.lineTo(droneX - 16, droneY + 10);
      ctx.closePath();
      ctx.fill();

      // Laser Blasts
      const laserX = (droneX + (t * 800) % (width - droneX)) ;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(laserX, droneY);
      ctx.lineTo(laserX + 35, droneY);
      ctx.stroke();

      // Enemy Core Orb
      const enemyX = width - 120;
      const enemyY = horizon - 30 + Math.cos(t * 2) * 18;
      ctx.strokeStyle = '#f43f5e';
      ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(enemyX, enemyY, 24 + Math.sin(t * 6) * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // HUD Telemetry Stamp
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillText(`REC • 60 FPS • ${engine.toUpperCase()} HIGH-RES REEL`, 20, 26);

      if (chapterTitle) {
        ctx.fillStyle = '#f1f5f9';
        ctx.font = '600 12px "Inter", sans-serif';
        ctx.fillText(chapterTitle, 20, height - 20);
      }

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '10px "JetBrains Mono", monospace';
      const mins = Math.floor(timestampSec / 60);
      const secs = Math.floor(timestampSec % 60);
      ctx.fillText(`${mins}:${secs < 10 ? '0' : ''}${secs} / 1:20`, width - 90, height - 20);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [title, engine, chapterTitle, timestampSec]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full object-cover rounded-lg"
    />
  );
};
