import { describe, expect, expectTypeOf, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { compilePath } from './compile-path.js';

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

describe('compilePath contract-level pathMatch options', () => {
  it('infers and returns contract-level wildcard arrays from both match methods', () => {
    const filesPath = compilePath('/files/{*path}', {
      pathMatch: { wildcardFormat: 'array' },
    });

    const parsed = filesPath.parsePathname('/files/docs/guides');
    const matched = filesPath.matchPathname('/files/docs/guides');

    expect(parsed).toEqual({ path: ['docs', 'guides'] });
    expectTypeOf<readonly string[]>(parsed.path);
    expect(matched).toEqual({
      match: true,
      path: '/files/docs/guides',
      params: { path: ['docs', 'guides'] },
    });

    if (matched.match) {
      expectTypeOf<readonly string[]>(matched.params.path);
    }
  });

  it('gives method wildcardFormat precedence for both match methods', () => {
    const filesPath = compilePath('/files/{*path}', {
      pathMatch: { wildcardFormat: 'array' },
    });

    const parsed = filesPath.parsePathname('/files/docs/guides', {
      wildcardFormat: 'string',
    });
    const matched = filesPath.matchPathname('/files/docs/guides', {
      wildcardFormat: 'string',
    });

    expect(parsed).toEqual({ path: 'docs/guides' });
    expectTypeOf<string>(parsed.path);

    if (matched.match) {
      expect(matched.params).toEqual({ path: 'docs/guides' });
      expectTypeOf<string>(matched.params.path);
    }
  });

  it('applies sensitive, trailing, and end contract options to both match methods', () => {
    const casePath = compilePath('/API/{id}', { pathMatch: { sensitive: true } });
    const trailingPath = compilePath('/users/{id}', { pathMatch: { trailing: false } });
    const prefixPath = compilePath('/api', { pathMatch: { end: false } });

    expect(casePath.matchPathname('/api/42')).toEqual({ match: false, params: null });
    expectUrlKitError(() => casePath.parsePathname('/api/42'), 'path-mismatch', ['pathname']);
    expect(casePath.parsePathname('/api/42', { sensitive: false })).toEqual({ id: '42' });
    expect(casePath.matchPathname('/api/42', { sensitive: false })).toMatchObject({
      match: true,
      params: { id: '42' },
    });

    expect(trailingPath.matchPathname('/users/42/')).toEqual({ match: false, params: null });
    expectUrlKitError(() => trailingPath.parsePathname('/users/42/'), 'path-mismatch', [
      'pathname',
    ]);
    expect(trailingPath.parsePathname('/users/42/', { trailing: true })).toEqual({ id: '42' });
    expect(trailingPath.matchPathname('/users/42/', { trailing: true })).toMatchObject({
      match: true,
      params: { id: '42' },
    });

    expect(prefixPath.parsePathname('/api/users')).toEqual({});
    expect(prefixPath.matchPathname('/api/users')).toEqual({
      match: true,
      path: '/api',
      params: {},
    });
    expectUrlKitError(
      () => prefixPath.parsePathname('/api/users', { end: true }),
      'path-mismatch',
      ['pathname'],
    );
    expect(prefixPath.matchPathname('/api/users', { end: true })).toEqual({
      match: false,
      params: null,
    });
  });

  it('applies strict and decode contract options to both match methods', () => {
    const strictPath = compilePath('/users/{id:urlkitmissingstrict}', {
      pathMatch: { strict: true },
    });
    const decodedPath = compilePath('/hello/{name}', { pathMatch: { decode: true } });

    expectUrlKitError(() => strictPath.parsePathname('/users/42'), 'invalid-param', ['params']);
    expectUrlKitError(() => strictPath.matchPathname('/users/42'), 'invalid-param', ['params']);
    expectUrlKitError(
      () => strictPath.parsePathname('/users/42', { strict: false }),
      'path-mismatch',
      ['pathname'],
    );
    expect(strictPath.matchPathname('/users/42', { strict: false })).toEqual({
      match: false,
      params: null,
    });

    expect(decodedPath.parsePathname('/hello/John%20Doe')).toEqual({ name: 'John Doe' });
    expect(decodedPath.matchPathname('/hello/John%20Doe')).toMatchObject({
      match: true,
      params: { name: 'John Doe' },
    });
    expect(decodedPath.parsePathname('/hello/John%20Doe', { decode: false })).toEqual({
      name: 'John%20Doe',
    });
    expect(decodedPath.matchPathname('/hello/John%20Doe', { decode: false })).toMatchObject({
      match: true,
      params: { name: 'John%20Doe' },
    });
  });

  it('merges complete contract options and complete method overrides for both match methods', () => {
    const replaceDash = (value: string): string => value.replaceAll('-', ' ');
    const path = compilePath('/API/{name}', {
      pathMatch: {
        sensitive: true,
        end: false,
        trailing: false,
        strict: true,
        wildcardFormat: 'array',
        decode: replaceDash,
      },
    });

    expect(path.parsePathname('/API/alpha-beta/child')).toEqual({ name: 'alpha beta' });
    expect(path.matchPathname('/API/alpha-beta/child')).toMatchObject({
      match: true,
      params: { name: 'alpha beta' },
    });

    const methodOverrides = {
      sensitive: false,
      end: true,
      trailing: true,
      strict: false,
      wildcardFormat: 'string',
      decode: false,
    } as const;

    expect(path.parsePathname('/api/alpha-beta/', methodOverrides)).toEqual({
      name: 'alpha-beta',
    });
    expect(path.matchPathname('/api/alpha-beta/', methodOverrides)).toMatchObject({
      match: true,
      params: { name: 'alpha-beta' },
    });
  });
});
