# Shot List — Hybrid AI Security Companion

One row per shot. Record every shot as its own clip with 3 s of lead-in and tail; cut in the edit.
Framings: **WIDE** = full browser window 1920×1080; **CLOSE** = popup.html opened as a tab (`chrome-extension://<EXT_ID>/public/popup.html`) so the 380px UI fills the frame — verify the badge renders in tab mode before shooting anything.

---

## Pre-flight checklist (do ALL of these before rolling)

| # | Check | Pass condition |
|---|---|---|
| P1 | Extension loads and renders | Popup shows `Model: ON-DEVICE · Gemini Nano 4` or `CLOUD · …` — **never** stuck on "Checking model availability..." (catches bundling/module-resolution breakage; current `dist/` contains only bundled JS, so confirm the shipped loadable build) |
| P2 | Nano enabled in demo profile | `chrome://flags` → Prompt API enabled; `chrome://components` → "Optimization Guide On Device" = Ready |
| P3 | CLOUD trigger verified in the actual build | Run `LONG_ADVISORY` through Summarize once. If result says `[CLOUD]` → fallback is input-size based, script A applies. If it stays `[ON-DEVICE]`, the build switches on availability only → use contingency B: second Chrome profile/VM without Nano (or toggle the flag off) for Segment 3, and record with the Contingency B narration |
| P4 | Latency measured | Stopwatch each button once. If any result > 3 s, adjust the "comes back in seconds" line or trim dead air in the edit |
| P5 | Inputs locked | Paste the exact strings below into a scratch file; use them unchanged in every take so all takes are identical |
| P6 | No secrets on screen | No Firebase console with real keys, no `firebase-config.json`, no terminal with env vars. Repo page shown must be the public GitHub URL |

---

## Test inputs (fake data only — example.com, 555 numbers)

**SHORT_REPORT** (Segment 2, ~500 chars — Nano handles this comfortably):

```
Title: Stored XSS in comment rendering
Component: web/app/comments/template.php
Steps:
1. Create an account.
2. Post a comment containing <img src=x onerror=alert(document.cookie)>.
3. Any user who views the thread triggers the payload in their session context.
Observed: Script executes with victim cookies; session token readable via document.cookie.
Expected: Output encoded with contextual escaping on render.
Impact: Account takeover of any user viewing the comment thread. Affects all threads created before the patch ships.
```

