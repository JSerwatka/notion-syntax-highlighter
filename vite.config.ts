import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';

import manifest from './src/manifest';
import { TARGET } from './consts';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    server: {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Allow-Headers': '*'
      },
      hmr: {
        // Helps HMR/connect from a chrome-extension:// origin during dev
        clientPort: 5173
      }
    },
    build: {
      emptyOutDir: true,
      outDir: TARGET === 'chrome' ? 'build' : 'build.firefox',
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/chunk-[hash].js'
        }
      }
    },

    plugins: [crx({ manifest, browser: TARGET as any })]
  };
});
