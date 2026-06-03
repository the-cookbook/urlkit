import type { BuildUrlOptions, UrlBuildInput } from '../contracts.js';
import { UrlKitError } from '../errors/url-kit-error.js';
import { buildHash } from '../hash/build-hash.js';
import { buildCompiledSearch } from '../search/build-compiled-search.js';
import type { CompiledUrlDescriptor } from './compile-url-descriptor.js';
import { isUrlState } from './url-state-brand.js';

export function buildCompiledUrl<
  Mode extends 'path' | 'pathless',
  Params,
  Search,
  Hash,
  SearchInput = Partial<Search>,
  HashInput = Hash,
>(
  input: UrlBuildInput<Mode, Params, Search, Hash, SearchInput, HashInput>,
  compiled: CompiledUrlDescriptor<Mode>,
  options: BuildUrlOptions = {},
): string {
  if (!isRecord(input)) {
    throw new UrlKitError('invalid-url', 'URL build input must be an object.', { path: [] });
  }

  const pathname = buildUrlPathname(input, compiled);
  const search = buildUrlSearch(input.search, compiled, options);
  const hash = buildUrlHash(input.hash, compiled, options);

  return `${pathname}${search}${hash}`;
}

function buildUrlPathname(
  input: Readonly<Record<string, unknown>>,
  compiled: CompiledUrlDescriptor,
): string {
  if (compiled.mode === 'path') {
    if (input.pathname !== undefined && !isUrlState(input)) {
      throw new UrlKitError(
        'invalid-url',
        'Path-based URL build input must not include pathname.',
        { path: ['pathname'] },
      );
    }

    if (!compiled.path) {
      throw new UrlKitError(
        'invalid-descriptor',
        'Path URL descriptor is missing a compiled path.',
        { path: ['path'] },
      );
    }

    return (compiled.path.buildPath as (params?: unknown) => string)(input.params);
  }

  if (input.params !== undefined && !isUrlState(input)) {
    throw new UrlKitError('invalid-url', 'Pathless URL build input must not include params.', {
      path: ['params'],
    });
  }

  if (input.pathname === undefined) {
    return '';
  }

  if (typeof input.pathname !== 'string') {
    throw new UrlKitError('invalid-url', 'Pathless pathname must be a string.', {
      path: ['pathname'],
    });
  }

  return input.pathname;
}

function buildUrlSearch(
  input: unknown,
  compiled: CompiledUrlDescriptor,
  options: BuildUrlOptions,
): string {
  if (input === undefined) {
    return compiled.search ? buildCompiledSearch({}, compiled.search, options) : '';
  }

  if (!isRecord(input)) {
    throw new UrlKitError('invalid-search', 'URL search input must be an object.', {
      path: ['search'],
    });
  }

  if (!compiled.search) {
    return '';
  }

  return buildCompiledSearch(input, compiled.search, options);
}

function buildUrlHash(
  input: unknown,
  compiled: CompiledUrlDescriptor,
  options: BuildUrlOptions,
): string {
  if (compiled.hash) {
    return buildHash(input, compiled.hash.descriptor, options);
  }

  if (input !== undefined && input !== null) {
    throw new UrlKitError('invalid-hash', 'Hash is not declared for this URL contract.', {
      path: ['hash'],
    });
  }

  return '';
}

function isRecord(input: unknown): input is Readonly<Record<string, unknown>> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}
