import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import {
  buildSearch,
  omitSearch,
  patchSearch,
  pickSearch,
  replaceSearch,
} from './build-route-search.js';

const expectType = <Value>(_value: Value): void => undefined;

const schema = {
  q: { type: 'string' },
  page: {
    type: 'int',
    default: 1,
  },
  tags: {
    type: 'string',
    many: true,
    optional: true,
  },
  active: {
    type: 'boolean',
    optional: true,
  },
  sort: {
    type: 'enum',
    values: ['newest', 'popular'],
    default: 'newest',
  },
  day: {
    type: 'date',
    optional: true,
  },
} as const;

describe('router-runtime search helpers', () => {
  it('builds raw search without a schema', () => {
    expect(buildSearch({ q: 'urlkit', tags: ['ts', 'url'] })).toBe('?q=urlkit&tags=ts&tags=url');
  });

  it('builds static schema search and validates values', () => {
    const value = {
      q: 'urlkit',
      page: 2,
      tags: ['ts', 'url'],
      active: false,
      sort: 'popular',
      day: new Date('2026-06-02T12:00:00.000Z'),
    } as const;

    expect(buildSearch(value, { schema })).toBe(
      '?q=urlkit&page=2&tags=ts&tags=url&active=false&sort=popular&day=2026-06-02',
    );
    expectType<
      Partial<{
        readonly q: string;
        readonly page: number;
        readonly tags?: readonly string[];
        readonly active?: boolean;
        readonly sort: 'newest' | 'popular';
        readonly day?: Date;
      }>
    >(value);
  });

  it('builds static many fields with comma array format', () => {
    expect(
      buildSearch({ q: 'urlkit', tags: ['ts', 'url'] }, { schema, arrayFormat: 'comma' }),
    ).toBe('?q=urlkit&page=1&tags=ts%2Curl&sort=newest');
  });

  it('builds router-safe static date and date-time format strings', () => {
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

    expect(
      buildSearch(
        {
          from: new Date('2026-06-02T00:00:00.000Z'),
          startsAt: new Date('2026-06-02T12:30:05.000Z'),
        },
        { schema: formattedSchema },
      ),
    ).toBe('?from=02-06-2026&startsAt=02-06-2026+12%3A30%3A05');
  });

  it('supports defaults include and omit', () => {
    expect(buildSearch({ q: 'urlkit', page: 1, sort: 'newest' }, { schema })).toBe(
      '?q=urlkit&page=1&sort=newest',
    );
    expect(
      buildSearch({ q: 'urlkit', page: 1, sort: 'newest' }, { schema, defaults: 'omit' }),
    ).toBe('?q=urlkit');
  });

  it('throws invalid-search for invalid enum values', () => {
    expect(() => buildSearch({ q: 'urlkit', sort: 'oldest' } as never, { schema })).toThrow(
      UrlKitError,
    );
  });

  it('patchSearch preserves existing unknown params by default', () => {
    expect(
      patchSearch('?q=old&debug=true&tags=a&tags=b', { q: 'new', tags: ['c'] }, { schema }),
    ).toBe('?q=new&page=1&tags=c&sort=newest&debug=true');
  });

  it('patchSearch supports removeUndefined and removeNull', () => {
    expect(
      patchSearch(
        '?q=old&debug=true',
        { q: undefined, debug: null },
        { removeUndefined: true, removeNull: true },
      ),
    ).toBe('');
  });

  it('replaceSearch removes previous and unknown params', () => {
    expect(replaceSearch('?q=old&debug=true', { q: 'new' }, { schema })).toBe(
      '?q=new&page=1&sort=newest',
    );
  });

  it('omitSearch removes selected keys and preserves repeated values', () => {
    expect(omitSearch('?q=urlkit&debug=true&tags=ts&tags=url', ['debug'])).toBe(
      '?q=urlkit&tags=ts&tags=url',
    );
  });

  it('pickSearch keeps selected keys and preserves repeated values', () => {
    expect(pickSearch('?q=urlkit&debug=true&tags=ts&tags=url', ['tags'])).toBe('?tags=ts&tags=url');
  });
});
