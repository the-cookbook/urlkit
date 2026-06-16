import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { enumOf } from '../schema/enum-of.js';
import { int } from '../schema/int.js';
import { string } from '../schema/string.js';
import { compileRuntimeHashDescriptor } from './compile-runtime-hash-descriptor.js';

describe('compileRuntimeHashDescriptor', () => {
  it('compiles runtime string schemas', () => {
    const compiled = compileRuntimeHashDescriptor(string().default('overview'));

    expect(compiled.descriptor).toEqual({
      type: 'string',
      presence: 'defaulted',
      defaultValue: 'overview',
    });
    expect(compiled.parse(undefined)).toBe('overview');
    expect(compiled.serialize('comments')).toBe('comments');
    expect(compiled.isDefault('overview')).toBe(true);
  });

  it('compiles runtime enum schemas and preserves enum values', () => {
    const compiled = compileRuntimeHashDescriptor(
      enumOf(['overview', 'comments'] as const).optional(),
    );

    expect(compiled.descriptor).toEqual({
      type: 'enum',
      presence: 'optional',
      values: ['overview', 'comments'],
    });
    expect(compiled.parse('comments')).toBe('comments');
    expect(() => compiled.parse('share')).toThrow(UrlKitError);
  });

  it('rejects runtime schemas that are not valid hash schemas', () => {
    expect(() => compileRuntimeHashDescriptor(int() as never)).toThrow(UrlKitError);
  });
});
