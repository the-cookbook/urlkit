import { describe, expect, it, expectTypeOf } from 'vitest';
import type {
  DefaultedRuntimeSchemaDescriptor,
  EmptyRuntimeSchemaOptions,
  InferRuntimeSchemaValue,
  OptionalRuntimeSchemaDescriptor,
  RequiredRuntimeSchemaDescriptor,
  RuntimeSchemaBuilder,
} from './contracts.js';
import { compileRuntimeSchema } from './compile-runtime-schema.js';
import { createRuntimeSchemaBuilder } from './create-schema-builder.js';

describe('runtime schema contracts', () => {
  it('infers builder values and descriptor shapes', () => {
    const required = createRuntimeSchemaBuilder<string, 'test'>({ type: 'test' });
    const optional = required.optional();
    const defaulted = required.default('fallback');

    expectTypeOf<RuntimeSchemaBuilder<string>>(required);
    expectTypeOf<string | undefined>(undefined as InferRuntimeSchemaValue<typeof optional>);
    expectTypeOf<string>(undefined as unknown as InferRuntimeSchemaValue<typeof defaulted>);
    expectTypeOf<RequiredRuntimeSchemaDescriptor<'test'>>(compileRuntimeSchema(required));
    expectTypeOf<OptionalRuntimeSchemaDescriptor<'test'>>(compileRuntimeSchema(optional));
    expectTypeOf<DefaultedRuntimeSchemaDescriptor<'test', EmptyRuntimeSchemaOptions, string>>(
      undefined as never,
    );

    expect(compileRuntimeSchema(required).presence).toBe('required');
  });
});
