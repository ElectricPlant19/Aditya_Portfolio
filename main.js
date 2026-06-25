/* =========================================================
   main.js — Portfolio Interactions
   ========================================================= */

'use strict';

/* ---------------------------------------------------------
   1. ORBITAL CANVAS BACKGROUND
   --------------------------------------------------------- */
(function initCanvas() {
  const canvas = document.getElementById('orbital-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, dpr, animId;
  const satellites = [];
  const NUM_SATS = 6;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* Orbital arc parameters */
  function makeOrbit() {
    const cx = W * (0.3 + Math.random() * 0.5);
    const cy = H * (0.2 + Math.random() * 0.6);
    const rx = 120 + Math.random() * 220;
    const ry = 60  + Math.random() * 140;
    const tilt = (Math.random() - 0.5) * Math.PI * 0.35;
    const speed = (0.00018 + Math.random() * 0.00025) * (Math.random() < 0.5 ? 1 : -1);
    const phase = Math.random() * Math.PI * 2;
    return { cx, cy, rx, ry, tilt, speed, phase };
  }

  function initSatellites() {
    satellites.length = 0;
    for (let i = 0; i < NUM_SATS; i++) {
      satellites.push({ orbit: makeOrbit(), t: Math.random() * Math.PI * 2 });
    }
  }

  let t = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* ---------- dot grid ---------- */
    const STEP = 56;
    ctx.fillStyle = 'rgba(255,255,255,0.022)';
    for (let x = STEP / 2; x < W; x += STEP) {
      for (let y = STEP / 2; y < H; y += STEP) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    satellites.forEach((sat, idx) => {
      const orb = sat.orbit;
      const angle = sat.t;

      /* Transform ellipse */
      ctx.save();
      ctx.translate(orb.cx, orb.cy);
      ctx.rotate(orb.tilt);

      /* Arc path */
      const alpha = idx < 3 ? 0.055 : 0.035;
      ctx.strokeStyle = idx % 2 === 0
        ? `rgba(0,229,255,${alpha})`
        : `rgba(57,255,126,${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, orb.rx, orb.ry, 0, 0, Math.PI * 2);
      ctx.stroke();

      /* Satellite dot */
      const sx = Math.cos(angle) * orb.rx;
      const sy = Math.sin(angle) * orb.ry;

      const dotColor = idx % 2 === 0 ? '0,229,255' : '57,255,126';

      /* Glow */
      const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, 8);
      grd.addColorStop(0, `rgba(${dotColor},0.5)`);
      grd.addColorStop(1, `rgba(${dotColor},0)`);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(sx, sy, 8, 0, Math.PI * 2);
      ctx.fill();

      /* Core dot */
      ctx.fillStyle = `rgba(${dotColor},0.9)`;
      ctx.beginPath();
      ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
      ctx.fill();

      /* Trail */
      const TRAIL = 28;
      for (let k = 0; k < TRAIL; k++) {
        const ta = angle - k * 0.015 * Math.sign(orb.speed);
        const tx = Math.cos(ta) * orb.rx;
        const ty = Math.sin(ta) * orb.ry;
        const progress = 1 - k / TRAIL;
        ctx.fillStyle = `rgba(${dotColor},${progress * 0.18})`;
        ctx.beginPath();
        ctx.arc(tx, ty, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      /* Advance angle */
      sat.t += orb.speed;
    });

    t += 0.001;
    animId = requestAnimationFrame(draw);
  }

  function start() {
    resize();
    initSatellites();
    draw();
  }

  /* Pause when tab hidden */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      animId = requestAnimationFrame(draw);
    }
  });

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize();
    initSatellites();
    draw();
  });

  start();
})();


/* ---------------------------------------------------------
   2. NAVBAR — scroll class + active link
   --------------------------------------------------------- */
(function initNav() {
  const navbar = document.getElementById('navbar');
  const links  = document.querySelectorAll('.nav-link');
  const sections = ['hero','work','reports','about','contact'];

  window.addEventListener('scroll', () => {
    /* Scrolled class */
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    /* Active section highlight */
    let current = '';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top <= 100) current = id;
    });

    links.forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('href') === '#' + current) {
        a.classList.add('active');
      }
    });
  }, { passive: true });
})();


/* ---------------------------------------------------------
   3. HAMBURGER MENU
   --------------------------------------------------------- */
(function initHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('nav-links');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    links.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  });

  /* Close on link click */
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      links.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* Close on outside click */
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !links.contains(e.target)) {
      btn.classList.remove('open');
      links.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
})();


/* ---------------------------------------------------------
   4. INTERSECTION OBSERVER — reveal on scroll
   --------------------------------------------------------- */
(function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();


/* ---------------------------------------------------------
   5. TYPEWRITER EFFECT — hero tagline
   --------------------------------------------------------- */
(function initTypewriter() {
  const el = document.getElementById('typed-text');
  if (!el) return;

  const lines = [
    'Turning satellite data into orbital intelligence.',
    'Building tools for GNSS constellation analysis.',
    'Monitoring 30+ satellites across NavIC, QZSS & BeiDou-3.',
    'Aerospace engineering meets data-driven space intelligence.',
  ];

  let lineIdx  = 0;
  let charIdx  = 0;
  let deleting = false;
  let paused   = false;

  const TYPING_SPEED  = 42;
  const DELETE_SPEED  = 22;
  const PAUSE_AFTER   = 2600;
  const PAUSE_BEFORE  = 400;

  function tick() {
    const line = lines[lineIdx];

    if (paused) return;

    if (!deleting) {
      el.textContent = line.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === line.length) {
        paused = true;
        setTimeout(() => { paused = false; deleting = true; setTimeout(tick, 0); }, PAUSE_AFTER);
        return;
      }
      setTimeout(tick, TYPING_SPEED);
    } else {
      el.textContent = line.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        lineIdx  = (lineIdx + 1) % lines.length;
        paused = true;
        setTimeout(() => { paused = false; setTimeout(tick, 0); }, PAUSE_BEFORE);
        return;
      }
      setTimeout(tick, DELETE_SPEED);
    }
  }

  /* Delay start until hero is painted */
  setTimeout(tick, 900);
})();


/* ---------------------------------------------------------
   6. CARD GLOW — follow mouse within card
   --------------------------------------------------------- */
(function initCardGlow() {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
      const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });
})();


/* ---------------------------------------------------------
   7. SMOOTH SCROLL — for anchor links
   --------------------------------------------------------- */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ---------------------------------------------------------
   8. CASE STUDY TABS
   --------------------------------------------------------- */
(function initCaseStudyTabs() {
  const tabs = Array.from(document.querySelectorAll('[data-cs-tab]'));
  const panels = Array.from(document.querySelectorAll('[data-cs-panel]'));
  const dashImg = document.getElementById('cs2-dash-img');
  if (!tabs.length || !panels.length) return;

  const imgAlts = {
    problem:      'Raw TLE data feed — dense alphanumeric satellite orbital records',
    solution:     'Automated intelligence pipeline — from Space-Track API to health scoring',
    capabilities: 'Six diagnostic views — health scoring, ground tracks, sky plots, and more',
  };

  function swapImage(newSrc, altText) {
    if (!dashImg) return;
    if (dashImg.dataset.current === newSrc) return;   // already showing this image
    dashImg.style.transition = 'opacity 0.2s ease';
    dashImg.style.opacity = '0';
    setTimeout(() => {
      dashImg.src = newSrc;
      dashImg.alt = altText;
      dashImg.dataset.current = newSrc;
      dashImg.style.opacity = '1';
    }, 200);
  }

  function activateTab(id, shouldFocus = false) {
    tabs.forEach(tab => {
      const isActive = tab.dataset.csTab === id;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.tabIndex = isActive ? 0 : -1;
      if (isActive && shouldFocus) tab.focus();
      if (isActive && tab.dataset.csImg) {
        swapImage(tab.dataset.csImg, imgAlts[id] || '');
      }
    });

    panels.forEach(panel => {
      const isActive = panel.dataset.csPanel === id;
      panel.classList.toggle('is-active', isActive);
      panel.hidden = !isActive;
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab.dataset.csTab));
    tab.addEventListener('keydown', (e) => {
      const lastIndex = tabs.length - 1;
      let nextIndex = index;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIndex = index === lastIndex ? 0 : index + 1;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIndex = index === 0 ? lastIndex : index - 1;
      if (e.key === 'Home') nextIndex = 0;
      if (e.key === 'End') nextIndex = lastIndex;
      if (nextIndex === index) return;

      e.preventDefault();
      activateTab(tabs[nextIndex].dataset.csTab, true);
    });
  });
})();


/* ---------------------------------------------------------
   9. ANIMATE COUNTER — cs-stat values on scroll
   --------------------------------------------------------- */
(function initCounters() {
  const stats = document.querySelectorAll('.cs-stat-val, .cs2-stat-val, .metric-val');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const raw = el.textContent.trim();
      const num = parseFloat(raw);
      if (isNaN(num)) { observer.unobserve(el); return; }

      const isDecimal = raw.includes('.');
      const suffix = raw.replace(/[\d.]/g, '');
      let start = null;
      const DURATION = 1200;

      function step(ts) {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / DURATION, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const val = ease * num;
        el.textContent = (isDecimal ? val.toFixed(2) : Math.round(val)) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  stats.forEach(el => observer.observe(el));
})();
