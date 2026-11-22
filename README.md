# Javanese Lyric Typography Music Video (Remotion)

Video lirik tipografi kinetik vertikal (**1080×1920**, **30 FPS**, **30.03 detik / 901 frame**) berbahasa Jawa (Ngoko) yang terinspirasi gaya visual futuristik dark-navy / electric-blue / cyan UI (*Gemini 3 & reference style*) dan dirender 100% di **GitHub Actions**.

## Arsitektur Modular

- `src/config.ts` — Palet warna deep navy / electric blue / cyan, Google Fonts (`Inter` & `JetBrains Mono`), metadata lagu, dan durasi sinkron audio.
- `src/data/lyrics.json` — Data lirik Bahasa Jawa asli (Ngoko) lengkap dengan timestamp frase, timestamp per kata (`words`), `section`, `animation`, dan `emphasis`.
- `src/data/audioAnalysis.json` — Hasil pra-komputasi amplitudo audio per frame (`rms`, `bass`, `vocal`, `bpm: 133.5`, `beats`) agar render cepat & deterministik.
- `src/components/`:
  - `Background.tsx` — Latar gradien deep navy sinematik, dot-grid referensi, dan partikel mikro audio-reactive.
  - `NeonCurves.tsx` — Kurva neon biru-cyan, light trails bergerak, dan cincin blur cyan berputar.
  - `SongHeader.tsx` — Ikon bintang 4-sudut, judul lagu, label dialek/BPM, dan badge section (`VERSE`, `CHORUS`, `BRIDGE`, `INTERLUDE`).
  - `LyricText.tsx` — Engine 10 gaya tipografi kinetik di atas kartu kaca responsif dengan margin aman mobile (`76px`).
  - `AudioVisualizer.tsx` — Visualizer spektrum halus audio-reactive + mode jeda instrumental.
  - `ProgressBar.tsx` — Chip lirik berikutnya (`+ ...`) dan progress bar tipis cyan bercahaya.
- `src/compositions/LyricVideo.tsx` — Komposisi utama (Intro Sparkle -> Lirik Dinamis -> Outro Sparkle).
- `src/utils/` — `audioAnalysis.ts`, `lyricTiming.ts`, `animations.ts`.
- `scripts/verify-whisper.py` — Script QA verifikasi Whisper multibahasa (`faster-whisper`) yang berjalan di server GitHub Actions.

## Render di GitHub Actions

Push perubahan ke branch `main` atau buka tab **Actions** -> **Render video** -> **Run workflow**. Seluruh proses berat (Whisper QA, TypeScript check, 4 preview stills, render Remotion MP4, optimasi FFmpeg) berjalan di cloud GitHub tanpa membebani perangkat lokal.
