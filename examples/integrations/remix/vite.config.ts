import { vitePlugin as remix } from '@remix-run/dev';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

const repositoryRoot = fileURLToPath(new URL('../../..', import.meta.url));
const sharedRoot = fileURLToPath(new URL('../shared', import.meta.url));
const builtUrlKit = fileURLToPath(new URL('../../../dist/index.js', import.meta.url));

function resolveLocalJsToTs(): Plugin {
  return {
    name: 'resolve-local-js-to-ts',
    enforce: 'pre',
    resolveId(source, importer) {
      if (
        !importer ||
        !source.startsWith('.') ||
        !(source.endsWith('.js') || source.endsWith('.jsx'))
      ) {
        return null;
      }

      const importerPath = importer.startsWith('file://')
        ? fileURLToPath(importer)
        : importer.split('?')[0];
      const resolvedPath = resolve(dirname(importerPath), source);

      if (resolvedPath === resolve(sharedRoot, 'urlkit.js')) {
        return builtUrlKit;
      }

      const candidates = source.endsWith('.jsx')
        ? [resolvedPath.replace(/\.jsx$/, '.tsx')]
        : [resolvedPath.replace(/\.js$/, '.ts'), resolvedPath.replace(/\.js$/, '.tsx')];

      return candidates.find((candidate) => existsSync(candidate)) ?? null;
    },
  };
}

export default defineConfig({
  plugins: [resolveLocalJsToTs(), remix()],
  resolve: {
    alias: {
      '@shared': sharedRoot,
    },
  },
  server: {
    fs: {
      allow: [repositoryRoot, sharedRoot],
    },
  },
  ssr: {
    external: [
      '@cookbook/pathkit',
      '@cookbook/pathkit/compile',
      '@cookbook/pathkit/constraints',
      '@cookbook/pathkit/match',
      '@remix-run/node',
      '@remix-run/react',
      'react',
      'react-dom',
      'react/jsx-dev-runtime',
      'react/jsx-runtime',
      'react-dom/client',
      'react-refresh/runtime',
    ],
  },
});
