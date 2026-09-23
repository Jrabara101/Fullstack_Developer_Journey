import { useCallback, useEffect, useRef } from 'react'
import type { SoundMode } from '../types/typing'

export function useSoundEffects(soundMode: SoundMode, volume: number = 0.5) {
  const audioCtxRef = useRef<AudioContext | null>(null)

  // Initialize AudioContext lazily on user gesture
  const getAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx()
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }, [])

  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close()
      }
    }
  }, [])

  const playKeySound = useCallback((isSpace: boolean = false, isError: boolean = false) => {
    if (soundMode === 'off') return
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const gainNode = ctx.createGain()
    gainNode.connect(ctx.destination)
    gainNode.gain.setValueAtTime(volume * 0.4, now)

    // Slight organic pitch variation (+/- 4%)
    const pitchJitter = 1 + (Math.random() * 0.08 - 0.04)

    if (isError) {
      // Soft muffled error thud
      const osc = ctx.createOscillator()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(140, now)
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.08)

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(300, now)

      osc.connect(filter)
      filter.connect(gainNode)

      gainNode.gain.setValueAtTime(volume * 0.35, now)
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

      osc.start(now)
      osc.stop(now + 0.08)
      return
    }

    if (soundMode === 'thock') {
      // Tactile Brown / Thocky Switch: low-frequency damped punch + filtered white noise
      const baseFreq = (isSpace ? 110 : 150) * pitchJitter
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(baseFreq, now)
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.06)

      // Noise click
      const bufferSize = ctx.sampleRate * 0.02
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }
      const noise = ctx.createBufferSource()
      noise.buffer = buffer

      const noiseFilter = ctx.createBiquadFilter()
      noiseFilter.type = 'bandpass'
      noiseFilter.frequency.setValueAtTime(isSpace ? 450 : 700, now)
      noiseFilter.Q.setValueAtTime(3, now)

      const noiseGain = ctx.createGain()
      noiseGain.gain.setValueAtTime(0.2, now)
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02)

      noise.connect(noiseFilter)
      noiseFilter.connect(gainNode)

      osc.connect(gainNode)

      gainNode.gain.setValueAtTime(volume * 0.45, now)
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.07)

      noise.start(now)
      osc.start(now)
      osc.stop(now + 0.07)
    } else if (soundMode === 'clicky') {
      // Cherry MX Blue style: sharp click transient + snap
      const snapFreq = (isSpace ? 1800 : 2600) * pitchJitter
      const osc = ctx.createOscillator()
      osc.type = 'square'
      osc.frequency.setValueAtTime(snapFreq, now)
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.03)

      const filter = ctx.createBiquadFilter()
      filter.type = 'highpass'
      filter.frequency.setValueAtTime(1000, now)

      osc.connect(filter)
      filter.connect(gainNode)

      gainNode.gain.setValueAtTime(volume * 0.25, now)
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.035)

      osc.start(now)
      osc.stop(now + 0.035)
    } else if (soundMode === 'typewriter') {
      // Vintage mechanical typewriter metallic hammer tap
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      osc1.type = 'sawtooth'
      osc2.type = 'sine'
      osc1.frequency.setValueAtTime((isSpace ? 400 : 850) * pitchJitter, now)
      osc2.frequency.setValueAtTime((isSpace ? 900 : 1800) * pitchJitter, now)
      osc1.frequency.exponentialRampToValueAtTime(150, now + 0.05)

      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(1400, now)
      filter.Q.setValueAtTime(4, now)

      osc1.connect(filter)
      osc2.connect(filter)
      filter.connect(gainNode)

      gainNode.gain.setValueAtTime(volume * 0.35, now)
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.055)

      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + 0.055)
      osc2.stop(now + 0.055)
    }
  }, [soundMode, volume, getAudioContext])

  return { playKeySound }
}
