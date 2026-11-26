/* Engine — decides on-device or cloud, runs the query, reports which one answered. */

import { cloudModel } from "./firebase.js";

const SYSTEM = "You are a senior security researcher. Answer briefly and technically. No filler.";

const TASK_PROMPTS = {
  summarize:
    "Summarize this bug report: vulnerability class, affected component, attack route, severity. Concise.\n\n",
  scenario:
    "Write the attack route in Google VRP format: who is the attacker, what do they gain, how. One breath.\n\n",
  redact:
    "Replace every email with [EMAIL], contact number with [PHONE], and name with [NAME]. Keep technical details.\n\n",
  severity:
    "Rate Critical / High / Medium / Low / Info with a one-line reason.\n\n",
};

/* Check Chrome's built-in Gemini Nano. */
async function nanoReady() {
  try {
    const caps = await self.ai.languageModel.capabilities();
    return caps.available === "readily";
  } catch {
    return false;
  }
}

/* Run one query. Returns { mode, text }. */
export async function run(task, input) {
  const prompt = TASK_PROMPTS[task];
  if (!prompt) throw new Error("Unknown task: " + task);

  if (await nanoReady() === true) {
    const session = await self.ai.languageModel.create({
      systemPrompt: SYSTEM,
      temperature: 0.3,
    });
    const text = await session.prompt(prompt + input);
    return { mode: "on-device", text };
  }

  const model = cloudModel(SYSTEM);
  const result = await model.generateContent(prompt + input);
  return { mode: "cloud", text: result.response.text() };
}

/* Same check as nanoReady, for the badge shown at load. */
export const deviceStatus = nanoReady;

export { nanoReady };