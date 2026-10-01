/**
 * Portfolio — Bilal
 * Single-file, readable vanilla JS with clear sections.
 */

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const query = (selector, root = document) => root.querySelector(selector);
const queryAll = (selector, root = document) => [...root.querySelectorAll(selector)];

/* -------------------------------------------------------------------------- */
/* Theme                                                                      */
/* -------------------------------------------------------------------------- */

function initTheme() {
  const body = document.body;
  const button = query("[data-theme-toggle]");
  const label = query("[data-theme-label]");
  const saved = localStorage.getItem("portfolio-theme");
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;

  body.dataset.theme = saved || (prefersLight ? "light" : "dark");

  const syncLabel = () => {
    if (label) label.textContent = body.dataset.theme === "light" ? "Тёмная" : "Светлая";
  };

  syncLabel();

  button?.addEventListener("click", () => {
    body.dataset.theme = body.dataset.theme === "light" ? "dark" : "light";
    localStorage.setItem("portfolio-theme", body.dataset.theme);
    syncLabel();
  });
}

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

function initNavigation() {
  const header = query("[data-header]");
  const toggle = query("[data-nav-toggle]");
  const menu = query("[data-nav-menu]");

  toggle?.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  queryAll(".nav__links a, .brand").forEach((link) => {
    link.addEventListener("click", () => {
      menu?.classList.remove("is-open");
      toggle?.classList.remove("is-open");
      toggle?.setAttribute("aria-expanded", "false");
    });
  });

  let lastScrollY = window.scrollY;

  window.addEventListener(
    "scroll",
    () => {
      const currentY = window.scrollY;
      header?.classList.toggle("is-hidden", currentY > lastScrollY && currentY > 140);
      lastScrollY = currentY;
    },
    { passive: true }
  );
}

/* -------------------------------------------------------------------------- */
/* Scroll reveal                                                              */
/* -------------------------------------------------------------------------- */

function initReveal() {
  const items = queryAll("[data-reveal]");

  items.forEach((item) => {
    const delay = item.dataset.revealDelay;
    if (delay) item.style.setProperty("--reveal-delay", `${delay}ms`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach((item) => observer.observe(item));
}

/* -------------------------------------------------------------------------- */
/* Project filter                                                             */
/* -------------------------------------------------------------------------- */

function initProjectFilter() {
  const buttons = queryAll("[data-filter]");
  const cards = queryAll("[data-category]");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      buttons.forEach((btn) => btn.classList.remove("is-active"));
      button.classList.add("is-active");

      cards.forEach((card) => {
        const match = filter === "all" || card.dataset.category.includes(filter);
        card.classList.toggle("is-hidden", !match);
      });
    });
  });
}

/* -------------------------------------------------------------------------- */
/* Contact form & email copy                                                  */
/* -------------------------------------------------------------------------- */

function initContactForm() {
  const copyBtn = query("[data-copy-email]");
  const form = query("#contactForm");
  const status = query("#formStatus");
  const email = copyBtn?.dataset.copyEmail || "hello@example.com";

  copyBtn?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(email);
      copyBtn.textContent = "Email скопирован ✓";
    } catch {
      copyBtn.textContent = email;
    }

    setTimeout(() => {
      copyBtn.textContent = email;
    }, 1800);
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const name = data.get("name");
    const userEmail = data.get("email");
    const message = data.get("message");
    const subject = encodeURIComponent(`Новый проект от ${name}`);
    const body = encodeURIComponent(`Имя: ${name}\nEmail: ${userEmail}\n\n${message}`);

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    if (status) {
      status.textContent = `Открыл письмо. Если почта не открылась — напиши на ${email}.`;
    }
  });
}

/* -------------------------------------------------------------------------- */
/* Hero canvas (particles + grid)                                             */
/* -------------------------------------------------------------------------- */

