#!/usr/bin/env python3
"""FABRICATR — static generator.
Builds projects/*.html case studies, work.html index, sitemap.xml
and ../framer-kit/projects.csv from data/projects.json."""
import json, csv, os, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KIT = os.path.join(os.path.dirname(ROOT), "framer-kit")
os.makedirs(os.path.join(ROOT, "projects"), exist_ok=True)
os.makedirs(KIT, exist_ok=True)

data = json.load(open(os.path.join(ROOT, "data", "projects.json"), encoding="utf-8"))
projects = sorted(data["projects"], key=lambda p: p["order"])

E = html.escape

def nav(prefix, current=""):
    def cur(k): return ' aria-current="page"' if k == current else ""
    return f"""  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-nav">
    <div class="container nav-inner">
      <a class="brand" href="{prefix}index.html" aria-label="Fabricatr — home">
        <span class="brand-mark">Fabricatr<sup>®</sup></span>
      </a>
      <nav class="nav-links" aria-label="Primary">
        <a href="{prefix}work.html"{cur('work')}>Work</a>
        <a href="{prefix}services.html"{cur('services')}>Services</a>
        <a href="{prefix}about.html"{cur('about')}>About</a>
        <a href="{prefix}index.html#ai">AI Studio</a>
        <a href="{prefix}contact.html"{cur('contact')}>Contact</a>
        <a class="btn nav-cta" href="{prefix}contact.html">Start a project</a>
      </nav>
      <button class="menu-btn" aria-expanded="false" aria-controls="mobile-menu">
        <span>Menu</span><span class="bars" aria-hidden="true"></span>
      </button>
    </div>
  </header>
  <div class="mobile-menu" id="mobile-menu">
    <nav aria-label="Mobile">
      <a href="{prefix}work.html"><span class="no">01</span> Work</a>
      <a href="{prefix}services.html"><span class="no">02</span> Services</a>
      <a href="{prefix}about.html"><span class="no">03</span> About</a>
      <a href="{prefix}index.html#ai"><span class="no">04</span> AI Studio</a>
      <a href="{prefix}contact.html"><span class="no">05</span> Contact</a>
    </nav>
    <div class="mm-foot mono">
      <a href="mailto:lewis@fabricatr.com">lewis@fabricatr.com</a>
      <a href="https://wa.link/12v2dp">WhatsApp</a>
      <a href="https://instagram.com/madebyfabricatr">Instagram</a>
    </div>
  </div>"""

def footer(prefix):
    return f"""  <footer class="site-footer">
    <div class="container">
      <div class="foot-grid">
        <div class="foot-brand">
          <span class="brand-mark" style="font-size:1.3rem">Fabricatr<sup style="color:var(--blue)">®</sup></span>
          <p style="margin-top:14px">Independent creative studio. Brand, digital, AI, content and motion — fabricated as one system.</p>
        </div>
        <div>
          <h4 class="mono">Menu</h4>
          <ul>
            <li><a href="{prefix}work.html">Work</a></li>
            <li><a href="{prefix}services.html">Services</a></li>
            <li><a href="{prefix}about.html">About</a></li>
            <li><a href="{prefix}contact.html">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 class="mono">Elsewhere</h4>
          <ul>
            <li><a href="https://instagram.com/madebyfabricatr">Instagram — @madebyfabricatr</a></li>
            <li><a href="https://www.framer.com/@fabricatr/">Framer — @fabricatr</a></li>
            <li><a href="https://heytandem.co.uk">Tandem — our AI studio</a></li>
          </ul>
        </div>
        <div>
          <h4 class="mono">Contact</h4>
          <ul>
            <li><a href="mailto:lewis@fabricatr.com">lewis@fabricatr.com</a></li>
            <li><a href="https://wa.link/12v2dp">+44 7834 234 730 — WhatsApp</a></li>
            <li><span style="color:var(--bone-70)">Sandbanks — Poole, UK</span></li>
          </ul>
        </div>
      </div>
      <span class="wordmark-huge" aria-hidden="true">Fabricatr<span class="dot">.</span></span>
      <div class="foot-legal mono">
        <span>© <span class="js-year">2026</span> Fabricatr. All rights reserved.</span>
        <a href="{prefix}privacy.html">Privacy</a>
        <span>Set in Archivo, Instrument Serif &amp; IBM Plex Mono</span>
        <span>LDN — <span id="ldn-clock">--:--:--</span></span>
      </div>
    </div>
  </footer>
  <script src="{prefix}assets/js/main.js" defer></script>
  <script src="{prefix}assets/js/fabric.js" defer></script>"""

