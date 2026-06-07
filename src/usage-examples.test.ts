import { readdirSync } from 'node:fs';
import { basename, extname } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  UserUrl,
  href,
  matches,
  doesNotMatch,
  parsed as basicParsed,
} from '../examples/basic-usage.js';
import {
  CommaProductFilters,
  FilterSearchOnly,
  ProductFilters as SearchProductFilters,
  commaParsed,
  commaSuffix,
  compactDefaults,
  fullPath,
  normalized as normalizedFilters,
  preserved,
  rejectedUnknown,
  repeatedSuffix,
  searchOnlySuffix,
  state as productFilterState,
  suffix,
} from '../examples/search-filters.js';
import {
  ArticleUrl as CustomArticleUrl,
  ProductUrl as CustomProductUrl,
  articleHref,
  articleState,
  compiledStaticUrl as customCompiledStaticUrl,
  invalidArticle,
  productState,
  routeState as customRouteState,
  routeUrl as customRouteUrl,
  slugConstraint,
} from '../examples/custom-path-constraints.js';
import {
  UserRequestUrl,
  requestLikeState,
  requestState,
  safeRequest,
} from '../examples/server-request.js';
import {
  ArticleUrlParsedParams,
  ArticleUrlRawParams,
  DefaultedHashUrl,
  ListingUrl,
  articleRouteUrlDescriptor,
  articleUrlMatches,
  brokenArticleStates,
  brokenArticleUrls,
  brokenStaticDescriptors,
  builtArticleUrl,
  builtSearch,
  defaultedHashHref,
  defaultedHashUrlDescriptor,
  defaultedHashState,
  invalidRawState,
  listingUrlDescriptor,
  listingPath,
  listingSuffix,
  omittedSearch,
  partialHash,
  partialRawState,
  partiallyParsedSearch,
  normalizedArticleUrl,
  parsedArticleRequest,
  parsedArticleUrl,
  parsedSearch,
  parsedState,
  patchedSearch,
  pickedSearch,
  preservedUnknownSearch,
  rawState,
  replacedSearch,
  safeNormalizedArticleUrl,
  safeParsedArticleRequest,
  safeParsedArticleUrl,
  strippedUnknownSearch,
  unknownSearchError,
} from '../examples/router-runtime.js';
import {
  ProductFilters,
  parsedFilters,
  filtersHref,
  filtersParses,
  filtersDoesNotParse,
} from '../examples/pathless-url.js';
import {
  compiledSearch,
  compiledUrl,
  productSearchDescriptor,
  productUrlDescriptor,
} from '../examples/static-descriptor.js';
import {
  UserFilters,
  built as objectBuilt,
  collisionSafe,
  parsed as objectParsed,
} from '../examples/object-search.js';
import {
  EuropeanDateSearch,
  Reports,
  customDateHref,
  reportHref,
  reportState,
} from '../examples/date-search.js';
import {
  UserUrl as ErrorHandlingUserUrl,
  explicitDefault,
  normalized,
  normalizedDefaults,
  omittedDefault,
  parsed,
  withDefaults,
} from '../examples/error-handling.js';

interface ExpectedSafeFailure {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly path?: readonly string[];
  };
}

const expectSafeFailure = (
  result: {
    readonly success: boolean;
    readonly error?: { readonly code: string; readonly path?: readonly string[] };
  },
  code: string,
  path?: readonly string[],
): void => {
  expect(result.success).toBe(false);

  const failure = result as ExpectedSafeFailure;
  expect(failure.error.code).toBe(code);

  if (path) {
    expect(failure.error.path).toEqual(path);
  }
};

const coveredTopLevelUsageExamples = Object.freeze([
  'basic-usage.ts',
  'custom-path-constraints.ts',
  'date-search.ts',
  'error-handling.ts',
  'object-search.ts',
  'pathless-url.ts',
  'router-runtime.ts',
  'search-filters.ts',
  'server-request.ts',
  'static-descriptor.ts',
]);

function topLevelUsageExampleFiles(): readonly string[] {
  return readdirSync(new URL('../examples', import.meta.url))
    .filter((entry) => extname(entry) === '.ts')
    .map((entry) => basename(entry))
    .sort();
}

