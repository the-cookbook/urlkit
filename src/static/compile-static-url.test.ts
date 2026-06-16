import { describe, expect, it, expectTypeOf } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { buildSearch } from '../search/build-search.js';
import { parseSearch } from '../search/parse-search.js';
import { createPathConstraint } from '../router-runtime.js';
import { compileStaticUrl } from './compile-static-url.js';
import type { StaticUrlModeFromDescriptor } from './contracts.js';

const expectInvalidDescriptor = (callback: () => unknown, path: readonly string[]): UrlKitError => {
  try {
    callback();
  } catch (error) {
    expect(error).toBeInstanceOf(UrlKitError);
    const urlKitError = error as UrlKitError;
    expect(urlKitError.code).toBe('invalid-descriptor');
    expect(urlKitError.path).toEqual(path);
    return urlKitError;
  }

  throw new Error('Expected invalid descriptor error.');
};

describe('compileStaticUrl', () => {
  it('compiles path-based descriptors to normalized path mode', () => {
    const descriptor = {
      path: '/articles/{slug}',
      search: {
        page: { type: 'int', default: 1 },
        q: { type: 'string' },
      },
      hash: { type: 'enum', values: ['comments', 'share'], optional: true },
    } as const;

    const compiled = compileStaticUrl(descriptor);

    expect(compiled.mode).toBe('path');
    expect(compiled.pattern).toBe('/articles/{slug}');
    expect(compiled.path?.parsePathname('/articles/post-1')).toEqual({ slug: 'post-1' });
    expect(compiled.path?.buildPath({ slug: 'post-1' })).toBe('/articles/post-1');
    expect(compiled.search).toBeDefined();
    expect(compiled.hash).toEqual({
      type: 'enum',
      presence: 'optional',
      values: ['comments', 'share'],
    });
    expect(Object.isFrozen(compiled)).toBe(true);
    expectTypeOf<'path'>({} as StaticUrlModeFromDescriptor<typeof descriptor>);
  });

  it('preserves PathKit causes for invalid path patterns', () => {
    const error = expectInvalidDescriptor(
      () => compileStaticUrl({ path: '/articles/{' }),
      ['path'],
    );

    expect(error.cause).toBeDefined();
  });

  it('preserves PathKit causes for invalid custom path constraints', () => {
    const compileError = new Error('Static slug constraint could not compile.');
    const slug = createPathConstraint({
      parse() {},
      verify() {},
      toRegExp() {
        throw compileError;
      },
    });

    const error = expectInvalidDescriptor(
      () =>
        compileStaticUrl(
          { path: '/articles/{slug:urlkitstaticverify(required)}' },
          {
            pathConstraints: {
              urlkitstaticverify: slug,
            },
          },
        ),
      ['path'],
    );

    expect(error.cause).toBeDefined();
  });

  it('supports custom PathKit constraints outside static descriptors', () => {
    const slug = createPathConstraint({
      parse(paramName, value) {
        if (!/^[a-z0-9-]+$/.test(String(value))) {
          throw new Error(`Path parameter "${paramName}" must be a slug.`);
        }
      },
      verify(_paramName, params) {
        if (params.trim()) {
          throw new Error('Slug constraint does not accept arguments.');
        }
      },
      toRegExp() {
        return '[a-z0-9-]+';
      },
    });

    const compiled = compileStaticUrl(
      {
        path: '/articles/{slug:urlkitslugstatic}',
      },
      {
        pathConstraints: {
          urlkitslugstatic: slug,
        },
      },
    );

    expect(compiled.path?.parsePathname('/articles/post-1')).toEqual({ slug: 'post-1' });
    expect(compiled.path?.buildPath({ slug: 'post-1' })).toBe('/articles/post-1');
  });

  it('compiles pathless descriptors to normalized pathless mode', () => {
    const descriptor = {
      search: {
        page: { type: 'int', default: 1 },
      },
    } as const;

    const compiled = compileStaticUrl(descriptor);

    expect(compiled.mode).toBe('pathless');
    expect(compiled.pattern).toBeUndefined();
    expect(compiled.search).toBeDefined();
    expect(compiled.hash).toBeUndefined();
    expectTypeOf<'pathless'>({} as StaticUrlModeFromDescriptor<typeof descriptor>);
  });

  it('allows path-only descriptors', () => {
    const compiled = compileStaticUrl({ path: '/about' });

    expect(compiled.mode).toBe('path');
    expect(compiled.pattern).toBe('/about');
    expect(compiled.path?.parsePathname('/about')).toEqual({});
    expect(compiled.path?.buildPath()).toBe('/about');
  });

  it('allows empty pathless descriptors', () => {
    const compiled = compileStaticUrl({});

    expect(compiled).toEqual({
      mode: 'pathless',
      pattern: undefined,
    });
  });

  it('uses compiled static search descriptors', () => {
    const compiled = compileStaticUrl({
      search: {
        q: { type: 'string' },
        page: { type: 'int', default: 1 },
        active: { type: 'boolean' },
      },
    });

    const schema = compiled.search;

    if (!schema) {
      throw new Error('Expected compiled search schema.');
    }

    expect(parseSearch('?q=router&active=true', { schema }).search).toEqual({
      q: 'router',
      page: 1,
      active: true,
    });
    expect(buildSearch({ q: 'router', page: 2, active: false }, { schema, sortKeys: true })).toBe(
      '?active=false&page=2&q=router',
    );
  });

  it('uses compiled static hash descriptors', () => {
    const compiled = compileStaticUrl({
      hash: {
        type: 'enum',
        values: ['overview', 'comments'],
        default: 'overview',
      },
    });

    expect(compiled.hash).toEqual({
      type: 'enum',
      presence: 'defaulted',
      values: ['overview', 'comments'],
      defaultValue: 'overview',
    });
  });

  it('rejects invalid URL descriptor shapes', () => {
    expectInvalidDescriptor(() => compileStaticUrl(null as never), []);
    expectInvalidDescriptor(() => compileStaticUrl([] as never), []);
    expectInvalidDescriptor(() => compileStaticUrl({ path: 1 } as never), ['path']);
    expectInvalidDescriptor(() => compileStaticUrl({ search: [] } as never), ['search']);
  });

  it('delegates invalid static search and hash descriptors', () => {
    expectInvalidDescriptor(
      () => compileStaticUrl({ search: { page: { type: 'int', default: '1' } } as never }),
      ['search', 'page'],
    );
    expectInvalidDescriptor(
      () => compileStaticUrl({ hash: { type: 'enum', values: ['comments'], default: 'share' } }),
      ['hash'],
    );
  });

  it('rejects runtime date codecs in static search formats', () => {
    const codec = {
      parse: (value: string) => new Date(value),
      serialize: (value: Date) => value.toISOString(),
    };

    expectInvalidDescriptor(
      () =>
        compileStaticUrl({
          path: '/',
          search: {
            from: {
              type: 'date',
              format: codec,
            },
          },
        } as never),
      ['search', 'from', 'format'],
    );
  });
});
