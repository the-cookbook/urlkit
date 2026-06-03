import type { BuildSearchOptions, PatchSearchOptions } from '../contracts.js';
import { buildSearch as buildRuntimeSearch } from '../search/build-search.js';
import { omitSearch as omitRuntimeSearch } from '../search/omit-search.js';
import { patchSearch as patchRuntimeSearch } from '../search/patch-search.js';
import { pickSearch as pickRuntimeSearch } from '../search/pick-search.js';
import { replaceSearch as replaceRuntimeSearch } from '../search/replace-search.js';
import { compileCachedStaticSearch } from './compile-cached-static-search.js';
import type { InferStaticSearch, StaticSearchDescriptor } from '../static/contracts.js';

export interface BuildRouteSearchOptions<
  SearchDescriptor = StaticSearchDescriptor,
> extends BuildSearchOptions {
  readonly schema?: SearchDescriptor;
}

export interface PatchRouteSearchOptions<
  SearchDescriptor = StaticSearchDescriptor,
> extends PatchSearchOptions {
  readonly schema?: SearchDescriptor;
}

export function buildSearch<const SearchDescriptor extends StaticSearchDescriptor>(
  input: Partial<InferStaticSearch<SearchDescriptor>> | undefined,
  options: BuildRouteSearchOptions<SearchDescriptor> & { readonly schema: SearchDescriptor },
): string;
export function buildSearch(input?: Record<string, unknown>, options?: BuildSearchOptions): string;
export function buildSearch(
  input: Record<string, unknown> | undefined = {},
  options: BuildRouteSearchOptions = {},
): string {
  if (!options.schema) {
    return buildRuntimeSearch(input, options);
  }

  return buildRuntimeSearch(input, {
    ...options,
    schema: compileCachedStaticSearch(options.schema),
  });
}

export function patchSearch<const SearchDescriptor extends StaticSearchDescriptor>(
  current: string | URLSearchParams,
  patch: Partial<InferStaticSearch<SearchDescriptor>>,
  options: PatchRouteSearchOptions<SearchDescriptor> & { readonly schema: SearchDescriptor },
): string;
export function patchSearch(
  current: string | URLSearchParams,
  patch: Record<string, unknown>,
  options?: PatchSearchOptions,
): string;
export function patchSearch(
  current: string | URLSearchParams,
  patch: Record<string, unknown>,
  options: PatchRouteSearchOptions = {},
): string {
  if (!options.schema) {
    return patchRuntimeSearch(current, patch, options);
  }

  return patchRuntimeSearch(current, patch, {
    ...options,
    schema: compileCachedStaticSearch(options.schema),
  });
}

export function replaceSearch<const SearchDescriptor extends StaticSearchDescriptor>(
  current: string | URLSearchParams,
  next: Partial<InferStaticSearch<SearchDescriptor>>,
  options: BuildRouteSearchOptions<SearchDescriptor> & { readonly schema: SearchDescriptor },
): string;
export function replaceSearch(
  current: string | URLSearchParams,
  next: Record<string, unknown>,
  options?: BuildSearchOptions,
): string;
export function replaceSearch(
  current: string | URLSearchParams,
  next: Record<string, unknown>,
  options: BuildRouteSearchOptions = {},
): string {
  if (!options.schema) {
    return replaceRuntimeSearch(current, next, options);
  }

  return replaceRuntimeSearch(current, next, {
    ...options,
    schema: compileCachedStaticSearch(options.schema),
  });
}

export function omitSearch(current: string | URLSearchParams, keys: readonly string[]): string {
  return omitRuntimeSearch(current, keys);
}

export function pickSearch(current: string | URLSearchParams, keys: readonly string[]): string {
  return pickRuntimeSearch(current, keys);
}
