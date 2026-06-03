import { describe, expect, it } from 'vitest';
import { parseUrl } from './parse-url.js';
import { formatParsedUrl } from './format-parsed-url.js';

describe('formatParsedUrl', () => {
  it('formats a parsed URL with replacement search and existing hash', () => {
    expect(formatParsedUrl(parseUrl('/docs?old=true#comments'), '?page=2')).toBe(
      '/docs?page=2#comments',
    );
  });

  it('omits empty replacement search', () => {
    expect(formatParsedUrl(parseUrl('/docs?old=true#comments'), '')).toBe('/docs#comments');
  });
});
