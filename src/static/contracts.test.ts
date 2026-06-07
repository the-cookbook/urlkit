import { describe, expect, it, expectTypeOf } from 'vitest';
import type {
  CompileStaticUrlOptions,
  InferStaticHash,
  InferStaticSearch,
  InferStaticUrlHash,
  InferStaticUrlSearch,
  StaticUrlModeFromDescriptor,
} from './contracts.js';

describe('static contracts', () => {
  it('models static URL compiler path constraint options', () => {
    const options: CompileStaticUrlOptions = {
      pathConstraints: {},
    };

    expect(options.pathConstraints).toEqual({});
  });

  it('infers static search fields', () => {
    const descriptor = {
      ref: {
        type: 'string',
        optional: true,
      },
      filters: {
        type: 'string',
        many: true,
        optional: true,
      },
      page: {
        type: 'int',
        default: 1,
      },
      sort: {
        type: 'enum',
        values: ['newest', 'popular'],
        default: 'newest',
      },
      startsAt: {
        type: 'date-time',
        optional: true,
      },
    } as const;

    expectTypeOf<{
      readonly ref?: string;
      readonly filters?: readonly string[];
      readonly page: number;
      readonly sort: 'newest' | 'popular';
      readonly startsAt?: Date;
    }>({} as InferStaticSearch<typeof descriptor>);

    expect(descriptor.page.default).toBe(1);
  });

  it('infers static string hash descriptors', () => {
    expectTypeOf<string>({} as InferStaticHash<{ readonly type: 'string' }>);
    expectTypeOf<string | undefined>(
      {} as InferStaticHash<{ readonly type: 'string'; readonly optional: true }>,
    );
    expectTypeOf<string>(
      {} as InferStaticHash<{ readonly type: 'string'; readonly default: 'overview' }>,
    );
  });

  it('infers static enum hash descriptors', () => {
    expectTypeOf<'overview' | 'comments'>(
      {} as InferStaticHash<{
        readonly type: 'enum';
        readonly values: readonly ['overview', 'comments'];
      }>,
    );
    expectTypeOf<'overview' | 'comments' | undefined>(
      {} as InferStaticHash<{
        readonly type: 'enum';
        readonly values: readonly ['overview', 'comments'];
        readonly optional: true;
      }>,
    );
    expectTypeOf<'overview' | 'comments'>(
      {} as InferStaticHash<{
        readonly type: 'enum';
        readonly values: readonly ['overview', 'comments'];
        readonly default: 'overview';
      }>,
    );
  });

  it('infers static URL descriptor mode, search, and hash', () => {
    const descriptor = {
      path: '/articles/{slug}',
      search: {
        q: { type: 'string' },
        page: { type: 'int', default: 1 },
      },
      hash: { type: 'enum', values: ['comments', 'share'], optional: true },
    } as const;

    expectTypeOf<'path'>({} as StaticUrlModeFromDescriptor<typeof descriptor>);
    expectTypeOf<{
      readonly q: string;
      readonly page: number;
    }>({} as InferStaticUrlSearch<typeof descriptor>);
    expectTypeOf<'comments' | 'share' | undefined>({} as InferStaticUrlHash<typeof descriptor>);
  });

  it('infers pathless static URL descriptors', () => {
    const descriptor = {
      search: {
        page: { type: 'int', default: 1 },
      },
    } as const;

    expectTypeOf<'pathless'>({} as StaticUrlModeFromDescriptor<typeof descriptor>);
    expectTypeOf<{ readonly page: number }>({} as InferStaticUrlSearch<typeof descriptor>);
    expectTypeOf<undefined>(undefined);
  });
});
