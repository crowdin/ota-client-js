import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'doc',
      label: 'Introduction',
      id: 'intro',
    },
    {
      type: 'doc',
      label: 'Installation',
      id: 'installation',
    },
    {
      type: 'doc',
      label: 'Quick Start',
      id: 'quick-start',
    },
    {
      type: 'doc',
      label: 'Configuration',
      id: 'configuration',
    },
    {
      type: 'category',
      label: 'Tutorials',
      items: ['tutorials/lingui', 'tutorials/i18next', 'tutorials/react-native', 'tutorials/next-intl'],
    },
    {
      type: 'category',
      label: 'API',
      items: [
        {
          type: 'doc',
          label: 'OtaClient',
          id: 'api/index.Class.OtaClient',
        },
        {
          type: 'doc',
          label: 'Types',
          id: 'api/Types',
        }
      ]
    },
    {
      type: 'category',
      label: 'Releases',
      items: [
        'releases/migration-1',
        'releases/migration-2',
      ],
    },
  ],
};

module.exports = sidebars;
