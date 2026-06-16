import { boolean } from '../schema/boolean.js';
import { date } from '../schema/date.js';
import { dateTime } from '../schema/date-time.js';
import { enumOf } from '../schema/enum-of.js';
import { int } from '../schema/int.js';
import { number } from '../schema/number.js';
import type { AnyRuntimeSchemaBuilder } from '../schema/contracts.js';
import { string } from '../schema/string.js';
import { UrlKitError } from '../errors/url-kit-error.js';
import type { RuntimeSearchField, RuntimeSearchSchema } from '../search/contracts.js';
import type {
  StaticDateFormat,
  StaticDateTimeFormat,
  StaticSearchDescriptor,
  StaticSearchField,
} from './contracts.js';
import {
  assertStaticSearchField,
  getStaticSearchFieldDefault,
  hasStaticSearchFieldDefault,
  isStaticSearchFieldOptional,
  normalizeStaticSearchFieldType,
  normalizeStaticSearchFieldValue,
} from './static-search-field-type.js';
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

function createStaticSearchField(key: string, field: unknown): RuntimeSearchField {
  const path = ['search', key];
  assertStaticSearchField(field, path);

  const fieldType = normalizeStaticSearchFieldType(field.many, path);
  const valueDescriptor = normalizeStaticSearchFieldValue(field, path);
  const value = createStaticSearchValueSchema(valueDescriptor, path);
  const hasDefault = hasStaticSearchFieldDefault(field);
  const defaultValue = hasDefault
    ? normalizeStaticSearchDefault(
        fieldType,
        valueDescriptor,
        getStaticSearchFieldDefault(field),
        path,
      )
    : undefined;

  return Object.freeze({
    type: fieldType,
    value,
    ...(isStaticSearchFieldOptional(field) ? { optional: true } : {}),
    ...(hasDefault ? { default: defaultValue } : {}),
  });
}

function createStaticSearchValueSchema(
  value: StaticSearchField,
  path: readonly string[],
): AnyRuntimeSchemaBuilder {
  if (value.type === 'string') {
    return string();
  }

  if (value.type === 'number') {
    return number();
  }

  if (value.type === 'int') {
    return int();
  }

  if (value.type === 'boolean') {
    return boolean();
  }

  if (isStaticDateValue(value)) {
    return date({ format: value.format ?? 'date' });
  }

  if (isStaticDateTimeValue(value)) {
    return dateTime({ format: value.format ?? 'date-time' });
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
  readonly format?: StaticDateFormat;
} {
  return isRecord(input) && input.type === 'date';
}

function isStaticDateTimeValue(input: unknown): input is {
  readonly type: 'date-time';
  readonly format?: StaticDateTimeFormat;
} {
  return isRecord(input) && input.type === 'date-time';
}

function isStaticEnumValue(
  input: unknown,
): input is { readonly type: 'enum'; readonly values: readonly string[] } {
  return isRecord(input) && input.type === 'enum';
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}
