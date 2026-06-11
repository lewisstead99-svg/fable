# HiAva — Say hi to Ava

A digital product-launch experience for **HiAva**, the AI employee for estate
and lettings agencies. Smart, calm support for every busy agency.

Pure white canvas, navy ink, a single coral signal colour — and motion doing
all the talking. No gradients, no dark sections, no stock anything.

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
| `index.html` | Full page structure, inline SVG icon set, all copy |
| `styles.css` | Design system, every animation & responsive layout |
| `script.js` | Interaction engine (vanilla JS, zero libraries) |

## The experience

- **Intro sequence** — "Estate Agency" → "Reimagined" → "Ava is online." while
  a particle network converges and the HiAva wordmark assembles itself.
- **Hero** — mouse-reactive neural-network canvas, word-by-word headline rise,
  magnetic CTAs, and a floating live console where Ava answers calls, books
  valuations and clears AML in real time.
- **Interactive demo** — seven trigger buttons fire scripted scenarios
  (seller lead, landlord enquiry, AML check, viewing request, vendor update,
  missed call, valuation booking). Each plays out across a live transcript,
  Ava's decision stream, the diary, the CRM and animated KPIs.
- **Scroll story** — a pinned scene where agency chaos piles up, the office
  load meter goes critical, then Ava arrives and every task flies into her.
- **Capabilities** — ten tilting cards with counting stats.
- **Command centre** — live-ticking KPIs, weekly valuation bars, an AML
  completion ring and a rolling decision stream.
- **How it works** — a six-step journey with a line that draws itself.
- **While you're sleeping…** — an auto-looping 02:17am timeline: call answered,
  lead qualified, valuation booked, CRM updated, AML started, negotiator
  notified.
- **ROI calculator** — four sliders, live-tweening outputs, honest assumptions.
- **Finale** — "The future agency already has an AI employee. Meet Ava."

Cursor glow, magnetic buttons, 3D card tilt, infinite marquees, animated
counters and `prefers-reduced-motion` support throughout. Fully responsive
with touch-specific behaviour on mobile.

## Brand

| Token | Value |
| --- | --- |
| Coral (action) | `#FF585A` |
| Navy (ink) | `#001639` |
| Canvas | `#FFFFFF` |
| Type | Inter |
