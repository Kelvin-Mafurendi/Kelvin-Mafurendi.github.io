// The hero scope: three live phase currents on a chart that scrolls right to left.
// "Inject a fault" runs what a protection test does on the bench: a fault appears,
// the relay picks up, the breaker trips, and after the dead time it recloses.
(function scope() {
  const hero = document.querySelector('.hero');
  const canvas = document.getElementById('scope');
  if (!hero || !canvas) return;
  const ctx = canvas.getContext('2d');
  const btn = document.getElementById('fault-btn');
  const stateEl = document.getElementById('cb-state');
  const msgEl = document.getElementById('scope-msg');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const css = getComputedStyle(document.documentElement);
  const COLORS = ['--trace-r', '--trace-y', '--trace-b'].map((v) => css.getPropertyValue(v).trim());
  const GRID = css.getPropertyValue('--scope-line').trim();
  const PHI = [0, -2 * Math.PI / 3, 2 * Math.PI / 3];
  const FAULTS = [
    { phases: [0], text: 'Earth fault on R phase. 51N picked up.' },
    { phases: [1, 2], text: 'Y to B phase fault. 51 picked up.' },
    { phases: [0, 1, 2], text: 'Three-phase fault. 50 picked up.' },
  ];
  const SPEED = 0.85;      // cycles drawn per second
  const TRIP_AFTER = 2.6;  // cycles from fault to trip
  const DEAD_TIME = 3.2;   // cycles the breaker stays open
  const FAULT_GAIN = 2.8;  // fault current, per unit
  const DC_TAU = 1.4;      // decay of the DC offset, cycles

  let W = 0, H = 0, dpr = 1, cyclesShown = 5;
  let now = 0;             // simulation time, in cycles
  let last = 0, running = false, visible = true;
  let ev = null;           // { type, at, trip, reclose }
  let nextFault = 0;
  const born = performance.now();

  function current(k, u) {
    const base = Math.sin(2 * Math.PI * u + PHI[k]);
    if (!ev || u < ev.at) return base;
    if (u < ev.trip) {
      if (!ev.type.phases.includes(k)) return base;
      const d = u - ev.at;
      return FAULT_GAIN * (base - Math.sin(2 * Math.PI * ev.at + PHI[k]) * Math.exp(-d / DC_TAU));
    }
    if (u < ev.reclose) return 0;
    return base;
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    cyclesShown = W < 520 ? 2.6 : W < 900 ? 3.6 : 5;
    draw(1);
  }

  function draw(power) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    // graticule
    ctx.strokeStyle = GRID;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const cols = Math.round(cyclesShown * 2);
    for (let i = 1; i < cols; i++) { const x = Math.round((i / cols) * W) + .5; ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let j = 1; j < 4; j++) { const y = Math.round((j / 4) * H) + .5; ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();

    const mid = H / 2;
    const unit = (H / 2) * 0.2 * power; // 1 per unit, in pixels
    const step = Math.max(1.5, W / 700);
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 3; k++) {
      ctx.strokeStyle = COLORS[k];
      ctx.shadowColor = COLORS[k];
      ctx.shadowBlur = 10;
      ctx.beginPath();
      for (let x = 0; x <= W + step; x += step) {
        const u = now - (1 - x / W) * cyclesShown;
        const y = mid - unit * current(k, u);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = 'source-over';
  }

  function setState(cls, state, msg) {
    hero.classList.toggle('fault', cls === 'fault');
    hero.classList.toggle('dead', cls === 'dead');
    if (stateEl.textContent !== state) stateEl.textContent = state;
    if (msgEl.textContent !== msg) msgEl.textContent = msg;
  }

  function updateStatus() {
    if (!ev) return;
    if (now < ev.trip) setState('fault', 'Breaker closed', ev.type.text);
    else if (now < ev.reclose) setState('dead', 'Breaker open', 'Tripped. Fault cleared. Reclosing after the dead time.');
    else if (now < ev.reclose + cyclesShown) setState('', 'Breaker closed', 'Reclosed. Supply restored.');
    else { ev = null; btn.disabled = false; setState('', 'Breaker closed', 'Three-phase supply, healthy.'); }
  }

  function frame(t) {
    if (!running) return;
    const dt = Math.min((t - last) / 1000, 0.05);
    last = t;
    now += dt * SPEED;
    updateStatus();
    draw(Math.min(1, (t - born) / 1400)); // traces swell as the screen powers up
    requestAnimationFrame(frame);
  }

  function sync() {
    const should = visible && !document.hidden && !reduce;
    if (should && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
    else if (!should) running = false;
  }

  btn?.addEventListener('click', () => {
    const type = FAULTS[nextFault++ % FAULTS.length];
    ev = { type, at: now + 0.15, trip: now + 0.15 + TRIP_AFTER, reclose: now + 0.15 + TRIP_AFTER + DEAD_TIME };
    btn.disabled = true;
  });

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }).observe(canvas);
  document.addEventListener('visibilitychange', sync);
  resize();
  sync();
})();

// One mark per switchgear panel
document.querySelectorAll('.lineup[data-n]').forEach((el) => {
  el.innerHTML = '<i></i>'.repeat(Number(el.dataset.n));
});

// Mobile navigation
(function nav() {
  const btn = document.querySelector('.nav-toggle');
  const nav = document.getElementById('nav');
  if (!btn || !nav) return;
  const set = (open) => {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Close' : 'Menu';
  };
  btn.addEventListener('click', () => set(!nav.classList.contains('open')));
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => set(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
})();

// Section tracking: marks the current section in the header and in the single-line
// rail, where the section you are reading is the feeder with its breaker closed.
(function sections() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const targets = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (!targets.length) return;

  const rail = document.createElement('ul');
  rail.className = 'rail';
  rail.setAttribute('aria-hidden', 'true');
  links.forEach((a) => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${a.getAttribute('href')}" tabindex="-1"><span>${a.textContent}</span></a>`;
    rail.appendChild(li);
  });
  document.body.appendChild(rail);
  const railLinks = [...rail.querySelectorAll('a')];

  let ticking = false;
  function update() {
    ticking = false;
    const line = window.innerHeight * 0.4;
    let active = -1;
    targets.forEach((s, i) => { if (s.getBoundingClientRect().top <= line) active = i; });
    [links, railLinks].forEach((set) => set.forEach((a, i) => {
      if (i === active) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    }));
    const footTop = document.querySelector('footer')?.getBoundingClientRect().top ?? Infinity;
    rail.classList.toggle('on', active >= 0 && footTop > window.innerHeight * 0.75);
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();
})();

// Project filters. Where the browser supports it, the list reflows as one smooth transition.
(function filters() {
  const buttons = document.querySelectorAll('.filters button');
  const items = document.querySelectorAll('.project');
  const count = document.getElementById('filter-count');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  items.forEach((it, i) => { it.style.viewTransitionName = 'project-' + i; });
  buttons.forEach((b) => b.addEventListener('click', () => {
    const f = b.dataset.filter;
    const apply = () => {
      let shown = 0;
      buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      items.forEach((it) => {
        const show = f === 'all' || it.dataset.cat.split(' ').includes(f);
        it.hidden = !show;
        if (show) shown++;
      });
      if (count) count.textContent = shown + (shown === 1 ? ' project' : ' projects');
    };
    if (document.startViewTransition && !reduce) document.startViewTransition(apply); else apply();
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

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
