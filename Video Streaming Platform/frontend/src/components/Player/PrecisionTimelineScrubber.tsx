import React, { useState, useRef, useMemo, useCallback } from 'react';
import { VideoChapter, HeatmapBucket, TimedComment } from '../../types/video';
import { useSpriteThumbnails } from '../../hooks/useSpriteThumbnails';

interface PrecisionTimelineScrubberProps {
  duration: number;
  currentTime: number;
  bufferedEnd: number;
  chapters: VideoChapter[];
  heatmap: HeatmapBucket[];
  comments: TimedComment[];
  searchMatchTimestamps?: number[]; // Milliseconds of transcript search hits
  onSeek: (seconds: number) => void;
  posterUrl?: string;
  storyboardVttPath?: string;
}

export const PrecisionTimelineScrubber: React.FC<PrecisionTimelineScrubberProps> = ({
  duration,
  currentTime,
  bufferedEnd,
  chapters,
  heatmap,
  comments,
  searchMatchTimestamps = [],
  onSeek,
  posterUrl,
  storyboardVttPath
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverX, setHoverX] = useState(0);
  const [hoverTime, setHoverTime] = useState(0);
  const [isMagneticSnapped, setIsMagneticSnapped] = useState(false);
  const [snappedChapterTitle, setSnappedChapterTitle] = useState<string | null>(null);

  const { getThumbnailAtTime } = useSpriteThumbnails(duration, chapters, storyboardVttPath, posterUrl);

  // Calculate SVG Path for 28px tall "Most Replayed" engagement heatmap wave
  const heatmapSvgPath = useMemo(() => {
    if (!heatmap || heatmap.length === 0) return '';
    const width = 1000;
    const height = 28;
    const points = heatmap.map((bucket, index) => {
      const x = (index / (heatmap.length - 1)) * width;
      // Invert Y so highest score is at the top of the 28px box
      const y = height - (bucket.watchIntensityScore * (height - 3));
      return { x, y };
    });

    if (points.length < 2) return '';

    // Smooth bezier curve generator
    let d = `M 0,${height} L ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      d += ` Q ${p0.x},${p0.y} ${cpX},${(p0.y + p1.y) / 2}`;
    }
    const last = points[points.length - 1];
    d += ` L ${last.x},${last.y} L ${width},${height} Z`;
    return d;
  }, [heatmap]);

  // Handle Mouse Hover & Magnetic Snapping
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current || duration <= 0) return;
    const rect = trackRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, rawX / rect.width));
    let calculatedTime = percentage * duration;

    // Check for magnetic chapter boundary snapping (within 1.2% threshold)
    let snapped = false;
    let chapterName: string | null = null;
    const snapThresholdSeconds = duration * 0.015;

    for (const chapter of chapters) {
      const chapterStartSec = chapter.startMs / 1000;
      if (Math.abs(calculatedTime - chapterStartSec) < snapThresholdSeconds) {
        calculatedTime = chapterStartSec;
        snapped = true;
        chapterName = chapter.title;
        break;
      }
    }

    setIsMagneticSnapped(snapped);
    setSnappedChapterTitle(chapterName);
    setHoverX(rawX);
    setHoverTime(calculatedTime);
  }, [duration, chapters]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current || duration <= 0) return;
    const rect = trackRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, rawX / rect.width));
    const targetTime = isMagneticSnapped ? hoverTime : percentage * duration;
    onSeek(targetTime);
  };

  const preview = getThumbnailAtTime(hoverTime);
  const playedPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercentage = duration > 0 ? (bufferedEnd / duration) * 100 : 0;

  return (
    <div 
      className="relative w-full select-none cursor-pointer group py-2"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setIsMagneticSnapped(false);
        setSnappedChapterTitle(null);
      }}
      onMouseMove={handleMouseMove}
      onClick={handleSeek}
    >
      {/* 1. Engagement Heatmap SVG Wave ("Most Replayed") */}
      <div className="w-full h-7 overflow-hidden pointer-events-none opacity-45 group-hover:opacity-90 transition-opacity duration-200">
        <svg 
          viewBox="0 0 1000 28" 
          preserveAspectRatio="none" 
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="heatmapGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.75" />
              <stop offset="60%" stopColor="#6366F1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path d={heatmapSvgPath} fill="url(#heatmapGradient)" />
        </svg>
      </div>

      {/* 2. Timeline Track Bar (Divided by Chapter Segments) */}
      <div 
        ref={trackRef}
        className="relative w-full h-1.5 group-hover:h-2.5 bg-white/12 rounded-full overflow-visible transition-all duration-200 flex items-center"
      >
        {/* Buffered Range Bar */}
        <div 
          className="absolute top-0 bottom-0 left-0 bg-white/28 rounded-full pointer-events-none transition-all duration-300"
          style={{ width: `${Math.min(100, bufferedPercentage)}%` }}
        />

        {/* Played Progress Bar */}
        <div 
          className="absolute top-0 bottom-0 left-0 bg-indigo-500 rounded-full pointer-events-none z-10 transition-[width] duration-75"
          style={{ width: `${Math.min(100, playedPercentage)}%` }}
        />

        {/* Chapter Break Specular Dividers */}
        {chapters.map((ch, idx) => {
          if (idx === 0) return null;
          const posPercent = (ch.startMs / 1000 / duration) * 100;
          return (
            <div 
              key={ch.id}
              className="absolute top-0 bottom-0 w-[2px] bg-[#07080A] z-20 pointer-events-none"
              style={{ left: `${posPercent}%` }}
            />
          );
        })}

        {/* Timed Comments Avatar / Dot Pins */}
        {comments.map((cm) => {
          const pinPercent = (cm.timestampMs / 1000 / duration) * 100;
          return (
            <div
              key={cm.id}
              title={`@ ${cm.userName}: "${cm.body.slice(0, 40)}..."`}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/80 border border-black z-20 group-hover:scale-125 transition-transform"
              style={{ left: `${pinPercent}%` }}
            />
          );
        })}

        {/* Transcript Search Match Glowing Amber Markers */}
        {searchMatchTimestamps.map((ms, idx) => {
          const matchPercent = (ms / 1000 / duration) * 100;
          return (
            <div
              key={`search-pin-${idx}`}
              title="Search match in spoken dialogue"
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-200 shadow-[0_0_8px_#F59E0B] z-30 animate-pulse pointer-events-none"
              style={{ left: `${matchPercent}%` }}
            />
          );
        })}

        {/* Scrubber Playhead Knob */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-lg border-2 border-indigo-600 z-30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ left: `${playedPercentage}%` }}
        />
      </div>

      {/* 3. Zero-Latency Hover Sprite Preview Tooltip */}
      {isHovering && (
        <div 
          className="absolute bottom-12 -translate-x-1/2 pointer-events-none z-50 flex flex-col items-center animate-fade-in"
          style={{ 
            left: `${Math.max(88, Math.min(hoverX, (trackRef.current?.clientWidth || 300) - 88))}px` 
          }}
        >
          {/* Sprite Frame Box */}
          <div 
            className="w-40 h-[90px] rounded-lg overflow-hidden border border-white/25 shadow-2xl relative bg-black/90"
            style={preview.style}
          >
            {/* Magnetic Chapter Snap Badge */}
            {isMagneticSnapped && (
              <div className="absolute top-1 left-1 right-1 bg-indigo-600/90 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-semibold text-white truncate text-center flex items-center justify-center gap-1 shadow">
                <span>🧲 Snapped</span>
              </div>
            )}
            
            {/* Timecode Badge */}
            <div className="absolute bottom-1 right-1 bg-black/85 backdrop-blur-sm px-1.5 py-0.5 rounded text-[11px] font-mono tabular-nums text-white border border-white/10">
              {preview.formattedTime}
            </div>
          </div>

          {/* Chapter Title Tooltip Subtitle */}
          {(snappedChapterTitle || preview.activeChapter?.title) && (
            <div className="mt-1.5 max-w-[200px] text-center px-2 py-0.5 bg-[#101217]/95 border border-white/15 rounded-md text-[11px] font-medium text-slate-200 truncate shadow-lg">
              {snappedChapterTitle || preview.activeChapter?.title}
            </div>
          )}

          {/* Tooltip Arrow Indicator */}
          <div className="w-2 h-2 bg-[#101217] rotate-45 border-r border-b border-white/15 -mt-1" />
        </div>
      )}
    </div>
  );
};
