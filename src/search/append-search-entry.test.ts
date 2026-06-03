import { describe, expect, it } from 'vitest';
import { appendSearchEntry } from './append-search-entry.js';
import type { SearchEntry } from './search-entries.js';

describe('appendSearchEntry', () => {
  it('appends one values', () => {
    const entries: SearchEntry[] = [];

    appendSearchEntry(entries, 'q', 'router');

    expect(entries).toEqual([{ key: 'q', value: 'router' }]);
  });

  it('appends arrays as repeated values by default', () => {
    const entries: SearchEntry[] = [];

    appendSearchEntry(entries, 'tag', ['ts', 'url']);

    expect(entries).toEqual([
      { key: 'tag', value: 'ts' },
      { key: 'tag', value: 'url' },
    ]);
  });

  it('appends arrays as comma values when requested', () => {
    const entries: SearchEntry[] = [];

    appendSearchEntry(entries, 'tag', ['ts', 'url'], { arrayFormat: 'comma' });

    expect(entries).toEqual([{ key: 'tag', value: 'ts,url' }]);
  });

  it('omits undefined and empty arrays', () => {
    const entries: SearchEntry[] = [];

    appendSearchEntry(entries, 'q', undefined);
    appendSearchEntry(entries, 'tag', []);

    expect(entries).toEqual([]);
  });
});
