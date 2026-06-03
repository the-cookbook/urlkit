import { describe, expect, it } from 'vitest';
import { parseRawSearch } from './parse-raw-search.js';

describe('parseRawSearch', () => {
  it('parses raw flat search params', () => {
    expect(parseRawSearch('?q=router&tag=react&tag=url')).toEqual({
      q: 'router',
      tag: ['react', 'url'],
    });
  });
});
