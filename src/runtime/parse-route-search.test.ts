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
