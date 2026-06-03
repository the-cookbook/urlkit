import { describe, expect, it } from 'vitest';
import { string } from '../schema/string.js';
import { isRuntimeSearchField } from './is-runtime-search-field.js';

describe('isRuntimeSearchField', () => {
  it('detects search field objects', () => {
    expect(isRuntimeSearchField({ value: string() })).toBe(true);
  });

  it('rejects runtime schemas and nullish inputs', () => {
    expect(isRuntimeSearchField(string())).toBe(false);
    expect(isRuntimeSearchField(null)).toBe(false);
  });
});
