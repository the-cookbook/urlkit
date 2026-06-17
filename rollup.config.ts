import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';
import { dts } from 'rollup-plugin-dts';

const external = /^@cookbook\/pathkit(?:\/.*)?$/;

const runtimeEntries = {
  index: 'src/index.ts',
  static: 'src/static.ts',
  'router-runtime': 'src/router-runtime.ts',
};

const declarationEntries = {
  index: '.types/index.d.ts',
  static: '.types/static.d.ts',
  'router-runtime': '.types/router-runtime.d.ts',
};

export default defineConfig([
  {
    input: runtimeEntries,
    external,
    output: {
      dir: 'dist',
      entryFileNames: '[name].js',
      chunkFileNames: 'chunks/[name]-[hash].js',
      format: 'esm',
      sourcemap: false,
      compact: true,
      generatedCode: 'es2015',
      minifyInternalExports: true,
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.runtime.json',
      }),
      terser({
        ecma: 2022,
        module: true,
        compress: {
          passes: 2,
        },
        mangle: true,
        format: {
          comments: false,
        },
      }),
    ],
  },
  {
    input: declarationEntries,
    external,
    plugins: [dts()],
    output: {
      dir: 'dist',
      entryFileNames: '[name].d.ts',
      chunkFileNames: 'chunks/[name]-[hash].d.ts',
      format: 'esm',
    },
  },
]);
