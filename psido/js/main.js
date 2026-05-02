'use strict';
/* === SCROLL REVEAL === */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

/* === HEADER === */
const header = document.getElementById('mainHeader');
window.addEventListener('scroll', () => {
  if (header) header.classList.toggle('scrolled', window.scrollY > 60);
});

/* === MOBILE MENU === */
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    menuToggle.querySelector('i').className = navLinks.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
  });
  navLinks.querySelectorAll('a').forEach(l => l.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.querySelector('i').className = 'fas fa-bars';
  }));
}

/* === COUNTER === */
function animateCounter(el) {
  const target = +el.dataset.target, dur = 2000;
  let cur = 0;
  const step = target / (dur / 16);
  const t = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = Math.round(cur).toLocaleString();
    if (cur >= target) clearInterval(t);
  }, 16);
}
const cntObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); cntObs.unobserve(e.target); } });
}, { threshold: 0.5 });
document.querySelectorAll('.counter').forEach(el => cntObs.observe(el));

/* === TYPEWRITER === */
function typewriter(el, words) {
  let wi = 0, ci = 0, del = false;
  function tick() {
    const w = words[wi];
    el.textContent = del ? w.slice(0, ci--) : w.slice(0, ci++);
    if (!del && ci > w.length) { del = true; setTimeout(tick, 2000); return; }
    if (del && ci < 0) { del = false; wi = (wi + 1) % words.length; ci = 0; }
    setTimeout(tick, del ? 45 : 90);
  }
  tick();
}
const tw = document.getElementById('typewriter');
if (tw) typewriter(tw, ['Cybersecurity', 'Threat Detection', 'VAPT & Pentesting', 'SOC Services', 'Compliance']);

/* === THREAT TICKER === */
const threats = ['SQL Injection blocked — Bangalore Node', 'DDoS mitigated — 2.4Gbps attack', 'Ransomware quarantined — Endpoint #221', 'Phishing blocked — email gateway', 'Zero-day patch deployed — CVE-2026'];
let ti = 0;
const tickEl = document.getElementById('threatTicker');
if (tickEl) {
  setInterval(() => {
    tickEl.style.opacity = 0;
    setTimeout(() => { tickEl.textContent = threats[ti = (ti + 1) % threats.length]; tickEl.style.opacity = 1; }, 400);
  }, 3200);
}

/* === CONTACT FORM === */
const cf = document.getElementById('contactForm');
if (cf) {
  cf.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = cf.querySelector('button[type=submit]');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;
    await new Promise(r => setTimeout(r, 1800));
    btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
    setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; cf.reset(); }, 3000);
  });
}

/* === TILT === */
document.querySelectorAll('.tilt').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 14;
    const y = ((e.clientY - r.top) / r.height - 0.5) * -14;
    card.style.transform = `perspective(700px) rotateY(${x}deg) rotateX(${y}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* === ACCORDION (FAQ) === */
document.querySelectorAll('.faq-item').forEach(item => {
  item.querySelector('.faq-q').addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

/* === SMOOTH SCROLL === */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});
