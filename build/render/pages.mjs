// Page templates. Plain template strings so the same code runs in the build
// and in the browser preview. The markup follows the hand-written story pages
// exactly, so imported stories look the same as before.

import { blockNeeds, imageSource, readingMinutes, renderBlocks } from './blocks.mjs';
import { escapeHtml, plainText, renderInline } from './markdown.mjs';

export const SITE_URL = 'https://kelvin-mafurendi.github.io';

/** Discipline name to the site's phase colour class and short label. */
export const DISCIPLINES = {
  power: { cls: 'r', label: 'Power', long: 'Power and protection' },
  control: { cls: 'y', label: 'Control', long: 'Control' },
  embedded: { cls: 'b', label: 'Embedded', long: 'Embedded and modelling' },
  software: { cls: 's', label: 'Software', long: 'Software' },
};

const disc = (d) => DISCIPLINES[d] ?? DISCIPLINES.software;

/** The media resolver for an entry's own media map. */
export function mediaContext(entry, base = '../') {
  const map = entry.media ?? {};
  return { base, media: (id) => map[id] ?? null };
}

function head({ title, description, canonical, image, type, noindex, extra = '' }) {
  const lines = [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="utf-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1" />',
    `  <title>${escapeHtml(title)}, Kelvin Mafurendi</title>`,
    `  <meta name="description" content="${escapeHtml(description)}" />`,
  ];
  if (noindex) lines.push('  <meta name="robots" content="noindex" />');
  if (canonical) lines.push(`  <link rel="canonical" href="${canonical}" />`);
  lines.push(
    `  <meta property="og:title" content="${escapeHtml(title)}" />`,
    `  <meta property="og:description" content="${escapeHtml(description)}" />`,
    `  <meta property="og:type" content="${type}" />`,
  );
  if (image) lines.push(`  <meta property="og:image" content="${escapeHtml(image)}" />`);
  lines.push(
    '  <link rel="icon" href="../assets/img/favicon.jpg" />',
    '  <link rel="preconnect" href="https://fonts.googleapis.com" />',
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
    '  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />',
    '  <link rel="stylesheet" href="../assets/site/site.css" />',
  );
  if (extra) lines.push(extra);
  lines.push('</head>');
  return lines.join('\n');
}

/** Styles and scripts for math, code and video blocks, only where used. */
export function blockAssets(blocks, { poem = false } = {}) {
  const needs = blockNeeds(blocks);
  const out = [];
  if (poem) {
    out.push('  <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />');
  }
  if (needs.math) {
    out.push('  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css" />');
    out.push('  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.js"></script>');
  }
  if (needs.code) {
    out.push('  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/atom-one-light.min.css" />');
    out.push('  <script defer src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js"></script>');
  }
  if (needs.math || needs.code || needs.video) out.push('  <script defer src="../assets/site/blocks.js"></script>');
  return out.join('\n');
}

