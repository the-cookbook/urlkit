import { parseDateFormatString } from '../date/date-format-string.js';
import { parseDate } from '../date/parse-date.js';
import { parseDateTime } from '../date/parse-date-time.js';
import { parseUnixMs } from '../date/parse-unix-ms.js';
import { parseUnixSeconds } from '../date/parse-unix-seconds.js';
import { UrlKitError } from '../errors/url-kit-error.js';
import type {
  BuiltInStaticDateFormat,
  StaticDateFormat,
  StaticDateTimeFormat,
  StaticSearchField,
} from './contracts.js';

export function normalizeStaticSearchDefault(
  fieldType: 'one' | 'many',
  valueDescriptor: StaticSearchField,
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
  valueDescriptor: StaticSearchField,
  defaultValue: unknown,
  path: readonly string[],
): unknown {
  if (valueDescriptor.type === 'string') {
    if (typeof defaultValue === 'string') {
      return defaultValue;
    }

    throw new UrlKitError('invalid-descriptor', 'String static search default must be a string.', {
      path,
    });
  }

  if (valueDescriptor.type === 'number') {
    if (typeof defaultValue === 'number' && Number.isFinite(defaultValue)) {
      return defaultValue;
    }

    throw new UrlKitError(
      'invalid-descriptor',
      'Number static search default must be a finite number.',
      { path },
    );
  }

  if (valueDescriptor.type === 'int') {
    if (typeof defaultValue === 'number' && Number.isInteger(defaultValue)) {
      return defaultValue;
    }

    throw new UrlKitError(
      'invalid-descriptor',
      'Integer static search default must be a finite integer.',
      { path },
    );
  }

  if (valueDescriptor.type === 'boolean') {
    if (typeof defaultValue === 'boolean') {
      return defaultValue;
    }

    throw new UrlKitError(
      'invalid-descriptor',
      'Boolean static search default must be a boolean.',
      { path },
    );
  }

  if (isStaticDateValue(valueDescriptor)) {
    return normalizeStaticDateDefault(defaultValue, valueDescriptor.format ?? 'date', path);
  }

  if (isStaticDateTimeValue(valueDescriptor)) {
    return normalizeStaticDateTimeDefault(
      defaultValue,
      valueDescriptor.format ?? 'date-time',
      path,
    );
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

  if (format === 'date') {
    return parseDate(defaultValue, { code: 'invalid-descriptor', path });
  }

  return parseDateFormatString(defaultValue, format, 'date', { code: 'invalid-descriptor', path });
}

function normalizeStaticDateTimeDefault(
  defaultValue: unknown,
  format: StaticDateTimeFormat,
  path: readonly string[],
): Date {
  if (typeof defaultValue !== 'string') {
    throw new UrlKitError(
      'invalid-descriptor',
      'Static date-time search default must be a serialized string.',
      { path },
    );
  }

  if (format === 'date-time') {
    return parseDateTime(defaultValue, { code: 'invalid-descriptor', path });
  }

  if (isBuiltInStaticDateFormat(format)) {
    throw new UrlKitError(
      'invalid-descriptor',
      'Static date-time search format must be "date-time" or a supported date-time format string.',
      { path },
    );
  }

  return parseDateFormatString(defaultValue, format, 'date-time', {
    code: 'invalid-descriptor',
    path,
  });
}

function isStaticDateValue(
  input: unknown,
): input is { readonly type: 'date'; readonly format?: StaticDateFormat } {
  return isRecord(input) && input.type === 'date';
}

function isStaticDateTimeValue(
  input: unknown,
): input is { readonly type: 'date-time'; readonly format?: StaticDateTimeFormat } {
  return isRecord(input) && input.type === 'date-time';
}

function isBuiltInStaticDateFormat(input: StaticDateTimeFormat): input is BuiltInStaticDateFormat {
  return (
    input === 'date' || input === 'date-time' || input === 'unix-seconds' || input === 'unix-ms'
  );
}

function isStaticEnumValue(
  input: unknown,
): input is { readonly type: 'enum'; readonly values: readonly string[] } {
  return isRecord(input) && input.type === 'enum' && Array.isArray(input.values);
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}
