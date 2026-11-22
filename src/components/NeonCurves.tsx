import React from "react";
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from "remotion";
import {THEME} from "../config";
import {AudioFrameMetrics} from "../utils/audioAnalysis";
import {LyricSection} from "../utils/lyricTiming";

interface NeonCurvesProps {
  audio: AudioFrameMetrics;
  section: LyricSection;
  isInstrumental: boolean;
}

/**
 * Elegant Curved Blue/Cyan Neon Ribbons, Moving Light Trails & Signature Rotating Arc
 * Directly inspired by both `01-source-song.mp4` (Gemini 3 blurred spinning cyan arc)
 * and `02-visual-style-reference.mp4` (curved glowing ring behind lyrics).
 */
export const NeonCurves: React.FC<NeonCurvesProps> = React.memo(
  ({audio, section, isInstrumental}) => {
    const frame = useCurrentFrame();
    const {width, height, fps} = useVideoConfig();
    const t = frame / fps;

    const cx = width / 2;
    const cy = height / 2 - 20;
    const isChorus = section === "chorus";
    const isBridge = section === "bridge";

    const ringRadius = isChorus
      ? 438 + audio.beatPulse * 14
      : isBridge
        ? 410 + audio.beatPulse * 10
        : 425 + audio.beatPulse * 8;

    const rotationSpeed = isChorus ? 92 : isInstrumental ? 110 : 70;
    const ringOpacity = (isChorus ? 0.92 : 0.78) + audio.beatPulse * 0.08;
    const trailDashOffset = -t * (isChorus ? 260 : 175);

    return (
      <AbsoluteFill style={{pointerEvents: "none", overflow: "hidden"}}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="neonRibbonA" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={THEME.electricBlue} stopOpacity="0" />
              <stop offset="45%" stopColor={THEME.cyanHighlight} stopOpacity="0.85" />
              <stop offset="75%" stopColor={THEME.blueWhiteGlow} stopOpacity="0.95" />
              <stop offset="100%" stopColor={THEME.electricBlue} stopOpacity="0" />
            </linearGradient>

            <linearGradient id="neonRibbonB" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={THEME.cyanHighlight} stopOpacity="0" />
              <stop offset="50%" stopColor={THEME.electricBlue} stopOpacity="0.75" />
              <stop offset="100%" stopColor={THEME.cyanSoft} stopOpacity="0" />
            </linearGradient>

            <linearGradient id="ringArcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={THEME.blueWhiteGlow} />
              <stop offset="45%" stopColor={THEME.cyanHighlight} />
              <stop offset="100%" stopColor={THEME.electricBlue} />
            </linearGradient>

            <filter id="softCyanBloom" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="14" />
            </filter>
          </defs>

          {/* 1. Elegant Sweeping Upper Curved Neon Line + Moving Light Trail */}
          <path
            d={`M -80 ${420 + Math.sin(t * 0.7) * 26} C 260 ${260 + Math.cos(t * 0.6) * 34}, 760 ${560 + Math.sin(t * 0.55) * 30}, 1160 ${350 + Math.cos(t * 0.65) * 24}`}
            fill="none"
            stroke="url(#neonRibbonA)"
            strokeWidth={isChorus ? 3.5 : 2.2}
            opacity={0.38 + audio.rms * 0.25}
          />
          <path
            d={`M -80 ${420 + Math.sin(t * 0.7) * 26} C 260 ${260 + Math.cos(t * 0.6) * 34}, 760 ${560 + Math.sin(t * 0.55) * 30}, 1160 ${350 + Math.cos(t * 0.65) * 24}`}
            fill="none"
            stroke={THEME.blueWhiteGlow}
            strokeWidth={3}
            strokeDasharray="190 980"
            strokeDashoffset={trailDashOffset}
            strokeLinecap="round"
            opacity={0.65 + audio.beatPulse * 0.25}
          />

          {/* 2. Elegant Sweeping Lower Curved Neon Line + Counter Light Trail */}
          <path
            d={`M -80 ${1480 + Math.cos(t * 0.65) * 24} C 320 ${1340 + Math.sin(t * 0.58) * 32}, 780 ${1600 + Math.cos(t * 0.5) * 28}, 1160 ${1410 + Math.sin(t * 0.72) * 22}`}
            fill="none"
            stroke="url(#neonRibbonB)"
            strokeWidth={isChorus ? 3.2 : 2.0}
            opacity={0.34 + audio.rms * 0.22}
          />
          <path
            d={`M -80 ${1480 + Math.cos(t * 0.65) * 24} C 320 ${1340 + Math.sin(t * 0.58) * 32}, 780 ${1600 + Math.cos(t * 0.5) * 28}, 1160 ${1410 + Math.sin(t * 0.72) * 22}`}
            fill="none"
            stroke={THEME.cyanHighlight}
            strokeWidth={2.8}
            strokeDasharray="160 1050"
            strokeDashoffset={-trailDashOffset * 0.9}
            strokeLinecap="round"
            opacity={0.58 + audio.beatPulse * 0.25}
          />

          {/* 3. Signature Rotating Cyan Neon Loading Arc (Gemini 3 + Reference Ring) */}
          <g transform={`rotate(${t * rotationSpeed} ${cx} ${cy})`}>
            {/* Soft outer bloom layer */}
            <circle
              cx={cx}
              cy={cy}
              r={ringRadius}
              fill="none"
              stroke={THEME.cyanHighlight}
              strokeWidth={34 + audio.beatPulse * 10}
              strokeDasharray="720 2050"
              strokeLinecap="round"
              opacity={0.24 + audio.beatPulse * 0.16}
              filter="url(#softCyanBloom)"
            />
            {/* Crisp inner electric-cyan arc */}
            <circle
              cx={cx}
              cy={cy}
              r={ringRadius}
              fill="none"
              stroke="url(#ringArcGrad)"
              strokeWidth={isChorus ? 6.5 : 5}
              strokeDasharray="720 2050"
              strokeLinecap="round"
              opacity={ringOpacity}
            />
          </g>

          {/* 4. Secondary Subtle Counter-Rotating Outer Hairline Orbit */}
          <g transform={`rotate(${-t * 28} ${cx} ${cy})`}>
            <circle
              cx={cx}
              cy={cy}
              r={ringRadius + 46}
              fill="none"
              stroke={THEME.electricBlue}
              strokeWidth={1.6}
              strokeDasharray="240 620 90 1800"
              strokeLinecap="round"
              opacity={0.26 + audio.rms * 0.18}
            />
          </g>
        </svg>
      </AbsoluteFill>
    );
  }
);
