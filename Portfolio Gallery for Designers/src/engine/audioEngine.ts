type AmbientProfile =
  | 'studio-tape'
  | 'kyoto-courtyard'
  | 'berlin-rain'
  | 'nordic-glasshouse'
  | 'desert-wind';

class StudioAudioEngine {
  private ctx: AudioContext | null = null;
  private activeNodes: AudioNode[] = [];
  private isPlaying = false;

  public start(profile: AmbientProfile) {
    this.stop();
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.14, this.ctx.currentTime + 0.6);
    masterGain.connect(this.ctx.destination);
    this.activeNodes.push(masterGain);

    // Filtered pink/brown noise bed evoking analog room tone, rain, or desert breeze
    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.025 * white) / 1.025;
      lastOut = data[i];
      data[i] *= 2.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    const profileFreq: Record<AmbientProfile, { freq: number; q: number; drone: number }> = {
      'studio-tape': { freq: 340, q: 1.4, drone: 146.83 },
      'kyoto-courtyard': { freq: 520, q: 1.8, drone: 196.0 },
      'berlin-rain': { freq: 920, q: 0.9, drone: 110.0 },
      'nordic-glasshouse': { freq: 440, q: 1.6, drone: 164.81 },
      'desert-wind': { freq: 260, q: 2.1, drone: 130.81 },
    };

    const cfg = profileFreq[profile];
    filter.frequency.value = cfg.freq;
    filter.Q.value = cfg.q;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.value = 0.55;

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start();
    this.activeNodes.push(noise, filter, noiseGain);

    // Gentle warm harmonic pad
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = cfg.drone;
    const oscGain = this.ctx.createGain();
    oscGain.gain.value = 0.14;
    osc.connect(oscGain);
    oscGain.connect(masterGain);
    osc.start();
    this.activeNodes.push(osc, oscGain);

    this.isPlaying = true;
  }

  public stop() {
    this.isPlaying = false;
    for (const node of this.activeNodes) {
      try {
        if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          (node as AudioScheduledSourceNode).stop();
        }
        node.disconnect();
      } catch {
        // ignore already stopped
      }
    }
    this.activeNodes = [];
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }

  public getIsPlaying() {
    return this.isPlaying;
  }
}

export const studioAudio = new StudioAudioEngine();

