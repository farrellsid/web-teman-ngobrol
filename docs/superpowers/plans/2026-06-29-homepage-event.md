# Teman Ngobrol Homepage + Event Redirect Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Astro starter homepage with an on-brand, event-forward Teman Ngobrol homepage, plus a branded `/daftar` link that redirects to the event's Google Form, all editable by non-technical people via one settings file.

**Architecture:** A single `src/data/site.json` settings object (edited in Pages CMS via `type: file`) drives every editable string and the Google Form URL. `index.astro` composes section components that read those settings; `daftar.astro` reads the same `formUrl` and redirects. Testimonials come from the existing content collection with an honest empty state.

**Tech Stack:** Astro 6.4.2 (static, no adapter), Tailwind v4 via `@tailwindcss/vite`, TypeScript, deployed to Cloudflare Workers static assets.

## Global Constraints

- Astro `6.4.2`, static output, no adapter. Do not add `@astrojs/cloudflare`.
- Tailwind v4 via `@tailwindcss/vite` only. No `tailwind.config.js`. Configure in `src/styles/global.css` with `@theme`.
- Node `>=22.12.0`.
- Type: heading + body font stack is `"Helvetica Neue", Helvetica, Arial, sans-serif`. Headings use weight 800. This replaces Libre Baskerville + Mulish.
- Heading color (homepage) is brand terracotta `#C0492B`. CTA orange `#FF5900`. Cream background. Footer deep orange `#7A2E12`.
- Copy: Indonesian. Run all real copy through the `humanizer` skill. Minimize em dashes (prefer periods, commas, parentheses). Never fabricate quotes, statistics, testimonials, or claims; use honest placeholders.
- Images authored via CMS use string paths (Pattern 1). The logo is a fixed asset.
- No unit-test runner exists. Per `CLAUDE.md`, the verification gate per task is `npx astro check` (0 errors) and `npm run build` (exit 0), plus a concrete check (grep of built output, or a Playwright screenshot for visual tasks).
- All work happens on branch `feat/homepage-event`. Commit after each task.
- Dev server: `npm run dev` serves at `http://localhost:4321`. Use the Playwright MCP for visual checks.

---

### Task 1: Typography and palette switch to the brand system fonts

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/components/BaseHead.astro`
- Modify: `astro.config.mjs`

**Interfaces:**
- Produces: Tailwind theme tokens `--color-brand-terracotta` (`#C0492B`) and `--color-brand-footer` (`#7A2E12`); `--font-display` and `--font-body` both set to the Helvetica/Arial stack. These become utilities `text-brand-terracotta`, `bg-brand-footer`, `font-display`, `font-body`.

- [ ] **Step 1: Update the theme block and remove the Google Fonts import in `src/styles/global.css`**

Replace the first 17 lines (the `@import url(... fonts.googleapis ...)` line through the end of the `@theme { ... }` block) with:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme {
  /* Teman Ngobrol warm orange palette */
  --color-brand-cream:     #FFFBDC;
  --color-brand-peach:     #FFD3A5;
  --color-brand-sandy:     #FFAA6E;
  --color-brand-primary:   #FF8237;
  --color-brand-deep:      #FF5900;
  --color-brand-terracotta: #C0492B;
  --color-brand-footer:    #7A2E12;

  /* Typography: match the Instagram posts (Helvetica/Arial) */
  --font-display: "Helvetica Neue", Helvetica, Arial, sans-serif;
  --font-body:    "Helvetica Neue", Helvetica, Arial, sans-serif;
}
```

(Leave everything below the `@theme` block, the `:root` Bear Blog variables and base element styles, unchanged.)

- [ ] **Step 2: Remove the unused Atkinson web font preload in `src/components/BaseHead.astro`**

Delete the import line `import { Font } from 'astro:assets';` and delete the line `<Font cssVariable="--font-atkinson" preload />`.

- [ ] **Step 3: Remove the now-unused `fonts` config in `astro.config.mjs`**

Delete the entire `fonts: [ ... ]` array property from the `defineConfig({ ... })` object, and change the import line `import { defineConfig, fontProviders } from 'astro/config';` to `import { defineConfig } from 'astro/config';`.

- [ ] **Step 4: Verify type-check and build pass and the Google Fonts request is gone**

Run: `npx astro check`
Expected: `0 errors`.

Run: `npm run build`
Expected: exit 0, `Complete!`.

Run: `grep -rl "fonts.googleapis" dist/ || echo "no google fonts in output"`
Expected: `no google fonts in output`.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css src/components/BaseHead.astro astro.config.mjs
git commit -m "feat(theme): switch to Helvetica/Arial brand fonts, add terracotta palette tokens"
```