def head(title, desc, canonical, image, prefix):
    return f"""<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{E(title)}</title>
  <meta name="description" content="{E(desc)}">
  <link rel="canonical" href="{canonical}">
  <meta name="theme-color" content="#F2EFE6">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{canonical}">
  <meta property="og:title" content="{E(title)}">
  <meta property="og:description" content="{E(desc)}">
  <meta property="og:image" content="{image}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="{image}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{prefix}assets/css/style.css">
</head>
<body>"""

def media_block(p):
    m = p["media"]
    ph = f'<div class="ph" aria-hidden="true"><span>{E(p["name"])}</span></div>'
    if m["type"] == "video":
        inner = (f'<video src="{m["src"]}" poster="{m.get("poster","")}" autoplay muted loop playsinline '
                 f'aria-label="{E(m["alt"])}"></video>')
    else:
        inner = f'<img src="{m["src"]}" alt="{E(m["alt"])}" loading="eager" fetchpriority="high">{ph}'
    return f"""      <figure class="case-hero-media reveal" data-delay="1">
        <div class="frame">{inner}</div>
        <figcaption class="mono"><span>{E(m["caption"])}</span><span>{E(p["file_no"])}</span></figcaption>
      </figure>"""

def case_page(p, nxt):
    prefix = "../"
    canonical = f"https://fabricatr.com/projects/{p['slug']}"
    og = p["media"].get("poster") or p["media"]["src"]
    services_meta = ", ".join(p["services"])
    live = ""
    if p.get("live"):
        live = f'<div><span class="k mono">Live</span><span class="v"><a class="tlink" href="{p["live"]["url"]}">{E(p["live"]["label"])} ↗</a></span></div>'
    focus_items = "\n".join(
        f'            <li><span class="mono">{i+1:02d}</span><span>{E(f)}</span></li>'
        for i, f in enumerate(p["focus"]))
    context_ps = "\n".join(f'            <p>{E(t)}</p>' for t in p["context"])
    approach_ps = "\n".join(f'            <p>{E(t)}</p>' for t in p["approach"])
    chips = "\n".join(f'            <span class="chip">{E(d)}</span>' for d in p["delivered"])
    outcome_live = ""
    if p.get("live"):
        outcome_live = f'\n            <p style="margin-top:8px"><a class="btn btn--ghost" href="{p["live"]["url"]}">Visit the live site <span class="arrow">↗</span></a></p>'

    schema = json.dumps({
        "@context": "https://schema.org", "@type": "CreativeWork",
        "name": p["name"], "headline": p["summary"], "url": canonical,
        "datePublished": p["year"][:4], "genre": p["sector"],
        "creator": {"@type": "Organization", "name": "Fabricatr", "url": "https://fabricatr.com/"}
    }, ensure_ascii=False)

    return f"""{head(p["seo"]["title"], p["seo"]["desc"], canonical, og, prefix)}
  <script type="application/ld+json">{schema}</script>
{nav(prefix, "work")}
  <main id="main">
    <section class="page-hero">
      <div class="container">
        <p class="crumbs mono"><a class="tlink" href="../work.html">Work</a> <span class="sep">/</span> <span>{E(p["file_no"])}</span> <span class="sep">/</span> <span>{E(p["sector"])}</span></p>
        <h1 class="display reveal">{E(p["name"])}</h1>
        <p class="lead reveal" data-delay="1" style="font-family:var(--f-serif);font-style:italic;font-size:clamp(1.35rem,2.6vw,2rem);max-width:26em">“{E(p["one_liner"])}”</p>
        <div class="case-meta reveal" data-delay="2">
          <div><span class="k mono">Client</span><span class="v">{E(p["client"])}</span></div>
          <div><span class="k mono">Sector</span><span class="v">{E(p["sector"])}</span></div>
          <div><span class="k mono">Year</span><span class="v">{E(p["year"])}</span></div>
          <div><span class="k mono">Services</span><span class="v">{E(services_meta)}</span></div>
          {live if live else '<div><span class="k mono">Status</span><span class="v">Shipped</span></div>'}
        </div>
{media_block(p)}
      </div>
    </section>

    <section class="section--tight">
      <div class="container">
        <div class="case-section">
          <div class="cs-label mono"><span class="idx">01</span>Context</div>
          <div class="case-body">
{context_ps}
          </div>
        </div>
        <div class="case-section">
          <div class="cs-label mono"><span class="idx">02</span>The challenge</div>
          <div class="case-body">
            <p>{E(p["challenge_intro"])}</p>
            <ul class="focus-list">
{focus_items}
            </ul>
          </div>
        </div>
        <div class="case-section">
          <div class="cs-label mono"><span class="idx">03</span>The approach</div>
          <div class="case-body">
{approach_ps}
          </div>
        </div>
        <div class="case-section">
          <div class="cs-label mono"><span class="idx">04</span>Delivered</div>
          <div class="case-body">
            <div class="chip-row">
{chips}
            </div>
          </div>
        </div>
        <div class="case-section">
          <div class="cs-label mono"><span class="idx">05</span>Outcome</div>
          <div class="case-body">
            <p><strong>{E(p["outcome"])}</strong></p>{outcome_live}
          </div>
        </div>
      </div>
    </section>

    <section class="next-project">
      <div class="container">
        <a href="{nxt['slug']}.html">
          <span class="np-k mono">Next case file — {E(nxt['file_no'])}</span>
          <span class="np-n">{E(nxt['name'])} →</span>
        </a>
      </div>
    </section>

    <section class="section final-cta section--tight" style="padding-block:clamp(56px,8vw,112px)">
      <div class="container">
        <h2 class="reveal" style="font-size:clamp(2rem,5vw,4rem)">Want work like this?<br><span class="em">Start a project.</span></h2>
        <div class="cta-row reveal" data-delay="1">
          <a class="btn" href="../contact.html">Start a project <span class="arrow">→</span></a>
          <a class="btn btn--ghost" href="mailto:lewis@fabricatr.com">Email Lewis</a>
        </div>
      </div>
    </section>
  </main>
{footer(prefix)}
</body>
</html>
"""

