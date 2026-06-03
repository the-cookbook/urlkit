import { describe, expect, it } from 'vitest';
import { boolean } from '../schema/boolean.js';
import { int } from '../schema/int.js';
import { string } from '../schema/string.js';
import { buildSearch } from './build-search.js';
import type { InferRuntimeSearch } from './contracts.js';

describe('buildSearch', () => {
  it('builds raw search without a schema', () => {
    expect(buildSearch({ q: 'router', tag: ['ts', 'url'] })).toBe('?q=router&tag=ts&tag=url');
  });

  it('builds schema-based search with validation', () => {
    expect(
      buildSearch({ page: 2, active: false }, { schema: { page: int(), active: boolean() } }),
    ).toBe('?page=2&active=false');
  });

  it('preserves TypeScript inference for schema inputs', () => {
    const schema = {
      q: string(),
      page: int().default(1),
      tag: { type: 'many', value: string(), optional: true },
    } as const;

    const input = {
      q: 'router',
      page: 2,
      tag: ['typescript'],
    } satisfies Partial<InferRuntimeSearch<typeof schema>>;

    expect(buildSearch(input, { schema })).toBe('?q=router&page=2&tag=typescript');
  });
});
