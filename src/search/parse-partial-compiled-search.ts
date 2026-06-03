import type { CompiledSearchSchema, RawSearchParams, RawSearchValue } from './contracts.js';
import { copyRawSearchParams } from './copy-raw-search-params.js';
import { deleteSearchFieldRawKeys } from './delete-search-field-raw-keys.js';
import { hasSearchFieldRawValue } from './has-search-field-raw-value.js';
import { parseSearchFieldValue } from './parse-search-field-value.js';

export interface PartialCompiledSearchParseResult {
  readonly search: Record<string, unknown>;
  readonly unknownSearch: RawSearchParams;
}

export function parsePartialCompiledSearch(
  rawSearch: RawSearchParams,
  compiled: CompiledSearchSchema,
): PartialCompiledSearchParseResult {
  const remainingUnknown = { ...rawSearch } satisfies Record<string, RawSearchValue>;
  const search: Record<string, unknown> = {};

  for (const field of compiled.fields) {
    if (!hasSearchFieldRawValue(field, rawSearch)) {
      continue;
    }

    const value = parseSearchFieldValue(field, rawSearch);
    deleteSearchFieldRawKeys(field, remainingUnknown);

    if (value !== undefined) {
      search[field.key] = value;
    }
  }

  return Object.freeze({
    search: Object.freeze(search),
    unknownSearch: copyRawSearchParams(remainingUnknown),
  });
}
