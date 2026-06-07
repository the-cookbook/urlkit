import { describe, expect, it, expectTypeOf } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { buildSearch } from '../search/build-search.js';
import { parseSearch } from '../search/parse-search.js';
import { compileSearchSchema } from '../search/compile-search-schema.js';
import { compileStaticSearch } from './compile-static-search.js';
import type { InferStaticSearch } from './contracts.js';

describe('compileStaticSearch', () => {
  it('supports object fields and parses schema-based search', () => {
    const descriptor = {
      q: { type: 'string' },
      page: { type: 'int', default: 1 },
      score: { type: 'number', optional: true },
      active: { type: 'boolean' },
      sort: { type: 'enum', values: ['newest', 'popular'], default: 'newest' },
    } as const;

    const schema = compileStaticSearch(descriptor);
    const result = parseSearch('?q=router&active=true&sort=popular', { schema });

    expect(result.search).toEqual({ q: 'router', page: 1, active: true, sort: 'popular' });
    expectTypeOf<{
      readonly q: string;
      readonly page: number;
      readonly score?: number;
      readonly active: boolean;
      readonly sort: 'newest' | 'popular';
    }>({} as InferStaticSearch<typeof descriptor>);
  });

  it('supports one and many fields', () => {
    const schema = compileStaticSearch({
      tag: { type: 'string', many: true, default: ['react'] },
      q: { type: 'string' },
    });

    expect(parseSearch('?q=router&tag=ts&tag=url', { schema }).search).toEqual({
      q: 'router',
      tag: ['ts', 'url'],
    });
    expect(buildSearch({ q: 'router', tag: ['ts', 'url'] }, { schema })).toBe(
      '?tag=ts&tag=url&q=router',
    );
  });

  it('supports all static date descriptor formats', () => {
    const schema = compileStaticSearch({
      d: { type: 'date', default: '2026-06-02' },
      dt: { type: 'date-time', default: '2026-01-01T10:30:00.000Z' },
      seconds: { type: 'date', format: 'unix-seconds', default: 1_704_067_200 },
      ms: { type: 'date', format: 'unix-ms', default: 1_704_067_200_000 },
    });

    expect(parseSearch('', { schema }).search).toEqual({
      d: new Date('2026-06-02T00:00:00.000Z'),
      dt: new Date('2026-01-01T10:30:00.000Z'),
      seconds: new Date('2024-01-01T00:00:00.000Z'),
      ms: new Date('2024-01-01T00:00:00.000Z'),
    });
  });

  it('rejects old direct and shorthand static search value forms', () => {
    expect(() => compileStaticSearch({ q: 'string' } as never)).toThrow(
      'Static search field must use the object form',
    );
    expect(() => compileStaticSearch({ q: { type: 'many' } } as never)).toThrow(
      'Static search field type is invalid.',
    );
    expect(() =>
      compileStaticSearch({ created: { value: 'date', optional: true } } as never),
    ).toThrow('Static search field must define a type.');
  });

  it('supports static date and date-time format strings', () => {
    const descriptor = {
      from: {
        type: 'date',
        format: 'dd-MM-yyyy',
        default: '02-06-2026',
      },
      startsAt: {
        type: 'date-time',
        format: 'dd-MM-yyyy HH:mm:ss',
        optional: true,
      },
    } as const;
    const schema = compileStaticSearch(descriptor);

    expect(parseSearch('', { schema }).search).toEqual({
      from: new Date('2026-06-02T00:00:00.000Z'),
    });
    expect(parseSearch('?startsAt=02-06-2026+12%3A30%3A05', { schema }).search).toEqual({
      from: new Date('2026-06-02T00:00:00.000Z'),
      startsAt: new Date('2026-06-02T12:30:05.000Z'),
    });
    expect(
      buildSearch(
        {
          from: new Date('2026-06-03T00:00:00.000Z'),
          startsAt: new Date('2026-06-03T12:30:05.000Z'),
        },
        { schema },
      ),
    ).toBe('?from=03-06-2026&startsAt=03-06-2026+12%3A30%3A05');
    expectTypeOf<{ readonly from: Date; readonly startsAt?: Date }>(
      {} as InferStaticSearch<typeof descriptor>,
    );
  });

  it('validates defaults at compile time', () => {
    expect(() => compileStaticSearch({ q: { type: 'string', default: 1 } })).toThrow(UrlKitError);
    expect(() => compileStaticSearch({ n: { type: 'number', default: Number.NaN } })).toThrow(
      UrlKitError,
    );
    expect(() => compileStaticSearch({ i: { type: 'int', default: 1.1 } })).toThrow(UrlKitError);
    expect(() => compileStaticSearch({ b: { type: 'boolean', default: 'true' } })).toThrow(
      UrlKitError,
    );
    expect(() => compileStaticSearch({ d: { type: 'date', default: new Date() } })).toThrow(
      UrlKitError,
    );
    expect(() => compileStaticSearch({ d: { type: 'date', default: '2026-13-01' } })).toThrow(
      UrlKitError,
    );
    expect(() =>
      compileStaticSearch({
        dt: { type: 'date-time', default: '2026-01-01T10:30:00+02:00' },
      }),
    ).toThrow(UrlKitError);
    expect(() =>
      compileStaticSearch({
        customDate: { type: 'date', format: 'dd-MM-yyyy', default: '2026-06-02' },
      }),
    ).toThrow(UrlKitError);
    expect(() =>
      compileStaticSearch({
        customDateTime: {
          type: 'date-time',
          format: 'dd-MM-yyyy HH:mm:ss',
          default: '02-06-2026',
        },
      }),
    ).toThrow(UrlKitError);
    expect(() =>
      compileStaticSearch({
        seconds: { type: 'date', format: 'unix-seconds', default: '1704067200' },
      }),
    ).toThrow(UrlKitError);
    expect(() =>
      compileStaticSearch({ tags: { type: 'string', many: true, default: 'react' } } as never),
    ).toThrow(UrlKitError);
    expect(() =>
      compileStaticSearch({
        sort: { type: 'enum', values: ['newest'], default: 'popular' },
      }),
    ).toThrow(UrlKitError);
  });

  it('throws invalid-descriptor for invalid descriptors', () => {
    try {
      compileStaticSearch({ q: { type: 'int', default: '1' } });
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect((error as UrlKitError).code).toBe('invalid-descriptor');
      expect((error as UrlKitError).path).toEqual(['search', 'q']);
      return;
    }

    throw new Error('Expected compileStaticSearch to throw.');
  });

  it('returns a schema that compiles to deterministic field descriptors', () => {
    const schema = compileStaticSearch({
      filters: { type: 'string', many: true },
      page: { type: 'int', default: 1 },
    });

    const compiled = compileSearchSchema(schema);

    expect(compiled.fields).toMatchObject([
      { key: 'filters', type: 'many', presence: 'required' },
      { key: 'page', presence: 'defaulted', defaultValue: 1 },
    ]);
  });

  it('rejects runtime date codecs in static date and date-time search formats', () => {
    const codec = {
      parse: (value: string) => new Date(value),
      serialize: (value: Date) => value.toISOString(),
    };

    expect(() =>
      compileStaticSearch({
        from: {
          type: 'date',
          format: codec,
        },
      } as never),
    ).toThrow('Static date search format must be a string.');

    expect(() =>
      compileStaticSearch({
        from: {
          type: 'date-time',
          format: codec,
        },
      } as never),
    ).toThrow('Static date-time search format must be a string.');

    try {
      compileStaticSearch({
        from: {
          type: 'date',
          format: codec,
        },
      } as never);
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect((error as UrlKitError).code).toBe('invalid-descriptor');
      expect((error as UrlKitError).path).toEqual(['search', 'from', 'format']);
      return;
    }

    throw new Error('Expected static date codec format to be rejected.');
  });
});
