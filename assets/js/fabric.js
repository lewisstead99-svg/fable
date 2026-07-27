/* ============================================================
   FABRICATR — fabric.js
   The Fabric: a field of nodes and threads. Every idea is a
   point, every connection a thread — pull one, everything moves.
   GPU-friendly canvas, paused offscreen, reduced-motion aware.
   Usage: <canvas data-fabric data-mode="light|dark"></canvas>
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("canvas[data-fabric]").forEach(function (canvas) {
    var ctx = canvas.getContext("2d");
    var mode = canvas.getAttribute("data-mode") || "light";
    var C = mode === "dark"
      ? { line: "rgba(242,239,230,0.10)", node: "rgba(242,239,230,0.32)", accent: "#4B58FF", signal: "#FF4D00", accentA: "rgba(75,88,255,0.55)" }
      : { line: "rgba(22,20,15,0.09)", node: "rgba(22,20,15,0.26)", accent: "#4B58FF", signal: "#FF4D00", accentA: "rgba(75,88,255,0.45)" };

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, nodes = [], cols = 0, rows = 0, gap = 96;
    var mouse = { x: -9999, y: -9999 };
    var running = false, raf = null, t = 0;

    function build() {
      var rect = canvas.parentElement.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      gap = Math.max(72, Math.min(120, W / 14));
      cols = Math.ceil(W / gap) + 2;
      rows = Math.ceil(H / gap) + 2;
      nodes = [];
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          nodes.push({
            ox: c * gap - gap / 2,
            oy: r * gap - gap / 2,
            x: 0, y: 0,
            ph: Math.random() * Math.PI * 2,
            sp: 0.4 + Math.random() * 0.7,
            blue: Math.random() < 0.045,
            sig: Math.random() < 0.008
          });
        }
      }
    }

    function step() {
      t += 0.008;
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var wx = Math.sin(t * n.sp + n.ph) * 6;
        var wy = Math.cos(t * n.sp * 0.9 + n.ph * 1.3) * 6;
        var tx = n.ox + wx, ty = n.oy + wy;
        var dx = tx - mouse.x, dy = ty - mouse.y;
        var d2 = dx * dx + dy * dy;
        var R = 190;
        if (d2 < R * R) {
          var d = Math.sqrt(d2) || 1;
          var f = (1 - d / R) * 34;
          tx += (dx / d) * f; ty += (dy / d) * f;
        }
        n.x += (tx - n.x) * 0.12;
        n.y += (ty - n.y) * 0.12;
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;

      /* Threads */
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var i = r * cols + c;
          var n = nodes[i];
          if (c < cols - 1) {
            var nr = nodes[i + 1];
            ctx.strokeStyle = (n.blue || nr.blue) ? C.accentA : C.line;
            ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(nr.x, nr.y); ctx.stroke();
          }
          if (r < rows - 1) {
            var nd = nodes[i + cols];
            ctx.strokeStyle = (n.blue || nd.blue) ? C.accentA : C.line;
            ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(nd.x, nd.y); ctx.stroke();
          }
        }
      }
      /* Nodes */
      for (var j = 0; j < nodes.length; j++) {
        var m = nodes[j];
        ctx.fillStyle = m.sig ? C.signal : (m.blue ? C.accent : C.node);
        var rad = m.sig ? 2.6 : (m.blue ? 2.2 : 1.4);
        ctx.beginPath(); ctx.arc(m.x, m.y, rad, 0, Math.PI * 2); ctx.fill();
      }
    }

    function loop() {
      if (!running) return;
      step(); draw();
      raf = requestAnimationFrame(loop);
    }

    function start() { if (!running && !reduceMotion) { running = true; loop(); } }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); }

    build();
    /* Settle nodes onto their grid instantly, then draw */
    nodes.forEach(function (n) { n.x = n.ox; n.y = n.oy; });
    draw();

    if (!reduceMotion) {
      var vis = new IntersectionObserver(function (en) {
        en.forEach(function (e) { e.isIntersecting ? start() : stop(); });
      }, { threshold: 0.02 });
      vis.observe(canvas);

      var host = canvas.closest("section") || canvas.parentElement;
      host.addEventListener("pointermove", function (e) {
        var rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      });
      host.addEventListener("pointerleave", function () { mouse.x = -9999; mouse.y = -9999; });
      document.addEventListener("visibilitychange", function () {
        document.hidden ? stop() : start();
      });
    }

    var rto;
    window.addEventListener("resize", function () {
      clearTimeout(rto);
      rto = setTimeout(function () { build(); nodes.forEach(function (n) { n.x = n.ox; n.y = n.oy; }); draw(); }, 160);
    });
  });
})();
