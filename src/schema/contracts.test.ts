import { describe, expect, it } from 'vitest';
import type {
  DefaultedRuntimeSchemaDescriptor,
  EmptyRuntimeSchemaOptions,
  InferRuntimeSchemaDescriptor,
  InferRuntimeSchemaValue,
  OptionalRuntimeSchemaDescriptor,
  RequiredRuntimeSchemaDescriptor,
  RuntimeSchemaBuilder,
} from './contracts.js';
import { compileRuntimeSchema } from './compile-runtime-schema.js';
import { createRuntimeSchemaBuilder } from './create-schema-builder.js';

function expectType<Value>(_value: Value): void {}

describe('runtime schema contracts', () => {
  it('infers builder values and descriptor shapes', () => {
    const required = createRuntimeSchemaBuilder<string, 'test'>({ kind: 'test' });
    const optional = required.optional();
    const defaulted = required.default('fallback');

    expectType<RuntimeSchemaBuilder<string>>(required);
    expectType<string | undefined>(undefined as InferRuntimeSchemaValue<typeof optional>);
    expectType<string>(undefined as unknown as InferRuntimeSchemaValue<typeof defaulted>);
    expectType<RequiredRuntimeSchemaDescriptor<'test'>>(compileRuntimeSchema(required));
    expectType<OptionalRuntimeSchemaDescriptor<'test'>>(compileRuntimeSchema(optional));
    expectType<DefaultedRuntimeSchemaDescriptor<'test', EmptyRuntimeSchemaOptions, string>>(
      undefined as never,
    );

    expect(compileRuntimeSchema(required).presence).toBe('required');
  });
});
