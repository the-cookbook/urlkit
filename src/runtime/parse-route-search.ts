import type { SearchArrayFormat, UnknownSearchBehavior } from '../contracts.js';
import { parseSearch as parseRuntimeSearch } from '../search/parse-search.js';
import type { RawSearchParams } from '../search/contracts.js';
import { compileCachedStaticSearch } from './compile-cached-static-search.js';
import type { InferStaticSearch, StaticSearchDescriptor } from '../static/contracts.js';

export interface ParseSearchOptions<SearchDescriptor = StaticSearchDescriptor> {
  readonly schema?: SearchDescriptor;
  readonly unknownSearch?: UnknownSearchBehavior;
  readonly arrayFormat?: SearchArrayFormat;
}

export function parseSearch<const SearchDescriptor extends StaticSearchDescriptor>(
  input: string | URLSearchParams,
  options: ParseSearchOptions<SearchDescriptor> & { readonly schema: SearchDescriptor },
): InferStaticSearch<SearchDescriptor>;
export function parseSearch(
  input: string | URLSearchParams,
  options?: ParseSearchOptions,
): RawSearchParams;
export function parseSearch(
  input: string | URLSearchParams,
  options: ParseSearchOptions = {},
): RawSearchParams | Record<string, unknown> {
  if (!options.schema) {
    return parseRuntimeSearch(input);
  }

  return parseRuntimeSearch(input, {
    schema: compileCachedStaticSearch(options.schema),
    ...(options.unknownSearch ? { unknownSearch: options.unknownSearch } : {}),
    ...(options.arrayFormat ? { arrayFormat: options.arrayFormat } : {}),
  }).search;
}
