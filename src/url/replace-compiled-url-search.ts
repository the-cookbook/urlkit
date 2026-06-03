import type { BuildSearchOptions } from '../contracts.js';
import { buildRawSearch } from '../search/build-raw-search.js';
import { buildCompiledSearch } from '../search/build-compiled-search.js';
import type { CompiledUrlDescriptor } from './compile-url-descriptor.js';
import { formatParsedUrl } from './format-parsed-url.js';
import { parseUrl } from './parse-url.js';

export function replaceCompiledUrlSearch(
  input: string | URL,
  next: Record<string, unknown>,
  compiled: CompiledUrlDescriptor,
  options: BuildSearchOptions = {},
): string {
  const parsed = parseUrl(input);
  const search = compiled.search
    ? buildCompiledSearch(next, compiled.search, options)
    : buildRawSearch(next, options);

  return formatParsedUrl(parsed, search);
}
