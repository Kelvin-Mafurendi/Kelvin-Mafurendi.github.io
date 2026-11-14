// Compares the <main> of each generated story page, and the project list on
// the home page, with the hand-written originals (whitespace ignored).
//
//   node build/check/compare-html.mjs [_site]

import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const site = resolve(process.argv[2] ?? join(root, '_site'));

const norm = (s) => s.replace(/\r\n/g, '\n').replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
const between = (html, start, end) => {
  const a = html.indexOf(start);
  const b = html.indexOf(end, a);
  return a < 0 || b < 0 ? '' : html.slice(a, b + end.length);
};
const projects = (html) => norm(between(html, '<ul class="projects">', '</section>')).replace(/<!-- \/?studio:projects -->/g, '');

function firstDifference(a, b) {
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  return i === a.length && i === b.length ? null : { at: i, old: a.slice(Math.max(0, i - 60), i + 120), new: b.slice(Math.max(0, i - 60), i + 120) };
}

let same = 0;
const report = [];
for (const file of (await readdir(join(root, 'work'))).filter((f) => f.endsWith('.html'))) {
  const before = norm(between(await readFile(join(root, 'work', file), 'utf8'), '<main', '</main>'));
  const after = norm(between(await readFile(join(site, 'work', file), 'utf8'), '<main', '</main>'));
  const diff = firstDifference(before, after);
  if (!diff) same++;
  else report.push({ page: `work/${file}`, ...diff });
}
const homeDiff = firstDifference(projects(await readFile(join(root, 'index.html'), 'utf8')), projects(await readFile(join(site, 'index.html'), 'utf8')));
if (homeDiff) report.push({ page: 'index.html projects', ...homeDiff });

console.log(`${same} story pages identical; home project cards ${homeDiff ? 'differ' : 'identical'}`);
for (const r of report) console.log(`\n${r.page} differs at ${r.at}:\n  was: ${r.old}\n  now: ${r.new}`);
