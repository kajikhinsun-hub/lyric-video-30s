// Pengaturan utama video. Ubah di sini.
export const FPS = 30;
export const DURATION_SECONDS = 30; // batas video 30 detik
export const WIDTH = 1080;
export const HEIGHT = 1920; // vertikal 9:16 (TikTok/Reels)

// Klip audio = lagu asli mulai detik 0:56 selama 30 detik (sudah dipotong di public/audio.mp3)
export const SONG_START_AT = "0:56";

// Hasil analisis kasar dari audio: ketukan sekitar 140 BPM.
// Kalau denyut visual terasa meleset, geser BEAT_OFFSET (detik) sedikit demi sedikit.
export const BPM = 140;
export const BEAT_OFFSET = 0.1;

export const TITLE = "Judul Lagu"; // tampil di intro, header, dan outro

// Gaya: UI motion graphics gelap ala peluncuran produk (biru-cyan, glass, glow)
export const THEME = {
  bg: "#040810",
  glow: "#00b7ff",
  accent: "#1fc8ff",
  blue: "#3b6dff",
  text: "#ffffff",
};
