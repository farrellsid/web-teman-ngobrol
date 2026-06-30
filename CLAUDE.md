# Project: web-teman-ngobrol

An Astro **static** content site for **teman-ngobrol.com**, deployed to **Cloudflare**,
authored partly through **Pages CMS** (git-based). Single developer + Claude Code agent.

Read this before scaffolding or writing config — several Astro APIs changed across major
versions, and this project is on a **newer** version than most training data assumes. Do not
write Astro / Tailwind / content-collection / deploy config from memory.

> **Provenance:** the engineering guidance below was cross-checked against the live Astro 6
> docs (via the `astro-docs` MCP server) as of June 2026. Where a prior research handoff and
> the Astro docs disagreed, **the Astro docs win** — see the ⚠️ correction under *Deployment*.
> Still verify anything you're not 100% sure of against the docs before acting.

## Versions (pinned — verify against `package.json`, don't assume)

- **Astro `6.4.2`** — NOT Astro 2/3/4/5. Patterns from older versions are often wrong.
  Astro 6 ships **Vite 7, Shiki 4, and Zod 4**, and requires **Node 22+** (drops 18/20).
- **Tailwind CSS `4.3.0`** — v4, configured via the `@tailwindcss/vite` plugin, NOT a
  `tailwind.config.js` + PostCSS setup. There is no `tailwind.config.js`.
- **Node `>=22.12.0`**. Cloudflare does NOT read `engines` from `package.json` — pin the
  build's Node separately (see *Deployment*).
- Integrations / deps: `@astrojs/mdx 6.0.1`, `@astrojs/sitemap 3.7.3`, `@astrojs/rss 4.0.18`,
  `@tailwindcss/typography 0.5.19`, `sharp 0.34.5`.

Before feature work, confirm the live version with `npx astro --version` and check
`package.json` / `astro.config.mjs` rather than relying on this file alone.

## Conventions this repo already uses (match these — don't regress)

### Content collections — Content Layer API
- Defined in `src/content.config.ts` (note: `content.config.ts`, NOT the legacy
  `src/content/config.ts`). Pre-v5 implicit folder collections and `type: 'content'` are gone.
- Each collection uses a **loader**:
  `loader: glob({ base: './src/content/<name>', pattern: '**/*.{md,mdx}' })` from `astro/loaders`.
- Schemas use `z` from `astro/zod` (a re-export of **Zod 4** — Zod 4 features are available).
- `image()` is accessed via the schema **context** (`schema: ({ image }) => z.object({...})`),
  not imported from `astro:content`.
- Dates from frontmatter/CMS are strings — always use `z.coerce.date()`, never bare `z.date()`.
- Cross-collection relations use `reference('otherCollection')` (validated at query time via
  `getEntry`/`getEntries`, not at build).
- Existing collections: `articles`, `guides`, `events`, `testimonials`. **`src/content/` does
  not exist yet** — the collections are defined but unseeded.
- After editing `src/content.config.ts`, restart dev or press `s + enter` to regenerate
  `astro:content` types.
