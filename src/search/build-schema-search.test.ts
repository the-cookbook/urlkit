import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { array } from '../schema/array.js';
import { boolean } from '../schema/boolean.js';
import { date } from '../schema/date.js';
import { dateTime } from '../schema/date-time.js';
import { enumOf } from '../schema/enum-of.js';
import { int } from '../schema/int.js';
import { number } from '../schema/number.js';
import { object } from '../schema/object.js';
import { string } from '../schema/string.js';
import { buildSchemaSearch } from './build-schema-search.js';
import { parseSearch } from './parse-search.js';

describe('buildSchemaSearch', () => {
  it('serializes one fields', () => {
    expect(buildSchemaSearch({ q: 'router' }, { q: string() })).toBe('?q=router');
  });

  it('serializes many fields using repeated keys by default', () => {
    expect(
      buildSchemaSearch({ tag: ['typescript', 'url'] }, { tag: { type: 'many', value: string() } }),
    ).toBe('?tag=typescript&tag=url');
  });

  it('supports comma array format for many fields', () => {
    expect(
      buildSchemaSearch(
        { tag: ['typescript', 'url'] },
        { tag: { type: 'many', value: string() } },
        { arrayFormat: 'comma' },
      ),
    ).toBe('?tag=typescript%2Curl');
  });

  it('omits undefined optional values, null optional values, and empty arrays', () => {
    expect(
      buildSchemaSearch(
        { q: undefined, filter: null, tag: [] },
        {
          q: string().optional(),
          filter: string().optional(),
          tag: { type: 'many', value: string(), optional: true },
        },
      ),
    ).toBe('');
  });

  it('applies null/default behavior for defaulted fields', () => {
    expect(buildSchemaSearch({ page: null }, { page: int().default(1) })).toBe('?page=1');
  });

  it('serializes booleans as true and false', () => {
    expect(
      buildSchemaSearch(
        { active: true, disabled: false },
        { active: boolean(), disabled: boolean() },
      ),
    ).toBe('?active=true&disabled=false');
  });

  it('serializes dates according to their configured format', () => {
    expect(
      buildSchemaSearch(
        {
          day: new Date('2026-06-02T22:15:30.123Z'),
          instant: new Date('2026-01-01T10:30:00.000Z'),
          seconds: new Date('2024-01-01T00:00:00.000Z'),
          ms: new Date('2024-01-01T00:00:00.123Z'),
        },
        {
          day: date(),
          instant: dateTime(),
          seconds: date({ format: 'unix-seconds' }),
          ms: date({ format: 'unix-ms' }),
        },
      ),
    ).toBe(
      '?day=2026-06-02&instant=2026-01-01T10%3A30%3A00.000Z&seconds=1704067200&ms=1704067200123',
    );
  });

  it('serializes numbers and integers after validation', () => {
    expect(buildSchemaSearch({ score: 1.5, page: 2 }, { score: number(), page: int() })).toBe(
      '?score=1.5&page=2',
    );
  });

  it('validates enum values exactly', () => {
    const schema = { sort: enumOf(['newest', 'popular'] as const) };

    expect(buildSchemaSearch({ sort: 'newest' }, schema)).toBe('?sort=newest');
    expect(() => buildSchemaSearch({ sort: 'oldest' }, schema)).toThrow(UrlKitError);
  });

  it('throws on invalid required null values and missing required values', () => {
    expect(() => buildSchemaSearch({ q: null }, { q: string() })).toThrow(UrlKitError);
    expect(() => buildSchemaSearch({}, { q: string() })).toThrow(UrlKitError);
  });

  it('rejects invalid scalar values', () => {
    expect(() => buildSchemaSearch({ active: 'true' }, { active: boolean() })).toThrow(UrlKitError);
    expect(() => buildSchemaSearch({ page: 1.5 }, { page: int() })).toThrow(UrlKitError);
    expect(() =>
      buildSchemaSearch({ score: Number.POSITIVE_INFINITY }, { score: number() }),
    ).toThrow(UrlKitError);
    expect(() => buildSchemaSearch({ day: new Date(Number.NaN) }, { day: date() })).toThrow(
      UrlKitError,
    );
  });

  it('includes defaults by default', () => {
    expect(
      buildSchemaSearch(
        {},
        { page: int().default(1), sort: enumOf(['newest', 'popular'] as const).default('newest') },
      ),
    ).toBe('?page=1&sort=newest');
  });

  it('omits default values when requested', () => {
    expect(
      buildSchemaSearch(
        { page: 1, sort: 'newest', q: 'router' },
        {
          page: int().default(1),
          sort: enumOf(['newest', 'popular'] as const).default('newest'),
          q: string(),
        },
        { defaults: 'omit' },
      ),
    ).toBe('?q=router');
  });

  it('compares date defaults by timestamp when omitting defaults', () => {
    expect(
      buildSchemaSearch(
        { startsAt: new Date('2026-01-01T10:30:00.000Z') },
        { startsAt: dateTime().default(new Date('2026-01-01T10:30:00.000Z')) },
        { defaults: 'omit' },
      ),
    ).toBe('');
  });

  it('compares many defaults by ordered normalized values when omitting defaults', () => {
    expect(
      buildSchemaSearch(
        { tag: ['react', 'router'] },
        { tag: { type: 'many', value: string(), default: ['react', 'router'] } },
        { defaults: 'omit' },
      ),
    ).toBe('');
  });

  it('keeps non-default values when omitting defaults', () => {
    expect(buildSchemaSearch({ page: 2 }, { page: int().default(1) }, { defaults: 'omit' })).toBe(
      '?page=2',
    );
  });

  it('strips unknown runtime keys', () => {
    expect(buildSchemaSearch({ q: 'router', debug: true }, { q: string() })).toBe('?q=router');
  });

  it('sorts keys when requested', () => {
    expect(
      buildSchemaSearch(
        { z: 'last', a: 'first' },
        { z: string(), a: string() },
        { sortKeys: true },
      ),
    ).toBe('?a=first&z=last');
  });
  it('serializes object fields with dotted keys', () => {
    expect(
      buildSchemaSearch(
        {
          filter: {
            role: 'admin',
            active: true,
          },
        },
        {
          filter: object({
            role: string(),
            active: boolean(),
          }),
        },
      ),
    ).toBe('?filter.role=admin&filter.active=true');
  });

  it('serializes arrays inside object fields with repeated dotted keys', () => {
    expect(
      buildSchemaSearch(
        {
          filter: {
            tags: ['react', 'router'],
          },
        },
        {
          filter: object({
            tags: array(string()),
          }),
        },
      ),
    ).toBe('?filter.tags=react&filter.tags=router');
  });

  it('escapes literal object field dots before URL encoding', () => {
    expect(
      buildSchemaSearch(
        {
          filter: {
            'user.name': 'ada',
          },
        },
        {
          filter: object({
            'user.name': string(),
          }),
        },
      ),
    ).toBe('?filter.user%7E1name=ada');
  });

  it('omits object defaults when requested using normalized deep equality', () => {
    expect(
      buildSchemaSearch(
        {
          filter: {
            role: 'admin',
            tags: ['react', 'router'],
          },
        },
        {
          filter: object({
            role: string(),
            tags: array(string()),
          }).default({ role: 'admin', tags: ['react', 'router'] }),
        },
        { defaults: 'omit' },
      ),
    ).toBe('');
  });

  it('escapes literal object field tildes before URL encoding', () => {
    expect(
      buildSchemaSearch(
        {
          filter: {
            'path~id': '42',
          },
        },
        {
          filter: object({
            'path~id': string(),
          }),
        },
      ),
    ).toBe('?filter.path%7E0id=42');
  });

  it('escapes nested object key segments independently before URL encoding', () => {
    expect(
      buildSchemaSearch(
        {
          filter: {
            'user.name': {
              'path~id': '42',
            },
          },
        },
        {
          filter: object({
            'user.name': object({
              'path~id': string(),
            }),
          }),
        },
      ),
    ).toBe('?filter.user%7E1name.path%7E0id=42');
  });

  it('round-trips escaped object keys through URL encoding and schema parsing', () => {
    const schema = {
      filter: object({
        'user.name': object({
          'path~id': string(),
          'tag.group': array(string()),
        }),
      }),
    };
    const search = buildSchemaSearch(
      {
        filter: {
          'user.name': {
            'path~id': '42',
            'tag.group': ['react', 'router'],
          },
        },
      },
      schema,
    );

    expect(search).toBe(
      '?filter.user%7E1name.path%7E0id=42&filter.user%7E1name.tag%7E1group=react&filter.user%7E1name.tag%7E1group=router',
    );
    expect(parseSearch(search, { schema }).search).toEqual({
      filter: {
        'user.name': {
          'path~id': '42',
          'tag.group': ['react', 'router'],
        },
      },
    });
  });
});
