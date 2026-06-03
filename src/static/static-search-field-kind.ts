import { UrlKitError } from '../errors/url-kit-error.js';
import type { StaticSearchField, StaticSearchFieldObject, StaticSearchValue } from './contracts.js';

export function isStaticSearchFieldObject(
  field: StaticSearchField,
): field is StaticSearchFieldObject {
  if (!isRecord(field)) {
    return false;
  }

  return (
    'value' in field ||
    'optional' in field ||
    'default' in field ||
    field.type === 'one' ||
    field.type === 'many'
  );
}

export function normalizeStaticSearchFieldValue(field: StaticSearchField): StaticSearchValue {
  if (isStaticSearchFieldObject(field)) {
    return field.value ?? 'string';
  }

  return field;
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

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}
