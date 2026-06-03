import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { int } from '../schema/int.js';
import { string } from '../schema/string.js';
import { compileHashDescriptor } from './compile-hash-descriptor.js';

describe('compileHashDescriptor', () => {
  it('defaults to an optional string hash descriptor', () => {
    expect(compileHashDescriptor().descriptor).toEqual({ kind: 'string', presence: 'optional' });
  });

  it('compiles runtime string descriptors', () => {
    expect(compileHashDescriptor(string().default('overview')).descriptor).toEqual({
      kind: 'string',
      presence: 'defaulted',
      defaultValue: 'overview',
    });
  });

  it('rejects runtime schemas that are not valid hash schemas', () => {
    expect(() => compileHashDescriptor(int() as never)).toThrow(UrlKitError);
  });
});
