import { describe, expect, it } from 'vitest';
import { int } from '../schema/int.js';
import { string } from '../schema/string.js';
import { compileSearchSchema } from './compile-search-schema.js';
import { parsePartialCompiledSearch } from './parse-partial-compiled-search.js';
import { parseRawSearch } from './parse-raw-search.js';

describe('parsePartialCompiledSearch', () => {
  it('parses only present declared fields and preserves unknown values separately', () => {
    const compiled = compileSearchSchema({
      q: string(),
      page: int().default(1),
    });

    expect(parsePartialCompiledSearch(parseRawSearch('?q=router&debug=true'), compiled)).toEqual({
      search: { q: 'router' },
      unknownSearch: { debug: 'true' },
    });
  });

  it('does not require missing required fields during partial parsing', () => {
    const compiled = compileSearchSchema({
      q: string(),
    });

    expect(parsePartialCompiledSearch(parseRawSearch('?debug=true'), compiled)).toEqual({
      search: {},
      unknownSearch: { debug: 'true' },
    });
  });
});
