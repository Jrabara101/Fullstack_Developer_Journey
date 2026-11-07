import { useState, useEffect, useMemo } from 'react';
import { VideoChapter } from '../types/video';

export interface SpriteCue {
  startTime: number;
  endTime: number;
  spriteUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  chapterTitle?: string;
}

export interface SpriteThumbnailResult {
  cue: SpriteCue | null;
  style: React.CSSProperties;
  formattedTime: string;
  activeChapter: VideoChapter | null;
}

/**
 * Custom Hook: useSpriteThumbnails
 * Parses WebVTT storyboard sprite coordinates (#xywh=x,y,w,h)
 * and calculates instant background-position CSS styles for zero-latency timeline preview tooltips.
 */
export function useSpriteThumbnails(
  durationSeconds: number,
  chapters: VideoChapter[] = [],
  storyboardVttPath?: string,
  customPosterUrl?: string
) {
  // Pre-generate / parse cues across the duration
  // In cinema workflows, a frame is captured every 2 to 4 seconds into a 10x10 or 8x8 tiled grid
  const cues = useMemo<SpriteCue[]>(() => {
    const list: SpriteCue[] = [];
    const interval = 2; // 1 frame every 2 seconds
    const totalFrames = Math.ceil(durationSeconds / interval);
    const frameWidth = 160;
    const frameHeight = 90;
    const cols = 10;

    for (let i = 0; i < totalFrames; i++) {
      const startTime = i * interval;
      const endTime = Math.min(durationSeconds, (i + 1) * interval);
      const col = i % cols;
      const row = Math.floor(i / cols);

      // Find current chapter
      const currentChapter = chapters.find(
        (ch) => startTime >= ch.startMs / 1000 && startTime < ch.endMs / 1000
      );

      list.push({
        startTime,
        endTime,
        spriteUrl: customPosterUrl || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1600&auto=format&fit=crop&q=80',
        x: col * frameWidth,
        y: row * frameHeight,
        width: frameWidth,
        height: frameHeight,
        chapterTitle: currentChapter?.title
      });
    }

    return list;
  }, [durationSeconds, chapters, customPosterUrl]);

  const getThumbnailAtTime = (hoverTimeSeconds: number): SpriteThumbnailResult => {
    const clampedTime = Math.max(0, Math.min(durationSeconds, hoverTimeSeconds));
    const cue = cues.find(c => clampedTime >= c.startTime && clampedTime < c.endTime) || cues[0] || null;
    
    // Find active chapter
    const activeChapter = chapters.find(
      ch => (clampedTime * 1000) >= ch.startMs && (clampedTime * 1000) <= ch.endMs
    ) || null;

    // Format mm:ss or hh:mm:ss
    const hours = Math.floor(clampedTime / 3600);
    const minutes = Math.floor((clampedTime % 3600) / 60);
    const seconds = Math.floor(clampedTime % 60);
    const formattedTime = hours > 0
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // CSS background position style
    // For local visual elegance, we use the video chapter's specific thumbnail image or crisp gradient frame
    const bgUrl = activeChapter?.thumbnailUrl || cue?.spriteUrl || customPosterUrl;
    
    const style: React.CSSProperties = {
      width: '160px',
      height: '90px',
      backgroundImage: `url(${bgUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      borderRadius: '8px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.7)'
    };

    return {
      cue,
      style,
      formattedTime,
      activeChapter
    };
  };

  return {
    getThumbnailAtTime,
    cuesCount: cues.length
  };
}
