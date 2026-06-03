import { describe, expect, it } from 'vitest';
import { string } from '../schema/string.js';
import { compileUrlDescriptor } from './compile-url-descriptor.js';
import { compilePath } from './compile-path.js';
import { UrlKitError } from '../errors/url-kit-error.js';

const expectInvalidDescriptor = (callback: () => unknown, path: readonly string[]): void => {
  try {
    callback();
  } catch (error) {
    expect(error).toBeInstanceOf(UrlKitError);
    expect((error as UrlKitError).code).toBe('invalid-descriptor');
    expect((error as UrlKitError).path).toEqual(path);
    return;
  }

  throw new Error('Expected invalid descriptor error.');
};

describe('compileUrlDescriptor', () => {
  it('compiles path descriptors once into a frozen compiled URL descriptor', () => {
    const path = compilePath('/users/{id:int}');
    const compiled = compileUrlDescriptor({
      mode: 'path',
      pattern: '/users/{id:int}',
      path: path as never,
      search: {
        tab: string().default('profile'),
      },
      hash: {
        kind: 'string',
        presence: 'optional',
      },
    });

    expect(compiled.mode).toBe('path');
    expect(compiled.pattern).toBe('/users/{id:int}');
    expect(compiled.path).toBe(path);
    expect(compiled.search?.fields).toHaveLength(1);
    expect(compiled.hash?.descriptor).toEqual({ kind: 'string', presence: 'optional' });
    expect(Object.isFrozen(compiled)).toBe(true);
  });

  it('compiles a path from pattern when no compiled path is provided', () => {
    const compiled = compileUrlDescriptor({
      mode: 'path',
      pattern: '/users/{id:int}',
    });

    expect(compiled.path?.parsePathname('/users/42')).toEqual({ id: 42 });
    expect(compiled.path?.buildPath({ id: 42 })).toBe('/users/42');
  });

  it('keeps pathless descriptors pathless', () => {
    const compiled = compileUrlDescriptor({
      mode: 'pathless',
      pattern: undefined,
    });

    expect(compiled.mode).toBe('pathless');
    expect(compiled.pattern).toBeUndefined();
    expect(compiled.path).toBeUndefined();
  });

  it('rejects invalid normalized descriptor shapes', () => {
    expectInvalidDescriptor(() => compileUrlDescriptor(null as never), []);
    expectInvalidDescriptor(
      () => compileUrlDescriptor({ mode: 'other', pattern: undefined } as never),
      ['mode'],
    );
    expectInvalidDescriptor(
      () => compileUrlDescriptor({ mode: 'path', pattern: undefined } as never),
      ['pattern'],
    );
    expectInvalidDescriptor(
      () => compileUrlDescriptor({ mode: 'pathless', pattern: '/users' } as never),
      ['pattern'],
    );
  });
});
