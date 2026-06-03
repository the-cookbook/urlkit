import { describe, expect, it } from 'vitest';
import { compileRuntimeSchemaValue } from './compile-runtime-schema-value.js';
import { createRuntimeSchemaBuilder } from './create-schema-builder.js';
import { serializeCompiledRuntimeSchemaValue } from './serialize-compiled-runtime-schema-value.js';

function trackedSchema() {
  let validations = 0;
  const schema = createRuntimeSchemaBuilder<string, 'tracked'>({
    kind: 'tracked',
    codec: {
      parse: (input) => input,
      normalize: (input) => String(input).toUpperCase(),
      serialize: (input) => `value:${input}`,
    },
    validateDescriptor() {
      validations += 1;
    },
  });

  return { schema, getValidations: () => validations };
}

describe('serializeCompiledRuntimeSchemaValue', () => {
  it('uses a precompiled schema without rerunning descriptor validation', () => {
    const { schema, getValidations } = trackedSchema();
    const compiled = compileRuntimeSchemaValue(schema);

    expect(serializeCompiledRuntimeSchemaValue(compiled, 'a')).toBe('value:A');
    expect(serializeCompiledRuntimeSchemaValue(compiled, 'b')).toBe('value:B');
    expect(getValidations()).toBe(1);
  });

  it('preserves optional absence behavior', () => {
    const compiled = compileRuntimeSchemaValue(trackedSchema().schema.optional());

    expect(serializeCompiledRuntimeSchemaValue(compiled, null)).toBeUndefined();
  });
});
