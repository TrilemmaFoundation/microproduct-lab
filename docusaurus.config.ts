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
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

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
          path: 'docs/human',
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
        docRoots: ['docs/human', ...docsIslandPlugins.map((spec) => spec.path)],
      },
    ],
  ]),

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    mermaid: {
      // Match the label-measurement font to the rendered font so node
      // boxes are sized correctly and text isn't clipped.
      options: {
        fontFamily: 'var(--ifm-font-family-base)',
        flowchart: {
          useMaxWidth: false,
        },
      },
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
        src: 'img/foundation_white.webp',
        srcDark: 'img/foundation_white.webp',
        href: '/',
        height: 32,
      },
    },
    footer: {
      style: 'light',
      links: [
        {
          className: 'footer-col--foundation',
          items: [
            {
              html: `<div class="footer-foundation">
  <a class="footer-foundation__logo-link" href="/" aria-label="Trilemma Foundation home">
    <img class="footer-foundation__logo" src="/img/foundation_white.webp" alt="Trilemma Foundation" loading="lazy" />
  </a>
  <p class="footer-foundation__description">
    Trilemma Foundation is a Canadian Registered Charity that incubates technical talent through global university partnerships, open source collaboration, and performance based opportunities. Our mission is to enable the brightest minds to rise based on performance.
  </p>
</div>`,
            },
          ],
        },
        {
          title: 'Quick Links',
          className: 'footer-col--quick-links',
          items: [
            { label: 'Home', to: '/' },
            {
              label: 'Human Overview',
              to: '/docs/human-overview',
            },
            { label: 'Templates', to: '/templates' },
            { label: 'Agents', to: '/agents' },
            { label: 'Showcase', to: '/showcase' },
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
      copyright: `© ${new Date().getFullYear()} Trilemma Foundation. All rights reserved.`,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
