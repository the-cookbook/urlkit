import { describe, expect, it } from 'vitest';
import type { SearchEntry } from './search-entries.js';

function expectType<Value>(_value: Value): void {}

describe('SearchEntry', () => {
  it('models a deterministic serialized search entry', () => {
    const entry: SearchEntry = { key: 'q', value: 'router' };

    expect(entry).toEqual({ key: 'q', value: 'router' });
    expectType<Readonly<{ key: string; value: string }>>(entry);
  });
});
