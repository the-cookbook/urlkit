import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { enumOf } from '../schema/enum-of.js';
import { int } from '../schema/int.js';
import { string } from '../schema/string.js';
import { compileRuntimeUrlDescriptor } from './compile-runtime-url-descriptor.js';
import { compileUrlDescriptor } from './compile-url-descriptor.js';
import { normalizeCompiledUrl } from './normalize-compiled-url.js';

describe('normalizeCompiledUrl', () => {
  it('normalizes path-based state from params and applies search/hash defaults', () => {
    const compiled = compileUrlDescriptor(
      compileRuntimeUrlDescriptor({
        path: '/users/{id:int}',
        search: {
          page: int().default(1),
        },
        hash: enumOf(['activity', 'comments']).default('activity'),
      }),
    );

    expect(normalizeCompiledUrl({ params: { id: '42' } }, compiled, 'strip')).toEqual({
      pathname: '/users/42',
      params: { id: 42 },
      search: { page: 1 },
      hash: 'activity',
    });
  });

  it('rejects pathname in path mode and params in pathless mode', () => {
    const path = compileUrlDescriptor(compileRuntimeUrlDescriptor({ path: '/users/{id:int}' }));
    const pathless = compileUrlDescriptor(
      compileRuntimeUrlDescriptor({ search: { q: string().optional() } }),
    );

    expect(() =>
      normalizeCompiledUrl({ pathname: '/users/1', params: { id: 1 } }, path, 'strip'),
    ).toThrow(UrlKitError);
    expect(() => normalizeCompiledUrl({ params: {} }, pathless, 'strip')).toThrow(UrlKitError);
  });

  it('normalizes pathless state and preserves pathname runtime value', () => {
    const compiled = compileUrlDescriptor(
      compileRuntimeUrlDescriptor({ search: { q: string().optional() } }),
    );

    expect(
      normalizeCompiledUrl({ pathname: '/products', search: { q: 'router' } }, compiled, 'strip'),
    ).toEqual({
      pathname: '/products',
      params: {},
      search: { q: 'router' },
      hash: undefined,
    });
    expect(normalizeCompiledUrl({ search: { q: 'router' } }, compiled, 'strip')).toEqual({
      pathname: '',
      params: {},
      search: { q: 'router' },
      hash: undefined,
    });
  });

  it('preserves unknown search outside typed search when requested', () => {
    const compiled = compileUrlDescriptor(compileRuntimeUrlDescriptor({ search: { q: string() } }));

    expect(
      normalizeCompiledUrl({ search: { q: 'router', debug: 'true' } }, compiled, 'preserve'),
    ).toEqual({
      pathname: '',
      params: {},
      search: { q: 'router' },
      hash: undefined,
      unknownSearch: { debug: 'true' },
    });
  });
});
