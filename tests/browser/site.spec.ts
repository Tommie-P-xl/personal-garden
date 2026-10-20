import { test, expect } from '@playwright/test';
import { hashSlug } from '../../src/lib/slug-hash';

for (const base of ['/personal-garden/', '/']) {
  test.describe(base === '/' ? 'Cloudflare' : 'GitHub Pages', () => {
    test('technical notes use wider content and responsive sidebars', async ({page}) => {
      await page.setViewportSize({width:1920,height:1000});
      await page.goto(`${base}garden/517192fd3ee42bf6/`);
      await expect(page.locator('#note-sidebar')).toBeVisible();
      await expect(page.locator('.paper-toc')).toBeVisible();
      const wide = await page.locator('.prose').evaluate(el => el.getBoundingClientRect().width);
      expect(wide).toBeGreaterThanOrEqual(1000);
      expect(wide).toBeLessThanOrEqual(1040);
      await page.setViewportSize({width:1440,height:1000});
      await expect(page.locator('#note-sidebar')).toBeVisible();
      await expect(page.locator('.paper-toc')).not.toBeVisible();
      expect(await page.locator('.prose').evaluate(el => el.getBoundingClientRect().width)).toBeGreaterThanOrEqual(1000);
      await page.locator('#toc-mobile-btn').click();
      await expect(page.locator('#toc-mobile-close')).toBeFocused();
      await page.setViewportSize({width:1920,height:1000});
      await expect(page.locator('#toc-mobile-drawer')).toHaveAttribute('inert','');
      expect(await page.evaluate(()=>document.documentElement.style.overflow)).toBe('');
      await page.setViewportSize({width:1024,height:900});
      await expect(page.locator('#note-sidebar')).not.toBeVisible();
      await expect(page.locator('#sidebar-toggle-btn')).toBeVisible();
      expect(await page.locator('.prose').evaluate(el => el.getBoundingClientRect().width)).toBeGreaterThanOrEqual(900);
      await page.setViewportSize({width:390,height:844});
      expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await page.locator('.prose').evaluate(el => getComputedStyle(el).fontSize)).toBe('16px');
    });
    test('focus reading expands notes, persists across navigation and exits with Escape', async ({page}) => {
      await page.setViewportSize({width:1920,height:1000});
      await page.goto(`${base}garden/517192fd3ee42bf6/`);
      const toggle = page.locator('[data-reading-toggle]');
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-pressed','true');
      await expect(toggle).toContainText('退出专注');
      for (const selector of ['#note-sidebar','.paper-toc','#sidebar-toggle-btn','#toc-mobile-btn']) await expect(page.locator(selector)).not.toBeVisible();
      expect(await page.locator('.prose').evaluate(el=>el.getBoundingClientRect().width)).toBe(1200);
      await page.reload();
      await expect(toggle).toHaveAttribute('aria-pressed','true');
      await page.locator('.paper-reading > nav a').last().click();
      await expect(page.locator('.paper-note-header h1')).toHaveText('MDX 组件说明');
      await expect(toggle).toHaveAttribute('aria-pressed','true');
      await page.keyboard.press('Escape');
      await expect(toggle).toHaveAttribute('aria-pressed','false');
      await expect(toggle).toBeFocused();
      await expect(page.locator('.paper-toc')).toBeVisible();
      await page.reload();
      await expect(toggle).toHaveAttribute('aria-pressed','false');
      await page.setViewportSize({width:390,height:844});
      await toggle.click();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect(page.locator('#toc-mobile-btn')).not.toBeVisible();
      await toggle.click();
      await expect(page.locator('#toc-mobile-btn')).toBeVisible();
    });
    test('search URLs, query/tag restoration and client navigation', async ({ page }) => {
      await page.goto(`${base}garden/?search=Python`);
      await expect(page.locator('#search-input')).toHaveValue('Python');
      await expect(page.locator('#search-results-grid a')).toHaveCount(2);
      const href = await page.locator('#search-results-grid a').first().getAttribute('href');
      expect(href).toMatch(new RegExp(`^${base}garden/`));
      await page.locator('#search-results-grid a').first().click();
      await expect(page.locator('.paper-note-header h1')).toBeVisible();
      await page.goBack();
      await expect(page.locator('#search-input')).toHaveValue('Python');
      await expect(page.locator('#search-results-grid a')).toHaveCount(2);
      await page.goto(`${base}garden/?tag=GitHub%20Actions`);
      await expect(page.locator('#tag-filter [data-tag="GitHub Actions"]')).toHaveAttribute('aria-pressed','true');
      expect(await page.locator('#search-results-grid a').count()).toBeGreaterThan(0);
      await page.getByRole('link',{name:'项目',exact:true}).first().click();
      await page.waitForURL(`**${base}projects/`);
      await page.locator('#search-input').fill('OpenMax');
      await expect(page.locator('.project-card:visible')).toHaveCount(1);
      await page.getByRole('link',{name:'笔记',exact:true}).first().click();
      await page.waitForURL(`**${base}garden/`);
      await page.locator('#search-input').fill('Git');
      expect(await page.locator('#search-results-grid a').count()).toBeGreaterThan(0);
    });
    test('drawers do not catch closed-state focus and restore focus and scrolling', async ({ page }) => {
      await page.setViewportSize({width:390,height:844});
      await page.goto(`${base}garden/517192fd3ee42bf6/`);
      await expect(page.locator('h1')).toHaveCount(1);
      for (let i=0;i<15;i++) {
        await page.keyboard.press('Tab');
        expect(await page.evaluate(()=>!!document.activeElement?.closest('[inert]'))).toBe(false);
      }
      for (const [button,drawer] of [['#sidebar-toggle-btn','#sidebar-drawer'],['#toc-mobile-btn','#toc-mobile-drawer']]) {
        await expect(page.locator(drawer)).toHaveAttribute('inert','');
        await page.locator(button).click();
        await expect(page.locator(button)).toHaveAttribute('aria-expanded','true');
        expect(await page.evaluate(()=>document.documentElement.style.overflow)).toBe('hidden');
        await expect(page.locator(drawer+' button').first()).toBeFocused();
        await page.keyboard.press('Shift+Tab');
        expect(await page.evaluate((id)=>document.activeElement?.closest(id)?.id,drawer)).toBe(drawer.slice(1));
        await page.keyboard.press('Escape');
        await expect(page.locator(drawer)).toHaveAttribute('inert','');
        await expect(page.locator(button)).toBeFocused();
        expect(await page.evaluate(()=>document.documentElement.style.overflow)).toBe('');
      }
      await page.locator('#toc-mobile-btn').click();
      await page.locator('#toc-mobile-drawer [data-toc-link]').first().click();
      await expect(page.locator('#toc-mobile-drawer')).toHaveAttribute('aria-hidden','true');
    });
    test('headings, toc state, theme, responsive layout and extra tags', async ({page})=>{
      const errors:string[]=[]; page.on('pageerror',e=>errors.push(e.message));
      await page.setViewportSize({width:1920,height:1000});
      await page.goto(`${base}garden/517192fd3ee42bf6/`);
      await expect(page.locator('h1')).toHaveCount(1);
      const texts=await page.locator('.paper-toc [data-toc-link]').allTextContents();
      expect(texts.every(x=>!x.endsWith('#'))).toBe(true);
      await page.locator('.paper-toc [data-toc-link]').first().click();
      await expect(page.locator('.paper-toc [aria-current="location"]')).toHaveCount(1);
      const colors=await page.locator('.paper-toc [data-toc-link]').evaluateAll(xs=>xs.map(x=>getComputedStyle(x).color));
      expect(new Set(colors).size).toBeGreaterThan(1);
      await page.getByRole('button',{name:'切换主题',exact:true}).first().click();
      await page.locator('#theme-dropdown [data-theme=dark]').click();
      await expect(page.locator('html')).toHaveClass(/dark/);
      await page.getByRole('link',{name:'项目',exact:true}).first().click();
      await page.waitForURL(`**${base}projects/`);
      await expect(page.locator('html')).toHaveClass(/dark/);
      await page.locator('.extra-tags summary').first().click();
      await expect(page.locator('.extra-tags[open]').first()).toBeVisible();
      for(const width of [360,390,768,1024,1920]) {
        await page.setViewportSize({width,height:900});
        await page.goto(base);
        expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        expect(await page.locator('.home-interests .paper-tag').count()).toBeLessThanOrEqual(8);
      }
      expect(errors).toEqual([]);
    });
    test('draft metadata and routes stay private and same-named media stay distinct',async({page,request})=>{
      const hidden = hashSlug('9998-regression/0003-draft');
      expect((await request.get(`${base}garden/${hidden}/`)).status()).toBe(404);
      await page.goto(`${base}garden/?search=REGRESSION_PRIVATE`);
      await expect(page.locator('#search-results-grid a')).toHaveCount(0);
      for(const [name,expected] of [['0001-a','a'],['0002-b','b']]) {
        await page.goto(`${base}garden/${hashSlug('9998-regression/'+name)}/`);
        const src=await page.locator('.prose img').first().getAttribute('src');
        expect(src).toBe(`${base}media/9998-regression/${expected}/_media/same.svg`);
        await expect(page.locator('.prose img').nth(1)).toHaveAttribute('src',src!);
        expect((await request.get(src!)).status()).toBe(200);
      }
    });
  });
}
