import type { AnyRuntimeSchemaBuilder } from '../schema/contracts.js';
import { isRuntimeSchemaKind } from '../schema/is-runtime-schema-kind.js';
import { getObjectSchemaShape, type ObjectSchema } from '../schema/object.js';

export function collectObjectSearchPaths(
  schema: ObjectSchema<any>,
): readonly (readonly string[])[] {
  return Object.freeze(collectObjectSearchPathsFromShape(schema, []));
}

function collectObjectSearchPathsFromShape(
  schema: ObjectSchema<any>,
  basePath: readonly string[],
): readonly (readonly string[])[] {
  const shape = getObjectSchemaShape(schema);
  const paths: (readonly string[])[] = [];

  for (const [key, childSchema] of Object.entries(shape)) {
    const childPath = [...basePath, key];

    if (isRuntimeSchemaKind(childSchema as AnyRuntimeSchemaBuilder, 'object')) {
      paths.push(...collectObjectSearchPathsFromShape(childSchema as ObjectSchema<any>, childPath));
      continue;
    }

    paths.push(Object.freeze(childPath));
  }

  return paths;
}
