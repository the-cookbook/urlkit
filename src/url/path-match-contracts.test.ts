import { describe, expectTypeOf, it } from 'vitest';
import type { UrlPathMatchOptions } from '../contracts.js';
import type { PathMatchOptionsFromOptions } from './path-match-contracts.js';

type IsEqual<Actual, Expected> =
  (<Value>() => Value extends Actual ? 1 : 2) extends <Value>() => Value extends Expected ? 1 : 2
    ? true
    : false;

type Assert<Value extends true> = Value;

describe('PathMatchOptionsFromOptions', () => {
  it('preserves literal pathMatch options', () => {
    type Options = PathMatchOptionsFromOptions<{
      readonly pathMatch: {
        readonly wildcardFormat: 'array';
        readonly sensitive: true;
      };
    }>;

    expectTypeOf<
      Assert<
        IsEqual<
          Options,
          {
            readonly wildcardFormat: 'array';
            readonly sensitive: true;
          }
        >
      >
    >(true);
  });

  it('returns undefined when pathMatch is absent', () => {
    expectTypeOf<Assert<IsEqual<PathMatchOptionsFromOptions<{}>, undefined>>>(true);
    expectTypeOf<Assert<IsEqual<PathMatchOptionsFromOptions<undefined>, undefined>>>(true);
  });

  it('preserves widened pathMatch options', () => {
    expectTypeOf<
      Assert<
        IsEqual<
          PathMatchOptionsFromOptions<{ readonly pathMatch?: UrlPathMatchOptions }>,
          UrlPathMatchOptions
        >
      >
    >(true);
  });
});
