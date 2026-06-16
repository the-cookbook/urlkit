import { describe, expect, it, expectTypeOf } from 'vitest';
import {
  compileStaticHash,
  compileStaticSearch,
  compileStaticUrl,
  createConstraint,
  createPathConstraint,
  hasPathConstraint,
  getPathConstraint,
  resetPathConstraints,
  registerPathConstraint,
  registerPathConstraints,
  unregisterPathConstraint,
} from './static.js';
import type {
  InferStaticHash,
  InferStaticSearch,
  StaticBooleanSearchField,
  StaticDateSearchField,
  StaticDateTimeSearchField,
  StaticEnumSearchField,
  StaticHashDescriptor,
  StaticIntSearchField,
  StaticNumberSearchField,
  StaticSearchDescriptor,
  StaticSearchField,
  StaticSearchFieldBase,
  StaticStringSearchField,
  StaticUrlDescriptor,
} from './static.js';

describe('static public exports', () => {
  it('exports static compilers', () => {
    expect(compileStaticUrl).toBeTypeOf('function');
    expect(compileStaticSearch).toBeTypeOf('function');
    expect(compileStaticHash).toBeTypeOf('function');
    // "createConstraint" is flagged to be removed on v3
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    expect(createConstraint).toBeTypeOf('function');
    expect(createPathConstraint).toBeTypeOf('function');
    expect(hasPathConstraint).toBeTypeOf('function');
    expect(getPathConstraint).toBeTypeOf('function');
    expect(resetPathConstraints).toBeTypeOf('function');
    expect(registerPathConstraint).toBeTypeOf('function');
    expect(registerPathConstraints).toBeTypeOf('function');
    expect(unregisterPathConstraint).toBeTypeOf('function');
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

    const fields = {
      q: { type: 'string' },
      page: { type: 'int', default: 1 },
      score: { type: 'number', optional: true },
      active: { type: 'boolean' },
      publishedOn: { type: 'date', optional: true },
      scheduledAt: { type: 'date-time', optional: true },
      sort: { type: 'enum', values: ['newest', 'popular'], default: 'newest' },
    } as const satisfies Record<
      string,
      | StaticSearchFieldBase
      | StaticStringSearchField
      | StaticNumberSearchField
      | StaticIntSearchField
      | StaticBooleanSearchField
      | StaticDateSearchField
      | StaticDateTimeSearchField
      | StaticEnumSearchField
      | StaticSearchField
    >;

    expect(fields.page.default).toBe(1);

    expect(compileStaticUrl(descriptor).mode).toBe('path');
  });
});
