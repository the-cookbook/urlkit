import { isRuntimeSchemaKind } from '../schema/is-runtime-schema-kind.js';
import type { CompiledSearchField } from './contracts.js';
import { collectObjectSearchPaths } from './collect-object-search-paths.js';
import { getObjectSearchRawKeyPath } from './object-search-raw-key-path.js';
import { isObjectSearchPathEqual } from './object-search-path-key.js';

export function deleteSearchFieldRawKeys(
  field: CompiledSearchField,
  rawSearch: Record<string, unknown>,
): void {
  if (isRuntimeSchemaKind(field.schema, 'object')) {
    deleteObjectSearchKeys(field, rawSearch);
    return;
  }

  delete rawSearch[field.key];
}

function deleteObjectSearchKeys(
  field: CompiledSearchField,
  rawSearch: Record<string, unknown>,
): void {
  const declaredPaths = collectObjectSearchPaths(field.schema as never);

  for (const rawKey of Object.keys(rawSearch)) {
    const rawPath = getObjectSearchRawKeyPath(field.key, rawKey);

    if (
      rawPath &&
      declaredPaths.some((declaredPath) => isObjectSearchPathEqual(rawPath, declaredPath))
    ) {
      delete rawSearch[rawKey];
    }
  }
}
