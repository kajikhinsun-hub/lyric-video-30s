import lyricsJson from "../data/lyrics.json";

export type LyricSection =
  | "intro"
  | "verse"
  | "chorus"
  | "bridge"
  | "instrumental"
  | "outro";

export type AnimationStyle =
  | "word-reveal"
  | "opacity-fade"
  | "scale-up"
  | "letter-reveal"
  | "horizontal-slide"
  | "blur-sharp"
  | "neon-emphasis"
  | "chorus-dynamic"
  | "beat-pulse";

export interface WordTiming {
  word: string;
  start: number;
  end: number;
}

export interface LyricSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  section: LyricSection;
  animation: AnimationStyle;
  emphasis?: string[];
  words?: WordTiming[];
}

export interface LyricsDocument {
  language: string;
  dialect?: string;
  title: string;
  durationSec: number;
  bpm: number;
  segments: LyricSegment[];
}

export const LYRICS_DATA = lyricsJson as LyricsDocument;

export interface LyricTimelineState {
  activeSegment: LyricSegment | null;
  upcomingSegment: LyricSegment | null;
  activeSection: LyricSection;
  isInstrumentalPause: boolean;
  segmentProgress: number;
}

/**
 * Resolves exact active segment, upcoming lyric preview, and current musical section.
 * Respects natural vocal pauses without ever displaying lyrics before they are sung.
 */
export const getLyricStateAtTime = (timeSec: number): LyricTimelineState => {
  const segments = LYRICS_DATA.segments;
  let activeSegment: LyricSegment | null = null;
  let activeIndex = -1;

  for (let i = 0; i < segments.length; i++) {
    if (timeSec >= segments[i].start && timeSec < segments[i].end) {
      activeSegment = segments[i];
      activeIndex = i;
      break;
    }
  }

  let upcomingSegment: LyricSegment | null = null;
  if (activeIndex >= 0 && activeIndex + 1 < segments.length) {
    upcomingSegment = segments[activeIndex + 1];
  } else {
    upcomingSegment = segments.find((s) => s.start > timeSec) ?? null;
  }

  let activeSection: LyricSection = "instrumental";
  if (timeSec < 0.4) {
    activeSection = "intro";
  } else if (activeSegment) {
    activeSection = activeSegment.section;
  } else if (timeSec >= 27.55 && timeSec < 28.85) {
    activeSection = "instrumental";
  } else if (timeSec >= 29.75) {
    activeSection = "outro";
  } else {
    activeSection = "instrumental";
  }

  const segmentProgress = activeSegment
    ? Math.max(
        0,
        Math.min(
          1,
          (timeSec - activeSegment.start) /
            Math.max(0.01, activeSegment.end - activeSegment.start)
        )
      )
    : 0;

  return {
    activeSegment,
    upcomingSegment,
    activeSection,
    isInstrumentalPause: !activeSegment && timeSec >= 0.4 && timeSec < 29.75,
    segmentProgress,
  };
};

/**
 * Computes normalized word timings if explicit word timestamps are omitted.
 */
export const resolveSegmentWords = (segment: LyricSegment): WordTiming[] => {
  if (segment.words && segment.words.length > 0) {
    return segment.words;
  }
  const tokens = segment.text.trim().split(/\s+/);
  const span = Math.max(0.2, segment.end - segment.start);
  const weights = tokens.map((w) => Math.max(3, w.length));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let cursor = segment.start;

  return tokens.map((word, idx) => {
    const dur = (weights[idx] / totalWeight) * span;
    const item: WordTiming = {
      word,
      start: cursor,
      end: cursor + dur,
    };
    cursor += dur;
    return item;
  });
};
