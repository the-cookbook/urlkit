import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { compileRuntimeSchemaValue } from './compile-runtime-schema-value.js';
import { createRuntimeSchemaBuilder } from './create-schema-builder.js';
import { parseCompiledRuntimeSchemaValue } from './parse-compiled-runtime-schema-value.js';

function trackedSchema() {
  let validations = 0;
  const schema = createRuntimeSchemaBuilder<string, 'tracked'>({
    type: 'tracked',
    codec: {
      parse: (input) => input.toUpperCase(),
      normalize: (input) => String(input),
      serialize: (input) => input,
    },
    validateDescriptor() {
      validations += 1;
    },
  });

  return { schema, getValidations: () => validations };
}

describe('parseCompiledRuntimeSchemaValue', () => {
  it('uses a precompiled schema without rerunning descriptor validation', () => {
    const { schema, getValidations } = trackedSchema();
    const compiled = compileRuntimeSchemaValue(schema);

    expect(getValidations()).toBe(1);
    expect(parseCompiledRuntimeSchemaValue(compiled, 'a')).toBe('A');
    expect(parseCompiledRuntimeSchemaValue(compiled, 'b')).toBe('B');
    expect(getValidations()).toBe(1);
  });

  it('keeps absence and invalid serialized value behavior', () => {
    const compiled = compileRuntimeSchemaValue(trackedSchema().schema.optional());

    expect(parseCompiledRuntimeSchemaValue(compiled, undefined)).toBeUndefined();
    expect(() => parseCompiledRuntimeSchemaValue(compiled, 1)).toThrow(
      expect.objectContaining({ code: 'invalid-search' }),
    );
  });

  it('throws invalid-descriptor when a compiled schema has no parser', () => {
    expect(() =>
      parseCompiledRuntimeSchemaValue(
        { descriptor: { type: 'missing', presence: 'required', options: {} } },
        'x',
      ),
    ).toThrow(UrlKitError);
  });
});
