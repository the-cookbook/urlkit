import { UrlKitError } from '../errors/url-kit-error.js';
import { compileRuntimeSchema } from '../schema/compile-runtime-schema.js';
import type { AnyRuntimeSchemaBuilder, RuntimeSchemaValueContext } from '../schema/contracts.js';
import { getObjectSchemaShape, type AnyObjectSchema } from '../schema/object.js';
import { parseRuntimeSchemaValue } from '../schema/parse-runtime-schema-value.js';
import { isRuntimeSchemaType } from '../schema/is-runtime-schema-type.js';
import { parseArraySearchValue } from './parse-array-search-value.js';
import type { RawSearchParams, SearchParseOptions } from './contracts.js';
import { assertNoObjectSearchCollisions } from './assert-object-search-collisions.js';
import { findObjectSearchRawValue } from './find-object-search-raw-value.js';

export function parseObjectSearchValue(
  schema: AnyObjectSchema,
  parentKey: string,
  rawSearch: RawSearchParams,
  context: RuntimeSchemaValueContext,
  options: SearchParseOptions = {},
): unknown {
  assertNoObjectSearchCollisions(parentKey, rawSearch, context.path);

  const descriptor = compileRuntimeSchema(schema, { path: context.path });
  const hasDeclaredValues = hasDeclaredObjectValues(schema, parentKey, [], rawSearch);

  if (!hasDeclaredValues) {
    if (descriptor.presence === 'optional') {
      return undefined;
    }

    if (descriptor.presence === 'defaulted') {
      return descriptor.defaultValue;
    }
  }

  return parseObjectShape(schema, parentKey, [], rawSearch, context, options);
}

function parseObjectShape(
  schema: AnyObjectSchema,
  parentKey: string,
  objectPath: readonly string[],
  rawSearch: RawSearchParams,
  context: RuntimeSchemaValueContext,
  options: SearchParseOptions,
): Readonly<Record<string, unknown>> {
  const shape = getObjectSchemaShape(schema);
  const output: Record<string, unknown> = {};

  for (const [key, childSchema] of Object.entries(shape)) {
    const childObjectPath = [...objectPath, key];
    const childPath = [...context.path, key];
    const value = parseChildObjectSearchValue(
      childSchema as AnyRuntimeSchemaBuilder,
      parentKey,
      childObjectPath,
      rawSearch,
      {
        type: 'object',
        path: childPath,
        errorCode: context.errorCode,
      },
      options,
    );

    if (value !== undefined) {
      output[key] = value;
    }
  }

  return Object.freeze(output);
}

function parseChildObjectSearchValue(
  schema: AnyRuntimeSchemaBuilder,
  parentKey: string,
  objectPath: readonly string[],
  rawSearch: RawSearchParams,
  context: RuntimeSchemaValueContext,
  options: SearchParseOptions,
): unknown {
  if (isRuntimeSchemaType(schema, 'object')) {
    return parseNestedObjectSearchValue(
      schema as AnyObjectSchema,
      parentKey,
      objectPath,
      rawSearch,
      context,
      options,
    );
  }

  const rawValue = findObjectSearchRawValue(parentKey, objectPath, rawSearch);

  if (isRuntimeSchemaType(schema, 'array')) {
    return parseArraySearchValue(schema as never, rawValue, context, options);
  }

  if (Array.isArray(rawValue)) {
    throw new UrlKitError('invalid-search', 'Expected a single object search parameter value.', {
      path: context.path,
    });
  }

  return parseRuntimeSchemaValue(schema, rawValue, {
    path: context.path,
    errorCode: context.errorCode,
    missingCode: 'missing-search',
  });
}

function parseNestedObjectSearchValue(
  schema: AnyObjectSchema,
  parentKey: string,
  objectPath: readonly string[],
  rawSearch: RawSearchParams,
  context: RuntimeSchemaValueContext,
  options: SearchParseOptions,
): unknown {
  const descriptor = compileRuntimeSchema(schema, { path: context.path });
  const hasDeclaredValues = hasDeclaredObjectValues(schema, parentKey, objectPath, rawSearch);

  if (!hasDeclaredValues) {
    if (descriptor.presence === 'optional') {
      return undefined;
    }

    if (descriptor.presence === 'defaulted') {
      return descriptor.defaultValue;
    }
  }

  return parseObjectShape(schema, parentKey, objectPath, rawSearch, context, options);
}

function hasDeclaredObjectValues(
  schema: AnyObjectSchema,
  parentKey: string,
  objectPath: readonly string[],
  rawSearch: RawSearchParams,
): boolean {
  const shape = getObjectSchemaShape(schema);

  return Object.entries(shape).some(([key, childSchema]) => {
    const childObjectPath = [...objectPath, key];

    if (isRuntimeSchemaType(childSchema as AnyRuntimeSchemaBuilder, 'object')) {
      return hasDeclaredObjectValues(
        childSchema as AnyObjectSchema,
        parentKey,
        childObjectPath,
        rawSearch,
      );
    }

    return findObjectSearchRawValue(parentKey, childObjectPath, rawSearch) !== undefined;
  });
}
