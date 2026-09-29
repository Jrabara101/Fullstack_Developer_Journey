// ═══════════════════════════════════════════════════════════════════════════════
// THE CIPHER GALLOWS — Procedural Web Audio Engine
// Zero external audio assets required; synthetic sound design with tension valve
// ═══════════════════════════════════════════════════════════════════════════════

class TacticalAudioEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private tensionDrone: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (muted && this.droneGain) {
      this.droneGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  // Mechanical switch click on key press
  public playKeyClick() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.04);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    filter.Q.setValueAtTime(3, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.045);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Harmonic chord reveal when letter matches
  public playCorrectMatch() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C Major chord
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.03);

      gain.gain.setValueAtTime(0, this.ctx!.currentTime + idx * 0.03);
      gain.gain.linearRampToValueAtTime(0.08, this.ctx!.currentTime + idx * 0.03 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + idx * 0.03 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + idx * 0.03);
      osc.stop(this.ctx!.currentTime + idx * 0.03 + 0.4);
    });
  }

  // Harsh tactical error buzz / structural rupture sound (intensifies with strikes)
  public playStrikeError(currentStrikes: number) {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const baseFreq = Math.max(90, 160 - currentStrikes * 12);
    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    subOsc.type = 'square';

    osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(baseFreq * 0.7, this.ctx.currentTime + 0.25);

    subOsc.frequency.setValueAtTime(baseFreq * 0.5, this.ctx.currentTime);

    const volume = Math.min(0.25, 0.12 + currentStrikes * 0.025);
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

    osc.connect(gain);
    subOsc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    subOsc.start();
    osc.stop(this.ctx.currentTime + 0.3);
    subOsc.stop(this.ctx.currentTime + 0.3);
  }

  // Sonar ping or radar sweep pulse
  public playRadarPing() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.6);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.7);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.75);
  }

  // Dynamic tension valve: low-frequency drone when strikes >= 3
  public updateTensionAtmosphere(strikesUsed: number, maxStrikes: number) {
    if (this.muted || strikesUsed < 3) {
      if (this.droneGain && this.ctx) {
        this.droneGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
      }
      return;
    }

    this.initCtx();
    if (!this.ctx) return;

    if (!this.tensionDrone) {
      this.tensionDrone = this.ctx.createOscillator();
      this.droneGain = this.ctx.createGain();

      this.tensionDrone.type = 'triangle';
      this.tensionDrone.frequency.setValueAtTime(55, this.ctx.currentTime); // 55Hz sub A1

      this.droneGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.tensionDrone.connect(this.droneGain);
      this.droneGain.connect(this.ctx.destination);
      this.tensionDrone.start();
    }

    // Tension increases as remaining mistakes dwindle
    const dangerRatio = strikesUsed / maxStrikes; // 0.5 to 1.0
    const targetFreq = 50 + dangerRatio * 45; // ramps pitch up
    const targetGain = 0.02 + dangerRatio * 0.04;

    this.tensionDrone.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.4);
    this.droneGain!.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.3);
  }

  // Victory Fanfare
  public playVictory() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [
      { f: 440, t: 0.00 }, // A4
      { f: 554.37, t: 0.12 }, // C#5
      { f: 659.25, t: 0.24 }, // E5
      { f: 880.00, t: 0.38 }, // A5
    ];

    notes.forEach(({ f, t }) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, this.ctx!.currentTime + t);

      gain.gain.setValueAtTime(0.12, this.ctx!.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + t + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + t);
      osc.stop(this.ctx!.currentTime + t + 0.5);
    });
  }

  // Defeat / Structural Breach
  public playDefeat() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 1.2);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 1.25);
  }
}

export const audioEngine = new TacticalAudioEngine();
