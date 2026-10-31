import React, { useState } from 'react';
import { GameProject } from '../types';
import { useTrailerStage } from '../hooks/useTrailerStage';
import { GenerativeTrailerCanvas } from './GenerativeTrailerCanvas';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  Github, 
  Sparkles, 
  Cpu, 
  Layers, 
  Clock, 
  Users, 
  MessageSquarePlus,
  Flame,
  Activity
} from 'lucide-react';

interface HeroSpotlightStageProps {
  project: GameProject;
  onLaunchDemo: (project: GameProject) => void;
  onOpenFeedback: (project: GameProject, timestampSec: number) => void;
  xrayMode: boolean;
}

export const HeroSpotlightStage: React.FC<HeroSpotlightStageProps> = ({
  project,
  onLaunchDemo,
  onOpenFeedback,
  xrayMode,
}) => {
  const [showVideo, setShowVideo] = useState(true);

  const {
    videoRef,
    containerRef,
    isPlaying,
    currentTime,
    duration,
    activeChapterIndex,
    activeChapter,
    isMuted,
    hasVideoError,
    setHasVideoError,
    seekTo,
    seekToChapter,
    togglePlay,
    toggleMute,
    handleTimeUpdate,
    handleLoadedMetadata,
  } = useTrailerStage({
    chapters: project.chapters,
    autoPlay: true,
    videoUrl: project.heroTrailerUrl,
  });

  const getEngineBadgeColor = (engine: string) => {
    switch (engine) {
      case 'Godot': return 'bg-[#478cbf]/20 text-[#478cbf] border-[#478cbf]/40';
      case 'Unity': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'Unreal': return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'WebGL / TypeScript': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default: return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
    }
  };

  return (
    <section className="relative w-full py-8 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Stage Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            Flagship Production Showcase
          </span>
          <span className={`text-xs font-mono px-2 py-0.5 rounded border ${getEngineBadgeColor(project.engine)}`}>
            {project.engine} 4.x
          </span>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700">
            {project.releaseStatus}
          </span>
        </div>

        {/* Quick Hotkey Guidance */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span>Scrub Video:</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">J</kbd>
          <span>-5s</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">K</kbd>
          <span>Pause</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">L</kbd>
          <span>+5s</span>
        </div>
      </div>

      {/* Main Split 16:9 Showcase Stage */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-2xl bg-slate-950/70 border ${xrayMode ? 'border-emerald-500/60 shadow-[0_0_30px_-5px_rgba(16,185,129,0.25)]' : 'border-slate-800/80'} p-4 lg:p-6 backdrop-blur-xl relative overflow-hidden transition-all`}>
        
        {/* Left 65% (lg:col-span-8): Auto-Playing Chapter-Scrubbable Trailer */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div 
            ref={containerRef}
            className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-black border border-slate-800 group shadow-2xl"
          >
            {/* Real Video or Generative 60FPS Fallback */}
            {!hasVideoError ? (
              <video
                ref={videoRef}
                src={project.heroTrailerUrl}
                className="w-full h-full object-cover"
                loop
                muted={isMuted}
                playsInline
                autoPlay
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onError={() => setHasVideoError(true)}
              />
            ) : (
              <GenerativeTrailerCanvas
                title={project.title}
                engine={project.engine}
                chapterTitle={activeChapter?.title}
                timestampSec={currentTime}
              />
            )}

            {/* X-Ray Debug Overlay inside the Trailer (When X-Ray active) */}
            {xrayMode && (
              <div className="absolute inset-0 pointer-events-none z-20 border-2 border-emerald-500/60 bg-emerald-950/10 flex flex-col justify-between p-4">
                <div className="flex justify-between items-start font-mono text-[10px] text-emerald-400 bg-black/80 p-2 rounded border border-emerald-500/40">
                  <div>
                    <span className="font-bold">ENGINE TELEMETRY OVERLAY // GODOT CORE</span>
                    <div>Physics Tick: 60Hz Fixed • Swept AABB Continuous CCD: ON</div>
                    <div>State Node: {activeChapterIndex === 1 ? 'BOSS_OVERSEER_TELEGRAPH' : 'PLAYER_KINEMATIC_MOVE'}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-300 font-bold">16.6ms • 60.0 FPS</span>
                    <div>Draw Calls: 18 • Buffers: 4.2 MB</div>
                  </div>
                </div>

                {/* Simulated Wireframe Hitbox Reticle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-36 border border-dashed border-emerald-400/70 pointer-events-none flex items-center justify-center">
                  <span className="text-[9px] font-mono text-emerald-400 bg-black/60 px-1">
                    ACTIVE_HURTBOX_AABB
                  </span>
                </div>

                <div className="font-mono text-[9px] text-emerald-300/80 bg-black/60 px-2 py-1 rounded w-fit">
                  [X-RAY DEBUG LAYER ACTIVE] Frame Pacing Stability: 99.8%
                </div>
              </div>
            )}

            {/* Floating Top Trailer Badges */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-black/75 backdrop-blur border border-slate-700/80 text-[10px] font-mono text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                LIVE 60FPS REEL
              </span>
              <span className="px-2.5 py-1 rounded bg-cyan-950/80 backdrop-blur border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
                {activeChapter ? activeChapter.title : 'Overview'}
              </span>
            </div>

            {/* Video Controls Overlay on Hover */}
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col gap-2 opacity-95 transition-opacity">
              {/* Scrubbing Timeline Progress Bar */}
              <div 
                className="relative w-full h-2.5 bg-slate-800/80 rounded-full cursor-pointer hover:h-3.5 transition-all overflow-hidden"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  seekTo(pos * duration);
                }}
              >
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                  style={{ width: `${(currentTime / (duration || 60)) * 100}%` }}
                />

                {/* Chapter Ticks on Timeline */}
                {project.chapters.map((ch, idx) => {
                  const pct = (ch.timestampSec / (duration || 60)) * 100;
                  return (
                    <div
                      key={ch.id || idx}
                      className="absolute top-0 bottom-0 w-1 bg-white/70 hover:w-1.5 hover:bg-cyan-300 transition-all z-20"
                      style={{ left: `${pct}%` }}
                      title={`${ch.title} (${ch.timestampSec}s)`}
                    />
                  );
                })}
              </div>

              {/* Bottom Control Buttons */}
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-1.5 rounded hover:bg-slate-800 transition-colors text-white"
                    title={isPlaying ? 'Pause [K]' : 'Play [K]'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-cyan-400" />}
                  </button>
                  <button
                    onClick={toggleMute}
                    className="p-1.5 rounded hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                  </button>
                  <span className="text-[11px] text-slate-400">
                    {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60) < 10 ? '0' : '')}{Math.floor(currentTime % 60)} / {Math.floor((duration || 60) / 60)}:{(Math.floor((duration || 60) % 60) < 10 ? '0' : '')}{Math.floor((duration || 60) % 60)}
                  </span>
                </div>

                {/* Leave Timestamped Feedback CTA */}
                <button
                  onClick={() => onOpenFeedback(project, Math.round(currentTime))}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-[11px] text-cyan-300 transition-all hover:border-cyan-500/40"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Pin Note @ {Math.floor(currentTime)}s</span>
                </button>
              </div>
            </div>
          </div>

          {/* Discrete Chapter Navigation Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {project.chapters.map((ch, idx) => {
              const isActive = activeChapterIndex === idx;
              return (
                <button
                  key={ch.id || idx}
                  onClick={() => seekToChapter(idx)}
                  className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                    isActive
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-cyan-400">
                      CH {idx + 1}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">
                      {Math.floor(ch.timestampSec / 60)}:{(ch.timestampSec % 60 < 10 ? '0' : '')}{ch.timestampSec % 60}
                    </span>
                  </div>
                  <div className="text-xs font-semibold truncate leading-tight">
                    {ch.title.replace(/^\d+:\d+\s*/, '')}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Chapter Deep-Dive Note */}
          {activeChapter && (
            <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white mr-1.5">{activeChapter.title}:</span>
                <span className="text-slate-400">{activeChapter.description}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right 35% (lg:col-span-4): Technical Dossier & Launch Demo CTA */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-bold font-display tracking-wide text-white mb-1">
                {project.title}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {project.tagline}
              </p>
            </div>

            {/* Launch Playable Demo CTA */}
            <button
              onClick={() => onLaunchDemo(project)}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-display font-bold text-base tracking-wider flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/25 transform hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Play className="w-5 h-5 fill-black" />
              <span>LAUNCH PLAYABLE DEMO SLICE</span>
            </button>

            {/* Role & Spec Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-0.5">
                  <Users className="w-3 h-3 text-cyan-400" />
                  TEAM & DURATION
                </div>
                <div className="font-semibold text-slate-200">
                  {project.teamSize} Devs • {project.developmentDuration}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-0.5">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  TARGET PERFORMANCE
                </div>
                <div className="font-semibold text-emerald-400">
                  60 FPS Locked • 1.45ms
                </div>
              </div>
            </div>

            {/* Engineering Highlights */}
            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
              <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                Architectural Milestones
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 font-sans">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>Continuous Swept AABB collision detection</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Zero-allocation particle pooling (10k sparks)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                  <span>Deterministic 4-frame parry window matrix</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>Screen-space temporal dilation shockwave shader</span>
                </li>
              </ul>
            </div>
          </div>

          {/* External Links Bar */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <span className="text-slate-500 text-[11px]">Artifact Links:</span>
            <div className="flex items-center gap-2">
              {project.externalLinks.steam && (
                <a
                  href={project.externalLinks.steam}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-cyan-400" />
                  Steam
                </a>
              )}
              {project.externalLinks.github && (
                <a
                  href={project.externalLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <Github className="w-3 h-3 text-slate-300" />
                  Code
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
