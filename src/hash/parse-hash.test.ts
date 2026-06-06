import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { enumOf } from '../schema/enum-of.js';
import { string } from '../schema/string.js';
import { parseHash } from './parse-hash.js';

describe('parseHash', () => {
  it('normalizes absent and empty hash input as undefined without a descriptor', () => {
    expect(parseHash(undefined)).toBeUndefined();
    expect(parseHash(null)).toBeUndefined();
    expect(parseHash('')).toBeUndefined();
    expect(parseHash('#')).toBeUndefined();
  });

  it('strips the leading hash marker and decodes serialized hash values', () => {
    expect(parseHash('#comments')).toBe('comments');
    expect(parseHash('comments')).toBe('comments');
    expect(parseHash('#hello%20world')).toBe('hello world');
    expect(parseHash(new URL('https://example.com/docs#comments'))).toBe('comments');
  });

  it('throws invalid-hash for unsupported or malformed hash input', () => {
    expect(() => parseHash(1)).toThrow(UrlKitError);
    expect(() => parseHash('#%E0%A4%A')).toThrow(UrlKitError);

    try {
      parseHash('#%E0%A4%A');
    } catch (error) {
      expect((error as UrlKitError).code).toBe('invalid-hash');
      expect((error as UrlKitError).path).toEqual(['hash']);
    }
  });

  it('supports optional string hash schemas', () => {
    const descriptor = string().optional();

    expect(parseHash('#comments', descriptor)).toBe('comments');
    expect(parseHash(undefined, descriptor)).toBeUndefined();
    expect(parseHash(null, descriptor)).toBeUndefined();
  });

  it('supports required string hash schemas', () => {
    const descriptor = string();

    expect(parseHash('#comments', descriptor)).toBe('comments');
    expect(() => parseHash(undefined, descriptor)).toThrow(UrlKitError);

    try {
      parseHash(undefined, descriptor);
    } catch (error) {
      expect((error as UrlKitError).code).toBe('invalid-hash');
      expect((error as UrlKitError).path).toEqual(['hash']);
    }
  });

  it('supports default string hash schemas', () => {
    expect(parseHash(undefined, string().default('overview'))).toBe('overview');
    expect(parseHash(null, string().default('overview'))).toBe('overview');
  });

  it('supports enum hash schemas and validates exact enum values', () => {
    const descriptor = enumOf(['comments', 'share'] as const).optional();

    expect(parseHash('#comments', descriptor)).toBe('comments');
    expect(parseHash(undefined, descriptor)).toBeUndefined();
    expect(() => parseHash('#overview', descriptor)).toThrow(UrlKitError);

    try {
      parseHash('#overview', descriptor);
    } catch (error) {
      expect((error as UrlKitError).code).toBe('invalid-hash');
      expect((error as UrlKitError).path).toEqual(['hash']);
    }
  });

  it('can omit invalid optional enum hash values without rejecting the call', () => {
    const descriptor = enumOf(['comments', 'share'] as const).optional();

    expect(parseHash('#overview', descriptor, { invalidHash: 'omit' })).toBeUndefined();
    expect(
      parseHash('#overview', ['comments', 'share'] as const, { invalidHash: 'omit' }),
    ).toBeUndefined();
  });

  it('keeps required invalid hash values strict even with invalidHash omit', () => {
    const descriptor = enumOf(['comments', 'share'] as const);

    expect(() => parseHash('#overview', descriptor, { invalidHash: 'omit' })).toThrow(UrlKitError);
  });

  it('supports static enum shorthand as optional hash', () => {
    expect(parseHash('#comments', ['comments', 'share'] as const)).toBe('comments');
    expect(parseHash(undefined, ['comments', 'share'] as const)).toBeUndefined();
    expect(() => parseHash('#overview', ['comments', 'share'] as const)).toThrow(UrlKitError);
  });
});
