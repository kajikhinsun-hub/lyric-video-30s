import {Easing, interpolate, spring} from "remotion";
import {AnimationStyle} from "./lyricTiming";

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export interface WordTransformResult {
  opacity: number;
  translateX: number;
  translateY: number;
  scale: number;
  blurPx: number;
  glowMultiplier: number;
}

/**
 * Smooth Exit Transition (#8 in Kinetic Typography Engine)
 * Cleanly fades and softens outgoing lines during the last 0.24s of a segment.
 */
export const computeSmoothExit = (
  timeSec: number,
  segmentEndSec: number,
  exitDurationSec = 0.24
): {opacity: number; blurPx: number; translateY: number; scale: number} => {
  const exitStart = segmentEndSec - exitDurationSec;
  const progress = interpolate(timeSec, [exitStart, segmentEndSec], [0, 1], {
    ...CLAMP,
    easing: Easing.in(Easing.cubic),
  });
  return {
    opacity: 1 - progress,
    blurPx: progress * 10,
    translateY: -progress * 18,
    scale: 1 - progress * 0.03,
  };
};

/**
 * Beat-Responsive Subtle Text Movement (#10)
 */
export const computeBeatTextMotion = (
  beatPulse: number,
  isChorus: boolean,
  isEmphasized: boolean
): {scaleBoost: number; glowBoost: number} => {
  const weight = isChorus ? 1.0 : 0.45;
  const emWeight = isEmphasized ? 1.35 : 0.85;
  return {
    scaleBoost: 1 + beatPulse * 0.022 * weight * emWeight,
    glowBoost: 1 + beatPulse * 0.55 * weight * emWeight,
  };
};

/**
 * Reusable Kinetic Typography Engine implementing all 10 animation styles:
 * 1. word-reveal
 * 2. opacity-fade
 * 3. scale-up
 * 4. letter-reveal (handled at character level in LyricText + spring helper here)
 * 5. horizontal-slide
 * 6. blur-sharp
 * 7. neon-emphasis
 * 8. smooth-exit (via computeSmoothExit)
 * 9. chorus-dynamic
 * 10. beat-pulse (via computeBeatTextMotion)
 */
export const computeWordAnimation = (params: {
  style: AnimationStyle;
  localFrame: number;
  wordIndex: number;
  fps: number;
  isEmphasized: boolean;
  isCurrentlySung: boolean;
  beatPulse: number;
}): WordTransformResult => {
  const {
    style,
    localFrame,
    wordIndex,
    fps,
    isEmphasized,
    isCurrentlySung,
    beatPulse,
  } = params;

  const baseOpacity = interpolate(localFrame, [0, 6], [0, 1], CLAMP);
  let translateX = 0;
  let translateY = 0;
  let scale = 1;
  let blurPx = 0;
  let opacity = baseOpacity;
  let glowMultiplier = isEmphasized ? 1.45 : isCurrentlySung ? 1.15 : 0.65;

  switch (style) {
    case "word-reveal": {
      const sp = spring({
        frame: localFrame,
        fps,
        config: {damping: 16, stiffness: 155, mass: 0.9},
      });
      translateY = (1 - sp) * 42;
      blurPx = interpolate(localFrame, [0, 7], [10, 0], CLAMP);
      scale = 0.94 + 0.06 * sp;
      break;
    }

    case "opacity-fade": {
      opacity = interpolate(localFrame, [0, 14], [0, 1], {
        ...CLAMP,
        easing: Easing.out(Easing.cubic),
      });
      translateY = interpolate(localFrame, [0, 14], [14, 0], CLAMP);
      blurPx = interpolate(localFrame, [0, 10], [6, 0], CLAMP);
      break;
    }

    case "scale-up": {
      const sp = spring({
        frame: localFrame,
        fps,
        config: {damping: 12, stiffness: 170, mass: 0.85},
      });
      scale = 0.72 + 0.28 * sp;
      blurPx = interpolate(localFrame, [0, 6], [10, 0], CLAMP);
      translateY = (1 - sp) * 18;
      break;
    }

    case "horizontal-slide": {
      const dir = wordIndex % 2 === 0 ? -1 : 1;
      const sp = spring({
        frame: localFrame,
        fps,
        config: {damping: 17, stiffness: 145},
      });
      translateX = dir * (1 - sp) * 56;
      blurPx = interpolate(localFrame, [0, 7], [8, 0], CLAMP);
      break;
    }

    case "blur-sharp": {
      opacity = interpolate(localFrame, [0, 10], [0, 1], CLAMP);
      blurPx = interpolate(localFrame, [0, 12], [22, 0], {
        ...CLAMP,
        easing: Easing.out(Easing.cubic),
      });
      scale = interpolate(localFrame, [0, 12], [1.08, 1.0], CLAMP);
      break;
    }

    case "chorus-dynamic": {
      const sp = spring({
        frame: localFrame,
        fps,
        config: {damping: 10, stiffness: 195, mass: 0.8},
      });
      scale = 0.8 + 0.2 * sp;
      translateY = (1 - sp) * 48;
      blurPx = interpolate(localFrame, [0, 5], [12, 0], CLAMP);
      glowMultiplier = isEmphasized ? 1.85 : 1.3;
      break;
    }

    case "neon-emphasis":
    case "beat-pulse": {
      const sp = spring({
        frame: localFrame,
        fps,
        config: {damping: 14, stiffness: 160},
      });
      scale = 0.9 + 0.1 * sp + beatPulse * 0.04;
      blurPx = interpolate(localFrame, [0, 6], [10, 0], CLAMP);
      glowMultiplier = 1.5 + beatPulse * 0.7;
      break;
    }

    case "letter-reveal":
    default: {
      opacity = interpolate(localFrame, [0, 5], [0, 1], CLAMP);
      break;
    }
  }

  return {
    opacity,
    translateX,
    translateY,
    scale,
    blurPx,
    glowMultiplier,
  };
};
