import { describe, expect, it } from 'vitest';
import { createSearchParams } from './create-search-params.js';

describe('createSearchParams', () => {
  it('accepts strings with a leading question mark', () => {
    expect([...createSearchParams('?q=router')]).toEqual([['q', 'router']]);
  });

  it('accepts strings without a leading question mark', () => {
    expect([...createSearchParams('q=router')]).toEqual([['q', 'router']]);
  });

  it('copies URLSearchParams input', () => {
    const input = new URLSearchParams('q=router');
    const params = createSearchParams(input);

    input.set('q', 'later');

    expect(params.get('q')).toBe('router');
  });
});
