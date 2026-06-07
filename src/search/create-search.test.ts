import { describe, expect, it, expectTypeOf } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { enumOf } from '../schema/enum-of.js';
import { int } from '../schema/int.js';
import { string } from '../schema/string.js';
import type { UrlContract } from '../url/contracts.js';
import { url } from '../url/create-url.js';
import { search } from './create-search.js';

describe('search', () => {
  it('creates a pathless contract equivalent to url({ search })', () => {
    const ProductSearch = search({
      category: string().optional(),
      page: int().default(1),
      sort: enumOf(['newest', 'popular']).default('newest'),
    });

    const ProductUrl = url({
      search: {
        category: string().optional(),
        page: int().default(1),
        sort: enumOf(['newest', 'popular']).default('newest'),
      },
    });

    expect(ProductSearch.pattern).toBeUndefined();
    expect(ProductSearch.parse('/products?page=2&sort=popular')).toEqual(
      ProductUrl.parse('/products?page=2&sort=popular'),
    );
    expect(
      ProductSearch.build({ pathname: '/products', search: { page: 2, sort: 'popular' } }),
    ).toBe(ProductUrl.build({ pathname: '/products', search: { page: 2, sort: 'popular' } }));
  });

  it('builds a suffix when no pathname is provided', () => {
    const ProductSearch = search({
      page: int().default(1),
      q: string().optional(),
    });

    expect(ProductSearch.build({ search: { page: 2 } })).toBe('?page=2');
    expect(ProductSearch.build({ search: { q: 'router' } })).toBe('?page=1&q=router');
    expect(ProductSearch.build({ search: { page: 1 } }, { defaults: 'omit' })).toBe('');
  });

  it('builds a full path when pathname is provided', () => {
    const ProductSearch = search({
      page: int().default(1),
      q: string().optional(),
    });

    expect(ProductSearch.build({ pathname: '/products', search: { page: 2, q: 'router' } })).toBe(
      '/products?page=2&q=router',
    );
    expect(
      ProductSearch.build({ pathname: '/products', search: { page: 1 } }, { defaults: 'omit' }),
    ).toBe('/products');
  });

  it('parses any pathname and always returns params and hash', () => {
    const ProductSearch = search({
      page: int().default(1),
      q: string().optional(),
    });

    expect(ProductSearch.parse('/products?page=2')).toEqual({
      pathname: '/products',
      params: {},
      search: { page: 2 },
      hash: undefined,
    });
    expect(ProductSearch.parse('/anything/else?q=router')).toEqual({
      pathname: '/anything/else',
      params: {},
      search: { page: 1, q: 'router' },
      hash: undefined,
    });
  });

  it('supports contract-level unknownSearch options', () => {
    const ProductSearch = search(
      {
        q: string(),
      },
      {
        unknownSearch: 'error',
      },
    );

    expect(() => ProductSearch.parse('/products?q=router&debug=true')).toThrow(UrlKitError);
    expect(
      ProductSearch.parse('/products?q=router&debug=true', { unknownSearch: 'preserve' }),
    ).toEqual({
      pathname: '/products',
      params: {},
      search: { q: 'router' },
      hash: undefined,
      unknownSearch: { debug: 'true' },
    });
  });

  it('matches pathless UrlContract inference', () => {
    const ProductSearch = search({
      page: int().default(1),
      q: string().optional(),
    });

    const state = ProductSearch.parse('/products?page=2');

    expectTypeOf<
      UrlContract<'pathless', string, {}, { readonly page: number; readonly q?: string }, undefined>
    >(ProductSearch);
    expectTypeOf<string>(state.pathname);
    expectTypeOf<{}>(state.params);
    expectTypeOf<{ readonly page: number; readonly q?: string }>(state.search);
    expectTypeOf<undefined>(state.hash);
    expectTypeOf<never>(ProductSearch.parsePathname);
    expectTypeOf<never>(ProductSearch.buildPath);

    if (false) {
      const normalized = ProductSearch.normalize({
        pathname: '/products',
        search: {
          page: 2,
        },
      });
      expectTypeOf<'/products'>(normalized.pathname);

      // @ts-expect-error pathless search contracts do not accept params.
      ProductSearch.build({ params: {}, search: { page: 2 } });
    }
  });
});
