// Popup controller — wires UI to AI engine
import { processSecurityTask, checkDeviceModel } from "./ai-engine.js";

const inputEl = document.getElementById("input");
const resultEl = document.getElementById("result");
const modeEl = document.getElementById("mode-indicator");

// Check model availability on load
checkDeviceModel().then(available => {
  modeEl.innerHTML = available
    ? 'Model: <span class="badge on-device">ON-DEVICE · Gemini Nano 4</span>'
    : 'Model: <span class="badge cloud">CLOUD · Gemini via Firebase AI Logic</span>';
});

// Handle task buttons
document.querySelectorAll("button[data-task]").forEach(btn => {
  btn.addEventListener("click", async () => {
    const text = inputEl.value.trim();
    if (!text) { resultEl.textContent = "Paste some text first."; resultEl.classList.add("show"); return; }

    const task = btn.dataset.task;
    resultEl.textContent = "Processing...";
    resultEl.classList.add("show");
    btn.disabled = true;

    try {
      const { mode, result } = await processSecurityTask(task, text);
      resultEl.textContent = `[${mode.toUpperCase()}]\n\n${result}`;
    } catch (e) {
      resultEl.textContent = `Error: ${e.message}`;
    } finally {
      btn.disabled = false;
    }
  });
});