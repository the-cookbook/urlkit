import { UrlKitError } from '../errors/url-kit-error.js';
import type {
  StaticDirectSearchField,
  StaticSearchField,
  StaticSearchFieldObject,
  StaticResolvedSearchValue,
} from './contracts.js';

export function isStaticSearchFieldObject(
  field: StaticSearchField,
): field is StaticSearchFieldObject {
  if (!isRecord(field)) {
    return false;
  }

  return (
    'value' in field ||
    field.type === 'one' ||
    field.type === 'many' ||
    (!('type' in field) && ('optional' in field || 'default' in field))
  );
}

export function isStaticDirectSearchField(
  field: StaticSearchField,
): field is StaticDirectSearchField {
  return isRecord(field) && isStaticDirectSearchFieldType(field.type);
}

export function normalizeStaticSearchFieldValue(
  field: StaticSearchField,
): StaticResolvedSearchValue {
  if (isStaticSearchFieldObject(field)) {
    return field.value ?? 'string';
  }

  return field;
}

export function hasStaticSearchFieldDefault(field: StaticSearchField): boolean {
  return isRecord(field) && Object.prototype.hasOwnProperty.call(field, 'default');
}

export function getStaticSearchFieldDefault(field: StaticSearchField): unknown {
  return isRecord(field) ? field.default : undefined;
}

export function isStaticSearchFieldOptional(field: StaticSearchField): boolean {
  return isRecord(field) && field.optional === true;
}

export function normalizeStaticSearchFieldType(
  input: unknown,
  path: readonly string[],
): 'one' | 'many' {
  if (input === undefined || input === 'one') {
    return 'one';
  }

  if (input === 'many') {
    return 'many';
  }

  throw new UrlKitError('invalid-descriptor', 'Static search field type must be "one" or "many".', {
    path,
  });
}

function isStaticDirectSearchFieldType(input: unknown): boolean {
  return input === 'date' || input === 'date-time' || input === 'enum';
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}
