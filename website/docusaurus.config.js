// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Crowdin OTA JS Client',
  tagline: 'JavaScript client library for Crowdin Over-The-Air Content Delivery',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
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
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          sidebarCollapsed: false,
          editUrl: 'https://github.com/crowdin/ota-client-js/tree/main/',
          remarkPlugins: [[require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }]],
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      // image: 'img/social-card.jpg',
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
                href: 'https://developer.crowdin.com/crowdin-apps-about/',
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
                label: 'Twitter',
                href: 'https://twitter.com/crowdin',
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
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),

  plugins: [
    [
      'docusaurus-plugin-typedoc',
      {
        entryPointStrategy: 'expand',
        entryPoints: ['../src/index.ts'],
        tsconfig: '../tsconfig.json',
        plugin: ['typedoc-plugin-rename-defaults'],
      }
    ]
  ]
};

module.exports = config;
