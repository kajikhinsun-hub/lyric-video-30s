import rawAnalysis from "../data/audioAnalysis.json";

export interface AudioFrameMetrics {
  rms: number;
  bass: number;
  vocal: number;
  beatPulse: number;
  isBeatPeak: boolean;
}

interface AudioAnalysisDataset {
  durationSec: number;
  sampleRate: number;
  fps: number;
  totalFrames: number;
  bpm: number;
  beatOffsetSec: number;
  beats: number[];
  rms: number[];
  bass: number[];
  vocal: number[];
}

const dataset = rawAnalysis as AudioAnalysisDataset;

const sampleSmoothed = (arr: number[], frame: number): number => {
  const len = arr.length;
  if (len === 0) return 0;
  const idx = Math.max(0, Math.min(len - 1, Math.round(frame)));
  const prev = arr[Math.max(0, idx - 1)];
  const cur = arr[idx];
  const next = arr[Math.min(len - 1, idx + 1)];
  return prev * 0.25 + cur * 0.5 + next * 0.25;
};

/**
 * Returns precomputed audio-reactive metrics (O(1) per frame for fast Remotion rendering).
 */
export const getAudioMetricsAtFrame = (
  frame: number,
  fps: number = dataset.fps
): AudioFrameMetrics => {
  const t = frame / fps;
  const rms = sampleSmoothed(dataset.rms, frame);
  const bass = sampleSmoothed(dataset.bass, frame);
  const vocal = sampleSmoothed(dataset.vocal, frame);

  // Beat pulse from detected BPM grid + bass reinforcement
  const beatLen = 60 / dataset.bpm;
  const phase = ((((t - dataset.beatOffsetSec) / beatLen) % 1) + 1) % 1;
  const rawBeat = Math.exp(-phase * 5.2);
  const beatPulse = Math.min(1, rawBeat * 0.72 + bass * 0.45);

  return {
    rms,
    bass,
    vocal,
    beatPulse,
    isBeatPeak: rawBeat > 0.72,
  };
};

/**
 * Generates deterministic audio-reactive spectrum bar values for the subtle visualizer.
 */
export const getVisualizerBars = (
  frame: number,
  barCount: number,
  fps: number = dataset.fps
): number[] => {
  const {rms, bass, vocal, beatPulse} = getAudioMetricsAtFrame(frame, fps);
  const bars: number[] = [];
  const half = (barCount - 1) / 2;

  for (let i = 0; i < barCount; i++) {
    const dist = Math.abs(i - half) / Math.max(1, half);
    const centerWeight = 1 - dist * 0.62;
    const bandEnergy = dist < 0.35 ? bass : dist < 0.7 ? vocal : rms;
    const harmonicA = 0.5 + 0.5 * Math.sin(frame * 0.24 + i * 0.58);
    const harmonicB = 0.5 + 0.5 * Math.cos(frame * 0.16 - i * 0.41);
    const height = Math.min(
      1,
      Math.max(
        0.08,
        (bandEnergy * 0.75 + beatPulse * 0.35) *
          (0.45 + harmonicA * 0.35 + harmonicB * 0.2) *
          centerWeight
      )
    );
    bars.push(height);
  }
  return bars;
};
