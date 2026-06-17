import { describe, expect, expectTypeOf, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { compileRuntimeSchema } from './compile-runtime-schema.js';
import type { InferRuntimeSchemaValue } from './contracts.js';
import { enumOf } from './enum-of.js';
import { normalizeRuntimeSchemaValue } from './normalize-runtime-schema-value.js';
import { parseRuntimeSchemaValue } from './parse-runtime-schema-value.js';
import { serializeRuntimeSchemaValue } from './serialize-runtime-schema-value.js';

describe('enumOf', () => {
  it('compiles to a normalized descriptor', () => {
    expect(compileRuntimeSchema(enumOf(['newest', 'popular'] as const))).toEqual({
      type: 'enum',
      presence: 'required',
      options: {
        values: ['newest', 'popular'],
      },
    });

    expect(compileRuntimeSchema(enumOf(['newest', 'popular'] as const).optional())).toEqual({
      type: 'enum',
      presence: 'optional',
      options: {
        values: ['newest', 'popular'],
      },
    });

    expect(compileRuntimeSchema(enumOf(['newest', 'popular'] as const).default('newest'))).toEqual({
      type: 'enum',
      presence: 'defaulted',
      options: {
        values: ['newest', 'popular'],
      },
      defaultValue: 'newest',
    });
  });

  it('infers literal unions from readonly values', () => {
    const sort = enumOf(['newest', 'popular'] as const);
    const optionalSort = sort.optional();
    const requiredSort = optionalSort.required();
    const defaultedSort = optionalSort.default('newest');

    expectTypeOf<'newest' | 'popular'>(
      undefined as unknown as InferRuntimeSchemaValue<typeof sort>,
    );
    expectTypeOf<'newest' | 'popular' | undefined>(
      undefined as InferRuntimeSchemaValue<typeof optionalSort>,
    );
    expectTypeOf<'newest' | 'popular'>(
      undefined as unknown as InferRuntimeSchemaValue<typeof requiredSort>,
    );
    expectTypeOf<'newest' | 'popular'>(
      undefined as unknown as InferRuntimeSchemaValue<typeof defaultedSort>,
    );
  });

  it('parses, normalizes, and serializes exact enum values', () => {
    const sort = enumOf(['newest', 'popular'] as const);

    expect(parseRuntimeSchemaValue(sort, 'newest')).toBe('newest');
    expect(normalizeRuntimeSchemaValue(sort, 'popular')).toBe('popular');
    expect(serializeRuntimeSchemaValue(sort, 'newest')).toBe('newest');
  });

  it('rejects invalid serialized, structured, and output values', () => {
    const sort = enumOf(['newest', 'popular'] as const);

    expect(() => parseRuntimeSchemaValue(sort, 'oldest')).toThrow(UrlKitError);

    expect(() => normalizeRuntimeSchemaValue(sort, 'oldest')).toThrow(UrlKitError);

    expect(() => normalizeRuntimeSchemaValue(sort, 1)).toThrow(UrlKitError);

    expect(() => serializeRuntimeSchemaValue(sort, 'oldest')).toThrow(UrlKitError);
  });

  it('supports optional, required, and default modifiers', () => {
    const sort = enumOf(['newest', 'popular'] as const);

    expect(parseRuntimeSchemaValue(sort.optional(), null)).toBeUndefined();
    expect(normalizeRuntimeSchemaValue(sort.optional(), undefined)).toBeUndefined();
    expect(serializeRuntimeSchemaValue(sort.optional(), null)).toBeUndefined();

    expect(parseRuntimeSchemaValue(sort.default('popular'), null)).toBe('popular');
    expect(normalizeRuntimeSchemaValue(sort.default('popular'), undefined)).toBe('popular');
    expect(serializeRuntimeSchemaValue(sort.default('popular'), null)).toBe('popular');

    expect(() => parseRuntimeSchemaValue(sort.optional().required(), null)).toThrow(UrlKitError);
  });

  it('validates defaults at compile time', () => {
    const sort = enumOf(['newest', 'popular'] as const).default('oldest' as never);

    expect(() =>
      compileRuntimeSchema(sort, {
        path: ['search', 'sort'],
      }),
    ).toThrow(UrlKitError);

    try {
      compileRuntimeSchema(sort, {
        path: ['search', 'sort'],
      });

      expect.unreachable('Expected enum compilation to throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect(error).toMatchObject({
        code: 'invalid-descriptor',
        path: ['search', 'sort'],
      });
    }
  });

  it('rejects invalid enum descriptors', () => {
    expect(() => enumOf([])).toThrow(UrlKitError);
    expect(() => enumOf(['valid', 1] as never)).toThrow(UrlKitError);
  });

  it('copies enum values for descriptor immutability', () => {
    const values = ['newest', 'popular'];
    const sort = enumOf(values);

    values.push('oldest');

    expect(compileRuntimeSchema(sort).options.values).toEqual(['newest', 'popular']);
    expect(() => parseRuntimeSchemaValue(sort, 'oldest')).toThrow(UrlKitError);
  });

  it('can surface search and hash error codes', () => {
    const hash = enumOf(['comments', 'share'] as const);

    try {
      parseRuntimeSchemaValue(hash, 'overview', {
        errorCode: 'invalid-hash',
        path: ['hash'],
      });

      expect.unreachable('Expected enum parsing to throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect(error).toMatchObject({
        code: 'invalid-hash',
        path: ['hash'],
      });
    }

    try {
      parseRuntimeSchemaValue(hash, 'overview', {
        errorCode: 'invalid-search',
        path: ['search', 'tab'],
      });

      expect.unreachable('Expected enum parsing to throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect(error).toMatchObject({
        code: 'invalid-search',
        path: ['search', 'tab'],
      });
    }
  });
});
