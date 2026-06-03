import { describe, expect, it } from 'vitest';
import { string } from './string.js';
import { compileRuntimeSchemaValue } from './compile-runtime-schema-value.js';
import { createRuntimeSchemaBuilder } from './create-schema-builder.js';

interface ValidationCall {
  readonly kind: string;
  readonly path: readonly string[];
  readonly value: unknown;
}

describe('compileRuntimeSchemaValue', () => {
  it('returns a frozen compiled descriptor and codec pair', () => {
    const compiled = compileRuntimeSchemaValue(string(), { path: ['search', 'q'] });

    expect(compiled.descriptor).toEqual({ kind: 'string', presence: 'required', options: {} });
    expect(compiled.codec).toBeDefined();
    expect(Object.isFrozen(compiled)).toBe(true);
  });

  it('runs descriptor and default validation once at compile time', () => {
    const calls: ValidationCall[] = [];
    const schema = createRuntimeSchemaBuilder<string, 'tracked'>({
      kind: 'tracked',
      codec: {
        parse: (input) => input,
        normalize: (input) => String(input),
        serialize: (input) => input,
      },
      validateDescriptor(context) {
        calls.push({ kind: context.kind, path: context.path, value: 'descriptor' });
      },
      validateDefault(value, context) {
        calls.push({ kind: context.kind, path: context.path, value });
      },
    }).default('fallback');

    const compiled = compileRuntimeSchemaValue(schema, { path: ['search', 'mode'] });

    expect(compiled.descriptor).toMatchObject({
      kind: 'tracked',
      presence: 'defaulted',
      defaultValue: 'fallback',
    });
    expect(calls).toEqual([
      { kind: 'tracked', path: ['search', 'mode'], value: 'descriptor' },
      { kind: 'tracked', path: ['search', 'mode'], value: 'fallback' },
    ]);
  });
});