**LONG_ADVISORY** (Segment 3 — assemble, don't hand-write): SHORT_REPORT + append these blocks, repeating the pattern until the pre-flight run (P3) returns `[CLOUD]`:

```
Appendix A — CVE-style description: full narrative of the injection class, historical
variants, framework-specific escaping pitfalls, and CSP interaction notes. (repeat to ~400 words)

Appendix B — Affected versions table in text form: version, branch, patch status,
backport availability, EOL date. (repeat to ~400 words)

Appendix C — Patch review discussion: reviewer comments, escaping strategy debate,
test coverage notes, regression risks. (repeat to ~400 words)

Appendix D — Mailing list excerpts and triage thread quotes. (repeat as needed)
```

Lock the final string into `video/assets/long-advisory.txt` before recording. Target: big enough to visibly overflow a small model's context (usually a 1,000+ word paste clears it — trust the P3 run, not a token estimate).

**SCENARIO_INPUT** (Segment 4):

```
Vulnerability: IDOR on invoice export endpoint. GET /api/v2/invoices/<id>/export returns
any invoice when the ID is guessed, even for accounts in a different organization.
```

**PII_INPUT** (Segment 4):

```
Reporter: Jane Doe, jane.doe@example.com, +1 (808) 555-0142, 123 King St, Honolulu.
Found while fuzzing the login endpoint at https://api.example.com/v2/auth. Client IP
during testing: 203.0.113.42. Manager contact: Bob Roe, bob.roe@example.com, +1 (808) 555-0199.
```

**SEVERITY_INPUT** (Segment 4):

```
Unauthenticated account enumeration via login error message differences. Valid emails
return "incorrect password", invalid emails return "user not found". No rate limit observed.
```

---

## Shots

| # | Time | Dur | Framing | Action (exact) | Expected on screen | Overlay / annotation |
|---|---|---|---|---|---|---|
| 01 | 0:00–0:15 | 15 s | WIDE→CLOSE | Popup open, empty. Slow punch-in 100%→115%. No clicks | Badge `ON-DEVICE · Gemini Nano 4` (green) | Caption fade-in at 0:10: **"private by default"** (small, bottom) |
| 02 | 0:15–0:20 | 5 s | CLOSE | Click textarea → Ctrl+V SHORT_REPORT | Report fills the field | none |
| 03 | 0:20–0:30 | 10 s | CLOSE | Click **Summarize** (green primary btn) | `Processing...` → result `[ON-DEVICE]` + 4-line summary | Green box around `[ON-DEVICE]` prefix AND the top badge, simultaneous |
| 04 | 0:30–0:45 | 15 s | CLOSE | None — hold. Slow punch-in on result | Structured summary readable | Sequential highlight: vuln type → component → attack path → severity |
| 05 | 0:45–0:52 | 7 s | CLOSE | Select-all + Delete → Ctrl+V LONG_ADVISORY | Field fills, scrollbar appears | Tiny caption: "input exceeds on-device context" (A) / "no on-device model in this profile" (B) |
| 06 | 0:52–1:05 | 13 s | CLOSE | Click **Summarize** | `Processing...` → `[CLOUD]` + summary | Blue box around `[CLOUD]` prefix; caption: **"routed via Firebase AI Logic"** |
| 07 | 1:05–1:15 | 10 s | CLOSE | Esc (closes popup) → click extension icon (popup mode) or Cmd/Ctrl+R (tab mode) | Top badge re-evaluates: `CLOUD · Gemini via Firebase AI Logic` (blue) | Arrow from `[CLOUD]` result to the flipped badge. HOLD the full 10 s — judges need to read it |
| 08 | 1:15–1:24 | 9 s | CLOSE | Clear → paste SCENARIO_INPUT → click **Attack Scenario** | `[ON-DEVICE]` + VRP-format paragraph | Caption: "Google VRP format" |
| 09 | 1:24–1:33 | 9 s | CLOSE | Clear → paste PII_INPUT → click **Redact PII** | `[ON-DEVICE]` + `[EMAIL]` `[PHONE]` `[NAME]` `[ADDRESS]` tokens | Circle the tokenized replacements |
| 10 | 1:33–1:45 | 12 s | CLOSE | Clear → paste SEVERITY_INPUT → click **Severity** | `[ON-DEVICE]` + rating + one-line justification | 3-frame montage at the end: all four result boxes stacked |
| 11 | 1:45–2:15 | 30 s | DIAGRAM | Animated SVG/slide, dark `#0d1117`. Arrow animations timed to narration lines | Diagram from demo-script.md §5 | Labels: "private · free · offline" / "long context · always available". Fire the branch arrows exactly on "If both are yes… / If either is no…" |
| 12 | 2:15–2:27 | 12 s | WIDE | Browser → GitHub repo → scroll to License + Firebase products section | README, Apache-2.0 heading visible | Text overlay: **"Apache-2.0"** |
| 13 | 2:27–2:40 | 13 s | END CARD | Static card | Repo URL · `#BuildHybridAI` · "Firebase AI Logic · Gemini Nano 4 + cloud Gemini" | none |
| 14 | 2:40–2:45 | 5 s | END CARD | Freeze (padding to 2:45) | Same card | none |

---

## Take discipline

- 3 takes minimum per shot; keep the last clean one. Delete the rest before archiving.
- Every Segment 3 take gets a stopwatch check against the P3 baseline — if the `[CLOUD]` result took noticeably longer than in pre-flight, retake with the profile already warmed up (run the long input once before rolling).
- Segment 4 shots reuse the same popup session as Segment 2 (badge stays ON-DEVICE). Only Segment 3 moves the mode. Keep it that way — it's the story.
- If a Cloud result takes > 8 s on camera, add a 0.5 s speed-ramp in the edit and note it — do not cut the mode prefix.

## Assets to produce before recording

1. `video/assets/long-advisory.txt` — locked LONG_ADVISORY string (P3-verified)
2. `video/assets/diagram.html` or `.svg` — Segment 5 diagram, dark theme, arrow animations
3. `video/assets/end-card.png` — Segment 13 card, 1920×1080
4. `video/assets/thumbnail.png` — see youtube-metadata.md §Thumbnail

## Deliverable check before upload

- [ ] Exported MP4 duration ≤ 2:50 (verified in a player, not the editor timeline)
- [ ] Badge flip in Segment 3 readable at 480p (test by watching the export at low quality — judges may)
- [ ] No take shows "Checking model availability..." stuck state
- [ ] Audio peak ≤ −3 dB, no clipping on the word "CLOUD"
