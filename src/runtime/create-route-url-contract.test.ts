import { createConstraint } from '@cookbook/pathkit/constraints';
import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { createRouteUrlContract } from './create-route-url-contract.js';

const expectType = <Value>(_value: Value): void => undefined;

const expectUrlKitError = (
  callback: () => unknown,
  code: UrlKitError['code'],
  path?: readonly string[],
): UrlKitError => {
  try {
    callback();
  } catch (error) {
    expect(error).toBeInstanceOf(UrlKitError);
    const urlKitError = error as UrlKitError;
    expect(urlKitError.code).toBe(code);

    if (path) {
      expect(urlKitError.path).toEqual(path);
    }

    return urlKitError;
  }

  throw new Error(`Expected ${code}.`);
};

const expectSafeFailure = (
  result: { readonly success: boolean; readonly error?: UrlKitError },
  code: UrlKitError['code'],
  path?: readonly string[],
): void => {
  expect(result.success).toBe(false);
  if (result.success) {
    return;
  }

  expect(result.error).toBeInstanceOf(UrlKitError);
  expect(result.error?.code).toBe(code);

  if (path) {
    expect(result.error?.path).toEqual(path);
  }
};

describe('createRouteUrlContract', () => {
  it('creates path-based contracts from static route-compatible descriptors', () => {
    const contract = createRouteUrlContract({
      path: '/articles/{slug:regex([a-z0-9-]+)}',
      search: {
        page: {
          type: 'int',
          default: 1,
        },
        sort: {
          type: 'enum',
          values: ['newest', 'popular'],
          default: 'newest',
        },
      },
      hash: { type: 'enum', values: ['comments', 'share'], optional: true },
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

  it('keeps range params raw by default and parses them by opt-in', () => {
    const raw = createRouteUrlContract({ path: '/prices/{amount:range(1,10)}' } as const);
    const parsed = createRouteUrlContract({ path: '/prices/{amount:range(1,10)}' } as const, {
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

  it('supports custom PathKit constraints in router-runtime contracts', () => {
    const slug = createConstraint({
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

    const contract = createRouteUrlContract(
      {
        path: '/articles/{slug:urlkitslugroute}',
      } as const,
      {
        pathConstraints: {
          urlkitslugroute: slug,
        },
      },
    );

    const state = contract.parse('/articles/hello-world');

    expect(state.params).toEqual({ slug: 'hello-world' });
    expect(contract.build({ params: { slug: 'hello-world' } })).toBe('/articles/hello-world');
    expect(contract.match('/articles/HelloWorld')).toBe(false);
    expectType<{ readonly slug: string }>(state.params);
  });

  it('preserves PathKit causes for route descriptor path compilation failures', () => {
    const error = expectUrlKitError(
      () => createRouteUrlContract({ path: '/articles/{' } as const),
      'invalid-descriptor',
      ['path'],
    );

    expect(error.cause).toBeDefined();
  });

  it('preserves PathKit causes for route custom constraint compilation failures', () => {
    const compileError = new Error('Route slug constraint could not compile.');
    const slug = createConstraint({
      parse() {},
      verify() {},
      toRegExp() {
        throw compileError;
      },
    });

    const error = expectUrlKitError(
      () =>
        createRouteUrlContract({ path: '/articles/{slug:urlkitrouteverify(required)}' } as const, {
          pathConstraints: {
            urlkitrouteverify: slug,
          },
        }),
      'invalid-descriptor',
      ['path'],
    );

    expect(error.cause).toBeDefined();
  });

  it('supports static date and date-time format strings in route contracts', () => {
    const contract = createRouteUrlContract({
      path: '/reports',
      search: {
        from: {
          type: 'date',
          format: 'dd-MM-yyyy',
          optional: true,
        },
        startsAt: {
          type: 'date-time',
          format: 'dd-MM-yyyy HH:mm:ss',
          optional: true,
        },
      },
    } as const);

    const state = contract.parse('/reports?from=02-06-2026&startsAt=02-06-2026+12%3A30%3A05');

    expect(state.search).toEqual({
      from: new Date('2026-06-02T00:00:00.000Z'),
      startsAt: new Date('2026-06-02T12:30:05.000Z'),
    });
    expect(
      contract.build({
        search: {
          from: new Date('2026-06-03T00:00:00.000Z'),
          startsAt: new Date('2026-06-03T12:30:05.000Z'),
        },
      }),
    ).toBe('/reports?from=03-06-2026&startsAt=03-06-2026+12%3A30%3A05');
    expectType<{ readonly from?: Date; readonly startsAt?: Date }>(state.search);
  });

  it('rejects runtime date codecs in static route search formats', () => {
    const codec = {
      parse: (value: string) => new Date(value),
      serialize: (value: Date) => value.toISOString(),
    };

    expectUrlKitError(
      () =>
        createRouteUrlContract({
          path: '/',
          search: {
            from: {
              type: 'date',
              format: codec,
            },
          },
        } as never),
      'invalid-descriptor',
      ['search', 'from', 'format'],
    );

    expectUrlKitError(
      () =>
        createRouteUrlContract({
          path: '/',
          search: {
            from: {
              type: 'date-time',
              format: codec,
            },
          },
        } as never),
      'invalid-descriptor',
      ['search', 'from', 'format'],
    );
  });

  it('supports partial invalid optional search parsing without hiding required failures', () => {
    const contract = createRouteUrlContract({
      path: '/reports',
      search: {
        category: { type: 'string' },
        page: { type: 'int', default: 1 },
        publishedOn: {
          type: 'date',
          format: 'dd-MM-yyyy',
          optional: true,
        },
        scheduledAt: {
          type: 'date-time',
          format: 'dd-MM-yyyy HH:mm:ss',
          optional: true,
        },
      },
    } as const);

    const strict = contract.safeParse(
      '/reports?category=engineering&page=2&publishedOn=02-06-2026&scheduledAt=foo',
    );
    const partial = contract.safeParse(
      '/reports?category=engineering&page=2&publishedOn=02-06-2026&scheduledAt=foo',
      {
        invalidSearch: 'omit',
      },
    );
    const missingRequired = contract.safeParse('/reports?page=2&publishedOn=02-06-2026', {
      invalidSearch: 'omit',
    });
    const defaultRecovered = contract.safeParse(
      '/reports?category=engineering&page=invalid&publishedOn=02-06-2026',
      {
        invalidSearch: 'omit',
      },
    );

    expectSafeFailure(strict, 'invalid-search', ['scheduledAt']);
    expect(partial.success).toBe(true);
    if (partial.success) {
      expect(partial.data.search).toEqual({
        category: 'engineering',
        page: 2,
        publishedOn: new Date('2026-06-02T00:00:00.000Z'),
      });
    }
    expect(defaultRecovered.success).toBe(true);
    if (defaultRecovered.success) {
      expect(defaultRecovered.data.search).toEqual({
        category: 'engineering',
        page: 1,
        publishedOn: new Date('2026-06-02T00:00:00.000Z'),
      });
    }
    expectSafeFailure(missingRequired, 'missing-search', ['category']);
  });

  it('supports pathless descriptors', () => {
    const contract = createRouteUrlContract({
      search: {
        page: {
          type: 'int',
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

  it('validates wrong pathless route states through the public contract', () => {
    const contract = createRouteUrlContract({
      search: {
        page: { type: 'int', default: 1 },
      },
      hash: { type: 'enum', values: ['comments', 'share'], optional: true },
    } as const);

    expectUrlKitError(
      () => contract.normalize({ params: {} as never, search: { page: 2 } }),
      'invalid-url',
      ['params'],
    );
    expectUrlKitError(
      // @ts-expect-error: error handling assertion
      () => contract.build({ params: {}, search: { page: 2 } }),
      'invalid-url',
      ['params'],
    );
    expectUrlKitError(
      () => contract.build({ pathname: 1 as never, search: { page: 2 } }),
      'invalid-url',
      ['pathname'],
    );
    expect(contract.parse('/anything?page=2#comments')).toMatchObject({
      pathname: '/anything',
      search: { page: 2 },
      hash: 'comments',
    });
    expect(contract.match('/anything?page=2#comments')).toBe(true);
    expect(contract.match('/anything?page=bad#comments')).toBe(false);
    expect(contract.match('/anything?page=2#invalid')).toBe(false);
  });

  it('supports search-only and hash-only route-compatible descriptors', () => {
    const searchOnly = createRouteUrlContract({ search: { q: { type: 'string' } } } as const);
    const hashOnly = createRouteUrlContract({
      hash: { type: 'enum', values: ['intro', 'api'], optional: true },
    } as const);

    expect(searchOnly.parse('/docs?q=urlkit').search).toEqual({ q: 'urlkit' });
    expect(hashOnly.parse('/docs#intro').hash).toBe('intro');
  });

  it('keeps route concepts outside the router-runtime options contract', () => {
    createRouteUrlContract({ path: '/users/{id}' } as const);

    expectType<'params' | 'unknownSearch' | 'arrayFormat' | 'pathConstraints' | never>(
      {} as keyof import('./contracts.js').CreateRouteUrlContractOptions,
    );
  });

  it('supports contract-level arrayFormat options', () => {
    const contract = createRouteUrlContract(
      {
        path: '/search',
        search: {
          tags: {
            type: 'string',
            many: true,
            optional: true,
          },
        },
      } as const,
      { arrayFormat: 'comma' },
    );

    expect(contract.parse('/search?tags=ts%2Curl').search).toEqual({ tags: ['ts', 'url'] });
    expect(contract.build({ search: { tags: ['ts', 'url'] } })).toBe('/search?tags=ts%2Curl');
  });

  it('applies arrayFormat contract defaults and method overrides across public methods', () => {
    const contract = createRouteUrlContract(
      {
        path: '/search',
        search: {
          tags: {
            type: 'string',
            many: true,
            optional: true,
          },
        },
      } as const,
      { arrayFormat: 'comma' },
    );

    expect(contract.parse('/search?tags=ts%2Curl').search).toEqual({ tags: ['ts', 'url'] });
    expect(contract.parse('/search?tags=ts&tags=url', { arrayFormat: 'repeat' }).search).toEqual({
      tags: ['ts', 'url'],
    });
    expect(contract.safeParse('/search?tags=ts%2Curl').success).toBe(true);
    expect(contract.safeParse('/search?tags=ts&tags=url', { arrayFormat: 'repeat' }).success).toBe(
      true,
    );
    expect(
      contract.parseRequest(new Request('https://example.com/search?tags=ts%2Curl')).search,
    ).toEqual({ tags: ['ts', 'url'] });
    expect(
      contract.safeParseRequest(new Request('https://example.com/search?tags=ts&tags=url'), {
        arrayFormat: 'repeat',
      }).success,
    ).toBe(true);
    expect(contract.match('/search?tags=ts%2Curl')).toBe(true);
    expect(contract.match('/search?tags=ts&tags=url', { arrayFormat: 'repeat' })).toBe(true);
    expect(contract.build({ search: { tags: ['ts', 'url'] } })).toBe('/search?tags=ts%2Curl');
    expect(contract.build({ search: { tags: ['ts', 'url'] } }, { arrayFormat: 'repeat' })).toBe(
      '/search?tags=ts&tags=url',
    );
    expect(contract.buildSearch({ tags: ['ts', 'url'] })).toBe('?tags=ts%2Curl');
    expect(contract.buildSearch({ tags: ['ts', 'url'] }, { arrayFormat: 'repeat' })).toBe(
      '?tags=ts&tags=url',
    );
    expect(contract.replaceSearch('/search', { tags: ['ts', 'url'] })).toBe(
      '/search?tags=ts%2Curl',
    );
    expect(
      contract.replaceSearch('/search', { tags: ['ts', 'url'] }, { arrayFormat: 'repeat' }),
    ).toBe('/search?tags=ts&tags=url');
    expect(contract.withSearch('/search?tags=old', { tags: ['ts', 'url'] })).toBe(
      '/search?tags=ts%2Curl',
    );
    expect(
      contract.withSearch('/search?tags=old', { tags: ['ts', 'url'] }, { arrayFormat: 'repeat' }),
    ).toBe('/search?tags=ts&tags=url');
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
          q: { type: 'string' },
        },
      } as const,
      { params: 'raw', unknownSearch: 'error' },
    );

    expect(() => contract.parse('/search?q=urlkit&debug=true')).toThrow(UrlKitError);
    expect(
      contract.parse('/search?q=urlkit&debug=true', { unknownSearch: 'preserve' }).unknownSearch,
    ).toEqual({ debug: 'true' });
    expect(contract.match('/search?q=urlkit&debug=true')).toBe(false);
  });

  it('applies unknownSearch contract defaults and method overrides across parse APIs', () => {
    const contract = createRouteUrlContract(
      {
        path: '/search',
        search: {
          q: { type: 'string' },
        },
      } as const,
      { params: 'raw', unknownSearch: 'error' },
    );

    expectUrlKitError(() => contract.parse('/search?q=urlkit&debug=true'), 'invalid-search', [
      'debug',
    ]);
    expectSafeFailure(contract.safeParse('/search?q=urlkit&debug=true'), 'invalid-search', [
      'debug',
    ]);
    expectUrlKitError(
      () => contract.parseRequest(new Request('https://example.com/search?q=urlkit&debug=true')),
      'invalid-search',
      ['debug'],
    );
    expectSafeFailure(
      contract.safeParseRequest(new Request('https://example.com/search?q=urlkit&debug=true')),
      'invalid-search',
      ['debug'],
    );
    expectUrlKitError(() => contract.parseSearch('?q=urlkit&debug=true'), 'invalid-search', [
      'debug',
    ]);
    expectUrlKitError(
      () => contract.normalize({ params: {}, search: { q: 'urlkit', debug: 'true' } }),
      'invalid-search',
      ['debug'],
    );
    expectSafeFailure(
      contract.safeNormalize({ params: {}, search: { q: 'urlkit', debug: 'true' } }),
      'invalid-search',
      ['debug'],
    );
    expect(contract.match('/search?q=urlkit&debug=true')).toBe(false);

    expect(contract.parse('/search?q=urlkit&debug=true', { unknownSearch: 'strip' })).toMatchObject(
      {
        search: { q: 'urlkit' },
      },
    );
    expect(
      contract.parse('/search?q=urlkit&debug=true', { unknownSearch: 'preserve' }).unknownSearch,
    ).toEqual({ debug: 'true' });
    expect(
      contract.parseRequest(new Request('https://example.com/search?q=urlkit&debug=true'), {
        unknownSearch: 'preserve',
      }).unknownSearch,
    ).toEqual({ debug: 'true' });
    expect(contract.parseSearch('?q=urlkit&debug=true', { unknownSearch: 'preserve' })).toEqual({
      q: 'urlkit',
    });
    expect(
      contract.normalize(
        { params: {}, search: { q: 'urlkit', debug: 'true' } },
        { unknownSearch: 'preserve' },
      ).unknownSearch,
    ).toEqual({ debug: 'true' });
    expect(contract.match('/search?q=urlkit&debug=true', { unknownSearch: 'strip' })).toBe(true);
    expect(contract.match('/search?q=urlkit&debug=true', { unknownSearch: 'preserve' })).toBe(true);
  });
});
