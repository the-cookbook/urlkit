import { describe, expect, expectTypeOf, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { array } from './array.js';
import { boolean } from './boolean.js';
import { compileRuntimeSchema } from './compile-runtime-schema.js';
import type { InferRuntimeSchemaValue } from './contracts.js';
import { enumOf } from './enum-of.js';
import { int } from './int.js';
import { normalizeRuntimeSchemaValue } from './normalize-runtime-schema-value.js';
import { object } from './object.js';
import { string } from './string.js';

describe('object', () => {
  it('compiles to a normalized descriptor with field descriptors', () => {
    expect(
      compileRuntimeSchema(
        object({
          role: string().optional(),
          active: boolean().default(false),
        }),
      ),
    ).toEqual({
      type: 'object',
      presence: 'required',
      options: {
        shape: {
          role: { type: 'string', presence: 'optional', options: {} },
          active: {
            type: 'boolean',
            presence: 'defaulted',
            options: {},
            defaultValue: false,
          },
        },
      },
    });
  });

  it('infers required, optional, defaulted, enum, and array fields', () => {
    const schema = object({
      role: string(),
      active: boolean().optional(),
      page: int().default(1),
      sort: enumOf(['newest', 'popular'] as const),
      tags: array(string()).optional(),
    });

    type Value = InferRuntimeSchemaValue<typeof schema>;

    expectTypeOf<{
      readonly role: string;
      readonly active?: boolean;
      readonly page: number;
      readonly sort: 'newest' | 'popular';
      readonly tags?: readonly string[];
    }>(undefined as unknown as Value);
  });

  it('normalizes object fields and strips unknown structured keys', () => {
    const value = normalizeRuntimeSchemaValue(
      object({
        role: string(),
        active: boolean().optional(),
      }),
      {
        role: 'admin',
        extra: 'ignored',
      },
    );

    expect(value).toEqual({ role: 'admin' });
    expect(Object.isFrozen(value)).toBe(true);
  });

  it('normalizes arrays inside object fields', () => {
    expect(
      normalizeRuntimeSchemaValue(
        object({
          tags: array(string()),
        }),
        {
          tags: ['react', 'router'],
        },
      ),
    ).toEqual({ tags: ['react', 'router'] });
  });

  it('follows null and presence behavior', () => {
    expect(
      normalizeRuntimeSchemaValue(object({ role: string() }).optional(), null),
    ).toBeUndefined();

    expect(
      normalizeRuntimeSchemaValue(object({ role: string() }).default({ role: 'admin' }), null),
    ).toEqual({ role: 'admin' });

    expect(() => normalizeRuntimeSchemaValue(object({ role: string() }), null)).toThrow(
      expect.objectContaining({
        code: 'invalid-search',
      }),
    );
  });

  it('validates object defaults against the declared shape at compile time', () => {
    expect(() =>
      compileRuntimeSchema(object({ role: string() }).default({ role: 1 } as never)),
    ).toThrow(
      expect.objectContaining({
        code: 'invalid-descriptor',
        path: ['role'],
      }),
    );

    expect(() =>
      compileRuntimeSchema(
        object({
          role: string(),
          tags: array(string()),
        }).default({ role: 'admin' } as never),
      ),
    ).toThrow(
      expect.objectContaining({
        code: 'invalid-descriptor',
        path: ['tags'],
      }),
    );
  });

  it('validates nested schema defaults when the object is compiled', () => {
    expect(() =>
      compileRuntimeSchema(
        object({
          role: string().default(1 as never),
        }),
      ),
    ).toThrow(
      expect.objectContaining({
        code: 'invalid-descriptor',
        path: ['role'],
      }),
    );
  });

  it('preserves object shape metadata across modifiers', () => {
    expect(
      normalizeRuntimeSchemaValue(object({ role: string() }).default({ role: 'admin' }), null),
    ).toEqual({ role: 'admin' });

    expect(
      normalizeRuntimeSchemaValue(object({ role: string() }).optional(), undefined),
    ).toBeUndefined();

    expect(
      normalizeRuntimeSchemaValue(object({ role: string() }).required(), { role: 'admin' }),
    ).toEqual({ role: 'admin' });
  });

  it('rejects invalid object field values with the field path', () => {
    try {
      normalizeRuntimeSchemaValue(object({ role: string() }), { role: false });

      expect.unreachable('Expected object normalization to throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect(error).toMatchObject({
        code: 'invalid-search',
        path: ['role'],
      });
    }
  });
});
