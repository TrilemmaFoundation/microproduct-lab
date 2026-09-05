import { readdirSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// Build first: includes every docs plugin, author page, mirror, and generated route.
const routes = readdirSync('build', { recursive: true })
  .filter((path): path is string => typeof path === 'string' && path.endsWith('.html'))
  .map(path => '/' + path.replace(/index\.html$/, '').replace(/\.html$/, ''))
  .sort();

for (const path of routes) {
  test(`generated route ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    const response = await page.goto(path);
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('.foundation-header')).toBeVisible();
    await expect(page.locator('.foundation-footer')).toBeVisible();
    await expect.poll(() => page.locator('img').evaluateAll(images => (images as HTMLImageElement[]).filter(img => img.complete && !img.naturalWidth).map(img => img.src))).toEqual([]);
    expect(errors).toEqual([]);
  });
}
