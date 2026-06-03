import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { enumOf } from '../schema/enum-of.js';
import { string } from '../schema/string.js';
import { buildHash } from './build-hash.js';

describe('buildHash', () => {
  it('builds optional hash fragments without a descriptor', () => {
    expect(buildHash()).toBe('');
    expect(buildHash(undefined)).toBe('');
    expect(buildHash(null)).toBe('');
    expect(buildHash('comments')).toBe('#comments');
    expect(buildHash('hello world')).toBe('#hello%20world');
  });

  it('builds optional, required, and defaulted string hash schemas', () => {
    expect(buildHash(undefined, string().optional())).toBe('');
    expect(buildHash('comments', string())).toBe('#comments');
    expect(buildHash(undefined, string().default('overview'))).toBe('#overview');
  });

  it('throws invalid-hash for missing required hash values', () => {
    expect(() => buildHash(undefined, string())).toThrow(UrlKitError);

    try {
      buildHash(undefined, string());
    } catch (error) {
      expect((error as UrlKitError).code).toBe('invalid-hash');
      expect((error as UrlKitError).path).toEqual(['hash']);
    }
  });

  it('validates enum hash values', () => {
    const descriptor = enumOf(['comments', 'share'] as const);

    expect(buildHash('share', descriptor)).toBe('#share');
    expect(() => buildHash('overview', descriptor)).toThrow(UrlKitError);
  });

  it('supports static enum descriptors', () => {
    const descriptor = { type: 'enum', values: ['comments', 'share'] } as const;

    expect(buildHash('comments', descriptor)).toBe('#comments');
    expect(() => buildHash('overview', descriptor)).toThrow(UrlKitError);
  });

  it('supports default include and omit behavior', () => {
    const descriptor = enumOf(['overview', 'comments'] as const).default('overview');

    expect(buildHash(undefined, descriptor)).toBe('#overview');
    expect(buildHash(undefined, descriptor, { defaults: 'include' })).toBe('#overview');
    expect(buildHash('overview', descriptor, { defaults: 'include' })).toBe('#overview');
    expect(buildHash(undefined, descriptor, { defaults: 'omit' })).toBe('');
    expect(buildHash('overview', descriptor, { defaults: 'omit' })).toBe('');
    expect(buildHash('comments', descriptor, { defaults: 'omit' })).toBe('#comments');
  });

  it('supports options as the second argument when no descriptor is provided', () => {
    expect(buildHash(undefined, { defaults: 'omit' })).toBe('');
    expect(buildHash('comments', { defaults: 'omit' })).toBe('#comments');
  });
});
