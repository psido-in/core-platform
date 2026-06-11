// PSIDO Interactive Engine

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initCustomCursor();
  initScrollReveal();
  initROICalculator();
  initServiceTabs();
  initPortfolioFilters();
  initContactForm();
  initCounters();
  initHeroParallax();
  initCyclingText();
  initPageStory();
  initTemplatePages();
});

// ── NAVBAR SCROLL & MOBILE MENU ──
function initNavbar() {
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
      navbar?.classList.add("scrolled");
    } else {
      navbar?.classList.remove("scrolled");
    }
  });
}

// ── CUSTOM CURSOR ──
function initCustomCursor() {
  const cursor = document.getElementById("cursor");
  const ring = document.getElementById("cursor-ring");
  
  if (!cursor || !ring) return;

  // Hide cursor on touch devices
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  if (isTouch) {
    cursor.style.display = "none";
    ring.style.display = "none";
    return;
  }

  let mx = 0, my = 0; // Mouse coords
  let rx = 0, ry = 0; // Ring coords (interpolated)

  window.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    
    // Position dot immediately
    cursor.style.left = `${mx}px`;
    cursor.style.top = `${my}px`;
  });

  // Smooth trail animation for ring
  function animateRing() {
    const speed = 0.15;
    rx += (mx - rx) * speed;
    ry += (my - ry) * speed;
    
    ring.style.left = `${rx}px`;
    ring.style.top = `${ry}px`;
    
    requestAnimationFrame(animateRing);
  }
  requestAnimationFrame(animateRing);

  // Hover detection
  const hoverTargets = "a, button, input, select, textarea, [role='button'], .filter-btn, .tab-btn";
  document.addEventListener("mouseover", (e) => {
    const target = e.target;
    if (target.matches(hoverTargets) || target.closest(hoverTargets)) {
      document.body.classList.add("cursor-hover");
    } else {
      document.body.classList.remove("cursor-hover");
    }
  });
}

// ── ANIMATED NUMBER COUNTERS ──
function initCounters() {
  // Define counter targets with suffix
  const counterData = [
    { selector: '.metric-item:nth-child(1) .metric-value', target: 280, suffix: '%+', prefix: '' },
    { selector: '.metric-item:nth-child(2) .metric-value', target: 50,  suffix: 'Cr+', prefix: '₹' },
    { selector: '.metric-item:nth-child(3) .metric-value', target: 99.2, suffix: '%', prefix: '', decimals: 1 },
    { selector: '.metric-item:nth-child(4) .metric-value', target: 12,  suffix: 'x', prefix: '' }
  ];

  const metricsStrip = document.querySelector('.metrics-strip');
  if (!metricsStrip) return;

  let hasAnimated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        counterData.forEach(({ selector, target, suffix, prefix, decimals }) => {
          const el = document.querySelector(selector);
          if (!el) return;
          const duration = 2000;
          const startTime = performance.now();
          const isDecimal = decimals && decimals > 0;

          function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = target * ease;
            el.textContent = prefix + (isDecimal ? current.toFixed(decimals) : Math.floor(current)) + suffix;
            if (progress < 1) requestAnimationFrame(updateCounter);
          }
          requestAnimationFrame(updateCounter);
        });
        observer.unobserve(metricsStrip);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(metricsStrip);
}

