import {
  PlayerInputPacket,
  KeyframeSnapshot,
  ReplayPayload
} from '../types/replay';

/**
 * High-performance Typed Circular Ring Buffer for rolling gameplay telemetry.
 * Pre-allocates Float32Array to avoid per-frame GC allocations and garbage churn.
 * 
 * Input Packet layout in Float32Array (5 floats per packet):
 * [0] = tick
 * [1] = dt
 * [2] = keys (bitmask)
 * [3] = cursor.x
 * [4] = cursor.y
 */
export class TelemetryRingBuffer {
  private readonly maxTicks: number;
  private readonly floatsPerInput = 5;
  private inputBuffer: Float32Array;
  
  // Rolling pointers for inputs
  private inputHead: number = 0;
  private inputCount: number = 0;

  // Rolling keyframes (1 keyframe per 60 ticks => maxTicks / 60)
  private keyframeBuffer: (KeyframeSnapshot | null)[];
  private keyframeHead: number = 0;
  private keyframeCount: number = 0;
  private readonly maxKeyframes: number;

  constructor(maxTicks: number = 108000) { // 108,000 ticks = 30 mins @ 60 FPS
    this.maxTicks = maxTicks;
    this.maxKeyframes = Math.ceil(maxTicks / 60);

    // Flat pre-allocated typed memory
    this.inputBuffer = new Float32Array(this.maxTicks * this.floatsPerInput);
    this.keyframeBuffer = new Array(this.maxKeyframes).fill(null);
  }

  /**
   * Push a discrete player input packet into the circular typed buffer.
   */
  public pushInput(packet: PlayerInputPacket): void {
    const offset = this.inputHead * this.floatsPerInput;
    this.inputBuffer[offset] = packet.tick;
    this.inputBuffer[offset + 1] = packet.dt;
    this.inputBuffer[offset + 2] = packet.keys;
    this.inputBuffer[offset + 3] = packet.cursor.x;
    this.inputBuffer[offset + 4] = packet.cursor.y;

    this.inputHead = (this.inputHead + 1) % this.maxTicks;
    if (this.inputCount < this.maxTicks) {
      this.inputCount++;
    }
  }

  /**
   * Push a keyframe snapshot into the rolling keyframe buffer.
   */
  public pushKeyframe(snapshot: KeyframeSnapshot): void {
    this.keyframeBuffer[this.keyframeHead] = snapshot;
    this.keyframeHead = (this.keyframeHead + 1) % this.maxKeyframes;
    if (this.keyframeCount < this.maxKeyframes) {
      this.keyframeCount++;
    }
  }

  /**
   * Reconstitutes continuous ordered input packets.
   */
  public getAllInputs(): PlayerInputPacket[] {
    const list: PlayerInputPacket[] = [];
    if (this.inputCount === 0) return list;

    // Start index in circular buffer
    const startIndex = this.inputCount < this.maxTicks ? 0 : this.inputHead;

    for (let i = 0; i < this.inputCount; i++) {
      const idx = (startIndex + i) % this.maxTicks;
      const offset = idx * this.floatsPerInput;
      list.push({
        tick: this.inputBuffer[offset],
        dt: this.inputBuffer[offset + 1],
        keys: Math.round(this.inputBuffer[offset + 2]),
        cursor: {
          x: this.inputBuffer[offset + 3],
          y: this.inputBuffer[offset + 4]
        }
      });
    }

    return list;
  }

  /**
   * Reconstitutes continuous ordered keyframes.
   */
  public getAllKeyframes(): KeyframeSnapshot[] {
    const list: KeyframeSnapshot[] = [];
    if (this.keyframeCount === 0) return list;

    const startIndex = this.keyframeCount < this.maxKeyframes ? 0 : this.keyframeHead;

    for (let i = 0; i < this.keyframeCount; i++) {
      const idx = (startIndex + i) % this.maxKeyframes;
      const kf = this.keyframeBuffer[idx];
      if (kf) list.push(kf);
    }

    return list;
  }

  /**
   * Extracts an in/out bounded slice of inputs and keyframes.
   */
  public getSlice(startTick: number, endTick: number): ReplayPayload {
    const allInputs = this.getAllInputs();
    const allKeyframes = this.getAllKeyframes();

    const filteredInputs = allInputs.filter(inp => inp.tick >= startTick && inp.tick <= endTick);
    const filteredKeyframes = allKeyframes.filter(kf => kf.tick >= startTick && kf.tick <= endTick);

    return {
      inputs: filteredInputs,
      keyframes: filteredKeyframes
    };
  }

  /**
   * Load external or backend replay payload into the ring buffer.
   */
  public loadFromPayload(payload: ReplayPayload): void {
    this.clear();
    for (const inp of payload.inputs) {
      this.pushInput(inp);
    }
    for (const kf of payload.keyframes) {
      this.pushKeyframe(kf);
    }
  }

  /**
   * Clear buffer state.
   */
  public clear(): void {
    this.inputHead = 0;
    this.inputCount = 0;
    this.keyframeHead = 0;
    this.keyframeCount = 0;
    this.inputBuffer.fill(0);
    this.keyframeBuffer.fill(null);
  }

  /**
   * Telemetry stats on memory buffer utilization.
   */
  public getMemoryUsage(): { bytesUsed: number; maxBytes: number; percentage: number; recordedTicks: number } {
    const bytesPerInput = this.floatsPerInput * 4;
    const maxBytes = this.maxTicks * bytesPerInput;
    const bytesUsed = this.inputCount * bytesPerInput;
    const percentage = Math.round((bytesUsed / maxBytes) * 100);

    return {
      bytesUsed,
      maxBytes,
      percentage: Math.min(100, percentage),
      recordedTicks: this.inputCount
    };
  }
}
