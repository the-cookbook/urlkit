import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { normalizeSearchFieldType } from './normalize-search-field-type.js';

describe('normalizeSearchFieldType', () => {
  it('defaults absent field types to one', () => {
    expect(normalizeSearchFieldType(undefined)).toBe('one');
  });

  it('accepts one and many', () => {
    expect(normalizeSearchFieldType('one')).toBe('one');
    expect(normalizeSearchFieldType('many')).toBe('many');
  });

  it('rejects invalid field types', () => {
    expect(() => normalizeSearchFieldType('some')).toThrow(UrlKitError);
  });
});
