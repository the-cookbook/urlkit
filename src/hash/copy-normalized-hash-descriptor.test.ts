import { describe, expect, it } from 'vitest';
import type { NormalizedHashDescriptor } from './contracts.js';
import { copyNormalizedHashDescriptor } from './copy-normalized-hash-descriptor.js';

describe('copyNormalizedHashDescriptor', () => {
  it('copies and freezes optional string descriptors', () => {
    const copy = copyNormalizedHashDescriptor({ type: 'string', presence: 'optional' });

    expect(copy).toEqual({ type: 'string', presence: 'optional' });
    expect(Object.isFrozen(copy)).toBe(true);
  });

  it('copies and freezes enum values', () => {
    const values = ['overview', 'comments'];
    const descriptor: NormalizedHashDescriptor<string | undefined> = {
      type: 'enum',
      presence: 'optional',
      values,
    };

    const copy = copyNormalizedHashDescriptor(descriptor);
    values.push('share');

    expect(copy.values).toEqual(['overview', 'comments']);
    expect(Object.isFrozen(copy.values)).toBe(true);
  });

  it('copies defaulted descriptors', () => {
    const copy = copyNormalizedHashDescriptor({
      type: 'enum',
      presence: 'defaulted',
      values: ['overview', 'comments'],
      defaultValue: 'overview',
    });

    expect(copy).toEqual({
      type: 'enum',
      presence: 'defaulted',
      values: ['overview', 'comments'],
      defaultValue: 'overview',
    });
    expect(Object.isFrozen(copy)).toBe(true);
  });
});
