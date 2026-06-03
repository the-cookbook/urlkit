import { describe, expect, it } from 'vitest';
import { createRouteUrlContract, parseSearch as parseRouteSearch } from './router-runtime.js';
import { compileStaticUrl } from './static.js';
import { array, enumOf, hash, int, search, string, url } from './index.js';

const expectType = <Value>(_value: Value): void => undefined;

describe('spec API examples', () => {
  it('covers the standalone URLKit example', () => {
    const SearchUrl = url({
      path: '/search',
      search: {
        q: string().required(),
        page: int().default(1),
        tags: array(string()).default([]),
        sort: enumOf(['relevance', 'newest', 'popular']).default('relevance'),
      },
    });

    const state = SearchUrl.parse('/search?q=router&tags=typescript&tags=url');

    expect(state).toEqual({
      pathname: '/search',
      params: {},
      search: {
        q: 'router',
        page: 1,
        tags: ['typescript', 'url'],
        sort: 'relevance',
      },
      hash: undefined,
    });

    const href = SearchUrl.build({
      search: {
        q: state.search.q,
        page: state.search.page + 1,
        tags: state.search.tags,
        sort: state.search.sort,
      },
    });

    expect(href).toBe('/search?q=router&page=2&tags=typescript&tags=url&sort=relevance');

    if (false) {
      expectType<{
        readonly q: string;
        readonly page: number;
        readonly tags: readonly string[];
        readonly sort: 'relevance' | 'newest' | 'popular';
      }>(state.search);
    }
  });

  it('covers the pathless search contract example using url({ search })', () => {
    const ProductFiltersUrl = url({
      search: {
        category: string().optional(),
        page: int().default(1),
        brands: array(string()).default([]),
      },
    });

    expect(
      ProductFiltersUrl.build({
        search: {
          category: 'laptops',
          page: 2,
          brands: ['lenovo', 'asus'],
        },
      }),
    ).toBe('?category=laptops&page=2&brands=lenovo&brands=asus');

    expect(
      ProductFiltersUrl.build({
        pathname: '/products',
        search: {
          category: 'laptops',
          page: 2,
        },
      }),
    ).toBe('/products?category=laptops&page=2');
  });

  it('covers the dedicated pathless search() helper example', () => {
    const ProductSearch = search({
      page: int().default(1),
      brands: array(string()).default([]),
    });

    expect(ProductSearch.pattern).toBeUndefined();
    expect(ProductSearch.parse('/products?page=2&brands=lenovo&brands=asus')).toEqual({
      pathname: '/products',
      params: {},
      search: {
        page: 2,
        brands: ['lenovo', 'asus'],
      },
      hash: undefined,
    });
    expect(ProductSearch.build({ search: { page: 2, brands: ['lenovo', 'asus'] } })).toBe(
      '?page=2&brands=lenovo&brands=asus',
    );
  });

  it('covers the dedicated pathless hash() helper example', () => {
    const DocsHash = hash(enumOf(['intro', 'api']).optional());

    expect(DocsHash.pattern).toBeUndefined();
    expect(DocsHash.parse('/docs#api')).toEqual({
      pathname: '/docs',
      params: {},
      search: {},
      hash: 'api',
    });
    expect(DocsHash.build({ hash: 'intro' })).toBe('#intro');
    expect(DocsHash.build({ pathname: '/docs', hash: 'api' })).toBe('/docs#api');
    expect(DocsHash.build({})).toBe('');
  });

  it('covers the router static descriptor example without route concepts in URLKit', () => {
    const searchRouteUrlDescriptor = {
      path: '/search',
      search: {
        q: 'string',
        page: {
          value: 'int',
          default: 1,
        },
        tags: {
          type: 'many',
        },
        sort: {
          value: {
            type: 'enum',
            values: ['relevance', 'newest', 'popular'],
          },
          default: 'relevance',
        },
      },
    } as const;

    const compiled = compileStaticUrl(searchRouteUrlDescriptor);
    expect(compiled.mode).toBe('path');
    expect(compiled.pattern).toBe('/search');

    const SearchRouteUrl = createRouteUrlContract(searchRouteUrlDescriptor, { params: 'parsed' });
    const state = SearchRouteUrl.parse('/search?q=router&tags=typescript&tags=url&sort=newest');

    expect(state).toEqual({
      pathname: '/search',
      params: {},
      search: {
        q: 'router',
        page: 1,
        tags: ['typescript', 'url'],
        sort: 'newest',
      },
      hash: undefined,
    });

    if (false) {
      expectType<{
        readonly q: string;
        readonly page: number;
        readonly tags: readonly string[];
        readonly sort: 'relevance' | 'newest' | 'popular';
      }>(state.search);
    }
  });

  it('covers the router-runtime example', () => {
    const articleUrl = createRouteUrlContract(
      {
        path: '/articles/{slug:regex([a-z0-9-]+)}',
        search: {
          ref: {
            type: 'one',
            optional: true,
          },
          filters: {
            type: 'many',
            optional: true,
          },
        },
        hash: ['comments', 'share'],
      },
      {
        params: 'raw',
      },
    );

    const state = articleUrl.parse('/articles/post-1?ref=email&filters=react#comments');

    expect(state).toEqual({
      pathname: '/articles/post-1',
      params: {
        slug: 'post-1',
      },
      search: {
        ref: 'email',
        filters: ['react'],
      },
      hash: 'comments',
    });

    expect(
      articleUrl.build({
        params: { slug: 'post-1' },
        search: { ref: 'email', filters: ['react'] },
        hash: 'comments',
      }),
    ).toBe('/articles/post-1?ref=email&filters=react#comments');

    expect(
      parseRouteSearch('?ref=email&filters=react', {
        schema: {
          ref: { type: 'one', optional: true },
          filters: { type: 'many', optional: true },
        },
      }),
    ).toEqual({ ref: 'email', filters: ['react'] });
  });

  it('covers the Express-style normalize example without an Express dependency', () => {
    const UserUrl = url({
      path: '/users/{id:int}',
      search: {
        tab: enumOf(['profile', 'settings']).optional(),
      },
    });

    const requestLikeFrameworkState = {
      params: {
        id: '42',
      },
      query: {
        tab: 'settings',
      },
    };

    const result = UserUrl.safeNormalize({
      params: requestLikeFrameworkState.params as never,
      search: requestLikeFrameworkState.query as never,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        pathname: '/users/42',
        params: { id: 42 },
        search: { tab: 'settings' },
        hash: undefined,
      });
    }
  });

  it('covers the Express-style request-like parse example without an Express dependency', () => {
    const UserUrl = url({
      path: '/users/{id:int}',
      search: {
        tab: enumOf(['profile', 'settings']).optional(),
      },
    });

    const requestLike = {
      originalUrl: '/users/42?tab=profile',
      url: '/fallback',
      protocol: 'https',
      get(header: string) {
        return header === 'host' ? 'example.com' : undefined;
      },
    };

    const result = UserUrl.safeParseRequest(
      {
        url: requestLike.originalUrl ?? requestLike.url,
      },
      {
        baseUrl: `${requestLike.protocol}://${requestLike.get('host')}`,
      },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.params).toEqual({ id: 42 });
      expect(result.data.search).toEqual({ tab: 'profile' });
    }
  });

  it('covers the Hono-style Request example without a Hono dependency', () => {
    const UserUrl = url({
      path: '/users/{id:int}',
      search: {
        tab: enumOf(['profile', 'settings']).optional(),
      },
    });

    const contextLike = {
      req: {
        raw: new Request('https://example.com/users/42?tab=settings'),
        param(name: string) {
          return name === 'id' ? '42' : undefined;
        },
      },
    };

    const parsed = UserUrl.safeParseRequest(contextLike.req.raw);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.params).toEqual({ id: 42 });
      expect(parsed.data.search).toEqual({ tab: 'settings' });
    }

    const normalized = UserUrl.safeNormalize({
      params: {
        id: contextLike.req.param('id'),
      } as never,
      search: Object.fromEntries(new URL(contextLike.req.raw.url).searchParams) as never,
    });

    expect(normalized.success).toBe(true);
    if (normalized.success) {
      expect(normalized.data).toEqual({
        pathname: '/users/42',
        params: { id: 42 },
        search: { tab: 'settings' },
        hash: undefined,
      });
    }
  });
});
