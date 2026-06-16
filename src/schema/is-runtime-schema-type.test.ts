import { describe, expect, it } from 'vitest';
import { string } from './string.js';
import { isRuntimeSchemaType } from './is-runtime-schema-type.js';

describe('isRuntimeSchemaType', () => {
  it('checks a runtime schema type', () => {
    expect(isRuntimeSchemaType(string(), 'string')).toBe(true);
    expect(isRuntimeSchemaType(string(), 'number')).toBe(false);
  });
});
