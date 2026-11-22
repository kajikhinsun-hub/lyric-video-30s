import React from "react";
import {useCurrentFrame, useVideoConfig} from "remotion";
import {FONTS, THEME} from "../config";
import {AudioFrameMetrics, getVisualizerBars} from "../utils/audioAnalysis";

interface AudioVisualizerProps {
  audio: AudioFrameMetrics;
  isInstrumental: boolean;
}

/**
 * Subtle Audio-Reactive Visualizer (`src/components/AudioVisualizer.tsx`)
 * - Compact electric-blue/cyan spectrum bars beneath the main lyric card
 * - Expands gracefully into a centered atmospheric pulse during instrumental pauses
 */
export const AudioVisualizer: React.FC<AudioVisualizerProps> = React.memo(
  ({audio, isInstrumental}) => {
    const frame = useCurrentFrame();
    const {fps} = useVideoConfig();

    const barCount = isInstrumental ? 32 : 24;
    const bars = getVisualizerBars(frame, barCount, fps);
    const maxH = isInstrumental ? 130 : 54;

    return (
      <div
        style={{
          position: "absolute",
          top: isInstrumental ? "46%" : 1260,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
          zIndex: 14,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: isInstrumental ? 10 : 8,
            height: maxH + 12,
          }}
        >
          {bars.map((val, idx) => {
            const h = Math.max(8, Math.round(val * maxH));
            const isCenter = Math.abs(idx - (barCount - 1) / 2) < barCount * 0.25;
            return (
              <div
                key={idx}
                style={{
                  width: isInstrumental ? 8 : 6,
                  height: h,
                  borderRadius: 999,
                  background: isCenter
                    ? `linear-gradient(180deg, ${THEME.blueWhiteGlow}, ${THEME.cyanHighlight}, ${THEME.electricBlue})`
                    : `linear-gradient(180deg, ${THEME.cyanSoft}, ${THEME.electricBlue})`,
                  opacity: isInstrumental ? 0.85 : 0.45 + audio.rms * 0.35,
                  boxShadow: isCenter
                    ? `0 0 ${12 + audio.beatPulse * 10}px rgba(0, 194, 255, 0.55)`
                    : "none",
                }}
              />
            );
          })}
        </div>

        {isInstrumental ? (
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 17,
              letterSpacing: 6,
              color: THEME.cyanSoft,
              opacity: 0.72 + audio.beatPulse * 0.25,
            }}
          >
            INSTRUMENTAL
          </div>
        ) : null}
      </div>
    );
  }
);
