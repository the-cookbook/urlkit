import { describe, expect, it } from 'vitest';
import { omitSearch } from './omit-search.js';

describe('omitSearch', () => {
  it('removes selected keys', () => {
    expect(omitSearch('?q=router&page=2&debug=true', ['debug', 'page'])).toBe('?q=router');
  });

  it('preserves repeated values for remaining keys', () => {
    expect(omitSearch('?tag=react&tag=router&page=2', ['page'])).toBe('?tag=react&tag=router');
  });

  it('accepts URLSearchParams input', () => {
    const params = new URLSearchParams('q=router&debug=true');

    expect(omitSearch(params, ['debug'])).toBe('?q=router');
  });

  it('returns an empty string when every key is omitted', () => {
    expect(omitSearch('?q=router', ['q'])).toBe('');
  });
});
