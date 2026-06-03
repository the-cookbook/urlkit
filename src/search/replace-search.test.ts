import { describe, expect, it } from 'vitest';
import { boolean } from '../schema/boolean.js';
import { int } from '../schema/int.js';
import { string } from '../schema/string.js';
import { replaceSearch } from './replace-search.js';

describe('replaceSearch', () => {
  it('replaces the current raw search with the next raw search', () => {
    expect(replaceSearch('?q=old&debug=true', { q: 'router', tag: ['ts', 'url'] })).toBe(
      '?q=router&tag=ts&tag=url',
    );
  });

  it('removes previous values that are not in the next raw search', () => {
    expect(replaceSearch('?q=old&debug=true', { q: 'router' })).toBe('?q=router');
  });

  it('serializes repeated values deterministically', () => {
    expect(replaceSearch('?tag=old', { tag: ['react', 'router'] })).toBe('?tag=react&tag=router');
  });

  it('uses build options for raw replacement', () => {
    expect(replaceSearch('?z=old', { z: 'last', a: 'first' }, { sortKeys: true })).toBe(
      '?a=first&z=last',
    );
  });

  it('removes unknown runtime keys when a schema is provided', () => {
    expect(
      replaceSearch('?q=old&debug=true', { q: 'router', debug: true }, { schema: { q: string() } }),
    ).toBe('?q=router');
  });

  it('validates schema replacement values', () => {
    expect(
      replaceSearch('', { page: 2, active: false }, { schema: { page: int(), active: boolean() } }),
    ).toBe('?page=2&active=false');
  });

  it('supports default omission through build options', () => {
    expect(
      replaceSearch('', { page: 1 }, { schema: { page: int().default(1) }, defaults: 'omit' }),
    ).toBe('');
  });
});
