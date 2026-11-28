/* assemble.mjs — builds the final hackathon demo video.
   Inputs:  video/audio/*.mp3 (kokoro narration, p-free)
            video/frames/*.png (real popup captures, CDP)
            video/diagram/png/*.png (architecture cards, same design system)
   Output:  video/hybrid-demo.mp4 (1080p, burned-in captions, narration track)
   Every segment = still + zoompan + narration; captions burned via .srt.
   Usage: node video/assemble.mjs [on-device-frames-dir]   (optional ON-DEVICE take) */

import { spawnSync, execFileSync } from "node:child_process";
import { mkdirSync, existsSync, statSync, readFileSync, rmSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const A = path.join(ROOT, "video", "audio");
const F = path.join(ROOT, "video", "frames");
const D = path.join(ROOT, "video", "diagram", "png");
const TMP = path.join(ROOT, "video", "tmp");
const OUT = path.join(ROOT, "video", "hybrid-demo.mp4");

const ffprobe = (f) => parseFloat(execFileSync("ffprobe", ["-v","error","-show_entries","format=duration","-of","csv=p=0", f]).toString().trim());
const run = (cmd, args, quiet = true) => {
  const r = spawnSync(cmd, args, { stdio: quiet ? "ignore" : "inherit" });
  if (r.status !== 0) { console.error(`FAILED: ${cmd} ${args.join(" ").slice(0, 120)}`); process.exit(1); }
};

/* timeline: [audio, image, srtText] — images auto-picked; on-device dir overrides frames dir */
const onDevice = process.argv[2] ? path.resolve(process.argv[2]) : null;
const frame = (n) => (onDevice && existsSync(path.join(onDevice, n))) ? path.join(onDevice, n) : path.join(F, n);

const timeline = [
  { audio: "01-hook.mp3",    img: path.join(D, "intro.png") },
  { audio: "02-honest.mp3",  img: frame("02-input.png") },
  { audio: "03-hybrid.mp3",  img: frame("03-result.png") },
  { audio: "04-tools.mp3",   img: path.join(D, "tools.png") },
  { audio: "05-arch.mp3",    img: path.join(D, "arch-5.png") },
  { audio: "06-cta.mp3",     img: path.join(D, "endcard.png") },
];

rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

/* 1. per-segment video: zoompan 1080p over the still for the audio duration */
const segFiles = [];
for (const [i, seg] of timeline.entries()) {
  const dur = ffprobe(path.join(A, seg.audio));
  const frames = Math.ceil(dur * 30);
  const segFile = path.join(TMP, `seg-${i}.mp4`);
  run("ffmpeg", [
    "-y", "-loop", "1", "-i", seg.img,
    "-vf", `scale=2400:-2,zoompan=z='min(zoom+0.0006,1.12)':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=30,format=yuv420p`,
    "-t", dur.toFixed(3), "-r", "30",
    "-c:v", "libx264", "-preset", "fast", "-crf", "20",
    segFile,
  ]);
  segFiles.push({ file: segFile, dur });
  console.log(`seg ${i}: ${path.basename(seg.img)} × ${dur.toFixed(1)}s`);
}

/* 2. concat video */
const listV = path.join(TMP, "list.txt");
writeFileSync(listV, segFiles.map((s) => `file '${s.file}'`).join("\n"));
const silent = path.join(TMP, "video-silent.mp4");
run("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", listV, "-c", "copy", silent]);

/* 3. concat narration with exact segment offsets */
const filterParts = [];
let cursor = 0; const inputs = [];
segFiles.forEach((s, i) => {
  inputs.push("-i", path.join(A, timeline[i].audio));
  filterParts.push(`[${i}:a]adelay=${Math.round(cursor * 1000)}|${Math.round(cursor * 1000)}[a${i}]`);
  cursor += s.dur;
});
const mixIn = segFiles.map((_, i) => `[a${i}]`).join("");
const narrated = path.join(TMP, "narration.m4a");
run("ffmpeg", [
  "-y", ...inputs,
  "-filter_complex", `${filterParts.join(";")};${mixIn}amix=inputs=${segFiles.length}:normalize=0[aout]`,
  "-map", "[aout]", "-c:a", "aac", "-b:a", "192k", narrated,
]);

/* 4. captions timed to the same offsets → .srt → burned in */
const CAPTIONS = {
  0: ["Security researchers handle sensitive data.\nWhat if your AI could do it without sending\nanything to the cloud?",
      "This extension runs Gemini Nano 4 entirely on-device —\nand only reaches for the cloud when it has to."],
  1: ["Load it in, hit Summarize.\nThe badge names the runtime that answered.",
      "On this machine the local model isn't loaded —\nthe engine routes the identical request to Gemini\nin the cloud through Firebase AI Logic.",
      "Every click is live — nothing staged.\nSame code paths a local model would take."],
  2: ["Now the twist that makes this hybrid:\na full advisory, far beyond the local context window.",
      "The result is tagged CLOUD.\nSame call, same interface —\non-device when feasible, cloud when needed."],
  3: ["Four tools run through the same engine:",
      "Attack Scenario — the attack route in Google's reward format.",
      "Redact — scrubs emails, contact numbers, names.",
      "Severity — Critical to Info, with a one-line justification."],
  4: ["One call into the Firebase AI Logic SDK.",
      "Two questions: is Nano available, does the text fit?",
      "Yes → local: confidential, free, offline.\nNo → the same call goes to Gemini in the cloud."],
  5: ["Full source on GitHub — free software license.",
      "Clone, install the libraries, load dist/ into Chrome.",
      "#BuildHybridAI 2026 — thanks for watching."],
};
const ts = (t) => new Date(t * 1000).toISOString().slice(11, 23).replace(".", ",");
let srt = "", idx = 1; cursor = 0;
segFiles.forEach((s, i) => {
  const n = CAPTIONS[i].length;
  CAPTIONS[i].forEach((text, j) => {
    const start = cursor + (s.dur * j) / n;
    const end = cursor + (s.dur * (j + 1)) / n - 0.15;
    srt += `${idx++}\n${ts(start)} --> ${ts(end)}\n${text}\n\n`;
  });
  cursor += s.dur;
});
const srtFile = path.join(TMP, "captions.srt");
writeFileSync(srtFile, srt);

/* 5. mux: silent video + narration + burned captions */
run("ffmpeg", ["-y", "-i", silent, "-i", narrated,
  "-vf", `subtitles=${srtFile}:force_style='FontName=DejaVu Sans,FontSize=15,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=2,Shadow=1,MarginV=36'`,
  "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-c:a", "copy",
  "-shortest", "-movflags", "+faststart", OUT]);

const total = ffprobe(OUT);
console.log(`\nDONE: ${OUT} — ${total.toFixed(1)}s (${(total/60).toFixed(2)} min), ${Math.round(statSync(OUT).size/1024/1024)} MB`);
if (total > 180) console.log("WARNING: exceeds 3-minute limit — trim needed");
