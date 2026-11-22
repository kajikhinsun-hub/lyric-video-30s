// Pakai: tulis lirik di lyrics.txt (satu baris per baris lirik, urut sesuai lagu),
// lalu jalankan: npm run lyrics
// Skrip membagi 30 detik ke semua baris sesuai panjang teks, dibulatkan ke ketukan.
import fs from "node:fs";

const DURATION = 30;
const LEAD_IN = 1.0; // jeda awal (intro terang ~1 detik)
const TAIL = 2.0; // jeda akhir (outro logo ~2 detik)
const BPM = 140;
const grid = 60 / BPM / 2; // setengah ketukan

const lines = fs
  .readFileSync("lyrics.txt", "utf8")
  .split(/\r?\n/)
  .map((s) => s.trim())
  .filter(Boolean);

if (lines.length === 0) {
  console.error("lyrics.txt kosong. Isi dulu, satu baris lirik per baris.");
  process.exit(1);
}

const span = DURATION - LEAD_IN - TAIL;
const weights = lines.map((l) => Math.max(8, l.length));
const total = weights.reduce((a, b) => a + b, 0);

let cursor = LEAD_IN;
const out = lines.map((text, i) => {
  const dur = (weights[i] / total) * span;
  const start = Math.round(cursor / grid) * grid;
  cursor += dur;
  return {start, text};
});

const result = out.map((l, i) => ({
  start: +l.start.toFixed(2),
  end: +(i < out.length - 1 ? out[i + 1].start : DURATION - TAIL).toFixed(2),
  text: l.text,
}));

fs.writeFileSync("public/lyrics.json", JSON.stringify({lines: result}, null, 2));
console.log(`Selesai: ${result.length} baris ditulis ke public/lyrics.json`);
console.log("Cek di Studio (npm start), lalu geser angka start/end di lyrics.json kalau ada yang meleset.");
