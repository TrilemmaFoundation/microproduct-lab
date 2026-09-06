import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

declare global {
  interface Window { fontPolicyViolations: string[] }
}

test('production CSP permits the configured font stylesheet and font files', async ({ page }) => {
  const deployment = JSON.parse(readFileSync('vercel.json', 'utf8'));
  const csp = deployment.headers[0].headers.find((header: {key: string; value: string}) => header.key === 'Content-Security-Policy').value;
  await page.addInitScript(() => {
    window.fontPolicyViolations = [];
    document.addEventListener('securitypolicyviolation', event => {
      window.fontPolicyViolations.push(event.blockedURI);
    });
  });
  await page.route('https://fonts.googleapis.com/**', route => route.fulfill({
    contentType: 'text/css', body: 'body { --audit-font-stylesheet: loaded; }',
  }));
  let fontRequested = false;
  await page.route('https://fonts.gstatic.com/audit.woff2', route => {
    fontRequested = true;
    return route.fulfill({status: 404, headers: {'access-control-allow-origin': '*'}});
  });
  await page.route('http://127.0.0.1:43918/', async route => {
    const response = await route.fetch();
    await route.fulfill({response, headers: {...response.headers(), 'content-security-policy': csp}});
  });
  await page.goto('/');
  await expect(page.locator('body')).toHaveCSS('--audit-font-stylesheet', 'loaded');
  // A mocked 404 is enough: the browser must permit the request before decoding a font.
  await page.evaluate(() => new FontFace('Audit', 'url(https://fonts.gstatic.com/audit.woff2)').load().catch(() => {}));
  expect(fontRequested).toBe(true);
  expect(await page.evaluate(() => window.fontPolicyViolations)).toEqual([]);
});

const families = ['/', '/docs/request-for-microproducts', '/agents', '/agents/request-for-microproducts', '/templates', '/archetypes', '/standards', '/contribute', '/showcase', '/authors/matt-faltyn', '/search?q=data', '/404'];

async function expectNoTargetPageHighlights(page: Page): Promise<void> {
  // Mark.js paints after a macrotask when highlightSearchTermsOnTargetPage is on.
  await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 50)));
  await expect(page.locator('.theme-doc-markdown mark')).toHaveCount(0);
}

async function expectMarksMatchSurroundingText(root: Locator): Promise<void> {
  const marks = root.locator('mark');
  const count = await marks.count();
  expect(count).toBeGreaterThan(0);
  for (let index = 0; index < count; index++) {
    const mark = marks.nth(index);
    await expect(mark).toHaveCSS('text-decoration-line', 'none');
    const colors = await mark.evaluate((el) => {
      const style = getComputedStyle(el);
      return { color: style.color, parent: getComputedStyle(el.parentElement!).color, background: style.backgroundColor };
    });
    expect(colors.color).toBe(colors.parent);
    expect(colors.background === 'rgba(0, 0, 0, 0)' || colors.background === 'transparent').toBe(true);
  }
}

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

const tablePages = ['/showcase', '/templates', '/archetypes', '/standards/folder-contract', '/docs/playbook/frame/modern-data-stack'];

function brokenLetterWords(tables: Element[]): string[] {
  const broken: string[] = [];
  for (const table of tables) {
    const walker = document.createTreeWalker(table, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const text = node.textContent ?? '';
      const wordRe = /[A-Za-z]{4,}/g;
      let match: RegExpExecArray | null;
      while ((match = wordRe.exec(text))) {
        const range = document.createRange();
        range.setStart(node, match.index);
        range.setEnd(node, match.index + match[0].length);
        if ([...range.getClientRects()].filter((rect) => rect.height > 0).length > 1) broken.push(match[0]);
      }
    }
  }
  return broken;
}

test('markdown tables keep letter-only words intact', async ({ page }) => {
  for (const path of tablePages) {
    for (const width of [390, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      await expect(page.locator('h1')).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await page.locator('.theme-doc-markdown table').evaluateAll(brokenLetterWords), `${path} at ${width}px`).toEqual([]);
    }
  }
});

test('showcase table keeps names, team, and links readable', async ({ page }) => {
  const table = page.locator('.theme-doc-markdown table');
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/showcase');
    await expect(page.locator('h1')).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const layout = await table.evaluate((el) => {
      const rows = [...(el as HTMLTableElement).rows];
      const team = rows[0]?.cells[2];
      const teamRange = document.createRange();
      if (team) teamRange.selectNodeContents(team);
      return {
        scrolls: el.scrollWidth > el.clientWidth + 1,
        teamLines: team ? teamRange.getClientRects().length : 0,
      };
    });
    expect(layout.teamLines).toBe(1);
    expect(layout.scrolls).toBe(width < 768);
  }
});

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


