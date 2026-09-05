import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const families = ['/', '/docs/request-for-microproducts', '/agents', '/agents/request-for-microproducts', '/templates', '/archetypes', '/standards', '/contribute', '/showcase', '/authors/matt-faltyn', '/search?q=data', '/404'];

for (const width of [320, 390, 768, 1023, 1024, 1280, 1536]) {
  test(`page families reflow at ${width}px`, async ({ page, browserName }, info) => {
    test.skip(browserName !== 'chromium' && ![390, 1280].includes(width));
    for (const path of families) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      await expect(page.locator('h1')).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if ([390, 1280].includes(width)) await page.screenshot({ path: info.outputPath(`${path.replace(/[^a-z0-9]/gi, '_') || 'home'}.png`) });
    }
  });
}

test('light surfaces and primary hover remain accessible', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  const primary = page.locator('.bt-hero-button--primary');
  await primary.hover();
  await expect(primary).toHaveCSS('color', 'rgb(241, 241, 249)');
  await expect(primary).toHaveCSS('background-color', 'rgb(88, 88, 200)');
  for (const path of ['/', '/docs/request-for-microproducts', '/templates', '/agents', '/search?q=data', '/docs/playbook/frame/modern-data-stack']) {
    await page.goto(path);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([]);
  }
});

test('site menu isolates the page, dismisses and restores focus on short screens', async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/docs/request-for-microproducts');
    const toggle = page.getByRole('button', { name: 'Open site menu' });
    await toggle.click();
    await expect(page.locator('main')).toHaveJSProperty('inert', true);
    const menu = page.getByRole('navigation', { name: 'Mobile site navigation' });
    await menu.getByRole('button', { name: 'About', exact: true }).click();
    const last = menu.getByRole('link', { name: 'Manifesto', exact: true });
    await last.focus();
    await expect(last).toBeInViewport();
    await page.keyboard.press('Escape');
    await expect(toggle).toBeFocused();
    await expect(page.locator('main')).toHaveJSProperty('inert', false);
  }
});

test('page navigation retains Docusaurus behavior and excludes the site overlay', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/docs/request-for-microproducts');
  const toggle = page.getByRole('button', { name: 'Open page navigation' });
  await toggle.click();
  await expect(page.locator('.navbar-sidebar')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Mobile site navigation' })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
});

test('anchors and previous/next links work with both header rows', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/docs/request-for-microproducts');
  const anchor = page.locator('.table-of-contents a').last();
  await anchor.click();
  const top = await page.evaluate(() => document.getElementById(decodeURIComponent(location.hash.slice(1)))?.getBoundingClientRect().top);
  const header = await page.locator('.navbar').boundingBox();
  expect(top).toBeGreaterThanOrEqual((header?.height ?? 0) - 1);
  const next = page.locator('.pagination-nav a').last();
  const href = await next.getAttribute('href');
  await next.click();
  await expect(page).toHaveURL(new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/?$'));
});

test('search results can be selected with the keyboard', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('textbox', { name: 'Search', exact: true });
  await search.fill('microproduct');
  await expect(page.locator('[class*="suggestion"]').first()).toBeVisible();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page).not.toHaveURL(/43918\/$/);
  await expect(page.locator('h1')).toBeVisible();
});

test('200% text reflows and reduced motion disables decorative movement', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of ['/', '/docs/request-for-microproducts', '/templates', '/search?q=data', '/docs/playbook/frame/modern-data-stack']) {
    await page.goto(path);
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('h1')).toBeVisible();
  }
});

test('code copy announces success and recovers from denied clipboard access', async ({ page, context, browserName }) => {
  if (browserName === 'chromium') await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/docs/playbook/frame/modern-data-stack');
  const code = page.locator('pre').first();
  await code.hover();
  const copy = page.getByRole('button', { name: 'Copy code to clipboard', exact: true }).first();
  await copy.click();
  await expect(page.getByRole('status').filter({ hasText: 'Code copied to clipboard.' })).toBeVisible();
  if (browserName === 'chromium') expect(await page.evaluate(() => navigator.clipboard.readText())).toBe((await code.locator(".token-line").allTextContents()).join("\n"));
  await page.evaluate(() => { Object.defineProperty(navigator.clipboard, 'writeText', { configurable: true, value: async () => { throw new Error('Synthetic denial'); } }); });
  await copy.click();
  await expect(page.getByRole('button', { name: 'Try copying code again' })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'Copy failed.' })).toBeVisible();
});

test('desktop disclosures open on focus and Escape restores their trigger', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Resources', exact: true });
  await trigger.focus();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await page.locator('#desktop-resources-panel a').first().focus();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('search selection is readable and every suggestion remains reachable on short screens', async ({ page }, info) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1024, height: 600 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/docs/request-for-microproducts');
    const search = page.getByRole('textbox', { name: 'Search', exact: true });
    await expect(search).toHaveCSS('border-color', 'rgb(88, 88, 200)');
    await search.fill('data');
    const suggestions = page.getByRole('option');
    await expect(suggestions.first()).toBeVisible();
    const selected = page.locator('[class*="suggestion"][class*="cursor"]');
    await expect(selected).toHaveCSS('color', 'rgb(241, 241, 249)');
    await expect(selected).toHaveCSS('background-color', 'rgb(88, 88, 200)');
    const dropdown = page.locator('[class*="dropdownMenu"]');
    await expect(dropdown).toBeInViewport({ ratio: 1 });
    const result = await new AxeBuilder({ page }).withTags(['wcag2aa']).analyze();
    expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([]);
    for (let index = 1; index < await suggestions.count(); index++) await page.keyboard.press('ArrowDown');
    await expect(selected).toBeInViewport({ ratio: 1 });
    await page.screenshot({ path: info.outputPath(`search-${viewport.width}.png`) });
    await page.keyboard.press('Escape');
    await expect(dropdown).toBeHidden();
    await expect(page.locator('.playbook-search input')).toBeFocused();
    await page.keyboard.type(' licensing');
    await expect(dropdown).toBeVisible();
    await expect(page.getByRole('option').first()).toBeVisible();
  }
});


test('current-app mobile links restore focus and isolate auxiliary content', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Open site menu' });
  await toggle.click();
  for (const region of await page.locator('[data-foundation-background]').all()) {
    await expect(region).toHaveJSProperty('inert', true);
  }
  const menu = page.getByRole('navigation', { name: 'Mobile site navigation' });
  await menu.getByRole('button', { name: 'Resources', exact: true }).click();
  const currentApp = menu.getByRole('link', { name: 'Playbook', exact: true });
  await currentApp.focus();
  await currentApp.press('Enter');
  await expect(menu).toHaveCount(0);
  await expect(toggle).toBeFocused();
  for (const region of await page.locator('[data-foundation-background]').all()) {
    await expect(region).toHaveJSProperty('inert', false);
  }
});
