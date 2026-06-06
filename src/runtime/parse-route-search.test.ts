import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { parseSearch } from './parse-route-search.js';

const expectType = <Value>(_value: Value): void => undefined;

const schema = {
  q: 'string',
  page: {
    value: 'int',
    default: 1,
  },
  tags: {
    type: 'many',
    optional: true,
  },
  active: {
    value: 'boolean',
    optional: true,
  },
  sort: {
    value: {
      type: 'enum',
      values: ['newest', 'popular'],
    },
    default: 'newest',
  },
  startsAt: {
    value: 'date-time',
    optional: true,
  },
} as const;

describe('router-runtime parseSearch', () => {
  it('returns flat raw search without a schema', () => {
    expect(parseSearch('?filter.role=admin&tag=one&tag=two')).toEqual({
      'filter.role': 'admin',
      tag: ['one', 'two'],
    });
  });

  it('extracts search params from serialized paths before parsing', () => {
    expect(parseSearch('/articles/1?filter.role=admin&tag=one&tag=two#comments')).toEqual({
      'filter.role': 'admin',
      tag: ['one', 'two'],
    });
  });

  it('parses static search descriptors with typed overloads', () => {
    const parsed = parseSearch(
      '?q=urlkit&page=2&tags=ts&tags=url&active=true&sort=popular&startsAt=2026-01-01T10:30:00.000Z',
      {
        schema,
      },
    );

    expect(parsed).toEqual({
      q: 'urlkit',
      page: 2,
      tags: ['ts', 'url'],
      active: true,
      sort: 'popular',
      startsAt: new Date('2026-01-01T10:30:00.000Z'),
    });

    expectType<{
      readonly q: string;
      readonly page: number;
      readonly tags?: readonly string[];
      readonly active?: boolean;
      readonly sort: 'newest' | 'popular';
      readonly startsAt?: Date;
    }>(parsed);
  });

  it('parses router-safe static date and date-time format strings', () => {
    const formattedSchema = {
      from: {
        type: 'date',
        format: 'dd-MM-yyyy',
        optional: true,
      },
      startsAt: {
        type: 'date-time',
        format: 'dd-MM-yyyy HH:mm:ss',
        optional: true,
      },
    } as const;

    const parsed = parseSearch('?from=02-06-2026&startsAt=02-06-2026+12%3A30%3A05', {
      schema: formattedSchema,
    });

    expect(parsed).toEqual({
      from: new Date('2026-06-02T00:00:00.000Z'),
      startsAt: new Date('2026-06-02T12:30:05.000Z'),
    });
    expectType<{ readonly from?: Date; readonly startsAt?: Date }>(parsed);
  });

  it('can omit invalid optional declared fields without rejecting the full search', () => {
    const formattedSchema = {
      page: { value: 'int', default: 1 },
      ref: { type: 'one', optional: true },
      tag: { type: 'many', value: 'string', optional: true },
      publishedOn: {
        type: 'date',
        format: 'dd-MM-yyyy',
        optional: true,
      },
      scheduledAt: {
        type: 'date-time',
        format: 'dd-MM-yyyy HH:mm:ss',
        optional: true,
      },
    } as const;

    expect(() =>
      parseSearch('?page=2&ref=email&tag=ts&tag=url&publishedOn=02-06-2026&scheduledAt=foo', {
        schema: formattedSchema,
      }),
    ).toThrow(UrlKitError);

    const parsed = parseSearch(
      '?page=2&ref=email&tag=ts&tag=url&publishedOn=02-06-2026&scheduledAt=foo',
      { schema: formattedSchema, invalidSearch: 'omit' },
    );

    expect(parsed).toEqual({
      page: 2,
      ref: 'email',
      tag: ['ts', 'url'],
      publishedOn: new Date('2026-06-02T00:00:00.000Z'),
    });
    expectType<
      Partial<{
        readonly page: number;
        readonly ref?: string;
        readonly tag?: readonly string[];
        readonly publishedOn?: Date;
        readonly scheduledAt?: Date;
      }>
    >(parsed);
  });

  it('keeps required invalid declared fields strict even with invalidSearch omit', () => {
    const requiredSchema = { active: 'boolean' } as const;

    expect(() =>
      parseSearch('?active=1', { schema: requiredSchema, invalidSearch: 'omit' }),
    ).toThrow(UrlKitError);
  });

  it('parses static many fields with comma array format', () => {
    expect(parseSearch('?q=urlkit&tags=ts%2Curl', { schema, arrayFormat: 'comma' })).toEqual({
      q: 'urlkit',
      page: 1,
      tags: ['ts', 'url'],
      sort: 'newest',
    });
  });

  it('applies defaults from static schemas', () => {
    expect(parseSearch('?q=urlkit', { schema })).toEqual({
      q: 'urlkit',
      page: 1,
      sort: 'newest',
    });
  });

  it('uses strict boolean parsing', () => {
    expect(() => parseSearch('?q=urlkit&active=1', { schema })).toThrow(UrlKitError);
  });

  it('strips unknown params by default and errors when requested', () => {
    expect(parseSearch('?q=urlkit&debug=true', { schema })).toEqual({
      q: 'urlkit',
      page: 1,
      sort: 'newest',
    });

    expect(() => parseSearch('?q=urlkit&debug=true', { schema, unknownSearch: 'error' })).toThrow(
      UrlKitError,
    );
  });

  it('preserves unknown behavior internally without adding unknown keys to typed search', () => {
    expect(parseSearch('?q=urlkit&debug=true', { schema, unknownSearch: 'preserve' })).toEqual({
      q: 'urlkit',
      page: 1,
      sort: 'newest',
    });
  });
});
