import React from "react";
import {useCurrentFrame, useVideoConfig} from "remotion";
import {FONTS, SAFE_MARGIN_X, THEME} from "../config";
import {AudioFrameMetrics} from "../utils/audioAnalysis";
import {LyricSegment} from "../utils/lyricTiming";

interface ProgressBarProps {
  audio: AudioFrameMetrics;
  upcomingSegment: LyricSegment | null;
}

const formatTime = (sec: number): string => {
  const s = Math.max(0, Math.floor(sec));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
};

/**
 * Bottom Progress Indicator + Sleek Glass Upcoming Lyric Pill (`src/components/ProgressBar.tsx`)
 * Matches the Gemini 3 action pills & reference glowing cyan progress bar.
 */
export const ProgressBar: React.FC<ProgressBarProps> = React.memo(
  ({audio, upcomingSegment}) => {
    const frame = useCurrentFrame();
    const {fps, durationInFrames} = useVideoConfig();
    const currentSec = frame / fps;
    const totalSec = durationInFrames / fps;
    const progressPct = Math.min(100, Math.max(0, (frame / durationInFrames) * 100));

    return (
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: SAFE_MARGIN_X,
          right: SAFE_MARGIN_X,
          display: "flex",
          flexDirection: "column",
          gap: 36,
          zIndex: 20,
        }}
      >
        {/* Upcoming Lyric Pill Chip (Glass UI style from visual reference) */}
        <div
          style={{
            minHeight: 74,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {upcomingSegment ? (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 32px",
                borderRadius: 999,
                maxWidth: "100%",
                background:
                  "linear-gradient(160deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.03))",
                border: `1.5px solid ${THEME.glassBorder}`,
                boxShadow: "0 16px 40px rgba(0, 0, 0, 0.42)",
              }}
            >
              <span
                style={{
                  color: THEME.cyanHighlight,
                  fontFamily: FONTS.mono,
                  fontSize: 28,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                +
              </span>
              <span
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: 30,
                  fontWeight: 500,
                  color: THEME.textMuted,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {upcomingSegment.text}
              </span>
            </div>
          ) : null}
        </div>

        {/* Thin Glowing Cyan Progress Track & Timecode */}
        <div style={{display: "flex", flexDirection: "column", gap: 12}}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: FONTS.mono,
              fontSize: 17,
              letterSpacing: 2,
              color: THEME.textMuted,
            }}
          >
            <span>{formatTime(currentSec)}</span>
            <span>{formatTime(totalSec)}</span>
          </div>

          <div
            style={{
              width: "100%",
              height: 10,
              borderRadius: 999,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progressPct.toFixed(2)}%`,
                height: "100%",
                borderRadius: 999,
                background: `linear-gradient(90deg, ${THEME.electricBlue}, ${THEME.cyanHighlight}, ${THEME.blueWhiteGlow})`,
                boxShadow: `0 0 ${16 + audio.beatPulse * 14}px ${THEME.cyanHighlight}`,
              }}
            />
          </div>
        </div>
      </div>
    );
  }
);
