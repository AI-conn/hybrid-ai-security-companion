# YouTube Metadata — Hybrid AI Security Companion

Everything in this file is paste-ready. Replace `YOUR_GITHUB_URL` with the public repo URL before uploading, and keep the hackathon hashtag.

---

## Title (pick one, ≤100 chars)

1. `Hybrid AI Security Companion — on-device Gemini Nano 4 + Firebase AI Logic cloud fallback`  ← recommended
2. `Private AI for security research: Gemini Nano 4 on-device, Gemini cloud fallback (#BuildHybridAI)`
3. `On-device AI that escalates to the cloud — Chrome extension for bug hunters (#BuildHybridAI)`

---

## Description (paste as-is)

```
A Chrome extension for security researchers that runs Gemini Nano 4 entirely on-device —
and falls back to Gemini in the cloud through Firebase AI Logic only when the on-device
model can't handle the request. One model call, two runtimes.

0:00 The problem: sensitive data in security workflows
0:15 Summarize a bug report — fully on-device
0:45 The hybrid switch: oversized input → CLOUD fallback via Firebase AI Logic
1:15 Attack scenarios, PII redaction, severity classification
1:45 Architecture: one Firebase AI Logic call, routed on-device or cloud
2:15 Source code and setup

What it does:
• Summarize — bug report → vulnerability type, component, attack path, severity
• Attack Scenario — Google VRP-format exploit narrative
• Redact PII — strips emails, phone numbers, names, addresses before sharing
• Severity — Critical → Info rating with justification

How the hybrid works: the engine checks whether Gemini Nano is available and whether the
input fits its context window. Fits → inference never leaves the machine (private, free,
offline). Doesn't fit → the identical request goes to Gemini in the cloud through Firebase
AI Logic. The popup shows which mode handled every result: [ON-DEVICE] or [CLOUD].

Source (Apache-2.0): YOUR_GITHUB_URL
Stack: Chrome Extension MV3 · Firebase AI Logic · Gemini Nano 4 (on-device) · Gemini 2.0 Flash (cloud)

Built for the #BuildHybridAI hackathon — Firebase AI Logic Hybrid Inference.
```

---

## Tags (comma-separated, paste into the tags field)

```
hybrid ai, firebase ai logic, gemini nano, on-device ai, chrome extension, bug bounty, security research, vulnerability triage, pii redaction, firebase, gemini, ai inference, privacy, buildhybridai, hackathon
```

---

## Thumbnail (1280×720)

**Concept A (recommended):** the real popup screenshot, close enough that the badges are readable. Green `ON-DEVICE · Gemini Nano 4` badge on the left, blue `CLOUD · Gemini via Firebase AI Logic` badge on the right, a bold arrow between them. Small extension shield icon top-left.

**Concept B:** split screen — left half dark popup with `[ON-DEVICE]` result, right half the same popup with `[CLOUD]` result, headline across the middle.

Text on the thumbnail (max 4 words, one of these):
- `PRIVATE → CLOUD`
- `RUNS ON-DEVICE`
- `HYBRID AI, PROVEN`

Rules: real screenshots only (Concept A/B are both real UI states from the shots — no rendered mockups of output we didn't produce), text ≥ 40px equivalent height so it survives mobile, keep faces out unless the narrator wants to be the brand.

---

## Compliance checklist (hackathon rules → where satisfied)

| Rule | Status | Evidence in the video |
|---|---|---|
| ≤ 3 minutes (first 3 min evaluated) | ✅ target 2:45 | Export verified in a player; runtime budget table in demo-script.md |
| Publicly visible on YouTube | ✅ | Upload step 4 sets Public; verify logged-out before submitting |
| English | ✅ | Narration and all on-screen text English |
| Project functioning on Chrome | ✅ | Shots 02–10: real clicks in Chrome, real results |
| Shows Firebase AI Logic at runtime | ✅ | `[CLOUD]` result path (Shot 06), reopened badge reading `CLOUD · Gemini via Firebase AI Logic` (Shot 07), popup footer line, architecture segment |
| Hybrid switch clearly visible | ✅ | Shot 06–07: result prefix flips `[ON-DEVICE]`→`[CLOUD]` and top badge re-evaluates on camera — held for 10 s |

**Final gate before submitting the form:** watch the published video logged-out, end to end, once. If the badge flip isn't obvious at 480p, re-record Segment 3 — don't submit a video where the judging criterion is ambiguous.
