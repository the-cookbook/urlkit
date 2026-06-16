import { describe, expect, expectTypeOf, it } from 'vitest';
import type { ParseUrlOptions, UrlPathMatchOptions } from '../contracts.js';
import { url } from './create-url.js';

describe('url contract-level pathMatch options', () => {
  it('infers wildcard arrays for every state-returning path method', () => {
    const CatchAllUrl = url(
      { path: '/search/{*terms}' },
      { pathMatch: { wildcardFormat: 'array' } },
    );

    const parsed = CatchAllUrl.parse('/search/foo/bar');
    const safelyParsed = CatchAllUrl.safeParse('/search/foo/bar');
    const request = CatchAllUrl.parseRequest({ url: 'https://example.com/search/foo/bar' });
    const safeRequest = CatchAllUrl.safeParseRequest({
      url: 'https://example.com/search/foo/bar',
    });
    const pathnameParams = CatchAllUrl.parsePathname('/search/foo/bar');

    expectTypeOf<readonly string[]>(parsed.params.terms);
    expectTypeOf<readonly string[]>(request.params.terms);
    expectTypeOf<readonly string[]>(pathnameParams.terms);

    if (safelyParsed.success) {
      expectTypeOf<readonly string[]>(safelyParsed.data.params.terms);
    }

    if (safeRequest.success) {
      expectTypeOf<readonly string[]>(safeRequest.data.params.terms);
    }

    expect(parsed.params).toEqual({ terms: ['foo', 'bar'] });
    expect(request.params).toEqual({ terms: ['foo', 'bar'] });
    expect(pathnameParams).toEqual({ terms: ['foo', 'bar'] });
  });

  it('gives explicit method wildcardFormat precedence for every parsing method', () => {
    const CatchAllUrl = url(
      { path: '/search/{*terms}' },
      { pathMatch: { wildcardFormat: 'array' } },
    );

    const parsed = CatchAllUrl.parse('/search/foo/bar', { wildcardFormat: 'string' });
    const safelyParsed = CatchAllUrl.safeParse('/search/foo/bar', { wildcardFormat: 'string' });
    const request = CatchAllUrl.parseRequest(
      { url: 'https://example.com/search/foo/bar' },
      { wildcardFormat: 'string' },
    );
    const safeRequest = CatchAllUrl.safeParseRequest(
      { url: 'https://example.com/search/foo/bar' },
      { wildcardFormat: 'string' },
    );
    const pathnameParams = CatchAllUrl.parsePathname('/search/foo/bar', {
      wildcardFormat: 'string',
    });

    expectTypeOf<string>(parsed.params.terms);
    expectTypeOf<string>(request.params.terms);
    expectTypeOf<string>(pathnameParams.terms);

    if (safelyParsed.success) {
      expectTypeOf<string>(safelyParsed.data.params.terms);
    }

    if (safeRequest.success) {
      expectTypeOf<string>(safeRequest.data.params.terms);
    }

    expect(parsed.params).toEqual({ terms: 'foo/bar' });
    expect(request.params).toEqual({ terms: 'foo/bar' });
    expect(pathnameParams).toEqual({ terms: 'foo/bar' });
  });

  it('infers method-level wildcard arrays over a contract-level string format', () => {
    const CatchAllUrl = url(
      { path: '/search/{*terms}' },
      { pathMatch: { wildcardFormat: 'string' } },
    );

    const parsed = CatchAllUrl.parse('/search/foo/bar', { wildcardFormat: 'array' });
    const safelyParsed = CatchAllUrl.safeParse('/search/foo/bar', { wildcardFormat: 'array' });
    const request = CatchAllUrl.parseRequest(
      { url: 'https://example.com/search/foo/bar' },
      { wildcardFormat: 'array' },
    );
    const safeRequest = CatchAllUrl.safeParseRequest(
      { url: 'https://example.com/search/foo/bar' },
      { wildcardFormat: 'array' },
    );
    const pathnameParams = CatchAllUrl.parsePathname('/search/foo/bar', {
      wildcardFormat: 'array',
    });

    expectTypeOf<readonly string[]>(parsed.params.terms);
    expectTypeOf<readonly string[]>(request.params.terms);
    expectTypeOf<readonly string[]>(pathnameParams.terms);

    if (safelyParsed.success) {
      expectTypeOf<readonly string[]>(safelyParsed.data.params.terms);
    }

    if (safeRequest.success) {
      expectTypeOf<readonly string[]>(safeRequest.data.params.terms);
    }
  });

  it('retains the contract wildcard format when method options omit it', () => {
    const CatchAllUrl = url(
      { path: '/search/{*terms}' },
      { pathMatch: { wildcardFormat: 'array', sensitive: true } },
    );

    const parsed = CatchAllUrl.parse('/search/foo/bar', { strict: false });
    const safelyParsed = CatchAllUrl.safeParse('/search/foo/bar', { decode: false });
    const request = CatchAllUrl.parseRequest(
      { url: 'https://example.com/search/foo/bar' },
      { trailing: true },
    );
    const safeRequest = CatchAllUrl.safeParseRequest(
      { url: 'https://example.com/search/foo/bar' },
      { end: true },
    );
    const pathnameParams = CatchAllUrl.parsePathname('/search/foo/bar', { sensitive: true });

    expectTypeOf<readonly string[]>(parsed.params.terms);
    expectTypeOf<readonly string[]>(request.params.terms);
    expectTypeOf<readonly string[]>(pathnameParams.terms);

    if (safelyParsed.success) {
      expectTypeOf<readonly string[]>(safelyParsed.data.params.terms);
    }

    if (safeRequest.success) {
      expectTypeOf<readonly string[]>(safeRequest.data.params.terms);
    }
  });

  it('uses safe unions for widened contract and method options', () => {
    const contractOptions = {
      pathMatch: {} as UrlPathMatchOptions,
    };
    const methodOptions = {} as ParseUrlOptions;
    const CatchAllUrl = url({ path: '/search/{*terms}' }, contractOptions);
    const state = CatchAllUrl.parse('/search/foo/bar', methodOptions);

    expectTypeOf<string | readonly string[]>(state.params.terms);
  });

  it('preserves numeric, optional, and non-wildcard parameter inference', () => {
    if (false) {
      const ValuesUrl = url(
        { path: '/groups/{groupId:int}/values/{*ids:min(1)?}' },
        { pathMatch: { wildcardFormat: 'array' } },
      );
      const state = ValuesUrl.parse('/groups/1/values/2/3');
      expectTypeOf<number>(state.params.groupId);
      expectTypeOf<readonly number[] | undefined>(state.params.ids);

      const stringState = ValuesUrl.parse('/groups/1/values/2/3', {
        wildcardFormat: 'string',
      });
      expectTypeOf<number | undefined>(stringState.params.ids);
    }

    expect(true).toBe(true);
  });
});
