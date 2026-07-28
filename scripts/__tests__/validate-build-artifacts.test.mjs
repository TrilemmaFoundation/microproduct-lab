import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, beforeEach, describe, it} from 'node:test';

import {
  OG_URL_SAMPLE_PAGE,
  collectBuildArtifactErrors,
  extractOgUrlAndCanonical,
} from '../validate-build-artifacts.mjs';

function writeFile(root, filePath, content = '') {
  const fullPath = path.join(root, filePath);
  fs.mkdirSync(path.dirname(fullPath), {recursive: true});
  fs.writeFileSync(fullPath, content, 'utf8');
}

function matchingDeepPageHtml(
  url = 'https://build.trilemma.foundation/docs/intro/what-is-a-microproduct',
) {
  return `<html><head><link rel=canonical href=${url}><meta property=og:url content=${url}></head></html>`;
}

describe('build artifact validation', () => {
  let root;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'build-artifacts-'));
  });

  afterEach(() => {
    fs.rmSync(root, {recursive: true, force: true});
  });

  it('accepts clean nested build output', () => {
    writeFile(root, 'build/assets/app.js', 'console.log("clean")');
    writeFile(root, 'build/index.html', '<main>clean</main>');
    writeFile(root, `build/${OG_URL_SAMPLE_PAGE}`, matchingDeepPageHtml());
    assert.deepEqual(collectBuildArtifactErrors(root), []);
  });

  it('requires the build directory', () => {
    assert.deepEqual(collectBuildArtifactErrors(root), ['Build directory missing: build']);
  });

  it('reports source maps and every forbidden JavaScript path', () => {
    writeFile(root, 'build/assets/app.js.map', '{}');
    writeFile(root, 'build/assets/local.js', `const path = ${JSON.stringify(root)};`);
    writeFile(root, 'build/assets/vercel.js', 'const path = "/vercel/path0";');
    writeFile(root, 'build/assets/ignored.txt', root);
    writeFile(root, `build/${OG_URL_SAMPLE_PAGE}`, matchingDeepPageHtml());

    const errors = collectBuildArtifactErrors(root);
    assert.ok(errors.some((error) => error.includes('Source map emitted')));
    assert.equal(errors.filter((error) => error.includes('Build path leaked')).length, 2);
  });

  it('extracts quoted and unquoted og:url and canonical values', () => {
    assert.deepEqual(
      extractOgUrlAndCanonical(
        '<link rel=canonical href=https://example.com/a><meta property=og:url content=https://example.com/a>',
      ),
      {ogUrl: 'https://example.com/a', canonical: 'https://example.com/a'},
    );
    assert.deepEqual(
      extractOgUrlAndCanonical(
        '<link rel="canonical" href="https://example.com/b"><meta property="og:url" content="https://example.com/b">',
      ),
      {ogUrl: 'https://example.com/b', canonical: 'https://example.com/b'},
    );
  });

  it('rejects mismatched og:url and canonical on the sample deep page', () => {
    writeFile(
      root,
      `build/${OG_URL_SAMPLE_PAGE}`,
      '<link rel=canonical href=https://build.trilemma.foundation/docs/intro/what-is-a-microproduct><meta property=og:url content=https://build.trilemma.foundation>',
    );
    const errors = collectBuildArtifactErrors(root);
    assert.ok(errors.some((error) => error.includes('og:url does not match canonical')));
  });

  it('rejects a missing Open Graph sample page', () => {
    writeFile(root, 'build/index.html', '<main>clean</main>');
    assert.ok(
      collectBuildArtifactErrors(root).some((error) =>
        error.includes('Missing Open Graph sample page'),
      ),
    );
  });

  it('rejects missing og:url or canonical attributes', () => {
    writeFile(
      root,
      `build/${OG_URL_SAMPLE_PAGE}`,
      '<html><head><link rel=canonical href=https://example.com/a></head></html>',
    );
    assert.ok(
      collectBuildArtifactErrors(root).some((error) => error.includes('Missing og:url')),
    );

    writeFile(
      root,
      `build/${OG_URL_SAMPLE_PAGE}`,
      '<html><head><meta property=og:url content=https://example.com/a></head></html>',
    );
    assert.ok(
      collectBuildArtifactErrors(root).some((error) =>
        error.includes('Missing canonical link'),
      ),
    );
  });
});
