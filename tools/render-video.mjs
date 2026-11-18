// Renders docs/social/video.html frame by frame in headless Chrome and encodes an MP4 with ffmpeg.
// Needs the dev server on :5173 and ffmpeg (pip install imageio-ffmpeg).  Usage: node tools/render-video.mjs <ffmpeg.exe> <out.mp4>
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [ffmpeg, outFile] = process.argv.slice(2);
const FPS = 30, DUR = 10, PORT = 9333;
const profile = mkdtempSync(join(tmpdir(), 'novae-chrome-'));
const frames = mkdtempSync(join(tmpdir(), 'novae-frames-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',
  ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--window-size=1080,1920', 'about:blank'], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) {
  try { target = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find(t => t.type === 'page'); } catch { await sleep(200); }
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r, { once: true }));
let id = 0; const pending = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); pending.get(m.id)?.(m); pending.delete(m.id); });
const send = (method, params = {}) => new Promise(r => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });
const evaluate = async expr => {
  const m = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (m.result.exceptionDetails) throw new Error(JSON.stringify(m.result.exceptionDetails));
  return m.result.result.value;
};

await send('Page.navigate', { url: 'http://localhost:5173/docs/social/video.html' });
for (let i = 0; i < 100; i++) { await sleep(200); try { if (await evaluate('window.ready')) break; } catch { /* still loading */ } }
const total = FPS * DUR;
for (let f = 0; f < total; f++) {
  const png = await evaluate(`frame(${f / FPS})`);
  writeFileSync(join(frames, `f${String(f).padStart(4, '0')}.png`), Buffer.from(png.split(',')[1], 'base64'));
  if (f % 30 === 0) process.stdout.write(`${f / FPS}s `);
}
ws.close(); chrome.kill();

await new Promise((res, rej) => spawn(ffmpeg, ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(frames, 'f%04d.png'),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', outFile], { stdio: 'inherit' })
  .on('exit', c => c ? rej(new Error('ffmpeg ' + c)) : res()));
rmSync(frames, { recursive: true, force: true }); rmSync(profile, { recursive: true, force: true });
console.log('\n' + outFile);
