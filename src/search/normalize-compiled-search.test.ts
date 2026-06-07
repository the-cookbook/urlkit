import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { boolean } from '../schema/boolean.js';
import { enumOf } from '../schema/enum-of.js';
import { int } from '../schema/int.js';
import { number } from '../schema/number.js';
import { object } from '../schema/object.js';
import { string } from '../schema/string.js';
import { array } from '../schema/array.js';
import { compileSearchSchema } from './compile-search-schema.js';
import { normalizeCompiledSearch } from './normalize-compiled-search.js';

const schema = compileSearchSchema({
  q: string(),
  page: int().default(1),
  tag: { type: 'many', value: string(), optional: true },
  sort: enumOf(['newest', 'popular']).optional(),
  filter: object({
    active: boolean().optional(),
    tags: array(string()).default([]),
  }).optional(),
});

describe('normalizeCompiledSearch', () => {
  it('normalizes structured search and applies defaults', () => {
    expect(normalizeCompiledSearch({ q: 'router' }, schema)).toEqual({
      search: {
        q: 'router',
        page: 1,
      },
    });
  });

  it('normalizes many fields and object fields', () => {
    expect(
      normalizeCompiledSearch(
        {
          q: 'router',
          tag: ['ts', 'url'],
          filter: {
            active: true,
          },
        },
        schema,
      ),
    ).toEqual({
      search: {
        q: 'router',
        page: 1,
        tag: ['ts', 'url'],
        filter: {
          active: true,
          tags: [],
        },
      },
    });
  });

  it('applies defaults when optional is chained after default', () => {
    const compiled = compileSearchSchema({
      categories: array(string()).default(['electronics']).optional(),
      price: number().default(9.99).optional(),
      sortBy: enumOf(['recommendation', 'desc', 'asc', 'priceDesc', 'priceAsc']).optional(),
    });

    expect(normalizeCompiledSearch({}, compiled)).toEqual({
      search: {
        categories: ['electronics'],
        price: 9.99,
      },
    });
  });

  it('follows null behavior', () => {
    expect(normalizeCompiledSearch({ q: 'router', sort: null }, schema)).toEqual({
      search: {
        q: 'router',
        page: 1,
      },
    });
    expect(normalizeCompiledSearch({ q: 'router', page: null }, schema)).toEqual({
      search: {
        q: 'router',
        page: 1,
      },
    });
    expect(() => normalizeCompiledSearch({ q: null }, schema)).toThrow(UrlKitError);
  });

  it('rejects invalid structured search values', () => {
    expect(() => normalizeCompiledSearch({ q: 'router', page: '2' }, schema)).toThrow(UrlKitError);
    expect(() => normalizeCompiledSearch({ q: 'router', tag: 'ts' }, schema)).toThrow(UrlKitError);
    expect(() => normalizeCompiledSearch({ q: 'router', sort: 'oldest' }, schema)).toThrow(
      UrlKitError,
    );
  });

  it('handles unknown search behavior', () => {
    expect(normalizeCompiledSearch({ q: 'router', debug: 'true' }, schema)).toEqual({
      search: {
        q: 'router',
        page: 1,
      },
    });
    expect(normalizeCompiledSearch({ q: 'router', debug: 'true' }, schema, 'preserve')).toEqual({
      search: {
        q: 'router',
        page: 1,
      },
      unknownSearch: {
        debug: 'true',
      },
    });
    expect(() => normalizeCompiledSearch({ q: 'router', debug: 'true' }, schema, 'error')).toThrow(
      UrlKitError,
    );
  });

  it('normalizes empty search against no schema', () => {
    expect(normalizeCompiledSearch(undefined, undefined)).toEqual({ search: {} });
    expect(normalizeCompiledSearch({ debug: 'true' }, undefined, 'preserve')).toEqual({
      search: {},
      unknownSearch: { debug: 'true' },
    });
  });
});
