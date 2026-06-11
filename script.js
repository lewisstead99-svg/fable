/* ════════════════════════════════════════════════════════
   VESPER — interactions
   Loader · starfield · typing · tilt · magnetic buttons ·
   reveals · counters · tabs · carousel · pricing · faq
   ════════════════════════════════════════════════════════ */

(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ── 1. Intro loader ─────────────────────────────────── */
  const loader = $("#loader");
  const bootedAt = performance.now();
  const MIN_LOADER = reduceMotion ? 0 : 1500;

  function finishLoader() {
    if (document.body.classList.contains("ready")) return;
    document.body.classList.add("ready");
    if (loader) {
      loader.classList.add("done");
      setTimeout(() => loader.remove(), 1000);
    }
  }
  function scheduleFinish() {
    const wait = Math.max(0, MIN_LOADER - (performance.now() - bootedAt));
    setTimeout(finishLoader, wait);
  }
  if (document.readyState === "complete") scheduleFinish();
  else window.addEventListener("load", scheduleFinish);
  setTimeout(finishLoader, 4000); // hard fallback — never trap the visitor

  /* ── 2. Scroll progress + nav state ──────────────────── */
  const progress = $("#progress");
  const nav = $("#nav");
  let scrollTicking = false;

  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
    if (nav) nav.classList.toggle("scrolled", scrollY > 24);
    applyParallax();
  }
  window.addEventListener("scroll", () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => { onScroll(); scrollTicking = false; });
  }, { passive: true });

  /* ── 3. Mobile menu ──────────────────────────────────── */
  const navToggle = $("#navToggle");
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("menu-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    $$("#navMenu a").forEach(a => a.addEventListener("click", () => {
      document.body.classList.remove("menu-open");
      navToggle.setAttribute("aria-expanded", "false");
    }));
  }

  /* ── 4. Starfield canvas ─────────────────────────────── */
  const canvas = $("#stars");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let stars = [], meteors = [], W = 0, H = 0, rafId = null, heroVisible = true;
    const DPR = Math.min(devicePixelRatio || 1, 2);

    function sizeCanvas() {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const count = Math.min(110, Math.floor((W * H) / 16000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.3 + 0.3,
        tw: Math.random() * Math.PI * 2,
        ts: Math.random() * 0.018 + 0.006,
        vy: Math.random() * 0.05 + 0.01
      }));
    }

    function spawnMeteor() {
      if (!heroVisible || document.hidden) return;
      meteors.push({
        x: Math.random() * W * 0.7 + W * 0.2,
        y: Math.random() * H * 0.3,
        vx: -(Math.random() * 5 + 5),
        vy: Math.random() * 2.4 + 1.6,
        life: 1
      });
    }
    let meteorTimer = null;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        s.tw += s.ts;
        s.y += s.vy;
        if (s.y > H + 2) s.y = -2;
        const a = 0.25 + Math.abs(Math.sin(s.tw)) * 0.65;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 220, 255, ${a})`;
        ctx.fill();
      }
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx; m.y += m.vy; m.life -= 0.016;
        if (m.life <= 0) { meteors.splice(i, 1); continue; }
        const g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 11, m.y - m.vy * 11);
        g.addColorStop(0, `rgba(190, 170, 255, ${m.life})`);
        g.addColorStop(1, "rgba(190, 170, 255, 0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * 11, m.y - m.vy * 11);
        ctx.stroke();
      }
      rafId = requestAnimationFrame(draw);
    }

    function startStars() {
      if (rafId == null) rafId = requestAnimationFrame(draw);
      if (meteorTimer == null) meteorTimer = setInterval(spawnMeteor, 4200);
    }
    function stopStars() {
      if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; }
      if (meteorTimer != null) { clearInterval(meteorTimer); meteorTimer = null; }
    }

    sizeCanvas();
    startStars();
    window.addEventListener("resize", sizeCanvas);
    document.addEventListener("visibilitychange", () => document.hidden ? stopStars() : heroVisible && startStars());
    new IntersectionObserver(([e]) => {
      heroVisible = e.isIntersecting;
      heroVisible && !document.hidden ? startStars() : stopStars();
    }).observe(canvas);
  }

  /* ── 5. Cursor glow ──────────────────────────────────── */
  const glow = $("#glow");
  if (glow && finePointer && !reduceMotion) {
    let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy, glowing = false;
    window.addEventListener("pointermove", e => {
      tx = e.clientX; ty = e.clientY;
      if (!glowing) {
        glowing = true;
        document.body.classList.add("has-mouse");
        requestAnimationFrame(glowStep);
      }
    }, { passive: true });
    function glowStep() {
      gx += (tx - gx) * 0.09;
      gy += (ty - gy) * 0.09;
      glow.style.transform = `translate(${gx}px, ${gy}px)`;
      requestAnimationFrame(glowStep);
    }
  }

  /* ── 6. Tilt (hero studio window) ────────────────────── */
  if (finePointer && !reduceMotion) {
    $$("[data-tilt]").forEach(el => {
      const zone = el.closest(".hero-stage") || el;
      zone.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 9).toFixed(2)}deg)`;
      });
      zone.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* ── 7. Spotlight border on cards ────────────────────── */
  if (finePointer) {
    $$(".feature, .plan, .demo").forEach(card => {
      card.addEventListener("pointermove", e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ── 8. Magnetic buttons ─────────────────────────────── */
  if (finePointer && !reduceMotion) {
    $$("[data-magnetic]").forEach(btn => {
      btn.addEventListener("pointermove", e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.18;
        const y = (e.clientY - r.top - r.height / 2) * 0.3;
        btn.style.transform = `translate(${x.toFixed(1)}px, ${(y - 2).toFixed(1)}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  /* ── 9. Scroll reveals ───────────────────────────────── */
  const revealables = $$("[data-reveal], .step-line");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.18, rootMargin: "0px 0px -7% 0px" });
    revealables.forEach(el => io.observe(el));
  } else {
    revealables.forEach(el => el.classList.add("visible"));
  }

  /* ── 10. Animated counters ───────────────────────────── */
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  $$("[data-counter]").forEach(el => {
    const target = parseFloat(el.dataset.counter);
    const suffix = el.dataset.suffix || "";
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const render = v => { el.textContent = v.toFixed(decimals) + suffix; };
    if (reduceMotion || !("IntersectionObserver" in window)) { render(target); return; }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now(), dur = 1700;
      (function tick(now) {
        const p = Math.min(1, (now - t0) / dur);
        render(target * easeOut(p));
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: 0.6 });
    io.observe(el);
  });

  /* ── 11. Hero typing + render progress loop ──────────── */
  const heroType = $("#heroType");
  const renderBar = $("#renderBar");
  const renderPct = $("#renderPct");
  const heroPrompts = [
    "A lone diver discovers a city of light beneath polar ice — 35mm, dusk palette, slow push-in.",
    "Rebrand a 90-year-old watchmaker for the lunar age — quiet, precise, impossibly premium.",
    "A title sequence where ink becomes constellations — Saul Bass meets deep space."
  ];

  function setRender(p) {
    if (renderBar) renderBar.style.width = p + "%";
    if (renderPct) renderPct.textContent = Math.round(p);
  }

  if (heroType) {
    if (reduceMotion) {
      heroType.textContent = heroPrompts[0];
      setRender(98);
    } else {
      let pi = 0;
      const typeChar = (text, i, done) => {
        heroType.textContent = text.slice(0, i);
        if (i <= text.length) setTimeout(() => typeChar(text, i + 1, done), 24 + Math.random() * 26);
        else done();
      };
      const eraseChar = done => {
        const cur = heroType.textContent;
        if (cur.length === 0) return done();
        heroType.textContent = cur.slice(0, -1);
        setTimeout(() => eraseChar(done), 9);
      };
      const animateRender = done => {
        const t0 = performance.now(), dur = 2900;
        (function tick(now) {
          const p = Math.min(1, (now - t0) / dur);
          setRender(98 * easeOut(p));
          if (p < 1) requestAnimationFrame(tick);
          else done();
        })(t0);
      };
      (function cycle() {
        setRender(0);
        typeChar(heroPrompts[pi], 0, () => {
          animateRender(() => {
            setTimeout(() => {
              eraseChar(() => {
                pi = (pi + 1) % heroPrompts.length;
                setTimeout(cycle, 350);
              });
            }, 2100);
          });
        });
      })();
    }
  }

  /* ── 12. Demo tabs + typing ──────────────────────────── */
  const tabs = $$(".demo-tabs .tab");
  const panels = $$(".demo-stage .panel");
  const glider = $(".tab-glider");
  const demoType = $("#demoType");
  const demoRun = $("#demoRun");
  let demoTimer = null;

  function positionGlider() {
    const active = $(".demo-tabs .tab.active");
    if (!glider || !active) return;
    glider.style.width = active.offsetWidth + "px";
    glider.style.transform = `translateX(${active.offsetLeft}px)`;
  }

  function typeDemoPrompt(text) {
    if (!demoType) return;
    clearTimeout(demoTimer);
    if (reduceMotion) { demoType.textContent = text; return; }
    demoType.textContent = "";
    let i = 0;
    (function step() {
      demoType.textContent = text.slice(0, ++i);
      if (i < text.length) demoTimer = setTimeout(step, 14 + Math.random() * 16);
    })();
  }

  function activatePanel(name, retype = true) {
    tabs.forEach(t => {
      const on = t.dataset.tab === name;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", String(on));
    });
    panels.forEach(p => {
      const on = p.id === "panel-" + name;
      p.classList.toggle("active", on);
      p.hidden = !on;
      if (on && retype) typeDemoPrompt(p.dataset.prompt || "");
    });
    positionGlider();
  }

  tabs.forEach(t => t.addEventListener("click", () => activatePanel(t.dataset.tab)));

  if (demoRun) {
    demoRun.addEventListener("click", () => {
      const active = panels.find(p => p.classList.contains("active"));
      if (!active) return;
      // restart panel animations + retype the prompt — a nice on-camera beat
      active.classList.remove("active");
      void active.offsetWidth;
      active.classList.add("active");
      typeDemoPrompt(active.dataset.prompt || "");
    });
  }

  // initial prompt + glider once layout (and fonts) settle
  function initDemo() {
    const first = panels.find(p => p.classList.contains("active"));
    if (first) typeDemoPrompt(first.dataset.prompt || "");
    positionGlider();
  }
  if (document.readyState === "complete") initDemo();
  else window.addEventListener("load", initDemo);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(positionGlider);
  window.addEventListener("resize", positionGlider);

  /* ── 13. Testimonial carousel ────────────────────────── */
  const track = $("#track");
  if (track) {
    const slides = $$(".quote", track);
    const dotsBox = $("#dots");
    let index = 0, auto = null;

    slides.forEach((_, i) => {
      const b = document.createElement("button");
      b.setAttribute("aria-label", "Go to testimonial " + (i + 1));
      b.addEventListener("click", () => { go(i); restartAuto(); });
      dotsBox.appendChild(b);
    });
    const dots = $$("button", dotsBox);

    function go(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, j) => d.classList.toggle("active", j === index));
    }
    function restartAuto() {
      if (reduceMotion) return;
      clearInterval(auto);
      auto = setInterval(() => go(index + 1), 6000);
    }
    $("#prev")?.addEventListener("click", () => { go(index - 1); restartAuto(); });
    $("#next")?.addEventListener("click", () => { go(index + 1); restartAuto(); });
    const shell = track.closest(".carousel");
    if (shell) {
      shell.addEventListener("pointerenter", () => clearInterval(auto));
      shell.addEventListener("pointerleave", restartAuto);
    }
    go(0);
    restartAuto();
  }

  /* ── 14. Pricing toggle ──────────────────────────────── */
  const billingToggle = $("#billingToggle");
  if (billingToggle) {
    billingToggle.addEventListener("click", () => {
      const annual = billingToggle.classList.toggle("on");
      billingToggle.setAttribute("aria-checked", String(annual));
      $(".bill-label.monthly")?.classList.toggle("active", !annual);
      $(".bill-label.annual")?.classList.toggle("active", annual);
      $$(".price .amount").forEach(am => {
        am.textContent = annual ? am.dataset.annual : am.dataset.monthly;
        am.classList.remove("flip");
        void am.offsetWidth;
        am.classList.add("flip");
      });
    });
  }

  /* ── 15. FAQ accordion ───────────────────────────────── */
  $$(".faq-item").forEach(item => {
    const q = $(".faq-q", item);
    q.addEventListener("click", () => {
      const open = item.classList.toggle("open");
      q.setAttribute("aria-expanded", String(open));
      if (open) {
        $$(".faq-item.open").forEach(other => {
          if (other !== item) {
            other.classList.remove("open");
            $(".faq-q", other).setAttribute("aria-expanded", "false");
          }
        });
      }
    });
  });

  /* ── 16. Footer request-access ───────────────────────── */
  const notifyBtn = $("#notifyBtn");
  if (notifyBtn) {
    notifyBtn.addEventListener("click", () => {
      const input = $("#notifyEmail");
      const msg = $("#notifyMsg");
      const v = (input.value || "").trim();
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        msg.textContent = "✦ You're on the list — invite arriving within 48h.";
        msg.style.color = "#34d399";
        input.value = "";
      } else {
        msg.textContent = "Hmm — that email doesn't look right.";
        msg.style.color = "#f87171";
      }
    });
  }

  /* ── 17. Parallax drift ──────────────────────────────── */
  const parallaxEls = $$("[data-parallax]").map(el => ({ el, f: parseFloat(el.dataset.parallax) || 0.08, applied: 0 }));
  function applyParallax() {
    if (reduceMotion) return;
    for (const p of parallaxEls) {
      const r = p.el.getBoundingClientRect();
      const center = r.top - p.applied + r.height / 2;
      const next = (center - innerHeight / 2) * -p.f;
      p.applied = next;
      // `translate` composes with transform-based CSS animations on the same node
      p.el.style.translate = `0 ${next.toFixed(1)}px`;
    }
  }

  onScroll();
})();
