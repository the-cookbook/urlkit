import type { PatchSearchOptions } from '../contracts.js';
import { buildRawSearch } from '../search/build-raw-search.js';
import { buildCompiledSearch } from '../search/build-compiled-search.js';
import type { RawSearchParams, RawSearchValue } from '../search/contracts.js';
import { copyRawSearchParams } from '../search/copy-raw-search-params.js';
import { joinSearchStrings } from '../search/join-search-strings.js';
import { parsePartialCompiledSearch } from '../search/parse-partial-compiled-search.js';
import { parseRawSearch } from '../search/parse-raw-search.js';
import type { CompiledUrlDescriptor } from './compile-url-descriptor.js';
import { formatParsedUrl } from './format-parsed-url.js';
import { parseUrl } from './parse-url.js';

export function patchCompiledUrlSearch(
  input: string | URL,
  patch: Record<string, unknown>,
  compiled: CompiledUrlDescriptor,
  options: PatchSearchOptions = {},
): string {
  const parsed = parseUrl(input);
  const rawSearch = parseRawSearch(parsed.searchParams);

  if (!compiled.search) {
    return formatParsedUrl(parsed, buildRawPatchSearch(rawSearch, patch, options));
  }

  const currentParsed = parsePartialCompiledSearch(rawSearch, compiled.search);
  const mergedSearch: Record<string, unknown> = { ...currentParsed.search };
  const unknownSearch: Record<string, RawSearchValue> = {
    ...copyRawSearchParams(currentParsed.unknownSearch),
  };
  const schemaKeys = compiled.search.keys;

  for (const [key, value] of Object.entries(patch)) {
    if (shouldRemoveUndefined(value, options) || shouldRemoveNull(value, options)) {
      delete mergedSearch[key];
      delete unknownSearch[key];
      continue;
    }

    if (value === undefined || value === null) {
      continue;
    }

    if (schemaKeys.has(key)) {
      mergedSearch[key] = value;
    }
  }

  const search = joinSearchStrings(
    buildCompiledSearch(mergedSearch, compiled.search, options),
    buildRawSearch(unknownSearch, options),
  );

  return formatParsedUrl(parsed, search);
}

function buildRawPatchSearch(
  rawSearch: RawSearchParams,
  patch: Record<string, unknown>,
  options: PatchSearchOptions,
): string {
  const merged: Record<string, RawSearchValue> = { ...rawSearch };

  for (const [key, value] of Object.entries(patch)) {
    if (shouldRemoveUndefined(value, options) || shouldRemoveNull(value, options)) {
      delete merged[key];
      continue;
    }

    if (value === undefined || value === null) {
      continue;
    }

    merged[key] = toRawSearchValue(value);
  }

  return buildRawSearch(merged, options);
}

function shouldRemoveUndefined(value: unknown, options: PatchSearchOptions): boolean {
  return value === undefined && options.removeUndefined === true;
}

function shouldRemoveNull(value: unknown, options: PatchSearchOptions): boolean {
  return value === null && options.removeNull === true;
}

function toRawSearchValue(value: unknown): RawSearchValue {
  if (Array.isArray(value)) {
    return Object.freeze(value.filter(isPresent).map(String));
  }

  return String(value);
}

function isPresent(value: unknown): boolean {
  return value !== undefined && value !== null;
}