test('page navigation isolates content and restores focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/docs/request-for-microproducts');
  const toggle = page.getByRole('button', { name: 'Open page navigation' });
  await toggle.click();
  await expect(page.locator('.navbar-sidebar')).toBeVisible();
  await expect(page.locator('.playbook-header')).toHaveJSProperty('inert', true);
  await expect(page.locator('.main-wrapper')).toHaveJSProperty('inert', true);
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
});

test('anchors and previous/next links work with the local header', async ({ page }) => {
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
  await expect(page.getByRole('option').first()).toBeVisible();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page).not.toHaveURL(/43918\/$/);
  await expect(page).not.toHaveURL(/[?&]_highlight=/);
  await expect(page.locator('h1')).toBeVisible();
  await expectNoTargetPageHighlights(page);
});

test('search match marks do not look like links', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('textbox', { name: 'Search', exact: true });
  await search.fill('arch');
  await expect(page.getByRole('option').first()).toBeVisible();
  await expectMarksMatchSurroundingText(page.locator('.playbook-search [class*="dropdownMenu"]'));
  await page.keyboard.press('ArrowDown');
  await expectMarksMatchSurroundingText(page.locator('[class*="suggestion"][class*="cursor"]'));

  await page.goto('/search?q=arch');
  await expect(page.getByText(/documents? found/i)).toBeVisible();
  await expectMarksMatchSurroundingText(page.locator('article').first());
});

test('search clicks omit highlight params and leftover highlights stay unmarked', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('textbox', { name: 'Search', exact: true });
  await search.fill('microproduct');
  const suggestion = page.getByRole('option').first();
  await expect(suggestion).toBeVisible();
  await suggestion.click();
  await expect(page).not.toHaveURL(/43918\/$/);
  await expect(page).not.toHaveURL(/[?&]_highlight=/);
  await expect(page.locator('h1')).toBeVisible();
  await expectNoTargetPageHighlights(page);

  await page.goto('/search?q=microproduct');
  await expect(page.getByText(/documents? found/i)).toBeVisible();
  const results = page.locator('section article h2 a');
  await expect(results.first()).toBeVisible();
  const count = await results.count();
  expect(count).toBeGreaterThan(0);
  for (let index = 0; index < count; index++) {
    await expect(results.nth(index)).not.toHaveAttribute('href', /[?&]_highlight=/);
  }
  await results.first().click();
  await expect(page).not.toHaveURL(/\/search(\?|$)/);
  await expect(page).not.toHaveURL(/[?&]_highlight=/);
  await expect(page.locator('h1')).toBeVisible();
  await expectNoTargetPageHighlights(page);

  await page.goto('/docs/request-for-microproducts?_highlight=f');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page).toHaveURL(/[?&]_highlight=f/);
  await expectNoTargetPageHighlights(page);
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




test('only local navigation is rendered and offsets track its actual height', async ({ page }) => {
  for (const path of ['/', '/docs/request-for-microproducts']) {
    for (const width of [320, 390, 768, 996, 997, 1023, 1024, 1280, 1536]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(path);
      const header = page.locator('.playbook-header');
      await expect(header).toBeVisible();
      await expect(page.getByRole('navigation', { name: 'Build Trilemma navigation', exact: true })).toBeVisible();
      await expect(page.locator('.foundation-header, .foundation-header-bar')).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Open site menu' })).toHaveCount(0);
      const box = await header.boundingBox();
      expect(box!.y).toBe(0);
      if (width >= 997) {
        await expect(page.getByRole('button', { name: 'Open page navigation' })).toBeHidden();
        const links = await page.locator('.playbook-links').boundingBox();
        expect(Math.abs(links!.x + links!.width / 2 - width / 2)).toBeLessThanOrEqual(1);
        const search = await page.locator('.playbook-search').boundingBox();
        expect(links!.x + links!.width).toBeLessThan(search!.x);
      }
      expect(box!.height).toBeLessThan(width >= 1024 ? 65 : 120);
      await expect.poll(() => page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--foundation-shell-height')))).toBeCloseTo(box!.height, 0);
      for (const link of await header.locator('a').all()) await expect(link).toBeInViewport({ ratio: 1 });
    }
  }
});
