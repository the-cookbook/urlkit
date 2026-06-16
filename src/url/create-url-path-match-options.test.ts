import { describe, expect, it } from 'vitest';
import type { ParseRequestOptions, ParseUrlOptions, UrlPathMatchOptions } from '../contracts.js';
import { UrlKitError } from '../errors/url-kit-error.js';
import { url } from './create-url.js';

const pathMethodNames = [
  'parse',
  'safeParse',
  'parseRequest',
  'safeParseRequest',
  'match',
  'parsePathname',
] as const;

type PathMethodName = (typeof pathMethodNames)[number];

interface PathMethodOutcome {
  readonly success: boolean;
  readonly params?: unknown;
  readonly pathname?: string;
  readonly error?: UrlKitError;
}

interface PathMatchTestContract {
  parse(
    input: string | URL,
    options?: ParseUrlOptions,
  ): { readonly pathname: string; readonly params: unknown };
  safeParse(
    input: string | URL,
    options?: ParseUrlOptions,
  ):
    | {
        readonly success: true;
        readonly data: { readonly pathname: string; readonly params: unknown };
      }
    | { readonly success: false; readonly error: UrlKitError };
  parseRequest(
    input: Request | { readonly url: string },
    options?: ParseRequestOptions,
  ): { readonly pathname: string; readonly params: unknown };
  safeParseRequest(
    input: Request | { readonly url: string },
    options?: ParseRequestOptions,
  ):
    | {
        readonly success: true;
        readonly data: { readonly pathname: string; readonly params: unknown };
      }
    | { readonly success: false; readonly error: UrlKitError };
  match(input: string | URL, options?: ParseUrlOptions): boolean;
  parsePathname(pathname: string, options?: UrlPathMatchOptions): unknown;
}

function invokePathMethod(
  value: unknown,
  method: PathMethodName,
  pathname: string,
  options?: ParseUrlOptions,
): PathMethodOutcome {
  const contract = value as PathMatchTestContract;

  try {
    switch (method) {
      case 'parse': {
        const state = contract.parse(pathname, options);
        return { success: true, pathname: state.pathname, params: state.params };
      }
      case 'safeParse': {
        const result = contract.safeParse(pathname, options);
        return result.success
          ? { success: true, pathname: result.data.pathname, params: result.data.params }
          : { success: false, error: result.error };
      }
      case 'parseRequest': {
        const state = contract.parseRequest({ url: `https://example.com${pathname}` }, options);
        return { success: true, pathname: state.pathname, params: state.params };
      }
      case 'safeParseRequest': {
        const result = contract.safeParseRequest(
          { url: `https://example.com${pathname}` },
          options,
        );
        return result.success
          ? { success: true, pathname: result.data.pathname, params: result.data.params }
          : { success: false, error: result.error };
      }
      case 'match':
        return { success: contract.match(pathname, options) };
      case 'parsePathname':
        return { success: true, params: contract.parsePathname(pathname, options) };
    }
  } catch (error) {
    return {
      success: false,
      ...(error instanceof UrlKitError ? { error } : {}),
    };
  }
}

function expectEveryPathMethod(
  contract: unknown,
  pathname: string,
  expectedSuccess: boolean,
  options?: ParseUrlOptions,
): void {
  for (const method of pathMethodNames) {
    expect(invokePathMethod(contract, method, pathname, options).success, method).toBe(
      expectedSuccess,
    );
  }
}

function expectParamMethods(
  contract: unknown,
  pathname: string,
  expectedParams: unknown,
  options?: ParseUrlOptions,
): void {
  for (const method of pathMethodNames) {
    if (method === 'match') {
      continue;
    }

    const outcome = invokePathMethod(contract, method, pathname, options);
    expect(outcome.success, method).toBe(true);
    expect(outcome.params, method).toEqual(expectedParams);
  }
}