---

### Task 2: Site settings data file and Pages CMS entry

**Files:**
- Create: `src/data/site.json`
- Modify: `.pages.yml`

**Interfaces:**
- Produces: `src/data/site.json`, importable as a typed object with shape
  `{ announcementText: string; tagline: string; instagramUrl: string; event: { name: string; date: string; description: string; formUrl: string; posterImage: string }; about: { text: string; pillars: { icon: string; title: string; text: string }[] } }`.

- [ ] **Step 1: Create `src/data/site.json` with honest placeholder copy**

```json
{
  "announcementText": "[Nama event] telah dibuka. Daftar sekarang.",
  "tagline": "Komunitas pelajar Indonesia.",
  "instagramUrl": "https://instagram.com/",
  "event": {
    "name": "[Nama Event]",
    "date": "[Tanggal]",
    "description": "[Satu kalimat deskripsi event.]",
    "formUrl": "https://forms.gle/REPLACE-WITH-REAL-FORM",
    "posterImage": ""
  },
  "about": {
    "text": "[Kalimat singkat tentang Teman Ngobrol.]",
    "pillars": [
      { "icon": "🎓", "title": "Info Kuliah LN", "text": "[Teks pilar pertama.]" },
      { "icon": "💰", "title": "Panduan Beasiswa", "text": "[Teks pilar kedua.]" },
      { "icon": "💬", "title": "Cerita dari Sesama", "text": "[Teks pilar ketiga.]" }
    ]
  }
}
```

- [ ] **Step 2: Add a Pages CMS `type: file` entry for the settings in `.pages.yml`**

Insert this block under `content:` (above the `articles` collection entry), keeping correct indentation:

```yaml
  - name: settings
    label: Pengaturan Situs
    type: file
    path: src/data/site.json
    fields:
      - { name: announcementText, label: Teks pengumuman, type: string }
      - { name: tagline,          label: Tagline,         type: string }
      - { name: instagramUrl,     label: Link Instagram,  type: string }
      - name: event
        label: Event
        type: object
        fields:
          - { name: name,        label: Nama event,   type: string, required: true }
          - { name: date,        label: Tanggal,      type: string }
          - { name: description, label: Deskripsi,    type: text }
          - { name: formUrl,     label: Link Google Form, type: string, required: true }
          - { name: posterImage, label: Poster,       type: image }
      - name: about
        label: Tentang
        type: object
        fields:
          - { name: text, label: Teks tentang, type: text }
          - name: pillars
            label: Pilar
            type: object
            list: true
            fields:
              - { name: icon,  label: Ikon (emoji), type: string }
              - { name: title, label: Judul,        type: string }
              - { name: text,  label: Teks,         type: text }
```

- [ ] **Step 3: Verify type-check and build pass**

Run: `npx astro check`
Expected: `0 errors`.

Run: `npm run build`
Expected: exit 0, `Complete!`.

- [ ] **Step 4: Commit**

```bash
git add src/data/site.json .pages.yml
git commit -m "feat(content): add CMS-editable site settings (event, about, socials)"
```

---

### Task 3: Branded /daftar redirect page

**Files:**
- Create: `src/pages/daftar.astro`

**Interfaces:**
- Consumes: `src/data/site.json` (`event.formUrl`).

- [ ] **Step 1: Create `src/pages/daftar.astro`**

