import { useState, useEffect, useRef, useCallback } from 'react';
import { TrailerChapter } from '../types';

interface UseTrailerStageOptions {
  chapters?: TrailerChapter[];
  autoPlay?: boolean;
  videoUrl?: string;
  onTimeUpdate?: (currentTime: number) => void;
}

export function useTrailerStage({
  chapters = [],
  autoPlay = true,
  videoUrl,
  onTimeUpdate,
}: UseTrailerStageOptions = {}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(60);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [isIntersecting, setIsIntersecting] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [hasVideoError, setHasVideoError] = useState<boolean>(false);

  // IntersectionObserver for lazy hydration
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsIntersecting(entry.isIntersecting);
        if (videoRef.current) {
          if (entry.isIntersecting && autoPlay) {
            videoRef.current.play().catch(() => {});
            setIsPlaying(true);
          } else {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [autoPlay]);

  // Video time update listener & active chapter resolver
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);
    if (onTimeUpdate) onTimeUpdate(time);

    // Resolve active chapter
    if (chapters.length > 0) {
      let resolvedIndex = 0;
      for (let i = chapters.length - 1; i >= 0; i--) {
        if (time >= chapters[i].timestampSec) {
          resolvedIndex = i;
          break;
        }
      }
      setActiveChapterIndex(resolvedIndex);
    }
  }, [chapters, onTimeUpdate]);

  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 60);
  }, []);

  const seekTo = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    const clamped = Math.max(0, Math.min(seconds, duration));
    videoRef.current.currentTime = clamped;
    setCurrentTime(clamped);
  }, [duration]);

  const seekToChapter = useCallback(
    (index: number) => {
      if (chapters[index]) {
        seekTo(chapters[index].timestampSec);
        setActiveChapterIndex(index);
      }
    },
    [chapters, seekTo]
  );

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  // Keyboard navigation shortcuts [J], [K], [L], Left/Right
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'j' || e.key === 'J' || e.key === 'ArrowLeft') {
        seekTo(currentTime - 5);
      } else if (e.key === 'l' || e.key === 'L' || e.key === 'ArrowRight') {
        seekTo(currentTime + 5);
      } else if (e.key === 'k' || e.key === 'K') {
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, seekTo, togglePlay]);

  return {
    videoRef,
    containerRef,
    isPlaying,
    currentTime,
    duration,
    activeChapterIndex,
    activeChapter: chapters[activeChapterIndex] || null,
    isIntersecting,
    isMuted,
    hasVideoError,
    setHasVideoError,
    seekTo,
    seekToChapter,
    togglePlay,
    toggleMute,
    handleTimeUpdate,
    handleLoadedMetadata,
  };
}
