/* shoot-diagrams.mjs — screenshots each diagram frame via a per-tab CDP websocket. */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "video", "diagram", "png");
const PORT = 9226;
const FILE_URL = `file://${path.join(ROOT, "video", "diagram", "index.html")}`;
const FRAMES = ["intro", "tools", "engine-code", "arch-1", "arch-2", "arch-3", "arch-4", "arch-5", "endcard"];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(OUT, { recursive: true });

const chrome = spawn("opera-developer", [
  "--headless=new", "--no-sandbox", "--disable-gpu",
  `--remote-debugging-port=${PORT}`,
  "--user-data-dir=/tmp/diagram-shots",
  "--no-first-run", "--window-size=1920,1080",
  "about:blank",
], { stdio: "ignore" });
process.on("exit", () => chrome.kill());

/* find our tab's per-tab debugger url */
let tab = null;
for (let i = 0; i < 40 && !tab; i++) {
  await sleep(250);
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    tab = list.find((t) => t.type === "page" && t.url === "about:blank");
  } catch {}
}
if (!tab) { console.error("no tab"); process.exit(1); }

const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let seq = 0; const pending = new Map();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((res) => { const id = ++seq; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); });

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });

for (const f of FRAMES) {
  const nav = await send("Page.navigate", { url: `${FILE_URL}?f=${f}` });
  if (nav.error) { console.error(`${f}: nav error ${JSON.stringify(nav.error)}`); continue; }
  await sleep(900);
  const msg = await send("Page.captureScreenshot", { format: "png" });
  if (!msg.result?.data) { console.error(`${f}: shot error ${JSON.stringify(msg.error || msg).slice(0, 160)}`); continue; }
  writeFileSync(path.join(OUT, `${f}.png`), Buffer.from(msg.result.data, "base64"));
  console.log(`${f}.png`);
}
ws.close(); chrome.kill();
console.log("done");
