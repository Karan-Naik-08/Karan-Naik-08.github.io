(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasG = !!(window.gsap && window.ScrollTrigger);
  if (hasG) gsap.registerPlugin(ScrollTrigger);

  /* ---------- nav ---------- */
  const nav = $('#nav'), toggle = $('#nav-toggle'), links = $('#nav-links');
  toggle.addEventListener('click', () => {
    const o = links.classList.toggle('open'); nav.classList.toggle('open', o);
    toggle.setAttribute('aria-expanded', o); toggle.firstElementChild.textContent = o ? 'Close' : 'Menu';
    document.body.classList.toggle('lock', o);
  });
  links.addEventListener('click', e => { if (e.target.closest('a') && links.classList.contains('open')) toggle.click(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && links.classList.contains('open')) toggle.click(); });
  const themeObs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) nav.dataset.t = e.target.classList.contains('light') ? 'light' : 'dark'; }), { rootMargin: '0px 0px -94% 0px' });
  $$('main > section, .marquee, footer').forEach(s => themeObs.observe(s));
  const navMap = {}; $$('#nav-links a').forEach(a => navMap[a.getAttribute('href').slice(1)] = a);
  const navObs = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && navMap[e.target.id]) { Object.values(navMap).forEach(a => a.classList.remove('on')); navMap[e.target.id].classList.add('on'); }
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main > section, footer').forEach(s => navMap[s.id] && navObs.observe(s));

  /* ---------- custom cursor + labels ---------- */
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    const c = $('#cursor'), lab = $('.cursor-label', c);
    let x = -100, y = -100, cx = x, cy = y, on = false, running = false;
    addEventListener('pointermove', e => {
      x = e.clientX; y = e.clientY;
      if (!on) { on = true; cx = x; cy = y; root.classList.add('has-cursor'); }
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: true });
    function loop() { cx += (x - cx) * .22; cy += (y - cy) * .22; c.style.transform = `translate(${cx}px,${cy}px)`; if (Math.abs(x - cx) + Math.abs(y - cy) > .3) requestAnimationFrame(loop); else running = false; }
    document.addEventListener('pointerover', e => {
      const t = e.target.closest && e.target.closest('[data-cursor]');
      if (t) { lab.textContent = t.dataset.cursor; c.classList.add('big'); } else c.classList.remove('big');
    });
    document.addEventListener('pointerleave', () => c.classList.remove('big'));
  }

  /* ---------- magnetic ---------- */
  if (hasG && !reduce && matchMedia('(hover:hover)').matches) {
    $$('[data-magnetic]').forEach(el => {
      const qx = gsap.quickTo(el, 'x', { duration: .6, ease: 'elastic.out(1,.5)' }), qy = gsap.quickTo(el, 'y', { duration: .6, ease: 'elastic.out(1,.5)' });
      el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * .35); qy((e.clientY - r.top - r.height / 2) * .35); });
      el.addEventListener('pointerleave', () => { qx(0); qy(0); });
    });
  }

  /* ---------- 3D tilt on project tiles ---------- */
  if (hasG && !reduce && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    $$('.tile').forEach(t => {
      const rx = gsap.quickTo(t, 'rotationX', { duration: .5, ease: 'power3.out' }), ry = gsap.quickTo(t, 'rotationY', { duration: .5, ease: 'power3.out' });
      gsap.set(t, { transformPerspective: 900 });
      t.addEventListener('pointermove', e => { const r = t.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - .5) * 10); rx(-((e.clientY - r.top) / r.height - .5) * 10); });
      t.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }

  /* ---------- SVG-filter warp pulse (certs + project numerals) ---------- */
  const warpMap = $('#warp-map');
  // feDisplacementMap is CPU-heavy outside Chromium: only enable there
  const chromium = !!(navigator.userAgentData && navigator.userAgentData.brands.some(b => /Chromium/.test(b.brand)));
  if (!chromium) root.classList.add('nowarp');
  function warp(amount = 70) {
    if (!hasG || reduce || !chromium) return;
    gsap.killTweensOf(warpMap);
    gsap.fromTo(warpMap, { attr: { scale: amount } }, { attr: { scale: 0 }, duration: 1.1, ease: 'power3.out' });
  }
  $$('.tile').forEach(t => t.addEventListener('pointerenter', () => warp(40)));

  /* ---------- cert hover preview ---------- */
  const prev = $('#cert-preview'), pimg = $('img', prev);
  if (matchMedia('(hover:hover) and (min-width:801px)').matches) {
    let px = 0, py = 0, tx = 0, ty = 0, rot = 0, run = false, inside = false;
    const step = () => {
      px += (tx - px) * .16; py += (ty - py) * .16; rot += (Math.max(-12, Math.min(12, (tx - px) * .12)) - rot) * .2;
      prev.style.transform = `translate(${px + 28}px,${py - prev.offsetHeight / 2}px) rotate(${rot}deg)`;
      if (inside || Math.abs(tx - px) > .5) requestAnimationFrame(step); else run = false;
    };
    $$('.cert').forEach(a => {
      a.addEventListener('pointerenter', e => {
        pimg.src = a.dataset.img; tx = px = e.clientX; ty = py = e.clientY; inside = true;
        prev.style.visibility = 'visible'; prev.style.opacity = 1; warp(90);
        if (!run) { run = true; requestAnimationFrame(step); }
      });
      a.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; });
      a.addEventListener('pointerleave', () => { inside = false; prev.style.opacity = 0; setTimeout(() => { if (!inside) prev.style.visibility = 'hidden'; }, 200); });
    });
    prev.style.transition = 'opacity .2s';
    addEventListener('scroll', () => { if (inside) { inside = false; prev.style.opacity = 0; } }, { passive: true });
  }

  /* ---------- case study (full-screen + View Transitions) ---------- */
  const dlg = $('#case'), cTitle = $('#case-title');
  const canVT = !!document.startViewTransition && !reduce;
  if (!canVT) root.classList.add('no-vt');
  const tiles = $$('.tile');
  let current = null, pinST = null, pinDist = 0, lastBtn = null;

  function revealTile(tile) {
    const gut = parseFloat(getComputedStyle($('#hs-track')).paddingLeft) || 0;
    if (pinST) {
      const x = Math.max(0, Math.min(pinDist, tile.offsetLeft - gut));
      scrollTo({ top: pinST.start + (x / (pinDist || 1)) * (pinST.end - pinST.start), behavior: 'instant' });
    } else tile.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'instant' });
  }
  function fill(tile) {
    const g = k => $(`[data-k="${k}"]`, tile);
    $('#case-tech').textContent = $('.t-tech', tile).textContent;
    cTitle.textContent = $('.t-open', tile).textContent;
    $('#case-problem').textContent = g('problem').textContent;
    $('#case-approach').textContent = g('approach').textContent;
    $('#case-result').textContent = g('result').textContent;
    $('#case-idx').textContent = `Case file ${$('.t-num', tile).textContent} / 07`;
    const repo = g('repo'), a = $('#case-repo');
    a.style.display = repo ? '' : 'none'; if (repo) a.href = repo.href;
    dlg.scrollTop = 0;
  }
  function openCase(tile) {
    current = tile; lastBtn = $('.t-open', tile);
    const title = $('.t-title', tile);
    const go = () => {
      fill(tile); title.style.viewTransitionName = 'none'; cTitle.style.viewTransitionName = 'proj';
      dlg.showModal(); document.body.classList.add('lock');
    };
    if (canVT) { title.style.viewTransitionName = 'proj'; document.startViewTransition(go).finished.finally(() => { title.style.viewTransitionName = ''; }); }
    else go();
  }
  function closeCase() {
    if (!dlg.open) return;
    const title = $('.t-title', current);
    const go = () => {
      dlg.close(); cTitle.style.viewTransitionName = 'none';
      revealTile(current); if (canVT) title.style.viewTransitionName = 'proj';
    };
    if (canVT) { cTitle.style.viewTransitionName = 'proj'; document.startViewTransition(go).finished.finally(() => { title.style.viewTransitionName = ''; }); }
    else go();
  }
  dlg.addEventListener('close', () => { document.body.classList.remove('lock'); const b = $('.t-open', current); b && b.focus({ preventScroll: true }); });
  dlg.addEventListener('cancel', e => { e.preventDefault(); closeCase(); });
  $('#case-close').addEventListener('click', closeCase);
  $('#case-next').addEventListener('click', () => {
    current = tiles[(tiles.indexOf(current) + 1) % tiles.length];
    const swap = () => fill(current);
    if (canVT) document.startViewTransition(swap); else swap();
  });
  tiles.forEach(t => $('.t-open', t).addEventListener('click', () => openCase(t)));
  $$('.t-open').forEach(b => b.addEventListener('focus', () => { const v = $('#hs-view'); if (pinST) { v.scrollLeft = 0; revealTile(b.closest('.tile')); } }));

  /* ---------- progress bar for un-pinned (mobile/touch) scroller ---------- */
  const view = $('#hs-view'), bar = $('#hs-bar'), count = $('#proj-count');
  function setProg(p) {
    bar.style.transform = `scaleX(${Math.max(.14, p)})`;
    count.textContent = String(Math.min(7, Math.round(p * 6) + 1)).padStart(2, '0');
  }
  view.addEventListener('scroll', () => { if (!pinST) setProg(view.scrollLeft / Math.max(1, view.scrollWidth - view.clientWidth)); }, { passive: true });

  /* ---------- GSAP choreography ---------- */
  function choreo() {
    // split headings into words
    $$('.split').forEach(h => {
      const words = h.textContent.trim().split(/\s+/);
      h.innerHTML = words.map(w => `<span class="w"><span class="wi">${w}</span></span>`).join(' ');
      gsap.from($$('.wi', h), { yPercent: 115, rotate: 4, duration: 1.1, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
    });
    // about: scrubbed word-by-word reveal
    const ab = $('#about-text');
    ab.innerHTML = ab.textContent.trim().split(/\s+/).map(w => `<span class="aw">${w}</span>`).join(' ');
    gsap.to($$('.aw', ab), { opacity: 1, ease: 'none', stagger: .12, scrollTrigger: { trigger: ab, start: 'top 82%', end: 'bottom 55%', scrub: true } });
    // counters
    $$('.stat-n').forEach(el => {
      const target = +el.dataset.target, suf = el.dataset.suffix || '', o = { v: 0 };
      el.textContent = '0' + suf;
      ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () =>
        gsap.to(o, { v: target, duration: 1.3, ease: 'power3.out', onUpdate: () => el.textContent = Math.round(o.v).toLocaleString('en-US') + suf }) });
    });
    // reveal blocks
    gsap.utils.toArray('.skill-group, .cert, .role, .edu, .links, .mail').forEach(el =>
      gsap.from(el, { y: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
    // marquee speeds up with scroll velocity
    const mq = $('.marquee-track').getAnimations()[0];
    if (mq) ScrollTrigger.create({ onUpdate: s => { mq.playbackRate = 1 + Math.min(8, Math.abs(s.getVelocity()) / 250) * (s.direction < 0 ? -1 : 1); }, });
    // horizontal pinned gallery (desktop, motion OK)
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const track = $('#hs-track'), sec = $('#projects');
      sec.classList.add('pinned'); view.scrollLeft = 0;
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      const tw = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: {
        trigger: sec, pin: true, scrub: .7, start: 'top top', end: () => '+=' + dist(), invalidateOnRefresh: true,
        onRefresh: self => { pinST = self; pinDist = dist(); },
        onUpdate: self => setProg(self.progress)
      } });
      pinST = tw.scrollTrigger; pinDist = dist();
      // tile numeral parallax inside the track
      return () => { sec.classList.remove('pinned'); pinST = null; gsap.set(track, { clearProps: 'all' }); };
    });
    addEventListener('load', () => ScrollTrigger.refresh());
    if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  /* ---------- boot: loader -> hero ---------- */
  const loader = $('#loader'), ln = $('#loader-n');
  const t0 = performance.now();
  let heroOK = false, finished = false;
  const fontsReady = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 1200))]);
  const heroP = (!reduce && window.startHero ? window.startHero().catch(() => false) : Promise.resolve(false)).then(ok => { heroOK = ok; if (ok) root.classList.add('gl'); });
  const done = Promise.all([fontsReady, heroP, new Promise(r => setTimeout(r, 700))]);
  (function tick() {
    const p = Math.min(.99, (performance.now() - t0) / 900);
    ln.textContent = String(Math.round(p * 100)).padStart(2, '0'); if (!finished) requestAnimationFrame(tick);
  })();
  function finish() {
    if (finished) return; finished = true; ln.textContent = '100';
    if (hasG && !reduce) {
      gsap.to(loader, { yPercent: -100, duration: .8, ease: 'expo.inOut', delay: .1, onComplete: () => loader.remove() });
      gsap.from('.hero-meta > *', { y: 40, opacity: 0, duration: 1, ease: 'power3.out', stagger: .1, delay: .6 });
      if (heroOK) gsap.from('#hero-canvas', { opacity: 0, duration: 1.2, delay: .5 });
    } else loader.remove();
    if (hasG && !reduce) { try { choreo(); } catch (e) { console.warn(e); } }
  }
  done.then(finish);
  setTimeout(finish, 2400); // hard cap so the loader can never trap the page
})();
