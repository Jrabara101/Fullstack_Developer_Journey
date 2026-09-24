// Web Audio API Synthesizer with Zero External Assets & Sub-Millisecond Precision

class ReflexAudioEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // Lazily initialized on first user gesture
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public playTone(
    freq: number,
    type: OscillatorType = 'sine',
    duration: number = 0.08,
    gainVal: number = 0.15,
    delay: number = 0
  ) {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const startTime = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(gainVal, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch (e) {
      console.warn('Audio tone synthesis error:', e);
    }
  }

  // Pre-configured Sound Signatures
  public playArm() {
    this.playTone(300, 'triangle', 0.09, 0.12);
  }

  public playTriggerBurst() {
    // Immediate dual sine spike for auditory sensory capture
    this.playTone(880, 'sine', 0.11, 0.28);
    this.playTone(1760, 'sine', 0.07, 0.18, 0.04);
  }

  public playAuditoryModeCue() {
    // Sharp high-transient click/burst for pure auditory reaction
    this.playTone(1000, 'sine', 0.09, 0.35);
    this.playTone(2000, 'sine', 0.05, 0.2, 0.02);
  }

  public playClickGood() {
    this.playTone(620, 'sine', 0.08, 0.2);
  }

  public playSupersonic() {
    // Apex celebration chord: C5 -> C6 -> C7
    this.playTone(523.25, 'sine', 0.1, 0.25);
    this.playTone(1046.5, 'triangle', 0.14, 0.25, 0.06);
    this.playTone(2093.0, 'sine', 0.22, 0.22, 0.12);
  }

  public playPenalty() {
    // Harsh dissonant sawtooth buzz
    this.playTone(180, 'sawtooth', 0.22, 0.3);
    this.playTone(135, 'sawtooth', 0.25, 0.25, 0.07);
  }

  public playSessionComplete() {
    // Ascending victory telemetry cadence
    this.playTone(440, 'triangle', 0.12, 0.2);
    this.playTone(554.37, 'triangle', 0.12, 0.22, 0.08);
    this.playTone(659.25, 'triangle', 0.14, 0.25, 0.16);
    this.playTone(880, 'sine', 0.35, 0.28, 0.24);
  }
}

export const soundManager = new ReflexAudioEngine();
