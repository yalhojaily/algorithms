import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/lessons' }),
  schema: z.object({
    id: z.string(), // "0.1" — must match an entry in src/data/curriculum.ts
    title: z.string(),
    summary: z.string(),
    objectives: z.array(z.string()),
    minutes: z.number(),
    /** Reading for this lesson in the free university references. */
    readings: z.array(z.object({ source: z.string(), part: z.string(), url: z.string().optional() })),
  }),
});

export const collections = { lessons };
