import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { compileRuntimeSchema } from './compile-runtime-schema.js';
import { createRuntimeSchemaBuilder } from './create-schema-builder.js';

interface ValidationCall {
  readonly value: unknown;
  readonly kind: string;
  readonly path: readonly string[];
}

describe('compileRuntimeSchema', () => {
  it('runs default validation hooks when compiling defaulted schemas', () => {
    const calls: ValidationCall[] = [];
    const schema = createRuntimeSchemaBuilder<string, 'test'>({
      kind: 'test',
      validateDefault(value, context) {
        calls.push({ value, kind: context.kind, path: context.path });
      },
    }).default('ok');

    const descriptor = compileRuntimeSchema(schema, { path: ['search', 'tab'] });

    expect(descriptor.defaultValue).toBe('ok');
    expect(calls).toEqual([
      {
        value: 'ok',
        kind: 'test',
        path: ['search', 'tab'],
      },
    ]);
  });

  it('does not run default validation hooks for required or optional schemas', () => {
    let calls = 0;
    const schema = createRuntimeSchemaBuilder<string, 'test'>({
      kind: 'test',
      validateDefault() {
        calls += 1;
      },
    });

    compileRuntimeSchema(schema);
    compileRuntimeSchema(schema.optional());

    expect(calls).toBe(0);
  });

  it('surfaces default validation errors at compile time', () => {
    const schema = createRuntimeSchemaBuilder<string, 'test'>({
      kind: 'test',
      validateDefault(value, context) {
        if (value !== 'valid') {
          throw new UrlKitError('invalid-descriptor', 'Invalid test default.', {
            path: context.path,
          });
        }
      },
    }).default('invalid');

    expect(() => compileRuntimeSchema(schema, { path: ['search', 'mode'] })).toThrow(UrlKitError);

    try {
      compileRuntimeSchema(schema, { path: ['search', 'mode'] });
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect((error as UrlKitError).code).toBe('invalid-descriptor');
      expect((error as UrlKitError).message).toBe('Invalid test default.');
      expect((error as UrlKitError).path).toEqual(['search', 'mode']);
    }
  });

  it('throws invalid-descriptor for non-builder values', () => {
    expect(() => compileRuntimeSchema({} as never)).toThrow(UrlKitError);

    try {
      compileRuntimeSchema({} as never);
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect((error as UrlKitError).code).toBe('invalid-descriptor');
      expect((error as UrlKitError).message).toBe('Expected a runtime schema builder.');
    }
  });
});
