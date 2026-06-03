import { describe, expect, it } from 'vitest';
import { array } from '../schema/array.js';
import { int } from '../schema/int.js';
import { string } from '../schema/string.js';
import { compileSearchSchema } from './compile-search-schema.js';
import { parseCompiledSearch } from './parse-compiled-search.js';

describe('parseCompiledSearch', () => {
  it('parses compiled search schemas and freezes outputs', () => {
    const compiled = compileSearchSchema({ q: string(), page: int().default(1) });
    const parsed = parseCompiledSearch({ q: 'router' }, compiled);

    expect(parsed).toEqual({ search: { q: 'router', page: 1 } });
    expect(Object.isFrozen(parsed)).toBe(true);
    expect(Object.isFrozen(parsed.search)).toBe(true);
  });

  it('strips unknown search params by default', () => {
    const compiled = compileSearchSchema({ q: string() });

    expect(parseCompiledSearch({ q: 'router', debug: 'true' }, compiled)).toEqual({
      search: { q: 'router' },
    });
  });

  it('preserves unknown search params outside typed search', () => {
    const compiled = compileSearchSchema({ q: string() });
    const parsed = parseCompiledSearch(
      { q: 'router', debug: 'true', tag: ['react', 'router'] },
      compiled,
      'preserve',
    );

    expect(parsed).toEqual({
      search: { q: 'router' },
      unknownSearch: { debug: 'true', tag: ['react', 'router'] },
    });
    expect(Object.isFrozen(parsed.unknownSearch)).toBe(true);
    expect(Object.isFrozen(parsed.unknownSearch?.tag)).toBe(true);
  });

  it('parses compiled array fields with comma array format', () => {
    const compiled = compileSearchSchema({ tag: array(string()) });

    expect(
      parseCompiledSearch({ tag: 'react,router' }, compiled, 'strip', { arrayFormat: 'comma' }),
    ).toEqual({
      search: { tag: ['react', 'router'] },
    });
  });

  it('throws invalid-search for unknown search params in error mode', () => {
    const compiled = compileSearchSchema({ q: string() });

    expect(() => parseCompiledSearch({ q: 'router', debug: 'true' }, compiled, 'error')).toThrow(
      expect.objectContaining({ code: 'invalid-search', path: ['debug'] }),
    );
  });
});
