/* ============================================================
   FABRICATR — main.js
   Nav, menu, reveals, capabilities, form, details.
   Easing system: cubic-bezier(0.16, 1, 0.3, 1)
   ============================================================ */
(function () {
  "use strict";

  var doc = document;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Nav: hide on scroll down, show on scroll up ---------- */
  var nav = doc.querySelector(".site-nav");
  var lastY = window.scrollY;
  if (nav) {
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      if (y > 120 && y > lastY && !doc.body.classList.contains("menu-open")) {
        nav.classList.add("is-hidden");
      } else {
        nav.classList.remove("is-hidden");
      }
      lastY = y;
    }, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  var menuBtn = doc.querySelector(".menu-btn");
  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = doc.body.classList.toggle("menu-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      doc.body.style.overflow = open ? "hidden" : "";
    });
    doc.querySelectorAll(".mobile-menu a").forEach(function (a) {
      a.addEventListener("click", function () {
        doc.body.classList.remove("menu-open");
        doc.body.style.overflow = "";
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && doc.body.classList.contains("menu-open")) {
        doc.body.classList.remove("menu-open");
        doc.body.style.overflow = "";
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Hero entrance (once per session, <1.2s) ---------- */
  var hero = doc.querySelector(".hero");
  if (hero) {
    var seen = false;
    try { seen = sessionStorage.getItem("fabr_hero_seen") === "1"; } catch (e) {}
    if (seen || reduceMotion) {
      hero.querySelectorAll("h1 .line > span").forEach(function (s) { s.style.transition = "none"; });
    }
    requestAnimationFrame(function () {
      hero.classList.add("is-in");
      try { sessionStorage.setItem("fabr_hero_seen", "1"); } catch (e) {}
    });
  }

  /* ---------- Scroll reveals ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add("in-view");
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  doc.querySelectorAll(".reveal, .step").forEach(function (el) { io.observe(el); });

  /* ---------- Capabilities accordion ---------- */
  doc.querySelectorAll(".cap-item").forEach(function (item) {
    var head = item.querySelector(".cap-head");
    if (!head) return;
    head.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      doc.querySelectorAll(".cap-item.open").forEach(function (o) {
        o.classList.remove("open");
        o.querySelector(".cap-head").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        head.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Marquee: duplicate track content for seamless loop ---------- */
  doc.querySelectorAll(".marquee-track").forEach(function (track) {
    track.innerHTML += track.innerHTML;
  });

  /* ---------- Image fallback → typographic placeholder ---------- */
  doc.querySelectorAll(".work-card .frame img, .case-hero-media img").forEach(function (img) {
    img.addEventListener("error", function () {
      var frame = img.closest(".frame");
      if (frame) frame.classList.add("no-img");
    });
  });

  /* ---------- Cursor dot (fine pointers only) ---------- */
  if (window.matchMedia("(pointer: fine)").matches && !reduceMotion) {
    var dot = doc.createElement("div");
    dot.className = "cursor-dot";
    dot.setAttribute("aria-hidden", "true");
    doc.body.appendChild(dot);
    var dx = 0, dy = 0, cx = 0, cy = 0, started = false;
    doc.addEventListener("pointermove", function (e) {
      dx = e.clientX; dy = e.clientY;
      if (!started) { started = true; cx = dx; cy = dy; doc.body.classList.add("has-cursor"); loop(); }
    });
    function loop() {
      cx += (dx - cx) * 0.22; cy += (dy - cy) * 0.22;
      dot.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    }
    doc.querySelectorAll("a, button, .cap-head").forEach(function (el) {
      el.addEventListener("pointerenter", function () { doc.body.classList.add("cursor-grow"); });
      el.addEventListener("pointerleave", function () { doc.body.classList.remove("cursor-grow"); });
    });
  }

  /* ---------- Grid overlay — press G (the bones) ---------- */
  var overlay = doc.createElement("div");
  overlay.className = "grid-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = '<div class="container">' + new Array(13).join("<div></div>") + "</div>";
  doc.body.appendChild(overlay);
  doc.addEventListener("keydown", function (e) {
    if ((e.key === "g" || e.key === "G") && !/input|textarea|select/i.test(doc.activeElement.tagName)) {
      doc.body.classList.toggle("show-grid");
    }
  });

  /* ---------- Studio clock (Europe/London) ---------- */
  var clock = doc.getElementById("ldn-clock");
  if (clock) {
    var tick = function () {
      try {
        clock.textContent = new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit", minute: "2-digit", second: "2-digit",
          hour12: false, timeZone: "Europe/London"
        }).format(new Date());
      } catch (e) { clock.textContent = ""; }
    };
    tick(); setInterval(tick, 1000);
  }

  /* ---------- Year ---------- */
  doc.querySelectorAll(".js-year").forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* ---------- Type lab (variable font, cursor-driven) ---------- */
  var lab = doc.querySelector(".type-lab");
  if (lab && !reduceMotion) {
    var host = lab.closest(".ai-demo") || lab;
    host.addEventListener("pointermove", function (e) {
      var r = host.getBoundingClientRect();
      var x = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
      var y = Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1);
      var wght = Math.round(200 + x * 700);
      var wdth = Math.round(72 + y * 53);
      lab.style.fontVariationSettings = '"wght" ' + wght + ', "wdth" ' + wdth;
      var read = lab.querySelector ? doc.getElementById("lab-read") : null;
      if (read) read.textContent = "wght " + wght + " / wdth " + wdth;
    });
  }

  /* ---------- Enquiry form ---------- */
  var form = doc.getElementById("project-form");
  if (form) {
    var status = doc.getElementById("form-status");
    var fieldOk = function (f) { f.classList.remove("err"); };
    var fieldErr = function (f) { f.classList.add("err"); };

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      /* Honeypot — silently drop bots */
      var hp = form.querySelector('[name="company_url"]');
      if (hp && hp.value) return;

      var ok = true;
      var name = form.querySelector('[name="name"]');
      var email = form.querySelector('[name="email"]');
      var details = form.querySelector('[name="details"]');

      [name, email, details].forEach(function (inp) {
        var f = inp.closest(".field");
        if (!inp.value.trim()) { fieldErr(f); ok = false; } else { fieldOk(f); }
      });
      if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        fieldErr(email.closest(".field")); ok = false;
      }

      if (!ok) {
        status.className = "form-status fail";
        status.textContent = "A couple of fields need attention — marked in orange above.";
        return;
      }

      var get = function (n) { var el = form.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ""; };
      var checked = function (n) {
        return Array.prototype.map.call(form.querySelectorAll('[name="' + n + '"]:checked'), function (c) { return c.value; }).join(", ");
      };

      var subject = "Project enquiry — " + get("name") + (get("company") ? " (" + get("company") + ")" : "");
      var body =
        "Name: " + get("name") + "\n" +
        "Company: " + (get("company") || "—") + "\n" +
        "Email: " + get("email") + "\n" +
        "Looking to create: " + (get("goal") || "—") + "\n" +
        "Services: " + (checked("services") || "—") + "\n" +
        "Budget: " + (checked("budget") || "—") + "\n" +
        "Timing: " + (get("timing") || "—") + "\n\n" +
        "Project details:\n" + get("details");

      window.location.href = "mailto:lewis@fabricatr.com?subject=" +
        encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

      status.className = "form-status ok";
      status.innerHTML = "<strong>Transmission ready.</strong> Your mail app has opened with everything filled in — press send and we’ll reply within 48 hours, usually faster. Nothing is stored on this site.";
    });
  }
})();
