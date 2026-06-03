import { describe, expect, it } from 'vitest';
import { href, matches, doesNotMatch, parsed as basicParsed } from '../examples/basic-usage.js';
import {
  commaParsed,
  commaSuffix,
  compactDefaults,
  fullPath,
  preserved,
  rejectedUnknown,
  repeatedSuffix,
  searchOnlySuffix,
  state,
  suffix,
} from '../examples/search-filters.js';
import { requestLikeState, requestState, safeRequest } from '../examples/server-request.js';
import {
  builtSearch,
  omittedSearch,
  parsedSearch,
  parsedState,
  patchedSearch,
  pickedSearch,
  rawState,
  replacedSearch,
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

describe('usage examples', () => {
  it('executes the basic path-based usage example', () => {
    expect(basicParsed.params.id).toBe(42);
    expect(href).toBe('/users/42?tab=settings&page=3#show');
    expect(matches).toBe(true);
    expect(doesNotMatch).toBe(false);
  });

  it('executes the search filters example', () => {
    expect(suffix).toBe('?page=2&sort=popular&tags=sale&tags=leather&inStock=true');
    expect(fullPath).toBe(
      '/products?q=shoes&page=2&sort=popular&tags=sale&tags=leather&inStock=true',
    );
    expect(compactDefaults).toBe('/products');
    expect(preserved.unknownSearch).toEqual({ debug: 'true' });
    expect(rejectedUnknown.success).toBe(false);
    expect(searchOnlySuffix).toBe('?page=2');
    expect(commaSuffix).toBe('?tags=sale%2Cleather');
    expect(repeatedSuffix).toBe('?tags=sale&tags=leather');
    expect(commaParsed).toEqual({
      success: true,
      data: {
        hash: undefined,
        params: {},
        pathname: '/products',
        search: {
          tags: ['sale', 'leather'],
        },
      },
    });

    expect(state).toEqual({
      hash: undefined,
      params: {},
      pathname: '/products',
      search: {
        q: 'shoes',
        inStock: true,
        page: 2,
        sort: 'popular',
        tags: ['sale', 'leather'],
      },
    });
  });

  it('executes the server request example', () => {
    expect(requestState.params.id).toBe(42);
    expect(requestLikeState.search.page).toBe(3);
    expect(safeRequest.success).toBe(false);
  });

  it('executes the router-runtime example', () => {
    expect(rawState.params.id).toBe('42');
    expect(parsedState.params.id).toBe(42);
    expect(parsedSearch).toEqual({ page: 2, ref: 'email', tag: ['ts', 'url'] });
    expect(builtSearch).toBe('?page=3&ref=newsletter&tag=ts&tag=url');
    expect(patchedSearch).toBe('?page=4&ref=email&tag=ts');
    expect(replacedSearch).toBe('?page=1');
    expect(omittedSearch).toBe('?page=2&tag=ts');
    expect(pickedSearch).toBe('?page=2&tag=ts');
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
    expect(customDateHref).toBe('?from=02-06-2026');
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
