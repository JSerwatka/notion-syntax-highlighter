import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  name: 'Notion Syntax Highlighter',
  description: "Improves Notion's code blocks syntax highlighting + adds tons of theme options",
  version: '0.0.1',
  manifest_version: 3,
  icons: {
    '16': 'img/logo-16.png',
    '32': 'img/logo-32.png',
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
      js: ['src/content/index.ts'],
      run_at: 'document_start'
    }
  ],
  web_accessible_resources: [
    {
      resources: ['img/logo-16.png', 'img/logo-32.png', 'img/logo-48.png', 'img/logo-128.png'],
      matches: []
    }
  ],
  permissions: ['storage', 'scripting']
});
