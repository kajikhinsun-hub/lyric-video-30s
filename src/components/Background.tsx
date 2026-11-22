import React from "react";
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from "remotion";
import {THEME} from "../config";
import {AudioFrameMetrics} from "../utils/audioAnalysis";
import {LyricSection} from "../utils/lyricTiming";

interface BackgroundProps {
  audio: AudioFrameMetrics;
  section: LyricSection;
}

/**
 * Cinematic Deep Navy & Almost-Black Ambient Background (`src/components/Background.tsx`)
 * - Smooth moving atmospheric electric-blue / cyan glow orbs
 * - Subtle geometric dot grid from visual reference
 * - Minimal floating blue-white micro-particles inspired by Gemini 3 particle bloom
 */
export const Background: React.FC<BackgroundProps> = React.memo(
  ({audio, section}) => {
    const frame = useCurrentFrame();
    const {width, height, fps} = useVideoConfig();
    const t = frame / fps;

    const isChorus = section === "chorus";
    const isBridge = section === "bridge";

    // Smooth ambient drift for radial lights
    const orb1X = 24 + Math.sin(t * 0.45) * 10;
    const orb1Y = 18 + Math.cos(t * 0.38) * 7;
    const orb2X = 50 + Math.cos(t * 0.35) * 8;
    const orb2Y = 52 + Math.sin(t * 0.42) * 5;
    const orb3X = 78 + Math.sin(t * 0.3 + 1.2) * 9;
    const orb3Y = 78 + Math.cos(t * 0.34) * 6;

    const centerAlpha = Math.min(
      0.42,
      (isChorus ? 0.24 : isBridge ? 0.2 : 0.16) +
        audio.beatPulse * (isChorus ? 0.14 : 0.08)
    );
    const cornerAlpha = Math.min(0.32, 0.16 + audio.rms * 0.12);

    // Precompute deterministic minimal floating particles once
    const particles = React.useMemo(() => {
      return Array.from({length: 44}).map((_, i) => ({
        x: random(`bg-px-${i}`) * 1080,
        y: random(`bg-py-${i}`) * 1920,
        r: 1.4 + random(`bg-pr-${i}`) * 2.8,
        speedY: 14 + random(`bg-sy-${i}`) * 28,
        driftX: (random(`bg-dx-${i}`) - 0.5) * 26,
        phase: random(`bg-ph-${i}`) * Math.PI * 2,
        isCyan: i % 3 === 0,
        baseOpacity: 0.18 + random(`bg-op-${i}`) * 0.45,
      }));
    }, []);

    return (
      <AbsoluteFill style={{backgroundColor: THEME.almostBlack, overflow: "hidden"}}>
        {/* Multi-layer deep navy cinematic atmospheric gradients */}
        <AbsoluteFill
          style={{
            background: `
              radial-gradient(circle at ${orb1X}% ${orb1Y}%, rgba(47, 107, 255, ${cornerAlpha.toFixed(3)}) 0%, transparent 48%),
              radial-gradient(circle at ${orb2X}% ${orb2Y}%, rgba(0, 194, 255, ${centerAlpha.toFixed(3)}) 0%, rgba(9, 21, 46, 0.52) 44%, transparent 72%),
              radial-gradient(circle at ${orb3X}% ${orb3Y}%, rgba(59, 130, 246, ${(cornerAlpha * 0.7).toFixed(3)}) 0%, transparent 50%),
              linear-gradient(180deg, #060d1f 0%, #040710 52%, #03050c 100%)
            `,
          }}
        />

        {/* Subtle Reference Dot Matrix Texture */}
        <svg
          width={width}
          height={height}
          style={{position: "absolute", inset: 0, pointerEvents: "none"}}
        >
          <defs>
            <pattern
              id="refDotGrid"
              width="44"
              height="44"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="2"
                cy="2"
                r="1.4"
                fill="#8fb6ff"
                fillOpacity={isChorus ? "0.14" : "0.1"}
              />
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#refDotGrid)" />
        </svg>

        {/* Minimal Floating Blue-White Particles (Audio-Reactive Speed & Twinkle) */}
        <svg
          width={width}
          height={height}
          style={{position: "absolute", inset: 0, pointerEvents: "none"}}
        >
          {particles.map((p, idx) => {
            const curY =
              (((p.y - t * p.speedY * (1 + audio.rms * 0.25)) % height) +
                height) %
              height;
            const curX =
              p.x + Math.sin(t * 0.9 + p.phase) * p.driftX;
            const twinkle =
              0.55 + 0.45 * Math.sin(t * 2.4 + p.phase) + audio.beatPulse * 0.25;
            const radius = p.r * (1 + audio.beatPulse * (isChorus ? 0.32 : 0.14));

            return (
              <circle
                key={idx}
                cx={curX}
                cy={curY}
                r={radius}
                fill={p.isCyan ? THEME.cyanSoft : THEME.blueWhiteGlow}
                opacity={Math.min(0.88, p.baseOpacity * twinkle)}
              />
            );
          })}
        </svg>

        {/* Soft Edge Vignette for Editorial Contrast */}
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, transparent 56%, rgba(2, 4, 10, 0.72) 100%)",
            pointerEvents: "none",
          }}
        />
      </AbsoluteFill>
    );
  }
);
