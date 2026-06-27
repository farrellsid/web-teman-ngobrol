import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const articles = defineCollection({
  loader: glob({ base: './src/content/articles', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title:       z.string(),
    description: z.string().optional(),
    author:      z.string(),
    pubDate:     z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    // Pattern 1 (CMS-friendly): a public path string like "/uploads/cover.jpg" written by
    // Pages CMS, or any URL. NOT optimized by sharp. See CLAUDE.md "Content authoring".
    heroImage:   z.string().optional(),
    draft:       z.boolean().default(false),
    tags:        z.array(z.string()).optional(),
  }),
});

const guides = defineCollection({
  loader: glob({ base: './src/content/guides', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    country:   z.string(),
    flagEmoji: z.string(),
    summary:   z.string(),
    pubDate:   z.coerce.date(),
    draft:     z.boolean().default(false),
  }),
});

const events = defineCollection({
  loader: glob({ base: './src/content/events', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title:     z.string(),
    eventDate: z.coerce.date(),
    location:  z.string().optional(),
    draft:     z.boolean().default(false),
  }),
});

const testimonials = defineCollection({
  loader: glob({ base: './src/content/testimonials', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    name:   z.string(),
    cohort: z.string().optional(),
    quote:  z.string(),
  }),
});

export const collections = { articles, guides, events, testimonials };