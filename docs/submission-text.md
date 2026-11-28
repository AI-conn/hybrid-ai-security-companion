# Devpost Submission Content

Copy-paste ready. All fields mapped to the submission form.

---

## Project name
Hybrid AI Security Companion

## Tagline (one line)
On-device Gemini Nano 4 for security researchers, with cloud fallback via Firebase AI Logic.

## Detailed description

Hybrid AI Security Companion is a Chrome extension that runs AI inference on-device when Chrome's built-in Gemini Nano 4 is available, and falls back to the cloud through Firebase AI Logic when it isn't. The extension gives security researchers four tools: it summarizes raw bug reports into structured findings, drafts attack scenarios in Google VRP format, redacts emails and contact numbers before sharing, and rates severity from Critical to Info.

The hybrid engine checks two things at load: is Gemini Nano installed on this machine, and does the input fit its context window. If both are yes, inference happens locally — free, confidential, and offline. If either is no, the same call routes to Gemini in the cloud. The menu badge switches between ON-DEVICE (green) and CLOUD (blue) so the runtime is visible.

## What I built during this hackathon

I built the extension source, the Firebase AI Logic integration, and the webpack build. The extension is a Chrome MV3 extension with a service worker and a menu for user input. The AI engine lives in `src/engine.js` and imports `getAI`, `getGenerativeModel`, and `GoogleAIBackend` from `firebase/ai` via `src/firebase.js`. App Check initialization and Analytics usage recording are wired in `src/firebase.js`.

## Value proposition

Security researchers handle exploitable data constantly. Standard cloud AI means sending that data to a third party for inference. This tool keeps the default confidential by running Gemini Nano on the device, and only uses the cloud when the workload exceeds what a local model can do. The result is a private AI layer for bounty work that costs nothing when local and scales when needed.

## How Firebase AI Logic is used

The Firebase integration lives in `src/firebase.js`:

- `initializeApp(firebaseConfig)` from `firebase/app`
- `getAI(app, { backend: new GoogleAIBackend() })` from `firebase/ai`
- `getGenerativeModel(ai, {...})` from `firebase/ai` — used for the cloud fallback path

The engine in `src/engine.js` checks `self.ai.languageModel.capabilities()` and calls `self.ai.languageModel.create()` — Chrome's built-in model API — for the on-device path.

App Check is enforced during setup to guard the cloud endpoint. Analytics records usage.

## Platform
Web (Chrome)

## Repository URL
https://github.com/AI-conn/hybrid-ai-security-companion

## URL for judging and testing
The project is a Chrome extension — it runs locally, not hosted. To test it (from the repo README):

1. `npm install`
2. `npm run build`
3. `chrome://extensions` → Developer mode → Load unpacked → select the `dist/` folder
4. Click the extension icon — the menu opens with the runtime badge and all four tools

App Check is claimed only if it is enabled in the Firebase console for this project; Analytics records `tool_run` events with the tool name and which runtime answered.

## Demo video
YouTube URL: [TO BE ADDED AFTER RECORDING]

## License
Apache-2.0 — LICENSE file is in the repository root and visible in the About section.

## Free of charge
Yes. The extension is open source and the on-device inference costs nothing.