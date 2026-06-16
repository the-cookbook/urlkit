import { describe, expect, expectTypeOf, it } from 'vitest';
import { createRouteUrlContract } from './create-route-url-contract.js';

describe('createRouteUrlContract pathMatch inference', () => {
  it('preserves raw wildcard arrays across every state-returning path method', () => {
    const contract = createRouteUrlContract({ path: '/files/{*path:int}' } as const, {
      pathMatch: { wildcardFormat: 'array' },
    });

    const parsed = contract.parse('/files/1');
    const safelyParsed = contract.safeParse('/files/1');
    const request = contract.parseRequest({ url: 'https://example.com/files/1' });
    const safeRequest = contract.safeParseRequest({ url: 'https://example.com/files/1' });
    const pathnameParams = contract.parsePathname('/files/1');

    expect(parsed.params).toEqual({ path: ['1'] });
    expect(request.params).toEqual({ path: ['1'] });
    expect(pathnameParams).toEqual({ path: ['1'] });
    expectTypeOf<readonly string[]>(parsed.params.path);
    expectTypeOf<readonly string[]>(request.params.path);
    expectTypeOf<readonly string[]>(pathnameParams.path);

    if (safelyParsed.success) {
      expectTypeOf<readonly string[]>(safelyParsed.data.params.path);
    }

    if (safeRequest.success) {
      expectTypeOf<readonly string[]>(safeRequest.data.params.path);
    }
  });

  it('preserves parsed wildcard arrays across every state-returning path method', () => {
    const contract = createRouteUrlContract({ path: '/files/{*path:int}' } as const, {
      params: 'parsed',
      pathMatch: { wildcardFormat: 'array' },
    });

    const parsed = contract.parse('/files/1');
    const safelyParsed = contract.safeParse('/files/1');
    const request = contract.parseRequest({ url: 'https://example.com/files/1' });
    const safeRequest = contract.safeParseRequest({ url: 'https://example.com/files/1' });
    const pathnameParams = contract.parsePathname('/files/1');

    expect(parsed.params).toEqual({ path: [1] });
    expect(request.params).toEqual({ path: [1] });
    expect(pathnameParams).toEqual({ path: [1] });
    expectTypeOf<readonly number[]>(parsed.params.path);
    expectTypeOf<readonly number[]>(request.params.path);
    expectTypeOf<readonly number[]>(pathnameParams.path);

    if (safelyParsed.success) {
      expectTypeOf<readonly number[]>(safelyParsed.data.params.path);
    }

    if (safeRequest.success) {
      expectTypeOf<readonly number[]>(safeRequest.data.params.path);
    }
  });

  it('gives method wildcardFormat precedence without changing raw or parsed scalar modes', () => {
    const raw = createRouteUrlContract({ path: '/files/{*path:int}' } as const, {
      pathMatch: { wildcardFormat: 'array' },
    });
    const parsed = createRouteUrlContract({ path: '/files/{*path:int}' } as const, {
      params: 'parsed',
      pathMatch: { wildcardFormat: 'array' },
    });

    const rawState = raw.parse('/files/1', { wildcardFormat: 'string' });
    const parsedState = parsed.parse('/files/1', { wildcardFormat: 'string' });
    const rawPathname = raw.parsePathname('/files/1', { wildcardFormat: 'string' });
    const parsedPathname = parsed.parsePathname('/files/1', { wildcardFormat: 'string' });

    expect(rawState.params).toEqual({ path: '1' });
    expect(parsedState.params).toEqual({ path: 1 });
    expect(rawPathname).toEqual({ path: '1' });
    expect(parsedPathname).toEqual({ path: 1 });
    expectTypeOf<string>(rawState.params.path);
    expectTypeOf<number>(parsedState.params.path);
    expectTypeOf<string>(rawPathname.path);
    expectTypeOf<number>(parsedPathname.path);
  });

  it('applies combined contract options and method overrides in router-runtime contracts', () => {
    const replaceDash = (value: string): string => value.replaceAll('-', ' ');
    const contract = createRouteUrlContract({ path: '/API/{name}' } as const, {
      pathMatch: {
        sensitive: true,
        end: false,
        trailing: false,
        strict: true,
        wildcardFormat: 'array',
        decode: replaceDash,
      },
    });

    expect(contract.parse('/API/alpha-beta/child').params).toEqual({ name: 'alpha beta' });
    expect(contract.safeParse('/API/alpha-beta/child').success).toBe(true);
    expect(
      contract.parseRequest({ url: 'https://example.com/API/alpha-beta/child' }).params,
    ).toEqual({ name: 'alpha beta' });
    expect(
      contract.safeParseRequest({ url: 'https://example.com/API/alpha-beta/child' }).success,
    ).toBe(true);
    expect(contract.match('/API/alpha-beta/child')).toBe(true);
    expect(contract.parsePathname('/API/alpha-beta/child')).toEqual({ name: 'alpha beta' });

    const overrides = {
      sensitive: false,
      end: true,
      trailing: true,
      strict: false,
      wildcardFormat: 'string',
      decode: false,
    } as const;

    expect(contract.parse('/api/alpha-beta/', overrides).params).toEqual({ name: 'alpha-beta' });
    expect(contract.safeParse('/api/alpha-beta/', overrides).success).toBe(true);
    expect(
      contract.parseRequest({ url: 'https://example.com/api/alpha-beta/' }, overrides).params,
    ).toEqual({ name: 'alpha-beta' });
    expect(
      contract.safeParseRequest({ url: 'https://example.com/api/alpha-beta/' }, overrides).success,
    ).toBe(true);
    expect(contract.match('/api/alpha-beta/', overrides)).toBe(true);
    expect(contract.parsePathname('/api/alpha-beta/', overrides)).toEqual({ name: 'alpha-beta' });
  });
});
