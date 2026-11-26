/* ui.js — wires the menu: input box, four buttons, badge, result panel. */

import { run, deviceStatus } from "./engine.js";

const inputBox = document.getElementById("input");
const resultBox = document.getElementById("result");
const badge = document.getElementById("mode-badge");

/* Show which runtime answered at load. */
deviceStatus().then((ready) => {
  badge.textContent = ready ? "ON-DEVICE · Gemini Nano 4" : "CLOUD · Firebase AI Logic";
});

/* Every tool button calls run() and shows the answer with its mode. */
document.querySelectorAll("button[data-task]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const text = inputBox.value.trim();
    if (!text) {
      resultBox.textContent = "Paste something first.";
      return;
    }

    const task = btn.dataset.task;
    resultBox.textContent = "Running...";

    try {
      const answer = await run(task, text);
      resultBox.textContent = `[${answer.mode.toUpperCase()}]\n\n${answer.text}`;
    } catch (err) {
      resultBox.textContent = `Error: ${err.message}`;
    }
  });
});