import { UrlKitError } from '../errors/url-kit-error.js';
import type {
  CompiledSearchField,
  CompiledSearchSchema,
  RawSearchParams,
  RawSearchValue,
  SearchParseOptions,
  SearchParseResult,
} from './contracts.js';
import { copyRawSearchParams } from './copy-raw-search-params.js';
import { deleteSearchFieldRawKeys } from './delete-search-field-raw-keys.js';
import { hasSearchFieldRawValue } from './has-search-field-raw-value.js';
import { parseSearchFieldValue } from './parse-search-field-value.js';

export function parseCompiledSearch(
  rawSearch: RawSearchParams,
  compiled: CompiledSearchSchema,
  unknownSearch: 'strip' | 'preserve' | 'error' = 'strip',
  options: SearchParseOptions = {},
): SearchParseResult<Record<string, unknown>> {
  const remainingUnknown = { ...rawSearch } satisfies Record<string, RawSearchValue>;
  const search: Record<string, unknown> = {};

  for (const field of compiled.fields) {
    const value = parseCompiledSearchField(field, rawSearch, options);
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

function parseCompiledSearchField(
  field: CompiledSearchField,
  rawSearch: RawSearchParams,
  options: SearchParseOptions,
): unknown {
  try {
    return parseSearchFieldValue(field, rawSearch, options);
  } catch (error) {
    if (!shouldRecoverInvalidSearchField(field, rawSearch, options, error)) {
      throw error;
    }

    if (field.presence === 'defaulted') {
      return copyDefaultValue(field.defaultValue);
    }

    return undefined;
  }
}

function shouldRecoverInvalidSearchField(
  field: CompiledSearchField,
  rawSearch: RawSearchParams,
  options: SearchParseOptions,
  error: unknown,
): boolean {
  return (
    options.invalidSearch === 'omit' &&
    error instanceof UrlKitError &&
    field.presence !== 'required' &&
    hasSearchFieldRawValue(field, rawSearch)
  );
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

function copyDefaultValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return Object.freeze([...value]);
  }

  if (isPlainObject(value)) {
    return Object.freeze({ ...value });
  }

  return value;
}

function isPlainObject(input: unknown): input is Record<string, unknown> {
  return (
    typeof input === 'object' && input !== null && !Array.isArray(input) && !(input instanceof Date)
  );
}
