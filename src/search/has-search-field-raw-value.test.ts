import { describe, expect, it } from 'vitest';
import { object } from '../schema/object.js';
import { string } from '../schema/string.js';
import { compileSearchSchema } from './compile-search-schema.js';
import { hasSearchFieldRawValue } from './has-search-field-raw-value.js';

describe('hasSearchFieldRawValue', () => {
  it('detects scalar values', () => {
    const [field] = compileSearchSchema({ q: string() }).fields;

    expect(hasSearchFieldRawValue(field!, { q: 'router' })).toBe(true);
    expect(hasSearchFieldRawValue(field!, {})).toBe(false);
  });

  it('detects declared object nested values only', () => {
    const [field] = compileSearchSchema({ filter: object({ role: string() }) }).fields;

    expect(hasSearchFieldRawValue(field!, { 'filter.role': 'admin' })).toBe(true);
    expect(hasSearchFieldRawValue(field!, { 'filter.debug': 'true' })).toBe(false);
  });
});
