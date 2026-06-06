import { describe, expect, it } from 'vitest';
import { createSearchParams } from './create-search-params.js';

describe('createSearchParams', () => {
  it('accepts strings with a leading question mark', () => {
    expect([...createSearchParams('?q=router')]).toEqual([['q', 'router']]);
  });

  it('accepts strings without a leading question mark', () => {
    expect([...createSearchParams('q=router')]).toEqual([['q', 'router']]);
  });

  it('extracts search params from serialized paths and URLs', () => {
    expect([...createSearchParams('/articles/1?page=2&ref=email#comments')]).toEqual([
      ['page', '2'],
      ['ref', 'email'],
    ]);
    expect([...createSearchParams('https://example.com/articles/1?page=2&ref=email')]).toEqual([
      ['page', '2'],
      ['ref', 'email'],
    ]);
  });

  it('copies URLSearchParams input', () => {
    const input = new URLSearchParams('q=router');
    const params = createSearchParams(input);

    input.set('q', 'later');

    expect(params.get('q')).toBe('router');
  });
});
