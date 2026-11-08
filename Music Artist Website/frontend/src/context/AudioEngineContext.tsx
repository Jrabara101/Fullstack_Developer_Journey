import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Track, StemMixerState, FanReaction } from '../types';

interface AudioEngineContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  loop: boolean;
  pausedByMedia: boolean;
  stemState: StemMixerState;
  frequencyData: Uint8Array;
  stemLevels: { vocals: number; synths: number; drums: number; bass: number };
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  seek: (seconds: number) => void;
  setVolume: (v: number) => void;
  setLoop: (l: boolean) => void;
  skipNext: () => void;
  skipPrev: () => void;
  toggleStemMute: (channel: keyof StemMixerState) => void;
  toggleStemSolo: (channel: keyof StemMixerState) => void;
  setStemVolume: (channel: keyof StemMixerState, vol: number) => void;
  addReaction: (comment: string, emoji?: string) => void;
  duckAudioForMedia: (duck: boolean) => void;
  resumeFromMediaDucking: () => void;
  openStemDrawer: boolean;
  setOpenStemDrawer: (open: boolean) => void;
  openLyricsDrawer: boolean;
  setOpenLyricsDrawer: (open: boolean) => void;
}

const AudioEngineContext = createContext<AudioEngineContextType | undefined>(undefined);

