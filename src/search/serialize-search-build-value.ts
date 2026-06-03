import { serializeCompiledRuntimeSchemaValue } from '../schema/serialize-compiled-runtime-schema-value.js';
import { serializeArrayRuntimeSchemaValue } from '../schema/array.js';
import { isRuntimeSchemaKind } from '../schema/is-runtime-schema-kind.js';
import type { CompiledSearchField } from './contracts.js';

export function serializeSearchBuildValue(
  field: CompiledSearchField,
  normalized: unknown,
): string | readonly string[] | undefined {
  if (isRuntimeSchemaKind(field.schema, 'array')) {
    return serializeArrayRuntimeSchemaValue(field.schema as never, normalized, {
      kind: 'array',
      path: [field.key],
      errorCode: 'invalid-search',
    });
  }

  if (isRuntimeSchemaKind(field.schema, 'object')) {
    return undefined;
  }

  if (field.type === 'many') {
    if (!Array.isArray(normalized) || !normalized.length) {
      return undefined;
    }

    return Object.freeze(normalized.map((item) => serializeOneSearchBuildValue(field, item)));
  }

  return serializeOneSearchBuildValue(field, normalized);
}

function serializeOneSearchBuildValue(field: CompiledSearchField, value: unknown): string {
  const serialized = serializeCompiledRuntimeSchemaValue(field.compiledSchema, value, {
    path: [field.key],
    errorCode: 'invalid-search',
    missingCode: 'missing-search',
  });

  return serialized ?? '';
}
