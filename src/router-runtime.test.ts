import { describe, expect, it, expectTypeOf } from 'vitest';
import {
  buildHash,
  buildSearch,
  createConstraint,
  createRouteUrlContract,
  hasPathConstraint,
  normalizeHash,
  omitSearch,
  parseHash,
  parseSearch,
  patchSearch,
  pickSearch,
  registerPathConstraint,
  registerPathConstraints,
  replaceSearch,
} from './router-runtime.js';

describe('router-runtime public exports', () => {
  it('exports framework-agnostic router-runtime helpers', () => {
    expect(createRouteUrlContract).toBeTypeOf('function');
    expect(createConstraint).toBeTypeOf('function');
    expect(hasPathConstraint).toBeTypeOf('function');
    expect(registerPathConstraint).toBeTypeOf('function');
    expect(registerPathConstraints).toBeTypeOf('function');
    expect(parseSearch).toBeTypeOf('function');
    expect(buildSearch).toBeTypeOf('function');
    expect(patchSearch).toBeTypeOf('function');
    expect(replaceSearch).toBeTypeOf('function');
    expect(omitSearch).toBeTypeOf('function');
    expect(pickSearch).toBeTypeOf('function');
    expect(parseHash).toBeTypeOf('function');
    expect(buildHash).toBeTypeOf('function');
    expect(normalizeHash).toBeTypeOf('function');
  });

  it('uses static search descriptors through the public entry', () => {
    const schema = {
      page: {
        type: 'int',
        default: 1,
      },
      sort: {
        type: 'enum',
        values: ['newest', 'popular'],
        default: 'newest',
      },
    } as const;

    const parsed = parseSearch('?page=2&sort=popular', { schema });

    expect(parsed).toEqual({ page: 2, sort: 'popular' });
    expect(buildSearch(parsed, { schema })).toBe('?page=2&sort=popular');
    expectTypeOf<{ readonly page: number; readonly sort: 'newest' | 'popular' }>(parsed);
  });

  it('supports custom formatted static date descriptors through the public entry', () => {
    const schema = {
      from: {
        type: 'date',
        format: 'dd-MM-yyyy',
        optional: true,
      },
      at: {
        type: 'date-time',
        format: 'dd-MM-yyyy HH:mm:ss',
        optional: true,
      },
    } as const;

    const parsed = parseSearch('?from=02-06-2026&at=02-06-2026+12%3A30%3A05', { schema });

    expect(parsed).toEqual({
      from: new Date('2026-06-02T00:00:00.000Z'),
      at: new Date('2026-06-02T12:30:05.000Z'),
    });
    expect(buildSearch(parsed, { schema })).toBe('?from=02-06-2026&at=02-06-2026+12%3A30%3A05');
    expectTypeOf<{ readonly from?: Date; readonly at?: Date }>(parsed);
  });

  it('can omit invalid optional parsed search fields through the public entry', () => {
    const schema = {
      page: { type: 'int', default: 1 },
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
      parseSearch('?page=2&publishedOn=02-06-2026&scheduledAt=foo', { schema }),
    ).toThrow();

    const parsed = parseSearch('?page=2&publishedOn=02-06-2026&scheduledAt=foo', {
      schema,
      invalidSearch: 'omit',
    });

    expect(parsed).toEqual({
      page: 2,
      publishedOn: new Date('2026-06-02T00:00:00.000Z'),
    });
    expectTypeOf<
      Partial<{
        readonly page: number;
        readonly publishedOn?: Date;
        readonly scheduledAt?: Date;
      }>
    >(parsed);
  });

  it('returns flat raw search through the public fallback overload', () => {
    expect(parseSearch('?filter.role=admin&tag=a&tag=b')).toEqual({
      'filter.role': 'admin',
      tag: ['a', 'b'],
    });
  });

  it('exposes hash helpers through the public entry', () => {
    expect(
      parseHash('#comments', { type: 'enum', values: ['comments', 'share'], optional: true }),
    ).toBe('comments');
    expect(() =>
      parseHash('#overview', { type: 'enum', values: ['comments', 'share'], optional: true }),
    ).toThrow();
    expect(
      parseHash(
        '#overview',
        { type: 'enum', values: ['comments', 'share'], optional: true },
        { invalidHash: 'omit' },
      ),
    ).toBeUndefined();
    expect(
      normalizeHash('comments', { type: 'enum', values: ['comments', 'share'], optional: true }),
    ).toBe('comments');
    expect(
      buildHash('share', { type: 'enum', values: ['comments', 'share'], optional: true }),
    ).toBe('#share');
  });

  it('does not expose route definition concepts through router-runtime options', () => {
    expectTypeOf<'params' | 'unknownSearch' | 'arrayFormat' | 'pathConstraints' | never>(
      {} as keyof import('./runtime/contracts.js').CreateRouteUrlContractOptions,
    );
  });
});
