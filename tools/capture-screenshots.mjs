// Regenerates the README / hub screenshots in docs/screenshots/ using headless Chrome or Edge
// through the Chrome DevTools Protocol. No npm packages needed (Node 22+ has fetch and WebSocket).
//
// 1. Serve the repo root:   python -m http.server 8765 --bind 127.0.0.1
// 2. Run:                    node tools/capture-screenshots.mjs
//    Options (env vars):     BROWSER=/path/to/chrome   ARCADE_URL=http://127.0.0.1:8765
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs', 'screenshots');
const BASE = process.env.ARCADE_URL || 'http://127.0.0.1:8765';
const PORT = 9333;
const browser = [
  process.env.BROWSER,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
].filter(Boolean).find((p) => existsSync(p));
if (!browser) { console.error('No Chrome/Edge found. Set BROWSER=/path/to/chrome'); process.exit(1); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const profile = mkdtempSync(join(tmpdir(), 'arcade-shots-'));
const proc = spawn(browser, ['--headless=new', '--remote-debugging-port=' + PORT, '--user-data-dir=' + profile,
  '--window-size=1280,800', '--hide-scrollbars', '--mute-audio', 'about:blank'], { stdio: 'ignore' });

async function pageSocketUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch('http://127.0.0.1:' + PORT + '/json/list')).json();
      const page = list.find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch { /* not up yet */ }
    await sleep(250);
  }
  throw new Error('browser did not start');
}

const ws = new WebSocket(await pageSocketUrl());
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let nextId = 0;
const pending = new Map();
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++nextId;
  pending.set(id, (m) => (m.error ? reject(new Error(method + ': ' + m.error.message)) : resolve(m.result)));
  ws.send(JSON.stringify({ id, method, params }));
});
async function run(expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text);
  return r.result.value;
}
async function open(path, wait = 1200) { await send('Page.navigate', { url: BASE + '/' + path }); await sleep(wait); }
async function key(k, code, vk) {
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code, windowsVirtualKeyCode: vk });
  await sleep(150);   // hold like a real key press; some games poll keys once per frame
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code, windowsVirtualKeyCode: vk });
}
async function shot(name) {
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, name), Buffer.from(data, 'base64'));
  console.log('saved docs/screenshots/' + name);
}

try {
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });

  await open('index.html');
  await shot('hub.png');

  // Plumber Typing: level 2-2 in progress, one word half typed
  await open('plumber-typing.html?debug');
  await run('__plumber.startLevel(4)');
  await sleep(7500);
  await run(`(() => {
    const G = __plumber.G;
    const e = G.enemies.filter((x) => !x.dead).sort((a, b) => a.x - b.x)[0];
    if (e) for (let i = 0; i < Math.min(2, e.word.length - 1); i++) __plumber.typeChar(e.word[i]);
    G.flush = 5;
  })()`);
  await sleep(120);
  await shot('plumber-typing.png');

  // Plumber Typing: Boiler Beast boss (level 3-3)
  await run('__plumber.startLevel(8); __plumber.G.spawned = __plumber.G.L.count;');
  await sleep(6500);
  await shot('plumber-typing-boss.png');

  // MathMan: a power-orb question, then power mode
  await open('mathman.html?debug');
  await run('__mathman.startGame()');
  await sleep(3200);
  await run("__mathman.openQuiz('power')");
  await sleep(400);
  await shot('mathman-quiz.png');
  await run('(() => { const q = __mathman.G.quiz.q; __mathman.answerQuiz(q.choices.indexOf(q.answer)); })()');
  await sleep(1800);
  await shot('mathman.png');

  // The three classic games: start the first mode and let it run for a moment
  for (const [file, name, wait] of [['math-blaster.html', 'math-blaster.png', 5000], ['spelling-bee.html', 'spelling-bee.png', 1500], ['geoquest.html', 'geoquest.png', 1200]]) {
    await open(file);
    await key('Enter', 'Enter', 13);
    await sleep(wait);
    await shot(name);
  }
} finally {
  ws.close();
  proc.kill();
}