import { describe, expect, it, expectTypeOf } from 'vitest';
import { compileRuntimeSchema } from '../schema/compile-runtime-schema.js';
import { UrlKitError } from '../errors/url-kit-error.js';
import { compileSearchSchema } from '../search/compile-search-schema.js';
import type { RuntimeSearchField } from '../search/contracts.js';
import { createStaticSearchSchema } from './create-static-search-schema.js';

describe('createStaticSearchSchema', () => {
  it('creates runtime-compatible schema fields from static descriptors', () => {
    const schema = createStaticSearchSchema({
      q: { type: 'string' },
      page: { type: 'int', default: 1 },
      tags: { type: 'string', many: true },
      sort: { type: 'enum', values: ['newest', 'popular'], default: 'newest' },
      startsAt: { type: 'date-time', optional: true },
    } as const);

    expectTypeOf<Readonly<Record<string, unknown>>>(schema);
    expect(Object.isFrozen(schema)).toBe(true);
    expect((schema.q as RuntimeSearchField | undefined)?.type).toBe('one');
    expect((schema.tags as RuntimeSearchField | undefined)?.type).toBe('many');
    expect((schema.startsAt as RuntimeSearchField | undefined)?.optional).toBe(true);

    const compiled = compileSearchSchema(schema);
    expect(compiled.fields.map((field) => field.key)).toEqual([
      'q',
      'page',
      'tags',
      'sort',
      'startsAt',
    ]);
    expect(compiled.fields.find((field) => field.key === 'page')?.defaultValue).toBe(1);
    expect(compiled.fields.find((field) => field.key === 'sort')?.defaultValue).toBe('newest');
  });

  it('defaults field type to one', () => {
    const schema = createStaticSearchSchema({ ref: { type: 'string', optional: true } });
    const field = schema.ref;

    const runtimeField = field as RuntimeSearchField | undefined;

    expect(runtimeField?.type).toBe('one');
    expect(runtimeField?.optional).toBe(true);
    expect(compileRuntimeSchema(runtimeField!.value).kind).toBe('string');
  });

  it('creates built-in date schemas from static date descriptors', () => {
    const schema = createStaticSearchSchema({
      dateOnly: { type: 'date' },
      unix: { type: 'date', format: 'unix-seconds', default: 1_704_067_200 },
    });

    const dateOnly = schema.dateOnly as RuntimeSearchField | undefined;
    const unix = schema.unix as RuntimeSearchField | undefined;

    expect(compileRuntimeSchema(dateOnly!.value).options.format).toBe('date');
    expect(compileRuntimeSchema(unix!.value).options.format).toBe('unix-seconds');
    expect(unix?.default).toEqual(new Date('2024-01-01T00:00:00.000Z'));
  });

  it('creates custom formatted date schemas from static descriptors', () => {
    const schema = createStaticSearchSchema({
      from: { type: 'date', format: 'dd-MM-yyyy', default: '02-06-2026' },
      at: { type: 'date-time', format: 'dd-MM-yyyy HH:mm:ss', optional: true },
    });

    const from = schema.from as RuntimeSearchField | undefined;
    const at = schema.at as RuntimeSearchField | undefined;

    expect(compileRuntimeSchema(from!.value).options.format).toBe('dd-MM-yyyy');
    expect(compileRuntimeSchema(at!.value).options.format).toBe('dd-MM-yyyy HH:mm:ss');
    expect(from?.default).toEqual(new Date('2026-06-02T00:00:00.000Z'));
    expect(at?.optional).toBe(true);
  });

  it('rejects invalid descriptors', () => {
    expect(() => createStaticSearchSchema(null as never)).toThrow(UrlKitError);
    expect(() => createStaticSearchSchema({ bad: 'uuid' as never })).toThrow(UrlKitError);
    expect(() => createStaticSearchSchema({ bad: { value: 'uuid' } } as never)).toThrow(
      UrlKitError,
    );
    expect(() => createStaticSearchSchema({ bad: { value: 'date' } } as never)).toThrow(
      UrlKitError,
    );
    expect(() => createStaticSearchSchema({ bad: { type: 'enum', values: [] } } as never)).toThrow(
      UrlKitError,
    );
    expect(() =>
      createStaticSearchSchema({ bad: { type: 'many', default: 'x' } } as never),
    ).toThrow(UrlKitError);
  });
});
