import type { PatchSearchOptions } from '../contracts.js';
import type {
  InferRuntimeSearch,
  RawSearchValue,
  RuntimeSearchSchema,
  SearchPatchOptions,
} from './contracts.js';
import { buildRawSearch } from './build-raw-search.js';
import { buildSchemaSearch } from './build-schema-search.js';
import { compileSearchSchema } from './compile-search-schema.js';
import { copyRawSearchParams } from './copy-raw-search-params.js';
import { joinSearchStrings } from './join-search-strings.js';
import { parsePartialSchemaSearch } from './parse-partial-schema-search.js';
import { parseRawSearch } from './parse-raw-search.js';

export function patchSearch<const Schema extends RuntimeSearchSchema>(
  current: string | URLSearchParams,
  patch: Partial<InferRuntimeSearch<Schema>>,
  options: SearchPatchOptions<Schema> & { readonly schema: Schema },
): string;
export function patchSearch(
  current: string | URLSearchParams,
  patch: Record<string, unknown>,
  options?: PatchSearchOptions,
): string;
export function patchSearch(
  current: string | URLSearchParams,
  patch: Record<string, unknown>,
  options: SearchPatchOptions<RuntimeSearchSchema> = {},
): string {
  if (options.schema) {
    return patchSchemaSearch(current, patch, options.schema, options);
  }

  return patchRawSearch(current, patch, options);
}

function patchRawSearch(
  current: string | URLSearchParams,
  patch: Record<string, unknown>,
  options: PatchSearchOptions,
): string {
  const merged: Record<string, RawSearchValue> = { ...parseRawSearch(current) };

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

function patchSchemaSearch(
  current: string | URLSearchParams,
  patch: Record<string, unknown>,
  schema: RuntimeSearchSchema,
  options: SearchPatchOptions<RuntimeSearchSchema>,
): string {
  const compiled = compileSearchSchema(schema);
  const schemaKeys = compiled.keys;
  const currentParsed = parsePartialSchemaSearch(parseRawSearch(current), schema);
  const mergedSearch: Record<string, unknown> = { ...currentParsed.search };
  const unknownSearch: Record<string, RawSearchValue> = {
    ...copyRawSearchParams(currentParsed.unknownSearch),
  };

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

  return joinSearchStrings(
    buildSchemaSearch(mergedSearch, schema, options),
    buildRawSearch(unknownSearch, options),
  );
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