- (Astro 6 also adds *live* collections via `defineLiveCollection()` in `src/live.config.ts` —
  these require an SSR adapter and are **not** used here. Don't reach for them on a static site.)

### Fonts — Fonts API (stable in Astro 6)
- Configured in `astro.config.mjs` via `fonts: [...]` using `fontProviders` from `astro/config`.
- This repo uses `fontProviders.local()`, which **requires `options.variants`** (each variant =
  one `@font-face` and needs a `src`). Do NOT hand-roll `@font-face`.
- Keep font files under `src/` (repo uses `src/assets/fonts/`). The docs explicitly warn
  **against** `public/` for fonts — files there get duplicated into the build output.

### Styling
- Tailwind v4 via `@tailwindcss/vite` in the `vite.plugins` array of `astro.config.mjs`.
  Configure through `@import "tailwindcss"` + `@theme` in a CSS file (see `src/styles/global.css`).
- `@tailwindcss/typography` is available; add it with `@plugin "@tailwindcss/typography"` in CSS.
- The legacy `@astrojs/tailwind` integration is **Tailwind-3-only** — do not install it.
- If you use `@apply` inside an Astro component `<style>` block, add
  `@reference "../styles/global.css"` to that block.
- **Known gotcha (open):** `global.css` still includes the Astro starter's Bear Blog base
  styles, notably `main { width: 720px }`, a gray `body` background gradient, and large
  `h1`-`h6` sizes. These suit the article/prose pages but constrain the full-width homepage
  (sections wrapped in `<main>` get pinned to 720px). Reconcile before treating the homepage
  layout as done. See `docs/superpowers/notes/2026-06-30-homepage-known-issues.md`.

## Deployment — Cloudflare (static, no adapter)

A static Astro site needs **no adapter**: `astro build` → `dist/`, Cloudflare serves it.
Keep `output: 'static'` (the default). Do **not** install `@astrojs/cloudflare` unless you add
SSR (see below).

> ⚠️ **Correction vs. earlier research (Astro docs take precedence):** an earlier handoff doc
> recommended deploying via **Cloudflare Pages** Git integration. As of Astro 6 / current
> Cloudflare guidance that is the *legacy* path. The `@astrojs/cloudflare` v13 adapter
> **removed Cloudflare Pages support entirely**, and the Astro Cloudflare deploy guide now
> documents only **Cloudflare Workers + static assets**. Cloudflare itself "recommends using
> Cloudflare Workers for new projects." **Prefer Workers for this new project.** Pages still
> works for a purely static site if deliberately chosen, but treat it as the fallback, not the
> default.

**Recommended (Workers static assets):**
- `wrangler.jsonc` with `{ "name": "...", "compatibility_date": "<deploy-date>",
  "assets": { "directory": "./dist" } }` (no `main` / no worker entry for a static site).
- Local preview: `npx astro build && npx wrangler dev`. Deploy: `npx astro build && npx wrangler deploy`.
- For git-push CI/CD + previews, use **Workers Builds** (dashboard → Workers & Pages → import
  repo): build command `npx astro build`, deploy command `npx wrangler deploy`.
- Pin the build's Node via a committed `.node-version` (or `.nvmrc`) containing `22.12.0`.
  Note: a committed `wrangler.jsonc` can override dashboard env vars, so prefer `.node-version`.
- Custom domains: `teman-ngobrol.com` is already a Cloudflare zone, so apex setup is trivial
  (CNAME flattening). Add both apex and `www`, and 301-redirect `www → apex` to match `site`.

**Only reach for `@astrojs/cloudflare` (currently v13.7.0)** if you add on-demand rendering —
server islands, Actions, sessions, `live` collections, or KV/D1/R2 bindings — via
`npx astro add cloudflare`. Out of scope for the current static site.

### Before first production deploy (high priority, currently TODO)
- `astro.config.mjs` `site` is still the placeholder `https://example.com` → set it to
  `https://teman-ngobrol.com`. `site` is **mandatory** here: `@astrojs/sitemap` needs it (no
  `site` → no `sitemap-index.xml`, only a warning), `@astrojs/rss` builds links from it, and
  canonical `<link>`s resolve against it. A wrong-but-present `site` **builds fine** — it's a
  silent SEO bug. Verify: built `dist/sitemap-0.xml` and `dist/rss.xml` contain
  `teman-ngobrol.com` URLs.
- `src/consts.ts` still has scaffold defaults (`SITE_TITLE = 'Astro Blog'`, generic
  description) — update them; they feed `<title>`/meta and the RSS feed title.

## Content authoring — Pages CMS ↔ Content Layer contract

`.pages.yml` (repo root) drives Pages CMS. **Pages CMS has no database and does NOT validate
against the Zod schema** — it only edits files in the repo and commits them. The Zod schema in
`src/content.config.ts` is the **single source of truth**; `astro build` is the **only**
validator. Treat `.pages.yml` as a hand-maintained mirror — when you change the Zod schema,
regenerate `.pages.yml` to match, or a CMS edit will fail the build.

Field-type mapping (Pages CMS → Zod):

| Pages CMS field | Zod equivalent | Notes |
|---|---|---|
| `string` / `text` | `z.string()` | `text` = multiline |
| `boolean` | `z.boolean()` | supports `default` |
| `number` | `z.number()` | |
| `date` | `z.coerce.date()` | stored as a string; keep `options.format` ISO (`yyyy-MM-dd`) |
| `select` (single) | `z.enum([...])` | options under `options.values` |
| `select` + `multiple: true` | `z.array(z.enum([...]))` | |
| any field + `list: true` | `z.array(...)` | e.g. `tags` |
| `image` | `image()` or `z.string()` | see media note below |
| `reference` | `reference('other')` | `multiple: true` → array |
| `required: true` | non-`.optional()` | **biggest footgun**: optional-in-CMS but required-in-Zod → build breaks when an editor omits it |

- A field named **`body`** (type `rich-text`/`text`) is the Markdown **body**, NOT frontmatter —
  never add `body` to the Zod object.
- Enforce defaults in Zod via `.default(...)`, not just the CMS `default` (CMS `default` is only
  an initial editor value).
- **Media / images — DECIDED: Pattern 1 (CMS-friendly).** `media.input: public/uploads`,
  `media.output: /uploads`. `heroImage` is `z.string().optional()` (a `/uploads/...` path or
  URL) and is rendered with a plain `<img>` (see `BlogPost.astro`, `articles/index.astro`) —
  **not** Astro's `<Image>`/`image()`, which can't resolve CMS public-path strings. Tradeoff:
  no sharp optimization on hero images. Chosen because the CMS round-trip stays bulletproof;
  Pattern 2 (uploads under `src/assets` + `image()`) is finicky with the CMS and can break
  builds. Revisit (e.g. Cloudflare Images) only if Core Web Vitals demand it.

## Testing / CI — proportional to a static site (the build IS most of the test suite)

| Layer | Tool | Cadence | Blocking |
|---|---|---|---|
| Type + content schema | `astro check` | every push/PR | ✅ |
| Build / content gate | `astro build` | every push/PR | ✅ (Zod errors fail with file+field) |
| Internal links | `lychee --offline ./dist` | every push/PR | ✅ |
| External links | `lychee` (online) | weekly cron | ❌ open issue only (flaky) |
| A11y smoke | `@axe-core/playwright` | local / pre-release | ❌ advisory |
| Visual / DOM / console | Playwright MCP (already wired) | ad hoc / agent | ❌ |
| Lighthouse | Lighthouse / PSI | rarely / after redesign | ❌ |

CI runs the build twice (GitHub Actions + Cloudflare) — fine for a small site. Explicitly NOT
worth it here: unit-test frameworks for content, per-commit visual regression baselines,
mandatory a11y gates.

## When working with Astro APIs — consult the docs, don't guess

Astro's APIs shifted between majors. For anything not 100% certain for Astro 6:
1. **Preferred:** query the **`astro-docs` MCP server** (`https://mcp.docs.astro.build/mcp`).
2. **Fallback:** `WebFetch` against `https://docs.astro.build` for the specific topic.

Verify the current API before scaffolding config or collection code.

## Previewing the build (see what you built, don't assume)

The **Playwright MCP server** (`playwright`) gives real browser control.
1. Start dev in the background from this dir: `npm run dev` → `http://localhost:4321`.
2. Navigate with Playwright; it uses the accessibility tree by default. Take a **screenshot**
   when a visual judgment is needed (spacing, alignment, overlap).
3. Headless, so repeated checks won't pop windows.

If the Playwright/astro-docs tools aren't loaded, the MCP server was added after startup —
they activate on the next Claude Code session restart.

After visible changes (layout, components, styles), preview the affected page rather than
declaring it done from the diff alone.

## Caveats & version-specific warnings

- **`output: 'hybrid'` was removed in Astro 5** — only `'static'` / `'server'` exist.
- **Pin the exact Tailwind v4 patch** — v4 minor releases have included breaking changes.
- **Cloudflare ignores `package.json` `engines`** for Node — use a committed `.node-version`.
- **`@astrojs/cloudflare` is Astro-6-coupled** (requires v13.x); it's SSR-only and dropped
  Cloudflare Pages support.
- **Pages CMS ↔ Zod drift** is the top footgun — keep them in lockstep; ideally regenerate
  `.pages.yml` whenever `src/content.config.ts` changes.
