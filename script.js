/* ═══════════════════════════════════════════
   ING. MOHAMED AHMED — PORTFOLIO SCRIPTS
   ═══════════════════════════════════════════ */

// ── DOM Ready ──
document.addEventListener('DOMContentLoaded', () => {
  initYear();
  initMobileNav();
  initHeroScene();
  initGSAP();
  initMagneticButtons();
  initContactForm();
  initSmoothScroll();
});

// ── Footer Year ──
function initYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

// ── Mobile Navigation ──
function initMobileNav() {
  const burger = document.getElementById('navBurger');
  const menu = document.getElementById('mobileMenu');
  if (!burger || !menu) return;

  burger.addEventListener('click', () => {
    menu.classList.toggle('active');
    document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// ── Smooth Scroll for nav links ──
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ═══════════════════════════════════════════
   THREE.JS — HERO 3D PARTICLE FIELD
   ═══════════════════════════════════════════ */
function initHeroScene() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  // Check WebGL support
  let gl;
  try {
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  } catch (e) { gl = null; }

  if (!gl) {
    // Fallback: static gradient
    canvas.style.background = 'radial-gradient(ellipse at 50% 40%, #1a1a3e 0%, #0a0a0f 70%)';
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 50;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap for performance

  // ── Particle system ──
  const particleCount = window.innerWidth < 768 ? 800 : 2000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    velocities[i * 3] = (Math.random() - 0.5) * 0.02;
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Custom shader material for glowing particles
  const material = new THREE.PointsMaterial({
    size: 0.35,
    color: 0x4f8fff,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // ── Secondary violet particles ──
  const violetGeom = new THREE.BufferGeometry();
  const violetPos = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    violetPos[i * 3] = (Math.random() - 0.5) * 120;
    violetPos[i * 3 + 1] = (Math.random() - 0.5) * 120;
    violetPos[i * 3 + 2] = (Math.random() - 0.5) * 80;
  }
  violetGeom.setAttribute('position', new THREE.BufferAttribute(violetPos, 3));
  const violetMat = new THREE.PointsMaterial({
    size: 0.25,
    color: 0x8b5cf6,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const violetParticles = new THREE.Points(violetGeom, violetMat);
  scene.add(violetParticles);

  // ── Mouse tracking for parallax ──
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;

  document.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ── Animation loop ──
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.005;

    // Smooth mouse follow
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    // Rotate particle field
    particles.rotation.y = time * 0.15 + mouseX * 0.3;
    particles.rotation.x = mouseY * 0.15;
    violetParticles.rotation.y = -time * 0.1 + mouseX * 0.2;
    violetParticles.rotation.x = -mouseY * 0.1;

    // Animate individual particles (drift)
    const pos = particles.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3 + 1] += velocities[i * 3 + 1];
      if (pos[i * 3 + 1] > 50) pos[i * 3 + 1] = -50;
      if (pos[i * 3 + 1] < -50) pos[i * 3 + 1] = 50;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // Camera subtle movement
    camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 3 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();

  // ── Resize handler ──
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* ═══════════════════════════════════════════
   GSAP — SCROLL REVEAL ANIMATIONS
   ═══════════════════════════════════════════ */
function initGSAP() {
  if (typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // ── Hero entrance ──
  const heroTl = gsap.timeline({ delay: 0.3 });
  heroTl
    .to('.hero__label', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
    .to('.hero__title .reveal-line > span', {
      y: 0, duration: 1, ease: 'power4.out', stagger: 0.15
    }, '-=0.4')
    .to('.hero__sub', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
    .to('.hero__content .btn', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4');

  // ── Scroll-triggered reveals ──
  gsap.utils.toArray('.reveal-up').forEach(el => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      }
    });
  });

  // ── Nav background on scroll ──
  ScrollTrigger.create({
    start: 100,
    onUpdate: (self) => {
      const nav = document.getElementById('nav');
      if (self.direction === 1 && self.scroll() > 100) {
        nav.style.padding = '0.85rem clamp(1.25rem, 4vw, 3rem)';
      } else if (self.scroll() <= 100) {
        nav.style.padding = '1.25rem clamp(1.25rem, 4vw, 3rem)';
      }
    }
  });
}

/* ═══════════════════════════════════════════
   MAGNETIC BUTTON EFFECT
   ═══════════════════════════════════════════ */
function initMagneticButtons() {
  if (window.innerWidth < 768) return; // Skip on mobile

  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
    });
  });
}

/* ═══════════════════════════════════════════
   CONTACT FORM — WhatsApp Integration
   ═══════════════════════════════════════════ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn = document.getElementById('submitBtn');
  const formSuccess = document.getElementById('formSuccess');

  // ── Validation helpers ──
  function showError(fieldId, msg) {
    const el = document.getElementById(fieldId + 'Error');
    if (el) el.textContent = msg;
  }

  function clearErrors() {
    form.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // ── Submit handler ──
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const projectType = document.getElementById('projectType').value;
    const message = document.getElementById('message').value.trim();

    let valid = true;

    if (!name) {
      showError('name', 'Please enter your name');
      valid = false;
    }
    if (!email) {
      showError('email', 'Please enter your email');
      valid = false;
    } else if (!validateEmail(email)) {
      showError('email', 'Please enter a valid email');
      valid = false;
    }
    if (!projectType) {
      showError('projectType', 'Please select a project type');
      valid = false;
    }
    if (!message) {
      showError('message', 'Please enter a message');
      valid = false;
    }

    if (!valid) return;

    // ── Show "Sending..." animation ──
    submitBtn.style.opacity = '0.6';
    submitBtn.querySelector('span').textContent = 'Sending...';

    // ── Build WhatsApp deep link ──
    const whatsappText = encodeURIComponent(
      `Hello, my name is ${name}. Project type: ${projectType}. Message: ${message}`
    );
    const whatsappURL = `https://wa.me/201128182537?text=${whatsappText}`;

    // ── Short delay then redirect ──
    setTimeout(() => {
      formSuccess.classList.add('visible');
      submitBtn.querySelector('span').textContent = 'Send via WhatsApp';
      submitBtn.style.opacity = '1';

      // Open WhatsApp
      window.open(whatsappURL, '_blank', 'noopener');

      // Reset form after delay
      setTimeout(() => {
        form.reset();
        formSuccess.classList.remove('visible');
      }, 3000);
    }, 800);
  });

  // ── Real-time error clearing on input ──
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => {
      const errorEl = document.getElementById(field.id + 'Error');
      if (errorEl) errorEl.textContent = '';
    });
  });
}
