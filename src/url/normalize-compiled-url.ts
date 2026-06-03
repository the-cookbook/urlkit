import type { NormalizeUrlState, UnknownSearchBehavior, UrlState } from '../contracts.js';
import { UrlKitError } from '../errors/url-kit-error.js';
import { normalizeCompiledSearch } from '../search/normalize-compiled-search.js';
import type { CompiledUrlDescriptor } from './compile-url-descriptor.js';
import { markUrlState } from './url-state-brand.js';

export function normalizeCompiledUrl<
  Mode extends 'path' | 'pathless',
  Pathname,
  Params,
  Search,
  Hash,
  Input,
>(
  input: Input,
  compiled: CompiledUrlDescriptor<Mode>,
  unknownSearch: UnknownSearchBehavior,
): NormalizeUrlState<Mode, Pathname, Params, Search, Hash, Input> {
  if (!isRecord(input)) {
    throw new UrlKitError('invalid-url', 'URL state must be an object.', { path: [] });
  }

  const pathnameAndParams = normalizePathnameAndParams<Pathname, Params>(input, compiled);
  const searchResult = normalizeCompiledSearch(input.search, compiled.search, unknownSearch);
  const hash = normalizeUrlHash<Hash>(input.hash, compiled);

  const state = {
    pathname: pathnameAndParams.pathname,
    params: pathnameAndParams.params,
    search: searchResult.search as Search,
    hash,
    ...(searchResult.unknownSearch ? { unknownSearch: searchResult.unknownSearch } : {}),
  };

  return Object.freeze(markUrlState(state)) as NormalizeUrlState<
    Mode,
    Pathname,
    Params,
    Search,
    Hash,
    Input
  >;
}

function normalizePathnameAndParams<Pathname, Params>(
  input: Readonly<Record<string, unknown>>,
  compiled: CompiledUrlDescriptor,
): Pick<UrlState<Pathname, Params, {}, undefined>, 'pathname' | 'params'> {
  if (compiled.mode === 'path') {
    if (input.pathname !== undefined) {
      throw new UrlKitError('invalid-url', 'Path-based URL state must not include pathname.', {
        path: ['pathname'],
      });
    }

    if (!compiled.path) {
      throw new UrlKitError(
        'invalid-descriptor',
        'Path URL descriptor is missing a compiled path.',
        { path: ['path'] },
      );
    }

    const pathname = (compiled.path.buildPath as (params?: unknown) => string)(
      input.params,
    ) as Pathname;
    const params = compiled.path.parsePathname(String(pathname)) as Params;

    return Object.freeze({ pathname, params });
  }

  if (input.params !== undefined) {
    throw new UrlKitError('invalid-url', 'Pathless URL state must not include params.', {
      path: ['params'],
    });
  }

  return Object.freeze({
    pathname: normalizePathlessPathname(input.pathname) as Pathname,
    params: Object.freeze({}) as Params,
  });
}

function normalizePathlessPathname(pathname: unknown): string {
  if (pathname === undefined) {
    return '';
  }

  if (typeof pathname !== 'string') {
    throw new UrlKitError('invalid-url', 'Pathless pathname must be a string.', {
      path: ['pathname'],
    });
  }

  return pathname;
}

function normalizeUrlHash<Hash>(input: unknown, compiled: CompiledUrlDescriptor): Hash {
  if (compiled.hash) {
    return compiled.hash.normalize(input) as Hash;
  }

  if (input !== undefined && input !== null) {
    throw new UrlKitError('invalid-hash', 'Hash is not declared for this URL contract.', {
      path: ['hash'],
    });
  }

  return undefined as Hash;
}

function isRecord(input: unknown): input is Readonly<Record<string, unknown>> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}
