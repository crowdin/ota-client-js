import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import { themes } from "prism-react-renderer";
import { PluginOptions } from "@easyops-cn/docusaurus-search-local";

const config: Config = {
  title: 'Crowdin OTA JS Client',
  tagline: 'JavaScript client library for Crowdin Over-The-Air Content Delivery',
  favicon: 'img/favicon.ico',

  url: 'https://crowdin.github.io/',
  baseUrl: '/ota-client-js',
  organizationName: 'crowdin',
  projectName: 'ota-client-js',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          sidebarCollapsed: false,
          editUrl: 'https://github.com/crowdin/ota-client-js/tree/main/website/',
          remarkPlugins: [[require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }]],
        },
        blog: false,
        sitemap: {
          changefreq: "weekly",
          priority: 0.5,
          filename: "sitemap.xml",
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      ({
        hashed: true,
        docsRouteBasePath: '/',
        indexBlog: false,
      } satisfies PluginOptions),
    ]
  ],

  themeConfig:
    ({
      navbar: {
        title: 'Crowdin OTA JS Client',
        logo: {
          alt: 'Crowdin OTA JS Client',
          src: 'img/logo.png',
        },
        items: [
          {
            href: 'https://github.com/crowdin/ota-client-js',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Crowdin',
            items: [
              {
                label: 'Why Crowdin?',
                href: 'https://crowdin.com/features/',
              },
              {
                label: 'Developer Portal',
                href: 'https://support.crowdin.com/developer/crowdin-apps-about/',
              },
              {
                label: 'Knowledge Base',
                href: 'https://support.crowdin.com/translation-process-overview/',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Community Forum',
                href: 'https://community.crowdin.com/',
              },
              {
                label: 'X',
                href: 'https://x.com/crowdin',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/crowdin/ota-client-js',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} OTA JS Client, Crowdin.`,
      },
      prism: {
        theme: themes.github,
        darkTheme: themes.dracula,
      },
    }) satisfies Preset.ThemeConfig,

  plugins: [
    [
      // https://typedoc-plugin-markdown.org/plugins/docusaurus/quick-start
      'docusaurus-plugin-typedoc',
      {
        plugin: ['typedoc-plugin-rename-defaults'],
        entryPoints: ['../src/index.ts', '../src/model.ts'],
        entryPointStrategy: 'expand',
        outputFileStrategy: 'members',
        flattenOutputFiles: true,
        membersWithOwnFile: ['Class'],
        parametersFormat: 'table',
        interfacePropertiesFormat: 'table',
        categoryOrder: ['Strings Management Methods', 'Content Management Methods', 'Helper Methods'],
        sort: 'source-order',
        tsconfig: '../tsconfig.json',
        watch: process.env.TYPEDOC_WATCH,
      }
    ]
  ]
};

module.exports = config;
