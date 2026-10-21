import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { getAllFlatNotes } from '../../src/lib/scan-notes';
import { hashSlug } from '../../src/lib/slug-hash';

for (const base of ['/personal-garden/', '/']) {
  test.describe(base === '/' ? 'Cloudflare diagrams' : 'GitHub Pages diagrams', () => {
    test('changing theme during the first deferred load still renders the diagram', async ({ page }) => {
      await page.route('**/mermaid.core.*.js', async route => {
        await new Promise(resolve => setTimeout(resolve, 200));
        await route.continue();
      });
      const request = page.waitForRequest(/mermaid\.core\./);
      await page.goto(`${base}garden/${hashSlug('9998-regression/0004-diagrams')}/`);
      const figure = page.locator('[data-mermaid]').first();
      await figure.scrollIntoViewIfNeeded();
      await request;
      await page.evaluate(() => document.documentElement.classList.add('dark'));
      await expect(figure).toHaveAttribute('data-rendered', 'dark');
    });
    test('every published diagram renders, including after theme changes and mobile resize', async ({ page }) => {
      test.setTimeout(90000);
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      const notes = getAllFlatNotes().filter(note => !note.slug.startsWith('9998-') && /^```mermaid/m.test(fs.readFileSync(path.join('src/content/notes', note.filePath), 'utf8')));
      expect(notes.length).toBeGreaterThan(0);
      for (const note of notes) {
        await page.goto(`${base}garden/${hashSlug(note.slug)}/`);
        const figures = page.locator('[data-mermaid]');
        expect(await figures.count()).toBeGreaterThan(0);
        for (const figure of await figures.all()) {
          await figure.scrollIntoViewIfNeeded();
          await expect(figure).toHaveAttribute('data-rendered', 'light');
          await expect(figure.locator('svg')).toHaveAttribute('role', 'img');
          expect(await figure.locator('svg text').count()).toBeGreaterThan(0);
        }
        await page.evaluate(() => document.documentElement.classList.add('dark'));
        for (const figure of await figures.all()) await expect(figure).toHaveAttribute('data-rendered', 'dark');
        await page.setViewportSize({ width: 390, height: 844 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.setViewportSize({ width: 1440, height: 1000 });
      }
      expect(errors).toEqual([]);
    });
    test('preview zoom, Escape, focus restoration and Astro navigation remain usable', async ({ page }) => {
      const note = getAllFlatNotes().find(note => note.title === 'Git 核心概念')!;
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(`${base}garden/${hashSlug(note.slug)}/`);
      await page.locator('[data-reading-toggle]').click();
      const figure = page.locator('[data-mermaid]').first();
      await figure.scrollIntoViewIfNeeded();
      await expect(figure).toHaveAttribute('data-rendered', 'light');
      const viewport = figure.locator('.diagram-viewport');
      const svg = figure.locator('svg');
      const centered = await viewport.evaluate(el => {
        const a = el.getBoundingClientRect(), b = el.querySelector('svg')!.getBoundingClientRect();
        return Math.abs((a.left + a.right) / 2 - (b.left + b.right) / 2) < 2;
      });
      expect(centered).toBe(true);
      await expect(figure.locator('details')).not.toHaveAttribute('open');
      await figure.locator('summary').click();
      await expect(figure.locator('code')).toContainText('flowchart LR');
      const expand = figure.locator('.diagram-expand');
      await expand.click();
      const modal = page.locator('.diagram-dialog');
      await expect(modal).toHaveAttribute('open');
      await expect(modal.locator('[data-diagram-close]')).toBeFocused();
      const initialWidth = await modal.locator('svg').evaluate(el => el.getBoundingClientRect().width);
      await modal.getByRole('button', { name: '放大图表', exact: true }).click();
      expect(await modal.locator('svg').evaluate(el => el.getBoundingClientRect().width)).toBeGreaterThan(initialWidth);
      await page.keyboard.press('Escape');
      await expect(modal).not.toHaveAttribute('open');
      await expect(expand).toBeFocused();
      await expect(page.locator('[data-reading-toggle]')).toHaveAttribute('aria-pressed', 'true');
      await expect(svg).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('');
      await expand.click();
      await modal.getByRole('button', { name: '关闭图表', exact: true }).click();
      await expect(svg).toBeVisible();
      await page.keyboard.press('Escape');
      await page.locator('#note-sidebar').getByRole('link', { name: '暂存与提交', exact: true }).click();
      await expect(page.locator('.paper-note-header h1')).toHaveText('暂存与提交');
      await page.locator('[data-mermaid]').first().scrollIntoViewIfNeeded();
      await expect(page.locator('[data-mermaid]').first()).toHaveAttribute('data-rendered', 'light');
      await page.goBack();
      await expect(page.locator('.paper-note-header h1')).toHaveText('Git 核心概念');
      await figure.scrollIntoViewIfNeeded();
      await expect(figure).toHaveAttribute('data-rendered', 'light');
    });
    test('Markdown errors degrade to source; legacy maps and X / English education work', async ({ page }) => {
      await page.goto(`${base}garden/${hashSlug('9998-regression/0004-diagrams')}/`);
      const valid = page.locator('[data-mermaid]').first();
      await valid.scrollIntoViewIfNeeded();
      await expect(valid).toHaveAttribute('data-rendered', 'light');
      const invalid = page.locator('[data-mermaid]').last();
      await invalid.scrollIntoViewIfNeeded();
      await expect(invalid).toHaveAttribute('data-rendered', 'error');
      await expect(invalid.locator('details')).toHaveAttribute('open');
      await expect(invalid.locator('code')).toContainText('this is not valid mermaid');
      await page.goto(`${base}garden/${hashSlug('9998-regression/0001-a')}/`);
      const map = page.locator('.knowledge-map');
      await expect(map).toContainText('Full long label without truncation');
      await map.locator('summary').focus();
      await page.keyboard.press('Enter');
      await expect(map).toContainText('Nested detail');
      await expect(map.locator('details')).toHaveAttribute('open');
      for (const width of [390, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await map.locator('strong').first().evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
      for (const path of [base, `${base}about/`]) {
        await page.goto(path);
        await expect(page.locator('a[href="https://x.com/wux4948"]')).toBeVisible();
        await expect(page.locator('[data-copy="w9519539"], img[src*="wechat"]')).toHaveCount(0);
      }
      await expect(page.locator('[aria-labelledby="education-title"]')).not.toContainText(/电子科技|浙江工业|硕士|本科|教育经历/);
      await expect(page.locator('[aria-labelledby="education-title"]')).toContainText('Zhejiang University of Technology');
    });
    test('knowledge cards and diagram source stay readable without JavaScript', async ({ browser }) => {
      const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
      try {
        const page = await context.newPage();
        await page.goto(`http://127.0.0.1:4333${base}garden/${hashSlug('9998-regression/0001-a')}/`);
        const map = page.locator('.knowledge-map');
        await map.locator('summary').click();
        await expect(map.locator('details')).toHaveAttribute('open');
        await expect(map).toContainText('Nested detail');
        await page.goto(`http://127.0.0.1:4333${base}garden/${hashSlug('9998-regression/0004-diagrams')}/`);
        await page.locator('.diagram-source summary').first().click();
        await expect(page.locator('.diagram-source').first()).toHaveAttribute('open');
        await expect(page.locator('.diagram-source code').first()).toContainText('flowchart LR');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      } finally { await context.close(); }
    });
  });
}
