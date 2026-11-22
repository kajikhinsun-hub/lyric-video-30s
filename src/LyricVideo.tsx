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
import lyricsData from "../public/lyrics.json";
import {BEAT_OFFSET, BPM, THEME, TITLE} from "./config";

type Line = {start: number; end: number; text: string};
const lines = (lyricsData as {lines: Line[]}).lines.filter((l) => l.text.trim() !== "");

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const FONT = "'SF Pro Display', Inter, 'Helvetica Neue', Arial, sans-serif";

// Bintang empat sudut (bentuk generik) dengan gradasi biru dan glow
const Sparkle: React.FC<{size: number; id: string; glow?: number; white?: boolean}> = ({size, id, glow = 0.6, white}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    style={{filter: `drop-shadow(0 0 ${size * 0.3 * glow}px ${THEME.glow})`}}
  >
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={white ? "#ffffff" : "#8ab4ff"} />
        <stop offset="1" stopColor={white ? "#cfe9ff" : "#2f6bff"} />
      </linearGradient>
    </defs>
    <path d="M50 2 C54 34 66 46 98 50 C66 54 54 66 50 98 C46 66 34 54 2 50 C34 46 46 34 50 2 Z" fill={`url(#${id})`} />
  </svg>
);

const Background: React.FC<{pulse: number; t: number; w: number; h: number}> = ({pulse, t, w, h}) => {
  const cx = w / 2;
  const cy = h / 2;
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 20% 15%, ${THEME.blue}33 0%, transparent 45%),
                       radial-gradient(circle at 50% 52%, ${THEME.glow}${Math.round(24 + pulse * 28).toString(16).padStart(2, "0")} 0%, transparent 58%)`,
        }}
      />
      <svg width={w} height={h} style={{position: "absolute", inset: 0}}>
        <defs>
          <pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.6" fill="#8fb6ff" fillOpacity="0.12" />
          </pattern>
        </defs>
        <rect width={w} height={h} fill="url(#dots)" />
      </svg>
      {/* cincin loading blur, mirip "Analyzing..." */}
      <svg width={w} height={h} style={{position: "absolute", inset: 0}}>
        <g transform={`rotate(${t * 80} ${cx} ${cy})`}>
          <circle
            cx={cx}
            cy={cy}
            r={430}
            fill="none"
            stroke={THEME.glow}
            strokeWidth={46}
            strokeDasharray="760 1940"
            strokeLinecap="round"
            opacity={0.3 + pulse * 0.2}
            style={{filter: "blur(16px)"}}
          />
          <circle
            cx={cx}
            cy={cy}
            r={430}
            fill="none"
            stroke={THEME.accent}
            strokeWidth={6}
            strokeDasharray="760 1940"
            strokeLinecap="round"
            opacity={0.8}
          />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const AnimatedLine: React.FC<{line: Line}> = ({line}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const words = line.text.trim().split(/\s+/);
  const size = line.text.length > 30 ? 84 : line.text.length > 18 ? 100 : 118;
  const exit = interpolate(t, [line.end - 0.25, line.end], [1, 0], clamp);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        opacity: exit,
        filter: `blur(${(1 - exit) * 12}px)`,
      }}
    >
      {words.map((w, i) => {
        const f = frame - Math.round(line.start * fps) - i * 3;
        const s = spring({frame: f, fps, config: {damping: 18, stiffness: 140}});
        const opacity = interpolate(f, [0, 8], [0, 1], clamp);
        const blur = interpolate(f, [0, 10], [14, 0], clamp);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              margin: "4px 13px",
              fontSize: size,
              fontWeight: 500,
              letterSpacing: -2,
              color: THEME.text,
              opacity,
              filter: `blur(${blur}px)`,
              transform: `translateY(${(1 - s) * 50}px)`,
              textShadow: `0 0 34px ${THEME.glow}77`,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

const glass: React.CSSProperties = {
  background: "linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))",
  border: "1.5px solid rgba(255,255,255,0.14)",
  boxShadow: "0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)",
};

export const LyricVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();
  const t = frame / fps;

  const beatLen = 60 / BPM;
  const phase = ((((t - BEAT_OFFSET) / beatLen) % 1) + 1) % 1;
  const pulse = Math.exp(-phase * 5);

  let activeIdx = -1;
  lines.forEach((l, i) => {
    if (t >= l.start && t < l.end) activeIdx = i;
  });
  const active = activeIdx >= 0 ? lines[activeIdx] : null;
  const upNext = activeIdx >= 0 ? lines[activeIdx + 1] : lines.find((l) => l.start > t);

  const progress = frame / durationInFrames;
  const master = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], clamp);

  // Intro: layar terang dengan bintang, lalu masuk ke mode gelap
  const introOpacity = interpolate(t, [0.55, 0.95], [1, 0], clamp);
  const introStar = spring({frame, fps, config: {damping: 14, stiffness: 120}});
  const titleReveal = interpolate(frame, [8, 22], [0, 1], clamp);

  // Outro: logo reveal di layar hitam
  const outroOpacity = interpolate(t, [27.6, 28.4], [0, 1], clamp);
  const outroStar = spring({frame: Math.max(0, frame - Math.round(27.6 * fps)), fps, config: {damping: 12, stiffness: 100}});

  return (
    <AbsoluteFill style={{backgroundColor: THEME.bg, opacity: master, fontFamily: FONT}}>
      <Audio src={staticFile("audio.mp3")} />

      <Background pulse={pulse} t={t} w={width} h={height} />

      {/* Header: bintang + judul */}
      <div style={{position: "absolute", top: 130, left: 90, display: "flex", alignItems: "center", gap: 22, opacity: interpolate(t, [0.9, 1.4], [0, 1], clamp)}}>
        <Sparkle size={64} id="sp-head" />
        <span style={{color: THEME.text, fontSize: 46, fontWeight: 500, letterSpacing: -1}}>{TITLE}</span>
      </div>

      {/* Kartu kaca berisi lirik */}
      <AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>
        <div
          style={{
            ...glass,
            borderRadius: 64,
            padding: "70px 40px",
            width: width - 140,
            minHeight: 360,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transform: `scale(${1 + pulse * 0.012})`,
            opacity: active ? 1 : 0,
          }}
        >
          {active ? <AnimatedLine key={activeIdx} line={active} /> : null}
        </div>
      </AbsoluteFill>

      {/* Chip baris berikutnya */}
      {upNext ? (
        <div style={{position: "absolute", bottom: 300, width: "100%", display: "flex", justifyContent: "center", padding: "0 70px", boxSizing: "border-box"}}>
          <div style={{...glass, borderRadius: 999, padding: "22px 40px", display: "flex", alignItems: "center", gap: 20, maxWidth: width - 140}}>
            <span style={{color: THEME.accent, fontSize: 44, lineHeight: 1}}>+</span>
            <span style={{color: "rgba(255,255,255,0.65)", fontSize: 38, fontWeight: 500}}>{upNext.text}</span>
          </div>
        </div>
      ) : null}

      {/* Progress bar bercahaya seperti tombol cyan */}
      <div style={{position: "absolute", bottom: 150, left: 90, right: 90, height: 16, background: "rgba(255,255,255,0.10)", borderRadius: 8}}>
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            borderRadius: 8,
            background: `linear-gradient(90deg, ${THEME.blue}, ${THEME.accent})`,
            boxShadow: `0 0 ${24 + pulse * 18}px ${THEME.glow}`,
          }}
        />
      </div>

      {/* Outro */}
      <AbsoluteFill style={{backgroundColor: "#000", opacity: outroOpacity, justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 26}}>
        <div style={{transform: `scale(${0.6 + 0.4 * outroStar})`}}>
          <Sparkle size={130} id="sp-out" white glow={1} />
        </div>
        <span style={{color: THEME.text, fontSize: 96, fontWeight: 500, letterSpacing: -3, textShadow: `0 0 40px ${THEME.glow}`}}>{TITLE}</span>
      </AbsoluteFill>

      {/* Intro terang */}
      <AbsoluteFill
        style={{
          opacity: introOpacity,
          background: "radial-gradient(circle at 50% 50%, #ffffff 0%, #d9dde4 100%)",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
          gap: 24,
        }}
      >
        <div style={{transform: `scale(${0.4 + 0.6 * introStar}) rotate(${(1 - introStar) * 40}deg)`}}>
          <Sparkle size={120} id="sp-in" glow={0.25} />
        </div>
        <span style={{color: "#2b2f36", fontSize: 92, fontWeight: 500, letterSpacing: -3, opacity: titleReveal}}>{TITLE}</span>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
