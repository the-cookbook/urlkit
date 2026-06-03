import { describe, expect, it } from 'vitest';
import { assertNoObjectSearchCollisions } from './assert-object-search-collisions.js';

describe('assertNoObjectSearchCollisions', () => {
  it('allows correctly escaped literal keys and nested keys to remain distinguishable', () => {
    expect(() => {
      assertNoObjectSearchCollisions(
        'filter',
        {
          'filter.user~1name': 'ada',
          'filter.user.name': 'grace',
        },
        ['filter'],
      );
    }).not.toThrow();
  });

  it('throws invalid-search when different raw keys resolve to the same object path', () => {
    expect(() => {
      assertNoObjectSearchCollisions(
        'filter',
        {
          'filter.path~id': 'a',
          'filter.path~0id': 'b',
        },
        ['filter'],
      );
    }).toThrow(expect.objectContaining({ code: 'invalid-search', path: ['filter', 'path~id'] }));
  });
});