```astro
---
import site from '../data/site.json';
const url = site.event.formUrl;
---
<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="robots" content="noindex" />
    <meta http-equiv="refresh" content={`0; url=${url}`} />
    <link rel="canonical" href={url} />
    <title>Mengalihkan ke formulir pendaftaran...</title>
    <script is:inline set:html={`location.replace(${JSON.stringify(url)})`}></script>
  </head>
  <body style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 2rem;">
    <p>Mengalihkan ke formulir pendaftaran. <a href={url}>Klik di sini</a> jika halaman tidak berpindah otomatis.</p>
  </body>
</html>
```

- [ ] **Step 2: Build and verify the redirect HTML contains the form URL**

Run: `npm run build`
Expected: exit 0; route `/daftar/index.html` listed in build output.

Run: `grep -o "REPLACE-WITH-REAL-FORM" dist/daftar/index.html | head -1`
Expected: `REPLACE-WITH-REAL-FORM` (confirms the form URL is wired into the meta refresh).

- [ ] **Step 3: Commit**

```bash
git add src/pages/daftar.astro
git commit -m "feat(daftar): branded redirect route to the event Google Form"
```

---

### Task 4: Header with logo, Indonesian nav, and Instagram button

**Files:**
- Modify: `src/components/Header.astro` (full replacement)
- Uses asset: `src/assets/teman-ngobrol-logo.png` (already in repo)

**Interfaces:**
- Consumes: `src/data/site.json` (`instagramUrl`).
- Produces: a `<Header />` component used by `index.astro`.

Note on the logo: the supplied PNG is terracotta on white. On the cream header, `mix-blend-mode: multiply` makes the white disappear cleanly with no image processing. (When a transparent SVG arrives later, drop the blend mode.)

- [ ] **Step 1: Replace the contents of `src/components/Header.astro`**

```astro
---
import { Image } from 'astro:assets';
import logo from '../assets/teman-ngobrol-logo.png';
import site from '../data/site.json';
---
<header class="border-b border-brand-peach/40 bg-brand-cream/80 backdrop-blur sticky top-0 z-20">
  <nav class="max-w-5xl mx-auto flex items-center justify-between px-5 py-3">
    <a href="/" class="block" aria-label="Teman Ngobrol beranda">
      <Image src={logo} alt="Teman Ngobrol" width={150} height={150}
             class="h-11 w-auto" style="mix-blend-mode: multiply;" />
    </a>
    <div class="flex items-center gap-5 text-sm font-semibold text-stone-600">
      <a href="/about" class="hover:text-brand-terracotta">Tentang</a>
      <a href="/articles" class="hover:text-brand-terracotta">Artikel</a>
      <a href={site.instagramUrl} target="_blank" rel="noopener"
         class="rounded-full bg-brand-terracotta px-4 py-1.5 text-white hover:bg-brand-deep">Instagram</a>
    </div>
  </nav>
</header>
```

- [ ] **Step 2: Build and type-check**

Run: `npx astro check`
Expected: `0 errors`.

Run: `npm run build`
Expected: exit 0, `Complete!`.

- [ ] **Step 3: Visual check with Playwright**

