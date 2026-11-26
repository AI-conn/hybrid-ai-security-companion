# Recording Guide — Hybrid AI Security Companion

Goal: a ≤2:45, 1080p, public YouTube video that shows the extension working in Chrome with the ON-DEVICE ↔ CLOUD switch clearly visible. Written for one person doing everything on one machine. Budget ~3 hours for setup + recording, ~2 hours for edit.

---

## 1. Machine and browser prep

**Demo Chrome profile (ON-DEVICE side)**
1. Create a fresh profile named `demo` — no other tabs, no synced clutter.
2. Hide the bookmarks bar (Ctrl/Cmd+Shift+B). Zoom 100%. Dark theme if available (matches the popup's `#0d1117`).
3. Enable the on-device model: `chrome://flags` → search "Prompt API" → Enabled → relaunch. Then `chrome://components` → "Optimization Guide On Device" → Check for update → wait until it shows up to date / Ready. This can take a few minutes and some disk — do it FIRST.
4. Load the extension: `chrome://extensions` → Developer mode ON → "Load unpacked" → select the app root (the folder containing `manifest.json`).
5. Run pre-flight P1–P6 from shot-list.md. **Do not start recording until every box is green.** In particular: the popup must render the badge (not "Checking model availability...") and one Summarize must return a real result.

**CLOUD side** (only if pre-flight P3 shows the build switches on availability, not input size):
- Easiest: a second profile or a VM/second machine without the Nano component — badge will read `CLOUD · Gemini via Firebase AI Logic` on load.
- Alternative: same profile with the Prompt API flag toggled off (requires relaunch — do it between takes, and record the relaunch out of the clip).

**Extension popup as a tab (the CLOSE framing trick)**
The popup is only 380px wide — upscaled it looks blurry. Instead, open it as a full-width tab:
1. `chrome://extensions` → enable Developer mode → copy the extension ID.
2. Open `chrome-extension://<EXT_ID>/public/popup.html` in a tab.
3. Verify the badge renders and a Summarize returns a result in this tab. If it doesn't render in tab mode, fall back to popup mode + editor punch-ins (scale ~200%) for close-ups.

---

## 2. Screen capture

**Option A — OBS Studio (recommended)**
- Settings → Video: Base + Output canvas 1920×1080, FPS 30.
- Settings → Output → Recording: MP4 or MKV (MKV is crash-safe; remux to MP4 after), encoder x264 or hardware (NVENC), rate control CRF/CQP 18–20, audio track 1 = mic 48 kHz.
- Sources: Window Capture of the Chrome window (not Display Capture — keeps your desktop out of frame). Add a second source for the diagram/end-card slides when needed.
- Mic gain: speak at normal volume, meter peaks around −12 dB. Never let it touch 0.
- Record 3 s of lead-in ("3…2…1" out loud, don't narrate the count in the take) and 3 s of tail per shot. This makes cutting painless.
- Start with a 10 s room-tone recording — used later to patch gaps.

**Option B — no OBS installed**
- Windows: Xbox Game Bar (Win+G) or ShareX screen record.
- macOS: Cmd+Shift+5 → "Record portion of screen" (choose the Chrome window region) — records to desktop as .mov.
- Chrome-only fallback: chrome://flags screencast or `chrome://capture` tooling is not reliable for this — prefer A or B. YouTube needs an actual file upload, so don't rely on streaming tools.

Resolution floor: 1080p. Don't record at 720p "to save space" — the badge text must survive YouTube's compression.

---

## 3. Narration

Live-record narration WITH the screen (simplest sync path for a 3-minute demo):
1. Warm up: read demo-script.md out loud twice, then read it at half speed once.
2. One segment per take. If you fluff a line, keep going and retake the whole segment — mid-segment splicing on voice is where edits start to sound stitched.
3. It's fine to leave pauses; you cut them in the edit. It is NOT fine to rush — a rushed 2:40 video sounds worse than a relaxed 2:45.
4. Read the mode words deliberately: "ON-device" and "CLOUD" get a beat of emphasis, because the judge is watching for exactly those words.
5. Headphones on while recording (prevents speaker bleed into the mic).

If you'd rather do VO after screen capture (silent runs, narrate on a second pass): keep a stopwatch per segment and trim screen clips to the narration in the editor. More control, more work — your call.

---

## 4. Edit

- Cut dead air aggressively; tighten every action to ~0.3 s before the click and ~0.5 s of result visible after.
- Punch-ins: scale 200% on popup close-ups only where the badge/result text needs emphasis. Don't animate punch-ins mid-sentence.
- Captions/overlays: only the ones in shot-list.md. Big, high-contrast, sans-serif. ON-DEVICE in green, CLOUD in blue — same colors as the real badges.
- Segment 5 diagram: pre-render as HTML/SVG → screen-record the animation, or build slides with appear/disappear. Keep arrow animations on the narration beats.
- End card: static 1920×1080 PNG, freeze last 5 s.
- Export: H.264 MP4, 1920×1080, 30 fps, 8–12 Mbps, AAC 192 kbps stereo. Target < 300 MB (a 2:45 video at this spec is ~150–250 MB).
- Verify in a real player (VLC), not the editor preview: total duration ≤ 2:50, badge flip readable at 480p playback.

---

## 5. YouTube upload (hackathon compliance)

1. Go to youtube.com → Create → Upload video. Select the exported MP4.
2. Title, description, tags: copy-paste from `youtube-metadata.md` (it's paste-ready).
3. Audience: **No, it's not made for kids.**
4. Visibility: **Public** — hackathon rule requires publicly visible. Unlisted does NOT count. Double-check in an incognito window that the video loads with no sign-in.
5. Duration check on the watch page: must show ≤ 3:00. Only the first 3 minutes are evaluated.
6. Language: English (narration is English; don't add translated tracks that delay publishing).
7. After publish: copy the watch URL, open it once logged out, confirm audio + captions region render correctly, then paste the URL into the hackathon submission form.
8. Keep: the OBS project / raw clips / exported MP4 under `video/` until judging ends. If judges ask for evidence, you'll want the raw takes.

**Common failure modes to avoid**
- Popup stuck on "Checking model availability..." — means the build is broken, stop and fix, don't narrate over a dead UI.
- `[ON-DEVICE]` shown while the narrator says CLOUD (or vice versa) — the mode prefix and the words must always agree.
- Bookmarks bar, other tabs, or notifications visible — new Chrome profile + Do Not Disturb kills all three.
- Real credentials on screen — no Firebase console with live keys, no `firebase-config.json`, no terminal. The repo page you show must be the public GitHub URL.
- Uploading Unlisted and submitting that link — rejected per rules; make it Public.
