import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { parseUrl } from './parse-url.js';

describe('parseUrl', () => {
  it('parses relative URL strings', () => {
    const parsed = parseUrl('/users/42?tab=profile#activity');

    expect(parsed.pathname).toBe('/users/42');
    expect([...parsed.searchParams]).toEqual([['tab', 'profile']]);
    expect(parsed.hash).toBe('#activity');
    expect(Object.isFrozen(parsed)).toBe(true);
  });

  it('parses absolute URL strings', () => {
    const parsed = parseUrl('https://example.com/users/42?tab=profile#activity');

    expect(parsed.pathname).toBe('/users/42');
    expect([...parsed.searchParams]).toEqual([['tab', 'profile']]);
    expect(parsed.hash).toBe('#activity');
  });

  it('parses URL instances without mutating the original', () => {
    const url = new URL('https://example.com/products?page=2');
    const parsed = parseUrl(url);

    url.searchParams.set('page', '3');

    expect(parsed.pathname).toBe('/products');
    expect(parsed.searchParams.get('page')).toBe('2');
  });

  it('rejects structured object inputs', () => {
    expect(() => parseUrl({ url: '/users/1' } as never)).toThrow(UrlKitError);

    try {
      parseUrl({ url: '/users/1' } as never);
    } catch (error) {
      expect((error as UrlKitError).code).toBe('invalid-url');
    }
  });
});
