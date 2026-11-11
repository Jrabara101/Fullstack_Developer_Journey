// Procedural Ambient Focus Audio Generator (Brown Noise & Lo-Fi Drone)

export type AmbientMode = 'off' | 'brown_noise' | 'lofi_drone';

class AmbientAudioManager {
  private ctx: AudioContext | null = null;
  private mode: AmbientMode = 'off';
  private volume: number = 0.35;
  private masterGain: GainNode | null = null;
  private activeNodes: Array<AudioNode> = [];
  private listeners: Set<(mode: AmbientMode, isPlaying: boolean, volume: number) => void> = new Set();

  private initContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public subscribe(cb: (mode: AmbientMode, isPlaying: boolean, volume: number) => void) {
    this.listeners.add(cb);
    cb(this.mode, this.mode !== 'off', this.volume);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.mode, this.mode !== 'off', this.volume));
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
    this.notify();
  }

  public getVolume() {
    return this.volume;
  }

  public getMode() {
    return this.mode;
  }

  public setMode(newMode: AmbientMode) {
    this.stopCurrent();
    this.mode = newMode;
    if (newMode !== 'off') {
      this.initContext();
      if (newMode === 'brown_noise') {
        this.startBrownNoise();
      } else if (newMode === 'lofi_drone') {
        this.startLofiDrone();
      }
    }
    this.notify();
  }

  private stopCurrent() {
    this.activeNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          (node as AudioScheduledSourceNode).stop();
        }
        node.disconnect();
      } catch {}
    });
    this.activeNodes = [];
  }

  // Synthesizes soothing Brown Noise (integration filter over white noise)
  private startBrownNoise() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brown noise formula: integrates white noise with leakage
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Gain compensation
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(420, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.7, now);

    noise.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    this.activeNodes.push(noise, lowpass, gain);
  }

  // Synthesizes warm Lo-Fi ambient chord drone + subtle rain texture
  private startLofiDrone() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Peaceful Fmaj9 / Cmaj9 frequencies: F3, A3, C4, E4, G4
    const chord = [174.61, 220.0, 261.63, 329.63, 392.0];

    chord.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Subtle detune for warmth
      osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);

      gain.gain.setValueAtTime(0.08 / chord.length, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      this.activeNodes.push(osc, filter, gain);
    });

    // Subtle gentle rain overlay
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const rainNoise = this.ctx.createBufferSource();
    rainNoise.buffer = buffer;
    rainNoise.loop = true;

    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.setValueAtTime(1800, now);
    rainFilter.Q.value = 0.8;

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.02, now);

    rainNoise.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(this.masterGain);

    rainNoise.start(now);
    this.activeNodes.push(rainNoise, rainFilter, rainGain);
  }
}

export const ambientAudio = new AmbientAudioManager();

