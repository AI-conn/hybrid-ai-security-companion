# Hybrid AI Security Companion

Chrome extension for security researchers. On-device AI inference via Gemini Nano 4, cloud fallback via Firebase AI Logic.

## What It Does

Four tools for bug bounty work:

- **Summarize** — extracts vulnerability class, affected piece, attack trail, and severity from raw reports
- **Attack Scenario** — writes the exploit route in Google VRP format
- **Redact** — scrubs emails, contact numbers, and names before sharing findings
- **Severity** — rates findings Critical to Info with a one-line justification

## How It Works

The extension checks if Chrome's built-in Gemini Nano 4 model is available. If yes, prompts run on-device: free, confidential, offline. If no, the same call goes to Gemini in the cloud through Firebase AI Logic.

The menu shows a badge — green ON-DEVICE or blue CLOUD — so you can see which runtime answered.

## Firebase Products

- **Firebase AI Logic** — hybrid inference engine (required by hackathon)
- **App Check** — guards the cloud calls
- **Analytics** — usage tracking

## Run It

```bash
npm install
npm run build
```

Load `dist/` as an unpacked extension in Chrome.

## License

Apache-2.0

## Built For

#BuildHybridAI 2026 — Firebase AI Logic Hybrid Inference SDK