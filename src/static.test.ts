import { describe, expect, it, expectTypeOf } from 'vitest';
import {
  compileStaticHash,
  compileStaticSearch,
  compileStaticUrl,
  createConstraint,
  hasPathConstraint,
  registerPathConstraint,
  registerPathConstraints,
} from './static.js';
import type {
  InferStaticHash,
  InferStaticSearch,
  StaticHashDescriptor,
  StaticSearchDescriptor,
  StaticUrlDescriptor,
} from './static.js';

describe('static public exports', () => {
  it('exports static compilers', () => {
    expect(compileStaticUrl).toBeTypeOf('function');
    expect(compileStaticSearch).toBeTypeOf('function');
    expect(compileStaticHash).toBeTypeOf('function');
    expect(createConstraint).toBeTypeOf('function');
    expect(hasPathConstraint).toBeTypeOf('function');
    expect(registerPathConstraint).toBeTypeOf('function');
    expect(registerPathConstraints).toBeTypeOf('function');
  });

  it('exports static descriptor contracts for tooling users', () => {
    const search = {
      q: { type: 'string' },
      page: {
        type: 'int',
        default: 1,
      },
    } as const satisfies StaticSearchDescriptor;
    const hash = {
      type: 'enum',
      values: ['comments', 'share'],
      optional: true,
    } as const satisfies StaticHashDescriptor;
    const descriptor = {
      path: '/articles/{slug}',
      search,
      hash,
    } as const satisfies StaticUrlDescriptor;

    expectTypeOf<{ readonly q: string; readonly page: number }>(
      {} as InferStaticSearch<typeof search>,
    );
    expectTypeOf<'comments' | 'share' | undefined>({} as InferStaticHash<typeof hash>);
    expect(compileStaticUrl(descriptor).mode).toBe('path');
  });
});
