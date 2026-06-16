import { describe, expect, it, expectTypeOf } from 'vitest';
import type { RuntimeSchemaOptions } from './contracts.js';
import { compileRuntimeSchema } from './compile-runtime-schema.js';
import { createRuntimeSchemaBuilder } from './create-schema-builder.js';

interface TestSchemaOptions extends RuntimeSchemaOptions {
  readonly label: string;
}

function createTestSchema() {
  return createRuntimeSchemaBuilder<string, 'test', TestSchemaOptions>({
    type: 'test',
    options: { label: 'field' },
  });
}

describe('createRuntimeSchemaBuilder', () => {
  it('creates required builders by default', () => {
    const schema = createTestSchema();
    const descriptor = compileRuntimeSchema(schema);

    expect(descriptor).toEqual({
      type: 'test',
      presence: 'required',
      options: { label: 'field' },
    });
    expectTypeOf<'required'>(descriptor.presence);
  });

  it('creates optional builders without mutating the original builder', () => {
    const requiredSchema = createTestSchema();
    const optionalSchema = requiredSchema.optional();

    const requiredDescriptor = compileRuntimeSchema(requiredSchema);
    const optionalDescriptor = compileRuntimeSchema(optionalSchema);

    expect(requiredDescriptor.presence).toBe('required');
    expect(optionalDescriptor.presence).toBe('optional');
    expect(requiredSchema).not.toBe(optionalSchema);
    expect(Object.isFrozen(requiredSchema)).toBe(true);
    expect(Object.isFrozen(optionalSchema)).toBe(true);
    expectTypeOf<'optional'>(optionalDescriptor.presence);
  });

  it('creates defaulted builders without mutating the source builder', () => {
    const requiredSchema = createTestSchema();
    const defaultedSchema = requiredSchema.default('profile');

    const requiredDescriptor = compileRuntimeSchema(requiredSchema);
    const defaultedDescriptor = compileRuntimeSchema(defaultedSchema);

    expect(requiredDescriptor.presence).toBe('required');
    expect(defaultedDescriptor).toEqual({
      type: 'test',
      presence: 'defaulted',
      options: { label: 'field' },
      defaultValue: 'profile',
    });
    expectTypeOf<'defaulted'>(defaultedDescriptor.presence);
    expectTypeOf<string>(defaultedDescriptor.defaultValue);
  });

  it('can return required builders from optional builders', () => {
    const schema = createTestSchema().optional().required();
    const descriptor = compileRuntimeSchema(schema);

    expect(descriptor.presence).toBe('required');
    expectTypeOf<'required'>(descriptor.presence);
  });

  it('keeps defaulted builders defaulted when optional or required is chained after default', () => {
    const optionalAfterDefault = createTestSchema().default('fallback').optional();
    const requiredAfterDefault = createTestSchema().default('fallback').required();

    const optionalDescriptor = compileRuntimeSchema(optionalAfterDefault) as {
      readonly presence: string;
      readonly defaultValue?: unknown;
    };
    const requiredDescriptor = compileRuntimeSchema(requiredAfterDefault) as {
      readonly presence: string;
      readonly defaultValue?: unknown;
    };

    expect(optionalDescriptor).toEqual({
      type: 'test',
      presence: 'defaulted',
      options: { label: 'field' },
      defaultValue: 'fallback',
    });
    expect(requiredDescriptor).toEqual({
      type: 'test',
      presence: 'defaulted',
      options: { label: 'field' },
      defaultValue: 'fallback',
    });
  });

  it('copies options into descriptors', () => {
    const options = { label: 'before' } satisfies TestSchemaOptions;
    const schema = createRuntimeSchemaBuilder<string, 'test', TestSchemaOptions>({
      type: 'test',
      options,
    });

    options.label = 'after';

    const descriptor = compileRuntimeSchema(schema);

    expect(descriptor.options).toEqual({ label: 'before' });
    expect(descriptor.options).not.toBe(options);
    expect(Object.isFrozen(descriptor.options)).toBe(true);
    expect(Object.isFrozen(descriptor)).toBe(true);
  });
});
