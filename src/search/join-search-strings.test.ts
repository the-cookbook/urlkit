import { describe, expect, it } from 'vitest';
import { joinSearchStrings } from './join-search-strings.js';

describe('joinSearchStrings', () => {
  it('joins non-empty search strings', () => {
    expect(joinSearchStrings('?q=router', '?page=2')).toBe('?q=router&page=2');
  });

  it('omits empty search strings', () => {
    expect(joinSearchStrings('', '?q=router', '')).toBe('?q=router');
  });

  it('returns an empty string when every part is empty', () => {
    expect(joinSearchStrings('', '')).toBe('');
  });
});
