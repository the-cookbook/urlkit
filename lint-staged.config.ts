import type { Configuration } from 'lint-staged';

export default {
  '*.{ts,tsx}': [
    () => 'pnpm typecheck',
    'eslint --max-warnings=0 --no-warn-ignored',
    'prettier --check',
  ],

  '*.{js,jsx,mjs,cjs}': ['eslint --max-warnings=0 --no-warn-ignored', 'prettier --check'],

  '*.{json,md,css,yml,yaml}': ['prettier --check'],
} satisfies Configuration;
