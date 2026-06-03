import { boolean } from '../schema/boolean.js';
import { date } from '../schema/date.js';
import { enumOf } from '../schema/enum-of.js';
import { int } from '../schema/int.js';
import { number } from '../schema/number.js';
import type { AnyRuntimeSchemaBuilder } from '../schema/contracts.js';
import { string } from '../schema/string.js';
import { UrlKitError } from '../errors/url-kit-error.js';
import type { RuntimeSearchField, RuntimeSearchSchema } from '../search/contracts.js';
import type { StaticSearchDescriptor, StaticSearchField, StaticSearchValue } from './contracts.js';
import {
  isStaticSearchFieldObject,
  normalizeStaticSearchFieldType,
  normalizeStaticSearchFieldValue,
} from './static-search-field-kind.js';
import { normalizeStaticSearchDefault } from './normalize-static-search-default.js';

export function createStaticSearchSchema(descriptor: StaticSearchDescriptor): RuntimeSearchSchema {
  if (!isRecord(descriptor)) {
    throw new UrlKitError('invalid-descriptor', 'Static search descriptor must be an object.', {
      path: ['search'],
    });
  }

  const schema: Record<string, RuntimeSearchField> = {};

  for (const [key, field] of Object.entries(descriptor)) {
    schema[key] = createStaticSearchField(key, field);
  }

  return Object.freeze(schema);
}

function createStaticSearchField(key: string, field: StaticSearchField): RuntimeSearchField {
  const path = ['search', key];
  const fieldType = isStaticSearchFieldObject(field)
    ? normalizeStaticSearchFieldType(field.type, path)
    : 'one';
  const valueDescriptor = normalizeStaticSearchFieldValue(field);
  const value = createStaticSearchValueSchema(valueDescriptor, path);
  const hasDefault =
    isStaticSearchFieldObject(field) && Object.prototype.hasOwnProperty.call(field, 'default');
  const defaultValue = hasDefault
    ? normalizeStaticSearchDefault(fieldType, valueDescriptor, field.default, path)
    : undefined;

  return Object.freeze({
    type: fieldType,
    value,
    ...(isStaticSearchFieldObject(field) && field.optional ? { optional: true } : {}),
    ...(hasDefault ? { default: defaultValue } : {}),
  });
}

function createStaticSearchValueSchema(
  value: StaticSearchValue,
  path: readonly string[],
): AnyRuntimeSchemaBuilder {
  if (value === 'string') {
    return string();
  }

  if (value === 'number') {
    return number();
  }

  if (value === 'int') {
    return int();
  }

  if (value === 'boolean') {
    return boolean();
  }

  if (value === 'date') {
    return date({ format: 'date' });
  }

  if (value === 'date-time') {
    return date({ format: 'date-time' });
  }

  if (value === 'unix-seconds') {
    return date({ format: 'unix-seconds' });
  }

  if (value === 'unix-ms') {
    return date({ format: 'unix-ms' });
  }

  if (isStaticDateValue(value)) {
    return date({ format: value.format ?? 'date' });
  }

  if (isStaticEnumValue(value)) {
    return enumOf(value.values);
  }

  throw new UrlKitError('invalid-descriptor', 'Static search value descriptor is invalid.', {
    path,
  });
}

function isStaticDateValue(input: unknown): input is {
  readonly type: 'date';
  readonly format?: 'date' | 'date-time' | 'unix-seconds' | 'unix-ms';
} {
  return isRecord(input) && input.type === 'date';
}

function isStaticEnumValue(
  input: unknown,
): input is { readonly type: 'enum'; readonly values: readonly string[] } {
  return isRecord(input) && input.type === 'enum';
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}
