import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { compileStaticHash } from './compile-static-hash.js';

const expectInvalidDescriptor = (callback: () => unknown): void => {
  try {
    callback();
  } catch (error) {
    expect(error).toBeInstanceOf(UrlKitError);
    expect((error as UrlKitError).code).toBe('invalid-descriptor');
    expect((error as UrlKitError).path).toEqual(['hash']);
    return;
  }

  throw new Error('Expected invalid descriptor error.');
};

describe('compileStaticHash', () => {
  it('rejects readonly string array shorthand', () => {
    expectInvalidDescriptor(() => compileStaticHash(['comments', 'share'] as never));
  });

  it('compiles string hash descriptors', () => {
    expect(compileStaticHash({ type: 'string' })).toEqual({ kind: 'string', presence: 'required' });
    expect(compileStaticHash({ type: 'string', optional: true })).toEqual({
      kind: 'string',
      presence: 'optional',
    });
    expect(compileStaticHash({ type: 'string', default: 'overview' })).toEqual({
      kind: 'string',
      presence: 'defaulted',
      defaultValue: 'overview',
    });
  });

  it('compiles enum hash descriptors', () => {
    expect(compileStaticHash({ type: 'enum', values: ['overview', 'comments'] })).toEqual({
      kind: 'enum',
      presence: 'required',
      values: ['overview', 'comments'],
    });

    expect(
      compileStaticHash({ type: 'enum', values: ['overview', 'comments'], optional: true }),
    ).toEqual({
      kind: 'enum',
      presence: 'optional',
      values: ['overview', 'comments'],
    });

    expect(
      compileStaticHash({ type: 'enum', values: ['overview', 'comments'], default: 'overview' }),
    ).toEqual({
      kind: 'enum',
      presence: 'defaulted',
      values: ['overview', 'comments'],
      defaultValue: 'overview',
    });
  });

  it('rejects optional presence combined with defaults', () => {
    expectInvalidDescriptor(() =>
      compileStaticHash({
        type: 'enum',
        values: ['overview', 'comments'],
        optional: true,
        default: 'overview',
      } as never),
    );
  });

  it('rejects invalid static enum defaults', () => {
    expectInvalidDescriptor(() =>
      compileStaticHash({ type: 'enum', values: ['overview', 'comments'], default: 'share' }),
    );
  });

  it('rejects invalid hash descriptors', () => {
    expectInvalidDescriptor(() => compileStaticHash([] as never));
    expectInvalidDescriptor(() => compileStaticHash(null as never));
    expectInvalidDescriptor(() => compileStaticHash('comments' as never));
    expectInvalidDescriptor(() => compileStaticHash({} as never));
    expectInvalidDescriptor(() => compileStaticHash({ type: 'hash' } as never));
    expectInvalidDescriptor(() => compileStaticHash({ type: 'string', optional: 'yes' } as never));
    expectInvalidDescriptor(() => compileStaticHash({ type: 'string', default: 1 } as never));
    expectInvalidDescriptor(() =>
      compileStaticHash({ type: 'enum', optional: 1, values: ['comments'] } as never),
    );
    expectInvalidDescriptor(() => compileStaticHash({ type: 'enum', values: [] }));
    expectInvalidDescriptor(() => compileStaticHash({ type: 'enum', values: 'comments' } as never));
    expectInvalidDescriptor(() =>
      compileStaticHash({ type: 'enum', values: ['comments', 1] } as never),
    );
  });
});
