import assert from 'node:assert/strict';
import { test } from 'node:test';

import { fillMarker, orderProjects, renderSite } from '../build.mjs';
import { imageSource, readingMinutes, renderBlock } from '../render/blocks.mjs';
import { renderInline, renderMarkdown } from '../render/markdown.mjs';
import { projectCard, storyMain, writingMain } from '../render/pages.mjs';

const ctx = { base: '../', media: (id) => ({ m1: { siteAsset: 'assets/img/web/a.jpg' }, a1: { url: 'https://x/a.m4a' } })[id] ?? null };

test('inline Markdown matches the app: bold, italic, code, links', () => {
  assert.equal(
    renderInline('a **bold** _it_ `x<1` [site](https://example.com) end'),
    'a <strong>bold</strong> <em>it</em> <code>x&lt;1</code> <a href="https://example.com" target="_blank" rel="noopener">site</a> end',
  );
  assert.equal(renderInline('**very _much_ so**'), '<strong>very <em>much</em> so</strong>');
  assert.equal(renderInline('set motor_speed_ref first'), 'set motor_speed_ref first');
  assert.equal(renderInline('2 * 3 = 6 and **open'), '2 * 3 = 6 and **open');
});

test('only web and mail links become links', () => {
  assert.ok(!renderInline('[x](javascript:alert(1))').includes('<a'));
  assert.equal(renderInline('[mail](mailto:k@example.com)'), '<a href="mailto:k@example.com">mail</a>');
});

