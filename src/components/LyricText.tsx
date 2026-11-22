import React from "react";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {FONTS, SAFE_MARGIN_X, THEME} from "../config";
import {
  computeBeatTextMotion,
  computeSmoothExit,
  computeWordAnimation,
} from "../utils/animations";
import {AudioFrameMetrics} from "../utils/audioAnalysis";
import {
  LyricSegment,
  resolveSegmentWords,
} from "../utils/lyricTiming";

interface LyricTextProps {
  segment: LyricSegment | null;
  audio: AudioFrameMetrics;
}

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/**
 * Centered Kinetic Typography Stage (`src/components/LyricText.tsx`)
 * - Renders active Javanese lyrics inside a sleek frosted dark-navy glass card
 * - Supports all 10 animation styles from `src/utils/animations.ts`
 * - Enforces safe margins (76px horizontal) and smart responsive font sizing so zero letters clip
 * - Automatically adapts typography scale & glow for Verse, Chorus, Bridge, and Outro
 */
export const LyricText: React.FC<LyricTextProps> = ({segment, audio}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  const timeSec = frame / fps;

  if (!segment) {
    return null;
  }

  const isChorus = segment.section === "chorus";
  const isBridge = segment.section === "bridge";
  const words = resolveSegmentWords(segment);
  const emphasisSet = new Set(
    (segment.emphasis ?? []).map((w) => w.toLowerCase())
  );

  // Smooth card entrance + exit
  const segStartFrame = Math.round(segment.start * fps);
  const segLocalFrame = frame - segStartFrame;
  const cardIn = spring({
    frame: segLocalFrame,
    fps,
    config: {damping: 18, stiffness: 130},
  });
  const exit = computeSmoothExit(timeSec, segment.end, 0.24);

  // Responsive font size so long lines wrap cleanly without ever clipping on 1080px mobile screens
  const charLen = segment.text.length;
  const baseFontSize = isChorus
    ? charLen > 20
      ? 86
      : charLen > 12
        ? 102
        : 118
    : charLen > 24
      ? 72
      : charLen > 14
        ? 86
        : 108;

  const cardWidth = width - SAFE_MARGIN_X * 2;
  const cardScale =
    (0.96 + 0.04 * cardIn) *
    exit.scale *
    (1 + audio.beatPulse * (isChorus ? 0.018 : 0.008));

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: `0 ${SAFE_MARGIN_X}px`,
        zIndex: 15,
      }}
    >
      <div
        style={{
          width: cardWidth,
          minHeight: isChorus ? 390 : 340,
          padding: isChorus ? "68px 48px" : "60px 44px",
          borderRadius: isBridge ? 40 : 58,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: isChorus
            ? "linear-gradient(155deg, rgba(16, 42, 88, 0.62) 0%, rgba(8, 17, 38, 0.48) 100%)"
            : isBridge
              ? "linear-gradient(155deg, rgba(12, 24, 52, 0.56) 0%, rgba(6, 12, 28, 0.42) 100%)"
              : "linear-gradient(160deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.025) 100%)",
          border: `1.5px solid ${
            isChorus
              ? `rgba(56, 189, 248, ${(0.34 + audio.beatPulse * 0.24).toFixed(2)})`
              : THEME.glassBorder
          }`,
          boxShadow: isChorus
            ? `0 28px 80px rgba(0, 0, 0, 0.58), 0 0 ${38 + audio.beatPulse * 24}px rgba(0, 194, 255, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.16)`
            : "0 28px 72px rgba(0, 0, 0, 0.52), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
          opacity: Math.min(1, cardIn * 1.4) * exit.opacity,
          transform: `translateY(${exit.translateY.toFixed(1)}px) scale(${cardScale.toFixed(4)})`,
          filter: exit.blurPx > 0.2 ? `blur(${exit.blurPx.toFixed(1)}px)` : undefined,
        }}
      >
        {/* Subtle Decorative Micro-Accent Line Above Chorus/Bridge */}
        {isChorus || isBridge ? (
          <div
            style={{
              width: 72 + audio.beatPulse * 28,
              height: 4,
              borderRadius: 2,
              marginBottom: 28,
              background: `linear-gradient(90deg, ${THEME.electricBlue}, ${THEME.cyanHighlight})`,
              boxShadow: `0 0 16px ${THEME.cyanHighlight}`,
            }}
          />
        ) : null}

        {/* Word-by-Word / Letter-by-Letter Animated Lyric Container */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: isChorus ? "12px 24px" : "10px 20px",
            width: "100%",
            textAlign: "center",
          }}
        >
          {words.map((wItem, wordIdx) => {
            const wordStartFrame = Math.round(wItem.start * fps);
            // Small lead-in (2 frames) for snappy readability without showing prematurely
            const localFrame = frame - (wordStartFrame - 2);
            const isEmphasized = emphasisSet.has(
              wItem.word.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase()
            );
            const isCurrentlySung =
              timeSec >= wItem.start - 0.05 && timeSec <= wItem.end + 0.15;

            const beatMotion = computeBeatTextMotion(
              audio.beatPulse,
              isChorus,
              isEmphasized
            );

            // Style #4: Letter-by-letter reveal (ideal for sustained single-word lines like "Lungamu")
            if (segment.animation === "letter-reveal") {
              const chars = Array.from(wItem.word);
              return (
                <span
                  key={`${segment.id}-${wordIdx}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    transform: `scale(${beatMotion.scaleBoost.toFixed(4)})`,
                  }}
                >
                  {chars.map((ch, cIdx) => {
                    const cf = localFrame - cIdx * 2;
                    const sp = spring({
                      frame: cf,
                      fps,
                      config: {damping: 16, stiffness: 150},
                    });
                    const cOpacity = interpolate(cf, [0, 7], [0, 1], CLAMP);
                    const cBlur = interpolate(cf, [0, 8], [14, 0], CLAMP);
                    return (
                      <span
                        key={cIdx}
                        style={{
                          display: "inline-block",
                          fontFamily: FONTS.sans,
                          fontSize: baseFontSize,
                          fontWeight: 700,
                          letterSpacing: -1.5,
                          lineHeight: 1.15,
                          color: isEmphasized ? THEME.blueWhiteGlow : THEME.textPrimary,
                          opacity: cOpacity,
                          transform: `translateY(${((1 - sp) * 34).toFixed(1)}px)`,
                          filter: cBlur > 0.2 ? `blur(${cBlur.toFixed(1)}px)` : undefined,
                          textShadow: `0 0 ${Math.round(28 * beatMotion.glowBoost)}px rgba(0, 194, 255, 0.65), 0 0 12px rgba(221, 242, 255, 0.45)`,
                        }}
                      >
                        {ch}
                      </span>
                    );
                  })}
                </span>
              );
            }

            // All other kinetic styles via computeWordAnimation
            const anim = computeWordAnimation({
              style: segment.animation,
              localFrame,
              wordIndex: wordIdx,
              fps,
              isEmphasized,
              isCurrentlySung,
              beatPulse: audio.beatPulse,
            });

            const finalScale = anim.scale * beatMotion.scaleBoost;
            const glowPx = Math.round(
              26 * anim.glowMultiplier * beatMotion.glowBoost
            );

            return (
              <span
                key={`${segment.id}-${wordIdx}`}
                style={{
                  display: "inline-block",
                  fontFamily: FONTS.sans,
                  fontSize: isEmphasized && isChorus ? baseFontSize + 8 : baseFontSize,
                  fontWeight: isChorus || isEmphasized ? 800 : 600,
                  letterSpacing: isChorus ? -2.2 : -1.5,
                  lineHeight: 1.16,
                  color: isEmphasized
                    ? THEME.cyanSoft
                    : isCurrentlySung
                      ? THEME.textPrimary
                      : "rgba(235, 245, 255, 0.9)",
                  opacity: anim.opacity,
                  transform: `translate(${anim.translateX.toFixed(1)}px, ${anim.translateY.toFixed(1)}px) scale(${finalScale.toFixed(4)})`,
                  filter: anim.blurPx > 0.2 ? `blur(${anim.blurPx.toFixed(1)}px)` : undefined,
                  textShadow: isEmphasized
                    ? `0 0 ${glowPx}px ${THEME.cyanHighlight}, 0 0 ${Math.round(glowPx * 0.45)}px ${THEME.blueWhiteGlow}`
                    : `0 0 ${Math.round(glowPx * 0.75)}px rgba(0, 194, 255, 0.48)`,
                }}
              >
                {wItem.word}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
