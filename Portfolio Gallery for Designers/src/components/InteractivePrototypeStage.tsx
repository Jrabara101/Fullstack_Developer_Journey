import React, { useEffect, useState } from 'react';
import type { ComputedArtifactMeta } from '../types/portfolio';

interface InteractivePrototypeStageProps {
  meta: ComputedArtifactMeta;
}

export const InteractivePrototypeStage: React.FC<InteractivePrototypeStageProps> = ({ meta }) => {
  const { artifact, maxPrint300Dpi } = meta;
  const protoType = artifact.designManifest?.interactivePrototypeType;

  // Audio OS state
  const [dialValue, setDialValue] = useState(64);
  const [spatialProfile, setSpatialProfile] = useState<'Nearfield' | 'Spatial' | 'Mono'>('Spatial');

  // Issue Engine state
  const [issues, setIssues] = useState([
    { id: 'LIN-102', title: 'Refactor spatial indexing pipeline', priority: 'P1', status: 'In Progress' },
    { id: 'LIN-108', title: 'Calibrate darkroom contrast tokens', priority: 'P2', status: 'Backlog' },
    { id: 'LIN-115', title: 'Optimize command palette latency (<16ms)', priority: 'P1', status: 'Done' },
    { id: 'LIN-121', title: 'Support keyboard chord triage flow', priority: 'P3', status: 'Backlog' },
  ]);

  // Field Recorder state
  const [gainDb, setGainDb] = useState(12);
  const [recordingActive, setRecordingActive] = useState(true);
  const [phaseTick, setPhaseTick] = useState(0);

  // Watch Dial state
  const [secondsAngle, setSecondsAngle] = useState(142);

  useEffect(() => {
    if (protoType !== 'field-recorder' && protoType !== 'watch-dial' && protoType !== 'audio-os') {
      return;
    }
    const id = window.setInterval(() => {
      setPhaseTick((t) => t + 0.14);
      if (protoType === 'watch-dial') {
        setSecondsAngle((a) => (a + 0.75) % 360);
      }
    }, 125);
    return () => window.clearInterval(id);
  }, [protoType]);

  // 1. Aether Spatial Audio OS Interactive Hardware Prototype
  if (protoType === 'audio-os') {
    const wavePoints = Array.from({ length: 48 }).map((_, i) => {
      const x = (i / 47) * 280;
      const amp = (dialValue / 100) * (spatialProfile === 'Spatial' ? 24 : spatialProfile === 'Nearfield' ? 15 : 8);
      const y = 36 + Math.sin(i * 0.35 + phaseTick) * Math.sin((i / 47) * Math.PI) * amp;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return (
      <div className="w-full max-w-[780px] mx-auto rounded-[16px] bg-gradient-to-b from-[#DFDDD6] to-[#C8C5BD] p-5 sm:p-8 shadow-2xl border border-white/25 text-[#181816]">
        <div className="flex flex-col sm:flex-row items-stretch gap-6 bg-[#141518] rounded-[12px] p-5 sm:p-6 border border-black/40 text-[#EAE8E3]">
          {/* Interactive OLED Canvas */}
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[20px] font-medium tracking-tight">Aether</div>
                <div className="text-[12px] text-white/55">Autonomous Audio OS • Interactive Demo</div>
              </div>
              <div className="flex gap-1.5">
                {(['Nearfield', 'Spatial', 'Mono'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSpatialProfile(mode)}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono-catalog uppercase cursor-pointer transition-colors ${
                      spatialProfile === mode
                        ? 'bg-white text-[#141518]'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="my-5 py-2 border-y border-white/10">
              <svg viewBox="0 0 280 72" className="w-full h-[76px]">
                <line x1="0" y1="36" x2="280" y2="36" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
                <path d={wavePoints} fill="none" stroke="#EAE8E3" strokeWidth="1.6" />
                <path
                  d={wavePoints}
                  fill="none"
                  stroke="rgba(234,232,227,0.35)"
                  strokeWidth="1"
                  transform="translate(0, 4)"
                />
              </svg>
            </div>

            <div className="flex items-center justify-between font-mono-catalog text-[11px]">
              <span>00:03:14 // PROFILE: {spatialProfile.toUpperCase()}</span>
              <span className="inline-flex items-center gap-1.5 text-white">
                <span className="w-2 h-2 rounded-full bg-[#D93829]" />
                ACTIVE ({dialValue}%)
              </span>
            </div>
          </div>

          {/* Interactive Knurled Rotary Dial */}
          <div className="sm:w-[190px] flex flex-col items-center justify-center border-t sm:border-t-0 sm:border-l border-white/10 pt-5 sm:pt-0 sm:pl-6">
            <div
              className="w-28 h-28 rounded-full bg-gradient-to-br from-[#EAE8E3] via-[#BDBAB2] to-[#8C8982] shadow-lg flex items-center justify-center relative border border-white/40"
              style={{ transform: `rotate(${(dialValue - 50) * 2.4}deg)` }}
            >
              <div className="w-1.5 h-3.5 rounded-full bg-[#141518] absolute top-2.5" />
              <span className="font-mono-catalog text-[11px] text-[#181816] font-medium" style={{ transform: `rotate(${-(dialValue - 50) * 2.4}deg)` }}>
                {dialValue} dB
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={dialValue}
              onChange={(e) => setDialValue(Number(e.target.value))}
              aria-label="Adjust spatial encoder gain"
              className="mt-4 w-32 accent-[#D93829] cursor-pointer"
            />
            <span className="font-mono-catalog text-[10px] uppercase tracking-[0.08em] text-white/50 mt-1">
              Rotate Encoder
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Linearis Interactive Issue Backlog Prototype
  if (protoType === 'issue-engine') {
    const cycleStatus = (id: string) => {
      const order = ['Backlog', 'In Progress', 'Done'];
      setIssues((prev) =>
        prev.map((row) =>
          row.id === id
            ? { ...row, status: order[(order.indexOf(row.status) + 1) % order.length] }
            : row
        )
      );
    };

    return (
      <div className="w-full max-w-[760px] mx-auto rounded-[12px] bg-[#0E1117] border border-white/15 shadow-2xl overflow-hidden text-[#DCE3F2]">
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#131720]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#2F63E2]" />
            <span className="font-medium text-[13px]">Linearis // Interactive Backlog</span>
          </div>
          <span className="font-mono-catalog text-[10px] uppercase tracking-[0.08em] text-white/50">
            Click any status pill to cycle state
          </span>
        </div>
        <div className="divide-y divide-white/8">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="font-mono-catalog text-[11px] text-white/45 w-16 shrink-0">
                  {issue.id}
                </span>
                <span className="text-[13px] truncate">{issue.title}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono-catalog text-[10px] px-2 py-0.5 rounded bg-[#1B3B82]/60 text-[#9DB8F7] border border-[#2F63E2]/40">
                  {issue.priority}
                </span>
                <button
                  type="button"
                  onClick={() => cycleStatus(issue.id)}
                  className="font-mono-catalog text-[11px] px-2.5 py-1 rounded-full border border-white/15 hover:border-white/40 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      issue.status === 'Done'
                        ? 'bg-emerald-400'
                        : issue.status === 'In Progress'
                        ? 'bg-[#2F63E2]'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span>{issue.status}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. Vesper Handheld 9:16 Field Recorder Interactive Prototype
  if (protoType === 'field-recorder') {
    const scopePath = Array.from({ length: 40 })
      .map((_, i) => {
        const x = (i / 39) * 200;
        const amp = recordingActive ? gainDb * 1.4 : 2;
        const y = 45 + Math.sin(i * 0.4 + phaseTick * 1.6) * Math.sin((i / 39) * Math.PI) * amp;
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    return (
      <div className="w-[290px] mx-auto rounded-[24px] bg-[#17181B] border border-white/18 p-5 shadow-2xl text-[#E5DFD5]">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="font-mono-catalog text-[10px] tracking-[0.12em] uppercase text-white/60">
            VESPER // XY-01
          </div>
          <button
            type="button"
            onClick={() => setGainDb((g) => (g === 6 ? 12 : g === 12 ? 18 : 6))}
            className="w-11 h-11 rounded-full bg-gradient-to-br from-[#D9B56F] to-[#8C6D32] text-[#141416] font-mono-catalog text-[10px] font-bold flex items-center justify-center shadow-md cursor-pointer"
            title="Click brass dial to step gain"
          >
            +{gainDb}
          </button>
        </div>
        <div className="my-5 rounded-[10px] bg-black border border-white/10 p-4">
          <svg viewBox="0 0 200 90" className="w-full h-[110px]">
            <line x1="0" y1="45" x2="200" y2="45" stroke="rgba(217,130,43,0.22)" />
            <path d={scopePath} fill="none" stroke="#D9822B" strokeWidth="1.8" />
          </svg>
          <div className="mt-3 font-mono-catalog text-[12px] text-[#D9822B] text-center">
            {recordingActive ? 'REC 00:42:18' : 'PAUSED // STANDBY'}
          </div>
          <div className="font-mono-catalog text-[9px] text-white/45 text-center mt-1">
            GAIN +{gainDb}DB • 24-BIT / 96KHZ
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setRecordingActive((r) => !r)}
            className="flex-1 py-2 rounded-full bg-[#D9822B]/20 border border-[#D9822B]/50 text-[#F3B065] font-mono-catalog text-[10px] uppercase tracking-[0.08em] cursor-pointer"
          >
            {recordingActive ? 'Pause Tape' : 'Resume Rec'}
          </button>
          <button
            type="button"
            onClick={() => setGainDb((g) => (g === 6 ? 12 : g === 12 ? 18 : 6))}
            className="px-3 py-2 rounded-full border border-white/15 font-mono-catalog text-[10px] uppercase cursor-pointer"
          >
            Step Gain
          </button>
        </div>
      </div>
    );
  }

  // 4. Chronos Live Kinetic Watchface Prototype
  if (protoType === 'watch-dial') {
    return (
      <div className="flex flex-col items-center">
        <div className="w-[310px] h-[310px] rounded-full bg-gradient-to-br from-[#3A3D45] to-[#121316] p-3 shadow-2xl border border-white/15 flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-[#0E0F12] relative flex items-center justify-center border border-white/10">
            <span className="absolute top-12 font-sans-ui text-[10px] tracking-[0.28em] text-white/85 font-semibold">
              CHRONOS
            </span>
            <span className="absolute top-16 font-mono-catalog text-[8px] tracking-[0.2em] text-white/40">
              28,800 VPH LIVE
            </span>
            {/* 12 indices */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute inset-3"
                style={{ transform: `rotate(${i * 30}deg)` }}
              >
                <div className="w-[2px] h-3 bg-[#EAE6DD] mx-auto" />
              </div>
            ))}
            {/* Hour & Minute hands */}
            <div
              className="absolute w-1.5 h-20 bg-[#EAE6DD] rounded-full origin-bottom"
              style={{ bottom: '50%', transform: 'rotate(-56deg)' }}
            />
            <div
              className="absolute w-1 h-28 bg-white rounded-full origin-bottom"
              style={{ bottom: '50%', transform: 'rotate(52deg)' }}
            />
            {/* Live sweeping brass seconds hand */}
            <div
              className="absolute w-[2px] h-32 bg-[#C88D32] origin-bottom"
              style={{ bottom: '50%', transform: `rotate(${secondsAngle}deg)` }}
            />
            <div className="w-3.5 h-3.5 rounded-full bg-[#C88D32] z-10 border border-[#0E0F12]" />
          </div>
        </div>
      </div>
    );
  }

  // 5. Default Tactile Open Steidl-Style Monograph Spread Mockup for Photography & Print Brand works
  return (
    <div className="w-full max-w-[880px] mx-auto p-6 sm:p-10 rounded-[12px] bg-[#1E1F22] border border-white/10 shadow-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 bg-[#F5F2EB] text-[#181816] shadow-[0_24px_64px_rgba(0,0,0,0.55)] overflow-hidden">
        {/* Left Verso Colophon Page */}
        <div className="p-6 sm:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#181816]/12">
          <div className="flex items-center justify-between font-mono-catalog text-[10px] tracking-[0.08em] uppercase text-[#5C5A55] pb-3 border-b border-[#181816]/12">
            <span>PLATE {artifact.catalogNumber}</span>
            <span>{artifact.location.toUpperCase()} • {artifact.year}</span>
          </div>

          <div className="my-8">
            <h3 className="font-serif-display text-[32px] leading-[1.1] text-[#181816]">
              {artifact.title}
            </h3>
            <p className="case-study-lead text-[16px] text-[#5C5A55] mt-3">
              {artifact.subtitle}
            </p>
            <p className="text-[13px] leading-[1.65] text-[#5C5A55] mt-4">
              {artifact.photoSpec?.humanizedNote ?? artifact.story.snapshot.outcome}
            </p>
          </div>

          <div className="pt-3 border-t border-[#181816]/12 font-mono-catalog text-[10px] uppercase tracking-[0.06em] text-[#8C8982] flex justify-between">
            <span>{artifact.photoSpec?.archivePaper ?? 'Munken Polar Rough 150gsm'}</span>
            <span>{maxPrint300Dpi ? maxPrint300Dpi.formattedIn : artifact.aspectRatioLabel}</span>
          </div>
        </div>

        {/* Right Recto Tipped-In Plate Page */}
        <div className="p-6 sm:p-10 bg-[#EFECE4] flex items-center justify-center">
          <img
            src={artifact.imageUrl}
            alt={artifact.title}
            className="max-h-[420px] max-w-full w-auto h-auto object-contain shadow-[0_6px_20px_rgba(0,0,0,0.16)]"
          />
        </div>
      </div>
    </div>
  );
};

