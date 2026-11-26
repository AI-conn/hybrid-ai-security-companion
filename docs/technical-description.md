# Technical Description — Hybrid AI Security Companion

## Architecture

```
┌─────────────────────────────────────────────┐
│                  Chrome Menu                │
│  Input box + four tool buttons + badge     │
└─────────────────────┬───────────────────────┘
                      │ click
                      ▼
┌─────────────────────────────────────────────┐
│        Hybrid engine (src/ai-engine.js)     │
│                                             │
│  1. Is Gemini Nano 4 available on device?   │
│     self.ai.languageModel.capabilities()    │
│                                             │
│  2. Does input fit its context window?      │
│                                             │
│  ┌──── YES ────┐      ┌──── NO ────┐        │
│  ▼             │      ▼             │       │
│  ON-DEVICE     │      CLOUD         │       │
│  Gemini Nano 4 │      Gemini 2.0    │       │
│  (local, free) │      (Firebase AI) │       │
│  └─────────────┘      └─────────────┘       │
└─────────────────────────────────────────────┘
```

## On-device path

The engine calls `self.ai.languageModel.capabilities()`. If the result shows the model is ready, it creates a session with a system prompt and sends the query. Nothing leaves the machine.

## Cloud path

If the device model is unavailable, the engine builds a Gemini model through Firebase AI Logic:

```js
const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, {
  model: "gemini-2.0-flash",
  systemInstruction: systemPrompt,
  generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
});
```

## Firebase products

| Product | Use |
|---|---|
| Firebase AI Logic | Cloud inference endpoint (`firebase/ai`) |
| App Check | Auto-enabled during setup; guards the endpoint from unauthorized use |
| Analytics | Records tool usage |

## File map

| File | Role |
|---|---|
| `manifest.json` | Chrome MV3 manifest |
| `src/ai-engine.js` | Hybrid inference, Firebase init, tool prompts |
| `src/popup.js` | Menu wiring, badge display, result rendering |
| `src/background.js` | Service worker, page text capture |
| `src/options.js` | Configuration view |
| `public/popup.html` | Menu markup and styling |
| `public/options.html` | Options markup |

## The four tools

| Tool | Input | Output |
|---|---|---|
| Summarize | Raw bug report | Vulnerability class, affected piece, attack trail, severity call |
| Attack Scenario | Vulnerability description | Google VRP format route: attacker, gain, method |
| Redact | Security text | Text with emails, contact numbers, and names replaced |
| Severity | Finding | Critical / High / Medium / Low / Info + one-line reason |