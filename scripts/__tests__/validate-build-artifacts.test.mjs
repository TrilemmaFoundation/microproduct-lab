import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, beforeEach, describe, it} from 'node:test';

import {collectBuildArtifactErrors} from '../validate-build-artifacts.mjs';

function writeFile(root, filePath, content = '') {
  const fullPath = path.join(root, filePath);
  fs.mkdirSync(path.dirname(fullPath), {recursive: true});
  fs.writeFileSync(fullPath, content, 'utf8');
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

    const errors = collectBuildArtifactErrors(root);
    assert.ok(errors.some((error) => error.includes('Source map emitted')));
    assert.equal(errors.filter((error) => error.includes('Build path leaked')).length, 2);
  });
});
