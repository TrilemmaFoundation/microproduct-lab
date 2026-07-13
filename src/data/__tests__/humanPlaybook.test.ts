import {
  buildHumanPlaybookSidebar,
  humanPlaybookTree,
  type PlaybookTreeNode,
} from '../humanPlaybook';

function flatten(nodes: PlaybookTreeNode[]): PlaybookTreeNode[] {
  return nodes.flatMap((node) => [node, ...flatten(node.children ?? [])]);
}

describe('human playbook data', () => {
  it('generates the canonical sidebar hierarchy', () => {
    expect(buildHumanPlaybookSidebar()).toEqual([
      'human-overview',
      {
        type: 'category',
        label: 'Playbook',
        items: [
          {
            type: 'category',
            label: 'Intro Section',
            items: [
              'playbook/intro/what-is-a-microproduct',
              'playbook/intro/mission',
            ],
          },
          {
            type: 'category',
            label: 'Frame Section',
            items: [
              'playbook/frame/frame',
              'playbook/frame/ideation',
              'playbook/frame/design',
              'playbook/frame/architecture',
              'playbook/frame/data-stack-analytics-engineering',
            ],
          },
          {
            type: 'category',
            label: 'Build Section',
            items: [
              'playbook/build/build',
              'playbook/build/build-module',
              'playbook/build/qa-methodology',
              'playbook/build/release',
            ],
          },
          {
            type: 'category',
            label: 'Operate Section',
            items: ['playbook/operate/operate'],
          },
        ],
      },
      {
        type: 'category',
        label: 'Resources',
        items: ['resources/index'],
      },
      {
        type: 'category',
        label: 'Authors',
        items: ['authors/index'],
      },
    ]);
  });

  it('keeps node IDs, document IDs, and routes unique', () => {
    const nodes = flatten(humanPlaybookTree);
    for (const field of ['id', 'docId', 'to'] as const) {
      const values = nodes.map((node) => node[field]).filter(Boolean);
      expect(new Set(values).size).toBe(values.length);
    }
  });

  it('rejects roots and leaves without document IDs', () => {
    expect(() =>
      buildHumanPlaybookSidebar({
        id: 'root',
        title: 'Root',
        description: 'Missing document',
      }),
    ).toThrow('Playbook root is missing docId');
    expect(() =>
      buildHumanPlaybookSidebar({
        id: 'root',
        title: 'Root',
        description: 'Root',
        docId: 'root',
        children: [{id: 'leaf', title: 'Leaf', description: 'Missing document'}],
      }),
    ).toThrow("Playbook leaf 'leaf' is missing docId");
  });

  it('generates a root-only sidebar', () => {
    expect(
      buildHumanPlaybookSidebar({
        id: 'root',
        title: 'Root',
        description: 'Root document',
        docId: 'root',
      }),
    ).toEqual(['root']);
  });
});
