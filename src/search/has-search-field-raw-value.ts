import type { AnyRuntimeSchemaBuilder } from '../schema/contracts.js';
import { isRuntimeSchemaType } from '../schema/is-runtime-schema-type.js';
import { getObjectSchemaShape, type AnyObjectSchema } from '../schema/object.js';
import type { CompiledSearchField, RawSearchParams } from './contracts.js';
import { joinObjectSearchKey } from './object-search-key.js';

export function hasSearchFieldRawValue(
  field: CompiledSearchField,
  rawSearch: RawSearchParams,
): boolean {
  if (isRuntimeSchemaType(field.schema, 'object')) {
    return hasObjectRawValue(field.schema as AnyObjectSchema, field.key, rawSearch);
  }

  return rawSearch[field.key] !== undefined;
}

function hasObjectRawValue(
  schema: AnyObjectSchema,
  parentKey: string,
  rawSearch: RawSearchParams,
): boolean {
  const shape = getObjectSchemaShape(schema);

  return Object.entries(shape).some(([key, childSchema]) => {
    const childSearchKey = joinObjectSearchKey(parentKey, key);

    if (isRuntimeSchemaType(childSchema as AnyRuntimeSchemaBuilder, 'object')) {
      return hasObjectRawValue(childSchema as AnyObjectSchema, childSearchKey, rawSearch);
    }

    return rawSearch[childSearchKey] !== undefined;
  });
}
