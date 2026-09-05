import { expect, test } from '@playwright/test';

test('capture original and current Playbook reference', async ({ page }, info) => {
  test.skip(!process.env.REFERENCE_URL, 'Optional original-revision preview');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/docs/request-for-microproducts']) {
      for (const variant of ['before', 'after']) {
        await page.goto(variant === 'before' ? process.env.REFERENCE_URL + path : path);
        await expect(page.getByRole('heading', { name: path === '/' ? 'Turn Data Into Value' : 'Request For Microproducts', exact: true })).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: info.outputPath(`${path === '/' ? 'home' : 'docs'}-${variant}-${width}.png`) });
      }
    }
  }
});
