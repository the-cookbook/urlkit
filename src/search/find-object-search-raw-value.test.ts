import { describe, expect, it } from 'vitest';
import { findObjectSearchRawValue } from './find-object-search-raw-value.js';

describe('findObjectSearchRawValue', () => {
  it('finds raw values by resolved object path', () => {
    expect(
      findObjectSearchRawValue('filter', ['path~id'], {
        'filter.path~0id': '42',
      }),
    ).toBe('42');
  });

  it('distinguishes literal dot segments from nested object paths', () => {
    const rawSearch = {
      'filter.user~1name': 'ada',
      'filter.user.name': 'grace',
    };

    expect(findObjectSearchRawValue('filter', ['user.name'], rawSearch)).toBe('ada');
    expect(findObjectSearchRawValue('filter', ['user', 'name'], rawSearch)).toBe('grace');
  });
});
