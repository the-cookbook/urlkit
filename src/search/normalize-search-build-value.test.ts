import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { int } from '../schema/int.js';
import { string } from '../schema/string.js';
import { compileSearchSchema } from './compile-search-schema.js';
import { normalizeSearchBuildValue } from './normalize-search-build-value.js';

const [requiredOne, optionalOne, defaultedOne, optionalMany, defaultedMany] = compileSearchSchema({
  page: int(),
  q: { value: string(), optional: true },
  sort: { value: string(), default: 'newest' },
  tag: { type: 'many', value: string(), optional: true },
  filters: { type: 'many', value: string(), default: ['router'] },
}).fields;

describe('normalizeSearchBuildValue', () => {
  it('normalizes one values', () => {
    expect(normalizeSearchBuildValue(requiredOne!, 2)).toBe(2);
  });

  it('omits optional one values when absent', () => {
    expect(normalizeSearchBuildValue(optionalOne!, undefined)).toBeUndefined();
    expect(normalizeSearchBuildValue(optionalOne!, null)).toBeUndefined();
  });

  it('applies defaults for defaulted one fields', () => {
    expect(normalizeSearchBuildValue(defaultedOne!, undefined)).toBe('newest');
    expect(normalizeSearchBuildValue(defaultedOne!, null)).toBe('newest');
  });

  it('rejects absent required one values', () => {
    expect(() => normalizeSearchBuildValue(requiredOne!, undefined)).toThrow(UrlKitError);
    expect(() => normalizeSearchBuildValue(requiredOne!, null)).toThrow(UrlKitError);
  });

  it('normalizes many values', () => {
    expect(normalizeSearchBuildValue(optionalMany!, ['a', 'b'])).toEqual(['a', 'b']);
  });

  it('rejects scalar values for many fields', () => {
    expect(() => normalizeSearchBuildValue(optionalMany!, 'a')).toThrow(UrlKitError);
  });

  it('applies defaults for defaulted many fields', () => {
    expect(normalizeSearchBuildValue(defaultedMany!, undefined)).toEqual(['router']);
    expect(normalizeSearchBuildValue(defaultedMany!, null)).toEqual(['router']);
  });
});