function initHeroCanvas() {
  const canvas = query("#heroCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const body = document.body;
  const reduced = prefersReducedMotion();
  const pointer = { x: 0, y: 0, active: false };

  let particles = [];
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let frameId = null;

  const getColors = () => {
    const styles = getComputedStyle(document.documentElement);
    return [
      styles.getPropertyValue("--accent").trim(),
      styles.getPropertyValue("--accent-2").trim(),
      styles.getPropertyValue("--accent-3").trim(),
      styles.getPropertyValue("--accent-4").trim(),
    ];
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    createParticles();
    draw();
  };

  const createParticles = () => {
    const colors = getColors();
    const count = Math.max(40, Math.min(90, Math.floor((width * height) / 14000)));

    particles = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      size: 1.2 + Math.random() * 2.6,
      color: colors[i % colors.length],
    }));
  };

  const drawGrid = () => {
    ctx.save();
    ctx.globalAlpha = body.dataset.theme === "light" ? 0.14 : 0.18;
    ctx.strokeStyle = body.dataset.theme === "light" ? "#22241e" : "#f4f1e6";
    ctx.lineWidth = 1;

    const gap = width < 640 ? 56 : 80;
    for (let x = 0; x <= width; x += gap) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += gap) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawBlocks = () => {
    const blocks = [
      { x: width * 0.58, y: height * 0.18, w: 200, h: 110, color: "#c8ff46" },
      { x: width * 0.7, y: height * 0.46, w: 170, h: 80, color: "#3ad9cc" },
      { x: width * 0.52, y: height * 0.62, w: 230, h: 100, color: "#ff6f58" },
    ];

    ctx.save();
    blocks.forEach((block, i) => {
      ctx.globalAlpha = body.dataset.theme === "light" ? 0.5 : 0.32;
      ctx.fillStyle = block.color;
      ctx.fillRect(block.x, block.y, block.w, block.h);
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = body.dataset.theme === "light" ? "#11130f" : "#f4f1e6";
      for (let line = 0; line < 4; line += 1) {
        const lineW = block.w * (0.3 + ((line + i) % 3) * 0.18);
        ctx.fillRect(block.x + 16, block.y + 18 + line * 18, lineW, 4);
      }
    });
    ctx.restore();
  };

  const drawParticles = () => {
    ctx.save();

    particles.forEach((p, index) => {
      if (!reduced) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        if (pointer.active) {
          const dx = pointer.x - p.x;
          const dy = pointer.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            p.x -= dx * 0.004;
            p.y -= dy * 0.004;
          }
        }
      }

      ctx.globalAlpha = 0.85;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      for (let j = index + 1; j < particles.length; j += 1) {
        const other = particles[j];
        const dist = Math.hypot(p.x - other.x, p.y - other.y);
        if (dist < 100) {
          ctx.globalAlpha = (100 - dist) / 450;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }
    });

    ctx.restore();
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    drawGrid();
    drawBlocks();
    drawParticles();
  };

  const loop = () => {
    draw();
    if (!reduced) frameId = requestAnimationFrame(loop);
  };

  window.addEventListener("resize", resize);
  window.addEventListener(
    "pointermove",
    (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    },
    { passive: true }
  );
  window.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && frameId) {
      cancelAnimationFrame(frameId);
      frameId = null;
    } else if (!document.hidden && !reduced && !frameId) {
      frameId = requestAnimationFrame(loop);
    }
  });

  resize();
  if (!reduced) frameId = requestAnimationFrame(loop);
}

/* -------------------------------------------------------------------------- */
/* Custom cursor                                                              */
/* -------------------------------------------------------------------------- */

function initCursor() {
  const cursor = query(".cursor");
  const dot = query(".cursor__dot");
  const ring = query(".cursor__ring");

  if (!cursor || !dot || !ring || prefersReducedMotion()) return;
  if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

  document.body.classList.add("is-custom-cursor");

  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;

  window.addEventListener(
    "pointermove",
    (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    },
    { passive: true }
  );

  const animateRing = () => {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateRing);
  };
  animateRing();

  queryAll("a, button, [data-magnetic]").forEach((el) => {
    el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
  });
}

