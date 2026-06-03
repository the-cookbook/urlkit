import type { NextConfig } from 'next';

const repositoryRoot = new URL('../../..', import.meta.url).pathname;

const nextConfig: NextConfig = {
  outputFileTracingRoot: repositoryRoot,
  webpack(config) {
    config.resolve ??= {};

    // The shared integration examples import the repository TypeScript source
    // through ESM-style `.js` specifiers, matching the package source. Next's
    // webpack build needs an explicit extension alias so `./file.js` can resolve
    // to `./file.ts` before the package is built.
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      '.js': ['.ts', '.tsx', '.js'],
      '.jsx': ['.tsx', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    };

    return config;
  },
};

export default nextConfig;
