import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

import {buildLlmsFullSources} from '../llmsFullSources.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

describe('llmsFullSources', () => {
  it('omits draft and unlisted sources across human, archetype, and fixed doc sources', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'llms-visibility-'));
    try {
      for (const dir of ['docs', 'static', 'src/data']) {
        fs.cpSync(path.join(ROOT, dir), path.join(root, dir), {recursive: true});
      }
      const hidden = [
        ['docs/human/playbook/frame/frame.md', 'draft'],
        ['docs/archetypes/forecasting-product.md', 'unlisted'],
        ['docs/templates/index.md', 'draft'],
      ];
      for (const [rel, flag] of hidden) {
        const file = path.join(root, rel);
        fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/^---\n/, `---\n${flag}: true\n`));
      }
      const sources = buildLlmsFullSources(root).map(([rel]) => rel);
      for (const [rel] of hidden) assert.ok(!sources.includes(rel), rel);
      assert.ok(sources.includes('docs/human/playbook/build/build.md'));
      assert.ok(sources.includes('static/registry.json'));
    } finally {
      fs.rmSync(root, {recursive: true, force: true});
    }
  });
  it('includes all playbook leaves from the tree', () => {
    const sources = buildLlmsFullSources(ROOT);
    const relPaths = sources.map(([rel]) => rel);

    assert.ok(relPaths.includes('docs/human/playbook/frame/frame.md'));
    assert.ok(relPaths.includes('docs/human/playbook/build/build.md'));
    assert.ok(relPaths.includes('docs/human/playbook/operate/operate.md'));
    assert.ok(relPaths.includes('docs/human/request-for-microproducts.md'));
    assert.ok(relPaths.includes('static/registry.json'));
    assert.ok(relPaths.includes('docs/archetypes/simulation-backtesting-product.md'));
  });

  it('sorts sources deterministically', () => {
    const first = buildLlmsFullSources(ROOT).map(([rel]) => rel);
    const second = buildLlmsFullSources(ROOT).map(([rel]) => rel);
    assert.deepEqual(first, second);
    assert.deepEqual([...first].sort((a, b) => a.localeCompare(b, 'en')), first);
  });
});
