import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { SITE_URL } from './siteUrl';
import docReadTimesPlugin from './src/plugins/docReadTimes';

const REPO_URL = 'https://github.com/TrilemmaFoundation/microproduct-lab';

const DOC_ISLAND_EDIT_URL = `${REPO_URL}/edit/main/`;

const docsIslandPlugins = [
  {
    id: 'showcase',
    path: 'docs/showcase',
    routeBasePath: 'showcase',
    sidebarPath: false as const,
  },
  {
    id: 'contribute',
    path: 'docs/contribute',
    routeBasePath: 'contribute',
    sidebarPath: false as const,
  },
  {
    id: 'agents',
    path: 'docs/agents',
    routeBasePath: 'agents',
    sidebarPath: false as const,
  },
  {
    id: 'templates',
    path: 'docs/templates',
    routeBasePath: 'templates',
    sidebarPath: false as const,
  },
  {
    id: 'archetypes',
    path: 'docs/archetypes',
    routeBasePath: 'archetypes',
    sidebarPath: './sidebars.archetypes.ts' as const,
  },
  {
    id: 'standards',
    path: 'docs/standards',
    routeBasePath: 'standards',
    sidebarPath: './sidebars.standards.ts' as const,
  },
] as const;

const config: Config = {
  title: 'Build Trilemma',
  tagline:
    'The AI-agent control panel for building microproducts—patterns, templates, standards, and a machine-readable registry.',
  favicon: 'img/favicon.ico',

  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'apple-touch-icon',
        href: '/img/apple-touch-icon.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/img/favicon-32x32.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/img/favicon-16x16.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'manifest',
        href: '/site.webmanifest',
      },
    },
  ],

  url: SITE_URL,
  baseUrl: '/',

  organizationName: 'TrilemmaFoundation',
  projectName: 'microproduct-lab',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        debug: false,
        docs: {
          path: 'docs/core',
          sidebarPath: './sidebars.ts',
          editUrl: `${REPO_URL}/edit/main/`,
        },
        blog: false,
        pages: {},
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  plugins: docsIslandPlugins.map(
    (spec) =>
      [
        '@docusaurus/plugin-content-docs',
        {
          id: spec.id,
          path: spec.path,
          routeBasePath: spec.routeBasePath,
          sidebarPath: spec.sidebarPath,
          editUrl: DOC_ISLAND_EDIT_URL,
        },
      ] as const,
  ).concat([
    [
      docReadTimesPlugin,
      {
        siteDir: __dirname,
        docRoots: ['docs/core', ...docsIslandPlugins.map((spec) => spec.path)],
      },
    ],
  ]),

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    metadata: [
      { property: 'og:title', content: 'Build Trilemma' },
      {
        property: 'og:description',
        content:
          'Canonical place to discover microproduct patterns, templates, build instructions, and a machine-readable product registry—for humans and AI agents.',
      },
      { property: 'og:url', content: SITE_URL },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    navbar: {
      logo: {
        alt: 'Trilemma Foundation',
        src: 'img/trilemma_foundation_white.png',
        srcDark: 'img/trilemma_foundation_white.png',
        href: '/',
        height: 26,
      },
      items: [
        { to: '/', label: 'Home', position: 'left' },
        {
          type: 'dropdown',
          label: 'Humans',
          position: 'left',
          activeBaseRegex: '^/(docs|contribute|showcase)(/|$)',
          items: [
            {
              to: '/docs/intro/what-is-a-microproduct',
              label: 'What is a microproduct?',
            },
            {
              to: '/docs/intro/mission',
              label: 'Mission',
            },
            {
              to: '/docs/playbook/getting-started',
              label: 'Getting started',
            },
            {
              to: '/docs/playbook/ideation',
              label: 'Ideation',
            },
            {
              to: '/contribute',
              label: 'How to contribute',
            },
            {
              to: '/showcase',
              label: 'Showcase',
            },
          ],
        },
        {
          type: 'dropdown',
          label: 'Agents',
          position: 'left',
          activeBaseRegex: '^/agents(/|$)',
          items: [
            { to: '/agents', label: 'Agents hub' },
            { label: 'AGENTS.md', href: 'pathname:///AGENTS.md' },
            { label: 'llms-full.txt', href: 'pathname:///llms-full.txt' },
            { label: 'registry.json', href: 'pathname:///registry.json' },
            {
              label: 'product.schema.json',
              href: 'pathname:///schemas/product.schema.json',
            },
          ],
        },
      ],
    },
    footer: {
      // Infima: 'light' omits .footer--dark (hardcoded grey/blue); tokens come from custom.css.
      style: 'light',
      links: [
        {
          className: 'footer-col--foundation',
          items: [
            {
              html: `<div class="footer-foundation">
  <a class="footer-foundation__logo-link" href="/" aria-label="Trilemma Foundation home">
    <img class="footer-foundation__logo" src="/img/trilemma_foundation_white.png" alt="Trilemma Foundation" loading="lazy" />
  </a>
  <p class="footer-foundation__description">
    Trilemma Foundation is a Canadian Registered Charity that incubates technical talent through global university partnerships, open source collaboration, and performance based opportunities. Our mission is to enable the brightest minds to rise based on performance.
  </p>
</div>`,
            },
          ],
        },
        {
          title: 'On this site',
          className: 'footer-col--on-site',
          items: [
            { label: 'Home', to: '/' },
            { label: 'Agents', to: '/agents' },
            {
              label: 'Human intro',
              to: '/docs/intro/what-is-a-microproduct',
            },
          ],
        },
        {
          title: 'Connect',
          className: 'footer-col--connect',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.gg/AS7WMx7Cy2',
            },
            {
              label: 'X (Twitter)',
              href: 'https://x.com/TrilemmaFdn',
            },
            {
              label: 'LinkedIn',
              href: 'https://www.linkedin.com/company/trilemma-foundation/',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/TrilemmaFoundation',
            },
            {
              label: 'Email',
              href: 'mailto:matt@trilemma.foundation',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Trilemma Foundation`,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
