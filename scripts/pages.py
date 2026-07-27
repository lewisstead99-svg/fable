#!/usr/bin/env python3
"""FABRICATR — builds services, about, contact, privacy, 404 pages."""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def head(title, desc, canonical):
    return f"""<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <link rel="canonical" href="{canonical}">
  <meta name="theme-color" content="#F2EFE6">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{canonical}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:image" content="https://fabricatr.com/og-image.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="https://fabricatr.com/og-image.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>"""

def nav(current=""):
    def cur(k): return ' aria-current="page"' if k == current else ""
    return f"""  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-nav">
    <div class="container nav-inner">
      <a class="brand" href="index.html" aria-label="Fabricatr — home">
        <span class="brand-mark">Fabricatr<sup>®</sup></span>
      </a>
      <nav class="nav-links" aria-label="Primary">
        <a href="work.html"{cur('work')}>Work</a>
        <a href="services.html"{cur('services')}>Services</a>
        <a href="about.html"{cur('about')}>About</a>
        <a href="index.html#ai">AI Studio</a>
        <a href="contact.html"{cur('contact')}>Contact</a>
        <a class="btn nav-cta" href="contact.html">Start a project</a>
      </nav>
      <button class="menu-btn" aria-expanded="false" aria-controls="mobile-menu">
        <span>Menu</span><span class="bars" aria-hidden="true"></span>
      </button>
    </div>
  </header>
  <div class="mobile-menu" id="mobile-menu">
    <nav aria-label="Mobile">
      <a href="work.html"><span class="no">01</span> Work</a>
      <a href="services.html"><span class="no">02</span> Services</a>
      <a href="about.html"><span class="no">03</span> About</a>
      <a href="index.html#ai"><span class="no">04</span> AI Studio</a>
      <a href="contact.html"><span class="no">05</span> Contact</a>
    </nav>
    <div class="mm-foot mono">
      <a href="mailto:lewis@fabricatr.com">lewis@fabricatr.com</a>
      <a href="https://wa.link/12v2dp">WhatsApp</a>
      <a href="https://instagram.com/madebyfabricatr">Instagram</a>
    </div>
  </div>"""

FOOTER = """  <footer class="site-footer">
    <div class="container">
      <div class="foot-grid">
        <div class="foot-brand">
          <span class="brand-mark" style="font-size:1.3rem">Fabricatr<sup style="color:var(--blue)">®</sup></span>
          <p style="margin-top:14px">Independent creative studio. Brand, digital, AI, content and motion — fabricated as one system.</p>
        </div>
        <div>
          <h4 class="mono">Menu</h4>
          <ul>
            <li><a href="work.html">Work</a></li>
            <li><a href="services.html">Services</a></li>
            <li><a href="about.html">About</a></li>
            <li><a href="contact.html">Contact</a></li>
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
        <a href="privacy.html">Privacy</a>
        <span>Set in Archivo, Instrument Serif &amp; IBM Plex Mono</span>
        <span>LDN — <span id="ldn-clock">--:--:--</span></span>
      </div>
    </div>
  </footer>
  <script src="assets/js/main.js" defer></script>
  <script src="assets/js/fabric.js" defer></script>
</body>
</html>"""

def dept(no, anchor, title, desc, items, proof):
    lis = "\n".join(f'          <li><span>{a}</span><span class="mono">{b}</span></li>' for a, b in items)
    return f"""      <article class="dept" id="{anchor}">
        <span class="dno mono">{no}</span>
        <div>
          <h2>{title}</h2>
          <p class="dd">{desc}</p>
          <p class="mono dproof">In the work — {proof}</p>
        </div>
        <ul>
{lis}
        </ul>
      </article>"""

