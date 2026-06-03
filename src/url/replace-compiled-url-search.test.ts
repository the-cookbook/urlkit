import { describe, expect, it } from 'vitest';
import { boolean } from '../schema/boolean.js';
import { int } from '../schema/int.js';
import { string } from '../schema/string.js';
import { compileStaticUrl } from '../static/compile-static-url.js';
import { compileRuntimeUrlDescriptor } from './compile-runtime-url-descriptor.js';
import { compileUrlDescriptor } from './compile-url-descriptor.js';
import { replaceCompiledUrlSearch } from './replace-compiled-url-search.js';

describe('replaceCompiledUrlSearch', () => {
  it('replaces only search and preserves path and hash', () => {
    const compiled = compileUrlDescriptor(compileRuntimeUrlDescriptor({ search: { q: string() } }));

    expect(
      replaceCompiledUrlSearch('/search?q=old&debug=true#top', { q: 'router' }, compiled),
    ).toBe('/search?q=router#top');
  });

  it('validates and serializes compiled schema values', () => {
    const compiled = compileUrlDescriptor(
      compileRuntimeUrlDescriptor({ search: { page: int(), active: boolean() } }),
    );

    expect(replaceCompiledUrlSearch('/search?q=old', { page: 2, active: false }, compiled)).toBe(
      '/search?page=2&active=false',
    );
  });

  it('supports default omission', () => {
    const compiled = compileUrlDescriptor(
      compileRuntimeUrlDescriptor({ search: { page: int().default(1) } }),
    );

    expect(
      replaceCompiledUrlSearch('/search?page=2', { page: 1 }, compiled, { defaults: 'omit' }),
    ).toBe('/search');
  });

  it('uses raw replacement when there is no search schema', () => {
    const compiled = compileUrlDescriptor(compileStaticUrl({ path: '/search' }));

    expect(
      replaceCompiledUrlSearch('/search?q=old', { q: 'router', tag: ['ts', 'url'] }, compiled),
    ).toBe('/search?q=router&tag=ts&tag=url');
  });
});
