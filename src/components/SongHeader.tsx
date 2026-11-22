import React from "react";
import {interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {FONTS, SAFE_MARGIN_X, SAFE_MARGIN_Y, SONG_META, THEME} from "../config";
import {AudioFrameMetrics} from "../utils/audioAnalysis";
import {LyricSection} from "../utils/lyricTiming";

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/**
 * Signature 4-pointed blue-white gradient sparkle emblem (from Gemini 3 & Reference)
 */
export const SparkleMark: React.FC<{
  size: number;
  gradientId: string;
  glowStrength?: number;
  whiteMode?: boolean;
}> = ({size, gradientId, glowStrength = 0.7, whiteMode = false}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    style={{
      filter: `drop-shadow(0 0 ${Math.round(size * 0.28 * glowStrength)}px ${THEME.cyanHighlight})`,
      flexShrink: 0,
    }}
  >
    <defs>
      <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={whiteMode ? "#FFFFFF" : "#9CC5FF"} />
        <stop offset="55%" stopColor={whiteMode ? "#D6EEFF" : "#3B82F6"} />
        <stop offset="100%" stopColor={whiteMode ? "#7DD3FC" : "#2563EB"} />
      </linearGradient>
    </defs>
    <path
      d="M50 3 C54 34 66 46 97 50 C66 54 54 66 50 97 C46 66 34 54 3 50 C34 46 46 34 50 3 Z"
      fill={`url(#${gradientId})`}
    />
  </svg>
);

const SECTION_LABELS: Record<LyricSection, string> = {
  intro: "INTRO",
  verse: "VERSE",
  chorus: "CHORUS",
  bridge: "BRIDGE",
  instrumental: "INTERLUDE",
  outro: "OUTRO",
};

interface SongHeaderProps {
  audio: AudioFrameMetrics;
  section: LyricSection;
}

/**
 * Top Song Header (`src/components/SongHeader.tsx`)
 * Displays song title + sparkle mark + clean decorative section badge inside safe margins.
 */
export const SongHeader: React.FC<SongHeaderProps> = React.memo(
  ({audio, section}) => {
    const frame = useCurrentFrame();
    const {fps} = useVideoConfig();
    const t = frame / fps;

    const opacity = interpolate(t, [0.35, 0.85], [0, 1], CLAMP);
    const translateY = interpolate(t, [0.35, 0.85], [-16, 0], CLAMP);
    const isChorus = section === "chorus";

    return (
      <div
        style={{
          position: "absolute",
          top: SAFE_MARGIN_Y,
          left: SAFE_MARGIN_X,
          right: SAFE_MARGIN_X,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          opacity,
          transform: `translateY(${translateY}px)`,
          zIndex: 20,
        }}
      >
        {/* Left: Sparkle Emblem + Song Title */}
        <div style={{display: "flex", alignItems: "center", gap: 20}}>
          <div style={{transform: `scale(${1 + audio.beatPulse * 0.08})`}}>
            <SparkleMark
              size={58}
              gradientId="headerSparkle"
              glowStrength={0.6 + audio.beatPulse * 0.5}
            />
          </div>
          <div style={{display: "flex", flexDirection: "column", gap: 4}}>
            <span
              style={{
                fontFamily: FONTS.sans,
                fontSize: 40,
                fontWeight: 600,
                letterSpacing: -1.1,
                color: THEME.textPrimary,
                lineHeight: 1.05,
                textShadow: `0 0 24px rgba(0, 194, 255, ${(0.28 + audio.beatPulse * 0.22).toFixed(2)})`,
              }}
            >
              {SONG_META.title}
            </span>
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: 16,
                letterSpacing: 3.2,
                color: THEME.textMuted,
                textTransform: "uppercase",
              }}
            >
              {SONG_META.languageLabel} &bull; {Math.round(SONG_META.bpm)} BPM
            </span>
          </div>
        </div>

        {/* Right: Minimal Futuristic Section Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 22px",
            borderRadius: 999,
            background: isChorus
              ? "linear-gradient(135deg, rgba(0, 194, 255, 0.22), rgba(47, 107, 255, 0.28))"
              : "rgba(15, 27, 56, 0.58)",
            border: `1.5px solid ${isChorus ? "rgba(56, 189, 248, 0.55)" : THEME.glassBorder}`,
            boxShadow: isChorus
              ? `0 0 ${20 + audio.beatPulse * 14}px rgba(0, 194, 255, 0.32)`
              : "none",
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              backgroundColor: isChorus ? THEME.cyanHighlight : THEME.royalBlue,
              boxShadow: `0 0 10px ${THEME.cyanHighlight}`,
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: 2.5,
              color: THEME.blueWhiteGlow,
            }}
          >
            {SECTION_LABELS[section]}
          </span>
        </div>
      </div>
    );
  }
);
