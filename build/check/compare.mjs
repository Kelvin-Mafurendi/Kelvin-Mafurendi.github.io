// Screenshot diff of the generated pages against the hand-written ones
// (Milestone 4 acceptance: no visible change at 1440 and 390 px).
//
//   node build/check/compare.mjs [_site] [page ...]
//
// Serves the repo (before) and the build output (after) locally, takes a
// full-page screenshot of each page at both widths, and writes the images
// and a diff for any page that changed to build/check/out/.

import { createServer } from 'node:http';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import pixelmatch from 'pixelmatch';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const site = resolve(process.argv[2] ?? join(root, '_site'));
const out = join(root, 'build', 'check', 'out');
const WIDTHS = [1440, 390];
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

function serve(dir) {
  const server = createServer(async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
    try {
      const body = await readFile(join(dir, path || 'index.html'));
      res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok({ server, url: `http://127.0.0.1:${server.address().port}` })));
}

async function shot(page, url, width) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  return PNG.sync.read(await page.screenshot({ fullPage: true, animations: 'disabled' }));
}

/** Pads two images to the same size so they can be compared pixel by pixel. */
function pad(img, w, h) {
  if (img.width === w && img.height === h) return img;
  const p = new PNG({ width: w, height: h });
  p.data.fill(255);
  PNG.bitblt(img, p, 0, 0, img.width, img.height, 0, 0);
  return p;
}

const pages = process.argv.slice(3).length
  ? process.argv.slice(3)
  : (await readdir(join(root, 'work'))).filter((f) => f.endsWith('.html')).map((f) => `work/${f}`);

const before = await serve(root);
const after = await serve(site);
const browser = await chromium.launch();
const page = await browser.newPage({ reducedMotion: 'reduce' });
await mkdir(out, { recursive: true });

let failures = 0;
for (const p of pages) {
  for (const width of WIDTHS) {
    const a = await shot(page, `${before.url}/${p}`, width);
    const b = await shot(page, `${after.url}/${p}`, width);
    const w = Math.max(a.width, b.width);
    const h = Math.max(a.height, b.height);
    const diff = new PNG({ width: w, height: h });
    const changed = pixelmatch(pad(a, w, h).data, pad(b, w, h).data, diff.data, w, h, { threshold: 0.1 });
    const share = (100 * changed) / (w * h);
    const name = `${p.replace(/[\\/]/g, '_').replace(/\.html$/, '')}@${width}`;
    const sameSize = a.height === b.height;
    if (changed > 0 || !sameSize) {
      failures++;
      await writeFile(join(out, `${name}-before.png`), PNG.sync.write(a));
      await writeFile(join(out, `${name}-after.png`), PNG.sync.write(b));
      await writeFile(join(out, `${name}-diff.png`), PNG.sync.write(diff));
    }
    console.log(`${changed === 0 && sameSize ? 'same   ' : 'CHANGED'} ${name.padEnd(28)} ${changed} px (${share.toFixed(3)}%)${sameSize ? '' : `, height ${a.height} -> ${b.height}`}`);
  }
}

await browser.close();
before.server.close();
after.server.close();
console.log(failures ? `\n${failures} screenshot(s) differ; images in build/check/out/` : '\nEvery page matches.');
process.exitCode = failures ? 1 : 0;
