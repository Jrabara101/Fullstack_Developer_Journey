// Synthesized Web Audio API sound generator for zero-latency retro arcade effects

class SoundEngine {
  private ctx: AudioContext | null = null
  private enabled: boolean = true

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val
  }

  public isEnabled(): boolean {
    return this.enabled
  }

  public toggle(): boolean {
    this.enabled = !this.enabled
    if (this.enabled) {
      this.playTick()
    }
    return this.enabled
  }

  // Regular Apple Eat Blip: quick dual-frequency rise
  public playEat(speedMultiplier = 1) {
    if (!this.enabled) return
    this.initCtx()
    if (!this.ctx) return

    try {
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      const baseFreq = 440 + Math.min(400, (speedMultiplier - 1) * 150)
      osc.frequency.setValueAtTime(baseFreq, now)
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, now + 0.08)

      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.09)
    } catch {
      // Ignore audio glitches
    }
  }

  // Bonus Golden Fruit Eat: Bright arcade power-up chord
  public playBonusEat() {
    if (!this.enabled) return
    this.initCtx()
    if (!this.ctx) return

    try {
      const now = this.ctx.currentTime
      const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator()
        const gain = this.ctx!.createGain()
        const noteStart = now + idx * 0.035

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, noteStart)
        osc.frequency.exponentialRampToValueAtTime(freq * 1.05, noteStart + 0.08)

        gain.gain.setValueAtTime(0.18, noteStart)
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.12)

        osc.connect(gain)
        gain.connect(this.ctx!.destination)

        osc.start(noteStart)
        osc.stop(noteStart + 0.12)
      })
    } catch {
      // Ignore
    }
  }

  // Decaying Bonus Spawn Warning
  public playBonusSpawn() {
    if (!this.enabled) return
    this.initCtx()
    if (!this.ctx) return

    try {
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, now)
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.1)

      gain.gain.setValueAtTime(0.1, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.15)
    } catch {
      // Ignore
    }
  }

  // Soft warning tick when bonus is decaying (< 2 sec left)
  public playDecayTick() {
    if (!this.enabled) return
    this.initCtx()
    if (!this.ctx) return

    try {
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'square'
      osc.frequency.setValueAtTime(987.77, now) // B5

      gain.gain.setValueAtTime(0.04, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.03)
    } catch {
      // Ignore
    }
  }

  // Crash / Death: Low buzz & filtered noise burst
  public playDeath() {
    if (!this.enabled) return
    this.initCtx()
    if (!this.ctx) return

    try {
      const now = this.ctx.currentTime

      // Descending saw
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(220, now)
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.35)

      gain.gain.setValueAtTime(0.25, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.38)

      // Noise burst for impact crunch
      const bufferSize = this.ctx.sampleRate * 0.15
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25))
      }

      const noise = this.ctx.createBufferSource()
      noise.buffer = buffer

      const filter = this.ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(1000, now)
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.15)

      const noiseGain = this.ctx.createGain()
      noiseGain.gain.setValueAtTime(0.3, now)
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

      noise.connect(filter)
      filter.connect(noiseGain)
      noiseGain.connect(this.ctx.destination)

      noise.start(now)
    } catch {
      // Ignore
    }
  }

  // Subtle UI click / move tick
  public playTick() {
    if (!this.enabled) return
    this.initCtx()
    if (!this.ctx) return

    try {
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(700, now)
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.02)

      gain.gain.setValueAtTime(0.05, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.02)
    } catch {
      // Ignore
    }
  }
}

export const soundEngine = new SoundEngine()
