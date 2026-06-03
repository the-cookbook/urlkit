import { describe, expect, it } from 'vitest';
import { int } from '../schema/int.js';
import { string } from '../schema/string.js';
import { parsePartialSchemaSearch } from './parse-partial-schema-search.js';

describe('parsePartialSchemaSearch', () => {
  it('parses only present declared fields', () => {
    expect(parsePartialSchemaSearch({ page: '2' }, { q: string(), page: int() })).toEqual({
      search: { page: 2 },
      unknownSearch: {},
    });
  });

  it('does not apply defaults while reading current patch state', () => {
    expect(parsePartialSchemaSearch({}, { page: int().default(1) })).toEqual({
      search: {},
      unknownSearch: {},
    });
  });

  it('preserves unknown raw params separately', () => {
    expect(parsePartialSchemaSearch({ q: 'router', debug: 'true' }, { q: string() })).toEqual({
      search: { q: 'router' },
      unknownSearch: { debug: 'true' },
    });
  });
});
