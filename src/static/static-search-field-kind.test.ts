import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import {
  isStaticSearchFieldObject,
  normalizeStaticSearchFieldType,
  normalizeStaticSearchFieldValue,
} from './static-search-field-kind.js';

const expectType = <Value>(_value: Value): void => undefined;

describe('static search field kind helpers', () => {
  it('distinguishes field objects from direct value descriptors', () => {
    expect(isStaticSearchFieldObject({ type: 'many' })).toBe(true);
    expect(isStaticSearchFieldObject({ value: 'int' })).toBe(true);
    expect(isStaticSearchFieldObject({ optional: true })).toBe(true);
    expect(isStaticSearchFieldObject({ default: 'x' })).toBe(true);
    expect(isStaticSearchFieldObject({ type: 'enum', values: ['a'] })).toBe(false);
    expect(isStaticSearchFieldObject({ type: 'date' })).toBe(false);
    expect(isStaticSearchFieldObject('string')).toBe(false);
  });

  it('defaults field object values to string', () => {
    expect(normalizeStaticSearchFieldValue({ type: 'many' })).toBe('string');
    expect(normalizeStaticSearchFieldValue({ value: 'int' })).toBe('int');
    expect(normalizeStaticSearchFieldValue('boolean')).toBe('boolean');
  });

  it('normalizes field types', () => {
    expectType<'one' | 'many'>(normalizeStaticSearchFieldType(undefined, ['search', 'q']));
    expect(normalizeStaticSearchFieldType(undefined, ['search', 'q'])).toBe('one');
    expect(normalizeStaticSearchFieldType('one', ['search', 'q'])).toBe('one');
    expect(normalizeStaticSearchFieldType('many', ['search', 'tags'])).toBe('many');
  });

  it('rejects invalid field types', () => {
    expect(() => normalizeStaticSearchFieldType('all', ['search', 'q'])).toThrow(UrlKitError);
    expect(() => normalizeStaticSearchFieldType('all', ['search', 'q'])).toThrow(
      'Static search field type must be "one" or "many".',
    );
  });
});
