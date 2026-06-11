# VESPER — generative production studio (demo site)

A fully self-contained, single-page marketing site for **Vesper**, a fictional
AI product that turns one sentence into finished films, brand systems, and
interfaces. Built as a visual showcase: dark cinematic design, glassmorphism,
canvas starfield, scroll-driven reveals, and a dozen interactive moments.

## Run it

No build step, no dependencies. Open `index.html` in a browser, or serve the
folder:

```sh
python3 -m http.server 8000
# → http://localhost:8000
```

## What's inside

| File | Purpose |
| --- | --- |
| `index.html` | Semantic markup for all 12 sections |
| `styles.css` | Design system, animations, responsive layout |
| `script.js` | Starfield, typing engine, tilt, counters, tabs, carousel, parallax |

## Highlights

- Intro loader → staggered hero headline → live "render" mockup with typing prompt loop
- Mouse-follow glow, 3D tilt, magnetic CTAs, spotlight card borders
- Interactive engine demo (Film / Identity / Interface / Score tabs)
- Animated dashboard with SVG chart draw-on-scroll
- Testimonial carousel, annual/monthly pricing toggle, smooth FAQ accordion
- Fully responsive, `prefers-reduced-motion` respected, no external assets
  beyond Google Fonts (graceful fallback to system fonts)
