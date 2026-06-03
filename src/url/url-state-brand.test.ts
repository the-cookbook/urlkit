import { describe, expect, it } from 'vitest';
import { isUrlState, markUrlState } from './url-state-brand.js';

describe('url state brand', () => {
  it('marks URL state objects without changing enumerable output shape', () => {
    const state = markUrlState({ pathname: '/users/1' });

    expect(isUrlState(state)).toBe(true);
    expect(isUrlState({ pathname: '/users/1' })).toBe(false);
    expect(Object.keys(state)).toEqual(['pathname']);
    expect(state).toEqual({ pathname: '/users/1' });
  });
});
