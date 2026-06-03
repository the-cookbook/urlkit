import { describe, expect, it } from 'vitest';
import { createRuntimeSchemaBuilder } from './create-schema-builder.js';
import {
  runtimeSchemaSymbol,
  type RuntimeSchemaBuilderWithInternals,
} from './runtime-schema-symbol.js';

describe('runtimeSchemaSymbol', () => {
  it('stores schema internals on builders without string-key exposure', () => {
    const schema = createRuntimeSchemaBuilder<string, 'test'>({ kind: 'test' });

    const schemaWithInternals = schema as RuntimeSchemaBuilderWithInternals<
      string,
      'test',
      never,
      never
    >;

    expect(schemaWithInternals[runtimeSchemaSymbol].kind).toBe('test');
    expect(Object.keys(schema)).toEqual(['optional', 'required', 'default']);
  });
});
