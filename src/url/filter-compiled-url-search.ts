import type { BuildSearchOptions } from '../contracts.js';
import { buildRawSearch } from '../search/build-raw-search.js';
import { omitRawSearch, pickRawSearch } from '../search/filter-raw-search.js';
import { parseRawSearch } from '../search/parse-raw-search.js';
import type { CompiledUrlDescriptor } from './compile-url-descriptor.js';
import { formatParsedUrl } from './format-parsed-url.js';
import { parseUrl } from './parse-url.js';

export function omitCompiledUrlSearch(
  input: string | URL,
  keys: readonly string[],
  _compiled: CompiledUrlDescriptor,
  options: BuildSearchOptions = {},
): string {
  const parsed = parseUrl(input);
  const filtered = omitRawSearch(parseRawSearch(parsed.searchParams), keys);

  return formatParsedUrl(parsed, buildRawSearch(filtered, options));
}

export function pickCompiledUrlSearch(
  input: string | URL,
  keys: readonly string[],
  _compiled: CompiledUrlDescriptor,
  options: BuildSearchOptions = {},
): string {
  const parsed = parseUrl(input);
  const filtered = pickRawSearch(parseRawSearch(parsed.searchParams), keys);

  return formatParsedUrl(parsed, buildRawSearch(filtered, options));
}
