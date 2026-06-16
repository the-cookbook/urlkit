import { describe, expect, it } from 'vitest';
import { string } from './string.js';
import { compileRuntimeSchemaValue } from './compile-runtime-schema-value.js';
import { createRuntimeSchemaBuilder } from './create-schema-builder.js';

interface ValidationCall {
  readonly type: string;
  readonly path: readonly string[];
  readonly value: unknown;
}

describe('compileRuntimeSchemaValue', () => {
  it('returns a frozen compiled descriptor and codec pair', () => {
    const compiled = compileRuntimeSchemaValue(string(), { path: ['search', 'q'] });

    expect(compiled.descriptor).toEqual({ type: 'string', presence: 'required', options: {} });
    expect(compiled.codec).toBeDefined();
    expect(Object.isFrozen(compiled)).toBe(true);
  });

  it('runs descriptor and default validation once at compile time', () => {
    const calls: ValidationCall[] = [];
    const schema = createRuntimeSchemaBuilder<string, 'tracked'>({
      type: 'tracked',
      codec: {
        parse: (input) => input,
        normalize: (input) => String(input),
        serialize: (input) => input,
      },
      validateDescriptor(context) {
        calls.push({ type: context.type, path: context.path, value: 'descriptor' });
      },
      validateDefault(value, context) {
        calls.push({ type: context.type, path: context.path, value });
      },
    }).default('fallback');

    const compiled = compileRuntimeSchemaValue(schema, { path: ['search', 'mode'] });

    expect(compiled.descriptor).toMatchObject({
      type: 'tracked',
      presence: 'defaulted',
      defaultValue: 'fallback',
    });
    expect(calls).toEqual([
      { type: 'tracked', path: ['search', 'mode'], value: 'descriptor' },
      { type: 'tracked', path: ['search', 'mode'], value: 'fallback' },
    ]);
  });
});
