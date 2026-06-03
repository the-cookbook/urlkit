import { describe, expect, it } from 'vitest';
import { array } from '../schema/array.js';
import { boolean } from '../schema/boolean.js';
import { int } from '../schema/int.js';
import { object } from '../schema/object.js';
import { string } from '../schema/string.js';
import type {
  InferRuntimeSearch,
  RawSearchParams,
  RuntimeSearchSchema,
  SearchParseResult,
} from './contracts.js';

function expectType<Value>(_value: Value): void {}

describe('search contracts', () => {
  it('models raw search params and schema parse results separately', () => {
    const raw: RawSearchParams = { q: 'router', tag: ['react', 'url'] };
    const result: SearchParseResult<{ readonly q: string }> = {
      search: { q: 'router' },
      unknownSearch: { debug: 'true' },
    };

    expect(raw.tag).toEqual(['react', 'url']);
    expect(result.unknownSearch).toEqual({ debug: 'true' });
    expectType<string | readonly string[]>(raw.q!);
  });

  it('infers runtime search field values without unknown search pollution', () => {
    const schema = {
      q: string(),
      page: int().default(1),
      active: boolean().optional(),
      tags: { type: 'many', value: string(), optional: true },
      filter: object({ role: string(), ids: array(int()).default([]) }),
    } satisfies RuntimeSearchSchema;

    type Search = InferRuntimeSearch<typeof schema>;

    expectType<{
      readonly q: string;
      readonly page: number;
      readonly filter: { readonly role: string; readonly ids: readonly number[] };
      readonly active?: boolean;
      readonly tags?: readonly string[];
    }>({} as Search);
  });
});