// ── HERO LAPTOP PARALLAX TILT ──
function initHeroParallax() {
  const laptop = document.getElementById('hero-laptop');
  if (!laptop) return;

  // Skip on touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const wrapper = laptop.closest('.laptop-img-wrapper') || laptop.parentElement;

  wrapper.addEventListener('mousemove', (e) => {
    const rect = wrapper.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);

    // Gentle tilt: max 8 degrees
    const tiltX = -dy * 8;
    const tiltY =  dx * 8;

    laptop.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(0px)`;
    laptop.style.animation = 'none'; // pause float while tilting
  });

  wrapper.addEventListener('mouseleave', () => {
    laptop.style.transform = '';
    laptop.style.animation = 'float 4s ease-in-out infinite';
  });
}

// ── CYCLING HERO TEXT ──
function initCyclingText() {
  const el = document.getElementById('cycling-text');
  if (!el) return;

  const words = ['Experiences', 'Websites', 'SEO', 'AI Solutions', 'Revenue'];
  let index = 0;

  setInterval(() => {
    // Fade out
    el.classList.add('fade-out');
    el.classList.remove('fade-in');

    setTimeout(() => {
      index = (index + 1) % words.length;
      el.textContent = words[index];
      // Fade in
      el.classList.remove('fade-out');
      el.classList.add('fade-in');
    }, 420); // matches CSS transition duration
  }, 3000);
}

// ── SCROLL REVEAL EFFECT ──
function initScrollReveal() {
  const elements = document.querySelectorAll(".reveal-on-scroll");
  if (elements.length === 0) return;

  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -80px 0px",
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  elements.forEach((el) => {
    observer.observe(el);
  });
}

// ── ROI CALCULATOR ──
function initROICalculator() {
  const trafficSlider = document.getElementById("roi-traffic");
  const conversionSlider = document.getElementById("roi-conversion");
  const valueSlider = document.getElementById("roi-value");

  if (!trafficSlider || !conversionSlider || !valueSlider) return;

  const currentRevEl = document.getElementById("roi-current-rev");
  const projectedRevEl = document.getElementById("roi-projected-rev");
  const increaseEl = document.getElementById("roi-increase");

  const trafficVal = document.getElementById("val-traffic");
  const conversionVal = document.getElementById("val-conversion");
  const valueVal = document.getElementById("val-value");

  function calculate() {
    const traffic = Number(trafficSlider.value);
    const conversion = Number(conversionSlider.value);
    const value = Number(valueSlider.value);

    // Update Slider Value labels
    if (trafficVal) trafficVal.textContent = traffic.toLocaleString();
    if (conversionVal) conversionVal.textContent = `${conversion}%`;
    if (valueVal) valueVal.textContent = `₹${value.toLocaleString()}`;

    // Computations
    const currentRev = Math.round(traffic * (conversion / 100) * value);
    const projectedTraffic = Math.round(traffic * 1.8);
    const projectedConversion = Math.round(conversion * 2 * 10) / 10;
    const projectedRev = Math.round(projectedTraffic * (projectedConversion / 100) * value);
    const increase = projectedRev - currentRev;

    // Render results
    if (currentRevEl) currentRevEl.textContent = `₹${currentRev.toLocaleString()}`;
    if (projectedRevEl) projectedRevEl.textContent = `₹${projectedRev.toLocaleString()}`;
    if (increaseEl) increaseEl.textContent = `+₹${increase.toLocaleString()}`;
  }

  // Bind Listeners
  [trafficSlider, conversionSlider, valueSlider].forEach((slider) => {
    slider.addEventListener("input", calculate);
  });

  // Run initial calculation
  calculate();
}

// ── SERVICES PAGE TAB MECHANISMS ──
function initServiceTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");

  if (tabBtns.length === 0) return;

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab");
      
      // Update Buttons
      tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Update Panels
      tabPanels.forEach((panel) => {
        if (panel.id === targetId) {
          panel.classList.add("active");
        } else {
          panel.classList.remove("active");
        }
      });
    });
  });
}

// ── PORTFOLIO FILTER MECHANISMS ──
function initPortfolioFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".portfolio-card");

  if (filterBtns.length === 0) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = btn.getAttribute("data-filter");

      // Update Buttons
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Filter grid items
      cards.forEach((card) => {
        const cardCategory = card.getAttribute("data-category");
        if (category === "All" || cardCategory === category) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}

// ── CONTACT FORM SUBMISSION MOCK ──
function initContactForm() {
  const form = document.getElementById("contact-form");
  const formContainer = document.getElementById("form-container");

  if (!form || !formContainer) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Simulate submission
    const submitBtn = form.querySelector("button[type='submit']");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting Proposal...";
    }

    setTimeout(() => {
      formContainer.innerHTML = `
        <div class="form-success-box">
          <div class="form-success-icon">
          <div>
            <h3 class="text-gradient font-black" style="font-size: 1.5rem; margin-bottom: 0.5rem;">Project Brief Received!</h3>
            <p style="font-size: 0.85rem; color: var(--muted); max-width: 350px;">
              Thank you. Our growth strategist will audit your parameters and contact you within 4-6 business hours.
            </p>
          </div>
        </div>
      `;
    }, 1500);
  });
}
// ── THREE.JS PAGE STORY ENGINE ──
function initPageStory() {
  const container = document.getElementById("bg-canvas");
  if (!container || typeof THREE === "undefined") return;

  const page = document.body.getAttribute("data-page") || "home";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 40;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0x34d399, 1);
  directionalLight.position.set(10, 20, 10);
  scene.add(directionalLight);

  // Object group to hold the animated elements
  const storyGroup = new THREE.Group();
  scene.add(storyGroup);

  const primaryMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x10b981,
    metalness: 0.2,
    roughness: 0.1,
    transparent: true,
    opacity: 0.85,
    wireframe: false
  });
  
  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0x34d399,
    wireframe: true,
    transparent: true,
    opacity: 0.3
  });

  // Story configuration based on page
  let animateStory = () => {};

  if (page === "home") {
    // "Grow Together" Story
    // A central core that pulses, surrounded by smaller cubes that revolve and merge
    const coreGeo = new THREE.IcosahedronGeometry(6, 1);
    const core = new THREE.Mesh(coreGeo, primaryMaterial);
    
    const wireCore = new THREE.Mesh(coreGeo, wireMaterial);
    wireCore.scale.set(1.1, 1.1, 1.1);
    
    storyGroup.add(core);
    storyGroup.add(wireCore);

    const satellites = [];
    for (let i = 0; i < 20; i++) {
      const satGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
      const sat = new THREE.Mesh(satGeo, primaryMaterial);
      
      // Random initial orbit parameters
      const angle = Math.random() * Math.PI * 2;
      const radius = 15 + Math.random() * 20;
      const speed = 0.01 + Math.random() * 0.02;
      
      sat.position.x = Math.cos(angle) * radius;
      sat.position.y = (Math.random() - 0.5) * 20;
      sat.position.z = Math.sin(angle) * radius;
      
      storyGroup.add(sat);
      satellites.push({ mesh: sat, angle, radius, speed });
    }

    animateStory = (time) => {
      // Core pulsing
      const scale = 1 + Math.sin(time * 0.002) * 0.1;
      core.scale.set(scale, scale, scale);
      core.rotation.y += 0.005;
      core.rotation.x += 0.003;
      wireCore.rotation.y -= 0.004;

      // Satellites revolving and moving closer based on scroll
      const scrollFactor = Math.min(window.scrollY / 1000, 1); // 0 to 1
      
      satellites.forEach(sat => {
        sat.angle += sat.speed;
        // As user scrolls down, radius shrinks to represent "growing together"
        const currentRadius = sat.radius * (1 - scrollFactor * 0.7); 
        
        sat.mesh.position.x = Math.cos(sat.angle) * currentRadius;
        sat.mesh.position.z = Math.sin(sat.angle) * currentRadius;
        sat.mesh.rotation.x += sat.speed;
        sat.mesh.rotation.y += sat.speed;
      });
    };
  } else if (page === "about") {
    // "Foundation" Story - Interlocking Blocks
    const groupCount = 5;
    const blocks = [];
    for (let i=0; i<groupCount; i++) {
      const geo = new THREE.BoxGeometry(4, 4, 12);
      const mesh = new THREE.Mesh(geo, primaryMaterial);
      mesh.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 20);
      storyGroup.add(mesh);
      blocks.push(mesh);
    }
    
    animateStory = () => {
      storyGroup.rotation.x += 0.002;
      storyGroup.rotation.y += 0.003;
      
      const scrollFactor = Math.min(window.scrollY / 800, 1);
      blocks.forEach((block, index) => {
        // Move towards origin to form a foundation
        block.position.lerp(new THREE.Vector3(
          (index % 2 === 0 ? 3 : -3), 
          (index % 3 === 0 ? 3 : -3), 
          0
        ), 0.05 * scrollFactor);
      });
    };
  } else if (page === "services") {
    // "Synergy" Story - Interlocking Toruses (Gears)
    const t1 = new THREE.Mesh(new THREE.TorusGeometry(8, 1.5, 16, 100), primaryMaterial);
    const t2 = new THREE.Mesh(new THREE.TorusGeometry(6, 1.5, 16, 100), wireMaterial);
    const t3 = new THREE.Mesh(new THREE.TorusGeometry(12, 0.5, 16, 100), primaryMaterial);
    
    t1.position.x = -5;
    t2.position.x = 5;
    t2.rotation.x = Math.PI / 2;
    
    storyGroup.add(t1, t2, t3);
    
    animateStory = () => {
      const speed = 0.005 + (window.scrollY * 0.00005); // Speeds up on scroll
      t1.rotation.y += speed;
      t2.rotation.x += speed * 1.5;
      t3.rotation.z -= speed * 0.5;
      
      storyGroup.rotation.y = Math.sin(Date.now() * 0.001) * 0.2;
    };
  } else {
    // Default abstract geometry
    const geo = new THREE.OctahedronGeometry(10, 0);
    const mesh = new THREE.Mesh(geo, primaryMaterial);
    const wire = new THREE.Mesh(geo, wireMaterial);
    wire.scale.set(1.05, 1.05, 1.05);
    storyGroup.add(mesh, wire);
    
    animateStory = () => {
      mesh.rotation.y += 0.005;
      mesh.rotation.x += 0.003;
      wire.rotation.y -= 0.004;
      wire.rotation.x -= 0.002;
    };
  }

  // Mouse Tracking for Parallax
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2);
    mouseY = (e.clientY - window.innerHeight / 2);
  });

  // Animation Loop
  function animate(time) {
    requestAnimationFrame(animate);

    // Smoothly interpolate mouse target
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    // Apply parallax tilt to the whole group
    storyGroup.rotation.y = targetX * 0.0005;
    storyGroup.rotation.x = targetY * 0.0005;

    animateStory(time);

    renderer.render(scene, camera);
  }

  animate(0);

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
