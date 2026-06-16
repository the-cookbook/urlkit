import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { compileStaticHashDescriptor } from './compile-static-hash-descriptor.js';

describe('compileStaticHashDescriptor', () => {
  it('rejects readonly string array shorthand', () => {
    expect(() => compileStaticHashDescriptor(['comments', 'share'] as never)).toThrow(
      expect.objectContaining({ code: 'invalid-descriptor', path: ['hash'] }),
    );
  });

  it('compiles string hash descriptors with optional and default presence', () => {
    expect(compileStaticHashDescriptor({ type: 'string' })).toEqual({
      type: 'string',
      presence: 'required',
    });
    expect(compileStaticHashDescriptor({ type: 'string', optional: true })).toEqual({
      type: 'string',
      presence: 'optional',
    });
    expect(compileStaticHashDescriptor({ type: 'string', default: 'overview' })).toEqual({
      type: 'string',
      presence: 'defaulted',
      defaultValue: 'overview',
    });
  });

  it('compiles enum hash descriptors and validates defaults', () => {
    expect(
      compileStaticHashDescriptor({
        type: 'enum',
        values: ['overview', 'comments'],
        default: 'overview',
      }),
    ).toEqual({
      type: 'enum',
      presence: 'defaulted',
      values: ['overview', 'comments'],
      defaultValue: 'overview',
    });

    expect(() =>
      compileStaticHashDescriptor({
        type: 'enum',
        values: ['overview', 'comments'],
        default: 'share',
      }),
    ).toThrow(expect.objectContaining({ code: 'invalid-descriptor', path: ['hash'] }));
  });

  it('rejects invalid descriptor shapes deterministically', () => {
    const invalidInputs = [
      undefined,
      null,
      'comments',
      { type: 'boolean' },
      { type: 'string', optional: 'yes' },
      { type: 'string', optional: false },
      { type: 'string', optional: true, default: 'overview' },
    ];

    for (const input of invalidInputs) {
      expect(() => compileStaticHashDescriptor(input as never)).toThrow(UrlKitError);
      expect(() => compileStaticHashDescriptor(input as never)).toThrow(
        expect.objectContaining({ code: 'invalid-descriptor' }),
      );
    }
  });

  it('rejects invalid enum values and string defaults', () => {
    expect(() => compileStaticHashDescriptor({ type: 'enum', values: [] })).toThrow(
      expect.objectContaining({ code: 'invalid-descriptor' }),
    );
    expect(() =>
      compileStaticHashDescriptor({ type: 'enum', values: ['comments', 1] } as never),
    ).toThrow(expect.objectContaining({ code: 'invalid-descriptor' }));
    expect(() => compileStaticHashDescriptor({ type: 'string', default: 1 } as never)).toThrow(
      expect.objectContaining({ code: 'invalid-descriptor' }),
    );
  });

  it('copies enum values so later mutation cannot affect the descriptor', () => {
    const values = ['overview', 'comments'];
    const descriptor = compileStaticHashDescriptor({ type: 'enum', values });

    values.push('share');

    expect(descriptor.values).toEqual(['overview', 'comments']);
    expect(Object.isFrozen(descriptor.values)).toBe(true);
  });
});
