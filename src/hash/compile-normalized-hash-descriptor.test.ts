import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { compileNormalizedHashDescriptor } from './compile-normalized-hash-descriptor.js';

describe('compileNormalizedHashDescriptor', () => {
  it('compiles normalized descriptors into parse/normalize/serialize codecs', () => {
    const compiled = compileNormalizedHashDescriptor({ kind: 'string', presence: 'optional' });

    expect(compiled.parse('comments')).toBe('comments');
    expect(compiled.normalize('comments')).toBe('comments');
    expect(compiled.serialize('comments')).toBe('comments');
  });

  it('applies defaults and detects default values', () => {
    const compiled = compileNormalizedHashDescriptor({
      kind: 'enum',
      presence: 'defaulted',
      values: ['overview', 'comments'],
      defaultValue: 'overview',
    });

    expect(compiled.parse(undefined)).toBe('overview');
    expect(compiled.normalize(null)).toBe('overview');
    expect(compiled.isDefault('overview')).toBe(true);
    expect(compiled.isDefault('comments')).toBe(false);
  });

  it('serializes absent optional hash as undefined', () => {
    const compiled = compileNormalizedHashDescriptor({ kind: 'string', presence: 'optional' });

    expect(compiled.serialize(undefined)).toBeUndefined();
  });

  it('rejects invalid enum values', () => {
    const compiled = compileNormalizedHashDescriptor({
      kind: 'enum',
      presence: 'optional',
      values: ['overview'],
    });

    expect(() => compiled.parse('comments')).toThrow(UrlKitError);
  });

  it('copies normalized descriptors before compiling', () => {
    const values = ['overview'];
    const compiled = compileNormalizedHashDescriptor({
      kind: 'enum',
      presence: 'optional',
      values,
    });
    values.push('comments');

    expect(compiled.descriptor.values).toEqual(['overview']);
    expect(() => compiled.parse('comments')).toThrow(UrlKitError);
  });
});
