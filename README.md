# Hybrid AI Security Companion

Chrome extension for security researchers. On-device AI inference via Gemini Nano 4 with cloud fallback via Firebase AI Logic.

## What It Does

- **Summarize** bug reports into structured findings (type, component, scenario, severity)
- **Draft attack scenarios** in Google VRP format
- **Redact PII** from security text before sharing
- **Classify severity** of findings

## How It Works

Hybrid inference: the extension checks for Chrome's built-in Gemini Nano 4 model. If available, prompts run **on-device** (free, private, offline). If not, it falls back to **cloud inference** via Firebase AI Logic (Gemini 2.0 Flash).

```
┌──────────────────────────────────────┐
│     Chrome Extension Popup           │
├──────────────────────────────────────┤
│  User pastes security text           │
│  Selects task (Summarize/Scenario/   │
│  Redact/Severity)                    │
├──────────────────────────────────────┤
│  Check device model availability     │
│  ├─ Available → Gemini Nano 4       │
│  │   (on-device, private, free)     │
│  └─ Unavailable → Cloud fallback    │
│      (Firebase AI Logic, Gemini)    │
├──────────────────────────────────────┤
│  Result shown with mode badge       │
└──────────────────────────────────────┘
```

## Firebase Products Used

- **Firebase AI Logic** — hybrid inference engine (required)
- **Firebase App Check** — API protection (auto-enabled during setup)
- **Firebase Analytics** — usage tracking

## Setup

1. Clone this repo
2. `npm install`
3. `npm run build`
4. Load `dist/` as an unpacked extension in Chrome
5. Open the popup and start analyzing

## License

Apache-2.0

## Built For

#BuildHybridAI 2026 hackathon — Firebase AI Logic Hybrid Inference SDK
