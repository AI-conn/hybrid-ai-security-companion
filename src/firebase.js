/* Firebase connection — one place, imported by the rest. */

import { initializeApp } from "firebase/app";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import config from "../firebase-config.json";

const app = initializeApp(config);

export const ai = getAI(app, { backend: new GoogleAIBackend() });

export function cloudModel(systemPrompt) {
  return getGenerativeModel(ai, {
    model: "gemini-2.0-flash",
    systemInstruction: systemPrompt,
    generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
  });
}