Start dev server in the background: `npm run dev`
Navigate (Playwright MCP) to `http://localhost:4321/` and take a screenshot.
Expected: logo renders in terracotta on cream with no white box, nav links and Instagram button visible. (The homepage is still the starter until Task 10; you are only verifying the header.)

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat(header): brand logo, Indonesian nav, Instagram button"
```

---

### Task 5: Brand footer

**Files:**
- Modify: `src/components/Footer.astro` (full replacement)

**Interfaces:**
- Consumes: `src/data/site.json` (`tagline`, `instagramUrl`).

- [ ] **Step 1: Replace the contents of `src/components/Footer.astro`**

```astro
---
import site from '../data/site.json';
const year = new Date().getFullYear();
---
<footer class="bg-brand-footer text-orange-50 mt-16">
  <div class="max-w-5xl mx-auto px-5 py-10 grid gap-8 sm:grid-cols-3">
    <div>
      <p class="font-display font-extrabold text-xl text-brand-peach lowercase">teman ngobrol.</p>
      <p class="mt-2 text-sm text-orange-200/80">{site.tagline}</p>
    </div>
    <div class="text-sm">
      <p class="font-bold mb-2">Tautan</p>
      <ul class="space-y-1">
        <li><a class="text-brand-peach hover:underline" href="/about">Tentang</a></li>
        <li><a class="text-brand-peach hover:underline" href="/articles">Artikel</a></li>
        <li><a class="text-brand-peach hover:underline" href="/daftar">Daftar event</a></li>
      </ul>
    </div>
    <div class="text-sm">
      <p class="font-bold mb-2">Ikuti</p>
      <a class="text-brand-peach hover:underline" href={site.instagramUrl} target="_blank" rel="noopener">Instagram</a>
    </div>
  </div>
  <div class="border-t border-white/10 py-4 text-center text-xs text-orange-200/70">
    &copy; {year} Teman Ngobrol
  </div>
</footer>
```

- [ ] **Step 2: Build and type-check**

Run: `npx astro check`
Expected: `0 errors`.

Run: `npm run build`
Expected: exit 0, `Complete!`.

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat(footer): brand footer with links and Instagram"
```

---

### Task 6: Announcement bar component

**Files:**
- Create: `src/components/home/AnnouncementBar.astro`

**Interfaces:**
- Consumes: `src/data/site.json` (`announcementText`). Links to `/daftar`.
- Produces: `<AnnouncementBar />`.

- [ ] **Step 1: Create `src/components/home/AnnouncementBar.astro`**

```astro
---
import site from '../../data/site.json';
---
<a href="/daftar"
   class="block bg-brand-deep text-white text-center text-sm font-bold px-4 py-2 hover:bg-brand-primary">
  📣 {site.announcementText} <span aria-hidden="true">&rsaquo;</span>
</a>
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: exit 0, `Complete!`.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/AnnouncementBar.astro
git commit -m "feat(home): announcement bar linking to /daftar"
```

---

### Task 7: Event hero component

**Files:**
- Create: `src/components/home/EventHero.astro`

**Interfaces:**
- Consumes: `src/data/site.json` (`event`). Links to `/daftar`.
- Produces: `<EventHero />`. Renders `event.posterImage` only when non-empty (a `/uploads/...` path string, Pattern 1).

- [ ] **Step 1: Create `src/components/home/EventHero.astro`**

```astro
---
import site from '../../data/site.json';
const { name, date, description, posterImage } = site.event;
---
<section class="bg-gradient-to-b from-brand-cream to-brand-peach/40">
  <div class="max-w-5xl mx-auto px-5 py-14 grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-center">
    <div>
      <span class="inline-block rounded-full bg-brand-peach text-brand-terracotta font-bold text-sm px-3 py-1">
        Event mendatang · {date}
      </span>
      <h1 class="font-display font-extrabold text-brand-terracotta tracking-tight text-4xl sm:text-5xl mt-4 leading-[1.05]">
        {name}
      </h1>
      <p class="mt-4 text-lg text-stone-700 max-w-prose">{description}</p>
      <a href="/daftar"
         class="inline-block mt-6 rounded-full bg-brand-deep text-white font-extrabold px-7 py-3 text-lg shadow-lg shadow-brand-deep/30 hover:bg-brand-primary">
        Daftar Sekarang <span aria-hidden="true">&rsaquo;</span>
      </a>
    </div>
    {posterImage && (
      <img src={posterImage} alt={`Poster ${name}`} width="400" height="500"
           class="rounded-2xl w-full object-cover shadow-md" />
    )}
  </div>
</section>
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: exit 0, `Complete!`.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/EventHero.astro
git commit -m "feat(home): event hero with Daftar CTA"
```

---

### Task 8: About + pillars component

**Files:**
- Create: `src/components/home/AboutPillars.astro`

**Interfaces:**
- Consumes: `src/data/site.json` (`about.text`, `about.pillars`).
- Produces: `<AboutPillars />`.

