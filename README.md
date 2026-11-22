# Lyric Video 30 detik (Remotion)

Klip audio: lagu asli mulai **0:56**, durasi **30 detik** (sudah dipotong ke `public/audio.mp3`).
Format: 1080x1920, 30 fps.
Gaya: UI motion graphics ala peluncuran produk. Intro layar terang dengan bintang, lalu mode gelap biru-cyan dengan kartu kaca (glass) berisi lirik yang muncul kata demi kata dengan efek blur, cincin loading yang berdenyut mengikuti ketukan (~140 BPM), progress bar cyan bercahaya, dan outro logo di layar hitam.

## Cara pakai
1. `npm install`
2. Buka `lyrics.txt`, isi lirik yang dinyanyikan di rentang 0:56 sampai 1:26 (satu baris per baris). Intro memakai ~1 detik pertama dan outro ~2 detik terakhir, jadi lirik dibagi ke detik 1 sampai 28.
3. `npm run lyrics` untuk membuat `public/lyrics.json` otomatis.
4. `npm start` untuk preview di Remotion Studio. Kalau waktu ada yang meleset, edit angka `start` dan `end` (detik) di `public/lyrics.json`.
5. `npm run build` untuk render ke `out/video.mp4`, atau push ke GitHub dan jalankan workflow "Render video".

## Yang bisa diubah
- `src/config.ts`: judul, warna, BPM, offset ketukan, ukuran video.
- `src/LyricVideo.tsx`: gaya animasi teks dan latar.
