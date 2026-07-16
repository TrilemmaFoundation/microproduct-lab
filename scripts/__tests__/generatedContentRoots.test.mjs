import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';

import {
  GENERATED_DOC_ROOTS,
  isUnderGeneratedContentRoot,
} from '../generatedContentRoots.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

describe('generatedContentRoots', () => {
  it('exports the generated mirror root', () => {
    assert.deepEqual(GENERATED_DOC_ROOTS, ['docs/agents/human']);
  });

  it('detects files under generated roots', () => {
    const generatedPath = path.join(ROOT, 'docs/agents/human/index.md');
    const canonicalPath = path.join(ROOT, 'docs/human/playbook/intro/mission.md');
    assert.equal(isUnderGeneratedContentRoot(generatedPath, ROOT), true);
    assert.equal(isUnderGeneratedContentRoot(canonicalPath, ROOT), false);
    assert.equal(
      isUnderGeneratedContentRoot('docs/agents/human/playbook/intro/mission.md', ROOT),
      true,
    );
  });
});
