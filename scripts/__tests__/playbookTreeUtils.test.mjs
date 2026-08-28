import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {flattenPlaybookNodes} from '../playbookTreeUtils.mjs';

describe('playbookTreeUtils', () => {
  it('flattens nested playbook nodes in depth-first order', () => {
    const tree = [
      {
        id: 'root',
        title: 'Root',
        description: 'Root',
        children: [
          {
            id: 'child',
            title: 'Child',
            description: 'Child',
            docId: 'playbook/frame/frame',
          },
        ],
      },
    ];
    const flat = flattenPlaybookNodes(tree);
    assert.equal(flat.length, 2);
    assert.equal(flat[0].id, 'root');
    assert.equal(flat[1].docId, 'playbook/frame/frame');
  });
});
