// Web Audio API Sound Synthesizer for Kinetic Memory
class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  // Crisp mechanical tactile card flip
  public playFlip() {
    try {
      this.init();
      if (!this.ctx || !this.masterGain || this.isMuted) return;
      const now = this.ctx.currentTime;

      // Short snap transient
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.06);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Ignore audio failure
    }
  }

  // Card face reveal chime
  public playReveal() {
    try {
      this.init();
      if (!this.ctx || !this.masterGain || this.isMuted) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // Ignore
    }
  }

  // Harmonious shimmering match chord
  public playMatch(comboLevel: number = 1) {
    try {
      this.init();
      if (!this.ctx || !this.masterGain || this.isMuted) return;
      const now = this.ctx.currentTime;

      // Notes scale based on combo streak
      const baseFreq = 523.25; // C5
      const freqs = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2]; // C, E, G, C6

      freqs.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const adjustedFreq = freq * (1 + (comboLevel - 1) * 0.08);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(adjustedFreq, now + idx * 0.04);

        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(0.25, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6 + idx * 0.05);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + idx * 0.04);
        osc.stop(now + 0.7 + idx * 0.05);
      });
    } catch {
      // Ignore
    }
  }

  // Low frequency mismatch denial buzz
  public playMismatch() {
    try {
      this.init();
      if (!this.ctx || !this.masterGain || this.isMuted) return;
      const now = this.ctx.currentTime;

      [160, 130].forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0.2, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.15);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.16);
      });
    } catch {
      // Ignore
    }
  }

  // Clock tick tension
  public playTick(urgent: boolean = false) {
    try {
      this.init();
      if (!this.ctx || !this.masterGain || this.isMuted) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = urgent ? 'square' : 'triangle';
      osc.frequency.setValueAtTime(urgent ? 880 : 540, now);

      gain.gain.setValueAtTime(urgent ? 0.18 : 0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (urgent ? 0.06 : 0.03));

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Ignore
    }
  }

  // Bonus time chime (+3s)
  public playBonus() {
    try {
      this.init();
      if (!this.ctx || !this.masterGain || this.isMuted) return;
      const now = this.ctx.currentTime;

      [659.25, 880].forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.2, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.26);
      });
    } catch {
      // Ignore
    }
  }

  // Penalty buzzer (-2s)
  public playPenalty() {
    try {
      this.init();
      if (!this.ctx || !this.masterGain || this.isMuted) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.2);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.23);
    } catch {
      // Ignore
    }
  }

  // Hint sonar ping
  public playHint() {
    try {
      this.init();
      if (!this.ctx || !this.masterGain || this.isMuted) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.42);
    } catch {
      // Ignore
    }
  }

  // Victory fanfare sequence
  public playVictory() {
    try {
      this.init();
      if (!this.ctx || !this.masterGain || this.isMuted) return;
      const now = this.ctx.currentTime;

      const notes = [
        { f: 523.25, t: 0.0 }, // C5
        { f: 659.25, t: 0.12 }, // E5
        { f: 783.99, t: 0.24 }, // G5
        { f: 1046.50, t: 0.38 }, // C6
        { f: 1318.51, t: 0.52 }, // E6
      ];

      notes.forEach(({ f, t }) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + t);

        gain.gain.setValueAtTime(0.3, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.6);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + t);
        osc.stop(now + t + 0.65);
      });
    } catch {
      // Ignore
    }
  }

  // Game over gloomy decay
  public playGameOver() {
    try {
      this.init();
      if (!this.ctx || !this.masterGain || this.isMuted) return;
      const now = this.ctx.currentTime;

      const notes = [440, 392, 349.23, 293.66];
      notes.forEach((f, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now + idx * 0.18);

        gain.gain.setValueAtTime(0.2, now + idx * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.3);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + idx * 0.18);
        osc.stop(now + idx * 0.18 + 0.35);
      });
    } catch {
      // Ignore
    }
  }
}

export const soundEngine = new SoundEngine();
