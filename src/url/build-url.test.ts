import { describe, expect, it } from 'vitest';
import { string } from '../schema/string.js';
import { compileRuntimeUrlDescriptor } from './compile-runtime-url-descriptor.js';
import { compileUrlDescriptor } from './compile-url-descriptor.js';
import { buildUrl } from './build-url.js';

describe('buildUrl', () => {
  it('delegates URL building to a compiled URL descriptor', () => {
    const compiled = compileUrlDescriptor(
      compileRuntimeUrlDescriptor({
        path: '/search',
        search: {
          q: string(),
        },
      }),
    );

    expect(buildUrl({ search: { q: 'router' } }, compiled)).toBe('/search?q=router');
  });
});
