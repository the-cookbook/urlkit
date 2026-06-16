import type { AnyRuntimeSchemaBuilder } from '../schema/contracts.js';
import { isRuntimeSchemaType } from '../schema/is-runtime-schema-type.js';
import { getObjectSchemaShape, type AnyObjectSchema } from '../schema/object.js';

export function collectObjectSearchPaths(schema: AnyObjectSchema): readonly (readonly string[])[] {
  return Object.freeze(collectObjectSearchPathsFromShape(schema, []));
}

function collectObjectSearchPathsFromShape(
  schema: AnyObjectSchema,
  basePath: readonly string[],
): readonly (readonly string[])[] {
  const shape = getObjectSchemaShape(schema);
  const paths: (readonly string[])[] = [];

  for (const [key, childSchema] of Object.entries(shape)) {
    const childPath = [...basePath, key];

    if (isRuntimeSchemaType(childSchema as AnyRuntimeSchemaBuilder, 'object')) {
      paths.push(...collectObjectSearchPathsFromShape(childSchema as AnyObjectSchema, childPath));
      continue;
    }

    paths.push(Object.freeze(childPath));
  }

  return paths;
}
