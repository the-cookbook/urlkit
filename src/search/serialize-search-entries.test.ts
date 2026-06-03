import { describe, expect, it } from 'vitest';
import { serializeSearchEntries } from './serialize-search-entries.js';

describe('serializeSearchEntries', () => {
  it('serializes entries with a leading question mark', () => {
    expect(serializeSearchEntries([{ key: 'q', value: 'router' }])).toBe('?q=router');
  });

  it('returns an empty string for empty entries', () => {
    expect(serializeSearchEntries([])).toBe('');
  });

  it('sorts entries by key when requested', () => {
    expect(
      serializeSearchEntries(
        [
          { key: 'z', value: 'last' },
          { key: 'a', value: 'first' },
        ],
        { sortKeys: true },
      ),
    ).toBe('?a=first&z=last');
  });

  it('URL-encodes keys and values', () => {
    expect(serializeSearchEntries([{ key: 'filter role', value: 'admin user' }])).toBe(
      'filter+role=admin+user'.replace(/^/, '?'),
    );
  });
});