function jsonLd(data) {
  return `  <script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

const header = (nav) =>
  `  <a class="skip" href="#main">Skip to content</a>\n  <header class="site-head"><div class="wrap"><a class="brand" href="../index.html">Kelvin Mafurendi</a><nav class="nav nav-static" aria-label="Main">${nav}</nav></div></header>`;

function coverUrl(entry) {
  const source = entry.cover ? imageSource(entry.media?.[entry.cover.mediaId], `${SITE_URL}/`) : null;
  return source?.src ?? null;
}

// ---------- Story pages (projects) ----------

/** The <main> of a project story. `next` is { slug, title } or null. */
export function storyMain(entry, { next } = {}) {
  const d = disc(entry.discipline);
  const label = entry.disciplineLabel?.trim() || d.long;
  const facts = (entry.facts ?? []).filter((f) => f.label?.trim() && f.value?.trim());
  const meta = facts.length
    ? `\n      <dl class="story-meta">${facts.map((f) => `<div><dt>${escapeHtml(f.label.trim())}</dt><dd>${escapeHtml(f.value.trim())}</dd></div>`).join('')}</dl>`
    : '';
  const dek = entry.summary?.trim() ? `\n      <p class="dek">${renderInline(entry.summary.trim())}</p>` : '';
  const nextLink = next ? `<a href="${next.slug}.html">Next: ${escapeHtml(next.title)}</a>` : '';
  return [
    `  <main id="main" class="story ${d.cls}">`,
    '    <div class="story-hero"><div class="wrap">',
    '      <a class="back" href="../index.html#projects">Back to projects</a>',
    `      <ul class="tags project-tags"><li><span class="dot ${d.cls}"></span>${escapeHtml(label)}</li></ul>`,
    `      <h1>${escapeHtml(entry.title)}</h1>${dek}${meta}`,
    '    </div></div>',
    '    <div class="story-body"><div class="wrap"><div class="col">',
    `      ${renderBlocks(entry.blocks, mediaContext(entry))}`,
    '    </div></div></div>',
    `    <div class="wrap story-next"><a href="../index.html#projects">Back to all projects</a>${nextLink}</div>`,
    '  </main>',
  ].join('\n');
}

export function storyPage(entry, options = {}) {
  const description = plainText(entry.summary ?? '').trim();
  const url = `${SITE_URL}/work/${entry.slug}.html`;
  const extra = [
    blockAssets(entry.blocks),
    jsonLd({
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: entry.title,
      description,
      url,
      author: { '@type': 'Person', name: 'Kelvin Mafurendi', url: SITE_URL },
      ...(coverUrl(entry) ? { image: coverUrl(entry) } : {}),
    }),
  ]
    .filter(Boolean)
    .join('\n');
  return [
    head({ title: entry.title, description, canonical: url, image: coverUrl(entry), type: 'article', noindex: entry.visibility === 'unlisted', extra }),
    '<body>',
    header('<a href="../index.html#projects">All projects</a>'),
    storyMain(entry, options),
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

// ---------- Writing pages (articles and poems) ----------

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function writingDate(entry) {
  return entry.dateLabel?.trim() || formatDate(entry.publishedAt ?? entry.sortDate);
}

/** The <main> of an article or poem. `previous` and `next` are { slug, title } or null. */
export function writingMain(entry, { previous, next } = {}) {
  const poem = entry.kind === 'poem' || entry.layout === 'poem';
  const minutes = readingMinutes(entry.blocks, entry.title);
  const byline = [writingDate(entry), poem ? null : `${minutes} min read`].filter(Boolean).join(' · ');
  const dek = entry.summary?.trim() ? `\n      <p class="dek">${renderInline(entry.summary.trim())}</p>` : '';
  const links = [
    '<a href="../index.html#writing">Back to all writing</a>',
    previous ? `<a href="${previous.slug}.html">Previous: ${escapeHtml(previous.title)}</a>` : '',
    next ? `<a href="${next.slug}.html">Next: ${escapeHtml(next.title)}</a>` : '',
  ].join('');
  return [
    `  <main id="main" class="story writing-page${poem ? ' poem' : ''}">`,
    '    <div class="story-hero"><div class="wrap">',
    '      <a class="back" href="../index.html#writing">Back to writing</a>',
    `      <ul class="tags project-tags"><li><span class="dot ${poem ? 'sepia' : 's'}"></span>${poem ? 'Poem' : 'Article'}</li></ul>`,
    `      <h1>${escapeHtml(entry.title)}</h1>${dek}`,
    byline ? `      <p class="byline">${escapeHtml(byline)}</p>` : '',
    '    </div></div>',
    '    <div class="story-body"><div class="wrap"><div class="col measure">',
    `      ${renderBlocks(entry.blocks, mediaContext(entry))}`,
    '    </div></div></div>',
    `    <div class="wrap story-next">${links}</div>`,
    '  </main>',
  ]
    .filter((l) => l !== '')
    .join('\n');
}

export function writingPage(entry, options = {}) {
  const poem = entry.kind === 'poem' || entry.layout === 'poem';
  const description = plainText(entry.summary ?? '').trim();
  const url = `${SITE_URL}/writing/${entry.slug}.html`;
  const extra = [
    blockAssets(entry.blocks, { poem }),
    jsonLd({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: entry.title,
      description,
      url,
      ...(entry.publishedAt ? { datePublished: entry.publishedAt } : {}),
      ...(entry.updatedAt ? { dateModified: entry.updatedAt } : {}),
      author: { '@type': 'Person', name: 'Kelvin Mafurendi', url: SITE_URL },
      ...(coverUrl(entry) ? { image: coverUrl(entry) } : {}),
    }),
  ]
    .filter(Boolean)
    .join('\n');
  return [
    head({ title: entry.title, description, canonical: url, image: coverUrl(entry), type: 'article', noindex: entry.visibility === 'unlisted', extra }),
    '<body>',
    header('<a href="../index.html#writing">All writing</a>'),
    writingMain(entry, options),
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

// ---------- Home page sections ----------

/** One project card on the home page, in the hand-written markup. */
export function projectCard(entry) {
  const card = entry.card ?? {};
  const list = (entry.disciplines?.length ? entry.disciplines : [entry.discipline]).filter(Boolean);
  const primary = disc(entry.discipline ?? list[0]);
  const cats = [...new Set(list.map((d) => disc(d).cls))].join(' ') || primary.cls;
  const tags = [
    ...list.map((d) => `<li><span class="dot ${disc(d).cls}"></span>${disc(d).label}</li>`),
    entry.dateLabel?.trim() ? `<li>${escapeHtml(entry.dateLabel.trim())}</li>` : '',
  ].join('');

  let visual = '';
  const v = card.visual;
  if (v?.type === 'number') {
    visual = `<div class="visual figure-num"><b>${escapeHtml(v.value)}</b><span>${escapeHtml(v.label)}</span></div>`;
  } else if (v?.type === 'image') {
    const media = entry.media?.[v.mediaId];
    const source = imageSource(media, '');
    if (source) {
      const w = media?.width ? ` width="${media.width}"` : '';
      const h = media?.height ? ` height="${media.height}"` : '';
      const srcset = source.srcset ? ` srcset="${escapeHtml(source.srcset)}" sizes="(max-width: 760px) 100vw, 400px"` : '';
      visual = `<div class="visual${v.tall ? ' tall' : ''}"><img src="${escapeHtml(source.src)}"${srcset}${w}${h} alt="${escapeHtml(v.alt ?? '')}" loading="lazy" /></div>`;
    }
  }

  const points = (card.points ?? []).filter((p) => p?.trim());
  const links = [
    entry.page !== false && entry.slug ? `<a href="work/${entry.slug}.html">Read the story</a>` : '',
    ...(card.links ?? [])
      .filter((l) => l?.url && l?.label)
      .map((l) => `<a href="${escapeHtml(l.url)}" target="_blank" rel="noopener">${escapeHtml(l.label)}</a>`),
  ].join('');

  const lines = [
    `          <li class="project ${primary.cls}" data-cat="${cats}">`,
    `            ${visual}`,
    '            <div>',
    `              <ul class="tags">${tags}</ul>`,
    `              <h3>${escapeHtml(card.title?.trim() || entry.title)}</h3>`,
    `              <p>${renderInline(card.summary?.trim() || entry.summary?.trim() || '')}</p>`,
  ];
  if (points.length) {
    lines.push('              <ul class="points">');
    for (const p of points) lines.push(`                <li>${renderInline(p.trim())}</li>`);
    lines.push('              </ul>');
  }
  if (card.stack?.trim()) lines.push(`              <p class="stack">${escapeHtml(card.stack.trim())}</p>`);
  if (links) lines.push(`              <p class="links">${links}</p>`);
  lines.push('            </div>', '          </li>');
  return lines.join('\n');
}

export function projectList(projects) {
  return projects.map(projectCard).join('\n\n');
}

/** The Writing section for the home page, or '' when nothing is published. */
export function writingSection(items) {
  if (!items.length) return '';
  const li = (e) => {
    const poem = e.kind === 'poem' || e.layout === 'poem';
    const meta = [writingDate(e), poem ? null : `${readingMinutes(e.blocks, e.title)} min read`].filter(Boolean).join(' · ');
    const tag = poem ? ' <span class="tag-poem">Poem</span>' : '';
    const summary = e.summary?.trim() ? `<p>${renderInline(e.summary.trim())}</p>` : '';
    return `          <li><a href="writing/${e.slug}.html">${escapeHtml(e.title)}</a>${summary}<p class="meta">${escapeHtml(meta)}${tag}</p></li>`;
  };
  return [
    '    <!-- Writing -->',
    '    <section id="writing">',
    '      <div class="wrap">',
    '        <div class="section-head">',
    '          <h2>Writing</h2>',
    '          <p>Articles, tutorials and poems.</p>',
    '        </div>',
    '        <ul class="writing-list">',
    ...items.map(li),
    '        </ul>',
    '      </div>',
    '    </section>',
    '',
  ].join('\n');
}

// ---------- Feeds ----------

export function sitemap(urls) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((u) => `  <url><loc>${escapeHtml(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod.slice(0, 10)}</lastmod>` : ''}</url>`),
    '</urlset>',
    '',
  ].join('\n');
}

export function feed(items) {
  const item = (e) =>
    [
      '    <item>',
      `      <title>${escapeHtml(e.title)}</title>`,
      `      <link>${SITE_URL}/writing/${e.slug}.html</link>`,
      `      <guid>${SITE_URL}/writing/${e.slug}.html</guid>`,
      e.publishedAt ? `      <pubDate>${new Date(e.publishedAt).toUTCString()}</pubDate>` : '',
      `      <description>${escapeHtml(plainText(e.summary ?? '').trim())}</description>`,
      '    </item>',
    ]
      .filter(Boolean)
      .join('\n');
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '  <channel>',
    '    <title>Kelvin Mafurendi: Writing</title>',
    `    <link>${SITE_URL}/#writing</link>`,
    '    <description>Articles, tutorials and poems by Kelvin Mafurendi.</description>',
    ...items.map(item),
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}
