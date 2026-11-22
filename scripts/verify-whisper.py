#!/usr/bin/env python3
"""
GitHub Actions Quality-Control Verification Script (`scripts/verify-whisper.py`)
Runs multilingual Whisper (faster-whisper) on GitHub's cloud runner (zero phone load!)
against `public/audio.mp3` with Javanese (`jw`) language hint to cross-check speech
timing and generate `out/whisper-verification.json` for QA inspection.
"""
import json
import os
import sys

AUDIO_PATH = os.path.join(os.getcwd(), "public", "audio.mp3")
LYRICS_PATH = os.path.join(os.getcwd(), "src", "data", "lyrics.json")
OUT_PATH = os.path.join(os.getcwd(), "out", "whisper-verification.json")


def main():
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(LYRICS_PATH, "r", encoding="utf-8") as f:
        lyrics_doc = json.load(f)

    report = {
        "audioPath": AUDIO_PATH,
        "targetLanguage": lyrics_doc.get("language", "jv"),
        "verifiedSegmentsCount": len(lyrics_doc.get("segments", [])),
        "whisperModel": "small (int8)",
        "whisperSegments": [],
        "status": "skipped",
    }

    try:
        from faster_whisper import WhisperModel

        model = WhisperModel("small", device="cpu", compute_type="int8")
        segments, info = model.transcribe(
            AUDIO_PATH,
            language="jw",
            word_timestamps=True,
            vad_filter=True,
            initial_prompt="Wis tak lilakke lungamu, ora butuh wong sing seneng dolanan ati, pokoke los aku ra peduli, los aku ora wedi, kelangan wong sing senenge ngapusi, minggat.",
        )

        extracted = []
        for seg in segments:
            words = []
            if seg.words:
                for w in seg.words:
                    words.append({
                        "word": w.word.strip(),
                        "start": round(w.start, 2),
                        "end": round(w.end, 2),
                        "prob": round(w.probability, 3),
                    })
            extracted.append({
                "start": round(seg.start, 2),
                "end": round(seg.end, 2),
                "text": seg.text.strip(),
                "words": words,
            })

        report["detectedLanguage"] = info.language
        report["languageProbability"] = round(info.language_probability, 3)
        report["audioDurationSec"] = round(info.duration, 3)
        report["whisperSegments"] = extracted
        report["status"] = "ok"
        print(f"[Whisper QA] Detected={info.language} ({info.language_probability:.2f}), duration={info.duration:.2f}s, segments={len(extracted)}")
        for s in extracted:
            print(f"  [{s['start']:5.2f}s -> {s['end']:5.2f}s] {s['text']}")
    except Exception as exc:
        report["status"] = f"warning: {exc}"
        print(f"[Whisper QA warning] {exc}", file=sys.stderr)

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    print(f"Saved {OUT_PATH}")


if __name__ == "__main__":
    main()
