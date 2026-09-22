// Web Audio API Synthesizer with Ascending Pitch Scaling
class RetroAudioEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public volume: number = 0.5;

  public init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Base Tone Synthesizer with Envelope
  private playTone(
    freq: number, 
    type: OscillatorType = 'sine', 
    duration: number = 0.08, 
    vol: number = 0.2,
    freqRampEnd?: number
  ) {
    if (!this.enabled || this.volume <= 0) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(20, freq), now);
      if (freqRampEnd !== undefined) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqRampEnd), now + duration);
      }

      const effectiveVol = vol * this.volume;
      gain.gain.setValueAtTime(effectiveVol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // AudioContext state safety
    }
  }

  // 1. Paddle Bounce Sound (Varies by Zone 1..5)
  public playPaddleHit(zone: number = 3) {
    // Center is deep bass punch (zone 3), outer edges are higher ping
    const freqs = [540, 420, 320, 420, 540];
    const freq = freqs[zone - 1] || 360;
    this.playTone(freq, 'triangle', 0.1, 0.25, freq * 0.7);
  }

  // 2. Wall Bounce
  public playWallBounce() {
    this.playTone(260, 'sine', 0.06, 0.15, 320);
  }

  // 3. Ascending Pitch Scaling on Brick Hits / Shatters
  // Formula: Base C4 (261.63 Hz) scaled by half-steps (semitones: f = f0 * 2^(n/12))
  // Combo 1 -> C4, Combo 2 -> C#4, Combo 3 -> D4, etc.
  public playBrickHit(tier: number, comboStreak: number = 1) {
    const baseFreq = 300 + (tier * 60);
    // Escalating half-step pitch shift based on combo
    const semitoneShift = Math.min(24, comboStreak); // Cap at 2 octaves
    const pitch = baseFreq * Math.pow(2, semitoneShift / 12);

    const waveType: OscillatorType = tier === 2 ? 'sawtooth' : (tier === 1 ? 'square' : 'triangle');
    this.playTone(pitch, waveType, 0.08, 0.22);
  }

  public playBrickBreak(comboStreak: number = 1) {
    // Glass shatter crunch: dual oscillators for punch + bright overtone
    const baseFreq = 440;
    const semitoneShift = Math.min(24, comboStreak);
    const pitch = baseFreq * Math.pow(2, semitoneShift / 12);

    this.playTone(pitch, 'sine', 0.14, 0.3, pitch * 1.5);
    setTimeout(() => {
      this.playTone(pitch * 1.25, 'triangle', 0.1, 0.2, pitch * 2);
    }, 20);
  }

  // 4. Laser Blast Sound
  public playLaserShot() {
    this.playTone(900, 'sawtooth', 0.09, 0.18, 200);
  }

  // 5. Power-Up Catch Sound (Rewarding Cyber Chime)
  public playPowerUpCollect() {
    const chord = [523.25, 659.25, 783.99, 1046.5]; // C Major arpeggio
    chord.forEach((note, i) => {
      setTimeout(() => {
        this.playTone(note, 'sine', 0.15, 0.2);
      }, i * 45);
    });
  }

  // 6. Magnetic Catch Latch Sound
  public playMagneticLatch() {
    this.playTone(600, 'square', 0.06, 0.2, 300);
    setTimeout(() => {
      this.playTone(300, 'triangle', 0.1, 0.25, 450);
    }, 60);
  }

  // 7. Explosive Detonation Sound
  public playExplosion() {
    this.playTone(180, 'sawtooth', 0.25, 0.4, 40);
  }

  // 8. Shield Breach / Lost Life Alarm
  public playLifeLost() {
    this.playTone(220, 'sawtooth', 0.35, 0.35, 55);
    setTimeout(() => {
      this.playTone(165, 'sawtooth', 0.3, 0.3, 45);
    }, 120);
  }

  // 9. Victory Fanfare Arpeggio
  public playVictory() {
    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.28, 0.28);
      }, idx * 100);
    });
  }
}

export const sound = new RetroAudioEngine();
