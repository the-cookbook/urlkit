import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { createRuntimeSchemaBuilder } from './create-schema-builder.js';
import { getRuntimeSchemaInternals } from './get-runtime-schema-internals.js';

describe('getRuntimeSchemaInternals', () => {
  it('returns internals for runtime schema builders', () => {
    const schema = createRuntimeSchemaBuilder<string, 'test'>({ kind: 'test' });

    expect(getRuntimeSchemaInternals(schema).kind).toBe('test');
  });

  it('throws invalid-descriptor for non-builder values', () => {
    expect(() => getRuntimeSchemaInternals({} as never)).toThrow(UrlKitError);

    try {
      getRuntimeSchemaInternals({} as never);
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect((error as UrlKitError).code).toBe('invalid-descriptor');
      expect((error as UrlKitError).message).toBe('Expected a runtime schema builder.');
    }
  });
});
