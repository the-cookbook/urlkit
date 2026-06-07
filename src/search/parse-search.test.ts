import { describe, expect, it, expectTypeOf } from 'vitest';
import { boolean } from '../schema/boolean.js';
import { date } from '../schema/date.js';
import { dateTime } from '../schema/date-time.js';
import { enumOf } from '../schema/enum-of.js';
import { array } from '../schema/array.js';
import { int } from '../schema/int.js';
import { number } from '../schema/number.js';
import { object } from '../schema/object.js';
import { string } from '../schema/string.js';
import { parseSearch } from './parse-search.js';
import type { InferRuntimeSearch, RawSearchParams } from './contracts.js';

describe('parseSearch', () => {
  it('returns an empty object for empty raw search input', () => {
    expect(parseSearch('')).toEqual({});
    expect(parseSearch('?')).toEqual({});
    expect(parseSearch(new URLSearchParams())).toEqual({});
  });

  it('parses raw single keys as strings', () => {
    expect(parseSearch('?q=router&page=2')).toEqual({
      q: 'router',
      page: '2',
    });
  });

  it('accepts raw search strings without a leading question mark', () => {
    expect(parseSearch('q=router')).toEqual({
      q: 'router',
    });
  });

  it('parses raw repeated keys as readonly string arrays', () => {
    const parsed = parseSearch('?tag=react&tag=router&tag=url');

    expect(parsed).toEqual({
      tag: ['react', 'router', 'url'],
    });
    expect(Object.isFrozen(parsed.tag)).toBe(true);
  });

  it('preserves raw dotted keys without object hydration', () => {
    expect(parseSearch('?filter.role=admin&filter.active=true')).toEqual({
      'filter.role': 'admin',
      'filter.active': 'true',
    });
  });

  it('preserves raw escaped object-like keys without segment unescaping', () => {
    expect(parseSearch('?filter.user~1name=ada&filter.path~0id=42')).toEqual({
      'filter.user~1name': 'ada',
      'filter.path~0id': '42',
    });
  });

  it('decodes raw URL-encoded keys and values using URLSearchParams semantics', () => {
    expect(parseSearch('?filter.role=admin%20user&x%2Ey=value%2Bplus')).toEqual({
      'filter.role': 'admin user',
      'x.y': 'value+plus',
    });
  });

  it('accepts raw URLSearchParams input and copies its current values', () => {
    const input = new URLSearchParams();
    input.append('tag', 'react');
    input.append('tag', 'router');

    const parsed = parseSearch(input);
    input.append('tag', 'later');

    expect(parsed).toEqual({
      tag: ['react', 'router'],
    });
  });

  it('freezes the returned raw search object', () => {
    const parsed = parseSearch('?q=router');

    expect(Object.isFrozen(parsed)).toBe(true);
  });

  it('returns the raw search params contract without a schema', () => {
    const parsed = parseSearch('?q=router&tag=react&tag=router');

    expectTypeOf<RawSearchParams>(parsed);
    expectTypeOf<string | readonly string[]>(parsed.q!);
    expectTypeOf<string | readonly string[]>(parsed.tag!);
  });

  it('parses schema-based one fields', () => {
    const parsed = parseSearch('?q=router&page=2&ratio=1.5', {
      schema: {
        q: string(),
        page: int(),
        ratio: number(),
      },
    });

    expect(parsed).toEqual({
      search: {
        q: 'router',
        page: 2,
        ratio: 1.5,
      },
    });
  });

  it('parses schema-based many fields from repeated and single params', () => {
    const parsed = parseSearch('?tag=react&tag=router&category=docs', {
      schema: {
        tag: { type: 'many', value: string() },
        category: { type: 'many', value: string() },
      },
    });

    expect(parsed.search).toEqual({
      tag: ['react', 'router'],
      category: ['docs'],
    });
    expect(Object.isFrozen(parsed.search.tag)).toBe(true);
    expect(Object.isFrozen(parsed.search.category)).toBe(true);
  });

  it('parses schema-based many fields with comma array format', () => {
    const parsed = parseSearch('?tag=react%2Crouter&category=docs', {
      schema: {
        tag: { type: 'many', value: string() },
        category: { type: 'many', value: string() },
      },
      arrayFormat: 'comma',
    });

    expect(parsed.search).toEqual({
      tag: ['react', 'router'],
      category: ['docs'],
    });
  });

  it('keeps comma values intact for schema arrays by default', () => {
    const parsed = parseSearch('?tag=react%2Crouter', {
      schema: {
        tag: { type: 'many', value: string() },
      },
    });

    expect(parsed.search).toEqual({
      tag: ['react,router'],
    });
  });

  it('applies optional and defaulted fields', () => {
    const parsed = parseSearch('?q=router', {
      schema: {
        q: string(),
        tab: string().optional(),
        page: int().default(1),
        tag: { type: 'many', value: string(), optional: true },
        sort: { value: enumOf(['newest', 'popular'] as const), default: 'newest' },
      },
    });

    expect(parsed.search).toEqual({
      q: 'router',
      page: 1,
      sort: 'newest',
    });
    expect('tab' in parsed.search).toBe(false);
    expect('tag' in parsed.search).toBe(false);
  });

  it('applies many defaults as arrays', () => {
    const parsed = parseSearch('', {
      schema: {
        tag: { type: 'many', value: string(), default: ['react', 'router'] },
      },
    });

    expect(parsed.search).toEqual({ tag: ['react', 'router'] });
    expect(Object.isFrozen(parsed.search.tag)).toBe(true);
  });

  it('throws missing-search for missing required fields', () => {
    expect(() => parseSearch('', { schema: { q: string() } })).toThrow(
      expect.objectContaining({ code: 'missing-search', path: ['q'] }),
    );
  });

  it('throws invalid-search for repeated params on one fields', () => {
    expect(() => parseSearch('?page=1&page=2', { schema: { page: int() } })).toThrow(
      expect.objectContaining({ code: 'invalid-search', path: ['page'] }),
    );
  });

  it('uses strict boolean parsing', () => {
    expect(
      parseSearch('?active=true&archived=false', {
        schema: { active: boolean(), archived: boolean() },
      }),
    ).toEqual({
      search: {
        active: true,
        archived: false,
      },
    });

    for (const value of ['1', '0', 'yes', 'no', 'on', 'off']) {
      expect(() => parseSearch(`?active=${value}`, { schema: { active: boolean() } })).toThrow(
        expect.objectContaining({ code: 'invalid-search' }),
      );
    }
  });

  it('validates enum values exactly', () => {
    expect(
      parseSearch('?sort=newest', { schema: { sort: enumOf(['newest', 'popular'] as const) } }),
    ).toEqual({
      search: { sort: 'newest' },
    });

    expect(() =>
      parseSearch('?sort=Newest', { schema: { sort: enumOf(['newest', 'popular'] as const) } }),
    ).toThrow(expect.objectContaining({ code: 'invalid-search', path: ['sort'] }));
  });

  it('parses date, date-time, unix-seconds, and unix-ms fields', () => {
    const parsed = parseSearch(
      '?day=2026-06-02&at=2026-01-01T10%3A30%3A00.000Z&seconds=1704067200&ms=1704067200000',
      {
        schema: {
          day: date(),
          at: dateTime(),
          seconds: date({ format: 'unix-seconds' }),
          ms: date({ format: 'unix-ms' }),
        },
      },
    );

    expect(parsed.search.day).toEqual(new Date('2026-06-02T00:00:00.000Z'));
    expect(parsed.search.at).toEqual(new Date('2026-01-01T10:30:00.000Z'));
    expect(parsed.search.seconds).toEqual(new Date('2024-01-01T00:00:00.000Z'));
    expect(parsed.search.ms).toEqual(new Date('2024-01-01T00:00:00.000Z'));
  });

  it('throws invalid-search for invalid scalar values', () => {
    expect(() => parseSearch('?page=1.5', { schema: { page: int() } })).toThrow(
      expect.objectContaining({ code: 'invalid-search', path: ['page'] }),
    );
    expect(() => parseSearch('?ratio=Infinity', { schema: { ratio: number() } })).toThrow(
      expect.objectContaining({ code: 'invalid-search', path: ['ratio'] }),
    );
    expect(() => parseSearch('?day=2026-02-31', { schema: { day: date() } })).toThrow(
      expect.objectContaining({ code: 'invalid-search', path: ['day'] }),
    );
  });

  it('treats the serialized string null as an ordinary string value', () => {
    expect(parseSearch('?q=null', { schema: { q: string() } })).toEqual({
      search: { q: 'null' },
    });
  });

  it('strips unknown search params by default', () => {
    expect(parseSearch('?q=router&debug=true', { schema: { q: string() } })).toEqual({
      search: { q: 'router' },
    });
  });

  it('preserves unknown search params outside the typed search object', () => {
    const parsed = parseSearch('?q=router&debug=true&tag=react&tag=router', {
      schema: { q: string() },
      unknownSearch: 'preserve',
    });

    expect(parsed).toEqual({
      search: { q: 'router' },
      unknownSearch: {
        debug: 'true',
        tag: ['react', 'router'],
      },
    });
    expect('debug' in parsed.search).toBe(false);
    expect(Object.isFrozen(parsed.unknownSearch)).toBe(true);
    expect(Object.isFrozen(parsed.unknownSearch?.tag)).toBe(true);
  });

  it('errors on unknown search params when configured', () => {
    expect(() =>
      parseSearch('?q=router&debug=true', { schema: { q: string() }, unknownSearch: 'error' }),
    ).toThrow(expect.objectContaining({ code: 'invalid-search', path: ['debug'] }));
  });

  it('infers schema-based search result types', () => {
    const schema = {
      q: string(),
      page: int().default(1),
      tab: enumOf(['profile', 'settings'] as const).optional(),
      tag: { type: 'many', value: string(), optional: true },
    } as const;

    const parsed = parseSearch('?q=router', { schema });

    expectTypeOf<InferRuntimeSearch<typeof schema>>(parsed.search);
    expectTypeOf<string>(parsed.search.q);
    expectTypeOf<number>(parsed.search.page);
    expectTypeOf<'profile' | 'settings' | undefined>(parsed.search.tab);
    expectTypeOf<readonly string[] | undefined>(parsed.search.tag);
  });
  it('hydrates declared object fields and keeps raw parsing flat without schema', () => {
    expect(parseSearch('?filter.role=admin&filter.active=true')).toEqual({
      'filter.role': 'admin',
      'filter.active': 'true',
    });

    const parsed = parseSearch('?filter.role=admin&filter.active=true', {
      schema: {
        filter: object({
          role: string(),
          active: boolean(),
        }),
      },
    });

    expect(parsed).toEqual({
      search: {
        filter: {
          role: 'admin',
          active: true,
        },
      },
    });
  });

  it('parses arrays inside object fields from repeated dotted keys', () => {
    const parsed = parseSearch('?filter.tags=react&filter.tags=router', {
      schema: {
        filter: object({
          tags: array(string()),
        }),
      },
    });

    expect(parsed.search).toEqual({
      filter: {
        tags: ['react', 'router'],
      },
    });
    expect(Object.isFrozen(parsed.search.filter.tags)).toBe(true);
  });

  it('parses arrays inside object fields with comma array format', () => {
    const parsed = parseSearch('?filter.tags=react%2Crouter', {
      schema: {
        filter: object({
          tags: array(string()),
        }),
      },
      arrayFormat: 'comma',
    });

    expect(parsed.search).toEqual({
      filter: {
        tags: ['react', 'router'],
      },
    });
  });

  it('applies unknownSearch behavior to unknown nested object keys', () => {
    expect(
      parseSearch('?filter.role=admin&filter.debug=true', {
        schema: { filter: object({ role: string() }) },
      }),
    ).toEqual({
      search: {
        filter: {
          role: 'admin',
        },
      },
    });

    expect(
      parseSearch('?filter.role=admin&filter.debug=true', {
        schema: { filter: object({ role: string() }) },
        unknownSearch: 'preserve',
      }),
    ).toEqual({
      search: {
        filter: {
          role: 'admin',
        },
      },
      unknownSearch: {
        'filter.debug': 'true',
      },
    });

    expect(() =>
      parseSearch('?filter.role=admin&filter.debug=true', {
        schema: { filter: object({ role: string() }) },
        unknownSearch: 'error',
      }),
    ).toThrow(expect.objectContaining({ code: 'invalid-search', path: ['filter.debug'] }));
  });

  it('infers object search fields', () => {
    const schema = {
      filter: object({
        role: string(),
        active: boolean().optional(),
        tags: array(string()).optional(),
      }),
    } as const;

    const parsed = parseSearch('?filter.role=admin', { schema });

    expectTypeOf<{
      readonly filter: {
        readonly role: string;
        readonly active?: boolean;
        readonly tags?: readonly string[];
      };
    }>(parsed.search);
  });

  it('hydrates literal dots in object field names from escaped keys', () => {
    const parsed = parseSearch('?filter.user%7E1name=ada', {
      schema: {
        filter: object({
          'user.name': string(),
        }),
      },
    });

    expect(parsed.search).toEqual({
      filter: {
        'user.name': 'ada',
      },
    });
  });

  it('hydrates literal tildes in object field names from escaped keys', () => {
    const parsed = parseSearch('?filter.path%7E0id=42', {
      schema: {
        filter: object({
          'path~id': string(),
        }),
      },
    });

    expect(parsed.search).toEqual({
      filter: {
        'path~id': '42',
      },
    });
  });

  it('hydrates nested escaped object key segments after URL decoding', () => {
    const parsed = parseSearch('?filter.user%7E1name.path%7E0id=42', {
      schema: {
        filter: object({
          'user.name': object({
            'path~id': string(),
          }),
        }),
      },
    });

    expect(parsed.search).toEqual({
      filter: {
        'user.name': {
          'path~id': '42',
        },
      },
    });
  });

  it('hydrates arrays inside object fields from repeated escaped keys', () => {
    const parsed = parseSearch('?filter.tag%7E1group=react&filter.tag%7E1group=router', {
      schema: {
        filter: object({
          'tag.group': array(string()),
        }),
      },
    });

    expect(parsed.search).toEqual({
      filter: {
        'tag.group': ['react', 'router'],
      },
    });
  });

  it('throws invalid-search for duplicate scalar object fields', () => {
    expect(() =>
      parseSearch('?filter.role=admin&filter.role=owner', {
        schema: {
          filter: object({
            role: string(),
          }),
        },
      }),
    ).toThrow(expect.objectContaining({ code: 'invalid-search', path: ['filter', 'role'] }));
  });

  it('allows repeated object keys when the declared field is an array', () => {
    expect(
      parseSearch('?filter.tags=react&filter.tags=router', {
        schema: {
          filter: object({
            tags: array(string()),
          }),
        },
      }),
    ).toEqual({
      search: {
        filter: {
          tags: ['react', 'router'],
        },
      },
    });
  });

  it('throws invalid-search when escaped object keys collide after segment unescaping', () => {
    expect(() =>
      parseSearch('?filter.path~id=raw&filter.path~0id=escaped', {
        schema: {
          filter: object({
            'path~id': string(),
          }),
        },
      }),
    ).toThrow(expect.objectContaining({ code: 'invalid-search', path: ['filter', 'path~id'] }));
  });

  it('keeps correctly escaped literal keys and nested keys distinguishable', () => {
    expect(
      parseSearch('?filter.user~1name=ada&filter.user.name=grace', {
        schema: {
          filter: object({
            'user.name': string(),
            user: object({
              name: string(),
            }),
          }),
        },
      }),
    ).toEqual({
      search: {
        filter: {
          'user.name': 'ada',
          user: {
            name: 'grace',
          },
        },
      },
    });
  });

  it('throws invalid-search for nested object key collisions', () => {
    expect(() =>
      parseSearch('?filter.user.path~id=raw&filter.user.path~0id=escaped', {
        schema: {
          filter: object({
            user: object({
              'path~id': string(),
            }),
          }),
        },
      }),
    ).toThrow(
      expect.objectContaining({ code: 'invalid-search', path: ['filter', 'user', 'path~id'] }),
    );
  });

  it('applies unknown nested key behavior after collision checks', () => {
    expect(
      parseSearch('?filter.role=admin&filter.debug=true', {
        schema: { filter: object({ role: string() }) },
      }),
    ).toEqual({
      search: {
        filter: {
          role: 'admin',
        },
      },
    });

    expect(
      parseSearch('?filter.role=admin&filter.debug=true', {
        schema: { filter: object({ role: string() }) },
        unknownSearch: 'preserve',
      }),
    ).toEqual({
      search: {
        filter: {
          role: 'admin',
        },
      },
      unknownSearch: {
        'filter.debug': 'true',
      },
    });

    expect(() =>
      parseSearch('?filter.role=admin&filter.debug=true', {
        schema: { filter: object({ role: string() }) },
        unknownSearch: 'error',
      }),
    ).toThrow(expect.objectContaining({ code: 'invalid-search', path: ['filter.debug'] }));
  });
});
