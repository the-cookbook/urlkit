import { compileRuntimeSchema } from '../schema/compile-runtime-schema.js';
import type { RuntimeSchemaValueContext } from '../schema/contracts.js';
import { parseRuntimeSchemaValue } from '../schema/parse-runtime-schema-value.js';
import { parseArrayRuntimeSchemaValue, type ArraySchema } from '../schema/array.js';
import type { RawSearchValue, SearchParseOptions } from './contracts.js';
import { readArraySearchValues } from './search-array-format.js';

export function parseArraySearchValue(
  schema: ArraySchema<any>,
  value: RawSearchValue | undefined,
  context: RuntimeSchemaValueContext,
  options: SearchParseOptions = {},
): unknown {
  if (value === undefined) {
    return parseRuntimeSchemaValue(schema, undefined, {
      path: context.path,
      errorCode: context.errorCode,
      missingCode: 'missing-search',
    });
  }

  compileRuntimeSchema(schema, { path: context.path });

  return parseArrayRuntimeSchemaValue(
    schema,
    readArraySearchValues(value, options.arrayFormat) ?? [],
    context,
  );
}
