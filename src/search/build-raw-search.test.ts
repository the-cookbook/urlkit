import { describe, expect, it } from 'vitest';
import { buildRawSearch } from './build-raw-search.js';

describe('buildRawSearch', () => {
  it('builds raw search params', () => {
    expect(buildRawSearch({ q: 'router', page: 2, active: true })).toBe(
      '?q=router&page=2&active=true',
    );
  });

  it('omits undefined, null, and empty arrays', () => {
    expect(buildRawSearch({ q: undefined, page: null, tags: [] })).toBe('');
  });

  it('serializes arrays as repeated keys by default', () => {
    expect(buildRawSearch({ tag: ['react', 'router'] })).toBe('?tag=react&tag=router');
  });

  it('supports comma array format', () => {
    expect(buildRawSearch({ tag: ['react', 'router'] }, { arrayFormat: 'comma' })).toBe(
      '?tag=react%2Crouter',
    );
  });

  it('sorts keys when requested', () => {
    expect(buildRawSearch({ z: 'last', a: 'first' }, { sortKeys: true })).toBe('?a=first&z=last');
  });
});
