import { describe, expect, it } from 'vitest';
import { isNormalizedHashDescriptor } from './is-normalized-hash-descriptor.js';

describe('isNormalizedHashDescriptor', () => {
  it('accepts normalized string descriptors', () => {
    expect(isNormalizedHashDescriptor({ kind: 'string', presence: 'optional' })).toBe(true);
  });

  it('accepts normalized enum descriptors', () => {
    expect(
      isNormalizedHashDescriptor({ kind: 'enum', presence: 'defaulted', defaultValue: 'overview' }),
    ).toBe(true);
  });

  it('rejects non-record inputs', () => {
    expect(isNormalizedHashDescriptor(undefined)).toBe(false);
    expect(isNormalizedHashDescriptor(null)).toBe(false);
    expect(isNormalizedHashDescriptor([])).toBe(false);
  });

  it('rejects unsupported kind or presence values', () => {
    expect(isNormalizedHashDescriptor({ kind: 'number', presence: 'optional' })).toBe(false);
    expect(isNormalizedHashDescriptor({ kind: 'string', presence: 'unknown' })).toBe(false);
  });
});
