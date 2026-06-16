import { describe, expect, it } from 'vitest';
import { isNormalizedHashDescriptor } from './is-normalized-hash-descriptor.js';

describe('isNormalizedHashDescriptor', () => {
  it('accepts normalized string descriptors', () => {
    expect(isNormalizedHashDescriptor({ type: 'string', presence: 'optional' })).toBe(true);
  });

  it('accepts normalized enum descriptors', () => {
    expect(
      isNormalizedHashDescriptor({ type: 'enum', presence: 'defaulted', defaultValue: 'overview' }),
    ).toBe(true);
  });

  it('rejects non-record inputs', () => {
    expect(isNormalizedHashDescriptor(undefined)).toBe(false);
    expect(isNormalizedHashDescriptor(null)).toBe(false);
    expect(isNormalizedHashDescriptor([])).toBe(false);
  });

  it('rejects unsupported type or presence values', () => {
    expect(isNormalizedHashDescriptor({ type: 'number', presence: 'optional' })).toBe(false);
    expect(isNormalizedHashDescriptor({ type: 'string', presence: 'unknown' })).toBe(false);
  });
});
