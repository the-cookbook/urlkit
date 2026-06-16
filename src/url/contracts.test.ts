import { describe, expect, it, expectTypeOf } from 'vitest';
import type { EmptyParams } from '../contracts.js';
import type { ParamsFromPattern, PathnameFromPattern, UrlContract } from './contracts.js';

type IsEqual<Actual, Expected> =
  (<Value>() => Value extends Actual ? 1 : 2) extends <Value>() => Value extends Expected ? 1 : 2
    ? true
    : false;

type Assert<Value extends true> = Value;

describe('url contract types', () => {
  it('uses mode-aware build and normalize input types for path contracts', () => {
    interface Params {
      readonly id: number;
    }

    interface Search {
      readonly tab: string;
    }

    if (false) {
      const contract = undefined as unknown as UrlContract<
        'path',
        `/users/${number}`,
        Params,
        Search,
        undefined
      >;

      expectTypeOf<string>(contract.pattern);
      expectTypeOf<Params>(contract.parsePathname('/users/1'));
      expectTypeOf<string>(contract.buildPath({ id: 1 }));
      expectTypeOf<string>(contract.build({ params: { id: 1 }, search: { tab: 'profile' } }));
      expectTypeOf<`/users/${number}`>(contract.normalize({ params: { id: 1 } }).pathname);

      // @ts-expect-error path contracts cannot build from an explicit pathname.
      contract.build({ pathname: '/users/1', params: { id: 1 } });
    }

    expect(true).toBe(true);
  });

  it('uses mode-aware build and normalize input types for pathless contracts', () => {
    interface Search {
      readonly page: number;
    }

    if (false) {
      const contract = undefined as unknown as UrlContract<
        'pathless',
        string,
        EmptyParams,
        Search,
        undefined
      >;

      expectTypeOf<undefined>(contract.pattern);
      expectTypeOf<string>(contract.build({ search: { page: 2 } }));
      expectTypeOf<string>(contract.build({ pathname: '/products', search: { page: 2 } }));
      expectTypeOf<'/products'>(
        contract.normalize({ pathname: '/products', search: { page: 2 } }).pathname,
      );

      // @ts-expect-error pathless contracts cannot build from params.
      contract.build({ params: {}, search: { page: 2 } });

      // @ts-expect-error pathless contracts do not expose parsePathname.
      contract.parsePathname('/products');

      // @ts-expect-error pathless contracts do not expose buildPath.
      contract.buildPath({});
    }

    expect(true).toBe(true);
  });

  it('infers pathnames and params from path patterns', () => {
    expectTypeOf<`/users/${number}`>('/users/42');
    expectTypeOf<`/teams/${string}/users/${number}`>('/teams/core/users/42');
    expectTypeOf<{ readonly id: number }>({} as ParamsFromPattern<'/users/{id:int}'>);
    expectTypeOf<{ readonly slug: string }>(
      {} as ParamsFromPattern<'/articles/{slug:regex([a-z0-9-]+)}'>,
    );
  });

  it('infers exact template-literal pathnames from path patterns', () => {
    type UserPathname = PathnameFromPattern<'/users/{id:int}'>;
    type ArticlePathname = PathnameFromPattern<'/articles/{slug:regex([a-z0-9-]+)}'>;
    type TeamUserPathname = PathnameFromPattern<'/teams/{teamId}/users/{userId:int}'>;
    type NumberPathname = PathnameFromPattern<'/products/{id:int}'>;

    expectTypeOf<Assert<IsEqual<UserPathname, `/users/${number}`>>>(true);
    expectTypeOf<Assert<IsEqual<ArticlePathname, `/articles/${string}`>>>(true);
    expectTypeOf<Assert<IsEqual<TeamUserPathname, `/teams/${string}/users/${number}`>>>(true);
    expectTypeOf<Assert<IsEqual<NumberPathname, `/products/${number}`>>>(true);

    // @ts-expect-error int params must infer number segments, not arbitrary strings.
    expectTypeOf<UserPathname>('/users/not-a-number');

    expect(true).toBe(true);
  });

  it('infers exact params from path patterns', () => {
    type UserParams = ParamsFromPattern<'/users/{id:int}'>;
    type ProductsParams = ParamsFromPattern<'/products/{price:decimal}'>;
    type ArticleParams = ParamsFromPattern<'/articles/{slug:regex([a-z0-9-]+)}'>;
    type TeamUserParams = ParamsFromPattern<'/teams/{teamId}/users/{userId:int}'>;
    type NumberParams = ParamsFromPattern<'/products/{id:int}'>;

    expectTypeOf<Assert<IsEqual<UserParams, { readonly id: number }>>>(true);
    expectTypeOf<Assert<IsEqual<ProductsParams, { readonly price: number }>>>(true);
    expectTypeOf<Assert<IsEqual<ArticleParams, { readonly slug: string }>>>(true);
    expectTypeOf<
      Assert<IsEqual<TeamUserParams, { readonly teamId: string; readonly userId: number }>>
    >(true);
    expectTypeOf<Assert<IsEqual<NumberParams, { readonly id: number }>>>(true);

    expect(true).toBe(true);
  });

  it('infers weighted constraint chains for params and pathnames', () => {
    type MinParams = ParamsFromPattern<'/users/{id:min(1)}'>;
    type MaxParams = ParamsFromPattern<'/users/{id:max(10)}'>;
    type RangeParams = ParamsFromPattern<'/users/{id:range(1, 10)}'>;
    type MinMaxParams = ParamsFromPattern<'/users/{id:min(1):max(10)}'>;
    type IntMinParams = ParamsFromPattern<'/users/{id:int:min(1)}'>;
    type RegexMinParams = ParamsFromPattern<'/users/{id:regex(\\d):min(1)}'>;
    type UuidParams = ParamsFromPattern<'/users/{id:uuid}'>;
    type LengthParams = ParamsFromPattern<'/articles/{slug:minlength(3):maxlength(50)}'>;
    type OptionalMinParams = ParamsFromPattern<'/users/{id:min(1)?}'>;

    type MinPathname = PathnameFromPattern<'/users/{id:min(1)}'>;
    type RangePathname = PathnameFromPattern<'/users/{id:range(1, 10)}'>;
    type RegexMinPathname = PathnameFromPattern<'/users/{id:regex(\\d):min(1)}'>;
    type UuidPathname = PathnameFromPattern<'/users/{id:uuid}'>;
    type OptionalMinPathname = PathnameFromPattern<'/products/{id:min(1)?}'>;

    expectTypeOf<Assert<IsEqual<MinParams, { readonly id: number }>>>(true);
    expectTypeOf<Assert<IsEqual<MaxParams, { readonly id: number }>>>(true);
    expectTypeOf<Assert<IsEqual<RangeParams, { readonly id: number }>>>(true);
    expectTypeOf<Assert<IsEqual<MinMaxParams, { readonly id: number }>>>(true);
    expectTypeOf<Assert<IsEqual<IntMinParams, { readonly id: number }>>>(true);
    expectTypeOf<Assert<IsEqual<RegexMinParams, { readonly id: number }>>>(true);
    expectTypeOf<Assert<IsEqual<UuidParams, { readonly id: string }>>>(true);
    expectTypeOf<Assert<IsEqual<LengthParams, { readonly slug: string }>>>(true);
    expectTypeOf<Assert<IsEqual<OptionalMinParams, { readonly id?: number }>>>(true);

    expectTypeOf<Assert<IsEqual<MinPathname, `/users/${number}`>>>(true);
    expectTypeOf<Assert<IsEqual<RangePathname, `/users/${number}`>>>(true);
    expectTypeOf<Assert<IsEqual<RegexMinPathname, `/users/${number}`>>>(true);
    expectTypeOf<Assert<IsEqual<UuidPathname, `/users/${string}`>>>(true);
    expectTypeOf<Assert<IsEqual<OptionalMinPathname, '/products' | `/products/${number}`>>>(true);

    // @ts-expect-error numeric min params must infer number segments, not arbitrary strings.
    expectTypeOf<MinPathname>('/users/not-a-number');

    expect(true).toBe(true);
  });
  it('infers custom path constraint params as strings', () => {
    type ArticleParams = ParamsFromPattern<'/articles/{slug:slug}'>;
    type ArticlePathname = PathnameFromPattern<'/articles/{slug:slug}'>;
    type MixedParams = ParamsFromPattern<'/users/{id:int}/articles/{slug:slug}'>;

    expectTypeOf<Assert<IsEqual<ArticleParams, { readonly slug: string }>>>(true);
    expectTypeOf<Assert<IsEqual<ArticlePathname, `/articles/${string}`>>>(true);
    expectTypeOf<Assert<IsEqual<MixedParams, { readonly id: number; readonly slug: string }>>>(
      true,
    );
  });

  it('keeps pathless contract pathname as string while preserving normalize literals', () => {
    interface Search {
      readonly page: number;
    }

    if (false) {
      const contract = undefined as unknown as UrlContract<
        'pathless',
        string,
        EmptyParams,
        Search,
        undefined
      >;
      const parsed = contract.parse('/products?page=2');
      const normalized = contract.normalize({ pathname: '/products', search: { page: 2 } });
      const normalizedWithoutPathname = contract.normalize({ search: { page: 2 } });

      expectTypeOf<string>(parsed.pathname);
      expectTypeOf<'/products'>(normalized.pathname);
      expectTypeOf<string>(normalizedWithoutPathname.pathname);
    }

    expect(true).toBe(true);
  });
});
