// Firebase AI Logic — hybrid inference engine
// On-device: Gemini Nano 4 via Firebase AI Logic (Chrome built-in model)
// Cloud fallback: Gemini via Firebase AI Logic when device model unavailable

import { initializeApp } from "firebase/app";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import firebaseConfig from "../firebase-config.json";

const app = initializeApp(firebaseConfig);
const ai = getAI(app, { backend: new GoogleAIBackend() });

// Hybrid inference: try on-device first, fall back to cloud
let deviceModelAvailable = null;

async function checkDeviceModel() {
  if (deviceModelAvailable !== null) return deviceModelAvailable;
  try {
    // Gemini Nano 4 availability check via Chrome's on-device model
    const availability = await self.ai.languageModel?.capabilities?.();
    deviceModelAvailable = availability?.available === "readily";
  } catch (e) {
    deviceModelAvailable = false;
  }
  return deviceModelAvailable;
}

export async function createModel(systemPrompt) {
  const onDevice = await checkDeviceModel();

  if (onDevice) {
    // Use Chrome's built-in Gemini Nano via Prompt API (on-device, free, private)
    const session = await self.ai.languageModel.create({
      systemPrompt,
      temperature: 0.3,
    });
    return {
      mode: "on-device",
      generate: async (prompt) => {
        return await session.prompt(prompt);
      },
    };
  }

  // Cloud fallback: Gemini via Firebase AI Logic
  const model = getGenerativeModel(ai, {
    model: "gemini-2.0-flash",
    systemInstruction: systemPrompt,
    generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
  });
  return {
    mode: "cloud",
    generate: async (prompt) => {
      const result = await model.generateContent(prompt);
      return result.response.text();
    },
  };
}

// Pre-built prompts for security research tasks
const PROMPTS = {
  summarizeReport: `You are a senior security analyst. Summarize this bug report into: (1) vulnerability type, (2) affected component, (3) attack scenario in one sentence, (4) severity assessment (CVSS-like). Be concise. Report:\n\n`,

  draftAttackScenario: `You are a bug bounty researcher. Given this vulnerability description, write a concise attack scenario following Google VRP format: who is the attacker, what do they gain, how do they exploit it. One paragraph. Description:\n\n`,

  redactPII: `Remove all personally identifiable information from this text. Replace emails with [EMAIL], phone numbers with [PHONE], names with [NAME], addresses with [ADDRESS]. Keep technical details intact. Text:\n\n`,

  classifySeverity: `Rate this security finding's severity on a scale: Critical, High, Medium, Low, Info. One sentence justification. Finding:\n\n`,
};

export async function processSecurityTask(taskType, input) {
  const prompt = PROMPTS[taskType];
  if (!prompt) throw new Error(`Unknown task: ${taskType}`);

  const model = await createModel(
    "You are a senior security researcher helping with bug bounty hunting. Be concise and technical. No hedging."
  );

  const result = await model.generate(prompt + input);
  return {
    mode: model.mode,
    result,
  };
}

export { checkDeviceModel };
