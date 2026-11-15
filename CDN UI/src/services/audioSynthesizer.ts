// Web Audio API engine for realistic live audio auditioning & DSP emulation

export type AudioPreset = 'podcast' | 'lofi';

class AudioSynthesizerEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentTrackType: AudioPreset = 'podcast';
  private currentTime = 0; // in seconds
  private duration = 180;
  private trimStart = 0;
  private trimEnd = 180;
  private timerId: number | null = null;
  private bitrate: '320k' | '96k' | '48k' = '96k';
  private normalizeLufs = true;
  private listeners: Set<(time: number, isPlaying: boolean) => void> = new Set();

  // Web Audio Nodes
  private masterGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private oscillatorInterval: number | null = null;

  constructor() {
    // Lazy init context on first user interaction to comply with browser autoplay policies
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setTrack(type: AudioPreset, duration: number, trimStart = 0, trimEnd = duration) {
    this.currentTrackType = type;
    this.duration = duration;
    this.trimStart = trimStart;
    this.trimEnd = trimEnd;
    this.currentTime = trimStart;
    this.notify();
  }

  public setBitrate(bitrate: '320k' | '96k' | '48k') {
    this.bitrate = bitrate;
    this.applyAudioProcessing();
  }

  public setLufsNormalization(enabled: boolean) {
    this.normalizeLufs = enabled;
    this.applyAudioProcessing();
  }

  public setTrim(start: number, end: number) {
    this.trimStart = Math.max(0, start);
    this.trimEnd = Math.min(this.duration, end);
    if (this.currentTime < this.trimStart || this.currentTime > this.trimEnd) {
      this.currentTime = this.trimStart;
    }
    this.notify();
  }

  public seek(seconds: number) {
    this.currentTime = Math.max(this.trimStart, Math.min(this.trimEnd, seconds));
    this.notify();
  }

  public togglePlay(): boolean {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  public play() {
    this.initContext();
    if (!this.ctx) return;

    if (this.currentTime >= this.trimEnd) {
      this.currentTime = this.trimStart;
    }

    this.isPlaying = true;
    this.setupSynthLoop();
    this.startTimer();
    this.notify();
  }

  public pause() {
    this.isPlaying = false;
    this.stopSynthLoop();
    this.stopTimer();
    this.notify();
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public subscribe(cb: (time: number, isPlaying: boolean) => void): () => void {
    this.listeners.add(cb);
    cb(this.currentTime, this.isPlaying);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.currentTime, this.isPlaying));
  }

  private startTimer() {
    this.stopTimer();
    const intervalMs = 100;
    this.timerId = window.setInterval(() => {
      this.currentTime += intervalMs / 1000;
      if (this.currentTime >= this.trimEnd) {
        // loop back to trim start
        this.currentTime = this.trimStart;
      }
      this.notify();
    }, intervalMs);
  }

  private stopTimer() {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private setupSynthLoop() {
    this.stopSynthLoop();
    if (!this.ctx) return;

    // Master bus
    this.masterGain = this.ctx.createGain();
    this.filterNode = this.ctx.createBiquadFilter();

    this.applyAudioProcessing();

    this.filterNode.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    // Synthesize ambient pulses periodically
    const bpm = this.currentTrackType === 'podcast' ? 90 : 80;
    const beatInterval = (60 / bpm) * 500; // ms per half-beat

    const playTone = () => {
      if (!this.isPlaying || !this.ctx || !this.filterNode) return;
      const t = this.ctx.currentTime;

      if (this.currentTrackType === 'podcast') {
        // Speech cadence simulation: formant-like dual resonance tone
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const vocalGain = this.ctx.createGain();

        // Conversational vocal fundamental frequencies (~150 - 280 Hz)
        const root = 160 + (Math.sin(this.currentTime * 2) * 40);
        osc1.frequency.setValueAtTime(root, t);
        osc2.frequency.setValueAtTime(root * 1.5, t); // formant harmonic

        osc1.type = 'sawtooth';
        osc2.type = 'triangle';

        vocalGain.gain.setValueAtTime(0.001, t);
        vocalGain.gain.exponentialRampToValueAtTime(0.08, t + 0.05);
        vocalGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc1.connect(vocalGain);
        osc2.connect(vocalGain);
        vocalGain.connect(this.filterNode);

        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + 0.4);
        osc2.stop(t + 0.4);
      } else {
        // Lofi Ambient Beat simulation: warm minor 9th chords + mellow sub-bass
        const chords = [
          [220, 261.63, 329.63, 392], // Am7
          [174.61, 220, 261.63, 329.63], // Fmaj7
          [196, 246.94, 293.66, 349.23], // G7
          [164.81, 196, 246.94, 329.63], // Em7
        ];
        const step = Math.floor(this.currentTime / 2) % chords.length;
        const chord = chords[step];

        chord.forEach((freq, idx) => {
          if (!this.ctx || !this.filterNode) return;
          const osc = this.ctx.createOscillator();
          const chordGain = this.ctx.createGain();

          osc.type = idx === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, t);

          chordGain.gain.setValueAtTime(0.001, t);
          chordGain.gain.exponentialRampToValueAtTime(idx === 0 ? 0.09 : 0.04, t + 0.08);
          chordGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);

          osc.connect(chordGain);
          chordGain.connect(this.filterNode);

          osc.start(t);
          osc.stop(t + 1.0);
        });
      }
    };

    playTone();
    this.oscillatorInterval = window.setInterval(playTone, beatInterval);
  }

  private stopSynthLoop() {
    if (this.oscillatorInterval !== null) {
      clearInterval(this.oscillatorInterval);
      this.oscillatorInterval = null;
    }
  }

  private applyAudioProcessing() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Apply LUFS normalization gain:
    // Raw unnormalized podcast is quiet (-23.4 LUFS) -> ~0.35 gain
    // Normalized -16 LUFS raises loudness transparently without clipping -> ~0.85 gain
    if (this.masterGain) {
      const targetGain = this.normalizeLufs ? 0.85 : 0.38;
      this.masterGain.gain.setTargetAtTime(targetGain, t, 0.1);
    }

    // Apply Bitrate acoustic filters:
    // 320k Studio: Flat all-pass / open high-shelf up to 22kHz
    // 96k Opus: Transparent speech filter (high cut at 14.5kHz)
    // 48k Commute: Bandpass telephone/commute compression filter (cut lows < 200Hz, cut highs > 4.2kHz)
    if (this.filterNode) {
      if (this.bitrate === '320k') {
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.setTargetAtTime(20000, t, 0.1);
        this.filterNode.Q.setTargetAtTime(0.7, t, 0.1);
      } else if (this.bitrate === '96k') {
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.setTargetAtTime(14000, t, 0.1);
        this.filterNode.Q.setTargetAtTime(0.9, t, 0.1);
      } else {
        // 48k commute mode: audible low-signal bandpass
        this.filterNode.type = 'bandpass';
        this.filterNode.frequency.setTargetAtTime(2400, t, 0.1);
        this.filterNode.Q.setTargetAtTime(1.8, t, 0.1);
      }
    }
  }
}

export const audioSynthesizer = new AudioSynthesizerEngine();

