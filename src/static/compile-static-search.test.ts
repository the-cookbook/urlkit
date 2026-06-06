import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { buildSearch } from '../search/build-search.js';
import { parseSearch } from '../search/parse-search.js';
import { compileSearchSchema } from '../search/compile-search-schema.js';
import { compileStaticSearch } from './compile-static-search.js';
import type { InferStaticSearch } from './contracts.js';

const expectType = <Value>(_value: Value): void => undefined;

describe('compileStaticSearch', () => {
  it('supports shorthand fields and parses schema-based search', () => {
    const descriptor = {
      q: 'string',
      page: { value: 'int', default: 1 },
      score: { value: 'number', optional: true },
      active: { value: 'boolean' },
      sort: { value: { type: 'enum', values: ['newest', 'popular'] }, default: 'newest' },
    } as const;

    const schema = compileStaticSearch(descriptor);
    const result = parseSearch('?q=router&active=true&sort=popular', { schema });

    expect(result.search).toEqual({ q: 'router', page: 1, active: true, sort: 'popular' });
    expectType<{
      readonly q: string;
      readonly page: number;
      readonly score?: number;
      readonly active: boolean;
      readonly sort: 'newest' | 'popular';
    }>({} as InferStaticSearch<typeof descriptor>);
  });

  it('supports one and many fields', () => {
    const schema = compileStaticSearch({
      tag: { type: 'many', value: 'string', default: ['react'] },
      q: { type: 'one' },
    });

    expect(parseSearch('?q=router&tag=ts&tag=url', { schema }).search).toEqual({
      q: 'router',
      tag: ['ts', 'url'],
    });
    expect(buildSearch({ q: 'router', tag: ['ts', 'url'] }, { schema })).toBe(
      '?tag=ts&tag=url&q=router',
    );
  });

  it('supports all static date shorthand formats', () => {
    const schema = compileStaticSearch({
      d: { value: 'date', default: '2026-06-02' },
      dt: { value: 'date-time', default: '2026-01-01T10:30:00.000Z' },
      seconds: { value: 'unix-seconds', default: 1_704_067_200 },
      ms: { value: 'unix-ms', default: 1_704_067_200_000 },
    });

    expect(parseSearch('', { schema }).search).toEqual({
      d: new Date('2026-06-02T00:00:00.000Z'),
      dt: new Date('2026-01-01T10:30:00.000Z'),
      seconds: new Date('2024-01-01T00:00:00.000Z'),
      ms: new Date('2024-01-01T00:00:00.000Z'),
    });
  });

  it('rejects nested date and date-time value descriptors', () => {
    expect(() =>
      compileStaticSearch({
        created: { value: { type: 'date', format: 'dd-MM-yyyy' }, optional: true },
      } as never),
    ).toThrow('Static date and date-time search fields must use the direct');

    expect(() =>
      compileStaticSearch({
        startsAt: { value: { type: 'date-time', format: 'dd-MM-yyyy HH:mm:ss' }, optional: true },
      } as never),
    ).toThrow('Static date and date-time search fields must use the direct');
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
    expectType<{ readonly from: Date; readonly startsAt?: Date }>(
      {} as InferStaticSearch<typeof descriptor>,
    );
  });

  it('validates defaults at compile time', () => {
    expect(() => compileStaticSearch({ q: { value: 'string', default: 1 } })).toThrow(UrlKitError);
    expect(() => compileStaticSearch({ n: { value: 'number', default: Number.NaN } })).toThrow(
      UrlKitError,
    );
    expect(() => compileStaticSearch({ i: { value: 'int', default: 1.1 } })).toThrow(UrlKitError);
    expect(() => compileStaticSearch({ b: { value: 'boolean', default: 'true' } })).toThrow(
      UrlKitError,
    );
    expect(() => compileStaticSearch({ d: { value: 'date', default: new Date() } })).toThrow(
      UrlKitError,
    );
    expect(() => compileStaticSearch({ d: { value: 'date', default: '2026-13-01' } })).toThrow(
      UrlKitError,
    );
    expect(() =>
      compileStaticSearch({ dt: { value: 'date-time', default: '2026-01-01T10:30:00+02:00' } }),
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
      compileStaticSearch({ seconds: { value: 'unix-seconds', default: '1704067200' } }),
    ).toThrow(UrlKitError);
    expect(() => compileStaticSearch({ tags: { type: 'many', default: 'react' } })).toThrow(
      UrlKitError,
    );
    expect(() =>
      compileStaticSearch({
        sort: { value: { type: 'enum', values: ['newest'] }, default: 'popular' },
      }),
    ).toThrow(UrlKitError);
  });

  it('throws invalid-descriptor for invalid descriptors', () => {
    try {
      compileStaticSearch({ q: { value: 'int', default: '1' } });
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
      filters: { type: 'many' },
      page: { value: 'int', default: 1 },
    });

    const compiled = compileSearchSchema(schema);

    expect(compiled.fields).toMatchObject([
      { key: 'filters', type: 'many', presence: 'required' },
      { key: 'page', type: 'one', presence: 'defaulted', defaultValue: 1 },
    ]);
  });
});
