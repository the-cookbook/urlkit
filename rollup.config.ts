import typescript from '@rollup/plugin-typescript';
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
    sourcemap: true,
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
  ],
});
