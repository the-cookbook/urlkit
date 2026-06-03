import type { BuildSearchOptions } from '../contracts.js';
import { isRuntimeSchemaKind } from '../schema/is-runtime-schema-kind.js';
import type { AnyObjectSchema } from '../schema/object.js';
import { appendObjectSearchEntries } from './append-object-search-entries.js';
import { appendSearchEntry } from './append-search-entry.js';
import { areSearchValuesEqual } from './are-search-values-equal.js';
import type { CompiledSearchSchema } from './contracts.js';
import { normalizeSearchBuildValue } from './normalize-search-build-value.js';
import type { SearchEntry } from './search-entries.js';
import { serializeSearchBuildValue } from './serialize-search-build-value.js';
import { serializeSearchEntries } from './serialize-search-entries.js';

export function buildCompiledSearch(
  input: Record<string, unknown> = {},
  compiled: CompiledSearchSchema,
  options: BuildSearchOptions = {},
): string {
  const entries: SearchEntry[] = [];

  for (const field of compiled.fields) {
    const normalized = normalizeSearchBuildValue(field, input[field.key]);

    if (normalized === undefined || shouldOmitDefault(field.defaultValue, normalized, options)) {
      continue;
    }

    if (isRuntimeSchemaKind(field.schema, 'object')) {
      appendObjectSearchEntries(
        entries,
        field.key,
        field.schema as AnyObjectSchema,
        normalized,
        options,
      );
      continue;
    }

    appendSearchEntry(entries, field.key, serializeSearchBuildValue(field, normalized), options);
  }

  return serializeSearchEntries(entries, options);
}

function shouldOmitDefault(
  defaultValue: unknown,
  normalized: unknown,
  options: BuildSearchOptions,
): boolean {
  return (
    options.defaults === 'omit' &&
    defaultValue !== undefined &&
    areSearchValuesEqual(normalized, defaultValue)
  );
}