# ============================================================ SERVICES
services = head("Services — Brand, Digital, AI, Content & Motion | Fabricatr",
  "Five connected departments under one studio: brand identity, website design and Framer development, AI products, content and campaigns, motion and interaction design.",
  "https://fabricatr.com/services") + "\n" + nav("services") + f"""
  <main id="main">
    <section class="page-hero">
      <div class="container">
        <p class="crumbs mono"><span>Services</span> <span class="sep">/</span> <span>Five departments, one obsession</span></p>
        <h1 class="display reveal">Five ways to be<br><span class="em">unforgettable.</span></h1>
        <p class="lead reveal" data-delay="1">No decks of icons, no service grids for the sake of it. Five connected departments — so strategy, identity, digital and content are fabricated as one system, not bought as separate parts.</p>
      </div>
    </section>

    <section class="section--tight">
      <div class="container">
{dept("01", "brand", "Brand",
  "Identities engineered to be remembered. Strategy, naming and identity systems with the rules that keep them coherent at every size, on every surface. Timeless beats trendy.",
  [("Brand strategy &amp; positioning","Foundation"),("Naming &amp; verbal identity","Language"),("Identity design &amp; systems","Visual"),("Guidelines &amp; brand worlds","Governance"),("Art direction","Direction")],
  '<a class="tlink" href="projects/taylored.html">Taylored</a>, <a class="tlink" href="projects/drift.html">Drift</a>, <a class="tlink" href="projects/hs-homebound.html">H+S Homebound</a>')}
{dept("02", "digital", "Digital",
  "Websites that behave like places, not pages — designed and built by the same hands, from first wireframe to last easing curve.",
  [("Website design &amp; build","Core"),("Framer development","Platform"),("E-commerce","Commerce"),("Interfaces &amp; product UX","Product"),("Creative development","Craft")],
  '<a class="tlink" href="projects/davidson-estates.html">Davidson Estates</a>, <a class="tlink" href="projects/123-refurbs.html">123 Refurbs</a>, <a class="tlink" href="projects/uae-greetings.html">UAE Greetings</a>')}
{dept("03", "ai", "AI",
  "Products where intelligence feels like intuition. We design AI interfaces and tools, prototype automations, and ship our own products — so the advice comes from operators, not observers.",
  [("AI product design","Product"),("Interfaces &amp; agent UX","Interface"),("Automation concepts","Systems"),("Prototyping &amp; R&amp;D","Lab"),("Creative technology","Edge")],
  '<a class="tlink" href="projects/tandem.html">Tandem</a>, <a class="tlink" href="projects/reshot.html">ReShot</a>')}
{dept("04", "content", "Content",
  "Campaigns with pull. Property marketing, social content systems, photography direction and editorial design that keep a brand consistent long after launch day.",
  [("Campaign design","Push"),("Property marketing","Sector"),("Social content systems","Always-on"),("Photography direction","Image"),("Editorial &amp; print","Craft")],
  '<a class="tlink" href="projects/key-drummond.html">Key Drummond</a>, <a class="tlink" href="projects/ankers-rawlings.html">Ankers + Rawlings</a>')}
{dept("05", "motion", "Motion",
  "Interfaces with a pulse. Interaction design, animation, 3D and transitions — every easing curve on purpose, nothing moving just because it can.",
  [("Interaction design","Feel"),("Animation &amp; motion systems","Move"),("3D &amp; visual systems","Depth"),("Transitions &amp; micro-detail","Polish")],
  '<a class="tlink" href="projects/tandem.html">Tandem</a>, <a class="tlink" href="projects/reshot.html">ReShot</a>')}
      </div>
    </section>

    <section class="section" style="background:var(--bone-2)">
      <div class="container">
        <div class="kicker mono">
          <span><span class="idx">Working together</span> — Straight answers</span>
          <span>No bloated agency language</span>
        </div>
        <div class="cred-cols">
          <div>
            <h2 class="display reveal" style="font-size:clamp(1.8rem,3.6vw,3rem)">Projects first.<br><span class="em">Support when you want it.</span></h2>
            <p class="lead reveal" data-delay="1" style="margin-top:24px">Most of our work is project-based — brand, web, campaigns and products with a defined outcome. After launch, many clients keep us on for content systems, campaigns and creative support. Both start the same way: a conversation.</p>
          </div>
          <div class="faq reveal" data-delay="1">
            <details>
              <summary>How long does a typical project take?</summary>
              <p>Most brand projects complete in four to six weeks. Full brand and website builds typically run six to eight weeks depending on scope.</p>
            </details>
            <details>
              <summary>Do you work with clients abroad?</summary>
              <p>Yes. The studio is in Sandbanks, UK — the work happens everywhere. Calls, reviews and delivery all run remotely without friction.</p>
            </details>
            <details>
              <summary>What happens after launch?</summary>
              <p>You get production-ready files and a system you can actually use. If you want us to stay — campaigns, content, iterations — we offer ongoing creative support.</p>
            </details>
            <details>
              <summary>Who will I actually work with?</summary>
              <p>The founder. Senior creative involvement on every project, with trusted specialists brought in when a build needs more hands.</p>
            </details>
            <details>
              <summary>Can I ask for revisions?</summary>
              <p>Yes — refinement is part of the process, not an extra. We keep working until every decision earns its place.</p>
            </details>
          </div>
        </div>
      </div>
    </section>

    <section class="section final-cta">
      <div class="container">
        <h2 class="reveal">Let’s build something<br><span class="em">worth remembering.</span></h2>
        <div class="cta-row reveal" data-delay="1">
          <a class="btn" href="contact.html">Start a project <span class="arrow">→</span></a>
          <a class="btn btn--ghost" href="work.html">View work</a>
        </div>
      </div>
    </section>
  </main>
""" + FOOTER

