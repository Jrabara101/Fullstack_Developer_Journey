import React, { useState } from 'react';
import { MechanicBreakdown } from '../types';
import { MechanicSandboxCanvas, MechanicSandboxParams } from '../demos/MechanicSandboxCanvas';
import { 
  Sliders, 
  Code2, 
  Sparkles, 
  SplitSquareVertical, 
  Activity, 
  Layers, 
  Check, 
  RefreshCw 
} from 'lucide-react';

interface MechanicDissectorLabProps {
  mechanics: MechanicBreakdown[];
  xrayMode: boolean;
}

export const MechanicDissectorLab: React.FC<MechanicDissectorLabProps> = ({
  mechanics,
  xrayMode,
}) => {
  const [selectedMechanicIndex, setSelectedMechanicIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'simulation' | 'splitcurtain' | 'code'>('simulation');

  // Split-curtain slider position (0% to 100%)
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  // Live Game Juice Parameters
  const [params, setParams] = useState<MechanicSandboxParams>({
    coyoteTimeMs: 150,
    jumpBufferMs: 120,
    hitStopMs: 80,
    screenShakeIntensity: 75,
    squashStretch: true,
    particlePooling: true,
    raycastDebug: true,
  });

  // Real-time telemetry from sandbox canvas
  const [telemetry, setTelemetry] = useState({
    frameBudgetMs: 1.45,
    drawCalls: 18,
    activeParticles: 0,
  });

  const currentMechanic = mechanics[selectedMechanicIndex] || mechanics[0];

  const handleSliderMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingSlider && e.type !== 'click') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const pos = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSliderPosition(pos);
  };

  const resetDefaults = () => {
    setParams({
      coyoteTimeMs: 150,
      jumpBufferMs: 120,
      hitStopMs: 80,
      screenShakeIntensity: 75,
      squashStretch: true,
      particlePooling: true,
      raycastDebug: true,
    });
  };

  return (
    <section id="mechanics-lab" className="w-full py-12 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Interactive Game-Feel Laboratory
          </div>
          <h2 className="text-3xl font-bold font-display tracking-wide text-white">
            THE MECHANIC DISSECTOR
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mt-1">
            Audit core gameplay feel systems under the hood. Toggle individual "game juice" parameters in real time or slide between raw greybox hitboxes and polished renders.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('simulation')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'simulation'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Live Juicer
          </button>
          <button
            onClick={() => setActiveTab('splitcurtain')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'splitcurtain'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            Greybox vs Polished
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Architecture & Math
          </button>
        </div>
      </div>

      {/* Main Dissector Card */}
      <div className="rounded-2xl bg-[#0b0e17] border border-slate-800 p-6 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (lg:col-span-7): Interactive Canvas / Split Slider */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {activeTab === 'simulation' && (
              <div className="flex flex-col gap-3">
                <MechanicSandboxCanvas
                  params={params}
                  onStatsUpdate={setTelemetry}
                />

                {/* Real-Time Telemetry Bar */}
                <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col">
                    <span className="text-[10px] text-slate-500">FRAME BUDGET</span>
                    <span className="text-emerald-400 font-bold">{telemetry.frameBudgetMs} ms / 16.6ms</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col">
                    <span className="text-[10px] text-slate-500">DRAW CALLS</span>
                    <span className="text-cyan-400 font-bold">{telemetry.drawCalls} Batch Calls</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col">
                    <span className="text-[10px] text-slate-500">PARTICLE POOL</span>
                    <span className="text-amber-400 font-bold">{telemetry.activeParticles} Active Sparks</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'splitcurtain' && (
              <div className="flex flex-col gap-3">
                <div
                  className="relative w-full aspect-[16/9] rounded-xl overflow-hidden cursor-ew-resize select-none border border-slate-800 bg-black"
                  onMouseDown={() => setIsDraggingSlider(true)}
                  onMouseUp={() => setIsDraggingSlider(false)}
                  onMouseLeave={() => setIsDraggingSlider(false)}
                  onMouseMove={handleSliderMove}
                  onClick={handleSliderMove}
                >
                  {/* Right Image: Polished Lit Render with Bloom */}
                  <img
                    src={currentMechanic.polishedMediaUrl}
                    alt="Polished Render"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/75 border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
                    FINAL LIT RENDER & POST-PROCESSING
                  </div>

                  {/* Left Image: Greybox Blockout & Hitbox Overlay (Clipped) */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${sliderPosition}%` }}
                  >
                    <img
                      src={currentMechanic.greyboxMediaUrl}
                      alt="Greybox Hitboxes"
                      className="absolute inset-0 w-full h-full object-cover filter grayscale contrast-125"
                      style={{ width: '100%', height: '100%', maxWidth: 'none' }}
                    />
                    {/* Simulated Wireframe Hitbox Grid */}
                    <div className="absolute inset-0 bg-emerald-950/20 border-r-2 border-emerald-400 pointer-events-none">
                      <div className="absolute top-1/3 left-1/4 w-28 h-36 border border-dashed border-emerald-400 flex items-center justify-center">
                        <span className="text-[9px] font-mono text-emerald-300 bg-black/60 px-1">
                          AABB_COLLIDER
                        </span>
                      </div>
                    </div>
                    <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/75 border border-emerald-500/40 text-[10px] font-mono text-emerald-300">
                      GREYBOX BLOCKOUT & COLLIDERS
                    </div>
                  </div>

                  {/* Split Handle Divider Line */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_#ffffff] flex items-center justify-center pointer-events-none"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center shadow-lg text-[10px] font-mono text-white">
                      ⇄
                    </div>
                  </div>
                </div>

                <div className="text-center text-xs font-mono text-slate-400">
                  Drag the slider left and right to inspect the transition from greybox blockout to final lit render.
                </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs flex flex-col gap-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                  <span className="text-cyan-400 font-bold uppercase">
                    {currentMechanic.codeSnippet?.language || 'csharp'} Implementation
                  </span>
                  <span>Zero-Allocation Execution</span>
                </div>
                <pre className="p-3 bg-black/70 rounded-lg overflow-x-auto text-emerald-300 leading-relaxed text-[11px]">
                  <code>{currentMechanic.codeSnippet?.code || '// Sub-pixel kinematic sweep code'}</code>
                </pre>
                <p className="text-slate-400 text-xs font-sans leading-relaxed">
                  {currentMechanic.codeSnippet?.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Right Column (lg:col-span-5): Live Parameter Controls */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-bold text-xl text-white">
                    {currentMechanic.title}
                  </h3>
                  <span className="text-xs font-mono text-cyan-400">
                    Discipline: {currentMechanic.discipline}
                  </span>
                </div>
                <button
                  onClick={resetDefaults}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-[11px] font-mono"
                  title="Reset to recommended defaults"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                {currentMechanic.summary}
              </p>

              {/* Parameter Sliders */}
              <div className="space-y-4">
                {/* Coyote Time Slider */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-slate-300 font-semibold">Coyote Grace Window</span>
                    <span className="text-cyan-400 font-bold">{params.coyoteTimeMs} ms</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="250"
                    step="10"
                    value={params.coyoteTimeMs}
                    onChange={(e) => setParams({ ...params, coyoteTimeMs: Number(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">
                    Allows jumping after stepping off platform edge. (Set to 0ms for brutal retro physics).
                  </div>
                </div>

                {/* Jump Buffer Slider */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-slate-300 font-semibold">Jump Input Buffer</span>
                    <span className="text-emerald-400 font-bold">{params.jumpBufferMs} ms</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="10"
                    value={params.jumpBufferMs}
                    onChange={(e) => setParams({ ...params, jumpBufferMs: Number(e.target.value) })}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">
                    Queues jump commands if pressed right before landing. Eliminates "eaten jump" inputs.
                  </div>
                </div>

                {/* Hit-Stop Freeze Slider */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-slate-300 font-semibold">Hit-Stop Freeze Frame</span>
                    <span className="text-amber-400 font-bold">{params.hitStopMs} ms</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="150"
                    step="10"
                    value={params.hitStopMs}
                    onChange={(e) => setParams({ ...params, hitStopMs: Number(e.target.value) })}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">
                    Freezes animation ticks on impact to convey visceral kinetic mass.
                  </div>
                </div>

                {/* Screen Shake Slider */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-slate-300 font-semibold">Camera Trauma Shake</span>
                    <span className="text-rose-400 font-bold">{params.screenShakeIntensity} %</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={params.screenShakeIntensity}
                    onChange={(e) => setParams({ ...params, screenShakeIntensity: Number(e.target.value) })}
                    className="w-full accent-rose-400 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">
                    Polynomial rotational camera trauma with exponential decay.
                  </div>
                </div>

                {/* Switches */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => setParams({ ...params, squashStretch: !params.squashStretch })}
                    className={`p-2.5 rounded-lg border text-xs font-mono text-left flex items-center justify-between transition-all ${
                      params.squashStretch
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>Squash & Stretch</span>
                    {params.squashStretch ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <span className="text-[10px]">OFF</span>}
                  </button>

                  <button
                    onClick={() => setParams({ ...params, raycastDebug: !params.raycastDebug })}
                    className={`p-2.5 rounded-lg border text-xs font-mono text-left flex items-center justify-between transition-all ${
                      params.raycastDebug
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>Raycast Vectors</span>
                    {params.raycastDebug ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span className="text-[10px]">OFF</span>}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
