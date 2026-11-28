/* End-to-end verification: Firebase AI Logic cloud path, real call, minimal tokens. */
import { initializeApp } from "firebase/app";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import config from "./firebase-config.json" with { type: "json" };

const app = initializeApp(config);
const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, {
  model: "gemini-2.0-flash",
  systemInstruction: "Answer in exactly three words.",
  generationConfig: { temperature: 0.3, maxOutputTokens: 16 },
});

const started = Date.now();
const result = await model.generateContent("What runs inference on-device in Chrome?");
const text = result.response.text();
console.log(JSON.stringify({
  ok: true,
  latency_ms: Date.now() - started,
  response: text.trim(),
  model: "gemini-2.0-flash",
  backend: "GoogleAIBackend via firebase/ai",
}, null, 2));
