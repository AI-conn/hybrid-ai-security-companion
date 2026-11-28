/* capture-popup.mjs — drives headless Chrome via CDP, screenshots the real popup UI.
   Produces: video/frames/01-idle.png, 02-input.png, 03-result.png + capture-log.json
   Usage: node video/capture-popup.mjs "<text to paste into the input>"            */

import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIST = path.join(ROOT, "dist");
const OUT = path.join(ROOT, "video", "frames");

/* Unpacked extension IDs are the SHA-256 of the absolute path, hex mapped to a–p. */
function extensionIdFor(absPath) {
  const hex = createHash("sha256").update(absPath).digest("hex").slice(0, 32);
  return [...hex].map((c) => String.fromCharCode("a".charCodeAt(0) + parseInt(c, 16))).join("");
}
const EXT_ID = extensionIdFor(DIST);
const PORT = 9225;
const BROWSER = "opera-developer";   /* Google Chrome Stable ≥137 blocks --load-extension; Opera Dev accepts it */
const PASTE_TEXT = process.argv[2] ??
  `Title: Stored XSS in comment rendering
Component: web/app/comments/template.php
Steps:
1. Create an account.
2. Post a comment containing <img src=x onerror=alert(document.cookie)>.
3. Any user who views the thread triggers the payload in their session context.
Observed: Script executes with victim cookies; session token readable via document.cookie.
Expected: Output encoded with contextual escaping on render.
Impact: Account takeover of any user viewing the comment thread. Affects all threads created before the patch ships.`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

mkdirSync(OUT, { recursive: true });
rmSync(path.join(OUT, "capture-log.json"), { force: true });
const log = [];

const chrome = spawn(BROWSER, [
  "--headless=new",
  "--no-sandbox",
  "--enable-unsafe-extension-debugging",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=/tmp/ext-capture-profile`,
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-gpu",
  "--window-size=900,900",
  `--load-extension=${DIST}`,
  "about:blank",
], { stdio: "ignore" });
process.on("exit", () => chrome.kill());

/* Wait for the DevTools endpoint. */
let version = null;
for (let i = 0; i < 40 && !version; i++) {
  await sleep(250);
  try {
    version = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
  } catch { /* chrome still starting */ }
}
if (!version) { console.error("Chrome DevTools endpoint never came up"); process.exit(1); }
log.push({ step: "chrome-up", ws: version.webSocketDebuggerUrl });

/* Deterministic extension ID from the dist path. */
const extId = EXT_ID;
log.push({ step: "extension-id", extId });

/* CDP over the browser websocket. */
const ws = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let seq = 0;
const pending = new Map();
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
};
function send(method, params = {}, sessionId) {
  const id = ++seq;
  return new Promise((res) => {
    pending.set(id, res);
    ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
}

/* Open the popup as a tab. */
const { result: { targetId } } = await send("Target.createTarget", {
  url: `chrome-extension://${extId}/popup.html`,
});
await sleep(300);
const { result: { sessionId } } = await send("Target.attachToTarget", { targetId, flatten: true });
log.push({ step: "popup-tab-open", targetId });

async function shot(name) {
  const { result } = await send("Page.captureScreenshot", { format: "png" }, sessionId);
  writeFileSync(path.join(OUT, name), Buffer.from(result.data, "base64"));
  log.push({ step: "screenshot", file: name });
}

async function evalJs(expression) {
  const { result: r } = await send("Runtime.evaluate", {
    expression, awaitPromise: true, returnByValue: true,
  }, sessionId);
  return r.result?.value;
}

await send("Page.enable", {}, sessionId);
await sleep(1200);              /* let the badge settle */

/* 01 — idle: badge + empty input. */
await shot("01-idle.png");
const badge = await evalJs(`document.getElementById("mode-badge")?.textContent || ""`);
log.push({ step: "badge", badge });

/* 02 — input pasted. */
await evalJs(`
  const el = document.getElementById("input");
  el.value = ${JSON.stringify(PASTE_TEXT)};
  el.dispatchEvent(new Event("input", { bubbles: true }));
`);
await shot("02-input.png");

/* 03 — click Summarize, wait for the result panel to settle. */
await evalJs(`document.querySelector('button[data-task="summarize"]').click()`);
await shot("03-running.png");
let resultText = "", settled = false;
for (let i = 0; i < 60 && !settled; i++) {   /* up to 30 s for the cloud round-trip */
  await sleep(500);
  resultText = (await evalJs(`document.getElementById("result")?.textContent || ""`)) ?? "";
  settled = resultText && !resultText.startsWith("Running");
}
await sleep(400);
await shot("03-result.png");
log.push({ step: "result", settled, preview: resultText.slice(0, 160) });

ws.close();
chrome.kill();
writeFileSync(path.join(OUT, "capture-log.json"), JSON.stringify(log, null, 2));
console.log(JSON.stringify({ ok: true, extId, badge, resultPreview: resultText.slice(0, 120) }, null, 2));