/* -------------------------------------------------------------------------- */
/* Magnetic buttons                                                           */
/* -------------------------------------------------------------------------- */

function initMagnetic() {
  if (prefersReducedMotion()) return;

  queryAll("[data-magnetic]").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });
}

/* -------------------------------------------------------------------------- */
/* 3D card tilt + spotlight                                                     */
/* -------------------------------------------------------------------------- */

function initTilt() {
  if (prefersReducedMotion()) return;

  queryAll("[data-tilt]").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      card.style.setProperty("--mouse-x", `${(x / rect.width) * 100}%`);
      card.style.setProperty("--mouse-y", `${(y / rect.height) * 100}%`);
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

/* -------------------------------------------------------------------------- */
/* Typewriter                                                                 */
/* -------------------------------------------------------------------------- */

function initTypewriter() {
  const target = query("[data-typewriter]");
  if (!target || prefersReducedMotion()) {
    if (target) target.textContent = "учусь и делаю Bilgich AI";
    return;
  }

  const phrases = [
    "учусь и делаю Bilgich AI",
    "верстаю адаптивные сайты",
    "пишу на Python (junior)",
    "подключаю Google AI Studio API",
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const tick = () => {
    const current = phrases[phraseIndex];

    if (!deleting) {
      charIndex += 1;
      target.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, 2000);
        return;
      }
    } else {
      charIndex -= 1;
      target.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }

    setTimeout(tick, deleting ? 40 : 70);
  };

  tick();
}

/* -------------------------------------------------------------------------- */
/* Skill progress bars                                                        */
/* -------------------------------------------------------------------------- */

function initSkillBars() {
  const fills = queryAll(".skill-bar__fill[data-progress]");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const fill = entry.target;
        const value = fill.dataset.progress || "0";
        fill.style.setProperty("--progress", `${value}%`);
        fill.classList.add("is-filled");
        observer.unobserve(fill);
      });
    },
    { threshold: 0.5 }
  );

  fills.forEach((fill) => observer.observe(fill));
}

/* -------------------------------------------------------------------------- */
/* Timeline line animation                                                    */
/* -------------------------------------------------------------------------- */

function initTimeline() {
  const timeline = query("[data-timeline]");
  if (!timeline) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        timeline.classList.add("is-active");
        queryAll(".timeline__item", timeline).forEach((item) => item.classList.add("is-visible"));
        observer.unobserve(timeline);
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(timeline);
}

/* -------------------------------------------------------------------------- */
/* Counters                                                                   */
/* -------------------------------------------------------------------------- */

function initCounters() {
  const counters = queryAll("[data-counter]");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.counter) || 0;
        if (prefersReducedMotion()) {
          el.textContent = String(target);
          observer.unobserve(el);
          return;
        }

        let current = 0;
        const step = Math.max(1, Math.ceil(target / 30));
        const interval = setInterval(() => {
          current += step;
          if (current >= target) {
            el.textContent = String(target);
            clearInterval(interval);
          } else {
            el.textContent = String(current);
          }
        }, 40);

        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

/* -------------------------------------------------------------------------- */
/* Glitch effect on name                                                        */
/* -------------------------------------------------------------------------- */

function initGlitch() {
  const el = query("[data-glitch]");
  if (!el || prefersReducedMotion()) return;

  const trigger = () => {
    el.classList.add("is-glitching");
    setTimeout(() => el.classList.remove("is-glitching"), 500);
  };

  trigger();
  setInterval(trigger, 5000);
}

/* -------------------------------------------------------------------------- */
/* Boot                                                                       */
/* -------------------------------------------------------------------------- */

initTheme();
initNavigation();
initReveal();
initProjectFilter();
initContactForm();
initHeroCanvas();
initCursor();
initMagnetic();
initTilt();
initTypewriter();
initSkillBars();
initTimeline();
initCounters();
initGlitch();

const yearEl = query("[data-year]");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());
