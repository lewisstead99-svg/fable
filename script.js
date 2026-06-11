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

  function finishIntro() {
    if (introDone) return;
    introDone = true;
    intro.classList.add("lift");
    document.body.classList.remove("no-scroll");
    $("#nav").classList.add("show");
    $("#hero").classList.add("live");
    setTimeout(() => intro.classList.add("gone"), 1100);
  }

  function runIntro() {
    if (reduced || !intro) {
      document.body.classList.remove("no-scroll");
      $("#nav").classList.add("show");
      $("#hero").classList.add("live");
      if (intro) intro.classList.add("gone");
      introDone = true;
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
     INTERACTIVE DEMO — scenario engine
     ─────────────────────────────────────────────────────────── */
  const demo = (() => {
    const stage = $("#demoStage");
    if (!stage) return null;
    const transcript = $("#stageTranscript"), actions = $("#stageActions"),
          toasts = $("#stageToasts"), wave = $("#callWave"),
          status = $("#demoStatus"), triggers = $$(".trigger");
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
        return li;
      },
      resolve(li, iconName, html) {
        li.classList.remove("thinking");
        li.classList.add("done");
        li.innerHTML = icon("i-check") + `<span>${html}</span>`;
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
      wave(on) { wave.classList.toggle("on", on); },
      status(text, isBusy) {
        status.innerHTML = `<span class="pulse-dot" aria-hidden="true"></span>${text}`;
        status.classList.toggle("busy", !!isBusy);
        stage.classList.toggle("active", !!isBusy);
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
      ["i-phone", "Missed call — vendor", 4, 6, true],
      ["i-shield", "AML overdue — Elm Rd", 38, 2, true],
      ["i-phone", "Call queue: 11 waiting", 70, 8, true],
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

    const tasks = TASKS.map(([icon, label, x, y, alert]) => {
      const el = document.createElement("div");
      el.className = "story-task" + (alert ? " story-task--alert" : "");
      el.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#${icon}"/></svg><span>${label}</span>`;
      el.style.left = x + "%";
      el.style.top = y + "%";
      el.style.opacity = reduced ? 1 : 0;
      board.append(el);
      return { el, x, y };
    });

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
  (function night() {
    const stage = $("#nightStage");
    if (!stage) return;
    const clock = $("#nightClock"), events = $$(".night-ev", stage), fin = $("#nightFinal");
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
        fin.classList.add("on");
        await wait(3400);
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
    }
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
