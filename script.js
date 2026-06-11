/* ═══════════════════════════════════════════════════════════════
   HiAva — interaction engine
   Intro sequence · neural canvas · live demo · scroll story ·
   command centre · night loop · ROI model · micro-interactions
   ═══════════════════════════════════════════════════════════════ */

(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (n) => Math.round(n).toLocaleString("en-GB");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hoverable = matchMedia("(hover: hover) and (pointer: fine)").matches;

  const CORAL = "#FF585A";
  const NAVY = "#001639";

  /* ───────────────────────────────────────────────────────────
     COUNTER — tween a number into an element
     ─────────────────────────────────────────────────────────── */
  function tween(el, from, to, { dur = 1100, prefix = "", suffix = "", decimals = 0 } = {}) {
    if (reduced) { el.textContent = prefix + fmt(to) + suffix; return; }
    const t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 4);
    (function step(now) {
      const p = clamp((now - t0) / dur, 0, 1);
      const v = lerp(from, to, ease(p));
      el.textContent = prefix + (decimals ? v.toFixed(decimals) : fmt(v)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ───────────────────────────────────────────────────────────
     INTRO SEQUENCE
     ─────────────────────────────────────────────────────────── */
  const intro = $("#intro");
  let introDone = false;
  const introHooks = []; // run once the experience is revealed

  function finishIntro() {
    if (introDone) return;
    introDone = true;
    intro.classList.add("lift");
    document.body.classList.remove("no-scroll");
    $("#nav").classList.add("show");
    $("#hero").classList.add("live");
    introHooks.forEach((fn) => fn());
    setTimeout(() => intro.classList.add("gone"), 1100);
  }

  function runIntro() {
    if (reduced || !intro) {
      document.body.classList.remove("no-scroll");
      $("#nav").classList.add("show");
      $("#hero").classList.add("live");
      if (intro) intro.classList.add("gone");
      introDone = true;
      introHooks.forEach((fn) => fn());
      return;
    }
    document.body.classList.add("no-scroll");
    startIntroCanvas();

    const l1 = $("#introLine1"), l2 = $("#introLine2"),
          online = $("#introOnline"), logo = $("#introLogo");
    const seq = [
      [200,  () => l1.classList.add("show")],
      [1300, () => l1.classList.add("hide")],
      [1750, () => l2.classList.add("show")],
      [2850, () => l2.classList.add("hide")],
      [3300, () => online.classList.add("show")],
      [4400, () => online.classList.add("hide")],
      [4850, () => logo.classList.add("show")],
      [6300, finishIntro],
    ];
    const timers = seq.map(([t, fn]) => setTimeout(() => { if (!introDone) fn(); }, t));
    $("#introSkip").addEventListener("click", () => {
      timers.forEach(clearTimeout);
      finishIntro();
    });
  }

  /* Intro canvas — particles converge & connect around the wordmark */
  function startIntroCanvas() {
    const cv = $("#introCanvas");
    const ctx = cv.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let w, h;
    const size = () => {
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();

    const N = Math.min(70, Math.floor(w * h / 16000));
    const pts = Array.from({ length: N }, (_, i) => {
      const ang = (i / N) * Math.PI * 2;
      const r = Math.min(w, h) * (0.16 + 0.22 * Math.random());
      return {
        x: Math.random() * w, y: Math.random() * h,
        tx: w / 2 + Math.cos(ang) * r,
        ty: h / 2 + Math.sin(ang) * r * 0.8,
        coral: Math.random() < 0.2,
        drift: Math.random() * Math.PI * 2,
      };
    });

    let start = performance.now();
    (function frame(now) {
      if (introDone) return;
      const t = (now - start) / 1000;
      const converge = clamp((t - 3.2) / 2.2, 0, 1); // pull in as "Ava is online"
      ctx.clearRect(0, 0, w, h);

      for (const p of pts) {
        const wob = Math.sin(now / 900 + p.drift) * 6;
        const gx = lerp(p.x, p.tx + wob, converge * 0.9);
        const gy = lerp(p.y, p.ty + wob * 0.6, converge * 0.9);
        p.cx = gx + Math.sin(now / 1300 + p.drift) * (1 - converge) * 18;
        p.cy = gy + Math.cos(now / 1100 + p.drift) * (1 - converge) * 18;
      }
      ctx.lineWidth = 1;
      const linkDist = lerp(90, 130, converge);
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const d = Math.hypot(a.cx - b.cx, a.cy - b.cy);
          if (d < linkDist) {
            ctx.strokeStyle = `rgba(0,22,57,${(1 - d / linkDist) * 0.12})`;
            ctx.beginPath(); ctx.moveTo(a.cx, a.cy); ctx.lineTo(b.cx, b.cy); ctx.stroke();
          }
        }
      }
      for (const p of pts) {
        ctx.fillStyle = p.coral ? CORAL : "rgba(0,22,57,.3)";
        ctx.beginPath(); ctx.arc(p.cx, p.cy, p.coral ? 2.4 : 1.7, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(frame);
    })(start);
    addEventListener("resize", size, { passive: true });
  }

  /* ───────────────────────────────────────────────────────────
     CURSOR GLOW + DOT + MAGNETIC BUTTONS
     ─────────────────────────────────────────────────────────── */
  if (hoverable && !reduced) {
    document.body.classList.add("cursor-on");
    const glow = $("#cursorGlow"), dot = $("#cursorDot");
    let mx = innerWidth / 2, my = innerHeight / 2, gx = mx, gy = my;
    addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    (function follow() {
      gx = lerp(gx, mx, 0.09); gy = lerp(gy, my, 0.09);
      glow.style.left = gx + "px"; glow.style.top = gy + "px";
      dot.style.left = mx + "px"; dot.style.top = my + "px";
      requestAnimationFrame(follow);
    })();
    const GROW = "a, button, input, .feature-card, .voice-card, .widget";
    addEventListener("mouseover", (e) => dot.classList.toggle("grow", !!e.target.closest(GROW)), { passive: true });

    $$("[data-magnetic]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * 0.22}px, ${dy * 0.28}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* 3D tilt cards */
  if (hoverable && !reduced) {
    $$(".tilt").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${px * 7}deg) rotateX(${-py * 7}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  /* ───────────────────────────────────────────────────────────
     SCROLL CHROME — progress bar
     ─────────────────────────────────────────────────────────── */
  const progressBar = $("#progressBar");
  let ticking = false;
  const scrollHandlers = [];
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      progressBar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
      scrollHandlers.forEach((fn) => fn());
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll, { passive: true });

  /* ───────────────────────────────────────────────────────────
     REVEAL OBSERVER + STAT COUNTERS
     ─────────────────────────────────────────────────────────── */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        const el = en.target;
        el.classList.add("in");
        revealIO.unobserve(el);
        // drop the reveal transition once done so tilt/hover transforms stay snappy
        setTimeout(() => el.classList.remove("reveal"), 1900);
      }
    });
  }, { threshold: 0.18, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach((el) => revealIO.observe(el));

  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      tween(el, 0, +el.dataset.count, {
        suffix: el.dataset.suffix || "",
        dur: 1400,
      });
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach((el) => countIO.observe(el));

  /* AML ring draws itself when visible */
  const ringEl = $("#amlRing");
  if (ringEl) {
    const ringIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        ringEl.style.strokeDashoffset = (326.7 * (1 - 0.98)).toFixed(1);
        ringIO.unobserve(ringEl);
      });
    }, { threshold: 0.5 });
    ringIO.observe(ringEl);
  }

  /* ───────────────────────────────────────────────────────────
     HERO — neural network canvas, mouse-reactive
     ─────────────────────────────────────────────────────────── */
  (function heroNet() {
    const cv = $("#heroNet");
    if (!cv || reduced) return;
    const ctx = cv.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let w, h, pts = [], running = false;
    const mouse = { x: -9999, y: -9999 };

    function build() {
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const N = Math.min(hoverable ? 90 : 48, Math.floor(w * h / 17000));
      pts = Array.from({ length: N }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
        coral: Math.random() < 0.16,
      }));
    }
    build();
    addEventListener("resize", build, { passive: true });
    cv.parentElement.addEventListener("mousemove", (e) => {
      const r = cv.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    }, { passive: true });
    cv.parentElement.addEventListener("mouseleave", () => { mouse.x = mouse.y = -9999; });

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      const LINK = 120, MR = 170;
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = w + 20; if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20; if (p.y > h + 20) p.y = -20;
        const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        p.lit = dm < MR ? 1 - dm / MR : 0;
        if (p.lit > 0) { // gentle drift toward the cursor's orbit
          p.x += (mouse.x - p.x) * 0.0014;
          p.y += (mouse.y - p.y) * 0.0014;
        }
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            const lit = Math.max(a.lit, b.lit);
            const alpha = (1 - d / LINK) * (0.07 + lit * 0.3);
            ctx.strokeStyle = lit > 0.25
              ? `rgba(255,88,90,${alpha})`
              : `rgba(0,22,57,${alpha})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (const p of pts) {
        const r = (p.coral ? 2.3 : 1.6) + p.lit * 1.6;
        ctx.fillStyle = p.coral || p.lit > 0.35
          ? `rgba(255,88,90,${0.55 + p.lit * 0.45})`
          : "rgba(0,22,57,.28)";
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    new IntersectionObserver((en) => {
      const vis = en[0].isIntersecting;
      if (vis && !running) { running = true; frame(); }
      else if (!vis) running = false;
    }).observe(cv);
  })();

  /* ───────────────────────────────────────────────────────────
     HERO DEPTH — parallax chips + console tilt + living shadow
     ─────────────────────────────────────────────────────────── */
  (function heroDepth() {
    const hero = $("#hero");
    if (!hero || reduced || !hoverable) return;
    const chips = $$(".hchip", hero);
    const console_ = $("#heroConsole");
    console_.style.animation = "none"; // JS takes over float + tilt
    let tx = 0, ty = 0, mx = 0, my = 0, raf = null;

    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
    }, { passive: true });
    hero.addEventListener("mouseleave", () => { tx = ty = 0; });

    function frame(now) {
      raf = requestAnimationFrame(frame);
      mx = lerp(mx, tx, 0.06); my = lerp(my, ty, 0.06);
      chips.forEach((c, i) => {
        const d = +c.dataset.depth || 20;
        const bob = Math.sin(now / 1400 + i * 1.7) * 7;
        c.style.transform = `translate3d(${-mx * d}px, ${-my * d + bob}px, 0)`;
      });
      const bob = Math.sin(now / 1800) * 7;
      console_.style.transform =
        `translateY(${bob}px) perspective(1100px) rotateY(${mx * 4.5}deg) rotateX(${-my * 4}deg)`;
      console_.style.boxShadow =
        `${-mx * 30}px ${18 - my * 16}px 60px rgba(0,22,57,.14)`;
    }
    new IntersectionObserver((en) => {
      if (en[0].isIntersecting) { if (!raf) raf = requestAnimationFrame(frame); }
      else if (raf) { cancelAnimationFrame(raf); raf = null; }
    }).observe(hero);
  })();

  /* ───────────────────────────────────────────────────────────
     HERO CONSOLE — Ava's live activity feed
     ─────────────────────────────────────────────────────────── */
  (function heroConsole() {
    const feed = $("#heroFeed"), booked = $("#heroBooked"), callsEl = $("#heroCalls");
    if (!feed) return;
    const EVENTS = [
      ["i-phone", "Answered — vendor enquiry, Chorlton"],
      ["i-user", "Lead qualified · scored HOT"],
      ["i-cal", "Valuation booked — Thu 14:30"],
      ["i-shield", "AML check completed · file clear"],
      ["i-home", "Viewing confirmed — Marlow Court"],
      ["i-send", "Vendor update sent — 14 Elm Road"],
      ["i-doc", "EPC chased — landlord notified"],
      ["i-chat", "Portal enquiry answered in 8s"],
      ["i-key", "Landlord call handled — renewal agreed"],
      ["i-bell", "Negotiator briefed — hot lead waiting"],
    ];
    const BOOKINGS = [
      "Valuation · Fri 11:00 — Heaton Moor",
      "Viewing · Sat 09:45 — King St",
      "Appraisal · Mon 16:15 — Didsbury",
      "Viewing · Sun 13:30 — Castlefield",
    ];
    let i = 0, calls = 147, bi = 0;
    const stamp = () => {
      const d = new Date();
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    };
    function push() {
      const [icon, text] = EVENTS[i++ % EVENTS.length];
      const li = document.createElement("li");
      li.className = "feed-item";
      li.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#${icon}"/></svg><span>${text}</span><time>${stamp()}</time>`;
      feed.prepend(li);
      while (feed.children.length > 5) feed.lastElementChild.remove();
      if (icon === "i-phone") { calls++; tween(callsEl, calls - 1, calls, { dur: 500 }); }
      if (icon === "i-cal" || icon === "i-home") {
        const b = document.createElement("li");
        b.textContent = BOOKINGS[bi++ % BOOKINGS.length];
        booked.prepend(b);
        while (booked.children.length > 3) booked.lastElementChild.remove();
      }
    }
    let timer = null;
    new IntersectionObserver((en) => {
      if (en[0].isIntersecting && !timer) {
        push();
        timer = setInterval(push, 2400);
      } else if (!en[0].isIntersecting && timer) {
        clearInterval(timer); timer = null;
      }
    }, { threshold: 0.2 }).observe(feed);
  })();

  /* ───────────────────────────────────────────────────────────
     MARQUEES — duplicate tracks for a seamless loop
     ─────────────────────────────────────────────────────────── */
  $$("#marqueeTrack, .voice-track").forEach((track) => {
    track.innerHTML += track.innerHTML;
  });

  /* ───────────────────────────────────────────────────────────
     ORB FACTORY — Ava rendered as a living particle core
     ─────────────────────────────────────────────────────────── */
  function createOrb(canvas, opts = {}) {
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let w = 0, h = 0;
    const fit = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    addEventListener("resize", fit, { passive: true });

    const N = opts.particles || 22;
    const pts = Array.from({ length: N }, () => ({
      a: Math.random() * Math.PI * 2,
      r: 0.6 + Math.random() * 0.3,
      sp: 0.5 + Math.random() * 0.8,
      tilt: Math.random() * Math.PI,
    }));
    const TARGET = { idle: 0.22, listen: 0.62, think: 1 };
    let mode = "idle", energy = 0.22, look = { x: 0, y: 0 };
    let raf = null, last = 0, t = 0;

    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(50, now - last) / 1000;
      last = now;
      energy += (TARGET[mode] - energy) * Math.min(1, dt * 3);
      t += dt * (0.6 + energy * 2);
      ctx.clearRect(0, 0, w, h);
      const R = Math.min(w, h) * 0.5;
      const cx = w / 2 + look.x * R * 0.14, cy = h / 2 + look.y * R * 0.14;

      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.95);
      glow.addColorStop(0, `rgba(255,88,90,${0.5 + energy * 0.3})`);
      glow.addColorStop(0.45, `rgba(255,88,90,${0.14 + energy * 0.12})`);
      glow.addColorStop(1, "rgba(255,88,90,0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.95, 0, Math.PI * 2); ctx.fill();

      const pulse = 1 + Math.sin(t * 3) * 0.05 * (0.4 + energy);
      ctx.fillStyle = CORAL;
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.3 * pulse, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.8)";
      ctx.beginPath(); ctx.arc(cx - R * 0.08, cy - R * 0.1, R * 0.085, 0, Math.PI * 2); ctx.fill();

      ctx.lineWidth = 1;
      ctx.strokeStyle = opts.dark
        ? `rgba(255,255,255,${0.16 + energy * 0.2})`
        : `rgba(0,22,57,${0.12 + energy * 0.18})`;
      ctx.beginPath();
      ctx.ellipse(cx, cy, R * 0.72, R * 0.72 * (0.34 + 0.08 * Math.sin(t * 0.7)), t * 0.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy, R * 0.8, R * 0.8 * 0.3, -t * 0.22, 0, Math.PI * 2);
      ctx.stroke();

      for (const p of pts) {
        p.a += dt * p.sp * (0.5 + energy * 2.6);
        const depth = 0.55 + 0.45 * Math.sin(p.a * 2 + p.tilt);
        const px = cx + Math.cos(p.a) * R * p.r;
        const py = cy + Math.sin(p.a) * R * p.r * Math.cos(p.tilt + t * (mode === "think" ? 0.8 : 0.2));
        ctx.fillStyle = `rgba(255,88,90,${0.25 + 0.6 * depth})`;
        ctx.beginPath(); ctx.arc(px, py, (0.8 + depth * 1.3) * (opts.scale || 1), 0, Math.PI * 2); ctx.fill();
      }
    }
    return {
      set mode(m) { mode = m; },
      get mode() { return mode; },
      look(x, y) { look.x = x; look.y = y; },
      start() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } },
      stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } },
    };
  }

  /* ───────────────────────────────────────────────────────────
     AVA — the entity that follows you through the experience
     ─────────────────────────────────────────────────────────── */
  const ava = (() => {
    const el = $("#avaOrb");
    if (!el || reduced) return { set() {}, say() {}, idle() {} };
    const orb = createOrb($("#avaOrbCanvas"), { particles: 18, scale: 0.8 });
    const label = $("#orbLabel");
    let labelTimer = null;

    function say(text, ms = 2600) {
      label.textContent = text;
      el.classList.add("talk", "speaking");
      clearTimeout(labelTimer);
      labelTimer = setTimeout(() => el.classList.remove("talk", "speaking"), ms);
    }
    function set(mode, text) { orb.mode = mode; if (text) say(text); }

    introHooks.push(() => {
      el.classList.add("show");
      orb.start();
      setTimeout(() => say("Hi, I'm Ava."), 900);
    });

    if (hoverable) {
      addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        orb.look(
          clamp((e.clientX - (r.left + r.width / 2)) / (innerWidth / 2), -1, 1),
          clamp((e.clientY - (r.top + r.height / 2)) / (innerHeight / 2), -1, 1)
        );
      }, { passive: true });
    }

    let settleTimer = null;
    addEventListener("scroll", () => {
      if (orb.mode === "idle") orb.mode = "listen";
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => { if (orb.mode === "listen") orb.mode = "idle"; }, 450);
    }, { passive: true });

    el.addEventListener("click", () => {
      say("Watch this…");
      $("#demo").scrollIntoView({ behavior: "smooth" });
      setTimeout(() => { if (demo && !demo.busy) demo.fire("seller"); }, 900);
    });

    /* step aside for the finale, where Ava takes the stage herself */
    const finale = $("#finale");
    if (finale) {
      new IntersectionObserver((en) => {
        el.classList.toggle("hide", en[0].isIntersecting);
      }, { threshold: 0.2 }).observe(finale);
    }
    return { set, say, idle() { set("idle"); } };
  })();

  /* ───────────────────────────────────────────────────────────
     COGNITION — Ava's visible thinking engine
     ─────────────────────────────────────────────────────────── */
  const cog = (() => {
    const wrap = $("#cognition");
    if (!wrap || reduced) return { run() {}, idle() {} };
    const canvas = $("#cogCanvas"), textEl = $("#cogText");
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let w = 0, h = 0;
    const fit = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };
    let nodes = [], edges = [];
    function build() {
      nodes = Array.from({ length: 9 }, (_, i) => ({
        x: 14 + (i / 8) * (w * 0.62),
        y: h * (0.28 + 0.48 * ((i * 37) % 10) / 10),
        ph: Math.random() * Math.PI * 2,
      }));
      edges = [];
      for (let i = 0; i < nodes.length; i++)
        for (let j = i + 1; j < nodes.length; j++)
          if (Math.abs(nodes[i].x - nodes[j].x) < w * 0.2) edges.push([i, j]);
    }
    fit();
    addEventListener("resize", fit, { passive: true });

    const PHRASES = [
      "Analysing caller…", "Checking CRM…", "Searching applicant database…",
      "AML verification running…", "Matching property requirements…",
      "Valuation slot available…",
    ];
    let level = 0.12, target = 0.12, pulses = [], raf = null, last = 0, phraseTimer = null, pi = 0;

    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(50, now - last) / 1000;
      last = now;
      level += (target - level) * Math.min(1, dt * 3);
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      for (const [i, j] of edges) {
        ctx.strokeStyle = `rgba(0,22,57,${0.06 + level * 0.1})`;
        ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
      }
      if (Math.random() < level * 0.22 && edges.length) {
        pulses.push({ e: edges[(Math.random() * edges.length) | 0], p: 0, sp: 1.4 + Math.random() });
      }
      pulses = pulses.filter((pu) => {
        pu.p += dt * pu.sp;
        if (pu.p >= 1) return false;
        const [i, j] = pu.e;
        const x = lerp(nodes[i].x, nodes[j].x, pu.p);
        const y = lerp(nodes[i].y, nodes[j].y, pu.p);
        ctx.fillStyle = `rgba(255,88,90,${0.9 - pu.p * 0.5})`;
        ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
        return true;
      });
      for (const n of nodes) {
        const tw = 0.5 + 0.5 * Math.sin(now / 500 + n.ph);
        ctx.fillStyle = `rgba(255,88,90,${0.25 + level * 0.55 * tw})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, 2 + level * 1.6 * tw, 0, Math.PI * 2); ctx.fill();
      }
    }
    new IntersectionObserver((en) => {
      if (en[0].isIntersecting) { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
      else if (raf) { cancelAnimationFrame(raf); raf = null; }
    }, { threshold: 0.1 }).observe(wrap);

    return {
      run(label) {
        target = 1;
        wrap.classList.add("active");
        textEl.textContent = label || PHRASES[pi++ % PHRASES.length];
        clearInterval(phraseTimer);
        phraseTimer = setInterval(() => { textEl.textContent = PHRASES[pi++ % PHRASES.length]; }, 1600);
      },
      idle() {
        target = 0.12;
        wrap.classList.remove("active");
        clearInterval(phraseTimer);
        textEl.textContent = "Cognition idle";
      },
    };
  })();

  /* ───────────────────────────────────────────────────────────
     INTERACTIVE DEMO — scenario engine
     ─────────────────────────────────────────────────────────── */
  const demo = (() => {
    const stage = $("#demoStage");
    if (!stage) return null;
    const transcript = $("#stageTranscript"), actions = $("#stageActions"),
          toasts = $("#stageToasts"), wave = $("#callWave"),
          status = $("#demoStatus"), triggers = $$(".trigger"),
          banner = $("#incomingBanner");
    let bannerTimer = null;
    const kpis = { leads: $("#kLeads"), vals: $("#kVals"), views: $("#kViews"), aml: $("#kAml") };
    const counts = { leads: 12, vals: 4, views: 9, aml: 6 };
    let busy = false, timers = [];

    const icon = (n) => `<svg class="icon" aria-hidden="true"><use href="#${n}"/></svg>`;
    // capHead trims oldest-first lists (append); capTail trims newest-last lists (prepend)
    const capHead = (list, max) => { while (list.children.length > max) list.firstElementChild.remove(); };
    const capTail = (list, max) => { while (list.children.length > max) list.lastElementChild.remove(); };

    const api = {
      say(who, text) {
        const li = document.createElement("li");
        li.className = `t-line t-line--${who}`;
        li.textContent = text;
        transcript.append(li); capHead(transcript, 7);
        transcript.scrollTop = transcript.scrollHeight;
      },
      sys(text) { api.say("sys", text); },
      act(iconName, html, done = false) {
        const li = document.createElement("li");
        li.className = "a-item" + (done ? " done" : "");
        li.innerHTML = icon(done ? "i-check" : iconName) + `<span>${html}</span>`;
        actions.append(li); capHead(actions, 6);
        return li;
      },
      think(label) {
        const li = document.createElement("li");
        li.className = "a-item thinking";
        li.innerHTML = icon("i-bolt") + `<span>${label} <i></i><i></i><i></i></span>`;
        actions.append(li); capHead(actions, 6);
        cog.run(label + "…");
        ava.set("think");
        return li;
      },
      resolve(li, iconName, html) {
        li.classList.remove("thinking");
        li.classList.add("done");
        li.innerHTML = icon("i-check") + `<span>${html}</span>`;
        if (!actions.querySelector(".thinking")) cog.idle();
      },
      toast(text) {
        const div = document.createElement("div");
        div.className = "toast";
        div.innerHTML = icon("i-bolt") + text;
        toasts.append(div);
        setTimeout(() => div.remove(), 3800);
      },
      kpi(key, delta = 1) {
        counts[key] += delta;
        const el = kpis[key];
        el.textContent = counts[key];
        const box = el.closest(".skpi");
        box.classList.remove("bump");
        void box.offsetWidth;
        box.classList.add("bump");
      },
      diary(time, label) {
        const li = document.createElement("li");
        li.className = "new";
        li.innerHTML = `<span>${time}</span><em>${label}</em>`;
        $("#stageDiary").prepend(li); capTail($("#stageDiary"), 4);
      },
      crm(tag, label, cool = false) {
        const li = document.createElement("li");
        li.className = "new";
        li.innerHTML = `<span class="crm-tag${cool ? " crm-tag--cool" : ""}">${tag}</span><em>${label}</em>`;
        $("#stageCrm").prepend(li); capTail($("#stageCrm"), 3);
      },
      wave(on) {
        wave.classList.toggle("on", on);
        if (on) {
          banner.classList.add("on");
          clearTimeout(bannerTimer);
          bannerTimer = setTimeout(() => banner.classList.remove("on"), 2000);
          ava.set("listen");
        } else {
          banner.classList.remove("on");
        }
      },
      status(text, isBusy) {
        status.innerHTML = `<span class="pulse-dot" aria-hidden="true"></span>${text}`;
        status.classList.toggle("busy", !!isBusy);
        stage.classList.toggle("active", !!isBusy);
        if (isBusy) ava.set("listen", "On it…");
        else { ava.set("idle", "Handled ✓"); cog.idle(); }
      },
    };

    /* Each scenario: [gap-ms, fn] pairs, run sequentially. */
    const SCENARIOS = {
      seller: (a) => {
        let th;
        return [
          [0, () => { a.status("Live call — inbound vendor", true); a.wave(true); a.sys("Incoming call · 0.8s to answer"); }],
          [700, () => a.say("ava", "Good afternoon, you're through to Ava at Harborne & Co — how can I help?")],
          [1500, () => a.say("caller", "Hi, we're thinking of selling our house on Birch Lane…")],
          [1500, () => { th = a.think("Qualifying lead"); }],
          [1300, () => a.resolve(th, "i-user", "<strong>Qualified:</strong> owner-occupier · selling to upsize · ready in 2–3 months")],
          [900, () => a.say("ava", "Lovely — I can get our senior valuer out to you. Thursday 2:30 or Friday morning?")],
          [1400, () => a.say("caller", "Thursday works.")],
          [900, () => { a.act("i-cal", "<strong>Valuation booked</strong> — Thu 14:30, M. Reeves", true); a.diary("14:30", "Valuation — 8 Birch Lane"); a.kpi("vals"); }],
          [900, () => { a.act("i-doc", "<strong>CRM updated</strong> — contact, transcript & HOT score", true); a.crm("HOT", "R. Thompson — seller, Birch Ln"); a.kpi("leads"); }],
          [800, () => { a.wave(false); a.toast("Hot vendor → valuation in 41 seconds"); a.status("Idle — waiting for chaos", false); }],
        ];
      },
      landlord: (a) => {
        let th;
        return [
          [0, () => { a.status("Live call — landlord enquiry", true); a.wave(true); a.sys("Incoming call · landlord"); }],
          [700, () => a.say("caller", "I've got a two-bed flat I'd like to let out — do you manage properties?")],
          [1300, () => a.say("ava", "We do — fully managed or let-only. Can I take a few details about the flat?")],
          [1300, () => { th = a.think("Assessing instruction"); }],
          [1300, () => a.resolve(th, "i-key", "<strong>Qualified:</strong> 2-bed · vacant · wants fully managed")],
          [900, () => { a.act("i-cal", "<strong>Rental appraisal booked</strong> — Wed 10:00", true); a.diary("10:00", "Appraisal — Weaver's Yard"); a.kpi("vals"); }],
          [900, () => { a.act("i-shield", "<strong>Compliance pack started</strong> — gas, EICR, EPC checklist", true); }],
          [800, () => { a.crm("LET", "D. Kaur — landlord, 2-bed", true); a.kpi("leads"); a.wave(false); a.toast("New managed instruction in the pipeline"); a.status("Idle — waiting for chaos", false); }],
        ];
      },
      aml: (a) => {
        let th;
        return [
          [0, () => { a.status("AML workflow — running", true); a.sys("AML triggered · new vendor file"); }],
          [600, () => a.act("i-send", "<strong>ID request sent</strong> — secure link, SMS + email", true)],
          [1200, () => { th = a.think("Verifying documents"); }],
          [1600, () => a.resolve(th, "i-shield", "<strong>ID verified</strong> — passport + proof of address ✓")],
          [1000, () => { th = a.think("Screening PEP & sanctions"); }],
          [1500, () => a.resolve(th, "i-shield", "<strong>Screening clear</strong> — no PEP or sanctions matches")],
          [900, () => { a.act("i-doc", "<strong>File assembled</strong> — audit-ready, stored to CRM", true); a.kpi("aml"); }],
          [800, () => { a.toast("AML complete — zero human minutes spent"); a.status("Idle — waiting for chaos", false); }],
        ];
      },
      viewing: (a) => {
        let th;
        return [
          [0, () => { a.status("Live call — applicant", true); a.wave(true); a.sys("Incoming call · applicant"); }],
          [700, () => a.say("caller", "Is the house on Marlow Court still available? Could we see it this weekend?")],
          [1200, () => a.say("ava", "It is! Let me check a couple of things and find you a slot.")],
          [1100, () => { th = a.think("Qualifying applicant"); }],
          [1300, () => a.resolve(th, "i-user", "<strong>Qualified:</strong> first-time buyer · AIP in place · proceedable")],
          [900, () => a.say("ava", "Saturday 11:15 is free — shall I book you in?")],
          [1200, () => a.say("caller", "Perfect, yes!")],
          [800, () => { a.act("i-cal", "<strong>Viewing booked</strong> — Sat 11:15 + SMS confirmations", true); a.diary("11:15", "Viewing — Marlow Court"); a.kpi("views"); }],
          [800, () => { a.crm("APP", "L. + S. Chen — proceedable", true); a.wave(false); a.toast("Viewing booked · reminder scheduled"); a.status("Idle — waiting for chaos", false); }],
        ];
      },
      vendor: (a) => {
        let th;
        return [
          [0, () => { a.status("Vendor update — composing", true); a.sys("Friday 16:00 · weekly vendor updates"); }],
          [700, () => { th = a.think("Compiling week's activity"); }],
          [1500, () => a.resolve(th, "i-chart", "<strong>Summary built:</strong> 3 viewings · 1 second viewing · 14 portal clicks ↑")],
          [1000, () => a.act("i-chat", "<strong>Feedback summarised</strong> — “loved the garden, kitchen feels dated”", true)],
          [1100, () => a.act("i-send", "<strong>Update sent</strong> — personalised email + SMS to vendor", true)],
          [900, () => { a.act("i-doc", "<strong>CRM logged</strong> — next price-review nudge in 14 days", true); }],
          [800, () => { a.toast("12 vendors updated · 0 minutes of admin"); a.status("Idle — waiting for chaos", false); }],
        ];
      },
      missed: (a) => {
        let th;
        return [
          [0, () => { a.status("Out of hours — 18:48", true); a.sys("Office closed · call rings out elsewhere…"); }],
          [900, () => { a.wave(true); a.say("ava", "Good evening! You've reached Harborne & Co — I'm Ava, happy to help."); }],
          [1400, () => a.say("caller", "Oh — a human! Er, great. I missed your office hours, I want to sell my flat.")],
          [1500, () => { th = a.think("Recovering would-be missed lead"); }],
          [1200, () => a.resolve(th, "i-phone", "<strong>Lead saved</strong> — would have been a voicemail at every other agency")],
          [900, () => { a.act("i-cal", "<strong>Valuation booked</strong> — tomorrow 09:30", true); a.diary("09:30", "Valuation — Canal Wharf"); a.kpi("vals"); }],
          [900, () => { a.crm("HOT", "A. Novak — seller, after-hours"); a.kpi("leads"); }],
          [800, () => { a.wave(false); a.toast("That call was worth ≈ £3,800 in fees"); a.status("Idle — waiting for chaos", false); }],
        ];
      },
      valuation: (a) => {
        let th;
        return [
          [0, () => { a.status("Portal lead — responding", true); a.sys("Rightmove valuation request · 21:14"); }],
          [700, () => a.act("i-bolt", "<strong>Responded in 8 seconds</strong> — SMS + email to requester", true)],
          [1200, () => { a.wave(true); a.say("caller", "Wow, that was quick — yes, I'd like a valuation on my terrace in Moseley."); }],
          [1300, () => { th = a.think("Checking diary across 3 valuers"); }],
          [1300, () => a.resolve(th, "i-cal", "<strong>Best slot found</strong> — matches valuer who knows Moseley")],
          [900, () => { a.act("i-cal", "<strong>Valuation booked</strong> — Tue 17:30, J. Mistry", true); a.diary("17:30", "Valuation — Moseley terrace"); a.kpi("vals"); }],
          [900, () => { a.crm("HOT", "P. O'Shea — portal lead"); a.kpi("leads"); }],
          [800, () => { a.wave(false); a.toast("Portal lead → diary before competitors opened the email"); a.status("Idle — waiting for chaos", false); }],
        ];
      },
    };

    function clear() {
      transcript.innerHTML = "";
      actions.innerHTML = "";
    }

    function fire(name) {
      const make = SCENARIOS[name];
      if (!make || busy) return;
      busy = true;
      clear();
      triggers.forEach((b) => { b.disabled = true; b.classList.toggle("firing", b.dataset.scenario === name); });
      const steps = make(api);
      let t = 0;
      timers = steps.map(([gap, fn]) => { t += gap; return setTimeout(fn, t); });
      timers.push(setTimeout(() => {
        busy = false;
        triggers.forEach((b) => { b.disabled = false; b.classList.remove("firing"); });
      }, t + 600));
    }

    triggers.forEach((b) => b.addEventListener("click", () => fire(b.dataset.scenario)));

    /* Auto-fire once, the first time the stage scrolls into view */
    let autoFired = false;
    new IntersectionObserver((en) => {
      if (en[0].isIntersecting && !autoFired) {
        autoFired = true;
        setTimeout(() => { if (!busy) fire("missed"); }, 700);
      }
    }, { threshold: 0.45 }).observe(stage);

    return { fire, get busy() { return busy; } };
  })();

  /* "Watch Ava work" → scroll to demo and fire a scenario */
  $("#watchAvaBtn")?.addEventListener("click", () => {
    setTimeout(() => { if (demo && !demo.busy) demo.fire("seller"); }, 900);
  });

  /* ───────────────────────────────────────────────────────────
     SCROLL STORY — chaos → Ava → calm
     ─────────────────────────────────────────────────────────── */
  (function story() {
    const track = $("#storyTrack"), stage = $("#storyStage"), board = $("#storyBoard");
    if (!track) return;

    const TASKS = [
      ["i-phone", "Missed call — vendor", 4, 14, true],
      ["i-shield", "AML overdue — Elm Rd", 38, 12, true],
      ["i-phone", "Call queue: 11 waiting", 70, 16, true],
      ["i-doc", "EPC expired — Flat 3", 8, 30, false],
      ["i-cal", "Valuation unbooked", 44, 26, true],
      ["i-chat", "Portal enquiry — 2d old", 74, 34, false],
      ["i-bell", "Vendor chasing update", 6, 56, true],
      ["i-doc", "Right-to-rent check due", 40, 52, false],
      ["i-phone", "Voicemail box full", 72, 60, true],
      ["i-key", "Landlord complaint", 10, 82, false],
      ["i-cal", "No-show — no reminder sent", 42, 78, true],
      ["i-chat", "Applicant unanswered", 73, 86, false],
    ];

    const tasks = TASKS.map(([icon, label, x, y, alert], i) => {
      const el = document.createElement("div");
      el.className = "story-task" + (alert ? " story-task--alert" : "");
      el.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#${icon}"/></svg><span>${label}</span>` +
        (alert ? `<span class="badge">+${1 + (i % 3)}</span>` : "");
      el.style.left = x + "%";
      el.style.top = y + "%";
      el.style.opacity = reduced ? 1 : 0;
      board.append(el);
      return { el, x, y };
    });

    const phonesWrap = $("#storyPhones");
    const phones = Array.from({ length: 6 }, () => {
      const s = document.createElement("span");
      s.className = "sphone";
      s.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#i-phone"/></svg>`;
      phonesWrap.append(s);
      return s;
    });
    const flash = $("#storyFlash");
    let flashed = false;

    if (reduced) return;

    const meterFill = $("#meterFill"), meterRead = $("#meterRead"),
          meterLabel = $("#meterLabel"), ava = $("#storyAva"),
          calm = $("#storyCalm"), calmCount = $("#calmCount"),
          caps = $$(".story-cap");
    const CAP_WINDOWS = [[0, .12], [.12, .3], [.3, .46], [.46, .63], [.63, .8], [.8, 1.01]];

    let stageRect = null;
    const measure = () => { stageRect = stage.getBoundingClientRect(); };
    addEventListener("resize", () => { stageRect = null; }, { passive: true });

    scrollHandlers.push(() => {
      const r = track.getBoundingClientRect();
      const total = r.height - innerHeight;
      if (r.top > innerHeight || r.bottom < 0) return;
      const p = clamp(-r.top / total, 0, 1);
      if (!stageRect) measure();

      /* captions */
      caps.forEach((c, i) => {
        const [a, b] = CAP_WINDOWS[i];
        c.classList.toggle("on", p >= a && p < b);
      });

      /* office load meter — rises with chaos, falls when Ava lands */
      let load;
      if (p < 0.46) load = (p / 0.46) * 94;
      else if (p < 0.58) load = 94;
      else load = Math.max(4, 94 - ((p - 0.58) / 0.3) * 90);
      meterFill.style.transform = `scaleX(${load / 100})`;
      meterRead.textContent = Math.round(load) + "%";
      meterLabel.textContent = load > 60 ? "Office load — critical" : load > 25 ? "Office load" : "Office load — calm";

      /* phones: ring through the chaos, answered once Ava lands */
      const ringN = p < 0.5 ? Math.round(clamp(p / 0.4, 0, 1) * 6) : 0;
      const okN = p >= 0.5 ? Math.round(clamp((p - 0.52) / 0.26, 0, 1) * 6) : 0;
      phones.forEach((ph, i) => {
        ph.classList.toggle("ring", i < ringN && okN <= i);
        ph.classList.toggle("ok", i < okN);
      });

      /* activation flash the moment Ava clocks in */
      if (p >= 0.5 && !flashed) { flashed = true; flash.classList.add("go"); }
      else if (p < 0.42 && flashed) { flashed = false; flash.classList.remove("go"); }

      /* Ava arrives */
      const avaIn = clamp((p - 0.46) / 0.1, 0, 1);
      ava.style.scale = avaIn === 0 ? 0 : (0.5 + 0.5 * (1 - Math.pow(1 - avaIn, 3)));

      /* tasks: appear in chaos, then fly into Ava */
      const cx = stageRect.width * 0.5, cy = stageRect.height * 0.55;
      tasks.forEach((t, i) => {
        const showAt = 0.04 + i * 0.028;
        const appear = clamp((p - showAt) / 0.05, 0, 1);
        const flyAt = 0.56 + i * 0.022;
        const fly = clamp((p - flyAt) / 0.09, 0, 1);
        const el = t.el;
        if (appear <= 0) { el.style.opacity = 0; return; }
        if (fly <= 0) {
          el.style.opacity = appear;
          el.style.transform = `translateY(${(1 - appear) * 22}px)`;
          el.classList.toggle("shake", p > 0.3 && p < 0.52);
        } else {
          el.classList.remove("shake");
          const ox = (t.x / 100) * stageRect.width, oy = (t.y / 100) * stageRect.height;
          const e = 1 - Math.pow(1 - fly, 3);
          el.style.opacity = 1 - fly;
          el.style.transform = `translate(${(cx - ox) * e}px, ${(cy - oy) * e}px) scale(${1 - 0.65 * e})`;
        }
      });

      /* cleared count + calm chip */
      const cleared = tasks.filter((_, i) => p > 0.56 + i * 0.022 + 0.09).length;
      calmCount.textContent = cleared + (cleared === 1 ? " task" : " tasks");
      const calmIn = clamp((p - 0.84) / 0.08, 0, 1);
      calm.style.opacity = calmIn;
      calm.style.transform = `translateX(-50%) translateY(${(1 - calmIn) * 16}px)`;
    });
  })();

  /* ───────────────────────────────────────────────────────────
     COMMAND CENTRE — live ticking numbers + decision stream
     ─────────────────────────────────────────────────────────── */
  (function commandCentre() {
    const section = $("#command");
    if (!section) return;
    const callsEl = $("#ccCalls"), leadsEl = $("#ccLeads"), revEl = $("#ccRevenue"), feed = $("#ccFeed");
    let calls = 231, leads = 86, rev = 48200;
    const STREAM = [
      ["i-phone", "Answered: buyer enquiry — 0.7s"],
      ["i-user", "Lead scored 87/100 — routed to S. Reeves"],
      ["i-shield", "AML: sanctions screen clear — file 412"],
      ["i-cal", "Valuation slot optimised — travel time saved"],
      ["i-send", "Vendor report drafted — awaiting Friday"],
      ["i-chat", "Applicant matched to 3 new listings"],
      ["i-doc", "Gas safety renewal chased — 11 Weaver St"],
      ["i-bell", "Negotiator nudged: callback due in 10 min"],
    ];
    let si = 0, timer = null;

    function tick() {
      const roll = Math.random();
      if (roll < 0.5) { calls++; tween(callsEl, calls - 1, calls, { dur: 450 }); }
      else if (roll < 0.75) { leads++; tween(leadsEl, leads - 1, leads, { dur: 450 }); }
      else { rev += 100 * (3 + Math.floor(Math.random() * 6)); revEl.textContent = "£" + fmt(rev); }
      const [icon, text] = STREAM[si++ % STREAM.length];
      const li = document.createElement("li");
      li.className = "feed-item";
      li.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#${icon}"/></svg><span>${text}</span>`;
      feed.prepend(li);
      while (feed.children.length > 4) feed.lastElementChild.remove();
    }
    new IntersectionObserver((en) => {
      if (en[0].isIntersecting && !timer) { tick(); timer = setInterval(tick, 2600); }
      else if (!en[0].isIntersecting && timer) { clearInterval(timer); timer = null; }
    }, { threshold: 0.15 }).observe(section);
  })();

  /* ───────────────────────────────────────────────────────────
     MISSION CONTROL — health score, call queue, CRM sync, scoring
     ─────────────────────────────────────────────────────────── */
  (function missionControl() {
    const section = $("#command");
    if (!section) return;

    /* Agency health gauge */
    const healthRing = $("#healthRing"), healthPct = $("#healthPct"), healthLabel = $("#healthLabel");
    if (healthRing) {
      const HEALTH = 94;
      new IntersectionObserver((en, io) => {
        if (!en[0].isIntersecting) return;
        healthRing.style.strokeDashoffset = (326.7 * (1 - HEALTH / 100)).toFixed(1);
        tween(healthPct, 0, HEALTH, { dur: 1800 });
        setTimeout(() => { healthLabel.textContent = "Excellent — every signal green"; }, 1400);
        io.unobserve(healthRing);
      }, { threshold: 0.5 }).observe(healthRing);
    }

    /* Live call queue — callers appear, Ava answers, queue drains */
    const queue = $("#callQueue");
    const CALLERS = [
      ["S. Bennett", "vendor"], ["M. Iqbal", "applicant"], ["T. Kowalski", "landlord"],
      ["R. Adeyemi", "buyer"], ["H. Fletcher", "vendor"], ["J. Marsh", "tenant"],
    ];
    let qi = 0, qTimer = null;
    function enqueue() {
      const [name, kind] = CALLERS[qi++ % CALLERS.length];
      const li = document.createElement("li");
      li.className = "answering";
      li.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#i-phone"/></svg><span>${name} · ${kind}</span><em>answering</em>`;
      queue.prepend(li);
      setTimeout(() => { li.classList.remove("answering"); li.querySelector("em").textContent = "handled ✓"; }, 1000);
      setTimeout(() => li.classList.add("out"), 3600);
      setTimeout(() => li.remove(), 4100);
      while (queue.children.length > 3) queue.lastElementChild.remove();
    }

    /* CRM sync — heartbeat + write log */
    const syncAgo = $("#syncAgo"), syncLog = $("#syncLog");
    const WRITES = [
      "Contact created — S. Okafor", "Transcript attached — call #1042",
      "Task assigned — callback 10:00", "Valuation synced — Thu 14:30",
      "Lead score updated — 87 → 91", "Viewing logged — Marlow Court",
    ];
    let wi = 0, syncTimer = null;
    function syncTick() {
      syncAgo.textContent = 1 + ((Math.random() * 3) | 0);
      const li = document.createElement("li");
      li.textContent = WRITES[wi++ % WRITES.length];
      syncLog.prepend(li);
      while (syncLog.children.length > 3) syncLog.lastElementChild.remove();
    }

    /* Lead scores drift as Ava re-qualifies */
    const scoreRows = $$("#leadScores li");
    let scoreTimer = null;
    function scoreTick() {
      const row = scoreRows[(Math.random() * scoreRows.length) | 0];
      const em = row.querySelector("em"), bar = row.querySelector("i");
      const next = clamp(+em.textContent + ((Math.random() * 7) | 0) - 2, 55, 98);
      tween(em, +em.textContent, next, { dur: 700 });
      bar.style.setProperty("--s", next + "%");
    }

    new IntersectionObserver((en) => {
      if (en[0].isIntersecting && !qTimer) {
        enqueue();
        qTimer = setInterval(enqueue, 2800);
        syncTimer = setInterval(syncTick, 2200);
        scoreTimer = setInterval(scoreTick, 3600);
        syncTick();
      } else if (!en[0].isIntersecting && qTimer) {
        clearInterval(qTimer); clearInterval(syncTimer); clearInterval(scoreTimer);
        qTimer = syncTimer = scoreTimer = null;
      }
    }, { threshold: 0.12 }).observe(section);
  })();

  /* ───────────────────────────────────────────────────────────
     HOW IT WORKS — the line draws itself
     ─────────────────────────────────────────────────────────── */
  (function howLine() {
    const wrap = $(".how-wrap"), path = $("#howPath");
    if (!wrap || !path || reduced) return;
    scrollHandlers.push(() => {
      const r = wrap.getBoundingClientRect();
      const p = clamp((innerHeight * 0.75 - r.top) / r.height, 0, 1);
      path.style.strokeDashoffset = (100 * (1 - p)).toFixed(2);
    });
  })();

  /* ───────────────────────────────────────────────────────────
     NIGHT — the 02:17am loop
     ─────────────────────────────────────────────────────────── */
  (function nightStars() {
    const cv = $("#nightStars");
    if (!cv || reduced) return;
    const ctx = cv.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let w, h, stars = [], raf = null;
    const fit = () => {
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: Math.min(90, (w * h / 9000) | 0) }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: 0.5 + Math.random() * 1.2,
        ph: Math.random() * Math.PI * 2,
        sp: 0.4 + Math.random() * 1.2,
        coral: Math.random() < 0.08,
      }));
    };
    fit();
    addEventListener("resize", fit, { passive: true });
    function frame(now) {
      raf = requestAnimationFrame(frame);
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(now / 700 * s.sp + s.ph));
        ctx.fillStyle = s.coral ? `rgba(255,88,90,${tw * 0.9})` : `rgba(255,255,255,${tw * 0.5})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * tw, 0, Math.PI * 2); ctx.fill();
      }
    }
    new IntersectionObserver((en) => {
      if (en[0].isIntersecting) { if (!raf) raf = requestAnimationFrame(frame); }
      else if (raf) { cancelAnimationFrame(raf); raf = null; }
    }, { threshold: 0.05 }).observe(cv);
  })();

  (function night() {
    const stage = $("#nightStage");
    if (!stage) return;
    const clock = $("#nightClock"), events = $$(".night-ev", stage), fin = $("#nightFinal"),
          saved = $("#nightSaved"), savedNum = $("#nightSavedNum");
    const toSec = (t) => t.split(":").reduce((a, v) => a * 60 + +v, 0);
    const toStr = (s) => [s / 3600, (s / 60) % 60, s % 60].map((v) => String(Math.floor(v)).padStart(2, "0")).join(":");
    let running = false, cancelled = false;

    function tweenClock(from, to, dur) {
      return new Promise((res) => {
        if (reduced) { clock.textContent = toStr(to); return res(); }
        const t0 = performance.now();
        (function step(now) {
          if (cancelled) return res();
          const p = clamp((now - t0) / dur, 0, 1);
          clock.textContent = toStr(Math.round(lerp(from, to, p)));
          p < 1 ? requestAnimationFrame(step) : res();
        })(t0);
      });
    }
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));

    async function loop() {
      if (running) return;
      running = true;
      while (!cancelled) {
        events.forEach((e) => e.classList.remove("on"));
        fin.classList.remove("on");
        saved.classList.remove("on");
        savedNum.textContent = "£0";
        let prev = toSec(events[0].dataset.time);
        clock.textContent = toStr(prev);
        await wait(500);
        for (const ev of events) {
          if (cancelled) break;
          const t = toSec(ev.dataset.time);
          await tweenClock(prev, t, 850);
          prev = t;
          ev.classList.add("on");
          await wait(1250);
        }
        if (cancelled) break;
        saved.classList.add("on");
        tween(savedNum, 0, 3800, { dur: 1200, prefix: "£" });
        await wait(1400);
        fin.classList.add("on");
        await wait(3600);
      }
      running = false;
    }

    new IntersectionObserver((en) => {
      if (en[0].isIntersecting) { cancelled = false; loop(); }
      else cancelled = true;
    }, { threshold: 0.3 }).observe(stage);

    if (reduced) {
      events.forEach((e) => e.classList.add("on"));
      fin.classList.add("on");
      saved.classList.add("on");
      savedNum.textContent = "£3,800";
    }
  })();

  /* ───────────────────────────────────────────────────────────
     FINALE — Ava floating in a dark particle field
     ─────────────────────────────────────────────────────────── */
  (function finale() {
    const section = $("#finale");
    if (!section || reduced) return;

    const orbCv = $("#finaleOrbCanvas");
    const orb = orbCv ? createOrb(orbCv, { particles: 30, scale: 1.4, dark: true }) : null;
    if (orb) orb.mode = "listen";

    const cv = $("#finaleNet");
    const ctx = cv.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let w, h, pts = [], raf = null;
    const fit = () => {
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const N = Math.min(80, (w * h / 22000) | 0);
      pts = Array.from({ length: N }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        coral: Math.random() < 0.18,
      }));
    };
    fit();
    addEventListener("resize", fit, { passive: true });

    function frame() {
      raf = requestAnimationFrame(frame);
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h * 0.42, LINK = 130;
      for (const p of pts) {
        /* slow gravitational drift around Ava */
        const dx = cx - p.x, dy = cy - p.y;
        const d = Math.hypot(dx, dy) || 1;
        p.vx += (dx / d) * 0.0011; p.vy += (dy / d) * 0.0011;
        p.vx *= 0.998; p.vy *= 0.998;
        p.x += p.vx; p.y += p.vy;
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            const alpha = (1 - d / LINK) * 0.14;
            ctx.strokeStyle = (a.coral || b.coral)
              ? `rgba(255,88,90,${alpha * 1.4})`
              : `rgba(255,255,255,${alpha})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (const p of pts) {
        ctx.fillStyle = p.coral ? "rgba(255,88,90,.8)" : "rgba(255,255,255,.4)";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.coral ? 2 : 1.4, 0, Math.PI * 2); ctx.fill();
      }
    }
    new IntersectionObserver((en) => {
      if (en[0].isIntersecting) {
        if (!raf) raf = requestAnimationFrame(frame);
        orb?.start();
      } else {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        orb?.stop();
      }
    }, { threshold: 0.05 }).observe(section);
  })();

  /* ───────────────────────────────────────────────────────────
     ROI CALCULATOR
     ─────────────────────────────────────────────────────────── */
  (function roi() {
    const staff = $("#roiStaff");
    if (!staff) return;
    const calls = $("#roiCalls"), instr = $("#roiInstr"), fee = $("#roiFee");
    const out = {
      staff: $("#roiStaffVal"), calls: $("#roiCallsVal"),
      instr: $("#roiInstrVal"), fee: $("#roiFeeVal"),
      hours: $("#outHours"), leads: $("#outLeads"),
      revenue: $("#outRevenue"), growth: $("#outGrowth"),
    };
    const prev = { hours: 0, leads: 0, revenue: 0, growth: 0 };

    function compute() {
      const S = +staff.value, C = +calls.value, I = +instr.value, F = +fee.value;
      out.staff.textContent = S;
      out.calls.textContent = fmt(C);
      out.instr.textContent = I;
      out.fee.textContent = fmt(F);

      const callsPerMonth = C * 4.33;
      /* Ava fully handles ~70% of inbound; ~10 min handling+admin per call,
         plus ~3h of progression admin per instruction. */
      const hours = (callsPerMonth * 10 * 0.7) / 60 + I * 3;
      /* ~24% of calls unanswered industry-wide; ~38% are new enquiries. */
      const leads = C * 52 * 0.24 * 0.38;
      /* ~9% of recovered leads → appraisal, ~45% win rate. */
      const wins = leads * 0.09 * 0.45;
      const revenue = wins * F;
      const growth = (wins / 12 / I) * 100;

      tween(out.hours, prev.hours, hours, { dur: 600 });
      tween(out.leads, prev.leads, leads, { dur: 600 });
      tween(out.revenue, prev.revenue, revenue, { dur: 600 });
      tween(out.growth, prev.growth, growth, { dur: 600 });
      Object.assign(prev, { hours, leads, revenue, growth });
    }

    [staff, calls, instr, fee].forEach((el) => el.addEventListener("input", compute));

    let armed = false;
    new IntersectionObserver((en) => {
      if (en[0].isIntersecting && !armed) { armed = true; compute(); }
    }, { threshold: 0.3 }).observe($("#roi"));
  })();

  /* ───────────────────────────────────────────────────────────
     MISC
     ─────────────────────────────────────────────────────────── */
  $("#year").textContent = new Date().getFullYear();

  runIntro();
  onScroll();
})();
