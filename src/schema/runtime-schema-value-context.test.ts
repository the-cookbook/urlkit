import { describe, expect, it } from 'vitest';
import { createRuntimeSchemaValueContext } from './runtime-schema-value-context.js';

describe('createRuntimeSchemaValueContext', () => {
  it('copies paths and defaults to invalid-search', () => {
    const path = ['search', 'q'];
    const context = createRuntimeSchemaValueContext('string', { path });

    path.push('mutated');

    expect(context).toEqual({ kind: 'string', path: ['search', 'q'], errorCode: 'invalid-search' });
  });

  it('uses custom error codes', () => {
    expect(createRuntimeSchemaValueContext('hash', { errorCode: 'invalid-hash' }).errorCode).toBe(
      'invalid-hash',
    );
  });
});
