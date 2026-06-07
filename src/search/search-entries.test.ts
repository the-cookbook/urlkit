import { describe, expect, it, expectTypeOf } from 'vitest';
import type { SearchEntry } from './search-entries.js';

describe('SearchEntry', () => {
  it('models a deterministic serialized search entry', () => {
    const entry: SearchEntry = { key: 'q', value: 'router' };

    expect(entry).toEqual({ key: 'q', value: 'router' });
    expectTypeOf<Readonly<{ key: string; value: string }>>(entry);
  });
});
