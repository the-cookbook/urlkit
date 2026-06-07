import { describe, expect, it, expectTypeOf } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { enumOf } from '../schema/enum-of.js';
import { int } from '../schema/int.js';
import { string } from '../schema/string.js';
import { compileRuntimeUrlDescriptor } from './compile-runtime-url-descriptor.js';
import type { NormalizedUrlDescriptor } from './contracts.js';

describe('compileRuntimeUrlDescriptor', () => {
  it('compiles path-based runtime descriptors into normalized URL descriptors', () => {
    const descriptor = compileRuntimeUrlDescriptor({
      path: '/users/{id:int}',
      search: {
        tab: enumOf(['profile', 'settings']).default('profile'),
      },
      hash: enumOf(['activity', 'comments']).optional(),
    });

    expect(descriptor.mode).toBe('path');
    expect(descriptor.pattern).toBe('/users/{id:int}');
    expect(descriptor.path?.parsePathname('/users/42')).toEqual({ id: 42 });
    expect(descriptor.search).toBeDefined();
    expect(descriptor.hash).toEqual({
      kind: 'enum',
      presence: 'optional',
      values: ['activity', 'comments'],
    });
    expect(Object.isFrozen(descriptor)).toBe(true);

    expectTypeOf<NormalizedUrlDescriptor<'path'>>(descriptor);
  });

  it('compiles pathless runtime descriptors', () => {
    const descriptor = compileRuntimeUrlDescriptor({
      search: {
        q: string(),
      },
    });

    expect(descriptor.mode).toBe('pathless');
    expect(descriptor.pattern).toBeUndefined();
    expect(descriptor.path).toBeUndefined();
    expect(descriptor.search).toBeDefined();

    expectTypeOf<NormalizedUrlDescriptor<'pathless'>>(descriptor);
  });

  it('uses parsed standalone params for path patterns', () => {
    const descriptor = compileRuntimeUrlDescriptor({
      path: '/products/{id:range(1,100)}',
    });

    expect(descriptor.path?.parsePathname('/products/12.5')).toEqual({ id: 12.5 });
  });

  it('validates search defaults at contract creation time', () => {
    expect(() =>
      compileRuntimeUrlDescriptor({
        search: {
          page: int().default('wrong' as never),
        },
      }),
    ).toThrow(UrlKitError);
  });

  it('rejects invalid descriptors', () => {
    expect(() => compileRuntimeUrlDescriptor(null as never)).toThrow(UrlKitError);
    expect(() => compileRuntimeUrlDescriptor({ path: undefined } as never)).toThrow(UrlKitError);
    expect(() => compileRuntimeUrlDescriptor({ search: [] } as never)).toThrow(UrlKitError);
  });

  it('rejects unsupported hash schemas', () => {
    expect(() => compileRuntimeUrlDescriptor({ hash: int() as never })).toThrow(UrlKitError);
  });
});
