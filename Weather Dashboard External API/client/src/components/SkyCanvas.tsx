import React, { useEffect, useRef } from 'react';

interface SkyCanvasProps {
  gradient: string;
  hasPrecipitation: boolean;
  precipitationType?: 'rain' | 'snow' | 'none';
  intensity?: number;
}

export const SkyCanvas: React.FC<SkyCanvasProps> = ({
  gradient,
  hasPrecipitation,
  precipitationType = 'none',
  intensity = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle system (rain drops or stars/motes)
    const particleCount = hasPrecipitation ? Math.min(120, Math.floor(40 + intensity * 30)) : 35;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speedY: hasPrecipitation
        ? precipitationType === 'snow'
          ? Math.random() * 2 + 1
          : Math.random() * 9 + 8
        : Math.random() * 0.4 + 0.1,
      speedX: hasPrecipitation ? (precipitationType === 'snow' ? Math.sin(Math.random()) * 0.8 : -1.5) : (Math.random() - 0.5) * 0.2,
      length: hasPrecipitation ? (precipitationType === 'snow' ? 2 : Math.random() * 14 + 10) : Math.random() * 2 + 1,
      opacity: Math.random() * 0.6 + 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y > height) {
          p.y = -10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        if (hasPrecipitation && precipitationType !== 'snow') {
          // Rain streaks
          ctx.strokeStyle = `rgba(56, 189, 248, ${p.opacity * 0.5})`;
          ctx.lineWidth = 1.2;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 2, p.y + p.length);
          ctx.stroke();
        } else if (hasPrecipitation && precipitationType === 'snow') {
          // Snow flakes
          ctx.fillStyle = `rgba(224, 242, 254, ${p.opacity * 0.8})`;
          ctx.arc(p.x, p.y, p.length, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Subtle atmospheric motes / stars
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.25})`;
          ctx.arc(p.x, p.y, p.length, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [hasPrecipitation, precipitationType, intensity]);

  return (
    <div
      className="fixed inset-0 pointer-events-none transition-all duration-1000 -z-10"
      style={{
        background: gradient,
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />
      <div className="absolute inset-0 bg-radial-vignette opacity-40 mix-blend-multiply" />
    </div>
  );
};