- [ ] **Step 1: Create `src/components/home/AboutPillars.astro`**

```astro
---
import site from '../../data/site.json';
const { text, pillars } = site.about;
---
<section class="max-w-5xl mx-auto px-5 py-14 text-center">
  <h2 class="font-display font-extrabold text-brand-terracotta text-3xl">Apa itu Teman Ngobrol?</h2>
  <p class="text-brand-sandy tracking-[0.4em] my-3" aria-hidden="true">─── ◆ ───</p>
  <p class="text-stone-600 max-w-2xl mx-auto">{text}</p>
  <div class="mt-10 grid gap-5 sm:grid-cols-3">
    {pillars.map((p) => (
      <div class="bg-white rounded-2xl p-6 shadow-sm text-center">
        <div class="w-12 h-12 rounded-full bg-brand-peach/50 mx-auto flex items-center justify-center text-2xl">{p.icon}</div>
        <h3 class="font-display font-extrabold text-lg mt-3">{p.title}</h3>
        <p class="text-sm text-stone-600 mt-1">{p.text}</p>
      </div>
    ))}
  </div>
</section>
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: exit 0, `Complete!`.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/AboutPillars.astro
git commit -m "feat(home): about section with 3 pillars"
```

---

### Task 9: Testimonials component with honest empty state

**Files:**
- Create: `src/components/home/Testimonials.astro`
- Delete: `src/content/testimonials/sample-testimonial.md` (fabricated placeholder quote)
- Create: `src/content/testimonials/.gitkeep` (keep the collection directory so the glob loader base exists)

**Interfaces:**
- Consumes: the `testimonials` content collection via `getCollection('testimonials')`.
- Produces: `<Testimonials />`. Shows real quotes when present, otherwise a quiet "coming soon" placeholder. No fabricated content.

- [ ] **Step 1: Remove the fabricated sample testimonial and keep the directory**

```bash
git rm src/content/testimonials/sample-testimonial.md
touch src/content/testimonials/.gitkeep
git add src/content/testimonials/.gitkeep
```

- [ ] **Step 2: Create `src/components/home/Testimonials.astro`**

```astro
---
import { getCollection } from 'astro:content';
const testimonials = await getCollection('testimonials');
---
<section class="bg-brand-cream/60 py-14">
  <div class="max-w-5xl mx-auto px-5 text-center">
    <h2 class="font-display font-extrabold text-brand-terracotta text-2xl">Cerita dari Sesama</h2>
    <p class="text-brand-sandy tracking-[0.4em] my-3" aria-hidden="true">─── ◆ ───</p>
    {testimonials.length > 0 ? (
      <div class="grid gap-5 sm:grid-cols-2 mt-6 text-left">
        {testimonials.map((t) => (
          <figure class="bg-white rounded-xl border-l-4 border-brand-primary p-6">
            <blockquote class="italic text-stone-700">&ldquo;{t.data.quote}&rdquo;</blockquote>
            <figcaption class="mt-3 font-bold text-brand-terracotta text-sm">
              {t.data.name}{t.data.cohort ? `, ${t.data.cohort}` : ''}
            </figcaption>
          </figure>
        ))}
      </div>
    ) : (
      <p class="text-stone-500 mt-4">Cerita dari para anggota akan segera hadir.</p>
    )}
  </div>
</section>
```

- [ ] **Step 3: Build and confirm the placeholder renders (collection is empty)**

Run: `npm run build`
Expected: exit 0, `Complete!`. (An empty `testimonials` collection is fine here; the component renders the placeholder text.)

- [ ] **Step 4: Commit**

```bash
git add src/components/home/Testimonials.astro src/content/testimonials/.gitkeep
git commit -m "feat(home): testimonials section with honest empty state; remove fabricated sample"
```

---

### Task 10: Compose the homepage, humanize copy, and verify end to end

**Files:**
- Modify: `src/pages/index.astro` (full replacement)

