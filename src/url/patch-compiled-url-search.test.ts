import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { boolean } from '../schema/boolean.js';
import { int } from '../schema/int.js';
import { string } from '../schema/string.js';
import { compileStaticUrl } from '../static/compile-static-url.js';
import { compileRuntimeUrlDescriptor } from './compile-runtime-url-descriptor.js';
import { compileUrlDescriptor } from './compile-url-descriptor.js';
import { patchCompiledUrlSearch } from './patch-compiled-url-search.js';

describe('patchCompiledUrlSearch', () => {
  it('patches compiled search and preserves path and hash', () => {
    const compiled = compileUrlDescriptor(
      compileStaticUrl({ path: '/search', search: { q: 'string' } }),
    );

    expect(patchCompiledUrlSearch('/search?q=old&debug=true#top', { q: 'router' }, compiled)).toBe(
      '/search?q=router&debug=true#top',
    );
  });

  it('preserves unknown search by default for schema-aware patches', () => {
    const compiled = compileUrlDescriptor(compileRuntimeUrlDescriptor({ search: { q: string() } }));

    expect(patchCompiledUrlSearch('/products?q=old&debug=true', { q: 'router' }, compiled)).toBe(
      '/products?q=router&debug=true',
    );
  });

  it('supports removeUndefined and removeNull', () => {
    const compiled = compileUrlDescriptor(
      compileRuntimeUrlDescriptor({ search: { q: string(), page: int().optional() } }),
    );

    expect(
      patchCompiledUrlSearch(
        '/search?q=router&page=2&debug=true',
        { page: undefined, debug: null },
        compiled,
        {
          removeUndefined: true,
          removeNull: true,
        },
      ),
    ).toBe('/search?q=router');
  });

  it('validates the final patched search', () => {
    const compiled = compileUrlDescriptor(compileRuntimeUrlDescriptor({ search: { q: string() } }));

    expect(() => patchCompiledUrlSearch('/search?debug=true', {}, compiled)).toThrow(
      expect.objectContaining({ code: 'missing-search' }),
    );
  });

  it('serializes all supported patched scalar kinds through compiled codecs', () => {
    const compiled = compileUrlDescriptor(
      compileRuntimeUrlDescriptor({
        search: {
          q: string(),
          page: int(),
          active: boolean(),
        },
      }),
    );

    expect(
      patchCompiledUrlSearch(
        '/search?q=old&page=1&active=true',
        { q: 'router', page: 2, active: false },
        compiled,
      ),
    ).toBe('/search?q=router&page=2&active=false');
  });

  it('supports raw patching when the contract has no search schema', () => {
    const compiled = compileUrlDescriptor(compileStaticUrl({ path: '/search' }));

    expect(
      patchCompiledUrlSearch('/search?q=old', { q: 'router', tag: ['ts', 'url'] }, compiled),
    ).toBe('/search?q=router&tag=ts&tag=url');
  });

  it('throws invalid URL errors for invalid input', () => {
    const compiled = compileUrlDescriptor(compileStaticUrl({ path: '/search' }));

    expect(() => patchCompiledUrlSearch({} as never, {}, compiled)).toThrow(UrlKitError);
  });
});
