import { UrlKitError } from '../errors/url-kit-error.js';
import { normalizeRuntimeSchemaValue } from '../schema/normalize-runtime-schema-value.js';
import type { AnyRuntimeSchemaBuilder, SearchFieldType } from './contracts.js';

export function normalizeSearchFieldDefault(
  fieldType: SearchFieldType,
  schema: AnyRuntimeSchemaBuilder,
  value: unknown,
  path: readonly string[],
): unknown {
  if (fieldType === 'many') {
    if (!Array.isArray(value)) {
      throw new UrlKitError('invalid-descriptor', 'Many search field default must be an array.', {
        path,
      });
    }

    return Object.freeze(
      value.map((item) =>
        normalizeRuntimeSchemaValue(schema, item, {
          path,
          errorCode: 'invalid-descriptor',
          missingCode: 'invalid-descriptor',
        }),
      ),
    );
  }

  return normalizeRuntimeSchemaValue(schema, value, {
    path,
    errorCode: 'invalid-descriptor',
    missingCode: 'invalid-descriptor',
  });
}
