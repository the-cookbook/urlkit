import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { enumOf } from '../schema/enum-of.js';
import { int } from '../schema/int.js';
import { string } from '../schema/string.js';
import { compileRuntimeUrlDescriptor } from './compile-runtime-url-descriptor.js';
import { compileUrlDescriptor } from './compile-url-descriptor.js';
import { parseCompiledUrl } from './parse-compiled-url.js';

describe('parseCompiledUrl', () => {
  it('parses path-based URL state with params, search, and hash', () => {
    const compiled = compileUrlDescriptor(
      compileRuntimeUrlDescriptor({
        path: '/users/{id:int}',
        search: {
          tab: enumOf(['profile', 'settings']).default('profile'),
          ref: string().optional(),
        },
        hash: enumOf(['activity', 'comments']).optional(),
      }),
    );

    const state = parseCompiledUrl<
      '/users/42',
      { readonly id: number },
      { readonly tab: string; readonly ref?: string },
      string | undefined
    >('/users/42?ref=email#activity', compiled, 'strip');

    expect(state).toEqual({
      pathname: '/users/42',
      params: { id: 42 },
      search: { tab: 'profile', ref: 'email' },
      hash: 'activity',
    });
    expect(Object.isFrozen(state)).toBe(true);
  });

  it('accepts any pathname for pathless descriptors', () => {
    const compiled = compileUrlDescriptor(
      compileRuntimeUrlDescriptor({
        search: {
          page: int().default(1),
        },
      }),
    );

    expect(parseCompiledUrl('/products?page=2', compiled, 'strip')).toEqual({
      pathname: '/products',
      params: {},
      search: { page: 2 },
      hash: undefined,
    });
    expect(parseCompiledUrl('/other?page=3', compiled, 'strip')).toEqual({
      pathname: '/other',
      params: {},
      search: { page: 3 },
      hash: undefined,
    });
  });

  it('validates pathnames for path descriptors', () => {
    const compiled = compileUrlDescriptor(compileRuntimeUrlDescriptor({ path: '/users/{id:int}' }));

    expect(() => parseCompiledUrl('/projects/42', compiled, 'strip')).toThrow(UrlKitError);

    try {
      parseCompiledUrl('/projects/42', compiled, 'strip');
    } catch (error) {
      expect((error as UrlKitError).code).toBe('path-mismatch');
    }
  });

  it('validates search values', () => {
    const compiled = compileUrlDescriptor(
      compileRuntimeUrlDescriptor({
        path: '/search',
        search: {
          page: int(),
        },
      }),
    );

    expect(() => parseCompiledUrl('/search?page=wrong', compiled, 'strip')).toThrow(UrlKitError);

    try {
      parseCompiledUrl('/search?page=wrong', compiled, 'strip');
    } catch (error) {
      expect((error as UrlKitError).code).toBe('invalid-search');
    }
  });

  it('validates hash values', () => {
    const compiled = compileUrlDescriptor(
      compileRuntimeUrlDescriptor({
        path: '/docs',
        hash: enumOf(['overview', 'api']).optional(),
      }),
    );

    expect(() => parseCompiledUrl('/docs#missing', compiled, 'strip')).toThrow(UrlKitError);

    try {
      parseCompiledUrl('/docs#missing', compiled, 'strip');
    } catch (error) {
      expect((error as UrlKitError).code).toBe('invalid-hash');
    }
  });

  it('strips unknown search params by default', () => {
    const compiled = compileUrlDescriptor(compileRuntimeUrlDescriptor({ search: { q: string() } }));

    expect(parseCompiledUrl('/search?q=router&debug=true', compiled, 'strip')).toEqual({
      pathname: '/search',
      params: {},
      search: { q: 'router' },
      hash: undefined,
    });
  });

  it('preserves unknown search params outside typed search', () => {
    const compiled = compileUrlDescriptor(compileRuntimeUrlDescriptor({ search: { q: string() } }));

    expect(
      parseCompiledUrl('/search?q=router&debug=true&tag=a&tag=b', compiled, 'preserve'),
    ).toEqual({
      pathname: '/search',
      params: {},
      search: { q: 'router' },
      hash: undefined,
      unknownSearch: {
        debug: 'true',
        tag: ['a', 'b'],
      },
    });
  });

  it('errors on unknown search params in error mode', () => {
    const compiled = compileUrlDescriptor(compileRuntimeUrlDescriptor({ search: { q: string() } }));

    expect(() => parseCompiledUrl('/search?q=router&debug=true', compiled, 'error')).toThrow(
      UrlKitError,
    );

    try {
      parseCompiledUrl('/search?q=router&debug=true', compiled, 'error');
    } catch (error) {
      expect((error as UrlKitError).code).toBe('invalid-search');
      expect((error as UrlKitError).path).toEqual(['debug']);
    }
  });

  it('applies hash defaults', () => {
    const compiled = compileUrlDescriptor(
      compileRuntimeUrlDescriptor({
        path: '/docs',
        hash: enumOf(['overview', 'api']).default('overview'),
      }),
    );

    expect(parseCompiledUrl('/docs', compiled, 'strip')).toEqual({
      pathname: '/docs',
      params: {},
      search: {},
      hash: 'overview',
    });
  });

  it('preserves unknown search params when there is no search schema', () => {
    const compiled = compileUrlDescriptor(compileRuntimeUrlDescriptor({ path: '/docs' }));

    expect(parseCompiledUrl('/docs?debug=true', compiled, 'preserve')).toEqual({
      pathname: '/docs',
      params: {},
      search: {},
      hash: undefined,
      unknownSearch: { debug: 'true' },
    });
  });
});
