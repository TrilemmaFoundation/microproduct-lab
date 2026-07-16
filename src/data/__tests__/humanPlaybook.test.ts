import {
  buildAgentPlaybookSidebar,
  buildHumanPlaybookSidebar,
  humanPlaybookTree,
} from '../humanPlaybook';
import {flattenPlaybookNodes} from '../../utils/playbookTree';

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
            label: 'Intro',
            items: [
              'playbook/intro/what-is-a-microproduct',
              'playbook/intro/our-approach',
              'playbook/intro/mission',
            ],
          },
          {
            type: 'category',
            label: 'Frame',
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
            label: 'Build',
            items: [
              'playbook/build/build',
              'playbook/build/build-module',
              'playbook/build/qa-methodology',
              'playbook/build/release',
              'playbook/build/deploy-quickstart',
            ],
          },
          {
            type: 'category',
            label: 'Operate',
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

  it('generates the agent mirror sidebar hierarchy', () => {
    expect(buildAgentPlaybookSidebar()).toEqual([
      'index',
      'human/index',
      'human/human-overview',
      {
        type: 'category',
        label: 'Playbook',
        items: [
          {
            type: 'category',
            label: 'Intro',
            items: [
              'human/playbook/intro/what-is-a-microproduct',
              'human/playbook/intro/our-approach',
              'human/playbook/intro/mission',
            ],
          },
          {
            type: 'category',
            label: 'Frame',
            items: [
              'human/playbook/frame/frame',
              'human/playbook/frame/ideation',
              'human/playbook/frame/design',
              'human/playbook/frame/architecture',
              'human/playbook/frame/data-stack-analytics-engineering',
            ],
          },
          {
            type: 'category',
            label: 'Build',
            items: [
              'human/playbook/build/build',
              'human/playbook/build/build-module',
              'human/playbook/build/qa-methodology',
              'human/playbook/build/release',
              'human/playbook/build/deploy-quickstart',
            ],
          },
          {
            type: 'category',
            label: 'Operate',
            items: ['human/playbook/operate/operate'],
          },
        ],
      },
      {
        type: 'category',
        label: 'Resources',
        items: ['human/resources/index'],
      },
      {
        type: 'category',
        label: 'Authors',
        items: ['human/authors/index'],
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
