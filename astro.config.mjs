// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://teman-ngobrol.com',
  output: 'static', // default; explicit — static build, no adapter (Cloudflare serves dist/)
  integrations: [mdx(), sitemap({ filter: (page) => !page.includes('/daftar') })],

  vite: {
    plugins: [tailwindcss()],
  },
});
