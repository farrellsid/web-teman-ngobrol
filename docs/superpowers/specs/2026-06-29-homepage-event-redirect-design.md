# Design: Teman Ngobrol homepage + event redirect

Date: 2026-06-29
Status: Draft for review

## Goal

A neat, on-brand homepage for the Teman Ngobrol organization, plus a branded short
link that redirects to a Google Form for the current event. Editable by non-technical
people without touching code.

## Scope

In scope:
- A new homepage that replaces the current Astro starter `index.astro`.
- A branded `/daftar` route that redirects to the event's Google Form.
- One CMS-editable settings file that drives the editable content and the form URL.
- Brand theme update: fonts to a Helvetica/Arial stack, palette tuned to the logo
  terracotta, and the real logo in the header and footer.

Out of scope (separate, later tasks):
- Articles and About page redesign and real content.
- Connecting and verifying Pages CMS end to end.
- Real testimonials (the section ships with an empty placeholder state).

## Brand and theme

- Layout direction: B (Event-forward), approved from the mockups.
- Type: heavy Helvetica/Arial stack for headings and body, to match the Instagram
  posts. This replaces the repo's Libre Baskerville + Mulish. Stack:
  `"Helvetica Neue", Helvetica, Arial, sans-serif`. Headings use weight 800.
- Palette: keep the existing `--color-brand-*` variables, tuned so the heading
  terracotta matches the logo (about `#C0492B`, to be sampled precisely from the logo
  during build). Cream background, bright orange CTA (`#FF5900`), deep orange footer,
  charcoal body text.
- Logo: the provided custom PNG (lowercase `teman ngobrol.` wordmark) stored at
  `src/assets/teman-ngobrol-logo.png`, used in the header and footer. The supplied file
  has a white background; we need a transparent PNG or SVG, or we key out the white
  during build so it sits cleanly on cream.

## Page structure (top to bottom)

1. Announcement bar: full-width orange strip. Text from settings, links to `/daftar`.
2. Header / nav: logo, plus Tentang, Artikel, and an Instagram button.
3. Event hero (the focal point): event name, a date pill, a one-line description, a
   prominent Daftar button (to `/daftar`), and an optional poster image. All from settings.
4. "Apa itu Teman Ngobrol?": a short intro plus three pillars (icon, title, text) from settings.
5. Cerita dari Sesama: testimonials from the existing collection, with a quiet empty
   state when there are none.
6. Footer: deep orange, with the logo, links, and Instagram.

## Content model (the maintainability requirement)

- `src/data/site.json`: a single settings object the homepage reads, and Pages CMS edits
  via a `type: file` entry in `.pages.yml`. Fields:
  - `announcementText` (string)
  - `event`: `{ name, date, description, formUrl, posterImage? }`
  - `about`: `{ text, pillars: [{ icon, title, text }] }`
  - `instagramUrl`, `tagline`
- The Google Form URL lives in exactly one place: `event.formUrl`. The announcement bar
  and the hero button both link to `/daftar`, which reads `event.formUrl`. Updating the
  event means editing one field in the CMS.
- Testimonials: the existing content collection. The homepage lists them and shows a
  quiet placeholder when the collection is empty.

## The /daftar redirect

- `src/pages/daftar.astro` reads `event.formUrl` from `src/data/site.json` and returns a
  minimal HTML page with a `meta refresh`, a JS redirect, and a visible fallback link.
- This is build-time and static-friendly, and it is CMS-driven (the maintainer changes
  the form by editing one settings field, no repo edit).
- Alternative considered: a Cloudflare `public/_redirects` edge 302. It is faster, but the
  URL would live in a repo file rather than a CMS field, which loses the non-technical
  maintainability we want. So the Astro page wins here.

## Components (Astro)

- Update `Header.astro`: real logo, Indonesian nav, Instagram button.
- Update `Footer.astro`: brand footer.
- New section components: `AnnouncementBar.astro`, `EventHero.astro`, `AboutPillars.astro`,
  `Testimonials.astro`.
- `index.astro`: composes the sections, reading `src/data/site.json` and the testimonials collection.
- `daftar.astro`: the redirect page.
- `global.css`: font stack and palette update.

## Copy

- Language: Indonesian.
- All copy is placeholder until the user supplies the real text and event details.
- Run every piece of final copy through the humanizer skill before it ships.
- Minimize em dashes.
- No fabricated quotes, statistics, or claims.

## Open items (user to provide before launch)

- Event: name, date, description, Google Form URL.
- Instagram handle and URL.
- Logo: an SVG or transparent PNG, or approval to key out the white from the supplied PNG.
- Real copy, or approval for me to draft humanized placeholder Indonesian copy.

## Follow-ups (after this ships)

- Articles and About content and design.
- Pages CMS end-to-end connection and a preview-build check.
- Real testimonials.
