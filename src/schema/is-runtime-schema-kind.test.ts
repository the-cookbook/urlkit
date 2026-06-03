import { describe, expect, it } from 'vitest';
import { string } from './string.js';
import { isRuntimeSchemaKind } from './is-runtime-schema-kind.js';

describe('isRuntimeSchemaKind', () => {
  it('checks a runtime schema kind', () => {
    expect(isRuntimeSchemaKind(string(), 'string')).toBe(true);
    expect(isRuntimeSchemaKind(string(), 'number')).toBe(false);
  });
});
