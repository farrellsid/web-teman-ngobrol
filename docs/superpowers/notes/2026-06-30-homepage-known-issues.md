# Homepage known issues (2026-06-30)

Status: the homepage is built and lives on branch `feat/homepage-event` (Cloudflare
preview deployed). A visual review of the preview found layout problems. Design fixes are
on hold until the owner returns with a web-design direction. This note records the
diagnosis so the fix is quick when we resume.

## Symptom

On the homepage, the event hero, the "Apa itu Teman Ngobrol" section, and the testimonials
render inside a narrow centered column (about 720px) with large empty margins on both sides.
The announcement bar and the footer span the full width. Pillar card titles break mid-word
("Cerita dari Sesam a"). There is an off-brand gray band behind the hero.

## Root cause

`src/styles/global.css` still carries the Astro starter's Bear Blog base styles, which fight
the new full-width design:

- `main { width: 720px; ... }` (around line 51). `src/pages/index.astro` wraps the homepage
  sections in `<main>`, so every section inherits the 720px cap and the `max-w-5xl` (1024px)
  set on the sections themselves can never take effect. The announcement bar and footer are
  rendered outside `<main>`, which is exactly why they go full width while the rest does not.
  This one rule explains the whole mismatch and the squeezed three-pillar grid.
- `body { background: linear-gradient(var(--gray-gradient)) ... }` (around line 42) paints a
  gray-to-white band across the top of the page, which clashes with the cream brand.
- `body { word-wrap / overflow-wrap: break-word }` combined with the too-narrow columns is
  what breaks the pillar titles in the middle of a word.

These base rules are correct for the article and blog pages (the `BlogPost` layout wants a
~720px reading column), but wrong for a full-width marketing homepage.

## Fix direction (after the design research)

1. Stop the global `main` width from constraining the homepage. Either move the 720px
   reading width onto the article layout or a `.prose` scope only and let the homepage run
   full width, or give the homepage its own layout that does not pull in the Bear Blog base.
   The section components already set their own `max-w-5xl`, so once `main` is freed they lay
   out correctly.
2. Replace the gray body background gradient with the cream brand background for the homepage.
3. Revisit spacing, the type scale, hero alignment, and the pillar grid per the owner's
   design direction. The current heading sizes come from the Bear Blog base
   (`h1 { font-size: 3.052em }` and similar), which may not match the intended look.

## Not the problem

The component markup, brand tokens, the grids (`max-w-5xl`, `sm:grid-cols-3`), and the data
wiring are all fine. This is base-CSS reconciliation, not a rebuild.

## Resolved (2026-07-01, full distinctive redesign)

All of the above were fixed in the redesign on `feat/homepage-event`:

- The `main` clamp and the gray gradient no longer constrain the homepage. The Bear Blog
  base is wrapped in `@layer base`, the homepage `<main>` uses `w-full max-w-none p-0`, and
  the body background is cream. Article/about pages keep their reading styles.
- A real type scale (Tailwind sizes) and a 4/8 spacing scale are used throughout.
- Deliberate self-hosted type pairing: Bricolage Grotesque (display, echoes the logo) +
  Hanken Grotesk (body), via the Astro fonts API.
- Warm palette retuned for WCAG AA. The old white-on-`#FF5900` (which failed AA) is gone:
  the announcement bar is terracotta on cream, and the CTA is ember with dark ink text.
- De-slopped against the AI-slop checklist: no pill-above-H1, no identical icon cards
  (replaced by a dot-led list), no colored-left-border quote cards, no CTA glow shadow, no
  hero gradient, no backdrop-blur, no emoji icons. Signature: the terracotta/ember period
  from the logo.

Verified with `astro check` (0 errors), `npm run build`, and Playwright screenshots at
desktop (1280) and mobile (390).

## Still pending (unchanged from the plan's open items)

Real event content and the Google Form URL, the Instagram link, final humanized Indonesian
copy, and a transparent or SVG logo (the header PNG has heavy internal padding, so the
wordmark renders small).
