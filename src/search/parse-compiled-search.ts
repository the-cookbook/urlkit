import { UrlKitError } from '../errors/url-kit-error.js';
import type {
  CompiledSearchSchema,
  RawSearchParams,
  RawSearchValue,
  SearchParseResult,
} from './contracts.js';
import { copyRawSearchParams } from './copy-raw-search-params.js';
import { deleteSearchFieldRawKeys } from './delete-search-field-raw-keys.js';
import { parseSearchFieldValue } from './parse-search-field-value.js';

export function parseCompiledSearch(
  rawSearch: RawSearchParams,
  compiled: CompiledSearchSchema,
  unknownSearch: 'strip' | 'preserve' | 'error' = 'strip',
): SearchParseResult<Record<string, unknown>> {
  const remainingUnknown = { ...rawSearch } satisfies Record<string, RawSearchValue>;
  const search: Record<string, unknown> = {};

  for (const field of compiled.fields) {
    const value = parseSearchFieldValue(field, rawSearch);
    deleteSearchFieldRawKeys(field, remainingUnknown);

    if (value !== undefined) {
      search[field.key] = value;
    }
  }

  const result: SearchParseResult<Record<string, unknown>> = {
    search: Object.freeze(search),
  };
  const unknown = resolveUnknownSearch(remainingUnknown, unknownSearch);

  if (unknown) {
    return Object.freeze({
      ...result,
      unknownSearch: unknown,
    });
  }

  return Object.freeze(result);
}

function resolveUnknownSearch(
  unknown: RawSearchParams,
  behavior: 'strip' | 'preserve' | 'error',
): RawSearchParams | undefined {
  const keys = Object.keys(unknown);

  if (!keys.length || behavior === 'strip') {
    return undefined;
  }

  if (behavior === 'error') {
    throw new UrlKitError('invalid-search', 'Unknown search parameter is not allowed.', {
      path: [keys[0]!],
    });
  }

  return copyRawSearchParams(unknown);
}
