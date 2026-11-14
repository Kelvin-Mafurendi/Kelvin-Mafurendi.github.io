// Renders sample entries through studio/preview.html, the way the app does,
// and saves phone-width screenshots to build/check/out/ for a visual check.
//
//   node build/check/preview-shot.mjs

import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const out = join(root, 'build', 'check', 'out');
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png' };

export const samples = {
  tutorial: {
    kind: 'article',
    title: 'Reading a rectifier',
    summary: 'A short tutorial with a diagram, a voice note and a formula.',
    publishedAt: '2026-11-07T09:00:00Z',
    media: { d1: { siteAsset: 'assets/img/web/11-bus.jpg' }, v1: { url: 'data:audio/mp4;base64,' } },
    blocks: [
      { type: 'text', md: 'A bridge rectifier turns **alternating** current into _pulsing_ direct current. See the [notes](https://example.com).' },
      { type: 'image', mediaId: 'd1', caption: 'The diagram for this tutorial.', size: 'wide' },
      { type: 'voice', mediaId: 'v1', durationS: 42, transcript: 'Each diode conducts for half a cycle.' },
      { type: 'heading', text: 'The average output', level: 2 },
      { type: 'math', tex: 'V_{dc} = \\frac{2 V_m}{\\pi}' },
      { type: 'code', language: 'c', source: 'float vdc = 2.0f * vm / M_PI;\n// read the ADC\nint raw = analogRead(A0);' },
      { type: 'callout', tone: 'warning', md: 'Discharge the smoothing capacitor before touching the board.' },
      { type: 'numbers', items: [{ value: '230', unit: 'V', label: 'input' }, { value: '325', unit: 'V', label: 'peak' }] },
      { type: 'quote', text: 'Measure twice, switch once.', source: 'The bench' },
    ],
  },
  poem: {
    kind: 'poem',
    title: 'Night shift',
    publishedAt: '2026-11-07T09:00:00Z',
    blocks: [
      { type: 'stanza', lines: ['The motor hums its single note,', '    and the breaker holds its breath;', '', 'I write the fault down, line by line.'] },
      { type: 'stanza', lines: ['Overdo it, says the wall.', 'I do.'] },
    ],
  },
};

const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
  try {
    const body = await readFile(join(root, path));
    res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(e.message));
await mkdir(out, { recursive: true });

for (const [name, entry] of Object.entries(samples)) {
  await page.goto(`${base}/studio/preview.html`, { waitUntil: 'networkidle' });
  await page.evaluate((e) => window.studioRender({ entry: e }), entry);
  await page.waitForTimeout(800);
  await page.evaluate(() => document.fonts.ready);
  const katex = await page.locator('.katex').count();
  const hljs = await page.locator('pre.code .hljs-keyword, pre.code .hljs-type, pre.code .hljs-comment').count();
  await writeFile(join(out, `preview-${name}.png`), await page.screenshot({ fullPage: true }));
  console.log(`${name}: rendered; KaTeX formulas: ${katex}; highlighted code tokens: ${hljs}`);
}
console.log(errors.length ? `Console errors:\n  ${errors.join('\n  ')}` : 'No console errors.');
await browser.close();
server.close();
