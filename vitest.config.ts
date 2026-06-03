import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      {
        find: '@cookbook/urlkit/router-runtime',
        replacement: resolve(rootDir, './src/router-runtime.ts'),
      },
      {
        find: '@cookbook/urlkit/static',
        replacement: resolve(rootDir, './src/static.ts'),
      },
      {
        find: '@cookbook/urlkit',
        replacement: resolve(rootDir, './src/index.ts'),
      },
    ],
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
