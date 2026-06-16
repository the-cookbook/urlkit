import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import type { NormalizedHashDescriptor } from './contracts.js';
import { validateNormalizedHashValue } from './validate-normalized-hash-value.js';

const optionalString: NormalizedHashDescriptor<string | undefined> = {
  type: 'string',
  presence: 'optional',
};
const requiredString: NormalizedHashDescriptor<string | undefined> = {
  type: 'string',
  presence: 'required',
};
const defaultEnum: NormalizedHashDescriptor<string | undefined> = {
  type: 'enum',
  presence: 'defaulted',
  values: ['overview', 'comments'],
  defaultValue: 'overview',
};

describe('validateNormalizedHashValue', () => {
  it('treats undefined and null optional hash as absent', () => {
    expect(
      validateNormalizedHashValue(optionalString, undefined, { serialized: true }),
    ).toBeUndefined();
    expect(
      validateNormalizedHashValue(optionalString, null, { serialized: false }),
    ).toBeUndefined();
  });

  it('applies defaults for absent defaulted hash values', () => {
    expect(validateNormalizedHashValue(defaultEnum, undefined, { serialized: true })).toBe(
      'overview',
    );
    expect(validateNormalizedHashValue(defaultEnum, null, { serialized: false })).toBe('overview');
  });

  it('rejects missing and null required hashes', () => {
    expect(() =>
      validateNormalizedHashValue(requiredString, undefined, { serialized: true }),
    ).toThrow(UrlKitError);
    expect(() => validateNormalizedHashValue(requiredString, null, { serialized: false })).toThrow(
      UrlKitError,
    );
  });

  it('rejects non-string serialized and structured values', () => {
    expect(() => validateNormalizedHashValue(optionalString, 1, { serialized: true })).toThrow(
      'Serialized hash must be a string.',
    );
    expect(() => validateNormalizedHashValue(optionalString, 1, { serialized: false })).toThrow(
      'Hash must be a string.',
    );
  });

  it('validates enum values exactly', () => {
    expect(validateNormalizedHashValue(defaultEnum, 'comments', { serialized: true })).toBe(
      'comments',
    );
    expect(() => validateNormalizedHashValue(defaultEnum, 'share', { serialized: true })).toThrow(
      UrlKitError,
    );
  });

  it('uses invalid-hash error code and hash path', () => {
    try {
      validateNormalizedHashValue(defaultEnum, 'share', { serialized: true });
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect((error as UrlKitError).code).toBe('invalid-hash');
      expect((error as UrlKitError).path).toEqual(['hash']);
    }
  });
});
