import {
  buildAgentPlaybookSidebar,
  buildHumanPlaybookSidebar,
  humanPlaybookTree,
} from '../humanPlaybook';
import {flattenPlaybookNodes} from '../../utils/playbookTree';

describe('human playbook data', () => {
  it('generates the canonical sidebar hierarchy', () => {
    expect(buildHumanPlaybookSidebar()).toEqual([
      {
        type: 'category',
        label: 'About',
        collapsible: false,
        items: ['human-overview', 'request-for-microproducts', 'authors'],
      },
      {
        type: 'category',
        label: 'Plan',
        collapsed: false,
        collapsible: false,
        items: ['playbook/frame/frame'],
      },
      {
        type: 'category',
        label: 'Build',
        collapsed: false,
        collapsible: false,
        items: ['playbook/build/build'],
      },
      {
        type: 'category',
        label: 'Operate',
        collapsed: false,
        collapsible: false,
        items: ['playbook/operate/operate'],
      },
    ]);
  });

  it('generates the agent mirror sidebar hierarchy', () => {
    expect(buildAgentPlaybookSidebar()).toEqual([
      'index',
      'human/index',
      {
        type: 'category',
        label: 'About',
        collapsible: false,
        items: [
          'human/human-overview',
          'human/request-for-microproducts',
          'human/authors',
        ],
      },
      {
        type: 'category',
        label: 'Plan',
        collapsed: false,
        collapsible: false,
        items: ['human/playbook/frame/frame'],
      },
      {
        type: 'category',
        label: 'Build',
        collapsed: false,
        collapsible: false,
        items: ['human/playbook/build/build'],
      },
      {
        type: 'category',
        label: 'Operate',
        collapsed: false,
        collapsible: false,
        items: ['human/playbook/operate/operate'],
      },
    ]);
  });

  it('keeps node IDs, document IDs, and routes unique', () => {
    const nodes = flattenPlaybookNodes(humanPlaybookTree);
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
    expect(() =>
      buildAgentPlaybookSidebar({
        id: 'root',
        title: 'Root',
        description: 'Missing document',
      }),
    ).toThrow('Playbook root is missing docId');
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
