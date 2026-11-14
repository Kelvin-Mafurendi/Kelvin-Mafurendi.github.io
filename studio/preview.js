// The Kelvin Studio app's preview. The app loads this page in a WebView and
// calls studioRender({ entry, previous, next }) with the entry in the same
// shape the site build reads, its pictures as data: or https: URLs. The page
// is drawn with the build's own renderer, so the preview is the published page.

import { escapeHtml, renderInline } from '../build/render/markdown.mjs';
import { imageSource } from '../build/render/blocks.mjs';
import { storyMain, writingMain } from '../build/render/pages.mjs';

function photoMain(entry) {
  const media = entry.cover ? entry.media?.[entry.cover.mediaId] : null;
  const source = imageSource(media, '../');
  const details = [entry.place, entry.sortDate].filter((s) => s && String(s).trim()).map(escapeHtml).join(' · ');
  return [
    '<main id="main" class="story writing-page">',
    '<div class="story-hero"><div class="wrap">',
    '<ul class="tags project-tags"><li>Photography</li></ul>',
    `<h1>${escapeHtml(entry.title || 'Untitled photo')}</h1>`,
    entry.summary ? `<p class="dek">${renderInline(entry.summary)}</p>` : '',
    details ? `<p class="byline">${details}</p>` : '',
    '</div></div>',
    '<div class="story-body"><div class="wrap">',
    source ? `<figure class="wide"><img src="${escapeHtml(source.src)}" alt="${escapeHtml(entry.title ?? '')}" /></figure>` : '',
    '</div></div>',
    '</main>',
  ].join('');
}

function render({ entry, previous = null, next = null }) {
  const page = document.getElementById('page');
  let html;
  if (entry.kind === 'project') html = storyMain(entry, { next });
  else if (entry.kind === 'photo') html = photoMain(entry);
  else html = writingMain(entry, { previous, next });
  page.innerHTML = html;
  document.title = `${entry.title || 'Preview'}, Kelvin Mafurendi`;
  window.studioBlocks?.(page);
  window.scrollTo(0, 0);
  window.StudioPreview?.postMessage('rendered');
}

window.studioRender = (payload) => {
  try {
    render(typeof payload === 'string' ? JSON.parse(payload) : payload);
  } catch (e) {
    document.getElementById('page').innerHTML = `<main id="main" class="story"><div class="story-hero"><div class="wrap"><p class="dek">This entry could not be shown: ${escapeHtml(e.message)}</p></div></div></main>`;
    window.StudioPreview?.postMessage(`error:${e.message}`);
  }
};

// Links between site pages lead nowhere in a preview; outside links still open.
document.addEventListener('click', (e) => {
  const a = e.target.closest?.('a[href]');
  if (a && a.target !== '_blank') e.preventDefault();
});

// Scripts load in order; tell the app it can send the entry.
window.addEventListener('load', () => window.StudioPreview?.postMessage('ready'));
