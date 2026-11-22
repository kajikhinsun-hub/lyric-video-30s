import {loadFont as loadInter} from "@remotion/google-fonts/Inter";
import {loadFont as loadJetBrainsMono} from "@remotion/google-fonts/JetBrainsMono";
import audioAnalysis from "./data/audioAnalysis.json";

const inter = loadInter();
const jetbrains = loadJetBrainsMono();

export const FPS = 30;
export const DURATION_SECONDS = audioAnalysis.durationSec;
export const TOTAL_FRAMES = audioAnalysis.totalFrames; // 901 frames (~30.03s) matching exact source audio
export const WIDTH = 1080;
export const HEIGHT = 1920; // 9:16 vertical mobile-first composition
export const SAFE_MARGIN_X = 76;
export const SAFE_MARGIN_Y = 110;

export const SONG_META = {
  title: "Wis Tak Lilakke",
  subtitle: "JAVANESE LYRIC EDITION",
  languageLabel: "JV // NGOKO",
  bpm: audioAnalysis.bpm,
  beatOffsetSec: audioAnalysis.beatOffsetSec,
  audioFile: "audio.mp3",
} as const;

// Color Palette reconstructed from visual reference (Gemini 3 + deep navy/electric blue UI)
export const THEME = {
  almostBlack: "#040710",
  deepNavy: "#09152E",
  midNavy: "#10234A",
  electricBlue: "#2F6BFF",
  royalBlue: "#3B82F6",
  cyanHighlight: "#00C2FF",
  cyanSoft: "#38BDF8",
  blueWhiteGlow: "#DDF2FF",
  textPrimary: "#FFFFFF",
  textMuted: "rgba(218, 234, 255, 0.68)",
  glassFill: "rgba(14, 26, 52, 0.44)",
  glassBorder: "rgba(130, 196, 255, 0.18)",
  glassHighlight: "rgba(255, 255, 255, 0.14)",
} as const;

export const FONTS = {
  sans: `${inter.fontFamily}, "SF Pro Display", "Helvetica Neue", Arial, sans-serif`,
  mono: `${jetbrains.fontFamily}, "Fira Code", monospace`,
} as const;
