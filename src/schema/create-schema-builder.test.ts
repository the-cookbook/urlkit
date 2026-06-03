import { describe, expect, it } from 'vitest';
import type { RuntimeSchemaOptions } from './contracts.js';
import { compileRuntimeSchema } from './compile-runtime-schema.js';
import { createRuntimeSchemaBuilder } from './create-schema-builder.js';

function expectType<Value>(_value: Value): void {}

interface TestSchemaOptions extends RuntimeSchemaOptions {
  readonly label: string;
}

function createTestSchema() {
  return createRuntimeSchemaBuilder<string, 'test', TestSchemaOptions>({
    kind: 'test',
    options: { label: 'field' },
  });
}

describe('createRuntimeSchemaBuilder', () => {
  it('creates required builders by default', () => {
    const schema = createTestSchema();
    const descriptor = compileRuntimeSchema(schema);

    expect(descriptor).toEqual({
      kind: 'test',
      presence: 'required',
      options: { label: 'field' },
    });
    expectType<'required'>(descriptor.presence);
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
    expectType<'optional'>(optionalDescriptor.presence);
  });

  it('creates defaulted builders without mutating the source builder', () => {
    const requiredSchema = createTestSchema();
    const defaultedSchema = requiredSchema.default('profile');

    const requiredDescriptor = compileRuntimeSchema(requiredSchema);
    const defaultedDescriptor = compileRuntimeSchema(defaultedSchema);

    expect(requiredDescriptor.presence).toBe('required');
    expect(defaultedDescriptor).toEqual({
      kind: 'test',
      presence: 'defaulted',
      options: { label: 'field' },
      defaultValue: 'profile',
    });
    expectType<'defaulted'>(defaultedDescriptor.presence);
    expectType<string>(defaultedDescriptor.defaultValue);
  });

  it('can return required builders from optional builders', () => {
    const schema = createTestSchema().optional().required();
    const descriptor = compileRuntimeSchema(schema);

    expect(descriptor.presence).toBe('required');
    expectType<'required'>(descriptor.presence);
  });

  it('copies options into descriptors', () => {
    const options = { label: 'before' } satisfies TestSchemaOptions;
    const schema = createRuntimeSchemaBuilder<string, 'test', TestSchemaOptions>({
      kind: 'test',
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
