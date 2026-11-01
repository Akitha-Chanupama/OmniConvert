import { getSettings } from './settingsStore';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a delicate, harmonic major-triad chime using the Web Audio API.
 * Requires zero external audio assets and runs completely offline.
 */
export function playSuccessChime(force: boolean = false) {
  if (!force && !getSettings().soundEffects) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Harmonic notes: E5 (659.25Hz), G#5 (830.61Hz), B5 (987.77Hz), E6 (1318.51Hz)
    const notes = [
      { freq: 659.25, time: 0, duration: 0.35, gain: 0.12 },
      { freq: 830.61, time: 0.07, duration: 0.38, gain: 0.13 },
      { freq: 987.77, time: 0.14, duration: 0.42, gain: 0.14 },
      { freq: 1318.51, time: 0.21, duration: 0.55, gain: 0.10 },
    ];

    notes.forEach(({ freq, time, duration, gain: targetGain }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      // Smooth attack and exponential decay envelope
      gain.gain.setValueAtTime(0.0001, now + time);
      gain.gain.exponentialRampToValueAtTime(targetGain, now + time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + duration + 0.05);
    });
  } catch (err) {
    console.debug('Audio chime playback omitted:', err);
  }
}

/**
 * Play a subtle soft failure indicator sound.
 */
export function playErrorChime(force: boolean = false) {
  if (!force && !getSettings().soundEffects) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 310, time: 0, duration: 0.18, gain: 0.1 },
      { freq: 240, time: 0.1, duration: 0.25, gain: 0.08 },
    ];

    notes.forEach(({ freq, time, duration, gain: targetGain }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0.0001, now + time);
      gain.gain.exponentialRampToValueAtTime(targetGain, now + time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + duration + 0.05);
    });
  } catch (err) {
    console.debug('Error chime playback omitted:', err);
  }
}
