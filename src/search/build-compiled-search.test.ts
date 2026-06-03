import { describe, expect, it } from 'vitest';
import { date } from '../schema/date.js';
import { enumOf } from '../schema/enum-of.js';
import { int } from '../schema/int.js';
import { object } from '../schema/object.js';
import { string } from '../schema/string.js';
import { array } from '../schema/array.js';
import { boolean } from '../schema/boolean.js';
import { buildCompiledSearch } from './build-compiled-search.js';
import { compileSearchSchema } from './compile-search-schema.js';

describe('buildCompiledSearch', () => {
  it('serializes compiled fields without recompiling descriptors per call', () => {
    const compiled = compileSearchSchema({
      q: string(),
      page: int().default(1),
      sort: enumOf(['newest', 'popular'] as const).default('newest'),
    });

    expect(buildCompiledSearch({ q: 'router', page: 2, sort: 'popular' }, compiled)).toBe(
      '?q=router&page=2&sort=popular',
    );
    expect(
      buildCompiledSearch({ q: 'router', page: 1, sort: 'newest' }, compiled, { defaults: 'omit' }),
    ).toBe('?q=router');
  });

  it('serializes arrays, booleans, dates, and object search values', () => {
    const compiled = compileSearchSchema({
      tag: { type: 'many', value: string() },
      active: boolean(),
      day: date(),
      filter: object({ role: string(), ids: array(int()).default([]) }),
    });

    expect(
      buildCompiledSearch(
        {
          tag: ['react', 'router'],
          active: true,
          day: new Date(Date.UTC(2026, 5, 2)),
          filter: { role: 'admin', ids: [1, 2] },
        },
        compiled,
      ),
    ).toBe(
      '?tag=react&tag=router&active=true&day=2026-06-02&filter.role=admin&filter.ids=1&filter.ids=2',
    );
  });

  it('omits undefined, null optional values, empty arrays, defaults, and unknown keys', () => {
    const compiled = compileSearchSchema({
      optional: string().optional(),
      tags: { type: 'many', value: string(), optional: true },
      page: int().default(1),
    });

    expect(
      buildCompiledSearch({ optional: null, tags: [], page: 1, unknown: 'debug' }, compiled, {
        defaults: 'omit',
      }),
    ).toBe('');
  });

  it('supports deterministic key sorting', () => {
    const compiled = compileSearchSchema({ b: string(), a: string() });

    expect(buildCompiledSearch({ b: '2', a: '1' }, compiled, { sortKeys: true })).toBe('?a=1&b=2');
  });
});
