import type { UrlState, UnknownSearchBehavior } from '../contracts.js';
import { readHashFragment } from '../hash/hash-fragment.js';
import { parseCompiledSearch } from '../search/parse-compiled-search.js';
import { parseRawSearch } from '../search/parse-raw-search.js';
import { parseUrl } from './parse-url.js';
import { resolveUrlUnknownSearch } from './resolve-url-unknown-search.js';
import type { CompiledUrlDescriptor } from './compile-url-descriptor.js';
import { markUrlState } from './url-state-brand.js';

export function parseCompiledUrl<Pathname, Params, Search, Hash>(
  input: string | URL,
  compiled: CompiledUrlDescriptor,
  unknownSearch: UnknownSearchBehavior,
): UrlState<Pathname, Params, Search, Hash> {
  const parsedUrl = parseUrl(input);
  const params = parseUrlParams<Params>(parsedUrl.pathname, compiled);
  const searchResult = parseUrlSearch<Search>(parsedUrl.searchParams, compiled, unknownSearch);
  const hash = parseUrlHash<Hash>(parsedUrl.hash, compiled);

  const state = {
    pathname: parsedUrl.pathname as Pathname,
    params,
    search: searchResult.search,
    hash,
    ...(searchResult.unknownSearch ? { unknownSearch: searchResult.unknownSearch } : {}),
  } satisfies UrlState<Pathname, Params, Search, Hash>;

  return Object.freeze(markUrlState(state));
}

function parseUrlParams<Params>(pathname: string, compiled: CompiledUrlDescriptor): Params {
  if (compiled.mode === 'path' && compiled.path) {
    return compiled.path.parsePathname(pathname) as Params;
  }

  return Object.freeze({}) as Params;
}

function parseUrlSearch<Search>(
  searchParams: URLSearchParams,
  compiled: CompiledUrlDescriptor,
  unknownSearch: UnknownSearchBehavior,
): Pick<UrlState<string, {}, Search, undefined>, 'search' | 'unknownSearch'> {
  const rawSearch = parseRawSearch(searchParams);

  if (compiled.search) {
    return parseCompiledSearch(rawSearch, compiled.search, unknownSearch) as Pick<
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
