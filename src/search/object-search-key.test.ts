import { describe, expect, it } from 'vitest';
import {
  escapeObjectSearchSegment,
  joinObjectSearchKey,
  splitObjectSearchKey,
  unescapeObjectSearchSegment,
} from './object-search-key.js';

describe('objectSearchKey', () => {
  it('escapes literal dots and tildes before URL encoding happens', () => {
    expect(escapeObjectSearchSegment('user.name')).toBe('user~1name');
    expect(escapeObjectSearchSegment('path~id')).toBe('path~0id');
    expect(escapeObjectSearchSegment('user.name~path')).toBe('user~1name~0path');
  });

  it('joins parent and child object keys with dot notation between escaped segments', () => {
    const firstLevel = joinObjectSearchKey('filter', 'user.name');
    const secondLevel = joinObjectSearchKey(firstLevel, 'path~id');

    expect(firstLevel).toBe('filter.user~1name');
    expect(secondLevel).toBe('filter.user~1name.path~0id');
  });

  it('unescapes literal dots and tildes after URL decoding', () => {
    expect(unescapeObjectSearchSegment('user~1name')).toBe('user.name');
    expect(unescapeObjectSearchSegment('path~0id')).toBe('path~id');
    expect(unescapeObjectSearchSegment('user~1name~0path')).toBe('user.name~path');
  });

  it('splits decoded object search keys into unescaped segments', () => {
    expect(splitObjectSearchKey('filter.user~1name.path~0id')).toEqual([
      'filter',
      'user.name',
      'path~id',
    ]);
  });

  it('round-trips through URLSearchParams encoding and decoding', () => {
    const encodedKey = joinObjectSearchKey(joinObjectSearchKey('filter', 'user.name'), 'path~id');
    const serialized = new URLSearchParams([[encodedKey, '42']]).toString();
    const decodedKey = [...new URLSearchParams(serialized).keys()][0];

    expect(serialized).toBe('filter.user%7E1name.path%7E0id=42');
    expect(decodedKey).toBe('filter.user~1name.path~0id');
    expect(splitObjectSearchKey(decodedKey!)).toEqual(['filter', 'user.name', 'path~id']);
  });
});
