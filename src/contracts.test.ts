import { describe, expect, expectTypeOf, it } from 'vitest';
import type {
  BuildSearchOptions,
  BuildUrlOptions,
  EmptyParams,
  NormalizeUrlState,
  ParseRequestOptions,
  PatchSearchOptions,
  PathBasedBuildInput,
  PathBasedNormalizeInput,
  PathBuildMethod,
  PathlessBuildInput,
  PathlessNormalizeInput,
  UnknownSearchParams,
  UrlBuildInput,
  UrlMode,
  UrlNormalizeInput,
  UrlSafeNormalizeResult,
  UrlSafeParseResult,
  UrlState,
} from './contracts.js';

describe('shared contracts', () => {
  it('models common URL state and options', () => {
    const mode: UrlMode = 'path';
    const state: UrlState<'/users/1', { id: number }, { tab?: string }, string | undefined> = {
      pathname: '/users/1',
      params: { id: 1 },
      search: { tab: 'profile' },
      hash: undefined,
    };
    const unknownSearch: UnknownSearchParams = {
      debug: 'true',
      tag: ['a', 'b'],
    };
    const buildOptions: BuildUrlOptions = { defaults: 'omit' };
    const searchOptions: BuildSearchOptions = {
      ...buildOptions,
      arrayFormat: 'repeat',
      sortKeys: true,
    };
    const patchOptions: PatchSearchOptions = {
      ...searchOptions,
      removeNull: true,
      removeUndefined: true,
    };
    const requestOptions: ParseRequestOptions = {
      unknownSearch: 'strip',
      baseUrl: 'https://example.com',
    };

    expect(mode).toBe('path');
    expect(state.pathname).toBe('/users/1');
    expect(unknownSearch.debug).toBe('true');
    expect(patchOptions.removeNull).toBe(true);
    expect(requestOptions.baseUrl).toBe('https://example.com');
  });

  it('models path-based build and normalize inputs with params', () => {
    interface Params {
      readonly id: number;
    }

    interface Search {
      readonly tab: string;
    }

    const buildInput: PathBasedBuildInput<Params, Search, undefined> = {
      params: { id: 1 },
      search: { tab: 'profile' },
    };
    const normalizeInput: PathBasedNormalizeInput<Params, Search, undefined> = buildInput;

    expectTypeOf<UrlBuildInput<'path', Params, Search, undefined>>(buildInput);
    expectTypeOf<UrlNormalizeInput<'path', Params, Search, undefined>>(normalizeInput);
    expect(buildInput.params.id).toBe(1);

    const invalidBuildInput = {
      pathname: '/users/1',
      params: { id: 1 },
    };

    // @ts-expect-error path-based contracts do not accept pathname input for build.
    expectTypeOf<UrlBuildInput<'path', Params, Search, undefined>>(invalidBuildInput);
  });

  it('models path-based build and normalize inputs without params', () => {
    interface Search {
      readonly q: string;
    }

    const buildInput: PathBasedBuildInput<EmptyParams, Search, undefined> = {
      search: { q: 'router' },
    };
    const normalizeInput: PathBasedNormalizeInput<EmptyParams, Search, undefined> = buildInput;

    expectTypeOf<UrlBuildInput<'path', EmptyParams, Search, undefined>>(buildInput);
    expectTypeOf<UrlNormalizeInput<'path', EmptyParams, Search, undefined>>(normalizeInput);
    expect(buildInput.search?.q).toBe('router');
  });

  it('models pathless build and normalize inputs', () => {
    interface Search {
      readonly page: number;
    }

    const buildInput: PathlessBuildInput<Search, string | undefined> = {
      pathname: '/products',
      search: { page: 2 },
      hash: 'details',
    };
    const normalizeInput: PathlessNormalizeInput<Search, string | undefined> = buildInput;

    expectTypeOf<UrlBuildInput<'pathless', EmptyParams, Search, string | undefined>>(buildInput);
    expectTypeOf<UrlNormalizeInput<'pathless', EmptyParams, Search, string | undefined>>(
      normalizeInput,
    );
    expect(buildInput.pathname).toBe('/products');

    const invalidPathlessInput = {
      params: {},
      search: { page: 2 },
    };

    expectTypeOf<UrlBuildInput<'pathless', EmptyParams, Search, string | undefined>>(
      // @ts-expect-error pathless contracts do not accept params.
      invalidPathlessInput,
    );
  });

  it('preserves literal pathname for pathless normalized state', () => {
    type State = NormalizeUrlState<
      'pathless',
      string,
      EmptyParams,
      { readonly page: number },
      undefined,
      { readonly pathname: '/products'; readonly search: { readonly page: 2 } }
    >;

    const state: State = {
      pathname: '/products',
      params: {},
      search: { page: 2 },
      hash: undefined,
    };

    expectTypeOf<'/products'>(state.pathname);
    expect(state.pathname).toBe('/products');
  });

  it('models path build methods by param presence', () => {
    interface Params {
      readonly id: number;
    }

    const withParams: PathBuildMethod<Params> = (params) => `/users/${params.id}`;
    const withoutParams: PathBuildMethod<EmptyParams> = () => '/search';

    expect(withParams({ id: 1 })).toBe('/users/1');
    expect(withoutParams()).toBe('/search');
  });

  it('models safe parse and safe normalize results', () => {
    const parseResult: UrlSafeParseResult<'/users/1', { id: number }, EmptyParams, undefined> = {
      success: true,
      data: {
        pathname: '/users/1',
        params: { id: 1 },
        search: {},
        hash: undefined,
      },
    };

    const normalizeResult: UrlSafeNormalizeResult<
      'path',
      '/users/1',
      { id: number },
      EmptyParams,
      undefined,
      { readonly params: { readonly id: number } }
    > = parseResult;

    expect(parseResult.success).toBe(true);
    expect(normalizeResult.data.params.id).toBe(1);
  });
});
