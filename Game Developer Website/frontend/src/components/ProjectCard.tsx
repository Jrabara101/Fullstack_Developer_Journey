import React, { useState, useRef } from 'react';
import { GameProject } from '../types';
import { useTrailerStage } from '../hooks/useTrailerStage';
import { GenerativeTrailerCanvas } from './GenerativeTrailerCanvas';
import { 
  Play, 
  ExternalLink, 
  Github, 
  Layers, 
  Cpu, 
  Code2, 
  Activity, 
  Eye, 
  Sparkles,
  Flame
} from 'lucide-react';

interface ProjectCardProps {
  project: GameProject;
  xrayMode: boolean;
  onLaunchDemo: (project: GameProject) => void;
  onSelectProject: (project: GameProject) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  xrayMode,
  onLaunchDemo,
  onSelectProject,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);

  const {
    videoRef,
    containerRef,
    currentTime,
    duration,
    activeChapter,
    seekTo,
    handleTimeUpdate,
  } = useTrailerStage({
    chapters: project.chapters,
    autoPlay: isHovered,
    videoUrl: project.heroTrailerUrl,
  });

  const getEngineColor = (engine: string) => {
    switch (engine) {
      case 'Godot': return 'text-[#478cbf] border-[#478cbf]/40 bg-[#478cbf]/10';
      case 'Unity': return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
      case 'Unreal': return 'text-purple-400 border-purple-500/40 bg-purple-500/10';
      case 'WebGL / TypeScript': return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
      default: return 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10';
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative rounded-2xl bg-[#0d111a] border transition-all duration-300 flex flex-col overflow-hidden shadow-xl ${
        xrayMode
          ? 'border-emerald-500/50 shadow-[0_0_20px_-3px_rgba(16,185,129,0.2)]'
          : 'border-slate-800/90 hover:border-cyan-500/50 hover:shadow-cyan-500/10'
      }`}
    >
      {/* Video Preview / Generative Micro-Reel Stage */}
      <div className="relative w-full aspect-[16/9] bg-black overflow-hidden">
        {/* Video or Generative fallback */}
        {!hasVideoError ? (
          <video
            ref={videoRef}
            src={project.heroTrailerUrl}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loop
            muted
            playsInline
            onTimeUpdate={handleTimeUpdate}
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

        {/* Hover Micro-Reel Indicator */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getEngineColor(project.engine)} backdrop-blur-sm`}>
            {project.engine}
          </span>
          <span className="px-2 py-0.5 rounded bg-black/70 border border-slate-700 text-[10px] font-mono text-slate-300">
            {project.releaseStatus}
          </span>
        </div>

        {/* X-Ray Debug Layer Overlay */}
        {xrayMode && (
          <div className="absolute inset-0 z-20 bg-emerald-950/20 border-2 border-dashed border-emerald-400/60 p-3 flex flex-col justify-between font-mono pointer-events-none">
            <div className="flex justify-between items-start text-[10px] text-emerald-400 bg-black/80 px-2 py-1 rounded border border-emerald-500/30">
              <span>HITBOX_BOUNDS: AABB</span>
              <span>STATE: IDLE_RUN</span>
            </div>
            <div className="flex justify-between items-end text-[9px] text-emerald-300 bg-black/80 px-2 py-1 rounded border border-emerald-500/30">
              <span>DRAW CALLS: {project.mechanics[0]?.telemetryStats.drawCalls || 14}</span>
              <span>MEM: {project.mechanics[0]?.telemetryStats.memoryFootprintMb || 4.2} MB</span>
            </div>
          </div>
        )}

        {/* Instant Hover Scrub Chapter Strip */}
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 flex flex-col gap-1.5 opacity-90 transition-opacity">
          {/* Chapter Markers */}
          <div className="flex items-center gap-1 w-full">
            {project.chapters.map((ch, idx) => {
              const isChapterActive = activeChapter?.title === ch.title;
              return (
                <button
                  key={ch.id || idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    seekTo(ch.timestampSec);
                  }}
                  className={`flex-1 h-1.5 rounded-full transition-all ${
                    isChapterActive ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-slate-700 hover:bg-slate-500'
                  }`}
                  title={`${ch.title} (${ch.timestampSec}s)`}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
            <span className="truncate max-w-[200px] text-cyan-300">
              {activeChapter?.title || project.chapters[0]?.title || 'Overview'}
            </span>
            <span className="text-[10px] text-slate-400">
              {Math.floor(currentTime)}s / {Math.floor(duration || 60)}s
            </span>
          </div>
        </div>

        {/* Play Slice Floating Action Button */}
        <button
          onClick={() => onLaunchDemo(project)}
          className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-cyan-500/90 hover:bg-cyan-400 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100 shadow-xl shadow-cyan-500/30 z-30"
          title="Launch Interactive In-Browser Demo"
        >
          <Play className="w-5 h-5 fill-black ml-0.5" />
        </button>
      </div>

      {/* Card Content & Dossier */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-display font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">
              {project.title}
            </h3>
            {project.telemetryStats && (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded shrink-0">
                {project.telemetryStats.avgFps} FPS Avg
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
            {project.tagline}
          </p>

          {/* Role & Engineering Spec Pills */}
          <div className="flex flex-wrap gap-1.5 mb-3 text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              {project.role}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              {project.developmentDuration}
            </span>
          </div>

          {/* X-Ray Mode Extended Telemetry Box (Shown when X-Ray is ON) */}
          {xrayMode && (
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 font-mono text-[11px] text-emerald-300 space-y-1 my-2">
              <div className="font-bold flex items-center gap-1 text-emerald-400">
                <Cpu className="w-3.5 h-3.5" />
                ARCHITECTURE TELEMETRY
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Physics Budget:</span>
                <span className="text-emerald-400">1.45 ms / step</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>HFSM State Nodes:</span>
                <span className="text-cyan-400">14 States • 28 Transitions</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Shader ALU / TEX:</span>
                <span className="text-amber-400">84 ALU • 6 TEX Steps</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <button
            onClick={() => onLaunchDemo(project)}
            className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            Play Slice
          </button>

          <div className="flex items-center gap-2">
            {project.externalLinks.github && (
              <a
                href={project.externalLinks.github}
                target="_blank"
                rel="noreferrer"
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="View Source on GitHub"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
            )}
            {project.externalLinks.steam && (
              <a
                href={project.externalLinks.steam}
                target="_blank"
                rel="noreferrer"
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="View on Steam"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