export const AudioEngineProvider: React.FC<{ children: React.ReactNode; initialTracks: Track[] }> = ({
  children,
  initialTracks
}) => {
  const [tracks, setTracks] = useState<Track[]>(initialTracks);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(initialTracks[0] || null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(initialTracks[0]?.duration_seconds || 228);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [loop, setLoop] = useState<boolean>(false);
  const [pausedByMedia, setPausedByMedia] = useState<boolean>(false);
  const [openStemDrawer, setOpenStemDrawer] = useState<boolean>(false);
  const [openLyricsDrawer, setOpenLyricsDrawer] = useState<boolean>(false);

  // 4-Channel Stem Mixer State
  const [stemState, setStemState] = useState<StemMixerState>({
    vocals: { muted: false, solo: false, volume: 0.9 },
    synths: { muted: false, solo: false, volume: 0.85 },
    drums: { muted: false, solo: false, volume: 0.95 },
    bass: { muted: false, solo: false, volume: 0.9 }
  });

  // Simulated live stem peak meter levels
  const [stemLevels, setStemLevels] = useState<{ vocals: number; synths: number; drums: number; bass: number }>({
    vocals: 0,
    synths: 0,
    drums: 0,
    bass: 0
  });

  // Web Audio Context & Nodes refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const stemGainsRef = useRef<{
    vocals: GainNode | null;
    synths: GainNode | null;
    drums: GainNode | null;
    bass: GainNode | null;
  }>({ vocals: null, synths: null, drums: null, bass: null });

  // Musical Synthesizer Scheduler refs
  const schedulerTimerRef = useRef<number | null>(null);
  const playbackStartTimeRef = useRef<number>(0);
  const currentStepRef = useRef<number>(0);
  const frequencyArrayRef = useRef<Uint8Array>(new Uint8Array(32));
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(new Uint8Array(32));

  // Initialize Web Audio graph
  const initWebAudio = useCallback(() => {
    if (audioCtxRef.current) return audioCtxRef.current;

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, ctx.currentTime);
    masterGainRef.current = masterGain;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64; // 32 frequency bins
    analyser.smoothingTimeConstant = 0.8;
    analyserRef.current = analyser;

    // Stem gain nodes
    const vocalsGain = ctx.createGain();
    const synthsGain = ctx.createGain();
    const drumsGain = ctx.createGain();
    const bassGain = ctx.createGain();

    stemGainsRef.current = {
      vocals: vocalsGain,
      synths: synthsGain,
      drums: drumsGain,
      bass: bassGain
    };

    vocalsGain.connect(masterGain);
    synthsGain.connect(masterGain);
    drumsGain.connect(masterGain);
    bassGain.connect(masterGain);

    masterGain.connect(analyser);
    analyser.connect(ctx.destination);

    return ctx;
  }, [volume]);

  // Update stem gain nodes whenever stemState or isPlaying changes
  useEffect(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const gains = stemGainsRef.current;

    const hasAnySolo = Object.values(stemState).some(s => s.solo);

    (['vocals', 'synths', 'drums', 'bass'] as (keyof StemMixerState)[]).forEach(channel => {
      const g = gains[channel];
      if (!g) return;
      const state = stemState[channel];

      let targetGain = 0;
      if (hasAnySolo) {
        targetGain = state.solo && !state.muted ? state.volume : 0;
      } else {
        targetGain = state.muted ? 0 : state.volume;
      }

      g.gain.cancelScheduledValues(now);
      g.gain.setTargetAtTime(targetGain, now, 0.04);
    });
  }, [stemState]);

  // Master volume change
  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(clamped, audioCtxRef.current.currentTime, 0.05);
    }
  }, []);

  // Web Audio Music Synthesizer Loop: Plays 4 synchronized stems
  const scheduleStep = useCallback((step: number, bpm: number) => {
    if (!audioCtxRef.current || !isPlaying) return;
    const ctx = audioCtxRef.current;
    const stepDuration = 60 / bpm / 4; // 16th note in seconds
    const time = ctx.currentTime + 0.02;

    const stepInBar = step % 16;
    const barNum = Math.floor(step / 16);

    // 1. DRUMS (Kick on 0, 8; Snare on 4, 12; Hi-hat on 0,2,4,6,8,10,12,14)
    if (stemGainsRef.current.drums) {
      // Kick drum
      if (stepInBar === 0 || stepInBar === 8 || (stepInBar === 14 && barNum % 2 === 1)) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(140, time);
        osc.frequency.exponentialRampToValueAtTime(32, time + 0.12);
        gain.gain.setValueAtTime(1.0, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
        osc.connect(gain);
        gain.connect(stemGainsRef.current.drums);
        osc.start(time);
        osc.stop(time + 0.26);
      }

      // Snare drum
      if (stepInBar === 4 || stepInBar === 12) {
        // Noise buffer for snare snap
        const bufferSize = ctx.sampleRate * 0.15;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1000, time);

        const snareGain = ctx.createGain();
        snareGain.gain.setValueAtTime(0.8, time);
        snareGain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

        whiteNoise.connect(filter);
        filter.connect(snareGain);
        snareGain.connect(stemGainsRef.current.drums);

        whiteNoise.start(time);
        whiteNoise.stop(time + 0.19);
      }

      // Closed Hi-Hat (16th notes)
      if (stepInBar % 2 === 0) {
        const hhOsc = ctx.createOscillator();
        hhOsc.type = 'square';
        hhOsc.frequency.setValueAtTime(8000, time);

        const hhFilter = ctx.createBiquadFilter();
        hhFilter.type = 'bandpass';
        hhFilter.frequency.setValueAtTime(10000, time);

        const hhGain = ctx.createGain();
        const vel = stepInBar % 4 === 0 ? 0.35 : 0.18;
        hhGain.gain.setValueAtTime(vel, time);
        hhGain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

        hhOsc.connect(hhFilter);
        hhFilter.connect(hhGain);
        hhGain.connect(stemGainsRef.current.drums);

        hhOsc.start(time);
        hhOsc.stop(time + 0.06);
      }
    }

    // 2. SUB BASS (Walking analog bassline)
    if (stemGainsRef.current.bass && (stepInBar === 0 || stepInBar === 3 || stepInBar === 6 || stepInBar === 10 || stepInBar === 12)) {
      const bassFreqs = [73.42, 87.31, 98.00, 65.41]; // D2, F2, G2, C2
      const root = bassFreqs[barNum % bassFreqs.length];

      const bassOsc = ctx.createOscillator();
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(root, time);

      const bassFilter = ctx.createBiquadFilter();
      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(320, time);
      bassFilter.frequency.exponentialRampToValueAtTime(80, time + 0.25);
      bassFilter.Q.setValueAtTime(4, time);

      const bassGain = ctx.createGain();
      bassGain.gain.setValueAtTime(0.7, time);
      bassGain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(stemGainsRef.current.bass);

      bassOsc.start(time);
      bassOsc.stop(time + 0.3);
    }

    // 3. ANALOG SYNTHS (Prophet-6 style arpeggiator chords)
    if (stemGainsRef.current.synths) {
      const chordScales = [
        [293.66, 349.23, 440.00, 523.25], // Dm7 (D4, F4, A4, C5)
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [349.23, 440.00, 523.25, 659.25], // Fmaj7
        [246.94, 293.66, 369.99, 440.00]  // Bm7b5
      ];
      const activeChord = chordScales[barNum % chordScales.length];
      const noteFreq = activeChord[stepInBar % activeChord.length];

      const synthOsc = ctx.createOscillator();
      synthOsc.type = 'sawtooth';
      synthOsc.frequency.setValueAtTime(noteFreq, time);

      const synthFilter = ctx.createBiquadFilter();
      synthFilter.type = 'lowpass';
      const cutoff = 800 + Math.sin(step * 0.1) * 600;
      synthFilter.frequency.setValueAtTime(cutoff, time);
      synthFilter.Q.setValueAtTime(3, time);

      const synthGain = ctx.createGain();
      synthGain.gain.setValueAtTime(0.22, time);
      synthGain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);

      synthOsc.connect(synthFilter);
      synthFilter.connect(synthGain);
      synthGain.connect(stemGainsRef.current.synths);

      synthOsc.start(time);
      synthOsc.stop(time + 0.18);
    }

    // 4. VOCALS / LEAD (Melodic vocalise lead with formant filter)
    if (stemGainsRef.current.vocals && (stepInBar === 0 || stepInBar === 6 || stepInBar === 12)) {
      const vocalMelody = [440.00, 523.25, 587.33, 493.88, 440.00, 392.00];
      const vocalFreq = vocalMelody[(barNum * 2 + Math.floor(stepInBar / 4)) % vocalMelody.length];

      const vocOsc = ctx.createOscillator();
      vocOsc.type = 'triangle';
      vocOsc.frequency.setValueAtTime(vocalFreq, time);

      // Formant vowel filter
      const formant = ctx.createBiquadFilter();
      formant.type = 'bandpass';
      formant.frequency.setValueAtTime(950, time);
      formant.Q.setValueAtTime(6, time);

      const vocGain = ctx.createGain();
      vocGain.gain.setValueAtTime(0.35, time);
      vocGain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);

      vocOsc.connect(formant);
      formant.connect(vocGain);
      vocGain.connect(stemGainsRef.current.vocals);

      vocOsc.start(time);
      vocOsc.stop(time + 0.5);
    }
  }, [isPlaying]);

  // Main playback loop & telemetry update
  useEffect(() => {
    let animId: number;

    const tick = () => {
      if (isPlaying && audioCtxRef.current) {
        const bpm = currentTrack?.bpm || 124;
        const stepIntervalMs = (60 / bpm / 4) * 1000;
        const now = performance.now();

        if (now - playbackStartTimeRef.current >= stepIntervalMs) {
          currentStepRef.current += 1;
          playbackStartTimeRef.current = now;
          scheduleStep(currentStepRef.current, bpm);

          setCurrentTime(prev => {
            const next = prev + stepIntervalMs / 1000;
            if (next >= duration) {
              if (loop) {
                currentStepRef.current = 0;
                return 0;
              } else {
                // skip next
                skipNext();
                return 0;
              }
            }
            return next;
          });
        }

        // Read real FFT frequency data for visualizer
        if (analyserRef.current) {
          const arr = frequencyArrayRef.current;
          analyserRef.current.getByteFrequencyData(arr as any);
          setFrequencyData(new Uint8Array(arr));

          // Compute simulated stem levels based on active stem gains & frequencies
          const hasAnySolo = Object.values(stemState).some(s => s.solo);
          const getLevel = (ch: keyof StemMixerState, baseAvg: number) => {
            const st = stemState[ch];
            if (hasAnySolo && !st.solo) return 0;
            if (st.muted) return 0;
            return Math.min(100, Math.round(baseAvg * st.volume * (0.8 + Math.random() * 0.4)));
          };

          const bassAvg = (arr[0] + arr[1] + arr[2]) / 3 / 255 * 100;
          const drumsAvg = (arr[3] + arr[4] + arr[5] + arr[6]) / 4 / 255 * 100;
          const synthsAvg = (arr[7] + arr[8] + arr[9] + arr[10]) / 4 / 255 * 100;
          const vocalsAvg = (arr[11] + arr[12] + arr[13] + arr[14]) / 4 / 255 * 100;

          setStemLevels({
            bass: getLevel('bass', bassAvg),
            drums: getLevel('drums', drumsAvg),
            synths: getLevel('synths', synthsAvg),
            vocals: getLevel('vocals', vocalsAvg)
          });
        }
      } else {
        setStemLevels({ vocals: 0, synths: 0, drums: 0, bass: 0 });
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, currentTrack, duration, loop, scheduleStep, stemState]);

  // Audio Controls
  const togglePlay = useCallback(() => {
    const ctx = initWebAudio();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (isPlaying) {
      setIsPlaying(false);
      setPausedByMedia(false);
    } else {
      setIsPlaying(true);
      setPausedByMedia(false);
      playbackStartTimeRef.current = performance.now();
    }
  }, [initWebAudio, isPlaying]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    const ctx = initWebAudio();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    setIsPlaying(true);
    setPausedByMedia(false);
    playbackStartTimeRef.current = performance.now();
  }, [initWebAudio]);

  const playTrack = useCallback((track: Track) => {
    const ctx = initWebAudio();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    setCurrentTrack(track);
    setDuration(track.duration_seconds);
    setCurrentTime(0);
    currentStepRef.current = 0;
    setIsPlaying(true);
    setPausedByMedia(false);
    playbackStartTimeRef.current = performance.now();
  }, [initWebAudio]);

  const seek = useCallback((seconds: number) => {
    const clamped = Math.max(0, Math.min(duration, seconds));
    setCurrentTime(clamped);
    if (currentTrack) {
      const bpm = currentTrack.bpm || 124;
      const stepDuration = 60 / bpm / 4;
      currentStepRef.current = Math.floor(clamped / stepDuration);
      playbackStartTimeRef.current = performance.now();
    }
  }, [duration, currentTrack]);

  const skipNext = useCallback(() => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    playTrack(tracks[nextIndex]);
  }, [currentTrack, tracks, playTrack]);

  const skipPrev = useCallback(() => {
    if (!currentTrack || tracks.length === 0) return;
    if (currentTime > 3) {
      seek(0);
      return;
    }
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    playTrack(tracks[prevIndex]);
  }, [currentTrack, tracks, currentTime, seek, playTrack]);

  // Stem Controls
  const toggleStemMute = useCallback((channel: keyof StemMixerState) => {
    setStemState(prev => ({
      ...prev,
      [channel]: { ...prev[channel], muted: !prev[channel].muted }
    }));
  }, []);

  const toggleStemSolo = useCallback((channel: keyof StemMixerState) => {
    setStemState(prev => {
      const isAlreadySolo = prev[channel].solo;
      return {
        ...prev,
        [channel]: { ...prev[channel], solo: !isAlreadySolo }
      };
    });
  }, []);

  const setStemVolume = useCallback((channel: keyof StemMixerState, vol: number) => {
    setStemState(prev => ({
      ...prev,
      [channel]: { ...prev[channel], volume: Math.max(0, Math.min(1, vol)) }
    }));
  }, []);

  // Timed fan reaction
  const addReaction = useCallback((comment: string, emoji = '🔥') => {
    if (!currentTrack || !comment.trim()) return;
    const newRx: FanReaction = {
      id: `rx-${Date.now()}`,
      timestamp_ms: Math.round(currentTime * 1000),
      emoji,
      comment: comment.trim(),
      fan_handle: 'You (Verified Fan)'
    };
    setCurrentTrack(prev => {
      if (!prev) return null;
      return {
        ...prev,
        fan_reactions: [...prev.fan_reactions, newRx]
      };
    });
  }, [currentTrack, currentTime]);

  // Media Ducking Handshake (Zero-Jank Crossfade)
  const duckAudioForMedia = useCallback((duck: boolean) => {
    if (duck && isPlaying) {
      setIsPlaying(false);
      setPausedByMedia(true);
    }
  }, [isPlaying]);

  const resumeFromMediaDucking = useCallback(() => {
    setPausedByMedia(false);
    resume();
  }, [resume]);

  return (
    <AudioEngineContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        loop,
        pausedByMedia,
        stemState,
        frequencyData,
        stemLevels,
        playTrack,
        togglePlay,
        pause,
        resume,
        seek,
        setVolume,
        setLoop,
        skipNext,
        skipPrev,
        toggleStemMute,
        toggleStemSolo,
        setStemVolume,
        addReaction,
        duckAudioForMedia,
        resumeFromMediaDucking,
        openStemDrawer,
        setOpenStemDrawer,
        openLyricsDrawer,
        setOpenLyricsDrawer
      }}
    >
      {children}
    </AudioEngineContext.Provider>
  );
};

export const useAudioEngine = () => {
  const context = useContext(AudioEngineContext);
  if (!context) {
    throw new Error('useAudioEngine must be used within an AudioEngineProvider');
  }
  return context;
};