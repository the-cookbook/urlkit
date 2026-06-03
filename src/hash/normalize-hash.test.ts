import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { enumOf } from '../schema/enum-of.js';
import { string } from '../schema/string.js';
import { normalizeHash } from './normalize-hash.js';

describe('normalizeHash', () => {
  it('normalizes raw hash fragments without a descriptor', () => {
    expect(normalizeHash('#comments')).toBe('comments');
    expect(normalizeHash('#hello%20world')).toBe('hello world');
    expect(normalizeHash('')).toBeUndefined();
    expect(normalizeHash(undefined)).toBeUndefined();
  });

  it('normalizes optional, required, and defaulted string hash schemas', () => {
    expect(normalizeHash('comments', string().optional())).toBe('comments');
    expect(normalizeHash(undefined, string().optional())).toBeUndefined();
    expect(normalizeHash('comments', string())).toBe('comments');
    expect(normalizeHash(undefined, string().default('overview'))).toBe('overview');
  });

  it('rejects missing or null required hash values', () => {
    expect(() => normalizeHash(undefined, string())).toThrow(UrlKitError);
    expect(() => normalizeHash(null, string())).toThrow(UrlKitError);

    try {
      normalizeHash(null, string());
    } catch (error) {
      expect((error as UrlKitError).code).toBe('invalid-hash');
      expect((error as UrlKitError).message).toBe('Required value cannot be null.');
    }
  });

  it('validates enum hashes exactly', () => {
    const descriptor = enumOf(['comments', 'share'] as const);

    expect(normalizeHash('share', descriptor)).toBe('share');
    expect(() => normalizeHash('overview', descriptor)).toThrow(UrlKitError);
  });

  it('supports static hash descriptors', () => {
    expect(normalizeHash(undefined, { type: 'string', optional: true })).toBeUndefined();
    expect(normalizeHash(undefined, { type: 'string', default: 'overview' })).toBe('overview');
    expect(normalizeHash('comments', { type: 'enum', values: ['comments', 'share'] })).toBe(
      'comments',
    );
  });
});
