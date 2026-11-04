import React, { useState, useEffect, useCallback } from 'react';
import type { Photograph } from '../types';
import { ambientAudio } from '../services/ambientAudio';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, Plus, Check, X } from 'lucide-react';

interface CinemaSlideshowProps {
  photographs: Photograph[];
  initialIndex?: number;
  onExit: () => void;
  collectedIds: Set<string>;
  onToggleCollect: (photo: Photograph) => void;
}

export const CinemaSlideshow: React.FC<CinemaSlideshowProps> = ({
  photographs,
  initialIndex = 0,
  onExit,
  collectedIds,
  onToggleCollect,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [waveformLevels, setWaveformLevels] = useState<number[]>([0.1, 0.1, 0.1, 0.1, 0.1]);

  const currentPhoto = photographs[currentIndex];

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % photographs.length);
  }, [photographs.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + photographs.length) % photographs.length);
  }, [photographs.length]);

  // Audio subscribe
  useEffect(() => {
    const unsubscribe = ambientAudio.subscribeWaveform((levels) => {
      setWaveformLevels(levels.slice(0, 5));
    });
    return () => {
      unsubscribe();
      ambientAudio.stop();
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onExit();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onExit]);

  // Autoplay timer
  useEffect(() => {
    let timer: number | null = null;
    if (isPlaying) {
      timer = window.setInterval(() => {
        handleNext();
      }, 6000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, handleNext]);

  // Audio toggle
  const toggleAudio = () => {
    if (isAudioPlaying) {
      ambientAudio.fadeOutAndStop();
      setIsAudioPlaying(false);
    } else if (currentPhoto?.sonicPostcard) {
      ambientAudio.play(currentPhoto.sonicPostcard.soundType, currentPhoto.sonicPostcard.durationSeconds);
      setIsAudioPlaying(true);
    }
  };

  // Switch sound when slide changes if playing
  useEffect(() => {
    if (isAudioPlaying && currentPhoto?.sonicPostcard) {
      ambientAudio.play(currentPhoto.sonicPostcard.soundType, currentPhoto.sonicPostcard.durationSeconds);
    }
  }, [currentIndex, currentPhoto, isAudioPlaying]);

  if (!currentPhoto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between p-6 md:p-12 transition-colors duration-700 select-none"
      style={{
        backgroundColor: currentPhoto.palette.ambientMattingHex,
      }}
    >
      {/* Top Bar: Plate Counter & Controls */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs tracking-widest text-white/50 uppercase">
            PLATE {currentPhoto.catalogNumber} / {photographs.length.toString().padStart(2, '0')}
          </span>
          <span className="text-white/20">•</span>
          <span className="font-mono text-[11px] text-white/60 tracking-wider">
            {currentPhoto.aspectRatio}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Sonic Postcard button if available */}
          {currentPhoto.sonicPostcard && (
            <button
              onClick={toggleAudio}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-black/30 backdrop-blur-md text-white/80 hover:text-white transition-all text-xs font-mono"
              title={currentPhoto.sonicPostcard.label}
            >
              {isAudioPlaying ? <Volume2 size={13} className="text-[#D93829]" /> : <VolumeX size={13} />}
              <span className="hidden sm:inline text-[11px]">{currentPhoto.sonicPostcard.label.split('&')[0]}</span>
              {/* Mini visualizer */}
              {isAudioPlaying && (
                <div className="flex items-end gap-0.5 h-3 ml-1">
                  {waveformLevels.map((lvl, idx) => (
                    <span
                      key={idx}
                      className="w-0.5 bg-[#D93829] transition-all duration-75"
                      style={{ height: `${lvl * 12}px` }}
                    />
                  ))}
                </div>
              )}
            </button>
          )}

          {/* Autoplay Play/Pause */}
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="p-2 rounded-full border border-white/10 bg-black/30 text-white/70 hover:text-white transition-colors"
            title={isPlaying ? 'Pause slideshow (Space)' : 'Play slideshow (Space)'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>

          {/* Close Cinema Mode */}
          <button
            onClick={onExit}
            className="p-2 rounded-full border border-white/10 bg-black/30 text-white/70 hover:text-white transition-colors"
            title="Exit Cinema Mode (Esc)"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main Cinema Canvas (Uncropped with pure aspect ratio) */}
      <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
        {/* Previous arrow */}
        <button
          onClick={handlePrev}
          className="absolute left-2 md:left-6 z-20 p-3 rounded-full bg-black/20 hover:bg-black/50 text-white/50 hover:text-white transition-all backdrop-blur-xs opacity-0 hover:opacity-100 md:opacity-40"
          title="Previous (←)"
        >
          <ChevronLeft size={24} />
        </button>

        {/* The uncropped image */}
        <div
          className="relative max-w-full max-h-[82vh] flex items-center justify-center transition-all duration-700"
          style={{
            aspectRatio: `${currentPhoto.aspectRatioNumeric}`,
          }}
        >
          <img
            src={currentPhoto.highResUrl}
            alt={currentPhoto.title}
            className="w-full h-full object-contain shadow-2xl transition-all duration-500"
          />
        </div>

        {/* Next arrow */}
        <button
          onClick={handleNext}
          className="absolute right-2 md:right-6 z-20 p-3 rounded-full bg-black/20 hover:bg-black/50 text-white/50 hover:text-white transition-all backdrop-blur-xs opacity-0 hover:opacity-100 md:opacity-40"
          title="Next (→)"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Bottom Subtitle / Field Note Bar */}
      <div className="z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="max-w-xl">
          <h2 className="font-serif italic text-2xl md:text-3xl font-light text-white tracking-tight">
            {currentPhoto.title}
          </h2>
          <p className="font-serif text-sm md:text-base text-white/70 italic mt-1 leading-relaxed">
            {currentPhoto.fieldNote}
          </p>
          <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest block mt-2">
            {currentPhoto.humanizedLightContext} • {currentPhoto.exif.camera}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleCollect(currentPhoto)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-black/40 text-white/90 hover:text-white hover:border-white transition-all text-xs font-mono"
          >
            {collectedIds.has(currentPhoto.id) ? (
              <>
                <Check size={13} className="text-[#D93829]" />
                <span>Collected</span>
              </>
            ) : (
              <>
                <Plus size={13} />
                <span>Collect Plate</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Autoplay Progress Line */}
      {isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10">
          <div className="h-full bg-[#D93829] animate-pulse w-full origin-left transition-all" />
        </div>
      )}
    </div>
  );
};
