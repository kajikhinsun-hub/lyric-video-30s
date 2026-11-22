import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {AudioVisualizer} from "../components/AudioVisualizer";
import {Background} from "../components/Background";
import {LyricText} from "../components/LyricText";
import {NeonCurves} from "../components/NeonCurves";
import {ProgressBar} from "../components/ProgressBar";
import {SongHeader, SparkleMark} from "../components/SongHeader";
import {FONTS, SONG_META, THEME} from "../config";
import {getAudioMetricsAtFrame} from "../utils/audioAnalysis";
import {getLyricStateAtTime} from "../utils/lyricTiming";

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/**
 * Main Automated Javanese Lyric Typography Video Composition (`src/compositions/LyricVideo.tsx`)
 * - 1080x1920 (9:16), 30 FPS, exact source audio duration (30.016s / 901 frames)
 * - Bright Gemini-3-style Sparkle Intro (0.00-0.48s) melting smoothly into deep navy mode
 * - Audio-reactive Background, NeonCurves, SongHeader, LyricText (10 kinetic styles), AudioVisualizer, ProgressBar
 * - Cinematic Dark Sparkle Outro (29.50-30.03s) preserving full original song audio
 */
export const LyricVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const timeSec = frame / fps;

  const audio = getAudioMetricsAtFrame(frame, fps);
  const {activeSegment, upcomingSegment, activeSection, isInstrumentalPause} =
    getLyricStateAtTime(timeSec);

  // Subtle macro camera breath synced to musical energy (keeps layout within safe margins)
  const macroScale =
    1 +
    interpolate(frame, [0, durationInFrames], [0, 0.015], CLAMP) +
    (activeSection === "chorus" ? audio.beatPulse * 0.008 : 0);

  // Fast bright Gemini 3 sparkle intro (0.00s - 0.50s) — fades cleanly as first lyric enters at 0.40s
  const introOpacity = interpolate(timeSec, [0.22, 0.52], [1, 0], CLAMP);
  const introSpring = spring({
    frame,
    fps,
    config: {damping: 14, stiffness: 150},
  });

  // Cinematic dark sparkle outro (29.45s - 30.03s)
  const outroOpacity = interpolate(timeSec, [29.45, 29.8], [0, 1], CLAMP);
  const outroSpring = spring({
    frame: Math.max(0, frame - Math.round(29.45 * fps)),
    fps,
    config: {damping: 14, stiffness: 120},
  });
  const masterFadeOut = interpolate(
    frame,
    [durationInFrames - 6, durationInFrames],
    [1, 0],
    CLAMP
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.almostBlack,
        fontFamily: FONTS.sans,
        opacity: masterFadeOut,
        overflow: "hidden",
      }}
    >
      {/* Original Source Song Audio (Unmodified Duration & Content) */}
      <Audio src={staticFile(SONG_META.audioFile)} />

      {/* Main Visual Composition Stage */}
      <AbsoluteFill
        style={{
          transform: `scale(${macroScale.toFixed(4)})`,
          transformOrigin: "50% 50%",
        }}
      >
        <Background audio={audio} section={activeSection} />

        <NeonCurves
          audio={audio}
          section={activeSection}
          isInstrumental={isInstrumentalPause}
        />

        <SongHeader audio={audio} section={activeSection} />

        <LyricText
          key={activeSegment ? activeSegment.id : "instrumental"}
          segment={activeSegment}
          audio={audio}
        />

        <AudioVisualizer audio={audio} isInstrumental={isInstrumentalPause} />

        <ProgressBar audio={audio} upcomingSegment={upcomingSegment} />
      </AbsoluteFill>

      {/* Bright Sparkle Intro Overlay (0.00s - 0.52s) */}
      {introOpacity > 0.005 ? (
        <AbsoluteFill
          style={{
            opacity: introOpacity,
            background:
              "radial-gradient(circle at 50% 50%, #FFFFFF 0%, #E2E8F0 65%, #CBD5E1 100%)",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            gap: 24,
            zIndex: 40,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              transform: `scale(${0.45 + 0.55 * introSpring}) rotate(${(1 - introSpring) * 45}deg)`,
            }}
          >
            <SparkleMark size={112} gradientId="introSparkle" glowStrength={0.3} />
          </div>
          <span
            style={{
              fontFamily: FONTS.sans,
              fontSize: 78,
              fontWeight: 600,
              letterSpacing: -2.4,
              color: "#1E293B",
            }}
          >
            {SONG_META.title}
          </span>
        </AbsoluteFill>
      ) : null}

      {/* Cinematic Black Sparkle Outro (29.45s - 30.03s) */}
      {outroOpacity > 0.005 ? (
        <AbsoluteFill
          style={{
            backgroundColor: "#000000",
            opacity: outroOpacity,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            gap: 24,
            zIndex: 45,
            pointerEvents: "none",
          }}
        >
          <div style={{transform: `scale(${0.65 + 0.35 * outroSpring})`}}>
            <SparkleMark
              size={112}
              gradientId="outroSparkle"
              glowStrength={1.0}
              whiteMode
            />
          </div>
          <span
            style={{
              fontFamily: FONTS.sans,
              fontSize: 78,
              fontWeight: 600,
              letterSpacing: -2.4,
              color: THEME.textPrimary,
              textShadow: `0 0 36px ${THEME.cyanHighlight}`,
            }}
          >
            {SONG_META.title}
          </span>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
