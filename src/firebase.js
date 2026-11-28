/* Firebase AI Logic — one module owns every Firebase touch point. */

import { initializeApp } from "firebase/app";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";
import config from "../firebase-config.json";

const app = initializeApp(config);

/* App Check — attaches attestations to Firebase AI Logic calls.
   Register the extension origin with reCAPTCHA v3 in the Firebase console
   and add "appCheckSiteKey" to firebase-config.json to activate. */
export const appCheck = config.appCheckSiteKey
  ? initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(config.appCheckSiteKey),
      isTokenAutoRefreshEnabled: true,
    })
  : null;

/* Analytics — records which tool ran and which runtime answered. */
export async function recordUsage(toolName, mode) {
  try {
    if (await isSupported()) {
      logEvent(getAnalytics(app), "tool_run", { tool: toolName, mode });
    }
  } catch {
    /* Analytics is optional telemetry — never block a tool run on it. */
  }
}

/* The shared Firebase AI Logic instance. */
export const ai = getAI(app, { backend: new GoogleAIBackend() });

/* Cloud fallback model — Gemini 2.0 Flash through Firebase AI Logic. */
export function cloudModel(systemPrompt) {
  return getGenerativeModel(ai, {
    model: "gemini-2.0-flash",
    systemInstruction: systemPrompt,
    generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
  });
}
