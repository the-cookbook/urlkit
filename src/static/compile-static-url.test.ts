import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { buildSearch } from '../search/build-search.js';
import { parseSearch } from '../search/parse-search.js';
import { compileStaticUrl } from './compile-static-url.js';
import type { StaticUrlModeFromDescriptor } from './contracts.js';

const expectType = <Value>(_value: Value): void => undefined;

const expectInvalidDescriptor = (callback: () => unknown, path: readonly string[]): void => {
  try {
    callback();
  } catch (error) {
    expect(error).toBeInstanceOf(UrlKitError);
    expect((error as UrlKitError).code).toBe('invalid-descriptor');
    expect((error as UrlKitError).path).toEqual(path);
    return;
  }

  throw new Error('Expected invalid descriptor error.');
};

describe('compileStaticUrl', () => {
  it('compiles path-based descriptors to normalized path mode', () => {
    const descriptor = {
      path: '/articles/{slug}',
      search: {
        page: { value: 'int', default: 1 },
        q: 'string',
      },
      hash: ['comments', 'share'],
    } as const;

    const compiled = compileStaticUrl(descriptor);

    expect(compiled.mode).toBe('path');
    expect(compiled.pattern).toBe('/articles/{slug}');
    expect(compiled.path?.parsePathname('/articles/post-1')).toEqual({ slug: 'post-1' });
    expect(compiled.path?.buildPath({ slug: 'post-1' })).toBe('/articles/post-1');
    expect(compiled.search).toBeDefined();
    expect(compiled.hash).toEqual({
      kind: 'enum',
      presence: 'optional',
      values: ['comments', 'share'],
    });
    expect(Object.isFrozen(compiled)).toBe(true);
    expectType<'path'>({} as StaticUrlModeFromDescriptor<typeof descriptor>);
  });

  it('compiles pathless descriptors to normalized pathless mode', () => {
    const descriptor = {
      search: {
        page: { value: 'int', default: 1 },
      },
    } as const;

    const compiled = compileStaticUrl(descriptor);

    expect(compiled.mode).toBe('pathless');
    expect(compiled.pattern).toBeUndefined();
    expect(compiled.search).toBeDefined();
    expect(compiled.hash).toBeUndefined();
    expectType<'pathless'>({} as StaticUrlModeFromDescriptor<typeof descriptor>);
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
        q: 'string',
        page: { value: 'int', default: 1 },
        active: { value: 'boolean' },
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
      kind: 'enum',
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
      () => compileStaticUrl({ search: { page: { value: 'int', default: '1' } } as never }),
      ['search', 'page'],
    );
    expectInvalidDescriptor(
      () => compileStaticUrl({ hash: { type: 'enum', values: ['comments'], default: 'share' } }),
      ['hash'],
    );
  });
});
