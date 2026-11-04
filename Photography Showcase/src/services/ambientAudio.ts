// Procedural Web Audio Engine for "Sonic Postcard" Ambient Soundscapes
// Generates museum-grade acoustic environments directly in the browser without external audio files.

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private isPlaying: boolean = false;
  private currentType: string | null = null;
  private stopTimer: number | null = null;
  private animationFrameId: number | null = null;
  private waveformSubscribers: ((levels: number[]) => void)[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public subscribeWaveform(callback: (levels: number[]) => void): () => void {
    this.waveformSubscribers.push(callback);
    return () => {
      this.waveformSubscribers = this.waveformSubscribers.filter(cb => cb !== callback);
    };
  }

  private startWaveformLoop() {
    if (this.animationFrameId) return;

    const tick = () => {
      if (this.isPlaying) {
        // Generate dynamic organic levels for audio visualizer bars
        const t = performance.now() / 1000;
        const levels = [
          0.3 + 0.4 * Math.sin(t * 3.2),
          0.4 + 0.5 * Math.sin(t * 4.1 + 1.2),
          0.2 + 0.6 * Math.sin(t * 2.7 + 2.5),
          0.5 + 0.4 * Math.sin(t * 5.3 + 0.8),
          0.35 + 0.45 * Math.sin(t * 3.8 + 3.1),
          0.25 + 0.55 * Math.sin(t * 4.6 + 1.9),
          0.4 + 0.35 * Math.sin(t * 2.9 + 4.2),
        ].map(v => Math.max(0.12, Math.min(1.0, v)));

        this.waveformSubscribers.forEach(cb => cb(levels));
        this.animationFrameId = requestAnimationFrame(tick);
      } else {
        const flat = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1];
        this.waveformSubscribers.forEach(cb => cb(flat));
        this.animationFrameId = null;
      }
    };
    this.animationFrameId = requestAnimationFrame(tick);
  }

  public play(type: 'kyoto_rain' | 'coastal_wind' | 'forest_nocturne' | 'urban_blue_hour', durationSeconds = 15) {
    this.stop();
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.isPlaying = true;
    this.currentType = type;
    const now = this.ctx.currentTime;

    // Fade in
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0.001, now);
    this.masterGain.gain.exponentialRampToValueAtTime(0.35, now + 1.5);

    switch (type) {
      case 'kyoto_rain':
        this.synthKyotoRain();
        break;
      case 'coastal_wind':
        this.synthCoastalWind();
        break;
      case 'forest_nocturne':
        this.synthForestNocturne();
        break;
      case 'urban_blue_hour':
        this.synthUrbanBlueHour();
        break;
    }

    this.startWaveformLoop();

    // Auto fade-out after durationSeconds
    if (durationSeconds > 0) {
      this.stopTimer = window.setTimeout(() => {
        this.fadeOutAndStop();
      }, durationSeconds * 1000);
    }
  }

  private synthKyotoRain() {
    if (!this.ctx || !this.masterGain) return;

    // Pink noise rain bed
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.masterGain);
    whiteNoise.start();
    this.activeNodes.push(whiteNoise);

    // Distant soft temple bell (sine harmonics)
    const bellInterval = window.setInterval(() => {
      if (!this.ctx || !this.isPlaying || !this.masterGain) return;
      const bellOsc = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();
      bellOsc.type = 'sine';
      bellOsc.frequency.setValueAtTime(216, this.ctx.currentTime); // D3 serene tone
      bellGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 4.5);
      bellOsc.connect(bellGain);
      bellGain.connect(this.masterGain);
      bellOsc.start();
      bellOsc.stop(this.ctx.currentTime + 4.6);
    }, 5500);

    this.activeNodes.push(bellInterval);
  }

  private synthCoastalWind() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Resonant bandpass filter with sweeping LFO for ocean wave swells
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // 8-second tidal wave cycle
    lfoGain.gain.setValueAtTime(220, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noiseSource.connect(filter);
    filter.connect(this.masterGain);

    noiseSource.start();
    lfo.start();
    this.activeNodes.push(noiseSource, lfo);
  }

  private synthForestNocturne() {
    if (!this.ctx || !this.masterGain) return;

    // Gentle whisper noise for pine wind
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.06;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(450, this.ctx.currentTime);

    noise.connect(lowpass);
    lowpass.connect(this.masterGain);
    noise.start();
    this.activeNodes.push(noise);

    // Evening night crickets (subtle micro chirps)
    const cricketInterval = window.setInterval(() => {
      if (!this.ctx || !this.isPlaying || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(4600 + Math.random() * 300, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    }, 1800);

    this.activeNodes.push(cricketInterval);
  }

  private synthUrbanBlueHour() {
    if (!this.ctx || !this.masterGain) return;

    // Low frequency city drone
    const drone1 = this.ctx.createOscillator();
    const droneGain = this.ctx.createGain();
    drone1.type = 'sine';
    drone1.frequency.setValueAtTime(55, this.ctx.currentTime); // Low A hum
    droneGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    drone1.connect(droneGain);
    droneGain.connect(this.masterGain);
    drone1.start();

    // Muffled air noise
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.05;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, this.ctx.currentTime);
    noise.connect(filter);
    filter.connect(this.masterGain);
    noise.start();

    this.activeNodes.push(drone1, noise);
  }

  public fadeOutAndStop() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) {
      this.stop();
      return;
    }
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    window.setTimeout(() => {
      this.stop();
    }, 1300);
  }

  public stop() {
    if (this.stopTimer) {
      clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }
    this.activeNodes.forEach(node => {
      if (typeof node === 'number') {
        clearInterval(node);
      } else {
        try {
          (node as AudioScheduledSourceNode).stop?.();
          node.disconnect();
        } catch {
          // ignore already stopped
        }
      }
    });
    this.activeNodes = [];
    this.isPlaying = false;
    this.currentType = null;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentType(): string | null {
    return this.currentType;
  }
}

export const ambientAudio = new AmbientAudioEngine();

