import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { createRuntimeSchemaBuilder } from './create-schema-builder.js';
import { parseRuntimeSchemaValue } from './parse-runtime-schema-value.js';
import { string } from './string.js';

describe('parseRuntimeSchemaValue', () => {
  it('parses serialized values through schema codecs', () => {
    expect(parseRuntimeSchemaValue(string(), 'value')).toBe('value');
  });

  it('applies optional and default absence behavior', () => {
    expect(parseRuntimeSchemaValue(string().optional(), undefined)).toBeUndefined();
    expect(parseRuntimeSchemaValue(string().optional(), null)).toBeUndefined();
    expect(parseRuntimeSchemaValue(string().default('fallback'), undefined)).toBe('fallback');
    expect(parseRuntimeSchemaValue(string().default('fallback'), null)).toBe('fallback');
  });

  it('rejects missing and null required values', () => {
    expect(() => parseRuntimeSchemaValue(string(), undefined, { path: ['search', 'q'] })).toThrow(
      UrlKitError,
    );
    expect(() => parseRuntimeSchemaValue(string(), null, { path: ['search', 'q'] })).toThrow(
      UrlKitError,
    );
  });

  it('rejects non-string serialized values', () => {
    try {
      parseRuntimeSchemaValue(string(), 1, { path: ['search', 'q'] });
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect((error as UrlKitError).code).toBe('invalid-search');
      expect((error as UrlKitError).path).toEqual(['search', 'q']);
    }
  });

  it('rejects schemas without parse codecs', () => {
    const schema = createRuntimeSchemaBuilder<string, 'test'>({ type: 'test' });

    expect(() => parseRuntimeSchemaValue(schema, 'value')).toThrow(UrlKitError);
  });
});
