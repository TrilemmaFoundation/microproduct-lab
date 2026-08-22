import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {describe, it} from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '../..');

const README_PATH = path.join(ROOT, 'README.md');
const VERCEL_PATH = path.join(ROOT, 'vercel.json');

/** Deleted public URLs that must keep a permanent Vercel redirect. */
const DELETED_ROUTE_REDIRECTS = [
  ['/docs/human-overview', '/docs/request-for-microproducts'],
  ['/docs/human-overview/', '/docs/request-for-microproducts'],
  ['/docs/intro/human-overview', '/docs/request-for-microproducts'],
  ['/docs/intro/human-overview/', '/docs/request-for-microproducts'],
  ['/docs/playbook/implementation', '/docs/playbook/build'],
  ['/docs/playbook/implementation/', '/docs/playbook/build'],
];

const DELETED_DESTINATION_SLUGS = [
  'build-module',
  'human-overview',
  'ideation',
  'implementation',
];

function stripCode(markdown) {
  return markdown.replace(/```[\s\S]*?```/g, '').replace(/`[^`]+`/g, '');
}

function relativeMarkdownTargets(markdown) {
  const targets = [];
  const linkPattern = /!?\[[^\]]*]\(([^)]+)\)/g;
  let match;
  while ((match = linkPattern.exec(stripCode(markdown)))) {
    const dest = match[1].split('#')[0].split('?')[0].trim();
    if (!dest) {
      continue;
    }
    if (/^[a-z][a-z0-9+.-]*:/i.test(dest) || dest.startsWith('/')) {
      continue;
    }
    targets.push(dest);
  }
  return targets;
}

describe('static navigation regressions', () => {
  const readme = fs.readFileSync(README_PATH, 'utf8');
  const vercel = JSON.parse(fs.readFileSync(VERCEL_PATH, 'utf8'));

  it('resolves README relative markdown links and images to existing files', () => {
    const targets = relativeMarkdownTargets(readme);
    assert.ok(targets.length > 0, 'expected README to contain relative links');
    for (const target of targets) {
      assert.equal(
        fs.existsSync(path.join(ROOT, target)),
        true,
        `README links to missing path: ${target}`,
      );
    }
  });

  it('does not advertise deleted human-overview as the live entry point', () => {
    assert.match(readme, /\/docs\/request-for-microproducts/);
    assert.doesNotMatch(readme, /human-overview/);
    assert.doesNotMatch(readme, /ideation\.md/);
  });

  it('does not claim the deleted Hobby quota frontmatter check', () => {
    assert.doesNotMatch(readme, /hobby quota/i);
    assert.doesNotMatch(readme, /hobbyPlanLimits/);
    assert.doesNotMatch(
      readme,
      /deploy-quickstart Hobby/i,
    );
  });

  it('keeps permanent redirects from deleted public routes to live destinations', () => {
    assert.ok(Array.isArray(vercel.redirects), 'vercel.json redirects must be an array');

    for (const [source, destination] of DELETED_ROUTE_REDIRECTS) {
      const redirect = vercel.redirects.find((entry) => entry.source === source);
      assert.ok(redirect, `missing Vercel redirect for ${source}`);
      assert.equal(redirect.destination, destination, source);
      assert.equal(redirect.permanent, true, `${source} must be a permanent redirect`);
    }
  });

  it('does not send Vercel redirects to deleted slugs', () => {
    for (const redirect of vercel.redirects) {
      const destination = String(redirect.destination ?? '');
      if (/^[a-z][a-z0-9+.-]*:/i.test(destination)) {
        continue;
      }
      for (const slug of DELETED_DESTINATION_SLUGS) {
        assert.equal(
          destination.includes(slug),
          false,
          `${redirect.source} redirects to deleted slug ${slug}: ${destination}`,
        );
      }
    }
  });
});
