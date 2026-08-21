import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, beforeEach, describe, it} from 'node:test';

import {collectPlaybookTreeErrors} from '../validate-playbook-tree.mjs';

const repoRoot = path.resolve(import.meta.dirname, '../..');

function writeFile(root, filePath, content) {
  const fullPath = path.join(root, filePath);
  fs.mkdirSync(path.dirname(fullPath), {recursive: true});
  fs.writeFileSync(fullPath, content, 'utf8');
}

describe('playbook tree validation', () => {
  let root;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'playbook-tree-validator-'));
    writeFile(
      root,
      'src/data/humanPlaybook.data.json',
      JSON.stringify([
        {
          id: 'frame',
          title: 'Frame',
          description: 'Frame description',
          docId: 'playbook/frame/frame',
          to: '/docs/playbook/frame',
        },
      ]),
    );
    writeFile(root, 'docs/human/playbook/frame/frame.md', '# Frame\n');
  });

  afterEach(() => {
    fs.rmSync(root, {recursive: true, force: true});
  });

  it('accepts a tree that matches docs on disk', () => {
    assert.deepEqual(collectPlaybookTreeErrors(root), []);
    assert.deepEqual(collectPlaybookTreeErrors(repoRoot), []);
  });

  it('reports missing source files for docIds', () => {
    fs.rmSync(path.join(root, 'docs/human/playbook/frame/frame.md'));
    assert.ok(
      collectPlaybookTreeErrors(root).some((error) =>
        error.includes("Source not found for docId 'playbook/frame/frame'"),
      ),
    );
  });

  it('reports orphan docs not referenced by the tree', () => {
    writeFile(root, 'docs/human/playbook/frame/orphan.md', '# Orphan\n');
    assert.ok(
      collectPlaybookTreeErrors(root).some((error) =>
        error.includes('docs/human/playbook/frame/orphan.md: not referenced'),
      ),
    );
  });

  it('reports missing tree and docs roots', () => {
    fs.rmSync(path.join(root, 'src/data/humanPlaybook.data.json'));
    assert.ok(
      collectPlaybookTreeErrors(root).some((error) =>
        error.includes('human playbook tree is missing'),
      ),
    );

    fs.rmSync(path.join(root, 'docs/human'), {recursive: true});
    writeFile(
      root,
      'src/data/humanPlaybook.data.json',
      JSON.stringify([
        {
          id: 'frame',
          title: 'Frame',
          description: 'Frame description',
          docId: 'playbook/frame/frame',
          to: '/docs/playbook/frame',
        },
      ]),
    );
    assert.ok(
      collectPlaybookTreeErrors(root).some((error) => error.includes('human docs root is missing')),
    );
  });
});
