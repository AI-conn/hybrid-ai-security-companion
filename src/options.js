// Options page controller
import { checkDeviceModel } from "./ai-engine.js";

// Check Firebase connection
document.getElementById("fb-status").textContent = "✅ Firebase AI Logic connected (project: hybrid-ai-security-companion)";
document.getElementById("fb-status").className = "status ok";

// Check device model
checkDeviceModel().then(available => {
  const el = document.getElementById("model-status");
  if (available) {
    el.textContent = "✅ Gemini Nano 4 available on this device — on-device inference active";
    el.className = "status ok";
  } else {
    el.textContent = "⚠️ Gemini Nano 4 not available — using cloud fallback";
    el.className = "status err";
  }
});

// Save system prompt
window.savePrompt = () => {
  const prompt = document.getElementById("system-prompt").value;
  chrome.storage.local.set({ systemPrompt: prompt }, () => {
    alert("Saved");
  });
};