import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { normalizeStaticSearchDefault } from './normalize-static-search-default.js';

const path = Object.freeze(['search', 'value']);

describe('normalizeStaticSearchDefault', () => {
  it('validates primitive defaults', () => {
    expect(normalizeStaticSearchDefault('one', 'string', 'router', path)).toBe('router');
    expect(normalizeStaticSearchDefault('one', 'number', 1.5, path)).toBe(1.5);
    expect(normalizeStaticSearchDefault('one', 'int', 2, path)).toBe(2);
    expect(normalizeStaticSearchDefault('one', 'boolean', false, path)).toBe(false);
  });

  it('validates enum defaults', () => {
    expect(
      normalizeStaticSearchDefault(
        'one',
        { type: 'enum', values: ['newest', 'popular'] },
        'popular',
        path,
      ),
    ).toBe('popular');

    expect(() =>
      normalizeStaticSearchDefault(
        'one',
        { type: 'enum', values: ['newest', 'popular'] },
        'oldest',
        path,
      ),
    ).toThrow(UrlKitError);
  });

  it('normalizes serialized date defaults to Date values', () => {
    expect(normalizeStaticSearchDefault('one', { type: 'date' }, '2026-06-02', path)).toEqual(
      new Date('2026-06-02T00:00:00.000Z'),
    );

    expect(
      normalizeStaticSearchDefault('one', { type: 'date-time' }, '2026-01-01T10:30:00.000Z', path),
    ).toEqual(new Date('2026-01-01T10:30:00.000Z'));
  });

  it('normalizes static custom formatted date defaults', () => {
    expect(
      normalizeStaticSearchDefault(
        'one',
        { type: 'date', format: 'dd-MM-yyyy' },
        '02-06-2026',
        path,
      ),
    ).toEqual(new Date('2026-06-02T00:00:00.000Z'));

    expect(
      normalizeStaticSearchDefault(
        'one',
        { type: 'date-time', format: 'dd-MM-yyyy HH:mm:ss' },
        '02-06-2026 12:30:05',
        path,
      ),
    ).toEqual(new Date('2026-06-02T12:30:05.000Z'));
  });

  it('normalizes unix defaults from finite integer numbers', () => {
    expect(
      normalizeStaticSearchDefault(
        'one',
        { type: 'date', format: 'unix-seconds' },
        1_704_067_200,
        path,
      ),
    ).toEqual(new Date('2024-01-01T00:00:00.000Z'));

    expect(
      normalizeStaticSearchDefault(
        'one',
        { type: 'date', format: 'unix-ms' },
        1_704_067_200_000,
        path,
      ),
    ).toEqual(new Date('2024-01-01T00:00:00.000Z'));
  });

  it('rejects Date instances for static date defaults', () => {
    expect(() =>
      normalizeStaticSearchDefault(
        'one',
        { type: 'date' },
        new Date('2026-06-02T00:00:00.000Z'),
        path,
      ),
    ).toThrow(UrlKitError);
  });

  it('rejects invalid defaults', () => {
    expect(() => normalizeStaticSearchDefault('one', 'string', 1, path)).toThrow(UrlKitError);
    expect(() =>
      normalizeStaticSearchDefault('one', 'number', Number.POSITIVE_INFINITY, path),
    ).toThrow(UrlKitError);
    expect(() => normalizeStaticSearchDefault('one', 'int', 1.5, path)).toThrow(UrlKitError);
    expect(() => normalizeStaticSearchDefault('one', 'boolean', 'true', path)).toThrow(UrlKitError);
    expect(() => normalizeStaticSearchDefault('one', { type: 'date' }, '2026-02-31', path)).toThrow(
      UrlKitError,
    );
    expect(() =>
      normalizeStaticSearchDefault('one', { type: 'date-time' }, '2026-01-01T10:30:00+02:00', path),
    ).toThrow(UrlKitError);
    expect(() =>
      normalizeStaticSearchDefault('one', { type: 'date', format: 'unix-seconds' }, 1.5, path),
    ).toThrow(UrlKitError);
    expect(() =>
      normalizeStaticSearchDefault(
        'one',
        { type: 'date', format: 'unix-ms' },
        '1704067200000',
        path,
      ),
    ).toThrow(UrlKitError);
  });

  it('validates many defaults as arrays and normalizes every item', () => {
    const value = normalizeStaticSearchDefault(
      'many',
      { type: 'date' },
      ['2026-06-02', '2026-06-03'],
      path,
    );

    expect(value).toEqual([
      new Date('2026-06-02T00:00:00.000Z'),
      new Date('2026-06-03T00:00:00.000Z'),
    ]);
    expect(Object.isFrozen(value)).toBe(true);
  });

  it('rejects non-array many defaults', () => {
    expect(() => normalizeStaticSearchDefault('many', 'string', 'tag', path)).toThrow(UrlKitError);
  });
});
