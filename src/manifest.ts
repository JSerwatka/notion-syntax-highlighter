import { defineManifest, ManifestV3Export } from '@crxjs/vite-plugin';
import { TARGET } from '../consts';

const manifestBase: ManifestV3Export = {
  name: 'Notion Syntax Highlighter',
  description: "Improves Notion's code blocks syntax highlighting + adds tons of theme options",
  version: '0.0.8',
  manifest_version: 3,
  permissions: ['storage'],
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
  ]
};

if (TARGET === 'chrome') {
  manifestBase.background = {
    service_worker: 'src/background/index.ts',
    type: 'module'
  };
} else {
  // FIREFOX
  (manifestBase as any).browser_specific_settings = {
    gecko: {
      id: 'notion-syntax-highlighter@example.com',
      strict_min_version: '112.0'
    }
  };

  manifestBase.background = {
    scripts: ['src/background/index.ts'],
    type: 'module'
  };
}

export default defineManifest(manifestBase);
