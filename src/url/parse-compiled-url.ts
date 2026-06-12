import type { ParseUrlOptions, UrlState, UnknownSearchBehavior } from '../contracts.js';
import { readHashFragment } from '../hash/hash-fragment.js';
import { parseCompiledSearch } from '../search/parse-compiled-search.js';
import { parseRawSearch } from '../search/parse-raw-search.js';
import { parseUrl } from './parse-url.js';
import { resolveUrlUnknownSearch } from './resolve-url-unknown-search.js';
import type { CompiledUrlDescriptor } from './compile-url-descriptor.js';
import { markUrlState } from './url-state-brand.js';
import { UrlKitError } from '../errors/url-kit-error.js';

interface ParsedUrlPath<Params> {
  readonly pathname: string;
  readonly params: Params;
}

export function parseCompiledUrl<Pathname, Params, Search, Hash>(
  input: string | URL,
  compiled: CompiledUrlDescriptor,
  unknownSearch: UnknownSearchBehavior,
  options: ParseUrlOptions = {},
): UrlState<Pathname, Params, Search, Hash> {
  const parsedUrl = parseUrl(input);
  const pathResult = parseUrlPath<Params>(parsedUrl.pathname, compiled, options);
  const searchResult = parseUrlSearch<Search>(
    parsedUrl.searchParams,
    compiled,
    unknownSearch,
    options,
  );
  const hash = parseUrlHash<Hash>(parsedUrl.hash, compiled);

  const state = {
    pathname: pathResult.pathname as Pathname,
    params: pathResult.params,
    search: searchResult.search,
    hash,
    ...(searchResult.unknownSearch ? { unknownSearch: searchResult.unknownSearch } : {}),
  } satisfies UrlState<Pathname, Params, Search, Hash>;

  return Object.freeze(markUrlState(state));
}

function parseUrlPath<Params>(
  pathname: string,
  compiled: CompiledUrlDescriptor,
  options: ParseUrlOptions,
): ParsedUrlPath<Params> {
  if (compiled.mode === 'path' && compiled.path) {
    const result = compiled.path.matchPathname(pathname, {
      ...options,
      strict: options.strict ?? true,
    });

    if (!result.match) {
      throw new UrlKitError('path-mismatch', 'Pathname does not match the URL pattern.', {
        path: ['pathname'],
      });
    }

    return Object.freeze({
      pathname: result.path,
      params: result.params as Params,
    });
  }

  return Object.freeze({
    pathname,
    params: Object.freeze({}) as Params,
  });
}

function parseUrlSearch<Search>(
  searchParams: URLSearchParams,
  compiled: CompiledUrlDescriptor,
  unknownSearch: UnknownSearchBehavior,
  options: Pick<ParseUrlOptions, 'arrayFormat' | 'invalidSearch'>,
): Pick<UrlState<string, {}, Search, undefined>, 'search' | 'unknownSearch'> {
  const rawSearch = parseRawSearch(searchParams);

  if (compiled.search) {
    return parseCompiledSearch(rawSearch, compiled.search, unknownSearch, options) as Pick<
      UrlState<string, {}, Search, undefined>,
      'search' | 'unknownSearch'
    >;
  }

  const unknown = resolveUrlUnknownSearch(rawSearch, unknownSearch);

  return Object.freeze({
    search: Object.freeze({}) as Search,
    ...(unknown ? { unknownSearch: unknown } : {}),
  });
}

function parseUrlHash<Hash>(hash: string, compiled: CompiledUrlDescriptor): Hash {
  if (!compiled.hash) {
    return undefined as Hash;
  }

  return compiled.hash.parse(readHashFragment(hash)) as Hash;
}
