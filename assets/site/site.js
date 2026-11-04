// Three-phase waveform in the hero, drawn once on load.
(function drawPhases() {
  const svg = document.getElementById('phase-svg');
  if (!svg) return;
  const W = 1000, mid = 80, amp = 62, cycles = 2.5, steps = 400;
  const shifts = [['p-r', 0], ['p-y', -2 * Math.PI / 3], ['p-b', 2 * Math.PI / 3]];
  const ns = 'http://www.w3.org/2000/svg';
  shifts.forEach(([cls, phi]) => {
    let d = '';
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * W;
      const y = mid - amp * Math.sin((i / steps) * cycles * 2 * Math.PI + phi);
      d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    const p = document.createElementNS(ns, 'path');
    p.setAttribute('d', d);
    p.setAttribute('class', 'trace ' + cls);
    svg.appendChild(p);
    const len = p.getTotalLength();
    p.style.setProperty('--len', len);
  });
  requestAnimationFrame(() => svg.parentElement.classList.add('draw'));
})();

// Mobile navigation
(function nav() {
  const btn = document.querySelector('.nav-toggle');
  const nav = document.getElementById('nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Close' : 'Menu';
  });
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = 'Menu';
  }));
})();

// Project filters
(function filters() {
  const buttons = document.querySelectorAll('.filters button');
  const items = document.querySelectorAll('.project');
  buttons.forEach((b) => b.addEventListener('click', () => {
    const f = b.dataset.filter;
    buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    items.forEach((it) => {
      const cats = it.dataset.cat.split(' ');
      it.hidden = !(f === 'all' || cats.includes(f));
    });
  }));
})();

// YouTube: show a thumbnail and load the player only when clicked
(function videos() {
  document.querySelectorAll('.frame[data-yt]').forEach((frame) => {
    const id = frame.dataset.yt;
    const title = frame.parentElement.querySelector('figcaption').textContent;
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
})();

// Contact form: send without leaving the page
(function contact() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    status.className = 'form-status';
    status.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      status.className = 'form-status ok';
      status.textContent = 'Message sent. I’ll reply by email.';
    } catch (err) {
      status.className = 'form-status err';
      status.textContent = 'The message didn’t send. Please email mafurendiofficial@gmail.com instead.';
    } finally {
      btn.disabled = false;
    }
  });
})();

// Lightbox for photos
window.openLightbox = function (src, caption) {
  const dlg = document.getElementById('lightbox');
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox-img').alt = caption || '';
  document.getElementById('lightbox-caption').textContent = caption || '';
  dlg.showModal();
};
document.getElementById('lightbox-close')?.addEventListener('click', () => document.getElementById('lightbox').close());
document.getElementById('lightbox')?.addEventListener('click', (e) => { if (e.target.id === 'lightbox') e.target.close(); });

document.getElementById('year').textContent = new Date().getFullYear();
