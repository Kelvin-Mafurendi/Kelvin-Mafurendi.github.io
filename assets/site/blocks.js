// Story and writing pages: formulas (KaTeX), code colours (highlight.js) and
// click-to-load YouTube videos. Loaded only on pages that use them, and by
// studio/preview.html, which calls studioBlocks() after each render.

window.studioBlocks = function studioBlocks(root = document) {
  if (window.katex) {
    root.querySelectorAll('.math[data-tex]').forEach((el) => {
      try {
        window.katex.render(el.dataset.tex, el, { displayMode: true, throwOnError: false });
      } catch (e) {
        // Leave the TeX visible as text.
      }
    });
  }

  if (window.hljs) {
    root.querySelectorAll('pre.code code').forEach((el) => window.hljs.highlightElement(el));
  }

  root.querySelectorAll('.frame[data-yt]').forEach((frame) => {
    if (frame.querySelector('.poster, iframe')) return;
    const id = frame.dataset.yt;
    const title = frame.parentElement.querySelector('figcaption')?.textContent || 'Video';
    const poster = document.createElement('button');
    poster.type = 'button';
    poster.className = 'poster';
    poster.style.backgroundImage = `url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)`;
    poster.setAttribute('aria-label', 'Play video: ' + title);
    poster.innerHTML = '<span>Play video</span>';
    poster.addEventListener('click', () => {
      const f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
      f.title = title;
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true;
      frame.replaceChildren(f);
    });
    frame.appendChild(poster);
  });
};

window.studioBlocks();
