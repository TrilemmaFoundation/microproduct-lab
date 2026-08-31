import type {Config, PluginConfig} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type {PluginOptions as LocalSearchOptions} from '@easyops-cn/docusaurus-search-local';
import { SITE_URL } from './siteUrl';
import {humanPlaybookTree} from './src/data/humanPlaybook';
import authorPagesPlugin from './src/plugins/authorPages';
import docReadTimesPlugin from './src/plugins/docReadTimes';
import {agentMirrorSearchIgnoreFiles} from './src/utils/agentMirrorSearchIgnore';

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
    sidebarPath: './sidebars.agents.ts' as const,
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

const plugins: PluginConfig[] = [
  ...docsIslandPlugins.map(
    (spec): PluginConfig => [
      '@docusaurus/plugin-content-docs',
      {
        id: spec.id,
        path: spec.path,
        routeBasePath: spec.routeBasePath,
        sidebarPath: spec.sidebarPath,
        editUrl: DOC_ISLAND_EDIT_URL,
      },
    ],
  ),
  [
    docReadTimesPlugin,
    {
      docRoots: ['docs/human', ...docsIslandPlugins.map((spec) => spec.path)],
    },
  ],
  authorPagesPlugin,
  [
    '@docusaurus/plugin-vercel-analytics',
    {
      mode: 'auto',
    },
  ],
];

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
  future: {
    v4: {
      removeLegacyPostBuildHeadAttribute: true,
    },
    faster: true,
  },
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },
  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        indexDocs: true,
        indexBlog: false,
        indexPages: false,
        language: 'en',
        docsRouteBasePath: [
          'docs',
          ...docsIslandPlugins.map((spec) => spec.routeBasePath),
        ],
        ignoreFiles: agentMirrorSearchIgnoreFiles(humanPlaybookTree),
        searchBarShortcut: true,
        searchBarShortcutKeymap: 'mod+k',
        searchBarPosition: 'right',
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      } satisfies LocalSearchOptions,
    ],
  ],

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
  plugins,

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
      // Do not set og:url here — Docusaurus emits the per-page canonical URL.
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
          title: 'Quick Links',
          className: 'footer-col--quick-links',
          items: [
            { label: 'Home', to: '/' },
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
              html: `<a class="footer-social-link" href="https://discord.gg/AS7WMx7Cy2" target="_blank" rel="noopener noreferrer" aria-label="Discord">
  <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.32 4.37A19.8 19.8 0 0 0 15.36 2.8a.07.07 0 0 0-.08.04c-.21.38-.45.88-.62 1.27a18.27 18.27 0 0 0-5.32 0 12.63 12.63 0 0 0-.63-1.27.08.08 0 0 0-.08-.04A19.74 19.74 0 0 0 3.68 4.37a.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.05c0 .02.01.05.03.06a19.9 19.9 0 0 0 6.08 3.07.08.08 0 0 0 .08-.03c.47-.64.89-1.31 1.24-2.02a.08.08 0 0 0-.04-.1 12.98 12.98 0 0 1-1.9-.9.08.08 0 0 1 0-.13c.13-.1.26-.2.38-.3a.08.08 0 0 1 .08-.01c3.96 1.81 8.24 1.81 12.16 0a.08.08 0 0 1 .08.01c.13.1.25.2.38.3a.08.08 0 0 1 0 .13c-.6.35-1.23.66-1.9.9a.08.08 0 0 0-.04.1c.36.71.77 1.38 1.24 2.02a.08.08 0 0 0 .08.03 19.84 19.84 0 0 0 6.09-3.07.08.08 0 0 0 .03-.06c.5-5.17-.84-9.66-3.86-13.65a.06.06 0 0 0-.03-.03ZM8.02 15.33c-1.19 0-2.18-1.09-2.18-2.43 0-1.35.96-2.44 2.18-2.44 1.23 0 2.2 1.1 2.18 2.44 0 1.34-.96 2.43-2.18 2.43Zm7.97 0c-1.19 0-2.18-1.09-2.18-2.43 0-1.35.96-2.44 2.18-2.44 1.23 0 2.2 1.1 2.18 2.44 0 1.34-.95 2.43-2.18 2.43Z"/></svg>
</a>`,
            },
            {
              html: `<a class="footer-social-link" href="https://x.com/TrilemmaFdn" target="_blank" rel="noopener noreferrer" aria-label="X">
  <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.9 2h3.68l-8.04 9.19L24 22h-7.41l-5.8-7.59L4.15 22H.47l8.6-9.83L0 2h7.59l5.24 6.93L18.9 2Zm-1.29 18.1h2.04L6.48 3.8H4.29L17.61 20.1Z"/></svg>
</a>`,
            },
            {
              html: `<a class="footer-social-link" href="https://github.com/TrilemmaFoundation" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
  <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.14c-3.2.7-3.87-1.36-3.87-1.36-.53-1.34-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.24 3.34.95.1-.74.4-1.24.73-1.53-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.18a10.94 10.94 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.63 1.58.23 2.75.12 3.04.74.8 1.18 1.83 1.18 3.08 0 4.42-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.79.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/></svg>
</a>`,
            },
            {
              html: `<a class="footer-social-link" href="https://www.linkedin.com/company/trilemma-foundation/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
  <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V8.99h3.42v1.57h.05a3.75 3.75 0 0 1 3.37-1.85c3.61 0 4.28 2.38 4.28 5.47v6.27ZM5.32 7.42a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13Zm1.78 13.03H3.54V8.99H7.1v11.46ZM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.23 0Z"/></svg>
</a>`,
            },
            {
              html: `<a class="footer-social-link" href="mailto:matt@trilemma.foundation" aria-label="Email">
  <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3.5 5A2.5 2.5 0 0 0 1 7.5v9A2.5 2.5 0 0 0 3.5 19h17a2.5 2.5 0 0 0 2.5-2.5v-9A2.5 2.5 0 0 0 20.5 5h-17Zm0 2h17c.17 0 .32.03.46.1L12 12.68 3.04 7.1c.14-.07.29-.1.46-.1Zm-.5 2.24 8.47 5.28a1 1 0 0 0 1.06 0L21 9.24v7.26a.5.5 0 0 1-.5.5h-17a.5.5 0 0 1-.5-.5V9.24Z"/></svg>
</a>`,
            },
          ],
        },
      ],
      copyright: `© <a href="https://www.trilemma.foundation/" target="_blank" rel="noopener noreferrer">Trilemma Foundation</a>`,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