describe('url contract-level pathMatch option behavior', () => {
  it('applies contract wildcard and decode options to every path method', () => {
    const FilesUrl = url(
      { path: '/files/{*path}' },
      { pathMatch: { wildcardFormat: 'array', decode: true } },
    );

    expectEveryPathMethod(FilesUrl, '/files/a%2Fb/c%20d', true);
    expectParamMethods(FilesUrl, '/files/a%2Fb/c%20d', { path: ['a/b', 'c d'] });

    expectEveryPathMethod(FilesUrl, '/files/a%2Fb/c%20d', true, {
      wildcardFormat: 'string',
      decode: false,
    });
    expectParamMethods(
      FilesUrl,
      '/files/a%2Fb/c%20d',
      { path: 'a%2Fb/c%20d' },
      { wildcardFormat: 'string', decode: false },
    );
  });

  it('applies the reverse wildcard and decode override combination to every path method', () => {
    const FilesUrl = url(
      { path: '/files/{*path}' },
      { pathMatch: { wildcardFormat: 'string', decode: false } },
    );
    const options = { wildcardFormat: 'array', decode: true } as const;

    expectEveryPathMethod(FilesUrl, '/files/a%2Fb/c%20d', true, options);
    expectParamMethods(FilesUrl, '/files/a%2Fb/c%20d', { path: ['a/b', 'c d'] }, options);
  });

  it('applies sensitive contract options and per-method overrides to every path method', () => {
    const ApiUrl = url({ path: '/API/{id}' }, { pathMatch: { sensitive: true } });

    expectEveryPathMethod(ApiUrl, '/api/42', false);
    expectEveryPathMethod(ApiUrl, '/api/42', true, { sensitive: false });
    expectParamMethods(ApiUrl, '/api/42', { id: '42' }, { sensitive: false });
  });

  it('applies trailing contract options and per-method overrides to every path method', () => {
    const UserUrl = url({ path: '/users/{id}' }, { pathMatch: { trailing: false } });

    expectEveryPathMethod(UserUrl, '/users/42/', false);
    expectEveryPathMethod(UserUrl, '/users/42/', true, { trailing: true });
    expectParamMethods(UserUrl, '/users/42/', { id: '42' }, { trailing: true });
  });

  it('applies end contract options and per-method overrides to every path method', () => {
    const ApiUrl = url({ path: '/api' }, { pathMatch: { end: false } });

    expectEveryPathMethod(ApiUrl, '/api/users', true);
    expectEveryPathMethod(ApiUrl, '/api/users', false, { end: true });
  });

  it('applies strict contract options and per-method overrides to every path method', () => {
    const UserUrl = url(
      { path: '/users/{id:urlkitmissingstrict}' },
      { pathMatch: { strict: true } },
    );

    for (const method of pathMethodNames) {
      const strictOutcome = invokePathMethod(UserUrl, method, '/users/42');
      expect(strictOutcome.success, method).toBe(false);
      expect(strictOutcome.error?.code, method).toBe('invalid-param');

      const lenientOutcome = invokePathMethod(UserUrl, method, '/users/42', { strict: false });
      expect(lenientOutcome.success, method).toBe(false);

      if (method === 'match') {
        expect(lenientOutcome.error, method).toBeUndefined();
      } else {
        expect(lenientOutcome.error?.code, method).toBe('path-mismatch');
      }
    }
  });

  it('merges combined contract options and combined method overrides for every path method', () => {
    const replaceDash = (value: string): string => value.replaceAll('-', ' ');
    const ApiUrl = url(
      { path: '/API/{name}' },
      {
        pathMatch: {
          sensitive: true,
          end: false,
          trailing: false,
          strict: true,
          wildcardFormat: 'array',
          decode: replaceDash,
        },
      },
    );

    expectEveryPathMethod(ApiUrl, '/API/alpha-beta/child', true);
    expectParamMethods(ApiUrl, '/API/alpha-beta/child', { name: 'alpha beta' });

    const methodOverrides = {
      sensitive: false,
      end: true,
      trailing: true,
      strict: false,
      wildcardFormat: 'string',
      decode: false,
    } as const;

    expectEveryPathMethod(ApiUrl, '/api/alpha-beta/', true, methodOverrides);
    expectParamMethods(ApiUrl, '/api/alpha-beta/', { name: 'alpha-beta' }, methodOverrides);
  });
});
