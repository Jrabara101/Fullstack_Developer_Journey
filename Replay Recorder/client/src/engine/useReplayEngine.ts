import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ReplaySessionState,
  ReplayMetadata,
  ReplayPayload,
  KeyframeSnapshot,
  PlayerInputPacket,
  ReplayEventMarker,
  EntityState,
  EventCategory
} from '../types/replay';
import { TelemetryRingBuffer } from './RingBuffer';
import { interpolateKeyframes } from './Interpolation';
import { compressReplayPayloadAsync } from './workerBridge';

export function useReplayEngine() {
  // Primary typed ring buffer
  const ringBufferRef = useRef<TelemetryRingBuffer>(new TelemetryRingBuffer(108000));
  
  // Ghost secondary buffer
  const ghostRingBufferRef = useRef<TelemetryRingBuffer>(new TelemetryRingBuffer(108000));
  const ghostMetadataRef = useRef<ReplayMetadata | null>(null);

  // High precision decoupled clock refs
  const currentTickRef = useRef<number>(0);
  const totalTicksRef = useRef<number>(0);
  const playbackSpeedRef = useRef<number>(1.0);
  const statusRef = useRef<ReplaySessionState['status']>('IDLE');
  const isLoopingRef = useRef<boolean>(false);
  const loopRangeRef = useRef<[number, number] | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const accumulatorRef = useRef<number>(0);

  // Markers and metadata refs
  const markersRef = useRef<ReplayEventMarker[]>([]);
  const metadataRef = useRef<ReplayMetadata>({
    replayId: 'session-' + Date.now(),
    gameTitle: 'Neon Drone Cyber-Incursion',
    recordedAt: new Date().toISOString(),
    totalTicks: 0,
    durationMs: 0,
    tickRate: 60,
    authorName: 'Pilot_Local',
    checksum: '',
    markers: []
  });

  // Reactive state for UI presentation
  const [sessionState, setSessionState] = useState<ReplaySessionState>({
    status: 'IDLE',
    currentTick: 0,
    totalTicks: 0,
    playbackSpeed: 1.0,
    isLooping: false,
    loopRange: null,
    activeMarkerId: null,
    isGhostEnabled: false,
    ghostReplayData: null
  });

  const [metadata, setMetadata] = useState<ReplayMetadata>(metadataRef.current);
  const [markers, setMarkers] = useState<ReplayEventMarker[]>([]);
  const [memoryStats, setMemoryStats] = useState({
    bytesUsed: 0,
    maxBytes: 108000 * 20,
    percentage: 0,
    recordedTicks: 0
  });

  // Current interpolated transforms for canvas renderers
  const [interpolatedEntities, setInterpolatedEntities] = useState<EntityState[]>([]);
  const [ghostEntities, setGhostEntities] = useState<EntityState[]>([]);
  const [currentInput, setCurrentInput] = useState<PlayerInputPacket | null>(null);

  // Magnet snap distance in ticks
  const MAGNET_SNAP_DISTANCE = 15;

  // Refresh reactive states
  const syncUiState = useCallback(() => {
    const curTickInt = Math.floor(currentTickRef.current);
    
    // Find nearest marker for radial pulse
    const activeMarker = markersRef.current.find(
      m => Math.abs(m.tick - curTickInt) <= 2
    );

    setSessionState(prev => ({
      ...prev,
      status: statusRef.current,
      currentTick: curTickInt,
      totalTicks: totalTicksRef.current,
      playbackSpeed: playbackSpeedRef.current,
      isLooping: isLoopingRef.current,
      loopRange: loopRangeRef.current,
      activeMarkerId: activeMarker ? activeMarker.id : null,
      isGhostEnabled: Boolean(ghostMetadataRef.current && prev.isGhostEnabled),
      ghostReplayData: ghostMetadataRef.current
    }));

    setMemoryStats(ringBufferRef.current.getMemoryUsage());
  }, []);

  // Update entity states based on current tick
  const evaluateTickState = useCallback((tick: number) => {
    const keyframes = ringBufferRef.current.getAllKeyframes();
    const entities = interpolateKeyframes(keyframes, tick);
    setInterpolatedEntities(entities);

    // Find active input packet
    const inputs = ringBufferRef.current.getAllInputs();
    const currentIntTick = Math.floor(tick);
    const activeInp = inputs.find(inp => inp.tick === currentIntTick) || null;
    setCurrentInput(activeInp);

    // If ghost enabled, evaluate ghost entities
    if (ghostMetadataRef.current) {
      const gKeyframes = ghostRingBufferRef.current.getAllKeyframes();
      const gEntities = interpolateKeyframes(gKeyframes, tick);
      setGhostEntities(gEntities);
    } else {
      setGhostEntities([]);
    }
  }, []);

  // High Precision Animation Loop (Decoupled from React)
  useEffect(() => {
    const FIXED_DT = 1 / 60; // 60Hz physics clock

    const loop = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      const elapsedSec = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      // Only advance clock in PLAYING or SLOW_MO
      if (statusRef.current === 'PLAYING' || statusRef.current === 'SLOW_MO') {
        const scaledDelta = elapsedSec * playbackSpeedRef.current;
        accumulatorRef.current += scaledDelta;

        while (accumulatorRef.current >= FIXED_DT) {
          currentTickRef.current += 1;
          accumulatorRef.current -= FIXED_DT;

          // Check Loop Range
          if (isLoopingRef.current && loopRangeRef.current) {
            const [loopStart, loopEnd] = loopRangeRef.current;
            if (currentTickRef.current >= loopEnd) {
              currentTickRef.current = loopStart;
            }
          } else if (currentTickRef.current >= totalTicksRef.current) {
            // End reached
            if (isLoopingRef.current) {
              currentTickRef.current = 0;
            } else {
              currentTickRef.current = totalTicksRef.current;
              statusRef.current = 'PAUSED';
              break;
            }
          }
        }

        evaluateTickState(currentTickRef.current);
        syncUiState();
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [evaluateTickState, syncUiState]);

  // -----------------------------------------------------------
  // Action Handlers
  // -----------------------------------------------------------

  const startRecording = useCallback((gameTitle: string = 'Live Match Telemetry') => {
    ringBufferRef.current.clear();
    markersRef.current = [];
    currentTickRef.current = 0;
    totalTicksRef.current = 0;
    statusRef.current = 'RECORDING';

    metadataRef.current = {
      replayId: 'rec-' + Date.now(),
      gameTitle,
      recordedAt: new Date().toISOString(),
      totalTicks: 0,
      durationMs: 0,
      tickRate: 60,
      authorName: 'Pilot_Local',
      checksum: '',
      markers: []
    };

    setMetadata(metadataRef.current);
    setMarkers([]);
    syncUiState();
  }, [syncUiState]);

  const stopRecording = useCallback(() => {
    if (statusRef.current !== 'RECORDING') return;

    statusRef.current = 'PAUSED';
    const total = currentTickRef.current;
    totalTicksRef.current = total;

    metadataRef.current = {
      ...metadataRef.current,
      totalTicks: total,
      durationMs: Math.round((total / 60) * 1000),
      markers: [...markersRef.current]
    };

    setMetadata({ ...metadataRef.current });
    syncUiState();
  }, [syncUiState]);

  const recordTick = useCallback((input: PlayerInputPacket, snapshot?: KeyframeSnapshot) => {
    if (statusRef.current !== 'RECORDING') return;

    ringBufferRef.current.pushInput(input);
    if (snapshot) {
      ringBufferRef.current.pushKeyframe(snapshot);
    }

    currentTickRef.current = input.tick;
    if (input.tick > totalTicksRef.current) {
      totalTicksRef.current = input.tick;
    }

    // Periodically sync UI during recording
    if (input.tick % 15 === 0) {
      syncUiState();
    }
  }, [syncUiState]);

  const addMarker = useCallback((category: EventCategory, label: string, extra?: Record<string, unknown>) => {
    const curTick = Math.floor(currentTickRef.current);
    const newMarker: ReplayEventMarker = {
      id: 'marker-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      tick: curTick,
      timestampMs: Math.round((curTick / 60) * 1000),
      category,
      label,
      metadata: extra
    };

    markersRef.current.push(newMarker);
    setMarkers([...markersRef.current]);
    metadataRef.current.markers = [...markersRef.current];
    setMetadata({ ...metadataRef.current });
  }, []);

  const play = useCallback(() => {
    if (statusRef.current === 'RECORDING') return;
    statusRef.current = playbackSpeedRef.current < 1.0 ? 'SLOW_MO' : 'PLAYING';
    lastTimestampRef.current = null;
    accumulatorRef.current = 0;
    syncUiState();
  }, [syncUiState]);

  const pause = useCallback(() => {
    if (statusRef.current === 'RECORDING') return;
    statusRef.current = 'PAUSED';
    syncUiState();
  }, [syncUiState]);

  const togglePlayPause = useCallback(() => {
    if (statusRef.current === 'PLAYING' || statusRef.current === 'SLOW_MO') {
      pause();
    } else {
      play();
    }
  }, [pause, play]);

  const seekToTick = useCallback((tick: number, enableMagnetSnap = true) => {
    let target = Math.max(0, Math.min(totalTicksRef.current, tick));

    // Magnet snap to closest marker
    if (enableMagnetSnap) {
      for (const m of markersRef.current) {
        if (Math.abs(m.tick - target) <= MAGNET_SNAP_DISTANCE) {
          target = m.tick;
          break;
        }
      }
    }

    currentTickRef.current = target;
    evaluateTickState(target);
    syncUiState();
  }, [evaluateTickState, syncUiState]);

  const startScrubbing = useCallback(() => {
    statusRef.current = 'SCRUBBING';
    syncUiState();
  }, [syncUiState]);

  const scrubToTick = useCallback((tick: number) => {
    seekToTick(tick, true);
  }, [seekToTick]);

  const endScrubbing = useCallback(() => {
    statusRef.current = 'PAUSED';
    syncUiState();
  }, [syncUiState]);

  const stepForward = useCallback(() => {
    seekToTick(Math.floor(currentTickRef.current) + 1, false);
  }, [seekToTick]);

  const stepBackward = useCallback(() => {
    seekToTick(Math.floor(currentTickRef.current) - 1, false);
  }, [seekToTick]);

  const jumpSeconds = useCallback((sec: number) => {
    const deltaTicks = sec * 60;
    seekToTick(currentTickRef.current + deltaTicks, false);
  }, [seekToTick]);

  const setPlaybackSpeed = useCallback((speed: number) => {
    playbackSpeedRef.current = speed;
    if (statusRef.current === 'PLAYING' || statusRef.current === 'SLOW_MO') {
      statusRef.current = speed < 1.0 ? 'SLOW_MO' : 'PLAYING';
    }
    syncUiState();
  }, [syncUiState]);

  const setLoopRange = useCallback((range: [number, number] | null) => {
    loopRangeRef.current = range;
    syncUiState();
  }, [syncUiState]);

  const toggleLooping = useCallback(() => {
    isLoopingRef.current = !isLoopingRef.current;
    syncUiState();
  }, [syncUiState]);

  const toggleGhost = useCallback((enabled?: boolean) => {
    setSessionState(prev => ({
      ...prev,
      isGhostEnabled: enabled !== undefined ? enabled : !prev.isGhostEnabled
    }));
  }, []);

  const loadReplayData = useCallback((meta: ReplayMetadata, payload: ReplayPayload) => {
    ringBufferRef.current.loadFromPayload(payload);
    metadataRef.current = meta;
    markersRef.current = meta.markers || [];
    totalTicksRef.current = meta.totalTicks;
    currentTickRef.current = 0;
    statusRef.current = 'PAUSED';

    setMetadata(meta);
    setMarkers(markersRef.current);
    evaluateTickState(0);
    syncUiState();
  }, [evaluateTickState, syncUiState]);

  const loadGhostReplay = useCallback((meta: ReplayMetadata, payload: ReplayPayload) => {
    ghostRingBufferRef.current.loadFromPayload(payload);
    ghostMetadataRef.current = meta;
    setSessionState(prev => ({
      ...prev,
      isGhostEnabled: true,
      ghostReplayData: meta
    }));
  }, []);

  const exportReplayPackage = useCallback(async (startTick?: number, endTick?: number) => {
    const sTick = startTick !== undefined ? startTick : 0;
    const eTick = endTick !== undefined ? endTick : totalTicksRef.current;

    const slice = ringBufferRef.current.getSlice(sTick, eTick);
    const subMarkers = markersRef.current.filter(m => m.tick >= sTick && m.tick <= eTick);

    const exportMeta: ReplayMetadata = {
      ...metadataRef.current,
      replayId: 'clip-' + Date.now(),
      totalTicks: eTick - sTick,
      durationMs: Math.round(((eTick - sTick) / 60) * 1000),
      markers: subMarkers
    };

    const compressedPayload = await compressReplayPayloadAsync(slice);

    return {
      metadata: exportMeta,
      payload: slice,
      compressedPayload
    };
  }, []);

  return {
    state: sessionState,
    metadata,
    markers,
    memoryStats,
    interpolatedEntities,
    ghostEntities,
    currentInput,
    ringBuffer: ringBufferRef.current,
    actions: {
      startRecording,
      stopRecording,
      recordTick,
      addMarker,
      play,
      pause,
      togglePlayPause,
      seekToTick,
      startScrubbing,
      scrubToTick,
      endScrubbing,
      stepForward,
      stepBackward,
      jumpSeconds,
      setPlaybackSpeed,
      setLoopRange,
      toggleLooping,
      toggleGhost,
      loadReplayData,
      loadGhostReplay,
      exportReplayPackage
    }
  };
}
