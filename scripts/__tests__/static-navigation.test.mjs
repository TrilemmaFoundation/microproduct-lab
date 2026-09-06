import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {describe, it} from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '../..');

const README_PATH = path.join(ROOT, 'README.md');
const VERCEL_PATH = path.join(ROOT, 'vercel.json');

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

  it('tells contributors to install with npm ci so the lockfile stays stable', () => {
    assert.match(readme, /npm ci/);
    assert.match(readme, /package-lock\.json/);
  });

  it('does not keep compatibility redirects', () => {
    const vercel = JSON.parse(fs.readFileSync(VERCEL_PATH, 'utf8'));
    assert.equal(Object.hasOwn(vercel, 'redirects'), false);
  });
});
