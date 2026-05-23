import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  incubatorSidebar: [
    'human-overview',
    {
      type: 'category',
      label: 'Intro',
      items: [
        'intro/what-is-a-microproduct',
        'intro/mission',
      ],
    },
    {
      type: 'category',
      label: 'Playbook',
      items: [
        {
          type: 'category',
          label: 'Frame',
          items: [
            'playbook/frame',
            'playbook/ideation',
            'playbook/architecture',
            'playbook/data-stack-analytics-engineering',
          ],
        },
        {
          type: 'category',
          label: 'Build',
          items: [
            'playbook/build',
            'playbook/build-module',
            'playbook/qa-methodology',
          ],
        },
        {
          type: 'category',
          label: 'Operate',
          items: ['playbook/operate'],
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
      items: ['intro/authors'],
    },
  ],
};

export default sidebars;