# ============================================================ ABOUT
about = head("About — Small by Design | Fabricatr",
  "Fabricatr is an independent creative studio in Sandbanks, UK. Founder-led, fast-moving, and built for businesses that refuse to blend in.",
  "https://fabricatr.com/about") + "\n" + nav("about") + """
  <main id="main">
    <section class="page-hero">
      <div class="container">
        <p class="crumbs mono"><span>About</span> <span class="sep">/</span> <span>The studio</span> <span class="sep">/</span> <span>Sandbanks, UK</span></p>
        <h1 class="display reveal">Small by design.<br><span class="em">Built to move quickly.</span></h1>
        <p class="lead reveal" data-delay="1">Fabricatr is an independent creative studio working directly with ambitious businesses — no bloated process, no unnecessary layers, no account managers translating your brief.</p>
      </div>
    </section>

    <section class="section--tight">
      <div class="container">
        <div class="case-section">
          <div class="cs-label mono"><span class="idx">01</span>Why we exist</div>
          <div class="case-body">
            <p>Most businesses don’t have a design problem. They have a coherence problem — a logo from one supplier, a website from another, social content from a third, and nothing pulling in the same direction.</p>
            <p>Fabricatr exists to fix that. Strategy, identity, digital, content and motion under one roof, fabricated as one system. Fewer layers means faster decisions, stronger consistency, and work that actually ships.</p>
          </div>
        </div>
        <div class="case-section">
          <div class="cs-label mono"><span class="idx">02</span>How we work</div>
          <div class="case-body">
            <p><strong>Direct communication.</strong> You work with the people doing the work — all the time. Decisions happen in days, not steering meetings.</p>
            <p><strong>Senior creative on everything.</strong> No juniors learning on your budget. When a project needs more hands, we bring in trusted specialists — and keep one visual direction.</p>
            <p>We’re not trying to be the biggest studio. We’re here to be the one you can depend on — the team you come back to.</p>
          </div>
        </div>
        <div class="case-section">
          <div class="cs-label mono"><span class="idx">03</span>The people</div>
          <div class="case-body">
            <div class="client-index">
              <div class="client-row"><span class="cn">Lewis Steadman</span><span class="cs mono">Founder + Creative Lead</span><span class="cs mono">FBR-01</span></div>
              <div class="client-row"><span class="cn">Kyran O’Neill</span><span class="cs mono">Ads + PPC</span><span class="cs mono">FBR-02</span></div>
              <div class="client-row"><span class="cn">Trusted specialists</span><span class="cs mono">On demand, per project</span><span class="cs mono">FBR-XX</span></div>
            </div>
          </div>
        </div>
        <div class="case-section">
          <div class="cs-label mono"><span class="idx">04</span>What we stand for</div>
          <div class="case-body">
            <ul class="focus-list">
              <li><span class="mono">01</span><span><strong>Quality, no shortcuts.</strong> Every output crafted with intention, from structure to final polish.</span></li>
              <li><span class="mono">02</span><span><strong>Speed with clarity.</strong> Fast doesn’t mean chaotic — everything moves forward in a structured way.</span></li>
              <li><span class="mono">03</span><span><strong>High ownership.</strong> Small team, no handoffs, nothing lost in translation.</span></li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="section dark" aria-label="What we believe">
      <div class="container">
        <div class="kicker mono">
          <span><span class="idx">Manifesto</span> — Abridged</span>
          <span>The whole thing is longer. And louder.</span>
        </div>
        <h2 class="statement reveal" style="font-size:clamp(1.7rem,4vw,3.4rem);font-weight:800;letter-spacing:-0.02em;line-height:1.15;max-width:26ch;text-transform:none">
          Attention is the <em class="serif-i" style="color:var(--orange)">scarcest material</em> on earth. Most brands are wallpaper — politely ignored, every single day. Design is the difference between being seen and being <em class="serif-i" style="color:var(--blue);filter:brightness(1.3)">remembered.</em>
        </h2>
      </div>
    </section>

    <section class="section final-cta">
      <div class="container">
        <h2 class="reveal">Sound like your kind<br><span class="em">of studio?</span></h2>
        <div class="cta-row reveal" data-delay="1">
          <a class="btn" href="contact.html">Start a project <span class="arrow">→</span></a>
          <a class="btn btn--ghost" href="work.html">See the work first</a>
        </div>
      </div>
    </section>
  </main>
""" + FOOTER

