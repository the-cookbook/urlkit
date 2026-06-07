import { describe, expect, it, expectTypeOf } from 'vitest';
import type { UrlRequestInput } from '../contracts.js';
import { UrlKitError } from '../errors/url-kit-error.js';
import { resolveRequestUrlInput } from './parse-request.js';

describe('resolveRequestUrlInput', () => {
  it('reads a web-standard Request URL', () => {
    const request = new Request('https://example.com/users/42?tab=profile#activity');

    expect(resolveRequestUrlInput(request)).toBe(
      'https://example.com/users/42?tab=profile#activity',
    );
  });

  it('reads a request-like url string', () => {
    expect(resolveRequestUrlInput({ url: '/users/42?tab=profile' })).toBe('/users/42?tab=profile');
  });

  it('resolves relative URLs against baseUrl', () => {
    const resolved = resolveRequestUrlInput(
      {
        url: '/users/42?tab=profile',
      },
      {
        baseUrl: 'https://example.com/app/',
      },
    );

    expect(resolved).toBeInstanceOf(URL);
    expect(String(resolved)).toBe('https://example.com/users/42?tab=profile');
  });

  it('rejects invalid request-like input', () => {
    expect(() => resolveRequestUrlInput({ originalUrl: '/users/42' } as never)).toThrow(
      UrlKitError,
    );

    try {
      resolveRequestUrlInput({ originalUrl: '/users/42' } as never);
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect((error as UrlKitError).code).toBe('invalid-url');
    }
  });

  it('rejects invalid baseUrl values', () => {
    expect(() => resolveRequestUrlInput({ url: '/users/42' }, { baseUrl: 'http://[' })).toThrow(
      UrlKitError,
    );

    try {
      resolveRequestUrlInput({ url: '/users/42' }, { baseUrl: 'http://[' });
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect((error as UrlKitError).code).toBe('invalid-url');
    }
  });

  it('keeps core request-like contracts framework-agnostic', () => {
    const input: UrlRequestInput = { url: '/users/42' };

    expectTypeOf<UrlRequestInput>(input);

    if (false) {
      const withExpressField: UrlRequestInput = {
        url: '/users/42',
        // @ts-expect-error framework-specific request fields do not belong in core UrlRequestInput.
        originalUrl: '/express/users/42',
      };
      expectTypeOf<UrlRequestInput>(withExpressField);
    }
  });
});
