import { parseDate } from '../date/parse-date.js';
import { parseDateTime } from '../date/parse-date-time.js';
import { parseUnixMs } from '../date/parse-unix-ms.js';
import { parseUnixSeconds } from '../date/parse-unix-seconds.js';
import { UrlKitError } from '../errors/url-kit-error.js';
import type { StaticDateFormat, StaticSearchValue } from './contracts.js';

export function normalizeStaticSearchDefault(
  fieldType: 'one' | 'many',
  valueDescriptor: StaticSearchValue,
  defaultValue: unknown,
  path: readonly string[],
): unknown {
  if (fieldType === 'many') {
    if (!Array.isArray(defaultValue)) {
      throw new UrlKitError('invalid-descriptor', 'Many static search default must be an array.', {
        path,
      });
    }

    return Object.freeze(
      defaultValue.map((item) => normalizeSingleStaticSearchDefault(valueDescriptor, item, path)),
    );
  }

  return normalizeSingleStaticSearchDefault(valueDescriptor, defaultValue, path);
}

function normalizeSingleStaticSearchDefault(
  valueDescriptor: StaticSearchValue,
  defaultValue: unknown,
  path: readonly string[],
): unknown {
  const kind = resolveStaticSearchValueKind(valueDescriptor, path);

  if (kind === 'string') {
    if (typeof defaultValue === 'string') {
      return defaultValue;
    }

    throw new UrlKitError('invalid-descriptor', 'String static search default must be a string.', {
      path,
    });
  }

  if (kind === 'number') {
    if (typeof defaultValue === 'number' && Number.isFinite(defaultValue)) {
      return defaultValue;
    }

    throw new UrlKitError(
      'invalid-descriptor',
      'Number static search default must be a finite number.',
      { path },
    );
  }

  if (kind === 'int') {
    if (typeof defaultValue === 'number' && Number.isInteger(defaultValue)) {
      return defaultValue;
    }

    throw new UrlKitError(
      'invalid-descriptor',
      'Integer static search default must be a finite integer.',
      { path },
    );
  }

  if (kind === 'boolean') {
    if (typeof defaultValue === 'boolean') {
      return defaultValue;
    }

    throw new UrlKitError(
      'invalid-descriptor',
      'Boolean static search default must be a boolean.',
      { path },
    );
  }

  if (kind === 'date') {
    return normalizeStaticDateDefault(defaultValue, 'date', path);
  }

  if (kind === 'date-time') {
    return normalizeStaticDateDefault(defaultValue, 'date-time', path);
  }

  if (kind === 'unix-seconds') {
    return normalizeStaticDateDefault(defaultValue, 'unix-seconds', path);
  }

  if (kind === 'unix-ms') {
    return normalizeStaticDateDefault(defaultValue, 'unix-ms', path);
  }

  if (isStaticEnumValue(valueDescriptor)) {
    if (typeof defaultValue === 'string' && valueDescriptor.values.includes(defaultValue)) {
      return defaultValue;
    }

    throw new UrlKitError(
      'invalid-descriptor',
      'Enum static search default must be one of the declared values.',
      { path },
    );
  }

  throw new UrlKitError('invalid-descriptor', 'Static search default descriptor is invalid.', {
    path,
  });
}

function normalizeStaticDateDefault(
  defaultValue: unknown,
  format: StaticDateFormat,
  path: readonly string[],
): Date {
  if (format === 'unix-seconds') {
    if (typeof defaultValue !== 'number' || !Number.isInteger(defaultValue)) {
      throw new UrlKitError(
        'invalid-descriptor',
        'Unix seconds static search default must be a finite integer.',
        { path },
      );
    }

    return parseUnixSeconds(String(defaultValue), { code: 'invalid-descriptor', path });
  }

  if (format === 'unix-ms') {
    if (typeof defaultValue !== 'number' || !Number.isInteger(defaultValue)) {
      throw new UrlKitError(
        'invalid-descriptor',
        'Unix milliseconds static search default must be a finite integer.',
        { path },
      );
    }

    return parseUnixMs(String(defaultValue), { code: 'invalid-descriptor', path });
  }

  if (typeof defaultValue !== 'string') {
    throw new UrlKitError(
      'invalid-descriptor',
      'Static date search default must be a serialized string.',
      { path },
    );
  }

  if (format === 'date-time') {
    return parseDateTime(defaultValue, { code: 'invalid-descriptor', path });
  }

  return parseDate(defaultValue, { code: 'invalid-descriptor', path });
}

function resolveStaticSearchValueKind(
  value: StaticSearchValue,
  path: readonly string[],
): StaticDateFormat | 'string' | 'number' | 'int' | 'boolean' | 'enum' {
  if (typeof value === 'string') {
    if (
      value === 'string' ||
      value === 'number' ||
      value === 'int' ||
      value === 'boolean' ||
      value === 'date' ||
      value === 'date-time' ||
      value === 'unix-seconds' ||
      value === 'unix-ms'
    ) {
      return value;
    }

    throw new UrlKitError('invalid-descriptor', 'Static search value shorthand is invalid.', {
      path,
    });
  }

  if (isStaticDateValue(value)) {
    return value.format ?? 'date';
  }

  if (isStaticEnumValue(value)) {
    return 'enum';
  }

  throw new UrlKitError('invalid-descriptor', 'Static search value descriptor is invalid.', {
    path,
  });
}

function isStaticDateValue(
  input: unknown,
): input is { readonly type: 'date'; readonly format?: StaticDateFormat } {
  return isRecord(input) && input.type === 'date';
}

function isStaticEnumValue(
  input: unknown,
): input is { readonly type: 'enum'; readonly values: readonly string[] } {
  return isRecord(input) && input.type === 'enum' && Array.isArray(input.values);
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}