describe('usage examples', () => {
  it('covers every top-level TypeScript example module', () => {
    expect(topLevelUsageExampleFiles()).toEqual([...coveredTopLevelUsageExamples].sort());
  });

  it('executes the basic path-based usage example', () => {
    expect(UserUrl.parse('/users/42?page=2').hash).toBe('show');
    expect(basicParsed.pathname).toBe('/users/42');
    expect(basicParsed.params.id).toBe(42);
    expect(href).toBe('/users/42?tab=settings&page=3#show');
    expect(matches).toBe(true);
    expect(doesNotMatch).toBe(false);
  });

  it('executes the search filters example', () => {
    expect(productFilterState.pathname).toBe('/products');
    expect(productFilterState.search.tags).toEqual(['sale', 'leather']);
    expect(productFilterState.search.inStock).toBe(true);
    expect(SearchProductFilters.match('/products?page=2&sort=popular')).toBe(true);

    expect(suffix).toBe('?page=2&sort=popular&tags=sale&tags=leather&inStock=true');
    expect(fullPath).toBe(
      '/products?q=shoes&page=2&sort=popular&tags=sale&tags=leather&inStock=true',
    );
    expect(compactDefaults).toBe('/products');

    expect(normalizedFilters.search.page).toBe(1);
    expect(normalizedFilters.search.inStock).toBe(false);

    expect(preserved.unknownSearch).toEqual({ debug: 'true' });
    expect(rejectedUnknown.success).toBe(false);

    expect(commaParsed.success).toBe(true);
    if (commaParsed.success) {
      expect(commaParsed.data.search.tags).toEqual(['sale', 'leather']);
    }

    expect(CommaProductFilters.parse('/products?tags=sale%2Cleather').search.tags).toEqual([
      'sale',
      'leather',
    ]);
    expect(commaSuffix).toBe('?tags=sale%2Cleather');
    expect(repeatedSuffix).toBe('?tags=sale&tags=leather');

    expect(FilterSearchOnly.parseSearch('?page=2')).toEqual({ page: 2 });
    expect(searchOnlySuffix).toBe('?page=2');
  });

  it('executes the custom path constraints example', () => {
    expect(CustomArticleUrl.match('/articles/urlkit-custom-path-constraints')).toBe(true);
    expect(articleState.params.slug).toBe('urlkit-custom-path-constraints');
    expect(articleHref).toBe('/articles/urlkit-custom-path-constraints');
    expect(invalidArticle.success).toBe(false);
    expect(CustomProductUrl.build({ params: { sku: 'sku-42' } })).toBe('/products/sku-42');
    expect(productState.params.sku).toBe('sku-42');
    expect(customCompiledStaticUrl.path?.parsePathname('/docs/custom-paths')).toEqual({
      slug: 'custom-paths',
    });
    expect(customRouteUrl.build({ params: { slug: 'router-runtime-path-constraints' } })).toBe(
      '/blog/router-runtime-path-constraints',
    );
    expect(slugConstraint.toRegExp('')).toBe('[a-z0-9-]+');
    expect(customRouteState.params.slug).toBe('router-runtime-path-constraints');
  });

  it('executes pathless url example', () => {
    expect(parsedFilters).toEqual({
      pathname: '/products/42',
      params: {},
      search: {
        categories: ['gadgets'],
        sortBy: 'priceAsc',
      },
      hash: undefined,
    });
    expect(filtersHref).toBe('?categories=books&sortBy=recommendation');
    expect(filtersParses).toEqual(
      expect.objectContaining({
        hash: undefined,
        search: {
          categories: ['electronics'],
        },
      }),
    );
    expect(filtersDoesNotParse).toEqual(
      expect.objectContaining({
        hash: undefined,
        search: {},
      }),
    );
    expect(
      ProductFilters.safeParse('/products?tab=settings', { unknownSearch: 'error' }).success,
    ).toBe(false);
  });

  it('executes the server request example', () => {
    expect(UserRequestUrl.build({ params: { id: 42 }, search: { page: 2 } })).toBe(
      '/users/42?page=2',
    );
    expect(requestState.params.id).toBe(42);
    expect(requestLikeState.search.page).toBe(3);
    expect(safeRequest.success).toBe(false);
  });

  it('executes the router-runtime example', () => {
    expect(articleRouteUrlDescriptor.path).toBe('/articles/{id:int}');
    expect(ArticleUrlRawParams.parse('/articles/42?category=engineering').params.id).toBe('42');
    expect(ArticleUrlParsedParams.parse('/articles/42?category=engineering').params.id).toBe(42);
    expect(rawState.params.id).toBe('42');
    expect(parsedState.params.id).toBe(42);
    expect(parsedSearch).toEqual({
      category: 'engineering',
      page: 2,
      ref: 'email',
      tag: ['ts', 'url'],
      sort: 'popular',
      featured: true,
      score: 9.5,
      publishedOn: new Date('2026-06-02T00:00:00.000Z'),
      scheduledAt: new Date('2026-06-02T12:30:05.000Z'),
    });
    expect(partiallyParsedSearch).toEqual({
      category: 'engineering',
      page: 2,
      ref: 'email',
      tag: ['ts', 'url'],
      sort: 'newest',
      publishedOn: new Date('2026-06-02T00:00:00.000Z'),
    });
    expect(invalidRawState.success).toBe(false);
    expect(partialRawState.success).toBe(true);
    if (partialRawState.success) {
      expect(partialRawState.data.search).toEqual({
        category: 'engineering',
        page: 2,
        ref: 'email',
        tag: ['ts', 'url'],
        sort: 'newest',
        publishedOn: new Date('2026-06-02T00:00:00.000Z'),
      });
    }
    expect(partialHash).toBeUndefined();
    expect(builtSearch).toBe(
      '?category=engineering&page=3&ref=newsletter&tag=ts&tag=url&sort=popular&featured=true&score=9.5&publishedOn=02-06-2026&scheduledAt=02-06-2026T12%3A30%3A05Z',
    );
    expect(patchedSearch).toBe('?category=engineering&page=4&ref=email&tag=ts&sort=newest');
    expect(replacedSearch).toBe('?category=engineering&page=1&sort=newest');
    expect(omittedSearch).toBe('?category=engineering&page=2&tag=ts');
    expect(pickedSearch).toBe('?page=2&tag=ts');

    expect(parsedArticleUrl.search.sort).toBe('popular');
    expect(safeParsedArticleUrl.success).toBe(true);
    expect(parsedArticleRequest.params.id).toBe(42);
    expect(safeParsedArticleRequest.success).toBe(true);
    expect(normalizedArticleUrl.params.id).toBe(42);
    expect(safeNormalizedArticleUrl.success).toBe(true);
    expect(builtArticleUrl).toBe(
      '/articles/42?category=engineering&page=2&ref=newsletter&tag=ts&tag=urlkit&sort=popular&featured=true&score=9.5&publishedOn=06-06-2026&scheduledAt=06-06-2026T10%3A30%3A00Z#comments',
    );
    expect(articleUrlMatches).toBe(true);
    expect(strippedUnknownSearch.unknownSearch).toBeUndefined();
    expect(preservedUnknownSearch.unknownSearch).toEqual({ utm_source: 'kept' });
    expect(unknownSearchError.success).toBe(false);
    expect(listingUrlDescriptor.search?.page?.type).toBe('int');
    expect(ListingUrl.match('/articles?page=2#results')).toBe(true);
    expect(listingSuffix).toBe('?page=2&tag=typescript&tag=urlkit#results');
    expect(listingPath).toBe('/articles?page=2&tag=typescript&tag=urlkit#results');
    expect(defaultedHashUrlDescriptor.hash?.default).toBe('overview');
    expect(DefaultedHashUrl.match('/docs/intro')).toBe(true);
    expect(defaultedHashState.hash).toBe('overview');
    expect(defaultedHashHref).toBe('/docs/intro#overview');

    expectSafeFailure(brokenArticleUrls.pathMismatch, 'path-mismatch', ['pathname']);
    expectSafeFailure(brokenArticleUrls.invalidParam, 'invalid-param', ['params', 'id']);
    expectSafeFailure(brokenArticleUrls.missingRequiredSearch, 'missing-search', ['category']);
    expectSafeFailure(brokenArticleUrls.invalidIntSearch, 'invalid-search', ['page']);
    expectSafeFailure(brokenArticleUrls.invalidEnumSearch, 'invalid-search', ['sort']);
    expectSafeFailure(brokenArticleUrls.invalidBooleanSearch, 'invalid-search', ['featured']);
    expectSafeFailure(brokenArticleUrls.invalidDateSearch, 'invalid-search', ['publishedOn']);
    expectSafeFailure(brokenArticleUrls.invalidDateTimeSearch, 'invalid-search', ['scheduledAt']);
    expectSafeFailure(brokenArticleUrls.invalidHash, 'invalid-hash', ['hash']);
    expectSafeFailure(brokenArticleUrls.unknownSearchRejected, 'invalid-search', ['utm_source']);

    expectSafeFailure(brokenArticleStates.missingParam, 'missing-param', ['params', 'id']);
    expectSafeFailure(brokenArticleStates.invalidParam, 'invalid-param', ['params']);
    expectSafeFailure(brokenArticleStates.invalidSearch, 'invalid-search', ['page']);
    expectSafeFailure(brokenArticleStates.invalidHash, 'invalid-hash', ['hash']);

    expect(brokenStaticDescriptors.legacyValueField?.code).toBe('invalid-descriptor');
    expect(brokenStaticDescriptors.legacyValueField?.path).toEqual(['search', 'page']);
    expect(brokenStaticDescriptors.legacyManyField?.code).toBe('invalid-descriptor');
    expect(brokenStaticDescriptors.legacyManyField?.path).toEqual(['search', 'tag']);
    expect(brokenStaticDescriptors.legacyHashArray?.code).toBe('invalid-descriptor');
    expect(brokenStaticDescriptors.legacyHashArray?.path).toEqual(['hash']);
    expect(brokenStaticDescriptors.optionalWithDefault?.code).toBe('invalid-descriptor');
    expect(brokenStaticDescriptors.optionalWithDefault?.path).toEqual(['search', 'page']);
    expect(brokenStaticDescriptors.falseFlags?.code).toBe('invalid-descriptor');
    expect(brokenStaticDescriptors.falseFlags?.path).toEqual(['search', 'tag']);
  });

  it('executes the static descriptor example', () => {
    expect(productSearchDescriptor.page.type).toBe('int');
    expect(productUrlDescriptor.hash?.type).toBe('enum');
    expect(compiledSearch).toBeDefined();
    expect(compiledUrl.pattern).toBe('/products/{id:int}');
  });

  it('executes the object search example', () => {
    expect(UserFilters.parseSearch('?filter.role=admin')).toEqual({
      filter: { role: 'admin' },
    });
    expect(objectParsed.search.filter['user.name']).toBe('Ada');
    expect(objectParsed.search.filter['literal~key']).toBe('value');
    expect(objectParsed.search.filter['path~id']).toBe('abc');
    expect(objectBuilt).toBe(
      '?filter.role=admin&filter.active=true&filter.profile.city=Berlin&filter.user%7E1name=Ada&filter.literal%7E0key=value&filter.path%7E0id=abc',
    );
    expect(collisionSafe.success).toBe(false);
  });

  it('executes the date search example', () => {
    expect(Reports.parseSearch('?day=2026-06-02').day.toISOString()).toBe(
      '2026-06-02T00:00:00.000Z',
    );
    expect(reportState.search.day.toISOString()).toBe('2026-06-02T00:00:00.000Z');
    expect(reportHref).toBe(
      '?day=2026-06-02&publishedAt=2026-06-02T12%3A30%3A00.000Z&importedAtSeconds=1780403400&importedAtMs=1780403400000',
    );
    const customDateState = EuropeanDateSearch.parse(
      '/reports?from=02-06-2026&at=02-06-2026T12%3A30%3A05Z',
    );

    expect(customDateState.search.from.toISOString()).toBe('2026-06-02T00:00:00.000Z');
    expect(customDateState.search.at?.toISOString()).toBe('2026-06-02T12:30:05.000Z');
    expect(customDateHref).toBe('?from=02-06-2026&at=02-06-2026T12%3A30%3A05Z');
    expect(EuropeanDateSearch.safeParse('/reports?from=2026-06-02').success).toBe(false);
  });

  it('executes the error handling and defaults example', () => {
    expect(ErrorHandlingUserUrl.match('/users/42')).toBe(true);
    expect(parsed.success).toBe(false);
    expect(normalized.success).toBe(false);
    expect(withDefaults.search.page).toBe(1);
    expect(normalizedDefaults.search.page).toBe(1);
    expect(explicitDefault).toBe('/users/42?page=1');
    expect(omittedDefault).toBe('/users/42');
  });
});