# ---------- Write case pages ----------
for i, p in enumerate(projects):
    nxt = projects[(i + 1) % len(projects)]
    path = os.path.join(ROOT, "projects", p["slug"] + ".html")
    open(path, "w", encoding="utf-8").write(case_page(p, nxt))
    print("wrote", path)

# ---------- work.html ----------
featured = [p for p in projects if p["featured"] and p["slug"] != "tandem"]
tandem = next(p for p in projects if p["slug"] == "tandem")
spans = ["span-7", "span-5 push-down", "span-6", "span-6 push-down", "span-7"]
cards = ""
for i, p in enumerate(featured[:5]):
    m = p["media"]; img = m.get("poster") or m["src"]
    cards += f"""          <a class="work-card {spans[i % len(spans)]} reveal" href="projects/{p['slug']}.html">
            <div class="frame">
              <img src="{img}" alt="{E(m['alt'])}" loading="lazy">
              <div class="ph" aria-hidden="true"><span>{E(p['name'])}</span></div>
              <span class="fig mono">{E(m['caption'])}</span>
            </div>
            <div class="cap">
              <div class="row1"><span class="name">{E(p['name'])} <span class="go">→</span></span><span class="meta mono">{E(p['year'])}</span></div>
              <span class="one-liner">{E(p['one_liner'])}</span>
              <span class="meta mono">{E(p['sector'])} — {E(' / '.join(p['services'][:3]))}</span>
            </div>
          </a>
"""

rows = ""
for i, p in enumerate(projects):
    rows += f"""          <a class="index-row" href="projects/{p['slug']}.html">
            <span class="no mono">{E(p['file_no'])}</span>
            <span class="nm">{E(p['name'])}</span>
            <span class="ln">{E(p['one_liner'])}</span>
            <span class="sv mono">{E(p['sector'])}</span>
            <span class="yr mono">{E(p['year'])}</span>
            <span class="ar">→</span>
          </a>
"""

