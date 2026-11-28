/* nano-watch.mjs — connects to a running Chrome CDP port, polls Gemini Nano
   availability, prints status lines; exits 0 when "readily". */
const PORT = process.argv[2] || 9230;
const MAX_MIN = parseFloat(process.argv[3] || "20");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let tab = null;
for (let i = 0; i < 40 && !tab; i++) {
  await sleep(500);
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    tab = list.find((t) => t.type === "page");
  } catch {}
}
if (!tab) { console.error("no tab on port " + PORT); process.exit(2); }

const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let seq = 0; const pending = new Map();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((res) => { const id = ++seq; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); });
const evalJs = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  return r.result?.result?.value;
};

await send("Runtime.enable");
const deadline = Date.now() + MAX_MIN * 60 * 1000;
while (Date.now() < deadline) {
  const caps = await evalJs(`(async () => {
    try {
      if (!self.ai?.languageModel) return "no-api";
      const c = await self.ai.languageModel.capabilities();
      if (c.available === "downloadable") {
        try { await self.ai.languageModel.create({ monitor: (m) => { m.addEventListener("downloadprogress", (e) => console.log("dl", e.loaded)); } }); } catch {}
      }
      return c.available;
    } catch (e) { return "err:" + e.message; }
  })()`);
  const stamp = new Date().toISOString().slice(11, 19);
  console.log(`${stamp} availability=${caps}`);
  if (caps === "readily") { console.log("NANO READY"); process.exit(0); }
  if (caps === "downloadable" || caps === "downloading") { await sleep(15000); continue; }
  if (caps === "no-api") { console.log("PROMPT API NOT PRESENT IN THIS BUILD"); process.exit(3); }
  await sleep(15000);
}
console.log("TIMEOUT waiting for Nano");
process.exit(4);
