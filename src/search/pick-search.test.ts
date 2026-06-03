import { describe, expect, it } from 'vitest';
import { pickSearch } from './pick-search.js';

describe('pickSearch', () => {
  it('keeps selected keys', () => {
    expect(pickSearch('?q=router&page=2&debug=true', ['q', 'page'])).toBe('?q=router&page=2');
  });

  it('preserves repeated values for selected keys', () => {
    expect(pickSearch('?tag=react&tag=router&page=2', ['tag'])).toBe('?tag=react&tag=router');
  });

  it('accepts URLSearchParams input', () => {
    const params = new URLSearchParams('q=router&debug=true');

    expect(pickSearch(params, ['debug'])).toBe('?debug=true');
  });

  it('returns an empty string when no keys are selected', () => {
    expect(pickSearch('?q=router', [])).toBe('');
  });
});
