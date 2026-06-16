import { describe, expect, it, expectTypeOf } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { compilePath } from './compile-path.js';
import { createPathConstraint } from './path-constraints.js';
import type { ParamsFromPattern } from './contracts.js';

const expectUrlKitError = (
  callback: () => unknown,
  code: UrlKitError['code'],
  path: readonly string[],
): void => {
  try {
    callback();
  } catch (error) {
    expect(error).toBeInstanceOf(UrlKitError);
    expect((error as UrlKitError).code).toBe(code);
    expect((error as UrlKitError).path).toEqual(path);
    return;
  }

  throw new Error(`Expected ${code}.`);
};

describe('compilePath', () => {
  it('wraps invalid PathKit pattern errors as invalid descriptors', () => {
    expectUrlKitError(() => compilePath('/users/{'), 'invalid-descriptor', ['path']);
  });

  it('wraps invalid regex constraints as invalid descriptors', () => {
    expectUrlKitError(() => compilePath('/users/{id:regex([)}'), 'invalid-descriptor', ['path']);
  });

  it('parses static paths', () => {
    const path = compilePath('/search');

    expect(path.parsePathname('/search')).toEqual({});
    expectUrlKitError(() => path.parsePathname('/search/extra'), 'path-mismatch', ['pathname']);
  });

  it('parses paths with string params', () => {
    const path = compilePath('/users/{id}');

    expect(path.parsePathname('/users/abc')).toEqual({ id: 'abc' });
    expectTypeOf<{ readonly id: string }>({} as ParamsFromPattern<'/users/{id}'>);
    expectTypeOf<`/users/${string}`>('/users/abc');
  });

  it('parses int params to numbers in standalone parsed-param mode', () => {
    const path = compilePath('/users/{id:int}');

    expect(path.parsePathname('/users/42')).toEqual({ id: 42 });
    expectTypeOf<{ readonly id: number }>({} as ParamsFromPattern<'/users/{id:int}'>);
    expectTypeOf<`/users/${number}`>('/users/42');
  });

  it('parses decimal and range params to numbers in standalone parsed-param mode', () => {
    const decimalPath = compilePath('/prices/{amount:decimal}');
    const rangePath = compilePath('/users/{id:range(1,1000)}');

    expect(decimalPath.parsePathname('/prices/4.2')).toEqual({ amount: 4.2 });
    expect(rangePath.parsePathname('/users/4.2')).toEqual({ id: 4.2 });
    expectTypeOf<{ readonly amount: number }>({} as ParamsFromPattern<'/prices/{amount:decimal}'>);
    expectTypeOf<{ readonly id: number }>({} as ParamsFromPattern<'/users/{id:range(1,1000)}'>);
  });

  it('supports raw-param mode for router runtime integration', () => {
    const path = compilePath('/users/{id:int}', { params: 'raw' });

    expect(path.parsePathname('/users/42')).toEqual({ id: '42' });
  });

  it('keeps regex params as strings', () => {
    const path = compilePath('/posts/{slug:regex([a-z0-9-]+)}');

    expect(path.parsePathname('/posts/post-1')).toEqual({ slug: 'post-1' });
    expectTypeOf<{ readonly slug: string }>(
      {} as ParamsFromPattern<'/posts/{slug:regex([a-z0-9-]+)}'>,
    );
  });

  it('supports custom PathKit constraints passed at compile time', () => {
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

    const path = compilePath('/posts/{slug:urlkitslugcompile}', {
      pathConstraints: {
        urlkitslugcompile: slug,
      },
    });

    expect(path.parsePathname('/posts/post-1')).toEqual({ slug: 'post-1' });
    expect(path.buildPath({ slug: 'post-1' })).toBe('/posts/post-1');
    expectUrlKitError(() => path.parsePathname('/posts/Post'), 'invalid-param', ['params']);
    expectUrlKitError(() => path.buildPath({ slug: 'Post' }), 'invalid-param', ['params']);
    expectTypeOf<{ readonly slug: string }>(
      {} as ParamsFromPattern<'/posts/{slug:urlkitslugcompile}'>,
    );
  });

  it('throws missing-param when building without required params', () => {
    const path = compilePath('/users/{id:int}');

    expectUrlKitError(() => path.buildPath({} as never), 'missing-param', ['params', 'id']);
  });

  it('throws invalid-param when building invalid params', () => {
    const path = compilePath('/users/{id:int}');

    expectUrlKitError(() => path.buildPath({ id: 'abc' } as never), 'invalid-param', ['params']);
  });

  it('throws invalid-param when PathKit rejects constrained params with strict validation', () => {
    const intPath = compilePath('/users/{id:int}');
    const decimalPath = compilePath('/prices/{amount:decimal}');
    const rangePath = compilePath('/users/{id:range(1,10)}');
    const regexPath = compilePath('/posts/{slug:regex([a-z0-9-]+)}');

    expectUrlKitError(() => intPath.parsePathname('/users/abc'), 'invalid-param', ['params', 'id']);
    expectUrlKitError(() => decimalPath.parsePathname('/prices/abc'), 'invalid-param', [
      'params',
      'amount',
    ]);
    expectUrlKitError(() => rangePath.parsePathname('/users/abc'), 'invalid-param', [
      'params',
      'id',
    ]);
    expectUrlKitError(() => regexPath.parsePathname('/posts/Post'), 'invalid-param', [
      'params',
      'slug',
    ]);
  });

  it('throws path-mismatch when static path segments do not match', () => {
    const path = compilePath('/users/{id:int}');

    expectUrlKitError(() => path.parsePathname('/posts/42'), 'path-mismatch', ['pathname']);
  });

  it('builds static and parameter paths through PathKit', () => {
    expect(compilePath('/search').buildPath()).toBe('/search');
    expect(compilePath('/users/{id:int}').buildPath({ id: 42 })).toBe('/users/42');
    expect(compilePath('/posts/{slug:regex([a-z0-9-]+)}').buildPath({ slug: 'post-1' })).toBe(
      '/posts/post-1',
    );
  });

  it('parses chained numeric constraints based on the highest weighted constraint', () => {
    const minPath = compilePath('/users/{id:min(1)}');
    const maxPath = compilePath('/users/{id:max(10)}');
    const rangePath = compilePath('/users/{id:range(1, 10)}');
    const minMaxPath = compilePath('/users/{id:min(1):max(10)}');
    const regexMinPath = compilePath('/users/{id:regex(\\d):min(1)}');
    const intMinPath = compilePath('/users/{id:int:min(1)}');
    const decimalMinMaxPath = compilePath('/prices/{amount:decimal:min(-10):max(10)}');

    expect(minPath.parsePathname('/users/1.5')).toEqual({ id: 1.5 });
    expect(maxPath.parsePathname('/users/9.5')).toEqual({ id: 9.5 });
    expect(rangePath.parsePathname('/users/5')).toEqual({ id: 5 });
    expect(minMaxPath.parsePathname('/users/2.5')).toEqual({ id: 2.5 });
    expect(regexMinPath.parsePathname('/users/2')).toEqual({ id: 2 });
    expect(intMinPath.parsePathname('/users/2')).toEqual({ id: 2 });
    expect(decimalMinMaxPath.parsePathname('/prices/-9.99')).toEqual({ amount: -9.99 });

    expectTypeOf<{ readonly id: number }>({} as ParamsFromPattern<'/users/{id:min(1)}'>);
    expectTypeOf<{ readonly id: number }>({} as ParamsFromPattern<'/users/{id:regex(\\d):min(1)}'>);
    expectTypeOf<`/users/${number}`>('/users/2.5');
  });

  it('parses and builds optional chained numeric constraints', () => {
    const path = compilePath('/users/{id:min(1)?}');

    expect(path.parsePathname('/users')).toEqual({});
    expect(path.parsePathname('/users/2.5')).toEqual({ id: 2.5 });
    expect(path.buildPath()).toBe('/users');
    expect(path.buildPath({})).toBe('/users');
    expect(path.buildPath({ id: 2.5 })).toBe('/users/2.5');

    expectTypeOf<{ readonly id?: number }>({});
  });

  it('keeps uuid and length-only constraints as strings', () => {
    const uuidPath = compilePath('/users/{id:uuid}');
    const slugPath = compilePath('/articles/{slug:minlength(3):maxlength(50)}');

    expect(uuidPath.parsePathname('/users/7d444840-9dc0-11d1-b245-5ffdce74fad2')).toEqual({
      id: '7d444840-9dc0-11d1-b245-5ffdce74fad2',
    });
    expect(slugPath.parsePathname('/articles/hello')).toEqual({ slug: 'hello' });

    expectTypeOf<{ readonly id: string }>({} as ParamsFromPattern<'/users/{id:uuid}'>);
    expectTypeOf<{ readonly slug: string }>(
      {} as ParamsFromPattern<'/articles/{slug:minlength(3):maxlength(50)}'>,
    );
  });

  it('supports configurable PathKit match options', () => {
    const casePath = compilePath('/Users/{id}');
    const apiPath = compilePath('/api');
    const trailingPath = compilePath('/users/{id}');

    expect(casePath.parsePathname('/users/42')).toEqual({ id: '42' });
    expectUrlKitError(
      () => casePath.parsePathname('/users/42', { sensitive: true }),
      'path-mismatch',
      ['pathname'],
    );

    expect(apiPath.matchPathname('/api/users', { end: false })).toEqual({
      match: true,
      path: '/api',
      params: {},
    });
    expectUrlKitError(
      () => trailingPath.parsePathname('/users/42/', { trailing: false }),
      'path-mismatch',
      ['pathname'],
    );
  });

  it('supports wildcard array output and path param decoding', () => {
    const filesPath = compilePath('/files/{*path}');
    const helloPath = compilePath('/hello/{name}');

    expect(filesPath.parsePathname('/files/docs/guides/readme')).toEqual({
      path: 'docs/guides/readme',
    });
    expect(
      filesPath.parsePathname('/files/docs/guides/readme', { wildcardFormat: 'array' }),
    ).toEqual({
      path: ['docs', 'guides', 'readme'],
    });
    expect(
      filesPath.parsePathname('/files/a%2Fb/c%20d', {
        wildcardFormat: 'array',
        decode: true,
      }),
    ).toEqual({ path: ['a/b', 'c d'] });
    expect(helloPath.parsePathname('/hello/John%20Doe', { decode: true })).toEqual({
      name: 'John Doe',
    });
  });

  it('builds wildcard paths from arrays through PathKit compile', () => {
    const path = compilePath('/files/{*path}');

    expect(path.buildPath({ path: ['docs', 'guides', 'readme'] } as never)).toBe(
      '/files/docs/guides/readme',
    );
  });
});
