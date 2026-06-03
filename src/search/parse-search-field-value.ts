import { UrlKitError } from '../errors/url-kit-error.js';
import { parseCompiledRuntimeSchemaValue } from '../schema/parse-compiled-runtime-schema-value.js';
import { isRuntimeSchemaKind } from '../schema/is-runtime-schema-kind.js';
import type { AnyObjectSchema } from '../schema/object.js';
import type { ArraySchema } from '../schema/array.js';
import type {
  CompiledSearchField,
  RawSearchParams,
  RawSearchValue,
  SearchParseOptions,
} from './contracts.js';
import { parseArraySearchValue } from './parse-array-search-value.js';
import { parseObjectSearchValue } from './parse-object-search-value.js';
import { readArraySearchValues } from './search-array-format.js';

export function parseSearchFieldValue(
  field: CompiledSearchField,
  rawSearch: RawSearchParams,
  options: SearchParseOptions = {},
): unknown {
  if (isRuntimeSchemaKind(field.schema, 'object')) {
    return parseObjectSearchValue(field.schema as AnyObjectSchema, field.key, rawSearch, {
      kind: 'object',
      path: [field.key],
      errorCode: 'invalid-search',
    }, options);
  }

  if (isRuntimeSchemaKind(field.schema, 'array')) {
    return parseArraySearchValue(field.schema as ArraySchema<any>, rawSearch[field.key], {
      kind: 'array',
      path: [field.key],
      errorCode: 'invalid-search',
    }, options);
  }

  return parseNonObjectSearchFieldValue(field, rawSearch[field.key], options);
}

function parseNonObjectSearchFieldValue(
  field: CompiledSearchField,
  value: RawSearchValue | undefined,
  options: SearchParseOptions,
): unknown {
  if (value === undefined) {
    return parseMissingSearchFieldValue(field);
  }

  if (field.type === 'many') {
    const values = readArraySearchValues(value, options.arrayFormat) ?? [];

    return Object.freeze(values.map((item) => parseRuntimeSearchValue(field, item)));
  }

  if (Array.isArray(value)) {
    throw new UrlKitError('invalid-search', 'Expected a single search parameter value.', {
      path: [field.key],
    });
  }

  return parseRuntimeSearchValue(field, value as string);
}

function parseMissingSearchFieldValue(field: CompiledSearchField): unknown {
  if (field.presence === 'optional') {
    return undefined;
  }

  if (field.presence === 'defaulted') {
    return copyDefaultValue(field.defaultValue);
  }

  throw new UrlKitError('missing-search', 'Required search parameter is missing.', {
    path: [field.key],
  });
}

function parseRuntimeSearchValue(field: CompiledSearchField, value: string): unknown {
  return parseCompiledRuntimeSchemaValue(field.compiledSchema, value, {
    path: [field.key],
    errorCode: 'invalid-search',
    missingCode: 'missing-search',
  });
}

function copyDefaultValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return Object.freeze([...value]);
  }

  if (isPlainObject(value)) {
    return Object.freeze({ ...value });
  }

  return value;
}

function isPlainObject(input: unknown): input is Record<string, unknown> {
  return (
    typeof input === 'object' && input !== null && !Array.isArray(input) && !(input instanceof Date)
  );
}
