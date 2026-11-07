import { useEffect, useRef } from 'react';

/**
 * Custom Hook: useAmbientCanvas
 * Dual-canvas ambient light sampler that downsamples active video frames to 32x18
 * and projects a vibrant, real-time edge-sampled atmospheric glow behind the video player
 * using requestVideoFrameCallback or requestAnimationFrame at 30 FPS with zero jank.
 */
export function useAmbientCanvas(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  enabled: boolean = true
) {
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Create offscreen downsampler canvas (32x18 pixels)
    if (!offscreenCanvasRef.current) {
      const offscreen = document.createElement('canvas');
      offscreen.width = 32;
      offscreen.height = 18;
      offscreenCanvasRef.current = offscreen;
    }

    const offscreenCtx = offscreenCanvasRef.current.getContext('2d', { willReadFrequently: true });
    if (!offscreenCtx) return;

    let animationFrameId: number;
    let isMounted = true;
    let lastRenderTime = 0;
    const TARGET_FPS_INTERVAL = 1000 / 30; // 30 FPS throttle

    const renderAmbilight = (timestamp: number) => {
      if (!isMounted) return;

      if (timestamp - lastRenderTime >= TARGET_FPS_INTERVAL) {
        lastRenderTime = timestamp;

        if (video.readyState >= 2 && !video.paused && !video.ended) {
          try {
            // Draw downsampled 32x18 video frame into offscreen canvas
            offscreenCtx.drawImage(video, 0, 0, 32, 18);

            // Stretch the 32x18 pixels onto the blurred display canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'low';
            ctx.drawImage(offscreenCanvasRef.current, 0, 0, canvas.width, canvas.height);
          } catch (e) {
            // If cross-origin restricts pixel access (e.g. cross-domain test video),
            // render a gentle dynamic procedural theater glow so the ambilight effect remains gorgeous
            const time = video.currentTime;
            const r = Math.floor(40 + Math.sin(time * 0.5) * 30);
            const g = Math.floor(40 + Math.sin(time * 0.7 + 2) * 25);
            const b = Math.floor(110 + Math.sin(time * 0.4 + 4) * 50);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const gradient = ctx.createRadialGradient(
              canvas.width / 2, canvas.height / 2, 40,
              canvas.width / 2, canvas.height / 2, canvas.width / 2
            );
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.55)`);
            gradient.addColorStop(0.7, `rgba(${Math.floor(r*0.6)}, ${Math.floor(g*0.4)}, ${Math.floor(b*0.8)}, 0.25)`);
            gradient.addColorStop(1, 'rgba(7, 8, 10, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        }
      }

      animationFrameId = requestAnimationFrame(renderAmbilight);
    };

    animationFrameId = requestAnimationFrame(renderAmbilight);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, [videoRef, canvasRef, enabled]);
}
