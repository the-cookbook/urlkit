import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import { defineConfig } from 'rollup';

export default defineConfig({
  external: [/^@cookbook\/pathkit(?:\/.*)?$/],
  input: {
    index: 'src/index.ts',
    static: 'src/static.ts',
    'router-runtime': 'src/router-runtime.ts',
  },
  output: {
    dir: 'dist',
    entryFileNames: '[name].js',
    format: 'esm',
    sourcemap: false,
    compact: true,
    generatedCode: 'es2015',
    minifyInternalExports: true,
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      exclude: ['src/**/*.test.ts'],
      compilerOptions: {
        declaration: false,
        declarationMap: false,
        noEmit: false,
      },
    }),
    terser({
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
});
