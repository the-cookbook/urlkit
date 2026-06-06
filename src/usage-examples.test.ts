import { describe, expect, it } from 'vitest';
import { href, matches, doesNotMatch, parsed as basicParsed } from '../examples/basic-usage.js';
import {
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
  articleHref,
  articleState,
  compiledStaticUrl as customCompiledStaticUrl,
  invalidArticle,
  productState,
  routeState as customRouteState,
} from '../examples/custom-path-constraints.js';
import { requestLikeState, requestState, safeRequest } from '../examples/server-request.js';
import {
  articleUrlMatches,
  brokenArticleStates,
  brokenArticleUrls,
  brokenStaticDescriptors,
  builtArticleUrl,
  builtSearch,
  defaultedHashHref,
  defaultedHashState,
  invalidRawState,
  listingPath,
  listingSuffix,
  omittedSearch,
  partialHash,
  partialRawState,
  partiallyParsedSearch,
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
import { compiledSearch, compiledUrl } from '../examples/static-descriptor.js';
import {
  built as objectBuilt,
  collisionSafe,
  parsed as objectParsed,
} from '../examples/object-search.js';
import { customDateHref, reportHref, reportState } from '../examples/date-search.js';
import {
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

describe('usage examples', () => {
  it('executes the basic path-based usage example', () => {
    expect(basicParsed.params.id).toBe(42);
    expect(href).toBe('/users/42?tab=settings&page=3#show');
    expect(matches).toBe(true);
    expect(doesNotMatch).toBe(false);
  });

  it('executes the search filters example', () => {
    expect(productFilterState.pathname).toBe('/products');
    expect(productFilterState.search.tags).toEqual(['sale', 'leather']);
    expect(productFilterState.search.inStock).toBe(true);

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

    expect(commaSuffix).toBe('?tags=sale%2Cleather');
    expect(repeatedSuffix).toBe('?tags=sale&tags=leather');

    expect(searchOnlySuffix).toBe('?page=2');
  });

  it('executes the custom path constraints example', () => {
    expect(articleState.params.slug).toBe('urlkit-custom-path-constraints');
    expect(articleHref).toBe('/articles/urlkit-custom-path-constraints');
    expect(invalidArticle.success).toBe(false);
    expect(productState.params.sku).toBe('sku-42');
    expect(customCompiledStaticUrl.path?.parsePathname('/docs/custom-paths')).toEqual({
      slug: 'custom-paths',
    });
    expect(customRouteState.params.slug).toBe('router-runtime-path-constraints');
  });

  it('executes the server request example', () => {
    expect(requestState.params.id).toBe(42);
    expect(requestLikeState.search.page).toBe(3);
    expect(safeRequest.success).toBe(false);
  });

  it('executes the router-runtime example', () => {
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
      '?category=engineering&page=3&ref=newsletter&tag=ts&tag=url&sort=popular&featured=true&score=9.5&publishedOn=02-06-2026&scheduledAt=02-06-2026+12%3A30%3A05',
    );
    expect(patchedSearch).toBe('?category=engineering&page=4&ref=email&tag=ts&sort=newest');
    expect(replacedSearch).toBe('?category=engineering&page=1&sort=newest');
    expect(omittedSearch).toBe('?category=engineering&page=2&tag=ts');
    expect(pickedSearch).toBe('?page=2&tag=ts');

    expect(parsedArticleUrl.search.sort).toBe('popular');
    expect(safeParsedArticleUrl.success).toBe(true);
    expect(parsedArticleRequest.params.id).toBe(42);
    expect(safeParsedArticleRequest.success).toBe(true);
    expect(safeNormalizedArticleUrl.success).toBe(true);
    expect(builtArticleUrl).toBe(
      '/articles/42?category=engineering&page=2&ref=newsletter&tag=ts&tag=urlkit&sort=popular&featured=true&score=9.5&publishedOn=06-06-2026&scheduledAt=06-06-2026+10%3A30%3A00#comments',
    );
    expect(articleUrlMatches).toBe(true);
    expect(strippedUnknownSearch.unknownSearch).toBeUndefined();
    expect(preservedUnknownSearch.unknownSearch).toEqual({ utm_source: 'kept' });
    expect(unknownSearchError.success).toBe(false);
    expect(listingSuffix).toBe('?page=2&tag=typescript&tag=urlkit#results');
    expect(listingPath).toBe('/articles?page=2&tag=typescript&tag=urlkit#results');
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
    expect(compiledSearch).toBeDefined();
    expect(compiledUrl.pattern).toBe('/products/{id:int}');
  });

  it('executes the object search example', () => {
    expect(objectParsed.search.filter['user.name']).toBe('Ada');
    expect(objectParsed.search.filter['literal~key']).toBe('value');
    expect(objectParsed.search.filter['path~id']).toBe('abc');
    expect(objectBuilt).toBe(
      '?filter.role=admin&filter.active=true&filter.profile.city=Berlin&filter.user%7E1name=Ada&filter.literal%7E0key=value&filter.path%7E0id=abc',
    );
    expect(collisionSafe.success).toBe(false);
  });

  it('executes the date search example', () => {
    expect(reportState.search.day.toISOString()).toBe('2026-06-02T00:00:00.000Z');
    expect(reportHref).toBe(
      '?day=2026-06-02&publishedAt=2026-06-02T12%3A30%3A00.000Z&importedAtSeconds=1780403400&importedAtMs=1780403400000',
    );
    expect(customDateHref).toBe('?from=02-06-2026&at=02-06-2026+12%3A30%3A05');
  });

  it('executes the error handling and defaults example', () => {
    expect(parsed.success).toBe(false);
    expect(normalized.success).toBe(false);
    expect(withDefaults.search.page).toBe(1);
    expect(normalizedDefaults.search.page).toBe(1);
    expect(explicitDefault).toBe('/users/42?page=1');
    expect(omittedDefault).toBe('/users/42');
  });
});
