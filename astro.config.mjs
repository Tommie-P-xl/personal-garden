import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import remarkWikiLinks from './src/lib/remark-wiki-links';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';

const isCloudflare = process.env.DEPLOY_TARGET === 'cloudflare';

export default defineConfig({
  site: isCloudflare ? 'https://tommie-p-xl.pages.dev' : 'https://tommie-p-xl.github.io',
  base: isCloudflare ? '/' : '/personal-garden/',
  output: 'static',
  integrations: [
    mdx(),
    tailwind(),
    sitemap(),
  ],
  markdown: {
    remarkPlugins: [remarkMath, remarkWikiLinks],
    rehypePlugins: [
      rehypeKatex,
      rehypeSlug,
      [rehypeAutolinkHeadings, {
        behavior: 'append',
        properties: { className: ['heading-anchor'] },
        content: { type: 'text', value: '#' },
      }],
      [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
    ],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
});
