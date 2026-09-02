/**
 * Procedural Web Audio Sound Engine for Tactical Shooter
 * Generates CS 1.6-inspired sound effects with 3D spatialization and dynamic cues.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private listenerPos: [number, number, number] = [0, 0, 0];
  /** Desired output level, retained so it survives lazy context creation. */
  private masterVolume: number = 0.7;

  constructor() {
    // Lazy initialized on first user interaction
  }

  private init() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Set output level (0..1). Safe to call before the audio context exists —
   * the value is stored and applied when playback first initializes it.
   */
  public setMasterVolume(volume: number) {
    this.masterVolume = Math.min(1, Math.max(0, volume));
    this.isMuted = this.masterVolume <= 0;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
  }

  public updateListener(x: number, y: number, z: number, forwardX = 0, forwardY = 0, forwardZ = -1) {
    if (!this.ctx) return;
    this.listenerPos = [x, y, z];
    const listener = this.ctx.listener;
    const time = this.ctx.currentTime;
    if (listener.positionX) {
      listener.positionX.setValueAtTime(x, time);
      listener.positionY.setValueAtTime(y, time);
      listener.positionZ.setValueAtTime(z, time);
      listener.forwardX.setValueAtTime(forwardX, time);
      listener.forwardY.setValueAtTime(forwardY, time);
      listener.forwardZ.setValueAtTime(forwardZ, time);
    } else {
      listener.setPosition(x, y, z);
      listener.setOrientation(forwardX, forwardY, forwardZ, 0, 1, 0);
    }
  }

  private createPanner(x?: number, y?: number, z?: number): PannerNode | null {
    if (!this.ctx || x === undefined || y === undefined || z === undefined) return null;
    const panner = this.ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 3;
    panner.maxDistance = 60;
    panner.rolloffFactor = 1.2;
    panner.coneInnerAngle = 360;
    panner.setPosition(x, y, z);
    return panner;
  }

  private routeToOutput(node: AudioNode, panner?: PannerNode | null) {
    if (this.masterGain) {
      if (panner) {
        node.connect(panner);
        panner.connect(this.masterGain);
      } else {
        node.connect(this.masterGain);
      }
    }
  }

  // --- WEAPON SOUNDS ---

  public playGunshot(weaponId: string, worldPos?: [number, number, number], isPlayer = false) {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const panner = isPlayer ? null : this.createPanner(worldPos?.[0], worldPos?.[1], worldPos?.[2]);

    if (weaponId === 'ak47') {
      // AK-47: Punchy transient + harsh sub punch + mechanical metallic snap
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.15);

      gain.gain.setValueAtTime(0.8, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);
      osc.connect(gain);
      this.routeToOutput(gain, panner);
      osc.start(t);
      osc.stop(t + 0.22);

      // Noise crack
      const bufferSize = this.ctx.sampleRate * 0.18;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.03));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, t);
      filter.Q.setValueAtTime(1.5, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.7, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      noise.connect(filter);
      filter.connect(noiseGain);
      this.routeToOutput(noiseGain, panner);
      noise.start(t);
    } else if (weaponId === 'usp') {
      // USP: Crisp silenced pop + tight snap
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(380, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.08);

      gain.gain.setValueAtTime(0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      osc.connect(gain);
      this.routeToOutput(gain, panner);
      osc.start(t);
      osc.stop(t + 0.1);

      // High click
      const bufferSize = this.ctx.sampleRate * 0.06;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.008));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2200, t);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);

      noise.connect(filter);
      filter.connect(noiseGain);
      this.routeToOutput(noiseGain, panner);
      noise.start(t);
    } else if (weaponId === 'knife') {
      // Knife slash
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(150, t + 0.12);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
      osc.connect(gain);
      this.routeToOutput(gain, panner);
      osc.start(t);
      osc.stop(t + 0.12);
    }
  }

  // --- HEADSHOT DINK & IMPACTS ---

  public playHeadshotDink(worldPos?: [number, number, number]) {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const panner = this.createPanner(worldPos?.[0], worldPos?.[1], worldPos?.[2]);

    // High pitch metallic ringing "PING" (iconic CS helmet dink)
    const freqs = [1850, 2400, 3100];
    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.exponentialRampToValueAtTime(f * 0.96, t + 0.35);

      gain.gain.setValueAtTime(0.4 / (idx + 1), t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      this.routeToOutput(gain, panner);
      osc.start(t);
      osc.stop(t + 0.35);
    });

    // Flesh crunch layer
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.015));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, t);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    this.routeToOutput(gain, panner);
    noise.start(t);
  }

  public playBodyHit(worldPos?: [number, number, number], hasArmor = true) {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const panner = this.createPanner(worldPos?.[0], worldPos?.[1], worldPos?.[2]);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = hasArmor ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(hasArmor ? 300 : 180, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.08);
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
    osc.connect(gain);
    this.routeToOutput(gain, panner);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  // --- FOOTSTEPS ---

  public playFootstep(worldPos?: [number, number, number], isPlayer = false, material: 'concrete' | 'wood' | 'metal' = 'concrete') {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const panner = isPlayer ? null : this.createPanner(worldPos?.[0], worldPos?.[1], worldPos?.[2]);

    const bufferSize = this.ctx.sampleRate * 0.06;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.012));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(material === 'wood' ? 450 : material === 'metal' ? 1200 : 650, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isPlayer ? 0.22 : 0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);

    noise.connect(filter);
    filter.connect(gain);
    this.routeToOutput(gain, panner);
    noise.start(t);
  }

  // --- RELOAD SEQUENCE ---

  public playReload(stage: 'mag_out' | 'mag_in' | 'slide_pull') {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    if (stage === 'mag_out') {
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.08);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
    } else if (stage === 'mag_in') {
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(650, t + 0.09);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);
    } else {
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.12);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
    }
    osc.connect(gain);
    this.routeToOutput(gain);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  // --- BOMB SOUNDS ---

  public playBombBeep(tempoFactor = 1.0, worldPos?: [number, number, number]) {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const panner = this.createPanner(worldPos?.[0], worldPos?.[1], worldPos?.[2]);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    // Higher beep pitch as bomb is closer to detonating
    const freq = 1200 + (1 - tempoFactor) * 800;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.07);

    osc.connect(gain);
    this.routeToOutput(gain, panner);
    osc.start(t);
    osc.stop(t + 0.07);
  }

  public playBombPlanting() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    // Sequential keypad beeps
    [0, 0.08, 0.16].forEach((delay, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400 + idx * 250, t + delay);
      gain.gain.setValueAtTime(0.18, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, t + delay + 0.05);
      osc.connect(gain);
      this.routeToOutput(gain);
      osc.start(t + delay);
      osc.stop(t + delay + 0.05);
    });
  }

  public playBombDefusing() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    // Wire snip / electrical hum
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    osc.connect(gain);
    this.routeToOutput(gain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playExplosion(worldPos?: [number, number, number]) {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const panner = this.createPanner(worldPos?.[0], worldPos?.[1], worldPos?.[2]);

    // Sub rumble
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(120, t);
    subOsc.frequency.exponentialRampToValueAtTime(20, t + 1.8);
    subGain.gain.setValueAtTime(1.0, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 2.0);
    subOsc.connect(subGain);
    this.routeToOutput(subGain, panner);
    subOsc.start(t);
    subOsc.stop(t + 2.0);

    // Giant explosive noise
    const bufferSize = this.ctx.sampleRate * 2.0;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.4));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 1.8);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.9, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 2.0);

    noise.connect(filter);
    filter.connect(noiseGain);
    this.routeToOutput(noiseGain, panner);
    noise.start(t);
  }

  // --- UI & RADIO CHIMES ---

  public playRadio(message: string) {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    // Radio click burst
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(950, t);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    osc.connect(gain);
    this.routeToOutput(gain);
    osc.start(t);
    osc.stop(t + 0.05);

    // Speak announcement if speech synthesis is available
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 1.15;
        utterance.pitch = 0.95;
        utterance.volume = 0.8;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Fallback gracefully
      }
    }
  }

  public playBuySound() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.setValueAtTime(880, t + 0.05);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
    osc.connect(gain);
    this.routeToOutput(gain);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  public playShoulderSwap() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(450, t + 0.06);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
    osc.connect(gain);
    this.routeToOutput(gain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  public playEmptyClick() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(900, t);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.03);
    osc.connect(gain);
    this.routeToOutput(gain);
    osc.start(t);
    osc.stop(t + 0.03);
  }
}

export const soundEngine = new SoundEngine();