test('HTML in text is shown, never run', () => {
  assert.equal(renderInline('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
  assert.equal(renderBlock({ type: 'heading', text: '<img onerror=x>' }, ctx), '<h2>&lt;img onerror=x&gt;</h2>');
});

test('paragraphs and lists', () => {
  assert.equal(renderMarkdown('One\n\n- a\n- b\n\n1. c\n\nTwo'), '<p>One</p>\n<ul><li>a</li><li>b</li></ul>\n<ol><li>c</li></ol>\n<p>Two</p>');
});

test('every block type renders', () => {
  const html = (b) => renderBlock(b, ctx);
  assert.equal(html({ type: 'image', mediaId: 'm1', caption: 'Rig', size: 'wide' }), '<figure class="wide"><img src="../assets/img/web/a.jpg" alt="Rig" loading="lazy" /><figcaption>Rig</figcaption></figure>');
  assert.match(html({ type: 'pair', mediaIds: ['m1', 'm1'], alts: ['A', 'B'], caption: 'Both' }), /^<figure class="pair"><img [^>]*alt="A"[^>]*\/><img [^>]*alt="B"[^>]*\/><figcaption>Both<\/figcaption><\/figure>$/);
  assert.equal(html({ type: 'numbers', items: [{ value: '0.07', unit: 's', label: 'rise time' }] }), '<div class="numbers"><div><b>0.07 s</b><span>rise time</span></div></div>');
  assert.equal(html({ type: 'stanza', lines: ['  first', '', 'third'] }), '<p class="stanza">  first\n\nthird</p>');
  assert.equal(html({ type: 'code', language: 'c', source: 'a<b' }), '<pre class="code"><code class="language-c">a&lt;b</code></pre>');
  assert.equal(html({ type: 'math', tex: '\\frac{a}{b}' }), '<div class="math" data-tex="\\frac{a}{b}">\\frac{a}{b}</div>');
  assert.match(html({ type: 'voice', mediaId: 'a1', transcript: 'Hello' }), /<audio controls preload="none" src="https:\/\/x\/a.m4a"><\/audio><details><summary>Show transcript<\/summary><p>Hello<\/p><\/details>/);
  assert.equal(html({ type: 'video', youtubeId: 'dQw4w9WgXcQ', caption: 'Run' }), '<figure class="video"><div class="frame" data-yt="dQw4w9WgXcQ"></div><figcaption>Run</figcaption></figure>');
  assert.equal(html({ type: 'callout', tone: 'warning', md: 'Careful' }), '<aside class="callout warning"><p class="callout-label">Warning</p><p>Careful</p></aside>');
  assert.equal(html({ type: 'quote', text: 'Overdo it!', source: 'Kelvin' }), '<blockquote class="pull"><p>Overdo it!</p><cite>Kelvin</cite></blockquote>');
  assert.equal(html({ type: 'divider' }), '<hr />');
  assert.equal(html({ type: 'chart' }), '');
  assert.equal(html({ type: 'video', youtubeId: '"><script>' }), '');
});

test('Storage pictures get srcset, width and height', () => {
  const s = imageSource({ width: 1000, height: 500, variants: { 600: 'u600', 1200: 'u1200', jpeg: 'ujpg' } });
  assert.deepEqual(s, { src: 'ujpg', srcset: 'u600 600w, u1200 1000w', width: 1000, height: 500 });
});

const project = (id, extra = {}) => ({
  id,
  kind: 'project',
  slug: id,
  title: `Story ${id}`,
  summary: 'Dek',
  discipline: 'power',
  visibility: 'published',
  blocks: [{ type: 'text', md: 'Body' }],
  card: { title: `Card ${id}`, summary: 'Card text', points: ['One'], stack: 'MATLAB', links: [{ label: 'Code', url: 'https://github.com/x' }], visual: { type: 'number', value: '7', label: 'things' } },
  ...extra,
});

test('a story page has the hand-written structure', () => {
  const html = storyMain(project('a', { disciplineLabel: 'Power and protection', facts: [{ label: 'When', value: '2025' }] }), { next: { slug: 'b', title: 'Story b' } });
  assert.match(html, /<main id="main" class="story r">/);
  assert.match(html, /<li><span class="dot r"><\/span>Power and protection<\/li>/);
  assert.match(html, /<dl class="story-meta"><div><dt>When<\/dt><dd>2025<\/dd><\/div><\/dl>/);
  assert.match(html, /<a href="b.html">Next: Story b<\/a>/);
});

test('a project card has the hand-written structure', () => {
  const html = projectCard(project('a', { disciplines: ['embedded', 'control'], dateLabel: 'Honours research, 2025' }));
  assert.match(html, /<li class="project r" data-cat="b y">/);
  assert.match(html, /<ul class="tags"><li><span class="dot b"><\/span>Embedded<\/li><li><span class="dot y"><\/span>Control<\/li><li>Honours research, 2025<\/li><\/ul>/);
  assert.match(html, /<div class="visual figure-num"><b>7<\/b><span>things<\/span><\/div>/);
  assert.match(html, /<p class="links"><a href="work\/a.html">Read the story<\/a><a href="https:\/\/github.com\/x" target="_blank" rel="noopener">Code<\/a><\/p>/);
  assert.doesNotMatch(projectCard(project('b', { page: false })), /Read the story/);
});

test('projects follow the site order; Next wraps round and skips unlisted', () => {
  const data = {
    entries: [project('c'), project('a'), project('b', { visibility: 'unlisted' }), project('d', { visibility: 'private' })],
    site: { projectOrder: ['a', 'b', 'c'] },
  };
  const { files, unlisted } = renderSite(data, '<ul class="projects">\n<!-- studio:projects -->\nold\n<!-- /studio:projects -->\n</ul>');
  assert.deepEqual([...files.keys()].sort(), ['index.html', 'work/a.html', 'work/b.html', 'work/c.html']);
  assert.match(files.get('work/a.html'), /Next: Story c/);
  assert.match(files.get('work/c.html'), /Next: Story a/);
  assert.doesNotMatch(files.get('work/b.html'), /Next:/);
  assert.match(files.get('work/b.html'), /<meta name="robots" content="noindex" \/>/);
  assert.ok(unlisted.has('work/b.html'));
  const index = files.get('index.html');
  assert.ok(index.indexOf('Card a') < index.indexOf('Card c'));
  assert.doesNotMatch(index, /Card b|Card d|old/);
  assert.deepEqual(orderProjects([{ id: 'x', sortDate: '2024' }, { id: 'y', sortDate: '2026' }]).map((p) => p.id), ['y', 'x']);
});

test('writing: pages, home section, nav link, feed, previous and next', () => {
  const article = { id: 'w1', kind: 'article', slug: 'first', title: 'First', summary: 'S', visibility: 'published', publishedAt: '2026-11-01T10:00:00Z', blocks: [{ type: 'text', md: 'word '.repeat(460) }] };
  const poem = { id: 'w2', kind: 'poem', slug: 'second', title: 'Second', visibility: 'published', publishedAt: '2026-11-05T10:00:00Z', blocks: [{ type: 'stanza', lines: ['a line'] }] };
  const index = '<nav><a href="#projects">Projects</a>\n<!-- studio:nav-writing -->\n</nav>\n<!-- studio:writing -->\n<!-- Credentials -->';
  const { files } = renderSite({ entries: [article, poem], site: {} }, index);
  assert.match(files.get('index.html'), /<a href="#writing">Writing<\/a>/);
  assert.match(files.get('index.html'), /<section id="writing">[\s\S]*second\.html[\s\S]*first\.html/);
  assert.match(files.get('index.html'), /<span class="tag-poem">Poem<\/span>/);
  assert.match(files.get('writing/second.html'), /class="story writing-page poem"/);
  assert.match(files.get('writing/second.html'), /Source\+Serif\+4/);
  assert.match(files.get('writing/second.html'), /Next: First/);
  assert.match(files.get('writing/first.html'), /Previous: Second/);
  assert.match(files.get('writing/first.html'), /2 min read/);
  assert.match(files.get('feed.xml'), /<link>https:\/\/kelvin-mafurendi.github.io\/writing\/second.html<\/link>/);
  assert.equal(readingMinutes(article.blocks, ''), 2);
});

test('with nothing published, the home page is left exactly as written', () => {
  const index = '<ul class="projects">\n<!-- studio:projects -->\nhand-written\n<!-- /studio:projects -->\n</ul>\n<!-- studio:writing -->';
  assert.equal(renderSite({ entries: [] }, index).files.get('index.html'), index);
  assert.equal(fillMarker('a<!-- studio:x -->b', 'x', 'C'), 'a<!-- studio:x -->\nCb');
});

test('the page shows the entry, never script from it', () => {
  const html = writingMain({ kind: 'article', title: '<script>x</script>', summary: '<b>hi</b>', blocks: [] });
  assert.doesNotMatch(html, /<script>|<b>hi/);
});

test('build reports: building has a start time, live and failed a finish time, nothing else is accepted', async () => {
  const { reportFields } = await import('../report.mjs');
  const now = new Date('2026-11-14T10:00:00Z');
  assert.deepEqual(reportFields('building', { runUrl: 'https://x/run', now }), { status: 'building', runUrl: 'https://x/run', startedAt: now });
  assert.deepEqual(reportFields('live', { now }), { status: 'live', runUrl: null, finishedAt: now });
  assert.throws(() => reportFields('published'));
});
