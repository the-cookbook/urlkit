import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { compileStaticHashDescriptor } from './compile-static-hash-descriptor.js';

describe('compileStaticHashDescriptor', () => {
  it('compiles readonly string array shorthand as optional enum hash', () => {
    const descriptor = compileStaticHashDescriptor(['comments', 'share'] as const);

    expect(descriptor).toEqual({
      kind: 'enum',
      presence: 'optional',
      values: ['comments', 'share'],
    });
    expect(Object.isFrozen(descriptor.values)).toBe(true);
  });

  it('compiles string hash descriptors with optional and default presence', () => {
    expect(compileStaticHashDescriptor({ type: 'string' })).toEqual({
      kind: 'string',
      presence: 'required',
    });
    expect(compileStaticHashDescriptor({ type: 'string', optional: true })).toEqual({
      kind: 'string',
      presence: 'optional',
    });
    expect(compileStaticHashDescriptor({ type: 'string', default: 'overview' })).toEqual({
      kind: 'string',
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
      kind: 'enum',
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
    ];

    for (const input of invalidInputs) {
      expect(() => compileStaticHashDescriptor(input as never)).toThrow(UrlKitError);
      expect(() => compileStaticHashDescriptor(input as never)).toThrow(
        expect.objectContaining({ code: 'invalid-descriptor' }),
      );
    }
  });

  it('rejects invalid enum values and string defaults', () => {
    expect(() => compileStaticHashDescriptor([] as never)).toThrow(
      expect.objectContaining({ code: 'invalid-descriptor' }),
    );
    expect(() => compileStaticHashDescriptor(['comments', 1] as never)).toThrow(
      expect.objectContaining({ code: 'invalid-descriptor' }),
    );
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