# ============================================================ CONTACT
contact = head("Contact — Start a Project | Fabricatr",
  "Start a project with Fabricatr. Tell us what you're making — brand, website, campaign or AI product — and we'll bring the questions. Response within 48 hours.",
  "https://fabricatr.com/contact") + "\n" + nav("contact") + """
  <main id="main">
    <section class="page-hero">
      <div class="container">
        <p class="crumbs mono"><span>Contact</span> <span class="sep">/</span> <span>Transmission</span> <span class="sep">/</span> <span>Response within 48h — usually faster</span></p>
        <h1 class="display reveal">Let’s build something<br><span class="em">worth remembering.</span></h1>
        <p class="lead reveal" data-delay="1">Tell us what you’re making. A few honest sentences beat a perfect brief — we’ll bring the questions.</p>
      </div>
    </section>

    <section class="section--tight" style="padding-bottom:clamp(72px,10vw,144px)">
      <div class="container">
        <div class="contact-grid">
          <form id="project-form" class="form-grid" novalidate>
            <div class="field-row">
              <div class="field">
                <label for="f-name">Name *</label>
                <input id="f-name" name="name" type="text" autocomplete="name" required>
                <span class="err-msg">Your name, so we know who’s writing</span>
              </div>
              <div class="field">
                <label for="f-company">Company</label>
                <input id="f-company" name="company" type="text" autocomplete="organization">
                <span class="err-msg"></span>
              </div>
            </div>
            <div class="field">
              <label for="f-email">Email *</label>
              <input id="f-email" name="email" type="email" autocomplete="email" required>
              <span class="err-msg">A valid email so we can reply</span>
            </div>
            <div class="field">
              <label for="f-goal">What are you looking to create?</label>
              <select id="f-goal" name="goal">
                <option value="">Choose one — or tell us below</option>
                <option>A brand identity</option>
                <option>A website</option>
                <option>Brand + website</option>
                <option>A campaign or content system</option>
                <option>An AI product or tool</option>
                <option>Something else entirely</option>
              </select>
            </div>
            <fieldset class="field" style="border:0">
              <legend class="mono" style="color:var(--ink-50);letter-spacing:0.12em;font-size:var(--t-label);text-transform:uppercase;margin-bottom:12px">Services required</legend>
              <div class="seg">
                <input type="checkbox" id="sv-brand" name="services" value="Brand"><label for="sv-brand">Brand</label>
                <input type="checkbox" id="sv-digital" name="services" value="Digital / Web"><label for="sv-digital">Digital / Web</label>
                <input type="checkbox" id="sv-ai" name="services" value="AI"><label for="sv-ai">AI</label>
                <input type="checkbox" id="sv-content" name="services" value="Content"><label for="sv-content">Content</label>
                <input type="checkbox" id="sv-motion" name="services" value="Motion"><label for="sv-motion">Motion</label>
              </div>
            </fieldset>
            <fieldset class="field" style="border:0">
              <legend class="mono" style="color:var(--ink-50);letter-spacing:0.12em;font-size:var(--t-label);text-transform:uppercase;margin-bottom:12px">Approximate budget</legend>
              <div class="seg">
                <input type="radio" id="b-1" name="budget" value="Under £5,000"><label for="b-1">Under £5,000</label>
                <input type="radio" id="b-2" name="budget" value="£5,000–£10,000"><label for="b-2">£5,000–£10,000</label>
                <input type="radio" id="b-3" name="budget" value="£10,000–£25,000"><label for="b-3">£10,000–£25,000</label>
                <input type="radio" id="b-4" name="budget" value="£25,000–£50,000"><label for="b-4">£25,000–£50,000</label>
                <input type="radio" id="b-5" name="budget" value="£50,000+"><label for="b-5">£50,000+</label>
              </div>
            </fieldset>
            <div class="field">
              <label for="f-timing">Desired launch timing</label>
              <select id="f-timing" name="timing">
                <option value="">Flexible</option>
                <option>As soon as possible</option>
                <option>1–3 months</option>
                <option>3–6 months</option>
                <option>Later this year</option>
              </select>
            </div>
            <div class="field">
              <label for="f-details">The project *</label>
              <textarea id="f-details" name="details" required placeholder="What are you building, who is it for, and what needs to happen next?"></textarea>
              <span class="err-msg">A few sentences about the project</span>
            </div>
            <div class="hp" aria-hidden="true">
              <label for="f-hp">Leave this field empty</label>
              <input id="f-hp" name="company_url" type="text" tabindex="-1" autocomplete="off">
            </div>
            <div>
              <button class="btn" type="submit">Send transmission <span class="arrow">→</span></button>
              <p class="form-note" style="margin-top:14px">Opens your mail app with everything filled in, addressed to lewis@fabricatr.com. Nothing is stored on this site — no lists, no spam.</p>
            </div>
            <div id="form-status" class="form-status" role="status" aria-live="polite"></div>
          </form>

          <aside class="contact-side">
            <div class="blk">
              <span class="k mono">Prefer email?</span>
              <a class="tlink" href="mailto:lewis@fabricatr.com">lewis@fabricatr.com</a>
            </div>
            <div class="blk">
              <span class="k mono">Prefer WhatsApp?</span>
              <a class="tlink" href="https://wa.link/12v2dp">+44 7834 234 730</a>
            </div>
            <div class="blk">
              <span class="k mono">Prefer a call?</span>
              <a class="tlink" href="https://cal.com/fabricatr">cal.com/fabricatr ↗</a>
              <span class="muted" style="font-size:0.9rem">20 minutes, no deck, no pressure.</span>
            </div>
            <div class="blk">
              <span class="k mono">Studio</span>
              <span>Sandbanks — Poole, UK</span>
              <span class="muted" style="font-size:0.9rem">Working with clients everywhere.</span>
            </div>
            <div class="blk">
              <span class="k mono">Elsewhere</span>
              <a class="tlink" href="https://instagram.com/madebyfabricatr">@madebyfabricatr</a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  </main>
""" + FOOTER

