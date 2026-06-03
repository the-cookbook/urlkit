import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { array } from './array.js';
import { compileRuntimeSchema } from './compile-runtime-schema.js';
import type { InferRuntimeSchemaValue } from './contracts.js';
import { normalizeRuntimeSchemaValue } from './normalize-runtime-schema-value.js';
import { string } from './string.js';

function expectType<Value>(_value: Value): void {}

describe('array', () => {
  it('compiles to a normalized descriptor with an element descriptor', () => {
    expect(compileRuntimeSchema(array(string()))).toEqual({
      kind: 'array',
      presence: 'required',
      options: {
        element: { kind: 'string', presence: 'required', options: {} },
      },
    });
  });

  it('infers readonly element arrays', () => {
    const schema = array(string()).optional();

    expectType<readonly string[] | undefined>(undefined as InferRuntimeSchemaValue<typeof schema>);
  });

  it('normalizes arrays and rejects scalars', () => {
    expect(normalizeRuntimeSchemaValue(array(string()), ['react', 'router'])).toEqual([
      'react',
      'router',
    ]);
    expect(() => normalizeRuntimeSchemaValue(array(string()), 'react')).toThrow(UrlKitError);
  });

  it('preserves array element metadata across modifiers', () => {
    expect(normalizeRuntimeSchemaValue(array(string()).default(['react']), null)).toEqual([
      'react',
    ]);
    expect(normalizeRuntimeSchemaValue(array(string()).optional(), undefined)).toBeUndefined();
    expect(normalizeRuntimeSchemaValue(array(string()).required(), ['react'])).toEqual(['react']);
  });

  it('validates defaults at compile time', () => {
    expect(() => compileRuntimeSchema(array(string()).default(['react', 1] as never))).toThrow(
      expect.objectContaining({ code: 'invalid-descriptor' }),
    );
  });
});
