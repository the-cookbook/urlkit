import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { createRuntimeSchemaBuilder } from './create-schema-builder.js';
import { serializeRuntimeSchemaValue } from './serialize-runtime-schema-value.js';
import { string } from './string.js';

describe('serializeRuntimeSchemaValue', () => {
  it('serializes structured values through schema codecs', () => {
    expect(serializeRuntimeSchemaValue(string(), 'value')).toBe('value');
  });

  it('omits optional absent values and serializes defaulted absent values', () => {
    expect(serializeRuntimeSchemaValue(string().optional(), undefined)).toBeUndefined();
    expect(serializeRuntimeSchemaValue(string().optional(), null)).toBeUndefined();
    expect(serializeRuntimeSchemaValue(string().default('fallback'), undefined)).toBe('fallback');
    expect(serializeRuntimeSchemaValue(string().default('fallback'), null)).toBe('fallback');
  });

  it('rejects invalid structured values', () => {
    try {
      serializeRuntimeSchemaValue(string(), 1, { path: ['search', 'q'] });
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect((error as UrlKitError).code).toBe('invalid-search');
      expect((error as UrlKitError).path).toEqual(['search', 'q']);
    }
  });

  it('rejects schemas without serialize codecs', () => {
    const schema = createRuntimeSchemaBuilder<string, 'test'>({ type: 'test' });

    expect(() => serializeRuntimeSchemaValue(schema, 'value')).toThrow(UrlKitError);
  });
});