# ============================================================ PRIVACY
privacy = head("Privacy — Fabricatr",
  "How Fabricatr handles your information: plainly, minimally, and without tricks.",
  "https://fabricatr.com/privacy") + "\n" + nav("") + """
  <main id="main">
    <section class="page-hero">
      <div class="container">
        <p class="crumbs mono"><span>Privacy</span> <span class="sep">/</span> <span>Last updated — July 2026</span></p>
        <h1 class="display reveal" style="font-size:clamp(2.2rem,5vw,4.5rem)">Privacy,<br><span class="em">plainly.</span></h1>
      </div>
    </section>
    <section class="section--tight" style="padding-bottom:clamp(72px,10vw,144px)">
      <div class="container">
        <div class="prose">
          <p>This website is run by Fabricatr, an independent creative studio based in Sandbanks, Poole, UK. We treat your information the way we’d want ours treated: minimally, and without tricks.</p>
          <h2>What we collect</h2>
          <p>As little as possible. This site does not set marketing cookies and does not run advertising trackers. The enquiry form does not store anything on this website — pressing send opens your own email app with your message addressed to us.</p>
          <h2>When you contact us</h2>
          <p>If you email, WhatsApp or book a call, we receive whatever you choose to send — typically your name, contact details and project information. We use it to reply and to run any project we agree together. We don’t sell it, rent it, or add you to mailing lists you didn’t ask for.</p>
          <h2>Third-party services</h2>
          <ul>
            <li>Fonts are loaded from Google Fonts, which may process your IP address to serve the files.</li>
            <li>Call booking is handled by Cal.com; WhatsApp links open WhatsApp. Their own privacy policies apply once you’re there.</li>
            <li>Links to Instagram, Framer and client websites take you to services we don’t control.</li>
          </ul>
          <h2>How long we keep things</h2>
          <p>Project correspondence and files are kept for as long as needed to deliver the work and meet legal obligations, then deleted or archived.</p>
          <h2>Your rights</h2>
          <p>Under UK GDPR you can ask what we hold about you, ask us to correct it, or ask us to delete it. Email <a href="mailto:lewis@fabricatr.com">lewis@fabricatr.com</a> and we’ll sort it — no forms, no runaround.</p>
        </div>
      </div>
    </section>
  </main>
""" + FOOTER

