import { describe, expect, it, expectTypeOf } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import {
  assertStaticSearchField,
  normalizeStaticSearchField,
  normalizeStaticSearchFieldType,
  normalizeStaticSearchFieldValue,
} from './static-search-field-kind.js';

describe('static search field kind helpers', () => {
  it('accepts shorthand, value fields, and explicit type fields', () => {
    expect(() => assertStaticSearchField('string', ['search', 'q'])).not.toThrow();
    expect(() =>
      assertStaticSearchField({ value: 'int', default: 1 }, ['search', 'page']),
    ).not.toThrow();
    expect(() => assertStaticSearchField({ type: 'int' }, ['search', 'page'])).not.toThrow();
    expect(() =>
      assertStaticSearchField({ type: 'date', format: 'dd-MM-yyyy', optional: true }, [
        'search',
        'from',
      ]),
    ).not.toThrow();
    expect(() =>
      assertStaticSearchField({ type: 'string', many: true, optional: true }, ['search', 'tag']),
    ).not.toThrow();

    expect(() => assertStaticSearchField({ type: 'many' }, ['search', 'tag'])).toThrow(
      'Static search field type is invalid.',
    );
    expect(() =>
      assertStaticSearchField({ value: 'string', type: 'string' }, ['search', 'q']),
    ).toThrow('Static search field cannot combine value with type.');
  });

  it('normalizes field values', () => {
    expect(normalizeStaticSearchField('string', ['search', 'q'])).toEqual({ type: 'string' });
    expect(normalizeStaticSearchField({ value: 'int', default: 1 }, ['search', 'page'])).toEqual({
      type: 'int',
      default: 1,
    });
    expect(normalizeStaticSearchFieldValue({ type: 'int' }, ['search', 'page'])).toBe('int');
    expect(
      normalizeStaticSearchFieldValue({ type: 'date', format: 'dd-MM-yyyy', optional: true }, [
        'search',
        'from',
      ]),
    ).toEqual({
      type: 'date',
      format: 'dd-MM-yyyy',
    });
  });

  it('rejects invalid field values', () => {
    expect(() =>
      normalizeStaticSearchFieldValue({ type: 'many' } as never, ['search', 'publishedOn']),
    ).toThrow('Static search field type is invalid.');
  });

  it('normalizes many flags as runtime field types', () => {
    expectTypeOf<'one' | 'many'>(normalizeStaticSearchFieldType(undefined, ['search', 'q']));
    expect(normalizeStaticSearchFieldType(undefined, ['search', 'q'])).toBe('one');
    expect(normalizeStaticSearchFieldType(true, ['search', 'tags'])).toBe('many');
  });

  it('rejects invalid many flags', () => {
    expect(() => normalizeStaticSearchFieldType(false, ['search', 'q'])).toThrow(UrlKitError);
    expect(() => normalizeStaticSearchFieldType(false, ['search', 'q'])).toThrow(
      'Static search field many flag must be true.',
    );
  });

  it('rejects false flags and optional fields with defaults', () => {
    expect(() =>
      assertStaticSearchField({ type: 'string', optional: false }, ['search', 'q']),
    ).toThrow('Static search field optional flag must be true when present.');
    expect(() =>
      assertStaticSearchField({ type: 'string', many: false }, ['search', 'tag']),
    ).toThrow('Static search field many flag must be true when present.');
    expect(() =>
      assertStaticSearchField({ type: 'int', optional: true, default: 1 }, ['search', 'page']),
    ).toThrow('Static search field cannot combine optional: true with a default.');
  });

  it('rejects runtime date codecs in static date and date-time formats', () => {
    const codec = {
      parse: (value: string) => new Date(value),
      serialize: (value: Date) => value.toISOString(),
    };

    expect(() =>
      assertStaticSearchField({ type: 'date', format: codec }, ['search', 'from']),
    ).toThrow('Static date search format must be a string.');
    expect(() =>
      assertStaticSearchField({ type: 'date-time', format: codec }, ['search', 'from']),
    ).toThrow('Static date-time search format must be a string.');

    try {
      assertStaticSearchField({ type: 'date', format: codec }, ['search', 'from']);
    } catch (error) {
      expect(error).toBeInstanceOf(UrlKitError);
      expect((error as UrlKitError).code).toBe('invalid-descriptor');
      expect((error as UrlKitError).path).toEqual(['search', 'from', 'format']);
      return;
    }

    throw new Error('Expected static date codec format to be rejected.');
  });
});
