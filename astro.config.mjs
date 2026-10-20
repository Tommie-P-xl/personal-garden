import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import remarkNoteHeadings from './src/lib/remark-note-headings';
import remarkWikiLinks from './src/lib/remark-wiki-links';
import remarkMedia from './src/lib/remark-media';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeTableWrapper from './src/lib/rehype-table-wrapper';

const isCloudflare = process.env.DEPLOY_TARGET === 'cloudflare';

export default defineConfig({
  site: isCloudflare ? 'https://tommie-p-xl.pages.dev' : 'https://tommie-p-xl.github.io',
  base: isCloudflare ? '/' : '/personal-garden/',
  output: 'static',
  outDir: process.env.BUILD_OUT_DIR || './dist',
  integrations: [
    mdx(),
    tailwind(),
    sitemap(),
  ],
  markdown: {
    remarkPlugins: [remarkMath, remarkNoteHeadings, remarkWikiLinks, remarkMedia],
    rehypePlugins: [
      rehypeKatex,
      rehypeSlug,
      [rehypeAutolinkHeadings, {
        behavior: 'append',
        properties: { className: ['heading-anchor'], ariaLabel: '链接到此标题' },
        content: { type: 'element', tagName: 'span', properties: { className: ['heading-link-icon'], ariaHidden: 'true' }, children: [] },
      }],
      [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
      rehypeTableWrapper,
    ],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
});
