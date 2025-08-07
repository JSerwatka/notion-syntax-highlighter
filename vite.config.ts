import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';

import manifest from './src/manifest';
import { TARGET } from './consts';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
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
