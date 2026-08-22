import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

import {buildLlmsFullSources} from '../llmsFullSources.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

describe('llmsFullSources', () => {
  it('includes all playbook leaves from the tree', () => {
    const sources = buildLlmsFullSources(ROOT);
    const relPaths = sources.map(([rel]) => rel);

    assert.ok(relPaths.includes('docs/human/playbook/frame/frame.md'));
    assert.ok(relPaths.includes('docs/human/playbook/build/build.md'));
    assert.ok(relPaths.includes('docs/human/playbook/operate/operate.md'));
    assert.ok(relPaths.includes('docs/human/human-overview.mdx'));
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
