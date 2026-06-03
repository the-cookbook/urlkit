import { describe, expect, it } from 'vitest';
import { getObjectSearchRawKeyPath } from './object-search-raw-key-path.js';

describe('getObjectSearchRawKeyPath', () => {
  it('returns undefined for keys outside the object parent', () => {
    expect(getObjectSearchRawKeyPath('filter', 'page')).toBeUndefined();
    expect(getObjectSearchRawKeyPath('filter', 'filter')).toBeUndefined();
    expect(getObjectSearchRawKeyPath('filter', 'filter.')).toBeUndefined();
  });

  it('splits nested object paths and unescapes each segment', () => {
    expect(getObjectSearchRawKeyPath('filter', 'filter.user.name')).toEqual(['user', 'name']);
    expect(getObjectSearchRawKeyPath('filter', 'filter.user~1name.path~0id')).toEqual([
      'user.name',
      'path~id',
    ]);
  });
});
