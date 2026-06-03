import { describe, expect, it } from 'vitest';
import { copyRawSearchParams } from './copy-raw-search-params.js';

describe('copyRawSearchParams', () => {
  it('copies and freezes raw search params', () => {
    const copied = copyRawSearchParams({ tag: ['react', 'router'], q: 'url' });

    expect(copied).toEqual({ tag: ['react', 'router'], q: 'url' });
    expect(Object.isFrozen(copied)).toBe(true);
    expect(Object.isFrozen(copied.tag)).toBe(true);
  });
});
