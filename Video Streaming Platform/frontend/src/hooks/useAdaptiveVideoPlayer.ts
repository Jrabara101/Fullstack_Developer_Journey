import { useState, useEffect, useRef, useCallback } from 'react';
import { Video, QualityResolution, TimedComment } from '../types/video';

export interface QualityOption {
  index: number; // -1 for Auto
  label: string;
  resolution: QualityResolution | 'Auto';
  bitrateKbps: number;
  width?: number;
  height?: number;
}

export interface UseAdaptiveVideoPlayerProps {
  video: Video;
  onTimeUpdateCallback?: (currentTime: number) => void;
  onCommentTrigger?: (comment: TimedComment) => void;
}

export function useAdaptiveVideoPlayer({ video, onTimeUpdateCallback, onCommentTrigger }: UseAdaptiveVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsInstanceRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const compressorNodeRef = useRef<DynamicsCompressorNode | null>(null);
  const dialogueFilterNodeRef = useRef<BiquadFilterNode | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.durationSeconds || 0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);

  // ABR & Quality
  const [availableQualities, setAvailableQualities] = useState<QualityOption[]>([
    { index: -1, label: 'Auto (4K Ultra HD • 18.2 Mbps)', resolution: 'Auto', bitrateKbps: 18400 },
    { index: 0, label: '4K (2160p60) — Cinema Lock', resolution: '4k', bitrateKbps: 18400, width: 3840, height: 2160 },
    { index: 1, label: '1080p HD (8.4 Mbps)', resolution: '1080p', bitrateKbps: 8400, width: 1920, height: 1080 },
    { index: 2, label: '720p Fast-Stream (3.2 Mbps)', resolution: '720p', bitrateKbps: 3200, width: 1280, height: 720 },
    { index: 3, label: 'Data Saver (480p • 1.4 Mbps)', resolution: '480p', bitrateKbps: 1400, width: 854, height: 480 }
  ]);
  const [currentQualityIndex, setCurrentQualityIndex] = useState(-1); // -1 = Auto
  const [currentEstimatedBitrate, setCurrentEstimatedBitrate] = useState('18.4 Mbps');

  // Modes & features
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const [ambientGlowEnabled, setAmbientGlowEnabled] = useState(true);
  const [audioOnlyMode, setAudioOnlyMode] = useState(false);
  const [dialogueBoostEnabled, setDialogueBoostEnabled] = useState(false);
  const [resumeNotification, setResumeNotification] = useState<string | null>(null);
  const [hotSwapNotification, setHotSwapNotification] = useState<string | null>(null);

  // Comments trigger tracking
  const firedCommentIdsRef = useRef<Set<string>>(new Set());

  // Storage key for watch session
  const watchProgressKey = `cinestream_progress_${video.ulid}`;

  // Smart Context Rewind check on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(watchProgressKey);
      if (saved) {
        const { timestampMs, savedAt } = JSON.parse(saved);
        const hoursSinceLastWatch = (Date.now() - savedAt) / (1000 * 60 * 60);

        let resumeSeconds = timestampMs / 1000;
        let appliedRewind = false;

        // If paused more than 12 hours ago, apply 3-Second Smart Context Rewind
        if (hoursSinceLastWatch >= 12 && resumeSeconds > 5) {
          resumeSeconds = Math.max(0, resumeSeconds - 3);
          appliedRewind = true;
        }

        if (videoRef.current && resumeSeconds > 0 && resumeSeconds < video.durationSeconds - 10) {
          videoRef.current.currentTime = resumeSeconds;
          setCurrentTime(resumeSeconds);

          const timecodeStr = formatTime(resumeSeconds);
          setResumeNotification(
            appliedRewind 
              ? `Resumed at ${timecodeStr} (with 3s Smart Context Rewind)`
              : `Resumed from your previous session at ${timecodeStr}`
          );

          setTimeout(() => setResumeNotification(null), 5000);
        }
      }
    } catch (e) {
      console.warn('Could not read watch progress', e);
    }
  }, [video.ulid]);

  // Periodic heartbeat / save progress every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        const timeMs = Math.floor(videoRef.current.currentTime * 1000);
        localStorage.setItem(watchProgressKey, JSON.stringify({
          timestampMs: timeMs,
          savedAt: Date.now()
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [watchProgressKey]);

  // Format mm:ss helper
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Initialize HLS.js or native playback
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    setIsLoading(true);
    let hls: any = null;

    // Check for window.Hls
    const HlsClass = (window as any).Hls;

    if (HlsClass && HlsClass.isSupported()) {
      hls = new HlsClass({
        autoStartLoad: true,
        startLevel: -1, // Auto
        capLevelToPlayerSize: false,
        backBufferLength: 90
      });

      hls.loadSource(video.masterPlaylistPath);
      hls.attachMedia(videoEl);

      hls.on(HlsClass.Events.MANIFEST_PARSED, (event: any, data: any) => {
        setIsLoading(false);
        if (data.levels && data.levels.length > 0) {
          const parsed = data.levels.map((lvl: any, idx: number) => ({
            index: idx,
            label: `${lvl.height}p (${(lvl.bitrate / 1000000).toFixed(1)} Mbps)`,
            resolution: `${lvl.height}p` as QualityResolution,
            bitrateKbps: Math.round(lvl.bitrate / 1000),
            width: lvl.width,
            height: lvl.height
          }));

          setAvailableQualities([
            { index: -1, label: 'Auto (Best Quality ABR)', resolution: 'Auto', bitrateKbps: 18400 },
            ...parsed
          ]);
        }
      });

      hls.on(HlsClass.Events.LEVEL_SWITCHED, (event: any, data: any) => {
        const lvl = hls.levels[data.level];
        if (lvl) {
          setCurrentEstimatedBitrate(`${(lvl.bitrate / 1000000).toFixed(1)} Mbps`);
        }
      });

      hls.on(HlsClass.Events.ERROR, (event: any, data: any) => {
        if (data.fatal) {
          console.warn('HLS Fatal Error, falling back to progressive video src', data);
          videoEl.src = video.audioOnlyM4aPath || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';
          setIsLoading(false);
        }
      });

      hlsInstanceRef.current = hls;
    } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari HLS
      videoEl.src = video.masterPlaylistPath;
      videoEl.addEventListener('loadedmetadata', () => setIsLoading(false));
    } else {
      // Progressive direct video fallback
      videoEl.src = video.audioOnlyM4aPath || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';
      setIsLoading(false);
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [video.masterPlaylistPath, video.audioOnlyM4aPath]);

  // Audio boost (Web Audio API compressor & dialogue EQ)
  const toggleDialogueBoost = useCallback(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (!audioContextRef.current) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const source = ctx.createMediaElementSource(videoEl);

        // Vocal presence band-pass / peaking filter (centered at 2.4kHz)
        const filter = ctx.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = 2400;
        filter.Q.value = 1.2;
        filter.gain.value = 6; // +6dB dialogue clarity

        // Speech dynamics compressor to even out whispers and loud explosions
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-24, ctx.currentTime);
        compressor.knee.setValueAtTime(30, ctx.currentTime);
        compressor.ratio.setValueAtTime(4, ctx.currentTime);
        compressor.attack.setValueAtTime(0.003, ctx.currentTime);
        compressor.release.setValueAtTime(0.25, ctx.currentTime);

        source.connect(filter);
        filter.connect(compressor);
        compressor.connect(ctx.destination);

        audioContextRef.current = ctx;
        dialogueFilterNodeRef.current = filter;
        compressorNodeRef.current = compressor;
        setDialogueBoostEnabled(true);
      } catch (e) {
        console.warn('Web Audio API dialogue filter setup note:', e);
        setDialogueBoostEnabled(prev => !prev);
      }
    } else {
      if (dialogueFilterNodeRef.current) {
        const nextState = !dialogueBoostEnabled;
        dialogueFilterNodeRef.current.gain.value = nextState ? 6 : 0;
        setDialogueBoostEnabled(nextState);
      }
    }
  }, [dialogueBoostEnabled]);

  // Video element event listeners
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const handleTimeUpdate = () => {
      const time = videoEl.currentTime;
      setCurrentTime(time);
      if (onTimeUpdateCallback) onTimeUpdateCallback(time);

      // Check for timed comments crossing threshold (within 1 second window)
      if (video.comments && onCommentTrigger) {
        const currentMs = time * 1000;
        for (const comment of video.comments) {
          if (
            Math.abs(comment.timestampMs - currentMs) < 600 &&
            !firedCommentIdsRef.current.has(comment.id)
          ) {
            firedCommentIdsRef.current.add(comment.id);
            onCommentTrigger(comment);
          }
        }
      }

      // Buffered progress calculation
      if (videoEl.buffered.length > 0) {
        for (let i = 0; i < videoEl.buffered.length; i++) {
          if (videoEl.buffered.start(i) <= time && videoEl.buffered.end(i) >= time) {
            setBufferedEnd(videoEl.buffered.end(i));
            break;
          }
        }
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleDurationChange = () => setDuration(videoEl.duration || video.durationSeconds);
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);

    videoEl.addEventListener('timeupdate', handleTimeUpdate);
    videoEl.addEventListener('play', handlePlay);
    videoEl.addEventListener('pause', handlePause);
    videoEl.addEventListener('durationchange', handleDurationChange);
    videoEl.addEventListener('waiting', handleWaiting);
    videoEl.addEventListener('playing', handlePlaying);

    return () => {
      videoEl.removeEventListener('timeupdate', handleTimeUpdate);
      videoEl.removeEventListener('play', handlePlay);
      videoEl.removeEventListener('pause', handlePause);
      videoEl.removeEventListener('durationchange', handleDurationChange);
      videoEl.removeEventListener('waiting', handleWaiting);
      videoEl.removeEventListener('playing', handlePlaying);
    };
  }, [video, onTimeUpdateCallback, onCommentTrigger]);

  // Control Actions
  const togglePlay = useCallback(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    if (videoEl.paused) {
      videoEl.play().catch(e => console.warn('Play interrupted:', e));
    } else {
      videoEl.pause();
    }
  }, []);

  const seekTo = useCallback((seconds: number) => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const clamped = Math.max(0, Math.min(duration, seconds));
    videoEl.currentTime = clamped;
    setCurrentTime(clamped);
  }, [duration]);

  const skipSeconds = useCallback((offset: number) => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    seekTo(videoEl.currentTime + offset);
  }, [seekTo]);

  const changeQuality = useCallback((qualityIndex: number) => {
    setCurrentQualityIndex(qualityIndex);
    if (hlsInstanceRef.current) {
      hlsInstanceRef.current.currentLevel = qualityIndex;
    }
  }, []);

  const changePlaybackRate = useCallback((rate: number) => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    videoEl.playbackRate = rate;
    setPlaybackRate(rate);
  }, []);

  const changeVolume = useCallback((val: number) => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const clamped = Math.max(0, Math.min(1, val));
    videoEl.volume = clamped;
    setVolume(clamped);
    setIsMuted(clamped === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    if (isMuted) {
      videoEl.muted = false;
      setIsMuted(false);
      videoEl.volume = volume || 0.8;
    } else {
      videoEl.muted = true;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const toggleFullscreen = useCallback(() => {
    const container = videoRef.current?.closest('.cinema-player-container');
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(e => console.warn(e));
    } else {
      document.exitFullscreen?.().catch(e => console.warn(e));
    }
  }, []);

  // Simulate Fast-Start Proxy to 4K hot-swap notification triggerable from UI or studio
  const triggerSimulated4KHotSwap = useCallback(() => {
    setHotSwapNotification("✨ 4K Ultra HD rendition is now ready — Upgrading stream quality seamlessly");
    setCurrentQualityIndex(0); // Lock 4K
    setTimeout(() => {
      setHotSwapNotification(null);
    }, 6000);
  }, []);

  return {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    bufferedEnd,
    volume,
    isMuted,
    playbackRate,
    isLoading,
    availableQualities,
    currentQualityIndex,
    currentEstimatedBitrate,
    isTheaterMode,
    setIsTheaterMode,
    isMiniPlayer,
    setIsMiniPlayer,
    ambientGlowEnabled,
    setAmbientGlowEnabled,
    audioOnlyMode,
    setAudioOnlyMode,
    dialogueBoostEnabled,
    toggleDialogueBoost,
    resumeNotification,
    setResumeNotification,
    hotSwapNotification,
    triggerSimulated4KHotSwap,
    togglePlay,
    seekTo,
    skipSeconds,
    changeQuality,
    changePlaybackRate,
    changeVolume,
    toggleMute,
    toggleFullscreen
  };
}
