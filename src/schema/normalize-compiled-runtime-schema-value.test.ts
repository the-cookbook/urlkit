import { describe, expect, it } from 'vitest';
import { compileRuntimeSchemaValue } from './compile-runtime-schema-value.js';
import { createRuntimeSchemaBuilder } from './create-schema-builder.js';
import { normalizeCompiledRuntimeSchemaValue } from './normalize-compiled-runtime-schema-value.js';

function trackedSchema() {
  let validations = 0;
  const schema = createRuntimeSchemaBuilder<string, 'tracked'>({
    kind: 'tracked',
    codec: {
      parse: (input) => input,
      normalize: (input) => String(input).toUpperCase(),
      serialize: (input) => input,
    },
    validateDescriptor() {
      validations += 1;
    },
  });

  return { schema, getValidations: () => validations };
}

describe('normalizeCompiledRuntimeSchemaValue', () => {
  it('uses a precompiled schema without rerunning descriptor validation', () => {
    const { schema, getValidations } = trackedSchema();
    const compiled = compileRuntimeSchemaValue(schema);

    expect(normalizeCompiledRuntimeSchemaValue(compiled, 'a')).toBe('A');
    expect(normalizeCompiledRuntimeSchemaValue(compiled, 'b')).toBe('B');
    expect(getValidations()).toBe(1);
  });

  it('preserves defaulted absence behavior', () => {
    const compiled = compileRuntimeSchemaValue(trackedSchema().schema.default('fallback'));

    expect(normalizeCompiledRuntimeSchemaValue(compiled, null)).toBe('fallback');
  });
});