# ============================================================ 404
notfound = head("Lost in the fabric — 404 | Fabricatr",
  "This page doesn't exist. The rest of Fabricatr does.",
  "https://fabricatr.com/404") + "\n" + nav("") + """
  <main id="main">
    <section class="err-hero">
      <div>
        <p class="mono" style="color:var(--ink-50);margin-bottom:16px">Case file not found — checked twice</p>
        <p class="big" aria-hidden="true">4<span>0</span>4</p>
        <h1 class="display" style="font-size:clamp(1.6rem,4vw,2.6rem);margin-top:24px">Lost in the fabric.<br><span class="em">This thread leads nowhere.</span></h1>
        <p class="lead" style="margin:20px auto 0;max-width:32em">It might have been moved, renamed, or never existed. The work, however, is very real.</p>
        <div class="cta-row" style="justify-content:center">
          <a class="btn" href="index.html">Back to home <span class="arrow">→</span></a>
          <a class="btn btn--ghost" href="work.html">View the work</a>
        </div>
      </div>
    </section>
  </main>
""" + FOOTER

pages = {
    "services.html": services,
    "about.html": about,
    "contact.html": contact,
    "privacy.html": privacy,
    "404.html": notfound,
}
for name, content in pages.items():
    open(os.path.join(ROOT, name), "w", encoding="utf-8").write(content)
    print("wrote", name)
print("DONE")
