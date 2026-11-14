#!/usr/bin/env node
// Builds the static site into _site/ (DESIGN.md, Website integration).
//
//   node build/build.mjs                      published entries from Firestore
//   node build/build.mjs --data site.json     the same, from a JSON export
//   node build/build.mjs --out dir            somewhere other than _site/
//
// Firestore access uses the service account in FIREBASE_SERVICE_ACCOUNT
// (a GitHub Actions secret). With no entries, the output is the hand-written
// site unchanged.

import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { feed, projectList, SITE_URL, sitemap, storyPage, writingPage, writingSection } from './render/pages.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['.git', '.github', 'node_modules', '_site', 'build/node_modules', 'build/check/out']);

export function parseArgs(argv) {
  const args = { out: join(root, '_site'), data: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--out') args.out = resolve(argv[++i]);
    else if (argv[i] === '--data') args.data = resolve(argv[++i]);
  }
  return args;
}

/** Timestamps and other Firestore values to plain JSON. */
function plain(value) {
  if (value === null || value === undefined) return value ?? null;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(plain);
  if (typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, plain(v)]));
  return value;
}

async function loadFromFirestore() {
  const { initializeApp, cert } = await import('firebase-admin/app');
  const { getFirestore } = await import('firebase-admin/firestore');
  const account = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!account) throw new Error('FIREBASE_SERVICE_ACCOUNT is not set. Use --data for a local build.');
  const db = getFirestore(initializeApp({ credential: cert(JSON.parse(account)) }));
  const [entries, site] = await Promise.all([db.collection('public').get(), db.doc('config/site').get()]);
  return {
    entries: entries.docs.map((d) => ({ id: d.id, ...plain(d.data()) })),
    site: plain(site.data() ?? {}),
  };
}

const live = (e) => e.visibility === 'published' || e.visibility === 'unlisted';
const listed = (e) => e.visibility === 'published';

/** Projects in Kelvin's site order; any not in the order go last, newest first. */
export function orderProjects(projects, order = []) {
  const rank = new Map(order.map((id, i) => [id, i]));
  return [...projects].sort((a, b) => {
    const ra = rank.get(a.id) ?? Infinity;
    const rb = rank.get(b.id) ?? Infinity;
    if (ra !== rb) return ra - rb;
    return String(b.sortDate ?? '').localeCompare(String(a.sortDate ?? ''));
  });
}

/** Articles and poems, newest first. */
export function orderWriting(items) {
  return [...items].sort((a, b) => String(b.publishedAt ?? b.sortDate ?? '').localeCompare(String(a.publishedAt ?? a.sortDate ?? '')));
}

/** Replaces the text between <!-- studio:NAME --> and <!-- /studio:NAME -->, or at a lone marker. */
export function fillMarker(html, name, content) {
  const pair = new RegExp(`(<!-- studio:${name} -->)[\\s\\S]*?(<!-- /studio:${name} -->)`);
  if (pair.test(html)) return html.replace(pair, `$1\n${content}\n$2`);
  return html.replace(`<!-- studio:${name} -->`, `<!-- studio:${name} -->\n${content}`);
}

/** Every file the build writes, by path relative to the output folder. */
export function renderSite(data, indexHtml) {
  const entries = (data.entries ?? []).filter(live);
  const files = new Map();

  const projects = orderProjects(entries.filter((e) => e.kind === 'project'), data.site?.projectOrder);
  const stories = projects.filter((p) => p.page !== false && p.slug);
  const chain = stories.filter(listed);
  for (const p of stories) {
    const i = chain.indexOf(p);
    const next = i >= 0 && chain.length > 1 ? chain[(i + 1) % chain.length] : null;
    files.set(`work/${p.slug}.html`, storyPage(p, { next: next && { slug: next.slug, title: next.title } }));
  }

  const writing = orderWriting(entries.filter((e) => (e.kind === 'article' || e.kind === 'poem') && e.slug));
  const shown = writing.filter(listed);
  for (const w of writing) {
    const i = shown.indexOf(w);
    const ref = (e) => (e ? { slug: e.slug, title: e.title } : null);
    files.set(`writing/${w.slug}.html`, writingPage(w, { previous: i > 0 ? ref(shown[i - 1]) : null, next: i >= 0 ? ref(shown[i + 1]) : null }));
  }

  let index = indexHtml;
  const cards = projects.filter(listed);
  if (cards.length) index = fillMarker(index, 'projects', projectList(cards));
  if (shown.length) {
    index = fillMarker(index, 'writing', writingSection(shown));
    index = fillMarker(index, 'nav-writing', '        <a href="#writing">Writing</a>');
  }
  files.set('index.html', index);
  if (shown.length) files.set('feed.xml', feed(shown));

  return { files, unlisted: new Set(entries.filter((e) => !listed(e)).map((e) => `${e.kind === 'project' ? 'work' : 'writing'}/${e.slug}.html`)) };
}

async function copyStatic(from, to) {
  for (const item of await readdir(from, { withFileTypes: true })) {
    const path = join(from, item.name);
    const rel = relative(root, path).replace(/\\/g, '/');
    if (SKIP.has(rel) || SKIP.has(item.name)) continue;
    if (item.isDirectory()) {
      await mkdir(join(to, rel), { recursive: true });
      await copyStatic(path, to);
    } else {
      await cp(path, join(to, rel));
    }
  }
}

async function listPages(dir, sub) {
  const folder = join(dir, sub);
  if (!existsSync(folder)) return [];
  return (await readdir(folder)).filter((f) => f.endsWith('.html')).map((f) => `${sub}/${f}`);
}

export async function build({ data, out }) {
  const source = data ? JSON.parse(await readFile(data, 'utf8')) : await loadFromFirestore();
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  await copyStatic(root, out);

  const indexHtml = await readFile(join(root, 'index.html'), 'utf8');
  const { files, unlisted } = renderSite(source, indexHtml);
  for (const [path, content] of files) {
    await mkdir(dirname(join(out, path)), { recursive: true });
    await writeFile(join(out, path), content);
  }

  const pages = ['', ...(await listPages(out, 'work')), ...(await listPages(out, 'writing'))].filter((p) => !unlisted.has(p));
  await writeFile(join(out, 'sitemap.xml'), sitemap(pages.map((p) => ({ loc: `${SITE_URL}/${p}` }))));
  return { written: [...files.keys()], pages: pages.length };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  build(args)
    .then((r) => console.log(`Built ${r.written.length} generated files, ${r.pages} pages in the sitemap, into ${relative(process.cwd(), args.out) || '.'}`))
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
}
