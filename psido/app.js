// ============================================================
// PSIDO — Interactive Engine v3.0
// Website Design & Digital Marketing Agency, Bangalore
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCursor();
  initScrollReveal();
  initStoryCanvas();
  initCounters();
  initCyclingText();
  initFAQ();
  initContactForm();
  initMagneticButtons();
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NAVBAR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.nav-mobile');

  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav?.classList.toggle('open');
  });

  // Close mobile nav on link click
  document.querySelectorAll('.nav-mobile a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('open');
      mobileNav?.classList.remove('open');
    });
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CUSTOM BLADE CURSOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const blade = document.getElementById('cursor-blade');
  const trail = document.getElementById('cursor-trail');
  if (!blade || !trail) return;

  let mx = 0, my = 0;
  let prevMx = 0, prevMy = 0;
  let trailX = 0, trailY = 0;
  let angle = 0;
  let isHovering = false;

  document.addEventListener('mousemove', (e) => {
    prevMx = mx; prevMy = my;
    mx = e.clientX; my = e.clientY;

    // Calculate angle of movement
    const dx = mx - prevMx;
    const dy = my - prevMy;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
      angle = Math.atan2(dy, dx) * (180 / Math.PI);
    }

    blade.style.left = `${mx}px`;
    blade.style.top = `${my}px`;
    blade.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
  });

  // Smooth trail
  function animateTrail() {
    trailX += (mx - trailX) * 0.12;
    trailY += (my - trailY) * 0.12;
    trail.style.left = `${trailX}px`;
    trail.style.top = `${trailY}px`;
    requestAnimationFrame(animateTrail);
  }
  animateTrail();

  // Hover detection on interactive elements
  const hoverTargets = 'a, button, [data-cursor-hover]';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) {
      blade.classList.add('hovering');
      isHovering = true;
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) {
      blade.classList.remove('hovering');
      isHovering = false;
    }
  });

  document.addEventListener('mousedown', () => {
    blade.style.transform += ' scale(0.8)';
  });
  document.addEventListener('mouseup', () => {
    blade.style.transform = blade.style.transform.replace(' scale(0.8)', '');
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCROLL REVEAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STORY CANVAS — Scroll-Driven 2D Story Animation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initStoryCanvas() {
  const section = document.getElementById('story-section');
  if (!section) return;

  const canvas = document.getElementById('scene-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // ── Scene Definitions ──
  // Progress 0→1 maps across all scenes
  // Each scene occupies a range of progress

  const scenes = [
    { range: [0, 0.14], draw: drawScene0 },  // Empty dark street, dim shop
    { range: [0.14, 0.28], draw: drawScene1 }, // Branding — logo glows on shop
    { range: [0.28, 0.42], draw: drawScene2 }, // Laptop opens — website
    { range: [0.42, 0.56], draw: drawScene3 }, // Mobile phone — app
    { range: [0.56, 0.70], draw: drawScene4 }, // Marketing — social icons
    { range: [0.70, 0.84], draw: drawScene5 }, // Customers walking in
    { range: [0.84, 1.0], draw: drawScene6 },  // Growth chart + ecosystem
  ];

  // ── Text Overlays per scene ──
  const sceneTexts = [
    { title: 'Your business today...', sub: 'A great shop, but no online presence.' },
    { title: 'Step 1: Build Your Brand', sub: 'A professional logo & identity.' },
    { title: 'Step 2: Launch Your Website', sub: 'A beautiful website customers can find.' },
    { title: 'Step 3: Build Your App', sub: 'Custom billing & management apps.' },
    { title: 'Step 4: Start Marketing', sub: 'Google & Instagram to bring customers.' },
    { title: 'Step 5: Customers Arrive', sub: 'More people find and visit your shop.' },
    { title: 'Your Business, Transformed', sub: 'Growth, reviews, and digital success.' },
  ];

  // ── Particles ──
  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random(), y: Math.random(),
    vx: (Math.random() - 0.5) * 0.0003,
    vy: (Math.random() - 0.5) * 0.0003,
    size: Math.random() * 2 + 0.5,
    alpha: Math.random() * 0.4 + 0.1,
  }));

  // ── Helpers ──
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function easeInOut(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return [r,g,b];
  }

  const GREEN = [0, 229, 160];
  const VIOLET = [124, 58, 237];
  const GOLD = [245, 166, 35];

  // ━━ SCENE 0: Empty dim street with shop ━━
  function drawScene0(t, alpha) {
    const bg = ctx;

    // Night sky gradient
    const sky = bg.createLinearGradient(0,0,0,H);
    sky.addColorStop(0, `rgba(5,5,15,${alpha})`);
    sky.addColorStop(1, `rgba(15,10,25,${alpha})`);
    bg.fillStyle = sky;
    bg.fillRect(0, 0, W, H);

    // Street
    bg.fillStyle = `rgba(20,18,30,${alpha})`;
    bg.fillRect(0, H*0.65, W, H*0.35);

    // Shop building (dim)
    drawShop(0.5, 0.35, 1, alpha * (0.4 + t * 0.2));

    // Dim sign
    bg.fillStyle = `rgba(80,80,100,${alpha * 0.6})`;
    bg.font = `bold ${Math.floor(W*0.018)}px Inter, sans-serif`;
    bg.textAlign = 'center';
    bg.fillText('SHOP', W * 0.5, H * 0.44);

    // Few dim windows in bg city
    for (let i = 0; i < 8; i++) {
      bg.fillStyle = `rgba(200,180,100,${alpha * 0.15})`;
      bg.fillRect(W * (0.05 + i * 0.12), H * (0.25 + Math.sin(i) * 0.08), 20, 25);
    }
  }

  // ━━ SCENE 1: Branding — Logo glows on shop ━━
  function drawScene1(t, alpha) {
    drawScene0(1, alpha * 0.4);

    // Logo glow effect growing with t
    const logoAlpha = alpha * t;
    const gx = W * 0.5, gy = H * 0.43;
    const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, W * 0.15 * t);
    glow.addColorStop(0, `rgba(0,229,160,${logoAlpha * 0.6})`);
    glow.addColorStop(1, `rgba(0,229,160,0)`);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Brand sign
    ctx.fillStyle = `rgba(0,229,160,${logoAlpha})`;
    ctx.font = `bold ${Math.floor(W*0.025)}px 'Plus Jakarta Sans', sans-serif`;
    ctx.textAlign = 'center';
    ctx.shadowColor = '#00e5a0';
    ctx.shadowBlur = 20 * t;
    ctx.fillText('YOUR BRAND', W * 0.5, H * 0.43);
    ctx.shadowBlur = 0;

    // Logo circle
    const r = W * 0.04 * t;
    ctx.beginPath();
    ctx.arc(W * 0.5, H * 0.35, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0,229,160,${logoAlpha})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Stars/sparkles
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + t * 2;
      const dist = W * 0.08 * t;
      const sx = W * 0.5 + Math.cos(angle) * dist;
      const sy = H * 0.35 + Math.sin(angle) * dist;
      ctx.beginPath();
      ctx.arc(sx, sy, 3 * t, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,229,160,${logoAlpha * 0.8})`;
      ctx.fill();
    }
  }

  // ━━ SCENE 2: Laptop opens — website ━━
  function drawScene2(t, alpha) {
    drawScene0(1, alpha * 0.3);

    const cx = W * 0.5, cy = H * 0.5;
    const lw = W * 0.38, lh = lw * 0.65;

    // Laptop base
    ctx.fillStyle = `rgba(30,28,45,${alpha})`;
    roundRect(ctx, cx - lw/2, cy - lh/2 + lh*0.45, lw, lh * 0.12, 6);
    ctx.fill();

    // Laptop screen (opens with t)
    const screenAngle = Math.PI * 0.5 * t;
    ctx.save();
    ctx.translate(cx, cy - lh/2 + lh*0.5);
    ctx.rotate(-screenAngle + Math.PI * 0.5);

    // Screen body
    ctx.fillStyle = `rgba(20,18,32,${alpha})`;
    roundRect(ctx, -lw/2, -lh, lw, lh * 0.9, 8);
    ctx.fill();

    // Screen content (website preview)
    ctx.fillStyle = `rgba(9,9,15,${alpha})`;
    roundRect(ctx, -lw/2 + 8, -lh + 8, lw - 16, lh * 0.9 - 16, 4);
    ctx.fill();

    if (t > 0.4) {
      const ct = (t - 0.4) / 0.6;
      // Nav bar
      ctx.fillStyle = `rgba(0,229,160,${alpha * ct})`;
      ctx.fillRect(-lw/2 + 10, -lh + 12, (lw - 20) * ct, 10);
      // Hero text lines
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = `rgba(240,240,245,${alpha * ct * 0.6})`;
        ctx.fillRect(-lw/2 + 10, -lh + 32 + i * 14, (lw - 40) * ct * (1 - i * 0.2), 6);
      }
      // CTA button
      ctx.fillStyle = `rgba(0,229,160,${alpha * ct})`;
      roundRect(ctx, -lw/2 + 10, -lh + 78, 60 * ct, 18, 9);
      ctx.fill();
    }
    ctx.restore();

    // Glow below laptop
    const glow = ctx.createRadialGradient(cx, cy + lh*0.1, 0, cx, cy + lh*0.1, lw * 0.5);
    glow.addColorStop(0, `rgba(0,229,160,${alpha * t * 0.2})`);
    glow.addColorStop(1, 'rgba(0,229,160,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, cy - lh/2, W, lh * 1.5);
  }

  // ━━ SCENE 3: Mobile phone — app ━━
  function drawScene3(t, alpha) {
    drawScene0(1, alpha * 0.25);

    const cx = W * 0.5, cy = H * 0.5;
    const pw = W * 0.14, ph = pw * 2.1;

    // Phone body
    ctx.fillStyle = `rgba(18,16,30,${alpha})`;
    roundRect(ctx, cx - pw/2, cy - ph/2, pw, ph, pw * 0.12);
    ctx.fill();
    ctx.strokeStyle = `rgba(124,58,237,${alpha * 0.6})`;
    ctx.lineWidth = 1.5;
    roundRect(ctx, cx - pw/2, cy - ph/2, pw, ph, pw * 0.12);
    ctx.stroke();

    // Screen
    ctx.fillStyle = `rgba(9,9,15,${alpha})`;
    roundRect(ctx, cx - pw/2 + 4, cy - ph/2 + 12, pw - 8, ph - 24, pw * 0.08);
    ctx.fill();

    if (t > 0.2) {
      const at = (t - 0.2) / 0.8;
      // App UI elements
      ctx.fillStyle = `rgba(124,58,237,${alpha * at})`;
      ctx.fillRect(cx - pw/2 + 6, cy - ph/2 + 14, (pw - 12) * at, 18);

      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = `rgba(0,229,160,${alpha * at * (1 - i * 0.15)})`;
        const bw = (pw - 12) * at * (0.9 - i * 0.15);
        ctx.fillRect(cx - pw/2 + 6, cy - ph/2 + 38 + i * 20, bw, 10);
      }

      // Revenue circle
      ctx.beginPath();
      ctx.arc(cx, cy + ph * 0.15, pw * 0.28 * at, 0, Math.PI * 2 * at * 0.8);
      ctx.strokeStyle = `rgba(0,229,160,${alpha * at})`;
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Floating notification
    if (t > 0.5) {
      const nt = (t - 0.5) / 0.5;
      const nx = cx + pw * 0.8 * nt;
      const ny = cy - ph * 0.2;
      ctx.fillStyle = `rgba(0,229,160,${alpha * nt})`;
      roundRect(ctx, nx, ny, 80 * nt, 28, 6);
      ctx.fill();
    }
  }

  // ━━ SCENE 4: Marketing — social + google pin ━━
  function drawScene4(t, alpha) {
    drawScene0(1, alpha * 0.2);

    // Floating social media icons
    const icons = [
      { x: 0.25, y: 0.35, color: [225, 48, 108], label: 'IG' },
      { x: 0.75, y: 0.35, color: [66, 103, 178], label: 'FB' },
      { x: 0.5, y: 0.28, color: [0, 229, 160], label: 'G' },
      { x: 0.35, y: 0.55, color: [245, 166, 35], label: '★' },
      { x: 0.65, y: 0.55, color: [124, 58, 237], label: 'YT' },
    ];

    icons.forEach((ic, i) => {
      const delay = i * 0.12;
      const et = clamp((t - delay) / (1 - delay), 0, 1);
      const floatY = Math.sin(Date.now() / 1000 + i) * 8;
      const ix = W * ic.x;
      const iy = H * ic.y + floatY;
      const r = W * 0.04 * et;

      ctx.beginPath();
      ctx.arc(ix, iy, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ic.color.join(',')},${alpha * et * 0.15})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${ic.color.join(',')},${alpha * et})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = `rgba(${ic.color.join(',')},${alpha * et})`;
      ctx.font = `bold ${Math.floor(r * 0.7)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ic.label, ix, iy);
      ctx.textBaseline = 'alphabetic';
    });

    // Google map pin rising from shop
    if (t > 0.4) {
      const pt = (t - 0.4) / 0.6;
      const px = W * 0.5, py = H * 0.6 - H * 0.2 * pt;
      ctx.fillStyle = `rgba(0,229,160,${alpha * pt})`;
      ctx.beginPath();
      ctx.arc(px, py, 12 * pt, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(9,9,15,${alpha * pt})`;
      ctx.beginPath();
      ctx.arc(px, py, 5 * pt, 0, Math.PI * 2);
      ctx.fill();
      // Pin stem
      ctx.strokeStyle = `rgba(0,229,160,${alpha * pt})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, py + 12 * pt);
      ctx.lineTo(px, py + 30 * pt);
      ctx.stroke();
    }

    // Beams from shop to icons
    if (t > 0.6) {
      const bt = (t - 0.6) / 0.4;
      icons.forEach((ic) => {
        ctx.beginPath();
        ctx.moveTo(W * 0.5, H * 0.6);
        ctx.lineTo(W * ic.x, H * ic.y);
        ctx.strokeStyle = `rgba(0,229,160,${alpha * bt * 0.15})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 8]);
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }
  }

  // ━━ SCENE 5: Customers walking toward shop ━━
  function drawScene5(t, alpha) {
    drawScene0(1, alpha * 0.4);
    drawScene1(1, alpha * 0.4);

    // Customer silhouettes walking toward shop center
    const count = 5;
    for (let i = 0; i < count; i++) {
      const delay = i * 0.15;
      const et = clamp((t - delay) / (1 - delay), 0, 1);
      // Start from edges, walk toward center
      const startX = (i % 2 === 0) ? 0.05 + i * 0.04 : 0.95 - i * 0.04;
      const x = lerp(startX * W, W * 0.5, easeInOut(et));
      const y = H * 0.72;

      // Simple person silhouette
      const scale = W * 0.018;
      ctx.fillStyle = `rgba(0,229,160,${alpha * et})`;
      // Head
      ctx.beginPath();
      ctx.arc(x, y - scale * 2.8, scale * 0.7, 0, Math.PI * 2);
      ctx.fill();
      // Body
      ctx.fillRect(x - scale * 0.45, y - scale * 2, scale * 0.9, scale * 1.8);
      // Legs walking
      const legOffset = Math.sin(et * 20) * scale * 0.5;
      ctx.fillRect(x - scale * 0.4, y - scale * 0.2, scale * 0.35, scale * 1.4 + legOffset);
      ctx.fillRect(x + scale * 0.05, y - scale * 0.2, scale * 0.35, scale * 1.4 - legOffset);
    }

    // Growth notification
    if (t > 0.7) {
      const nt = (t - 0.7) / 0.3;
      ctx.fillStyle = `rgba(0,229,160,${alpha * nt})`;
      roundRect(ctx, W * 0.6, H * 0.3, 180 * nt, 48, 8);
      ctx.fill();
      ctx.fillStyle = `rgba(9,9,15,${alpha * nt})`;
      ctx.font = `bold ${Math.floor(W * 0.012)}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('+5 New Visitors!', W * 0.6 + 12, H * 0.3 + 28);
    }
  }

  // ━━ SCENE 6: Full ecosystem + growth chart ━━
  function drawScene6(t, alpha) {
    // City lights in background
    const cityAlpha = alpha;
    for (let i = 0; i < 20; i++) {
      const bw = W * (0.04 + (i % 3) * 0.02);
      const bh = H * (0.12 + (i % 4) * 0.06);
      const bx = W * (i / 20);
      const by = H * 0.85 - bh;
      ctx.fillStyle = `rgba(20,16,35,${cityAlpha})`;
      ctx.fillRect(bx, by, bw - 3, bh);

      // Windows
      for (let wy = by + 8; wy < H * 0.85 - 4; wy += 12) {
        for (let wx = bx + 4; wx < bx + bw - 4; wx += 8) {
          const lit = Math.random() > 0.3;
          ctx.fillStyle = lit
            ? `rgba(0,229,160,${cityAlpha * 0.4 * t})`
            : `rgba(200,180,100,${cityAlpha * 0.12})`;
          ctx.fillRect(wx, wy, 4, 6);
        }
      }
    }

    // Ground
    ctx.fillStyle = `rgba(12,10,22,${cityAlpha})`;
    ctx.fillRect(0, H * 0.85, W, H * 0.15);

    // Growth chart
    const chartX = W * 0.15;
    const chartY = H * 0.75;
    const chartW = W * 0.7;
    const chartH = H * 0.45;

    ctx.strokeStyle = `rgba(0,229,160,${alpha * 0.2})`;
    ctx.lineWidth = 1;
    // Grid lines
    for (let i = 0; i <= 4; i++) {
      const gy = chartY - (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(chartX, gy);
      ctx.lineTo(chartX + chartW, gy);
      ctx.stroke();
    }

    // Chart line (rises with t)
    const points = [
      [0, 0.9], [0.15, 0.75], [0.3, 0.6], [0.45, 0.5],
      [0.6, 0.3], [0.75, 0.15], [0.9, 0.05], [1, 0.01],
    ];

    ctx.beginPath();
    const visiblePts = Math.floor(points.length * t);
    for (let i = 0; i <= visiblePts && i < points.length; i++) {
      const px = chartX + chartW * points[i][0];
      const py = chartY - chartH * (1 - points[i][1]);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.strokeStyle = `rgba(0,229,160,${alpha})`;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Chart fill
    ctx.lineTo(chartX + chartW * points[Math.min(visiblePts, points.length-1)][0], chartY);
    ctx.lineTo(chartX, chartY);
    ctx.closePath();
    const fillGrad = ctx.createLinearGradient(0, chartY - chartH, 0, chartY);
    fillGrad.addColorStop(0, `rgba(0,229,160,${alpha * 0.3})`);
    fillGrad.addColorStop(1, `rgba(0,229,160,0)`);
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // Stars reviews
    if (t > 0.5) {
      const st = (t - 0.5) / 0.5;
      for (let i = 0; i < 5; i++) {
        const sx = W * 0.5 + (i - 2) * W * 0.06;
        const sy = H * 0.18;
        ctx.fillStyle = `rgba(245,166,35,${alpha * st})`;
        ctx.font = `${Math.floor(W * 0.025 * st)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('★', sx, sy);
      }
      ctx.fillStyle = `rgba(240,240,245,${alpha * st})`;
      ctx.font = `bold ${Math.floor(W * 0.018)}px 'Plus Jakarta Sans',sans-serif`;
      ctx.fillText('4.9 ★ Google Rating', W * 0.5, H * 0.24);
    }
  }

  // ━━ Shop drawing helper ━━
  function drawShop(cx, cy, scale, alpha) {
    const sw = W * 0.35 * scale, sh = H * 0.22 * scale;
    const sx = W * cx - sw / 2, sy = H * cy - sh / 2;

    ctx.fillStyle = `rgba(30,25,45,${alpha})`;
    roundRect(ctx, sx, sy, sw, sh, 8);
    ctx.fill();

    ctx.strokeStyle = `rgba(80,70,110,${alpha * 0.5})`;
    ctx.lineWidth = 1.5;
    roundRect(ctx, sx, sy, sw, sh, 8);
    ctx.stroke();

    // Door
    ctx.fillStyle = `rgba(20,18,32,${alpha})`;
    roundRect(ctx, sx + sw*0.4, sy + sh*0.55, sw*0.2, sh*0.45, 4);
    ctx.fill();

    // Windows
    for (let i = 0; i < 2; i++) {
      ctx.fillStyle = `rgba(200,180,100,${alpha * 0.15})`;
      roundRect(ctx, sx + sw*0.08 + i * sw*0.5, sy + sh*0.2, sw*0.28, sh*0.3, 3);
      ctx.fill();
    }

    // Awning
    ctx.fillStyle = `rgba(60,50,90,${alpha})`;
    ctx.beginPath();
    ctx.moveTo(sx - 10, sy);
    ctx.lineTo(sx + sw + 10, sy);
    ctx.lineTo(sx + sw, sy - sh*0.12);
    ctx.lineTo(sx, sy - sh*0.12);
    ctx.closePath();
    ctx.fill();
  }

  // ━━ RoundRect helper ━━
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ━━ Main render loop ━━
  let currentProgress = 0;
  let currentScene = -1;
  const textEl = document.getElementById('story-text');
  const subEl = document.getElementById('story-sub');

  function getProgress() {
    const rect = section.getBoundingClientRect();
    const sectionHeight = section.offsetHeight - window.innerHeight;
    return clamp(-rect.top / sectionHeight, 0, 1);
  }

  function getSceneIndex(progress) {
    for (let i = scenes.length - 1; i >= 0; i--) {
      if (progress >= scenes[i].range[0]) return i;
    }
    return 0;
  }

  function getSceneProgress(progress, scene) {
    const [lo, hi] = scene.range;
    return clamp((progress - lo) / (hi - lo), 0, 1);
  }

  function render() {
    const progress = getProgress();
    const inStory = progress > 0 && progress < 1;
    const canvas2 = document.getElementById('scene-canvas');
    if (canvas2) canvas2.style.opacity = inStory ? '1' : '0';

    ctx.clearRect(0, 0, W, H);

    if (inStory) {
      const sceneIdx = getSceneIndex(progress);
      const sceneProg = getSceneProgress(progress, scenes[sceneIdx]);

      // Crossfade between current and previous scene
      if (sceneIdx > 0 && sceneProg < 0.3) {
        const prevAlpha = 1 - sceneProg / 0.3;
        const prevSProg = getSceneProgress(1, scenes[sceneIdx - 1]);
        scenes[sceneIdx - 1].draw(prevSProg, prevAlpha);
      }
      scenes[sceneIdx].draw(easeInOut(sceneProg), 1);

      // Ambient particles
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,229,160,${p.alpha * 0.3})`;
        ctx.fill();
      });

      // Update text overlay
      if (textEl && subEl && sceneIdx !== currentScene) {
        currentScene = sceneIdx;
        textEl.style.opacity = '0';
        setTimeout(() => {
          if (textEl) textEl.textContent = sceneTexts[sceneIdx]?.title || '';
          if (subEl) subEl.textContent = sceneTexts[sceneIdx]?.sub || '';
          if (textEl) textEl.style.opacity = '1';
        }, 300);
      }
    } else {
      if (textEl) textEl.style.opacity = '0';
      currentScene = -1;
    }

    requestAnimationFrame(render);
  }
  render();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ANIMATED NUMBER COUNTERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || entry.target.dataset.done) return;
      entry.target.dataset.done = 'true';

      const target = parseFloat(entry.target.dataset.count);
      const suffix = entry.target.dataset.suffix || '';
      const prefix = entry.target.dataset.prefix || '';
      const duration = 2000;
      const start = performance.now();
      const isFloat = !Number.isInteger(target);

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        entry.target.textContent = prefix + (isFloat ? value.toFixed(1) : Math.floor(value)) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CYCLING HERO TEXT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initCyclingText() {
  const el = document.getElementById('cycling-word');
  if (!el) return;

  const words = ['Websites', 'Mobile Apps', 'Branding', 'Marketing', 'Growth'];
  let idx = 0;

  function next() {
    el.style.animation = 'none';
    el.style.opacity = '0';
    el.style.transform = 'translateY(15px)';

    setTimeout(() => {
      idx = (idx + 1) % words.length;
      el.textContent = words[idx];
      el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 250);
  }

  setInterval(next, 2800);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FAQ ACCORDION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-answer').style.maxHeight = '0';
      });

      // Open clicked
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTACT FORM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const name = form.querySelector('[name="name"]')?.value || '';
    const service = form.querySelector('[name="service"]')?.value || '';
    const phone = form.querySelector('[name="phone"]')?.value || '';

    // WhatsApp bridge
    const msg = encodeURIComponent(
      `Hello PSIDO! My name is ${name}. I'm interested in ${service}. My phone number is ${phone}. Please contact me.`
    );
    const waUrl = `https://wa.me/918870210932?text=${msg}`;

    btn.textContent = 'Opening WhatsApp...';
    btn.disabled = true;

    setTimeout(() => {
      window.open(waUrl, '_blank');
      btn.textContent = 'Message Sent! ✓';
      btn.style.background = '#10b981';
      form.reset();
      setTimeout(() => {
        btn.textContent = 'Send Message';
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    }, 600);
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAGNETIC BUTTONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initMagneticButtons() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.querySelectorAll('.magnetic-wrap').forEach(wrap => {
    wrap.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.35;
      const dy = (e.clientY - cy) * 0.35;
      wrap.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    wrap.addEventListener('mouseleave', () => {
      wrap.style.transform = '';
    });
  });
}