work_html = f"""{head("Work — Selected Fabrications | Fabricatr",
  "Brands, websites and products fabricated by Fabricatr — Taylored, Key Drummond, Tandem, ReShot, Drift Collective, H+S Homebound, Davidson Estates and more.",
  "https://fabricatr.com/work", "https://fabricatr.com/og-image.png", "")}
{nav("", "work")}
  <main id="main">
    <section class="page-hero">
      <div class="container">
        <p class="crumbs mono"><span>Work</span> <span class="sep">/</span> <span>Selected fabrications</span> <span class="sep">/</span> <span>2024 — 2026</span></p>
        <h1 class="display reveal">Work that refuses<br><span class="em">to be wallpaper.</span></h1>
        <p class="lead reveal" data-delay="1">Brands, websites and products fabricated for people who’d rather be remembered than merely seen. Each one a world; every detail on purpose.</p>
        <p class="mono reveal" data-delay="2" style="margin-top:20px;color:var(--ink-50)">11 case files — updated 2026</p>
      </div>
    </section>

    <section class="section--tight">
      <div class="container">
        <a class="work-card span-12 reveal" href="projects/tandem.html" style="display:block;margin-bottom:clamp(48px,6vw,96px)">
          <div class="frame" style="aspect-ratio:21/9">
            <video src="{tandem['media']['src']}" poster="{tandem['media']['poster']}" autoplay muted loop playsinline aria-label="Tandem website in motion"></video>
            <span class="fig mono">Featured — {tandem['file_no']}</span>
          </div>
          <div class="cap">
            <div class="row1"><span class="name">Tandem <span class="go">→</span></span><span class="meta mono">2026</span></div>
            <span class="one-liner">{E(tandem['one_liner'])}</span>
            <span class="meta mono">AI studio — Brand — Web</span>
          </div>
        </a>
        <div class="work-grid">
{cards}        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="kicker mono">
          <span><span class="idx">Index</span> — All projects</span>
          <span>Sorted by file number</span>
        </div>
        <div class="index-list">
{rows}        </div>
      </div>
    </section>

    <section class="section final-cta">
      <div class="container">
        <div class="kicker mono">
          <span><span class="idx">Next</span> — Your name in this index</span>
          <span>Response within 48h</span>
        </div>
        <h2 class="reveal">Let’s build something<br><span class="em">worth remembering.</span></h2>
        <div class="cta-row reveal" data-delay="1">
          <a class="btn" href="contact.html">Start a project <span class="arrow">→</span></a>
          <a class="btn btn--ghost" href="mailto:lewis@fabricatr.com">Email Lewis</a>
          <a class="btn btn--ghost" href="https://wa.link/12v2dp">WhatsApp</a>
        </div>
      </div>
    </section>
  </main>
{footer("")}
</body>
</html>
"""
open(os.path.join(ROOT, "work.html"), "w", encoding="utf-8").write(work_html)
print("wrote work.html")

# ---------- Framer CMS CSV ----------
csv_path = os.path.join(KIT, "projects.csv")
with open(csv_path, "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["Title","Slug","Client","Sector","Year","Services","Short summary","Hero statement",
                "Hero image","Gallery images","Challenge","Approach","Creative direction","Deliverables",
                "Results","Website URL","Featured","Project order","Next project","Accent colour",
                "SEO title","Meta description","Social image"])
    for i, p in enumerate(projects):
        nxt = projects[(i + 1) % len(projects)]
        hero_img = p["media"].get("poster") or p["media"]["src"]
        challenge = p["challenge_intro"] + "\n\nKey areas of focus:\n" + "\n".join("— " + x for x in p["focus"])
        approach = p["approach"][0]
        creative = p["approach"][1] if len(p["approach"]) > 1 else ""
        w.writerow([p["name"], p["slug"], p["client"], p["sector"], p["year"],
                    ", ".join(p["services"]), p["summary"], p["one_liner"],
                    hero_img, "", challenge, approach, creative,
                    ", ".join(p["delivered"]), p["outcome"],
                    p.get("live", {}).get("url",""),
                    "Yes" if p["featured"] else "No", p["order"], nxt["name"],
                    "#4B58FF", p["seo"]["title"], p["seo"]["desc"], hero_img])
print("wrote", csv_path)

# ---------- sitemap + robots ----------
base = "https://fabricatr.com"
urls = ["/", "/work", "/services", "/about", "/contact", "/privacy"] + [f"/projects/{p['slug']}" for p in projects]
sm = ['<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for u in urls:
    sm.append(f"  <url><loc>{base}{u}</loc></url>")
sm.append("</urlset>")
open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8").write("\n".join(sm))
open(os.path.join(ROOT, "robots.txt"), "w", encoding="utf-8").write(
    "User-agent: *\nAllow: /\n\nSitemap: https://fabricatr.com/sitemap.xml\n")
print("wrote sitemap.xml, robots.txt")
print("DONE —", len(projects), "case studies")