**Interfaces:**
- Consumes: `BaseHead`, `Header`, `Footer`, `AnnouncementBar`, `EventHero`, `AboutPillars`, `Testimonials`, and `src/consts.ts` (`SITE_TITLE`, `SITE_DESCRIPTION`).

- [ ] **Step 1: Replace the contents of `src/pages/index.astro`**

```astro
---
import BaseHead from '../components/BaseHead.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import AnnouncementBar from '../components/home/AnnouncementBar.astro';
import EventHero from '../components/home/EventHero.astro';
import AboutPillars from '../components/home/AboutPillars.astro';
import Testimonials from '../components/home/Testimonials.astro';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';
---
<!doctype html>
<html lang="id">
  <head>
    <BaseHead title={SITE_TITLE} description={SITE_DESCRIPTION} />
  </head>
  <body class="bg-brand-cream">
    <AnnouncementBar />
    <Header />
    <main>
      <EventHero />
      <AboutPillars />
      <Testimonials />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 2: Humanize the placeholder copy in `src/data/site.json`**

Invoke the `humanizer` skill on the copy values in `src/data/site.json` (announcementText, tagline, event.description, about.text, pillar texts). Keep them as honest Indonesian placeholders (bracketed where the real value is unknown, e.g. `[Nama Event]`), remove any em dashes, and avoid AI-tells. Do not invent event facts.

- [ ] **Step 3: Type-check and build**

Run: `npx astro check`
Expected: `0 errors`.

Run: `npm run build`
Expected: exit 0, `Complete!`. Routes include `/index.html` and `/daftar/index.html`.

- [ ] **Step 4: Internal link check**

Run: `npx lychee --offline --include-fragments ./dist`
Expected: no broken internal links. (If lychee is not installed locally, this is the same check CI runs; note it and rely on CI.)

- [ ] **Step 5: Visual check with Playwright**

Start dev server in the background: `npm run dev`
Navigate (Playwright MCP) to `http://localhost:4321/` and take a full-page screenshot. Then navigate to `http://localhost:4321/daftar` and confirm it attempts to redirect (it will try to load the placeholder form URL).
Expected: homepage shows announcement bar, header with logo, event hero with Daftar button, about + 3 pillars, testimonials placeholder, footer. Colors match the brand (cream, terracotta headings, orange CTA). No layout overflow on mobile width (resize to 390px).

- [ ] **Step 6: Commit**

```bash
git add src/pages/index.astro src/data/site.json
git commit -m "feat(home): compose event-forward homepage; humanize placeholder copy"
```

---

## Self-Review

**Spec coverage:**
- Homepage replacing starter: Task 10. ✔
- Branded `/daftar` redirect reading the form URL: Task 3. ✔
- One CMS-editable settings file: Task 2. ✔
- Fonts to Helvetica/Arial, palette to terracotta, logo: Tasks 1, 4, 5. ✔
- Sections (announcement, nav, hero, about+pillars, testimonials, footer): Tasks 4-10. ✔
- Testimonials empty state, no fabrication: Task 9. ✔
- Copy humanized, em dashes minimized: Task 10 Step 2 + Global Constraints. ✔
- Out of scope (articles/about redesign, CMS end-to-end verification) correctly excluded. ✔

**Placeholder scan:** Bracketed `[...]` values in `site.json` are intentional honest content placeholders (the user supplies real event text), not plan placeholders. All steps contain concrete code and commands. ✔

**Type consistency:** `src/data/site.json` shape in Task 2 matches the fields read in Tasks 3-10 (`event.name/date/description/formUrl/posterImage`, `about.text/pillars[].icon/title/text`, `announcementText`, `tagline`, `instagramUrl`). Testimonials use `t.data.quote/name/cohort`, matching the existing collection schema in `src/content.config.ts`. ✔

## Open items the user must provide before public launch

- Real event details and the Google Form URL (replace `event.formUrl` placeholder).
- Instagram handle/URL.
- A transparent PNG or SVG logo (or keep the `mix-blend-mode: multiply` approach).
- Final real Indonesian copy (then re-run the humanizer).
