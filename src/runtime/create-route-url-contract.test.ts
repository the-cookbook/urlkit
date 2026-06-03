import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { createRouteUrlContract } from './create-route-url-contract.js';

const expectType = <Value>(_value: Value): void => undefined;

describe('createRouteUrlContract', () => {
  it('creates path-based contracts from static route-compatible descriptors', () => {
    const contract = createRouteUrlContract({
      path: '/articles/{slug:regex([a-z0-9-]+)}',
      search: {
        page: {
          value: 'int',
          default: 1,
        },
        sort: {
          value: {
            type: 'enum',
            values: ['newest', 'popular'],
          },
          default: 'newest',
        },
      },
      hash: ['comments', 'share'],
    } as const);

    expect(contract.pattern).toBe('/articles/{slug:regex([a-z0-9-]+)}');
    expect(contract.parse('/articles/post-1?page=2#comments')).toMatchObject({
      pathname: '/articles/post-1',
      params: { slug: 'post-1' },
      search: { page: 2, sort: 'newest' },
      hash: 'comments',
    });
    expect(
      contract.build({
        params: { slug: 'post-1' },
        search: { page: 2, sort: 'newest' },
        hash: 'share',
      }),
    ).toBe('/articles/post-1?page=2&sort=newest#share');
  });

  it('defaults router params to raw strings', () => {
    const contract = createRouteUrlContract({ path: '/users/{id:int}' } as const);
    const state = contract.parse('/users/42');

    expect(state.params).toEqual({ id: '42' });
    expectType<{ readonly id: string }>(state.params);
  });

  it('supports parsed params when requested', () => {
    const contract = createRouteUrlContract({ path: '/users/{id:int}' } as const, {
      params: 'parsed',
    });
    const state = contract.parse('/users/42');

    expect(state.params).toEqual({ id: 42 });
    expectType<{ readonly id: number }>(state.params);
  });

  it('keeps number params raw by default and parsed by opt-in', () => {
    const raw = createRouteUrlContract({ path: '/prices/{amount:number}' } as const);
    const parsed = createRouteUrlContract({ path: '/prices/{amount:number}' } as const, {
      params: 'parsed',
    });

    expect(raw.parse('/prices/4.2').params).toEqual({ amount: '4.2' });
    expect(parsed.parse('/prices/4.2').params).toEqual({ amount: 4.2 });
  });

  it('supports string and regex params', () => {
    const contract = createRouteUrlContract({
      path: '/teams/{teamId}/posts/{slug:regex([a-z0-9-]+)}',
    } as const);
    const state = contract.parse('/teams/core/posts/post-1');

    expect(state.params).toEqual({ teamId: 'core', slug: 'post-1' });
    expectType<`/teams/${string}/posts/${string}`>(state.pathname);
    expectType<{ readonly teamId: string; readonly slug: string }>(state.params);
  });

  it('uses standalone url parsed-param default separately from router runtime', async () => {
    const { url } = await import('../url/create-url.js');
    const standalone = url({ path: '/users/{id:int}' } as const);
    const route = createRouteUrlContract({ path: '/users/{id:int}' } as const);

    expect(standalone.parse('/users/42').params).toEqual({ id: 42 });
    expect(route.parse('/users/42').params).toEqual({ id: '42' });
  });

  it('supports pathless descriptors', () => {
    const contract = createRouteUrlContract({
      search: {
        page: {
          value: 'int',
          default: 1,
        },
      },
      hash: {
        type: 'enum',
        values: ['comments', 'share'],
        optional: true,
      },
    } as const);

    const state = contract.parse('/any/path?page=2#comments');

    expect(contract.pattern).toBeUndefined();
    expect(state).toMatchObject({
      pathname: '/any/path',
      params: {},
      search: { page: 2 },
      hash: 'comments',
    });
    expect(contract.build({ search: { page: 2 }, hash: 'share' })).toBe('?page=2#share');
    expect(contract.build({ pathname: '/products', search: { page: 2 } })).toBe('/products?page=2');
  });

  it('supports search-only and hash-only route-compatible descriptors', () => {
    const searchOnly = createRouteUrlContract({ search: { q: 'string' } } as const);
    const hashOnly = createRouteUrlContract({ hash: ['intro', 'api'] } as const);

    expect(searchOnly.parse('/docs?q=urlkit').search).toEqual({ q: 'urlkit' });
    expect(hashOnly.parse('/docs#intro').hash).toBe('intro');
  });

  it('keeps route concepts outside the router-runtime options contract', () => {
    createRouteUrlContract({ path: '/users/{id}' } as const);

    expectType<'params' | never>(
      {} as keyof import('./contracts.js').CreateRouteUrlContractOptions,
    );
  });

  it('throws construction-time descriptor errors for invalid static descriptors', () => {
    expect(() =>
      createRouteUrlContract({
        hash: {
          type: 'enum',
          values: ['overview'],
          default: 'comments',
        },
      } as const),
    ).toThrow(UrlKitError);

    try {
      createRouteUrlContract({
        hash: {
          type: 'enum',
          values: ['overview'],
          default: 'comments',
        },
      } as const);
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect((error as UrlKitError).code).toBe('invalid-descriptor');
    }
  });

  it('supports contract-level unknownSearch options', () => {
    const contract = createRouteUrlContract(
      {
        path: '/search',
        search: {
          q: 'string',
        },
      } as const,
      { params: 'raw' },
    );

    expect(contract.parse('/search?q=urlkit&debug=true').search).toEqual({ q: 'urlkit' });
    expect(
      contract.parse('/search?q=urlkit&debug=true', { unknownSearch: 'preserve' }).unknownSearch,
    ).toEqual({ debug: 'true' });
    expect(contract.match('/search?q=urlkit&debug=true', { unknownSearch: 'error' })).toBe(false);
  });
});
