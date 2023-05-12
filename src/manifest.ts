import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  name: 'create-chrome-ext',
  description: 'Adds better syntax highlighting and theme customization to code blocks on Notion.',
  version: '0.0.0',
  manifest_version: 3,
  icons: {
    '16': 'img/logo-16.png',
    '32': 'img/logo-34.png',
    '48': 'img/logo-48.png',
    '128': 'img/logo-128.png'
  },
  action: {
    default_popup: 'popup.html',
    default_icon: 'img/logo-48.png'
  },
  options_page: 'options.html',
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module'
  },
  content_scripts: [
    {
      matches: ['https://*.notion.so/*'],
      js: ['src/content/index.ts']
    }
  ],
  web_accessible_resources: [
    {
      resources: ['img/logo-16.png', 'img/logo-34.png', 'img/logo-48.png', 'img/logo-128.png'],
      matches: []
    },
    {
      resources: ['styles/*', 'styles/base16/*'],
      matches: ['https://*.notion.so/*']
    },
    {
      resources: ['inject-script.js'],
      matches: ['https://*.notion.so/*']
    }
  ],
  permissions: ['storage', 'tabs', 'scripting', 'activeTab']
});
