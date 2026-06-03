import { describe, expect, it } from 'vitest';
import { omitRawSearch, pickRawSearch } from './filter-raw-search.js';

describe('filterRawSearch', () => {
  it('omits selected keys', () => {
    expect(omitRawSearch({ q: 'router', page: '2', tag: ['ts', 'url'] }, ['page'])).toEqual({
      q: 'router',
      tag: ['ts', 'url'],
    });
  });

  it('picks selected keys', () => {
    expect(pickRawSearch({ q: 'router', page: '2', tag: ['ts', 'url'] }, ['tag'])).toEqual({
      tag: ['ts', 'url'],
    });
  });

  it('copies repeated values and freezes output', () => {
    const output = pickRawSearch({ tag: ['ts', 'url'] }, ['tag']);

    expect(Object.isFrozen(output)).toBe(true);
    expect(Object.isFrozen(output.tag)).toBe(true);
  });
});
