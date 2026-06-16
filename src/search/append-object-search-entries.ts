import type { BuildSearchOptions } from '../contracts.js';
import type { AnyRuntimeSchemaBuilder } from '../schema/contracts.js';
import { isRuntimeSchemaType } from '../schema/is-runtime-schema-type.js';
import { getObjectSchemaShape, type AnyObjectSchema } from '../schema/object.js';
import { serializeRuntimeSchemaValue } from '../schema/serialize-runtime-schema-value.js';
import { serializeArrayRuntimeSchemaValue } from '../schema/array.js';
import type { SearchEntry } from './search-entries.js';
import { appendSearchEntry } from './append-search-entry.js';
import { joinObjectSearchKey } from './object-search-key.js';

export function appendObjectSearchEntries(
  entries: SearchEntry[],
  parentKey: string,
  schema: AnyObjectSchema,
  value: unknown,
  options: BuildSearchOptions = {},
): void {
  if (!isPlainObject(value)) {
    return;
  }

  const shape = getObjectSchemaShape(schema);

  for (const [key, childSchema] of Object.entries(shape)) {
    const childValue = value[key];

    if (childValue === undefined) {
      continue;
    }

    const childKey = joinObjectSearchKey(parentKey, key);
    appendObjectChildSearchEntry(
      entries,
      childKey,
      childSchema as AnyObjectSchema,
      childValue,
      options,
    );
  }
}

function appendObjectChildSearchEntry(
  entries: SearchEntry[],
  key: string,
  schema: AnyRuntimeSchemaBuilder,
  value: unknown,
  options: BuildSearchOptions,
): void {
  if (isRuntimeSchemaType(schema, 'object')) {
    appendObjectSearchEntries(entries, key, schema as AnyObjectSchema, value, options);
    return;
  }

  if (isRuntimeSchemaType(schema, 'array')) {
    appendSearchEntry(
      entries,
      key,
      serializeArrayRuntimeSchemaValue(schema as never, value, {
        type: 'array',
        path: [key],
        errorCode: 'invalid-search',
      }),
      options,
    );
    return;
  }

  appendSearchEntry(
    entries,
    key,
    serializeRuntimeSchemaValue(schema, value, {
      path: [key],
      errorCode: 'invalid-search',
      missingCode: 'missing-search',
    }),
    options,
  );
}

function isPlainObject(input: unknown): input is Record<string, unknown> {
  return (
    typeof input === 'object' && input !== null && !Array.isArray(input) && !(input instanceof Date)
  );
}
