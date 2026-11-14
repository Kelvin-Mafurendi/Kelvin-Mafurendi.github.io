// Blocks to HTML. One renderer for the site build and for the app's preview
// (studio/preview.html), so the preview cannot drift from the live page.

import { escapeHtml, renderInline, renderMarkdown } from './markdown.mjs';

const WEBP_WIDTHS = [600, 1200, 2400];

/**
 * How to show a media item. `media` is the entry's media map entry:
 *   { siteAsset }                        a file already on the site (imported stories)
 *   { width, height, variants }          Storage variants: '600', '1200', '2400', 'jpeg'
 *   { url }                              a ready URL (the app's preview)
 */
export function imageSource(media, base = '../') {
  if (!media) return null;
  if (media.siteAsset) return { src: base + media.siteAsset };
  if (media.url) return { src: media.url, width: media.width, height: media.height };
  const v = media.variants ?? {};
  const widths = WEBP_WIDTHS.filter((w) => v[String(w)]);
  const src = v.jpeg ?? v[String(widths.at(-1))];
  if (!src) return null;
  const actual = (w) => (media.width ? Math.min(w, media.width) : w);
  return {
    src,
    srcset: widths.map((w) => `${v[String(w)]} ${actual(w)}w`).join(', '),
    width: media.width,
    height: media.height,
  };
}

function img(source, alt, sizes) {
  if (!source) return '';
  const attrs = [`src="${escapeHtml(source.src)}"`];
  if (source.srcset) attrs.push(`srcset="${escapeHtml(source.srcset)}"`, `sizes="${sizes}"`);
  if (source.width && source.height) attrs.push(`width="${source.width}"`, `height="${source.height}"`);
  attrs.push(`alt="${escapeHtml(alt)}"`, 'loading="lazy"');
  return `<img ${attrs.join(' ')} />`;
}

function figcaption(text) {
  return text && text.trim() ? `<figcaption>${renderInline(text.trim())}</figcaption>` : '';
}

const FIGURE_CLASS = { inline: 'narrow', wide: 'wide', full: 'full' };
const SIZES = { narrow: '360px', wide: '(max-width: 1120px) 100vw, 1024px', full: '100vw', pair: '(max-width: 640px) 100vw, 420px' };

/** One block to HTML. Unknown types render nothing. */
export function renderBlock(block, ctx) {
  const media = (id) => imageSource(id ? ctx.media?.(id) : null, ctx.base);
  switch (block.type) {
    case 'text':
      return renderMarkdown(block.md);
    case 'heading': {
      const tag = block.level === 3 ? 'h3' : 'h2';
      return block.text?.trim() ? `<${tag}>${renderInline(block.text.trim())}</${tag}>` : '';
    }
    case 'image': {
      const source = media(block.mediaId);
      if (!source) return '';
      const cls = FIGURE_CLASS[block.size] ?? 'narrow';
      const alt = block.alt?.trim() || block.caption?.trim() || '';
      return `<figure class="${cls}">${img(source, alt, SIZES[cls])}${figcaption(block.caption)}</figure>`;
    }
    case 'pair': {
      const ids = block.mediaIds ?? [];
      const alts = block.alts ?? [];
      const pictures = [0, 1].map((i) => img(media(ids[i]), alts[i]?.trim() || '', SIZES.pair)).join('');
      return pictures ? `<figure class="pair">${pictures}${figcaption(block.caption)}</figure>` : '';
    }
    case 'numbers': {
      const items = (block.items ?? []).filter((i) => `${i.value ?? ''}${i.unit ?? ''}${i.label ?? ''}`.trim());
      if (!items.length) return '';
      const cell = (i) =>
        `<div><b>${escapeHtml(`${i.value ?? ''}${i.unit ? ` ${i.unit}` : ''}`)}</b><span>${renderInline(i.label ?? '')}</span></div>`;
      return `<div class="numbers">${items.map(cell).join('')}</div>`;
    }
    case 'quote': {
      if (!block.text?.trim()) return '';
      const cite = block.source?.trim() ? `<cite>${renderInline(block.source.trim())}</cite>` : '';
      return `<blockquote class="pull"><p>${renderInline(block.text.trim())}</p>${cite}</blockquote>`;
    }
    case 'stanza': {
      const text = (block.lines ?? []).join('\n');
      return text.trim() ? `<p class="stanza">${escapeHtml(text)}</p>` : '';
    }
    case 'code': {
      if (!block.source?.trim()) return '';
      const lang = /^[a-z0-9+#-]+$/i.test(block.language ?? '') ? block.language : 'plaintext';
      return `<pre class="code"><code class="language-${lang}">${escapeHtml(block.source)}</code></pre>`;
    }
    case 'math':
      return block.tex?.trim() ? `<div class="math" data-tex="${escapeHtml(block.tex.trim())}">${escapeHtml(block.tex.trim())}</div>` : '';
    case 'voice': {
      const audio = block.mediaId ? ctx.media?.(block.mediaId) : null;
      const src = audio?.url ?? audio?.variants?.m4a;
      if (!src) return '';
      const transcript = block.transcript?.trim()
        ? `<details><summary>Show transcript</summary><p>${escapeHtml(block.transcript.trim())}</p></details>`
        : '';
      return `<figure class="voice"><audio controls preload="none" src="${escapeHtml(src)}"></audio>${transcript}</figure>`;
    }
    case 'video': {
      if (!block.youtubeId || !/^[A-Za-z0-9_-]{11}$/.test(block.youtubeId)) return '';
      return `<figure class="video"><div class="frame" data-yt="${block.youtubeId}"></div>${figcaption(block.caption) || '<figcaption>Video</figcaption>'}</figure>`;
    }
    case 'callout': {
      if (!block.md?.trim()) return '';
      const tone = ['note', 'lesson', 'warning'].includes(block.tone) ? block.tone : 'note';
      const label = { note: 'Note', lesson: 'Lesson', warning: 'Warning' }[tone];
      return `<aside class="callout ${tone}"><p class="callout-label">${label}</p>${renderMarkdown(block.md)}</aside>`;
    }
    case 'divider':
      return '<hr />';
    default:
      return '';
  }
}

/** All blocks, one per line, as the story pages have always been written. */
export function renderBlocks(blocks, ctx) {
  return (blocks ?? [])
    .map((b) => renderBlock(b, ctx))
    .filter(Boolean)
    .join('\n');
}

/** Which page scripts the blocks need. */
export function blockNeeds(blocks) {
  const types = new Set((blocks ?? []).map((b) => b.type));
  return { math: types.has('math'), code: types.has('code'), video: types.has('video') };
}

export function wordCount(blocks, title = '') {
  const words = (s) => (String(s ?? '').match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? []).length;
  return (blocks ?? []).reduce((n, b) => {
    switch (b.type) {
      case 'text':
      case 'callout':
        return n + words(b.md);
      case 'heading':
      case 'quote':
        return n + words(b.text);
      case 'stanza':
        return n + words((b.lines ?? []).join(' '));
      case 'image':
      case 'pair':
      case 'video':
        return n + words(b.caption);
      case 'voice':
        return n + words(b.transcript);
      default:
        return n;
    }
  }, words(title));
}

/** Minutes to read, at 230 words a minute, never less than one. */
export function readingMinutes(blocks, title) {
  return Math.max(1, Math.round(wordCount(blocks, title) / 230));
}
