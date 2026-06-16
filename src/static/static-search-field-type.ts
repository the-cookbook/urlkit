import { UrlKitError } from '../errors/url-kit-error.js';
import type { StaticDateFormat, StaticDateTimeFormat, StaticSearchField } from './contracts.js';

export function assertStaticSearchField(
  field: unknown,
  path: readonly string[],
): asserts field is StaticSearchField {
  if (!isRecord(field)) {
    throw new UrlKitError(
      'invalid-descriptor',
      'Static search field must use the object form { type, many, optional, default }.',
      { path },
    );
  }

  if (!Object.prototype.hasOwnProperty.call(field, 'type')) {
    throw new UrlKitError('invalid-descriptor', 'Static search field must define a type.', {
      path,
    });
  }

  assertLiteralTrueFlag(field.many, 'many', path);
  assertLiteralTrueFlag(field.optional, 'optional', path);

  if (field.optional === true && Object.prototype.hasOwnProperty.call(field, 'default')) {
    throw new UrlKitError(
      'invalid-descriptor',
      'Static search field cannot combine optional: true with a default.',
      { path },
    );
  }

  normalizeStaticSearchFieldValue(field as unknown as StaticSearchField, path);
}

export function normalizeStaticSearchFieldValue(
  field: StaticSearchField,
  path: readonly string[],
): StaticSearchField {
  if (isStaticPrimitiveSearchType(field.type)) {
    return Object.freeze({ type: field.type });
  }

  if (isStaticDateField(field)) {
    assertStaticDateFormat(field.format, 'date', path);

    return Object.freeze({
      type: 'date',
      ...(field.format !== undefined ? { format: field.format } : {}),
    });
  }

  if (isStaticDateTimeField(field)) {
    assertStaticDateFormat(field.format, 'date-time', path);

    return Object.freeze({
      type: 'date-time',
      ...(field.format !== undefined ? { format: field.format } : {}),
    });
  }

  if (isStaticEnumField(field)) {
    assertStaticEnumValues(field.values, path);
    return Object.freeze({ type: 'enum', values: Object.freeze([...field.values]) });
  }

  throw new UrlKitError('invalid-descriptor', 'Static search field type is invalid.', { path });
}

export function hasStaticSearchFieldDefault(field: StaticSearchField): boolean {
  return Object.prototype.hasOwnProperty.call(field, 'default');
}

export function getStaticSearchFieldDefault(field: StaticSearchField): unknown {
  return field.default;
}

export function isStaticSearchFieldOptional(field: StaticSearchField): boolean {
  return field.optional === true;
}

export function normalizeStaticSearchFieldType(
  many: unknown,
  path: readonly string[],
): 'one' | 'many' {
  if (many === undefined) {
    return 'one';
  }

  if (many === true) {
    return 'many';
  }

  throw new UrlKitError('invalid-descriptor', 'Static search field many flag must be true.', {
    path,
  });
}

function assertLiteralTrueFlag(input: unknown, name: string, path: readonly string[]): void {
  if (input !== undefined && input !== true) {
    throw new UrlKitError(
      'invalid-descriptor',
      `Static search field ${name} flag must be true when present.`,
      { path },
    );
  }
}

function isStaticPrimitiveSearchType(
  input: unknown,
): input is 'string' | 'number' | 'int' | 'boolean' {
  return input === 'string' || input === 'number' || input === 'int' || input === 'boolean';
}

function isStaticDateField(
  input: StaticSearchField,
): input is StaticSearchField & { readonly type: 'date'; readonly format?: StaticDateFormat } {
  return input.type === 'date';
}

function isStaticDateTimeField(input: StaticSearchField): input is StaticSearchField & {
  readonly type: 'date-time';
  readonly format?: StaticDateTimeFormat;
} {
  return input.type === 'date-time';
}

function isStaticEnumField(
  input: StaticSearchField,
): input is StaticSearchField & { readonly type: 'enum'; readonly values: readonly string[] } {
  return input.type === 'enum';
}

function assertStaticDateFormat(
  format: unknown,
  type: 'date' | 'date-time',
  path: readonly string[],
): void {
  if (format !== undefined && typeof format !== 'string') {
    throw new UrlKitError('invalid-descriptor', `Static ${type} search format must be a string.`, {
      path: [...path, 'format'],
    });
  }
}

function assertStaticEnumValues(
  values: unknown,
  path: readonly string[],
): asserts values is readonly string[] {
  if (!Array.isArray(values) || !values.length) {
    throw new UrlKitError(
      'invalid-descriptor',
      'Enum static search values must be a non-empty array.',
      {
        path,
      },
    );
  }

  for (const value of values) {
    if (typeof value !== 'string') {
      throw new UrlKitError('invalid-descriptor', 'Enum static search values must be strings.', {
        path,
      });
    }
  }
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}
