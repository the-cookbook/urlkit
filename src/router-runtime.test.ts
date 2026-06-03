import { describe, expect, it } from 'vitest';
import {
  buildHash,
  buildSearch,
  createRouteUrlContract,
  normalizeHash,
  omitSearch,
  parseHash,
  parseSearch,
  patchSearch,
  pickSearch,
  replaceSearch,
} from './router-runtime.js';

const expectType = <Value>(_value: Value): void => undefined;

describe('router-runtime public exports', () => {
  it('exports framework-agnostic router-runtime helpers', () => {
    expect(createRouteUrlContract).toBeTypeOf('function');
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
        value: 'int',
        default: 1,
      },
      sort: {
        value: {
          type: 'enum',
          values: ['newest', 'popular'],
        },
        default: 'newest',
      },
    } as const;

    const parsed = parseSearch('?page=2&sort=popular', { schema });

    expect(parsed).toEqual({ page: 2, sort: 'popular' });
    expect(buildSearch(parsed, { schema })).toBe('?page=2&sort=popular');
    expectType<{ readonly page: number; readonly sort: 'newest' | 'popular' }>(parsed);
  });

  it('returns flat raw search through the public fallback overload', () => {
    expect(parseSearch('?filter.role=admin&tag=a&tag=b')).toEqual({
      'filter.role': 'admin',
      tag: ['a', 'b'],
    });
  });

  it('exposes hash helpers through the public entry', () => {
    expect(parseHash('#comments', ['comments', 'share'])).toBe('comments');
    expect(normalizeHash('comments', ['comments', 'share'])).toBe('comments');
    expect(buildHash('share', ['comments', 'share'])).toBe('#share');
  });

  it('does not expose route definition concepts through router-runtime options', () => {
    expectType<'params' | 'unknownSearch' | 'arrayFormat' | never>(
      {} as keyof import('./runtime/contracts.js').CreateRouteUrlContractOptions,
    );
  });
});
