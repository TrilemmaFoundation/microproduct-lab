import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  incubatorSidebar: [
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
  ],
};

export default sidebars;
