import React, { useState, useEffect, useRef } from 'react';
import { GameProject } from '../types';
import { ChronoShiftSliceCanvas } from '../demos/ChronoShiftSliceCanvas';
import { 
  X, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Gamepad, 
  Keyboard, 
  Activity, 
  Gauge, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface PlayableSliceModalProps {
  project: GameProject | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PlayableSliceModal: React.FC<PlayableSliceModalProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  const [fps, setFps] = useState<number>(60);
  const [frameTimeMs, setFrameTimeMs] = useState<number>(16.6);
  const [entitiesCount, setEntitiesCount] = useState<number>(24);
  const [gamepadConnected, setGamepadConnected] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [keyReset, setKeyReset] = useState<number>(0);
  const [sessionStartTime] = useState<number>(Date.now());
  const sparklineCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameHistoryRef = useRef<number[]>(new Array(40).fill(16.6));

  // Telemetry updates from canvas
  const handleTelemetryUpdate = (data: { fps: number; frameTimeMs: number; entitiesCount: number; gamepadConnected: boolean }) => {
    setFps(data.fps);
    setFrameTimeMs(data.frameTimeMs);
    setEntitiesCount(data.entitiesCount);
    setGamepadConnected(data.gamepadConnected);

    // Update sparkline buffer
    frameHistoryRef.current.push(data.frameTimeMs);
    if (frameHistoryRef.current.length > 40) {
      frameHistoryRef.current.shift();
    }
  };

  // Draw Sparkline Graph
  useEffect(() => {
    if (!isOpen) return;
    const canvas = sparklineCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const history = frameHistoryRef.current;
      const w = canvas.width;
      const h = canvas.height;

      // 16.6ms Target Baseline (Green line)
      const targetY = h - (16.6 / 33.3) * h;
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(0, targetY);
      ctx.lineTo(w, targetY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Sparkline Graph
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const step = w / (history.length - 1);
      history.forEach((val, i) => {
        const y = Math.max(2, Math.min(h - 2, h - (val / 33.3) * h));
        if (i === 0) ctx.moveTo(0, y);
        else ctx.lineTo(i * step, y);
      });
      ctx.stroke();

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [isOpen]);

  // Log session telemetry to backend when closing
  const handleClose = () => {
    if (project) {
      const durationSeconds = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));
      fetch('/api/telemetry/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          durationSeconds,
          averageFps: fps,
          hardwareRenderer: 'WebGL 2.0 Canvas Engine',
        }),
      }).catch(() => {});
    }
    onClose();
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl bg-[#090c14] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Top Runtime Telemetry Bar */}
        <div className="w-full bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]"></span>
            <div>
              <div className="font-display font-bold text-sm tracking-wide text-white flex items-center gap-2">
                <span>{project.title}</span>
                <span className="text-slate-500 font-mono text-xs">//</span>
                <span className="text-xs font-mono text-cyan-400">PLAYABLE SLICE</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                Engine: {project.engine} • Sandboxed HTML5 WebAssembly/Canvas Container
              </div>
            </div>
          </div>

          {/* Telemetry Sparkline & Metrics */}
          <div className="flex items-center gap-4 text-xs font-mono">
            {/* FPS & Sparkline */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500">FRAME TIME</span>
                <span className="font-bold text-cyan-300">{frameTimeMs} ms</span>
              </div>
              <canvas
                ref={sparklineCanvasRef}
                width={80}
                height={26}
                className="bg-black/50 rounded border border-slate-800"
              />
              <div className="flex flex-col text-right pl-2 border-l border-slate-800">
                <span className="text-[10px] text-slate-500">FPS</span>
                <span className={`font-bold ${fps >= 58 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {fps}
                </span>
              </div>
            </div>

            {/* Input Device Status */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300">
              {gamepadConnected ? (
                <>
                  <Gamepad className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-cyan-300">Gamepad Connected</span>
                </>
              ) : (
                <>
                  <Keyboard className="w-3.5 h-3.5 text-slate-400" />
                  <span>Keyboard Active</span>
                </>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Close Demo"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Playable Canvas Container */}
        <div className="relative flex-1 bg-black flex items-center justify-center p-2 sm:p-4 min-h-[400px]">
          <ChronoShiftSliceCanvas
            key={keyReset}
            onTelemetryUpdate={handleTelemetryUpdate}
            isMuted={isMuted}
          />
        </div>

        {/* Bottom Quick Bar with Controls and Guidance */}
        <div className="w-full bg-slate-950/95 px-4 py-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-cyan-400 font-semibold">Controls:</span>
            <span>[A/D] Move</span>
            <span>•</span>
            <span>[SPACE] Jump (Coyote Grace)</span>
            <span>•</span>
            <span>[SHIFT] Air-Dash</span>
            <span>•</span>
            <span>[J] Attack Target</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setKeyReset((k) => k + 1)}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors"
              title="Reset Player Position"
            >
              <RotateCcw className="w-3 h-3 text-cyan-400" />
              Reset Position
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-cyan-400" />}
              {isMuted ? 'Muted' : 'Sound ON'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
