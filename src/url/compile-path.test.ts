import { createConstraint } from '@cookbook/pathkit/constraints';
import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { compilePath } from './compile-path.js';
import type { ParamsFromPattern, PathnameFromPattern } from './contracts.js';

const expectType = <Value>(_value: Value): void => undefined;

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
    expectType<{ readonly id: string }>({} as ParamsFromPattern<'/users/{id}'>);
    expectType<`/users/${string}`>('/users/abc');
  });

  it('parses int params to numbers in standalone parsed-param mode', () => {
    const path = compilePath('/users/{id:int}');

    expect(path.parsePathname('/users/42')).toEqual({ id: 42 });
    expectType<{ readonly id: number }>({} as ParamsFromPattern<'/users/{id:int}'>);
    expectType<`/users/${number}`>('/users/42');
  });

  it('parses decimal and range params to numbers in standalone parsed-param mode', () => {
    const decimalPath = compilePath('/prices/{amount:decimal}');
    const rangePath = compilePath('/users/{id:range(1,1000)}');

    expect(decimalPath.parsePathname('/prices/4.2')).toEqual({ amount: 4.2 });
    expect(rangePath.parsePathname('/users/4.2')).toEqual({ id: 4.2 });
    expectType<{ readonly amount: number }>({} as ParamsFromPattern<'/prices/{amount:decimal}'>);
    expectType<{ readonly id: number }>({} as ParamsFromPattern<'/users/{id:range(1,1000)}'>);
  });

  it('supports raw-param mode for router runtime integration', () => {
    const path = compilePath('/users/{id:int}', { params: 'raw' });

    expect(path.parsePathname('/users/42')).toEqual({ id: '42' });
  });

  it('keeps regex params as strings', () => {
    const path = compilePath('/posts/{slug:regex([a-z0-9-]+)}');

    expect(path.parsePathname('/posts/post-1')).toEqual({ slug: 'post-1' });
    expectType<{ readonly slug: string }>(
      {} as ParamsFromPattern<'/posts/{slug:regex([a-z0-9-]+)}'>,
    );
  });

  it('supports custom PathKit constraints passed at compile time', () => {
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

    const path = compilePath('/posts/{slug:urlkitslugcompile}', {
      pathConstraints: {
        urlkitslugcompile: slug,
      },
    });

    expect(path.parsePathname('/posts/post-1')).toEqual({ slug: 'post-1' });
    expect(path.buildPath({ slug: 'post-1' })).toBe('/posts/post-1');
    expectUrlKitError(() => path.parsePathname('/posts/Post'), 'invalid-param', ['params', 'slug']);
    expectUrlKitError(() => path.buildPath({ slug: 'Post' }), 'invalid-param', ['params']);
    expectType<{ readonly slug: string }>(
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

  it('throws invalid-param when pathname shape matches but param constraints fail', () => {
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
});
