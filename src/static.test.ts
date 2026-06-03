import { describe, expect, it } from 'vitest';
import { compileStaticHash, compileStaticSearch, compileStaticUrl } from './static.js';
import type {
  InferStaticHash,
  InferStaticSearch,
  StaticHashDescriptor,
  StaticSearchDescriptor,
  StaticUrlDescriptor,
} from './static.js';

const expectType = <Value>(_value: Value): void => undefined;

describe('static public exports', () => {
  it('exports static compilers', () => {
    expect(compileStaticUrl).toBeTypeOf('function');
    expect(compileStaticSearch).toBeTypeOf('function');
    expect(compileStaticHash).toBeTypeOf('function');
  });

  it('exports static descriptor contracts for tooling users', () => {
    const search = {
      q: 'string',
      page: {
        value: 'int',
        default: 1,
      },
    } as const satisfies StaticSearchDescriptor;
    const hash = ['comments', 'share'] as const satisfies StaticHashDescriptor;
    const descriptor = {
      path: '/articles/{slug}',
      search,
      hash,
    } as const satisfies StaticUrlDescriptor;

    expectType<{ readonly q: string; readonly page: number }>(
      {} as InferStaticSearch<typeof search>,
    );
    expectType<'comments' | 'share' | undefined>({} as InferStaticHash<typeof hash>);
    expect(compileStaticUrl(descriptor).mode).toBe('path');
  });
});
