import { describe, expect, it } from 'vitest';
import { compileRuntimeSchema } from '../schema/compile-runtime-schema.js';
import { UrlKitError } from '../errors/url-kit-error.js';
import { compileSearchSchema } from '../search/compile-search-schema.js';
import type { RuntimeSearchField } from '../search/contracts.js';
import { createStaticSearchSchema } from './create-static-search-schema.js';

const expectType = <Value>(_value: Value): void => undefined;

describe('createStaticSearchSchema', () => {
  it('creates runtime-compatible schema fields from static descriptors', () => {
    const schema = createStaticSearchSchema({
      q: 'string',
      page: { value: 'int', default: 1 },
      tags: { type: 'many' },
      sort: { value: { type: 'enum', values: ['newest', 'popular'] }, default: 'newest' },
      startsAt: { value: 'date-time', optional: true },
    } as const);

    expectType<Readonly<Record<string, unknown>>>(schema);
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

  it('defaults field value to string and field type to one', () => {
    const schema = createStaticSearchSchema({ ref: { optional: true } });
    const field = schema.ref;

    const runtimeField = field as RuntimeSearchField | undefined;

    expect(runtimeField?.type).toBe('one');
    expect(runtimeField?.optional).toBe(true);
    expect(compileRuntimeSchema(runtimeField!.value).kind).toBe('string');
  });

  it('creates built-in date schemas from static date descriptors', () => {
    const schema = createStaticSearchSchema({
      dateOnly: { value: { type: 'date' } },
      unix: { value: { type: 'date', format: 'unix-seconds' }, default: 1_704_067_200 },
    });

    const dateOnly = schema.dateOnly as RuntimeSearchField | undefined;
    const unix = schema.unix as RuntimeSearchField | undefined;

    expect(compileRuntimeSchema(dateOnly!.value).options.format).toBe('date');
    expect(compileRuntimeSchema(unix!.value).options.format).toBe('unix-seconds');
    expect(unix?.default).toEqual(new Date('2024-01-01T00:00:00.000Z'));
  });

  it('rejects invalid descriptors', () => {
    expect(() => createStaticSearchSchema(null as never)).toThrow(UrlKitError);
    expect(() => createStaticSearchSchema({ bad: 'uuid' as never })).toThrow(UrlKitError);
    expect(() => createStaticSearchSchema({ bad: { value: 'uuid' as never } })).toThrow(
      UrlKitError,
    );
    expect(() => createStaticSearchSchema({ bad: { type: 'enum', values: [] } })).toThrow(
      UrlKitError,
    );
    expect(() => createStaticSearchSchema({ bad: { type: 'many', default: 'x' } })).toThrow(
      UrlKitError,
    );
  });
});
