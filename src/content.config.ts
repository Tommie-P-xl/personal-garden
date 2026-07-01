import { defineCollection, z } from 'astro:content';

const notes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()).default([]),
    summary: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tech: z.array(z.string()).default([]),
    link: z.string().optional(),
    github: z.string().optional(),
    image: z.string().optional(),
    featured: z.boolean().default(false),
    date: z.date(),
  }),
});

export const collections = { notes, projects };
