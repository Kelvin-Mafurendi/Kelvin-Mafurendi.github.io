// The Markdown subset used by text and callout blocks: bold, italic, links,
// lists and inline code. Mirrors the Kelvin Studio app's parser, so the
// editor and the site agree on what each piece of text means.
//
// Runs in Node (site build) and in the browser (studio/preview.html).

export function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const INLINE = new RegExp(
  [
    '(`[^`\\n]+`)', // code
    '(\\*\\*(?=\\S)[\\s\\S]+?(?<=\\S)\\*\\*)', // bold
    '(\\[[^\\]\\n]+\\]\\([^)\\s]+\\))', // link
    '((?<![\\p{L}\\p{N}_])_(?=\\S)[^_\\n]+?(?<=\\S)_(?![\\p{L}\\p{N}_]))', // _italic_
    '((?<![*\\w])\\*(?=\\S)[^*\\n]+?(?<=\\S)\\*(?!\\*))', // *italic*
  ].join('|'),
  'gu',
);
const LINK_PARTS = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

/** Only web and mail links are followed; anything else is shown as text. */
export function safeLink(url) {
  try {
    const scheme = new URL(url, 'https://example.invalid/').protocol;
    if (!/^[a-z][a-z0-9+.-]*:/i.test(url)) return url; // relative link on the site
    return ['http:', 'https:', 'mailto:'].includes(scheme) ? url : null;
  } catch {
    return null;
  }
}

function linkTag(url, inner) {
  const external = /^https?:\/\//i.test(url);
  return external
    ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${inner}</a>`
    : `<a href="${escapeHtml(url)}">${inner}</a>`;
}

/** Inline Markdown to HTML. */
export function renderInline(text) {
  let out = '';
  let last = 0;
  for (const m of String(text ?? '').matchAll(INLINE)) {
    out += escapeHtml(text.slice(last, m.index));
    const token = m[0];
    if (m[1]) {
      out += `<code>${escapeHtml(token.slice(1, -1))}</code>`;
    } else if (m[2]) {
      out += `<strong>${renderInline(token.slice(2, -2))}</strong>`;
    } else if (m[3]) {
      const [, label, url] = token.match(LINK_PARTS);
      const safe = safeLink(url);
      out += safe ? linkTag(safe, renderInline(label)) : renderInline(label);
    } else {
      out += `<em>${renderInline(token.slice(1, -1))}</em>`;
    }
    last = m.index + token.length;
  }
  return out + escapeHtml(String(text ?? '').slice(last));
}

const BULLET = /^\s*[-*+]\s+/;
const NUMBERED = /^\s*(\d{1,3})[.)]\s+/;

/** Block Markdown (paragraphs and lists) to HTML, one element per line. */
export function renderMarkdown(md) {
  const html = [];
  let paragraph = [];
  let list = null; // { tag, items }

  const flushParagraph = () => {
    if (paragraph.length) html.push(`<p>${renderInline(paragraph.join('\n'))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (list) html.push(`<${list.tag}>${list.items.map((i) => `<li>${renderInline(i)}</li>`).join('')}</${list.tag}>`);
    list = null;
  };
  const addItem = (tag, text) => {
    flushParagraph();
    if (list && list.tag !== tag) flushList();
    list ??= { tag, items: [] };
    list.items.push(text);
  };

  for (const line of String(md ?? '').replace(/\r\n/g, '\n').split('\n')) {
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    const bullet = line.match(BULLET);
    const numbered = line.match(NUMBERED);
    if (bullet) addItem('ul', line.slice(bullet[0].length));
    else if (numbered) addItem('ol', line.slice(numbered[0].length));
    else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  return html.join('\n');
}

/** Plain words, for descriptions, feeds and reading time. */
export function plainText(md) {
  return String(md ?? '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/^\s*([-*+]|\d{1,3}[.)])\s+/gm, '');
}
